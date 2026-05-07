import os
from cryptography.fernet import Fernet

def get_fernet():
    key = os.environ.get("FERNET_KEY")
    if not key:
        raise RuntimeError("FERNET_KEY not set in environment")
    return Fernet(key.encode())

def encrypt(plaintext: str) -> str:
    return get_fernet().encrypt(plaintext.encode()).decode()

def decrypt(ciphertext: str) -> str:
    return get_fernet().decrypt(ciphertext.encode()).decode()
