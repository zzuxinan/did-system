import os
import json
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
import base64
import hashlib
import secrets

class CryptoUtils:
    @staticmethod
    def generate_key_pair():
        """生成 ECC 密钥对"""
        private_key = ec.generate_private_key(
            ec.SECP256K1(),
            default_backend()
        )
        public_key = private_key.public_key()
        
        # 序列化密钥
        private_pem = private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption()
        )
        public_pem = public_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        )
        
        return private_pem.decode(), public_pem.decode()

    @staticmethod
    def derive_key(password: str, salt: bytes = None):
        """使用 PBKDF2 从密码派生密钥"""
        if salt is None:
            salt = os.urandom(16)
        
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=100000,
            backend=default_backend()
        )
        
        key = kdf.derive(password.encode())
        return key, salt

    @staticmethod
    def encrypt_private_key(private_key: str, password: str):
        """加密私钥"""
        key, salt = CryptoUtils.derive_key(password)
        iv = os.urandom(16)
        
        cipher = Cipher(
            algorithms.AES(key),
            modes.GCM(iv),
            backend=default_backend()
        )
        encryptor = cipher.encryptor()
        
        # 加密私钥
        ciphertext = encryptor.update(private_key.encode()) + encryptor.finalize()
        
        # 组合加密结果
        encrypted_data = {
            'ciphertext': base64.b64encode(ciphertext).decode(),
            'iv': base64.b64encode(iv).decode(),
            'salt': base64.b64encode(salt).decode(),
            'tag': base64.b64encode(encryptor.tag).decode()
        }
        
        return json.dumps(encrypted_data)

    @staticmethod
    def decrypt_private_key(encrypted_data: str, password: str):
        """解密私钥"""
        data = json.loads(encrypted_data)
        key, _ = CryptoUtils.derive_key(
            password,
            base64.b64decode(data['salt'])
        )
        
        cipher = Cipher(
            algorithms.AES(key),
            modes.GCM(
                base64.b64decode(data['iv']),
                base64.b64decode(data['tag'])
            ),
            backend=default_backend()
        )
        decryptor = cipher.decryptor()
        
        private_key = decryptor.update(
            base64.b64decode(data['ciphertext'])
        ) + decryptor.finalize()
        
        return private_key.decode()

    @staticmethod
    def sign_message(private_key: str, message: str):
        """使用私钥签名消息"""
        private_key = serialization.load_pem_private_key(
            private_key.encode(),
            password=None,
            backend=default_backend()
        )
        
        signature = private_key.sign(
            message.encode(),
            ec.ECDSA(hashes.SHA256())
        )
        
        return base64.b64encode(signature).decode()

    @staticmethod
    def verify_signature(public_key: str, message: str, signature: str):
        """验证签名"""
        public_key = serialization.load_pem_public_key(
            public_key.encode(),
            backend=default_backend()
        )
        
        try:
            public_key.verify(
                base64.b64decode(signature),
                message.encode(),
                ec.ECDSA(hashes.SHA256())
            )
            return True
        except Exception:
            return False

    @staticmethod
    def generate_challenge() -> str:
        """生成随机 challenge"""
        return secrets.token_hex(32)
    
    @staticmethod
    def hash_password(password: str) -> str:
        """使用 SHA-256 哈希密码"""
        return hashlib.sha256(password.encode()).hexdigest()
    
    @staticmethod
    def verify_password(password: str, hashed_password: str) -> bool:
        """验证密码"""
        return CryptoUtils.hash_password(password) == hashed_password 