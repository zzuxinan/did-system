from flask import request, jsonify
from functools import wraps
import redis
import time

# 初始化 Redis 客户端
redis_client = redis.Redis(host='localhost', port=6379, db=0)

def rate_limit(limit=60, period=60):
    """
    请求频率限制装饰器
    :param limit: 在指定时间内允许的最大请求数
    :param period: 时间周期（秒）
    """
    def decorator(f):
        @wraps(f)
        def wrapped(*args, **kwargs):
            # 获取客户端 IP
            ip = request.remote_addr
            
            # 生成 Redis key
            key = f'rate_limit:{ip}'
            
            # 获取当前请求数
            current = redis_client.get(key)
            
            if current is None:
                # 第一次请求
                redis_client.setex(key, period, 1)
            elif int(current) >= limit:
                # 超过限制
                return jsonify({
                    'error': 'Too many requests',
                    'retry_after': redis_client.ttl(key)
                }), 429
            else:
                # 增加请求计数
                redis_client.incr(key)
            
            return f(*args, **kwargs)
        return wrapped
    return decorator 