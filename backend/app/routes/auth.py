from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from app.models.user import User
from app.utils.crypto import CryptoUtils
from app.middleware.rate_limit import rate_limit
from app import db
import jwt
from datetime import datetime, timedelta
import os
import redis
from web3 import Web3
from eth_account.messages import encode_defunct

# 初始化 Redis 客户端
redis_client = redis.Redis(host='localhost', port=6379, db=0)

auth_bp = Blueprint('auth', __name__)

def validate_email(email: str) -> bool:
    """验证邮箱格式"""
    import re
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))

def validate_password(password: str) -> bool:
    """验证密码强度"""
    return len(password) >= 8

def validate_wallet_address(address: str) -> bool:
    """验证钱包地址格式"""
    return Web3.is_address(address)

@auth_bp.route('/register', methods=['POST'])
@rate_limit(limit=5, period=300)  # 5分钟内最多5次注册请求
def register():
    data = request.get_json()
    
    # 验证必要字段
    if not all(k in data for k in ['email', 'password', 'wallet_address']):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # 验证邮箱格式
    if not validate_email(data['email']):
        return jsonify({'error': 'Invalid email format'}), 400
    
    # 验证密码强度
    if not validate_password(data['password']):
        return jsonify({'error': 'Password must be at least 8 characters long'}), 400
    
    # 验证钱包地址
    if not validate_wallet_address(data['wallet_address']):
        return jsonify({'error': 'Invalid wallet address'}), 400
    
    # 检查邮箱是否已注册
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 400
    
    # 检查钱包地址是否已绑定
    if User.query.filter_by(wallet_address=data['wallet_address']).first():
        return jsonify({'error': 'Wallet address already bound'}), 400
    
    # 创建新用户
    user = User(
        email=data['email'],
        password=generate_password_hash(data['password']),
        wallet_address=data['wallet_address']
    )
    
    try:
        db.session.add(user)
        db.session.commit()
        
        # 生成 JWT token
        token = jwt.encode(
            {
                'user_id': user.id,
                'exp': datetime.utcnow() + timedelta(days=1)
            },
            os.getenv('SECRET_KEY', 'your-secret-key'),
            algorithm='HS256'
        )
        
        return jsonify({
            'message': 'Registration successful',
            'token': token
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
@rate_limit(limit=10, period=300)  # 5分钟内最多10次登录请求
def login():
    data = request.get_json()
    
    # 验证必要字段
    if not all(k in data for k in ['email', 'password']):
        return jsonify({'error': 'Missing required fields'}), 400
    
    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not check_password_hash(user.password, data['password']):
        return jsonify({'error': 'Invalid email or password'}), 401
    
    # 生成 challenge
    challenge = CryptoUtils.generate_challenge()
    
    # 存储 challenge 到 Redis，设置 5 分钟过期
    redis_client.setex(
        f'challenge:{user.id}',
        300,  # 5分钟
        challenge
    )
    
    return jsonify({
        'message': 'Login successful',
        'challenge': challenge
    }), 200

@auth_bp.route('/verify-signature', methods=['POST'])
@rate_limit(limit=10, period=300)  # 5分钟内最多10次签名验证请求
def verify_signature():
    data = request.get_json()
    
    # 验证必要字段
    if not all(k in data for k in ['email', 'password', 'challenge', 'signature', 'wallet_address']):
        return jsonify({'error': 'Missing required fields'}), 400
    
    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not check_password_hash(user.password, data['password']):
        return jsonify({'error': 'Invalid email or password'}), 401
    
    # 验证钱包地址
    if user.wallet_address != data['wallet_address']:
        return jsonify({'error': 'Wallet address mismatch'}), 401
    
    # 从 Redis 获取 challenge
    stored_challenge = redis_client.get(f'challenge:{user.id}')
    if not stored_challenge:
        return jsonify({'error': 'Challenge expired or not found'}), 400
    
    stored_challenge = stored_challenge.decode('utf-8')
    
    # 验证 challenge 是否匹配
    if stored_challenge != data['challenge']:
        return jsonify({'error': 'Invalid challenge'}), 400
    
    try:
        # 验证签名
        message = encode_defunct(text=stored_challenge)
        recovered_address = Web3().eth.account.recover_message(message, signature=data['signature'])
        
        if recovered_address.lower() != data['wallet_address'].lower():
            return jsonify({'error': 'Invalid signature'}), 401
        
        # 删除已使用的 challenge
        redis_client.delete(f'challenge:{user.id}')
        
        # 生成 JWT token
        token = jwt.encode(
            {
                'user_id': user.id,
                'exp': datetime.utcnow() + timedelta(days=1)
            },
            os.getenv('SECRET_KEY', 'your-secret-key'),
            algorithm='HS256'
        )
        
        return jsonify({
            'message': 'Signature verification successful',
            'token': token
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/bind-wallet', methods=['POST'])
@rate_limit(limit=5, period=300)  # 5分钟内最多5次钱包绑定请求
def bind_wallet():
    data = request.get_json()
    
    # 验证必要字段
    if not all(k in data for k in ['email', 'password', 'wallet_address']):
        return jsonify({'error': 'Missing required fields'}), 400
    
    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not check_password_hash(user.password, data['password']):
        return jsonify({'error': 'Invalid email or password'}), 401
    
    # 验证钱包地址
    if not validate_wallet_address(data['wallet_address']):
        return jsonify({'error': 'Invalid wallet address'}), 400
    
    # 检查钱包地址是否已被其他用户绑定
    existing_user = User.query.filter_by(wallet_address=data['wallet_address']).first()
    if existing_user and existing_user.id != user.id:
        return jsonify({'error': 'Wallet address already bound to another account'}), 400
    
    try:
        # 更新用户钱包地址
        user.wallet_address = data['wallet_address']
        db.session.commit()
        
        return jsonify({
            'message': 'Wallet binding successful'
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500 