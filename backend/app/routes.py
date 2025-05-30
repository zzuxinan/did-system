from flask import Blueprint, request, jsonify, send_file
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from datetime import datetime, timedelta
from functools import wraps
from . import db
from .models import User, UserLog, DataFile, DataAuthorization, Declaration, AuthorizationLog, UserData
import os
import hashlib
from werkzeug.utils import secure_filename
import qrcode
import io
import base64

auth_bp = Blueprint('auth', __name__, url_prefix='/api/v1/auth')

data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'instance', 'data')
os.makedirs(data_dir, exist_ok=True)

# 简单异或加密/解密
ENCRYPT_KEY = 0x5A

def xor_encrypt(data: bytes) -> bytes:
    return bytes([b ^ ENCRYPT_KEY for b in data])

def sha256_hex(data: bytes) -> str:
    return '0x' + hashlib.sha256(data).hexdigest()

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': '缺少认证token'}), 401
            
        try:
            token = token.split(' ')[1]  # Bearer token
            data = jwt.decode(token, os.getenv('SECRET_KEY', 'your-secret-key'), algorithms=['HS256'])
            current_user = User.query.get(data['user_id'])
            if not current_user:
                return jsonify({'error': '用户不存在'}), 401
            if not current_user.is_active:
                return jsonify({'error': '账户已被禁用'}), 401
        except:
            return jsonify({'error': '无效的token'}), 401
            
        return f(current_user, *args, **kwargs)
    return decorated

def log_user_action(user_id, action, status, details=None):
    """记录用户操作日志"""
    log = UserLog(
        user_id=user_id,
        action=action,
        status=status,
        details=details,
        ip_address=request.remote_addr
    )
    db.session.add(log)
    db.session.commit()

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        # 验证必要字段
        required_fields = ['email', 'password', 'name', 'wallet_address']
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

        # 检查邮箱是否已存在
        if User.query.filter_by(email=data['email']).first():
            return jsonify({
                'error': '该邮箱已被注册'
            }), 400

        # 检查钱包地址是否已存在
        if User.query.filter_by(wallet_address=data['wallet_address']).first():
            return jsonify({
                'error': '该钱包地址已被绑定'
            }), 400

        # 创建新用户
        new_user = User(
            name=data['name'],
            email=data['email'],
            password_hash=generate_password_hash(data['password'], method='pbkdf2:sha256'),
            wallet_address=data['wallet_address'],
            is_active=True
        )

        db.session.add(new_user)
        db.session.commit()

        # 记录注册日志
        log_user_action(new_user.id, 'register', 'success', '用户注册成功')

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

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        # 验证必要字段
        if not data or 'email' not in data or 'password' not in data:
            return jsonify({'error': '缺少必要字段'}), 400
            
        # 查找用户
        user = User.query.filter_by(email=data['email']).first()
        if not user or not check_password_hash(user.password_hash, data['password']):
            log_user_action(user.id if user else None, 'login', 'failed', '登录失败：邮箱或密码错误')
            return jsonify({'error': '邮箱或密码错误'}), 401
            
        # 更新最后登录时间
        user.last_login = datetime.utcnow()
        db.session.commit()
            
        # 记录登录日志
        log_user_action(user.id, 'login', 'success', '用户登录成功')
            
        # 生成 JWT token
        token = jwt.encode({
            'user_id': user.id,
            'exp': datetime.utcnow() + timedelta(days=1)
        }, os.getenv('SECRET_KEY', 'your-secret-key'))
        
        return jsonify({
            'message': '登录成功',
            'user': user.to_dict(),
            'token': token
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'登录失败: {str(e)}'}), 500

@auth_bp.route('/profile', methods=['GET'])
@token_required
def get_profile(current_user):
    return jsonify({
        'message': '获取用户信息成功',
        'user': current_user.to_dict()
    }), 200

@auth_bp.route('/profile', methods=['PUT'])
@token_required
def update_profile(current_user):
    try:
        data = request.get_json()
        
        # 验证必要字段
        if not data or 'name' not in data:
            return jsonify({'error': '缺少必要字段'}), 400
            
        # 更新用户信息
        current_user.name = data['name']
        db.session.commit()
        
        # 记录操作日志
        log_user_action(current_user.id, 'update_profile', 'success', '更新用户信息成功')
        
        return jsonify({
            'message': '更新用户信息成功',
            'user': current_user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'更新用户信息失败: {str(e)}'}), 500

@auth_bp.route('/profile/password', methods=['PUT'])
@token_required
def change_password(current_user):
    try:
        data = request.get_json()
        
        # 验证必要字段
        if not data or 'old_password' not in data or 'new_password' not in data:
            return jsonify({'error': '缺少必要字段'}), 400
            
        # 验证旧密码
        if not check_password_hash(current_user.password_hash, data['old_password']):
            log_user_action(current_user.id, 'change_password', 'failed', '修改密码失败：旧密码错误')
            return jsonify({'error': '旧密码错误'}), 401
            
        # 更新密码
        current_user.password_hash = generate_password_hash(data['new_password'], method='pbkdf2:sha256')
        db.session.commit()
        
        # 记录操作日志
        log_user_action(current_user.id, 'change_password', 'success', '修改密码成功')
        
        return jsonify({
            'message': '修改密码成功'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'修改密码失败: {str(e)}'}), 500

@auth_bp.route('/profile/wallet', methods=['PUT'])
@token_required
def update_wallet(current_user):
    try:
        data = request.get_json()
        
        # 验证必要字段
        if not data or 'wallet_address' not in data:
            return jsonify({'error': '缺少必要字段'}), 400
            
        # 验证钱包地址格式
        if not data['wallet_address'].startswith('0x') or len(data['wallet_address']) != 42:
            return jsonify({'error': '钱包地址格式不正确'}), 400
            
        # 检查钱包地址是否已被使用
        existing_user = User.query.filter_by(wallet_address=data['wallet_address']).first()
        if existing_user and existing_user.id != current_user.id:
            return jsonify({'error': '该钱包地址已被使用'}), 400
            
        # 更新钱包地址
        current_user.wallet_address = data['wallet_address']
        db.session.commit()
        
        # 记录操作日志
        log_user_action(current_user.id, 'update_wallet', 'success', '更新钱包地址成功')
        
        return jsonify({
            'message': '更新钱包地址成功',
            'user': current_user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'更新钱包地址失败: {str(e)}'}), 500

@auth_bp.route('/profile/logs', methods=['GET'])
@token_required
def get_user_logs(current_user):
    try:
        # 获取分页参数
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        # 查询用户日志
        logs = UserLog.query.filter_by(user_id=current_user.id)\
            .order_by(UserLog.created_at.desc())\
            .paginate(page=page, per_page=per_page)
            
        return jsonify({
            'message': '获取用户日志成功',
            'logs': [log.to_dict() for log in logs.items],
            'total': logs.total,
            'pages': logs.pages,
            'current_page': logs.page
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'获取用户日志失败: {str(e)}'}), 500

@auth_bp.route('/api/data/encrypt', methods=['POST'])
@token_required
def encrypt_file(current_user):
    if 'file' not in request.files:
        return jsonify({'error': '缺少文件'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': '未选择文件'}), 400
    filename = secure_filename(file.filename)
    raw = file.read()
    encrypted = xor_encrypt(raw)
    file_hash = sha256_hex(encrypted)
    encrypted_path = os.path.join(data_dir, file_hash + '.enc')
    with open(encrypted_path, 'wb') as f:
        f.write(encrypted)
    # 存储记录
    data_file = DataFile(user_id=current_user.id, filename=filename, hash=file_hash, encrypted_path=encrypted_path)
    db.session.add(data_file)
    db.session.commit()
    log_user_action(current_user.id, 'data_encrypt', 'success', f'加密并存储文件: {filename}')
    return jsonify({'hash': file_hash}), 200

@auth_bp.route('/api/data/decrypt', methods=['POST'])
@token_required
def decrypt_file(current_user):
    data = request.get_json()
    file_hash = data.get('hash')
    if not file_hash:
        return jsonify({'error': '缺少哈希值'}), 400
    data_file = DataFile.query.filter_by(hash=file_hash, user_id=current_user.id).first()
    if not data_file:
        return jsonify({'error': '未找到该文件'}), 404
    with open(data_file.encrypted_path, 'rb') as f:
        encrypted = f.read()
    raw = xor_encrypt(encrypted)
    log_user_action(current_user.id, 'data_decrypt', 'success', f'解密文件: {data_file.filename}')
    return jsonify({'data': raw.decode(errors='replace')}), 200

@auth_bp.route('/api/data/download', methods=['GET'])
@token_required
def download_file(current_user):
    file_hash = request.args.get('hash')
    if not file_hash:
        return jsonify({'error': '缺少哈希值'}), 400
    data_file = DataFile.query.filter_by(hash=file_hash, user_id=current_user.id).first()
    if not data_file:
        return jsonify({'error': '未找到该文件'}), 404
    with open(data_file.encrypted_path, 'rb') as f:
        encrypted = f.read()
    raw = xor_encrypt(encrypted)
    return send_file(
        path_or_file=bytes(raw),
        as_attachment=True,
        download_name=data_file.filename,
        mimetype='application/octet-stream'
    )

@auth_bp.route('/api/data/list', methods=['GET'])
@token_required
def list_files(current_user):
    files = DataFile.query.filter_by(user_id=current_user.id).order_by(DataFile.created_at.desc()).all()
    return jsonify({'files': [f.to_dict() for f in files]}), 200

@auth_bp.route('/authorizations', methods=['POST'])
@token_required
def create_authorization(current_user):
    try:
        data = request.get_json()
        
        # 验证必要字段
        if not data or 'data_type' not in data or 'authorized_address' not in data or 'duration_minutes' not in data:
            return jsonify({'error': '缺少必要字段'}), 400
            
        # 验证数据类型
        if data['data_type'] not in ['identity', 'profile', 'credentials']:
            return jsonify({'error': '无效的数据类型'}), 400
            
        # 验证钱包地址格式
        if not data['authorized_address'].startswith('0x') or len(data['authorized_address']) != 42:
            return jsonify({'error': '钱包地址格式不正确'}), 400
            
        # 验证授权时长
        valid_durations = [5, 10, 30, 60, 180, 360, 720, 1440]
        if data['duration_minutes'] not in valid_durations:
            return jsonify({'error': '无效的授权时长'}), 400
            
        # 计算过期时间
        expires_at = datetime.utcnow() + timedelta(minutes=data['duration_minutes'])
            
        # 创建授权记录
        authorization = DataAuthorization(
            user_id=current_user.id,
            data_type=data['data_type'],
            authorized_address=data['authorized_address'],
            expires_at=expires_at
        )
        db.session.add(authorization)
        db.session.commit()
        
        # 记录授权日志
        log = AuthorizationLog(
            authorization_id=authorization.id,
            action='created'
        )
        db.session.add(log)
        db.session.commit()
        
        # 记录用户操作
        log_user_action(current_user.id, 'create_authorization', 'success', 
                       f'创建数据授权: {data["data_type"]} -> {data["authorized_address"]}, 有效期{data["duration_minutes"]}分钟')
        
        return jsonify({
            'message': '创建授权成功',
            'authorization': authorization.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'创建授权失败: {str(e)}'}), 500

@auth_bp.route('/authorizations', methods=['GET'])
@token_required
def get_authorizations(current_user):
    try:
        authorizations = DataAuthorization.query.filter_by(user_id=current_user.id)\
            .order_by(DataAuthorization.created_at.desc()).all()
            
        return jsonify({
            'message': '获取授权记录成功',
            'authorizations': [auth.to_dict() for auth in authorizations]
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'获取授权记录失败: {str(e)}'}), 500

@auth_bp.route('/authorizations/<int:auth_id>/revoke', methods=['POST'])
@token_required
def revoke_authorization(current_user, auth_id):
    try:
        authorization = DataAuthorization.query.filter_by(
            id=auth_id, user_id=current_user.id
        ).first()
        
        if not authorization:
            return jsonify({'error': '授权记录不存在'}), 404
            
        if authorization.status == 'revoked':
            return jsonify({'error': '授权已被撤销'}), 400
            
        # 更新授权状态
        authorization.status = 'revoked'
        authorization.revoked_at = datetime.utcnow()
        
        # 记录授权日志
        log = AuthorizationLog(
            authorization_id=authorization.id,
            action='revoked'
        )
        db.session.add(log)
        db.session.commit()
        
        # 记录用户操作
        log_user_action(current_user.id, 'revoke_authorization', 'success', 
                       f'撤销数据授权: {authorization.data_type} -> {authorization.authorized_address}')
        
        return jsonify({
            'message': '撤销授权成功',
            'authorization': authorization.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'撤销授权失败: {str(e)}'}), 500

@auth_bp.route('/authorizations/<int:auth_id>/timeline', methods=['GET'])
@token_required
def get_authorization_timeline(current_user, auth_id):
    try:
        authorization = DataAuthorization.query.filter_by(
            id=auth_id, user_id=current_user.id
        ).first()
        
        if not authorization:
            return jsonify({'error': '授权记录不存在'}), 404
            
        logs = AuthorizationLog.query.filter_by(authorization_id=auth_id)\
            .order_by(AuthorizationLog.created_at.asc()).all()
            
        return jsonify({
            'message': '获取授权时间线成功',
            'logs': [log.to_dict() for log in logs]
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'获取授权时间线失败: {str(e)}'}), 500

@auth_bp.route('/declarations', methods=['POST'])
@token_required
def create_declaration(current_user):
    try:
        data = request.get_json()
        
        # 验证必要字段
        if not data or 'content' not in data:
            return jsonify({'error': '缺少必要字段'}), 400
            
        # 生成签名（示例：使用内容哈希）
        content_hash = hashlib.sha256(data['content'].encode()).hexdigest()
        signature = f'0x{content_hash}'
        
        # 生成二维码
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(f'http://localhost:3000/verify?signature={signature}')  # 修改为实际的前端URL
        qr.make(fit=True)
        qr_img = qr.make_image(fill_color="black", back_color="white")
        
        # 将二维码转换为base64
        buffered = io.BytesIO()
        qr_img.save(buffered, format="PNG")
        qr_base64 = base64.b64encode(buffered.getvalue()).decode()
        
        # 创建声明记录
        declaration = Declaration(
            user_id=current_user.id,
            content=data['content'],
            signature=signature,
            qr_code_path=f'data:image/png;base64,{qr_base64}'  # 直接存储base64数据
        )
        db.session.add(declaration)
        db.session.commit()
        
        # 记录用户操作
        log_user_action(current_user.id, 'create_declaration', 'success', '创建声明成功')
        
        return jsonify({
            'message': '创建声明成功',
            'declaration': declaration.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'创建声明失败: {str(e)}'}), 500

@auth_bp.route('/declarations/<signature>/verify', methods=['GET'])
def verify_declaration(signature):
    try:
        declaration = Declaration.query.filter_by(signature=signature).first()
        
        if not declaration:
            return jsonify({
                'isValid': False,
                'message': '声明不存在'
            }), 404
            
        # 获取用户信息
        user = User.query.get(declaration.user_id)
        
        return jsonify({
            'isValid': True,
            'message': '验证成功',
            'details': {
                'did': f'did:example:{user.wallet_address}',
                'timestamp': declaration.created_at.isoformat(),
                'signature': declaration.signature,
                'content': declaration.content
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'验证声明失败: {str(e)}'}), 500

@auth_bp.route('/declarations/<signature>/qr', methods=['GET'])
def get_declaration_qr(signature):
    try:
        declaration = Declaration.query.filter_by(signature=signature).first()
        
        if not declaration:
            return jsonify({'error': '声明不存在'}), 404
            
        if not os.path.exists(declaration.qr_code_path):
            return jsonify({'error': '二维码文件不存在'}), 404
            
        return send_file(
            declaration.qr_code_path,
            mimetype='image/png',
            as_attachment=True,
            download_name=f'declaration_{signature}.png'
        )
        
    except Exception as e:
        return jsonify({'error': f'获取二维码失败: {str(e)}'}), 500

@auth_bp.route('/user-data/<data_type>', methods=['GET'])
@token_required
def get_user_data(current_user, data_type):
    try:
        user_data = UserData.query.filter_by(
            user_id=current_user.id,
            data_type=data_type
        ).first()
        
        if not user_data:
            return jsonify({
                'message': '数据不存在',
                'data': None
            }), 200
            
        return jsonify({
            'message': '获取数据成功',
            'data': user_data.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'获取数据失败: {str(e)}'}), 500

@auth_bp.route('/user-data/<data_type>', methods=['PUT'])
@token_required
def update_user_data(current_user, data_type):
    try:
        data = request.get_json()
        
        if not data or 'data_content' not in data:
            return jsonify({'error': '缺少必要字段'}), 400
            
        # 验证数据类型
        if data_type not in ['identity', 'profile', 'credentials']:
            return jsonify({'error': '无效的数据类型'}), 400
            
        # 查找或创建用户数据
        user_data = UserData.query.filter_by(
            user_id=current_user.id,
            data_type=data_type
        ).first()
        
        if user_data:
            user_data.data_content = data['data_content']
            user_data.updated_at = datetime.utcnow()
        else:
            user_data = UserData(
                user_id=current_user.id,
                data_type=data_type,
                data_content=data['data_content']
            )
            db.session.add(user_data)
            
        db.session.commit()
        
        # 记录操作日志
        log_user_action(current_user.id, 'update_user_data', 'success', 
                       f'更新{data_type}数据成功')
        
        return jsonify({
            'message': '更新数据成功',
            'data': user_data.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'更新数据失败: {str(e)}'}), 500

@auth_bp.route('/authorized-data/<data_type>', methods=['GET'])
@token_required
def get_authorized_data(current_user, data_type):
    try:
        # 验证授权
        authorization = DataAuthorization.query.filter_by(
            data_type=data_type,
            authorized_address=current_user.wallet_address,
            status='active'
        ).first()
        
        if not authorization:
            return jsonify({'error': '未授权访问'}), 403
            
        # 检查授权是否过期
        if authorization.expires_at and authorization.expires_at < datetime.utcnow():
            # 更新授权状态为已过期
            authorization.status = 'revoked'
            authorization.revoked_at = datetime.utcnow()
            db.session.commit()
            return jsonify({'error': '授权已过期'}), 403
            
        # 获取授权数据
        user_data = UserData.query.filter_by(
            user_id=authorization.user_id,
            data_type=data_type
        ).first()
        
        if not user_data:
            return jsonify({
                'message': '数据不存在',
                'data': None
            }), 200
            
        return jsonify({
            'message': '获取授权数据成功',
            'data': user_data.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'获取授权数据失败: {str(e)}'}), 500

@auth_bp.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'ok',
        'timestamp': datetime.utcnow().isoformat()
    }), 200

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