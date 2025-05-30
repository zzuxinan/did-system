import hashlib
import hmac
import base64
from cryptography.fernet import Fernet
from datetime import datetime
import os

def generate_signature(data: str) -> str:
    """生成数据的签名"""
    key = os.getenv('SIGNATURE_KEY', 'your-secret-key').encode()
    h = hmac.new(key, data.encode(), hashlib.sha256)
    return base64.b64encode(h.digest()).decode()

def verify_signature(data: str, signature: str) -> bool:
    """验证数据的签名"""
    expected_signature = generate_signature(data)
    return hmac.compare_digest(signature, expected_signature)

def get_encryption_key() -> bytes:
    """获取或生成加密密钥"""
    key = os.getenv('ENCRYPTION_KEY')
    if not key:
        key = Fernet.generate_key()
        os.environ['ENCRYPTION_KEY'] = key.decode()
    return key if isinstance(key, bytes) else key.encode()

def encrypt_data(data: str) -> str:
    """加密数据"""
    f = Fernet(get_encryption_key())
    return f.encrypt(data.encode()).decode()

def decrypt_data(encrypted_data: str) -> str:
    """解密数据"""
    f = Fernet(get_encryption_key())
    return f.decrypt(encrypted_data.encode()).decode()

def format_timestamp(timestamp: datetime) -> str:
    """格式化时间戳为北京时间"""
    return timestamp.strftime('%Y-%m-%d %H:%M:%S') 