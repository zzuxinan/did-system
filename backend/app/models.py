from datetime import datetime
from . import db

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    wallet_address = db.Column(db.String(42), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    last_login = db.Column(db.DateTime)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'wallet_address': self.wallet_address,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'is_active': self.is_active,
            'last_login': self.last_login.isoformat() if self.last_login else None
        }

class UserLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    action = db.Column(db.String(50), nullable=False)  # 操作类型：login, update_profile, change_password 等
    status = db.Column(db.String(20), nullable=False)  # 状态：success, failed
    details = db.Column(db.Text)  # 详细信息
    ip_address = db.Column(db.String(50))  # IP地址
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', backref=db.backref('logs', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'action': self.action,
            'status': self.status,
            'details': self.details,
            'ip_address': self.ip_address,
            'created_at': self.created_at.isoformat()
        }

class DataFile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    filename = db.Column(db.String(256), nullable=False)
    hash = db.Column(db.String(66), unique=True, nullable=False)  # 0x开头的哈希
    encrypted_path = db.Column(db.String(512), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', backref=db.backref('data_files', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'filename': self.filename,
            'hash': self.hash,
            'encrypted_path': self.encrypted_path,
            'created_at': self.created_at.isoformat()
        }

class DataAuthorization(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    data_type = db.Column(db.String(50), nullable=False)  # identity, profile, credentials
    authorized_address = db.Column(db.String(42), nullable=False)  # 授权对象的区块链地址
    status = db.Column(db.String(20), default='active')  # active, revoked
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    revoked_at = db.Column(db.DateTime)
    expires_at = db.Column(db.DateTime)  # 授权过期时间

    user = db.relationship('User', backref=db.backref('authorizations', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'data_type': self.data_type,
            'authorized_address': self.authorized_address,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'revoked_at': self.revoked_at.isoformat() if self.revoked_at else None,
            'expires_at': self.expires_at.isoformat() if self.expires_at else None
        }

class Declaration(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    signature = db.Column(db.String(66), nullable=False)  # 0x开头的签名
    qr_code_path = db.Column(db.String(512))  # 二维码图片路径
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    expires_at = db.Column(db.DateTime)  # 可选：声明过期时间

    user = db.relationship('User', backref=db.backref('declarations', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'content': self.content,
            'signature': self.signature,
            'qr_code_path': self.qr_code_path,
            'created_at': self.created_at.isoformat(),
            'expires_at': self.expires_at.isoformat() if self.expires_at else None
        }

class AuthorizationLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    authorization_id = db.Column(db.Integer, db.ForeignKey('data_authorization.id'), nullable=False)
    action = db.Column(db.String(50), nullable=False)  # created, revoked
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    authorization = db.relationship('DataAuthorization', backref=db.backref('logs', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'authorization_id': self.authorization_id,
            'action': self.action,
            'created_at': self.created_at.isoformat()
        }

class UserData(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    data_type = db.Column(db.String(50), nullable=False)
    data_content = db.Column(db.Text, nullable=False)
    signature = db.Column(db.String(256), nullable=True)
    filename = db.Column(db.String(256), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = db.relationship('User', backref=db.backref('user_data', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'data_type': self.data_type,
            'data_content': self.data_content,
            'signature': self.signature,
            'filename': self.filename,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class OperationLog(db.Model):
    __tablename__ = 'operation_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    operation_type = db.Column(db.String(50), nullable=False)  # upload, decrypt 等
    operation_details = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    user = db.relationship('User', backref=db.backref('operation_logs', lazy=True))
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'operation_type': self.operation_type,
            'operation_details': self.operation_details,
            'created_at': self.created_at.isoformat()
        } 