import os
import json
import uuid
from pathlib import Path
from dotenv import load_dotenv

# --- LangChain imports ---------------------------------------------------
from langchain_google_genai import ChatGoogleGenerativeAI          # Gemini
from langchain_tavily import TavilySearch                          # Search tool
from langchain.memory import ConversationBufferMemory
from langchain.agents import create_openai_tools_agent, AgentExecutor
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.schema import HumanMessage, AIMessage

# --- FastAPI imports -----------------------------------------------------
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware  # Add this import
from pydantic import BaseModel

# --- Utilities -----------------------------------------------------------
load_dotenv()  # GOOGLE_API_KEY & TAVILY_API_KEY

SESSIONS_DIR = Path("./sessions")
SESSIONS_DIR.mkdir(exist_ok=True)
MAX_TURNS = 10           # number of user<->assistant turns to keep
MAX_MESSAGES = MAX_TURNS * 2  # messages == turns * 2 (user + assistant)

# 1️⃣ Gemini model (tool-use ready) ---------------------------------------
MODEL_ID = os.getenv("MODEL_ID", "gemini-2.5-pro")      # or "gemini-1.5-flash-latest"
llm = ChatGoogleGenerativeAI(
    model=MODEL_ID,
    temperature=0.7,
    convert_system_message_to_instructions=True  # Gemini best-practice
)

# 2️⃣ Define Tavily tool --------------------------------------------------
search_tool = TavilySearch(max_results=5)   # schema: {"query": str}
tools = [search_tool]

# 3️⃣ Bind tool schema to the model --------------------------------------
llm = llm.bind_tools(tools)                 # <-- absolutely required

# 4️⃣ Prompt --------------------------------------------------------------
SYSTEM = (
    "You are SportMate, a helpful football assistant.\n"
    "Whenever the user asks for live, recent or latest scores or news , "
    "call the `tavily_search` tool with **one** argument: `query`.\n"
    "After the JSON returns, summarise the result in a sentence.\n"
    "For all other questions, answer normally and remember preferences."
)

prompt = ChatPromptTemplate.from_messages([
    ("system", SYSTEM),
    MessagesPlaceholder("chat_history", optional=True),
    ("user", "{input}"),
    MessagesPlaceholder("agent_scratchpad"),
])

# ---------- Session persistence helpers ---------------------------------

def _session_path(session_id: str) -> Path:
    return SESSIONS_DIR / f"{session_id}.json"


def create_empty_memory() -> ConversationBufferMemory:
    return ConversationBufferMemory(memory_key="chat_history", return_messages=True)


def load_memory_for_session(session_id: str) -> ConversationBufferMemory:
    """Load the session file (if exists) and return a ConversationBufferMemory
    populated with the last MAX_MESSAGES messages (user + assistant)."""
    mem = create_empty_memory()
    path = _session_path(session_id)
    if not path.exists():
        return mem

    try:
        with path.open("r", encoding="utf-8") as f:
            data = json.load(f)
            messages = data.get("messages", [])[-MAX_MESSAGES:]
            # messages is a list of {"role": "user"/"assistant", "text": "..."}
            for m in messages:
                role = m.get("role")
                text = m.get("text", "")
                if role == "user":
                    mem.chat_memory.add_user_message(text)
                elif role == "assistant":
                    mem.chat_memory.add_ai_message(text)
    except Exception as e:
        # If something goes wrong, return empty memory (safe fallback)
        print(f"Failed to load session {session_id}: {e}")
        return create_empty_memory()

    return mem


def save_memory_for_session(session_id: str, memory: ConversationBufferMemory):
    """Save the last MAX_MESSAGES messages from the ConversationBufferMemory to disk."""
    path = _session_path(session_id)
    messages_out = []
    try:
        # memory.chat_memory.messages is a list of BaseMessage objects
        for msg in memory.chat_memory.messages[-MAX_MESSAGES:]:
            if isinstance(msg, HumanMessage):
                messages_out.append({"role": "user", "text": msg.content})
            elif isinstance(msg, AIMessage):
                messages_out.append({"role": "assistant", "text": msg.content})
            else:
                # unknown message type -> store as text
                messages_out.append({"role": getattr(msg, "role", "unknown"), "text": getattr(msg, "content", str(msg))})

        with path.open("w", encoding="utf-8") as f:
            json.dump({"messages": messages_out}, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"Failed to save session {session_id}: {e}")


# 5️⃣ FastAPI Integration -------------------------------------------------
app = FastAPI()

# Add CORS middleware - THIS IS THE FIX!
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Next.js dev server
        "http://127.0.0.1:3000",
        "http://localhost:3001",  # Alternative port
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

class UserMessage(BaseModel):
    message: str
    session_id: str | None = None


@app.post("/chat")
async def chat_with_bot(user_message: UserMessage):
    # Manage session id
    sid = user_message.session_id
    if sid is None:
        # create a new session id
        sid = uuid.uuid4().hex
        memory = create_empty_memory()
    else:
        memory = load_memory_for_session(sid)

    # Build agent with the session-specific memory
    core_agent = create_openai_tools_agent(llm, tools, prompt)
    agent = AgentExecutor(agent=core_agent, tools=tools, memory=memory, verbose=True)

    # Invoke the agent synchronously
    response = agent.invoke({"input": user_message.message})

    # Save session (persist last MAX_TURNS)
    save_memory_for_session(sid, memory)

    # Return response text & the session id so client can reuse it later
    return {"response": response.get("output"), "session_id": sid}


# Optional helper endpoint to explicitly create a new session
@app.post("/session/new")
async def create_session():
    sid = uuid.uuid4().hex
    save_memory_for_session(sid, create_empty_memory())
    return {"session_id": sid}


# Health check endpoint
@app.get("/")
async def root():
    return {"message": "ChatGPT-like API is running!"}


# 6️⃣ Run FastAPI with Uvicorn -------------------------------------------
# To run this FastAPI app, use the following command in terminal:
# uvicorn fastapi_chat_with_sessions:app --reload
# Make sure to replace the module name if you save the file under a different name.

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)