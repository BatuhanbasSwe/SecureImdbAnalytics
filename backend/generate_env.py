import secrets
from cryptography.fernet import Fernet

jwt_secret = secrets.token_hex(32)
fernet_key = Fernet.generate_key().decode()

with open(".env", "w") as f:
    f.write(f"JWT_SECRET={jwt_secret}\n")
    f.write(f"FERNET_KEY={fernet_key}\n")

print(".env created")
print(f"JWT_SECRET={jwt_secret}")
print(f"FERNET_KEY={fernet_key}")
