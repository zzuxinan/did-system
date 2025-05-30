from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from datetime import datetime, timedelta
import jwt
import redis
from functools import wraps
import json
from web3 import Web3
from eth_account.messages import encode_defunct
import hashlib

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///did.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'your-secret-key'  # 在生产环境中使用环境变量

db = SQLAlchemy(app)
migrate = Migrate(app, db)

# Redis 配置
redis_client = redis.Redis(host='localhost', port=6379, db=0)

# 用户模型
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    wallet_address = db.Column(db.String(42), unique=True, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_wallet_bound = db.Column(db.Boolean, default=False)  # 新增字段，标记是否已绑定钱包

# 数据授权模型
class DataAuthorization(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    owner_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    authorized_wallet = db.Column(db.String(42), nullable=False)
    data_type = db.Column(db.String(50), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    expires_at = db.Column(db.DateTime, nullable=True)

# 数据模型
class Data(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    data_type = db.Column(db.String(50), nullable=False)
    data_content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# 验证 token 的装饰器
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': '缺少认证令牌'}), 401
        
        try:
            token = token.split(' ')[1]  # 移除 'Bearer ' 前缀
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user = User.query.get(data['user_id'])
            if not current_user:
                return jsonify({'error': '用户不存在'}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({'error': '令牌已过期'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': '无效的令牌'}), 401
        
        return f(current_user, *args, **kwargs)
    return decorated

# 验证钱包绑定的装饰器
def wallet_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': '缺少认证令牌'}), 401
        
        try:
            token = token.split(' ')[1]
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user = User.query.get(data['user_id'])
            if not current_user:
                return jsonify({'error': '用户不存在'}), 401
            if not current_user.is_wallet_bound:
                return jsonify({'error': '请先绑定钱包'}), 403
        except jwt.ExpiredSignatureError:
            return jsonify({'error': '令牌已过期'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': '无效的令牌'}), 401
        
        return f(current_user, *args, **kwargs)
    return decorated

# 验证钱包签名的装饰器
def verify_wallet_signature(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        signature = request.headers.get('X-Wallet-Signature')
        message = request.headers.get('X-Message')
        wallet_address = request.headers.get('X-Wallet-Address')
        
        if not all([signature, message, wallet_address]):
            return jsonify({'error': '缺少钱包签名信息'}), 401
        
        try:
            # 验证签名
            w3 = Web3()
            message_hash = encode_defunct(text=message)
            recovered_address = w3.eth.account.recover_message(message_hash, signature=signature)
            
            if recovered_address.lower() != wallet_address.lower():
                return jsonify({'error': '钱包签名验证失败'}), 401
                
        except Exception as e:
            return jsonify({'error': f'签名验证失败: {str(e)}'}), 401
        
        return f(*args, **kwargs)
    return decorated

# 检查请求频率限制的装饰器
def rate_limit(limit=60, period=60):
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            ip = request.remote_addr
            key = f'rate_limit:{ip}'
            
            # 获取当前请求次数
            current = redis_client.get(key)
            if current and int(current) >= limit:
                return jsonify({'error': '请求过于频繁，请稍后再试'}), 429
            
            # 增加请求次数
            pipe = redis_client.pipeline()
            pipe.incr(key)
            pipe.expire(key, period)
            pipe.execute()
            
            return f(*args, **kwargs)
        return decorated
    return decorator

@app.route('/api/register', methods=['POST'])
@rate_limit()
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    if not all([email, password]):
        return jsonify({'error': '缺少必要参数'}), 400
    
    # 检查邮箱是否已注册
    if User.query.filter_by(email=email).first():
        return jsonify({'error': '邮箱已被注册'}), 400
    
    # 创建新用户
    hashed_password = hashlib.sha256(password.encode()).hexdigest()
    new_user = User(
        email=email,
        password=hashed_password,
        is_wallet_bound=False
    )
    
    db.session.add(new_user)
    db.session.commit()
    
    # 生成 token
    token = jwt.encode(
        {
            'user_id': new_user.id,
            'exp': datetime.utcnow() + timedelta(days=1)
        },
        app.config['SECRET_KEY'],
        algorithm='HS256'
    )
    
    return jsonify({
        'message': '注册成功',
        'token': token,
        'user': {
            'id': new_user.id,
            'email': new_user.email,
            'is_wallet_bound': new_user.is_wallet_bound
        }
    })

@app.route('/api/login', methods=['POST'])
@rate_limit()
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    if not all([email, password]):
        return jsonify({'error': '缺少必要参数'}), 400
    
    # 查找用户
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'error': '用户不存在'}), 404
    
    # 验证密码
    hashed_password = hashlib.sha256(password.encode()).hexdigest()
    if user.password != hashed_password:
        return jsonify({'error': '密码错误'}), 401
    
    # 生成 token
    token = jwt.encode(
        {
            'user_id': user.id,
            'exp': datetime.utcnow() + timedelta(days=1)
        },
        app.config['SECRET_KEY'],
        algorithm='HS256'
    )
    
    return jsonify({
        'message': '登录成功',
        'token': token,
        'user': {
            'id': user.id,
            'email': user.email,
            'is_wallet_bound': user.is_wallet_bound,
            'wallet_address': user.wallet_address
        }
    })

@app.route('/api/bind-wallet', methods=['POST'])
@token_required
@rate_limit()
def bind_wallet(current_user):
    if current_user.is_wallet_bound:
        return jsonify({'error': '已绑定钱包'}), 400
    
    data = request.get_json()
    wallet_address = data.get('wallet_address')
    signature = data.get('signature')
    message = data.get('message')
    
    if not all([wallet_address, signature, message]):
        return jsonify({'error': '缺少必要参数'}), 400
    
    # 检查钱包地址是否已被绑定
    if User.query.filter_by(wallet_address=wallet_address).first():
        return jsonify({'error': '钱包地址已被绑定'}), 400
    
    try:
        # 验证签名
        w3 = Web3()
        message_hash = encode_defunct(text=message)
        recovered_address = w3.eth.account.recover_message(message_hash, signature=signature)
        
        if recovered_address.lower() != wallet_address.lower():
            return jsonify({'error': '钱包签名验证失败'}), 401
        
        # 绑定钱包
        current_user.wallet_address = wallet_address
        current_user.is_wallet_bound = True
        db.session.commit()
        
        return jsonify({
            'message': '钱包绑定成功',
            'user': {
                'id': current_user.id,
                'email': current_user.email,
                'is_wallet_bound': current_user.is_wallet_bound,
                'wallet_address': current_user.wallet_address
            }
        })
        
    except Exception as e:
        return jsonify({'error': f'钱包绑定失败: {str(e)}'}), 400

@app.route('/api/authorized-data/<data_type>', methods=['GET'])
@token_required
@wallet_required
@verify_wallet_signature
@rate_limit()
def get_authorized_data(current_user, data_type):
    wallet_address = request.headers.get('X-Wallet-Address')
    
    # 验证请求的钱包地址是否与绑定的钱包地址一致
    if wallet_address.lower() != current_user.wallet_address.lower():
        return jsonify({'error': '请使用绑定的钱包地址'}), 403
    
    # 检查授权
    authorization = DataAuthorization.query.filter_by(
        owner_id=current_user.id,
        authorized_wallet=wallet_address,
        data_type=data_type
    ).first()
    
    if not authorization:
        return jsonify({'error': '未获得数据访问授权'}), 403
    
    # 检查授权是否过期
    if authorization.expires_at and authorization.expires_at < datetime.utcnow():
        return jsonify({'error': '数据访问授权已过期'}), 403
    
    # 获取数据
    data = Data.query.filter_by(
        user_id=current_user.id,
        data_type=data_type
    ).first()
    
    if not data:
        return jsonify({'error': '数据不存在'}), 404
    
    return jsonify({
        'data': {
            'data_type': data.data_type,
            'data_content': json.loads(data.data_content),
            'created_at': data.created_at.isoformat(),
            'updated_at': data.updated_at.isoformat()
        }
    })

@app.route('/api/authorize', methods=['POST'])
@token_required
@wallet_required
@rate_limit()
def authorize_data(current_user):
    data = request.get_json()
    authorized_wallet = data.get('authorized_wallet')
    data_type = data.get('data_type')
    expires_in = data.get('expires_in', 30)  # 默认30天
    
    if not all([authorized_wallet, data_type]):
        return jsonify({'error': '缺少必要参数'}), 400
    
    # 检查是否已经授权
    existing_auth = DataAuthorization.query.filter_by(
        owner_id=current_user.id,
        authorized_wallet=authorized_wallet,
        data_type=data_type
    ).first()
    
    if existing_auth:
        # 更新过期时间
        existing_auth.expires_at = datetime.utcnow() + timedelta(days=expires_in)
        db.session.commit()
        return jsonify({'message': '授权已更新'})
    
    # 创建新授权
    new_auth = DataAuthorization(
        owner_id=current_user.id,
        authorized_wallet=authorized_wallet,
        data_type=data_type,
        expires_at=datetime.utcnow() + timedelta(days=expires_in)
    )
    
    db.session.add(new_auth)
    db.session.commit()
    
    return jsonify({'message': '授权成功'})

@app.route('/api/authorizations', methods=['GET'])
@token_required
@wallet_required
@rate_limit()
def get_authorizations(current_user):
    authorizations = DataAuthorization.query.filter_by(owner_id=current_user.id).all()
    
    return jsonify({
        'authorizations': [{
            'id': auth.id,
            'authorized_wallet': auth.authorized_wallet,
            'data_type': auth.data_type,
            'created_at': auth.created_at.isoformat(),
            'expires_at': auth.expires_at.isoformat() if auth.expires_at else None
        } for auth in authorizations]
    })

@app.route('/api/authorizations/<int:auth_id>', methods=['DELETE'])
@token_required
@wallet_required
@rate_limit()
def revoke_authorization(current_user, auth_id):
    authorization = DataAuthorization.query.filter_by(
        id=auth_id,
        owner_id=current_user.id
    ).first()
    
    if not authorization:
        return jsonify({'error': '授权不存在'}), 404
    
    db.session.delete(authorization)
    db.session.commit()
    
    return jsonify({'message': '授权已撤销'})

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5050) 