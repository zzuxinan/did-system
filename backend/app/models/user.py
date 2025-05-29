from datetime import datetime
from app import db

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    public_key = db.Column(db.String(256), nullable=False)  # ECC公钥
    encrypted_private_key = db.Column(db.String(512), nullable=False)  # 加密后的私钥
    wallet_address = db.Column(db.String(42), unique=True, nullable=True)  # MetaMask钱包地址
    wallet_binding_status = db.Column(db.Boolean, default=False)  # 钱包绑定状态
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    last_login = db.Column(db.DateTime, nullable=True)

    def __init__(self, email, password, wallet_address=None):
        self.email = email
        self.password = password
        self.wallet_address = wallet_address

    def __repr__(self):
        return f'<User {self.email}>'

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'wallet_address': self.wallet_address,
            'wallet_binding_status': self.wallet_binding_status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'is_active': self.is_active,
            'last_login': self.last_login.isoformat() if self.last_login else None
        } 