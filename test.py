# test.py
import requests
import os
import time
from dotenv import load_dotenv

load_dotenv()

BASE_URL      = os.getenv("BASE_URL", "http://127.0.0.1:8000")
CHAT_ENDPOINT = f"{BASE_URL}/chat"
TEST_USER_ID  = "testuser"

def send_chat(user_id: str, message: str):
    payload = {"user_id": user_id, "message": message}
    resp = requests.post(CHAT_ENDPOINT, json=payload)
    print(f">>> POST {message!r}")
    print("Status:", resp.status_code)
    data = resp.json()
    print("JSON  :", data)
    if "response" in data:
        print("Reply :", data["response"])
    elif "detail" in data:
        print("Error :", data["detail"])
    else:
        print("Unexpected:", data)
    print()
    return data

def main():
    # 1) Trigger the "set favorite team" intent:
    send_chat(TEST_USER_ID, "My favorite team is Real Madrid")
    # give the server a moment (not strictly necessary for in-memory store)
    time.sleep(0.5)

    # 2) Trigger the "get latest score" intent:
    send_chat(TEST_USER_ID, "Give me the latest score of my favorite team")

if __name__ == "__main__":
    main()
