from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from datetime import datetime, timedelta
from . import db
from .models import User
import os

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        # 验证必要字段
        required_fields = ['name', 'email', 'password', 'wallet_address']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'error': f'缺少必要字段: {field}'
                }), 400

        # 验证邮箱格式
        if not '@' in data['email']:
            return jsonify({
                'error': '邮箱格式不正确'
            }), 400

        # 验证钱包地址格式
        if not data['wallet_address'].startswith('0x') or len(data['wallet_address']) != 42:
            return jsonify({
                'error': '钱包地址格式不正确'
            }), 400

        # 检查邮箱是否已存在
        if User.query.filter_by(email=data['email']).first():
            return jsonify({
                'error': '该邮箱已被注册'
            }), 400

        # 检查钱包地址是否已存在
        if User.query.filter_by(wallet_address=data['wallet_address']).first():
            return jsonify({
                'error': '该钱包地址已被注册'
            }), 400

        # 创建新用户
        new_user = User(
            name=data['name'],
            email=data['email'],
            password_hash=generate_password_hash(data['password'], method='pbkdf2:sha256'),
            wallet_address=data['wallet_address']
        )

        db.session.add(new_user)
        db.session.commit()

        # 生成 JWT token
        token = jwt.encode({
            'user_id': new_user.id,
            'exp': datetime.utcnow() + timedelta(days=1)
        }, os.getenv('SECRET_KEY', 'your-secret-key'))

        return jsonify({
            'message': '注册成功',
            'user': new_user.to_dict(),
            'token': token
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': f'注册失败: {str(e)}'
        }), 500

@auth_bp.errorhandler(404)
def not_found(error):
    return jsonify({
        'error': '请求的资源不存在'
    }), 404

@auth_bp.errorhandler(500)
def internal_error(error):
    return jsonify({
        'error': '服务器内部错误'
    }), 500 