# DID 系统后端接口文档

## 1. 基础信息

### 接口规范
- 基础URL: `http://localhost:5000/api/v1`
- 请求方式: REST
- 数据格式: JSON
- 认证方式: Bearer Token

### 通用响应格式
```typescript
interface ApiResponse<T> {
  code: number;      // 状态码
  message: string;   // 响应消息
  data: T;          // 响应数据
  timestamp: string; // 时间戳
}
```

### 状态码说明
- 200: 成功
- 400: 请求参数错误
- 401: 未认证
- 403: 权限不足
- 404: 资源不存在
- 500: 服务器错误

## 2. 用户认证接口

### 2.1 用户注册
```typescript
POST /auth/register

请求体：
{
  "email": string;      // 邮箱
  "password": string;   // 密码
  "name": string;       // 用户名
  "phone": string;      // 手机号（可选）
}

响应体：
{
  "code": 200,
  "message": "注册成功",
  "data": {
    "userId": string;
    "token": string;
    "expiresIn": number;
  }
}
```

### 2.2 用户登录
```typescript
POST /auth/login

请求体：
{
  "email": string;     // 邮箱
  "password": string;  // 密码
}

响应体：
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": string;
    "expiresIn": number;
    "user": {
      "id": string;
      "name": string;
      "email": string;
    }
  }
}
```

## 3. DID 管理接口

### 3.1 创建 DID
```typescript
POST /did/create

请求头：
Authorization: Bearer <token>

请求体：
{
  "type": "individual" | "organization";  // DID类型
  "metadata": {
    "name": string;
    "description": string;
    // 其他元数据
  }
}

响应体：
{
  "code": 200,
  "message": "DID创建成功",
  "data": {
    "did": string;           // DID标识符
    "publicKey": string;     // 公钥
    "createdAt": string;     // 创建时间
  }
}
```

### 3.2 验证 DID
```typescript
POST /did/verify

请求体：
{
  "did": string;            // DID标识符
  "signature": string;      // 签名
  "message": string;        // 签名消息
}

响应体：
{
  "code": 200,
  "message": "验证成功",
  "data": {
    "isValid": boolean;
    "verificationTime": string;
  }
}
```

## 4. 凭证管理接口

### 4.1 创建凭证
```typescript
POST /credentials/create

请求头：
Authorization: Bearer <token>

请求体：
{
  "type": string;           // 凭证类型
  "issuerDid": string;      // 发行者DID
  "holderDid": string;      // 持有者DID
  "claims": {              // 凭证声明
    [key: string]: any;
  };
  "expirationDate": string; // 过期时间
}

响应体：
{
  "code": 200,
  "message": "凭证创建成功",
  "data": {
    "credentialId": string;
    "credential": {
      "id": string;
      "type": string;
      "issuer": string;
      "holder": string;
      "claims": object;
      "issuedAt": string;
      "expiresAt": string;
    }
  }
}
```

### 4.2 验证凭证
```typescript
POST /credentials/verify

请求体：
{
  "credentialId": string;   // 凭证ID
  "proof": {               // 验证证明
    "type": string;
    "signature": string;
  }
}

响应体：
{
  "code": 200,
  "message": "验证成功",
  "data": {
    "isValid": boolean;
    "verificationTime": string;
    "credential": object;  // 凭证详情
  }
}
```

## 5. 授权管理接口

### 5.1 创建授权
```typescript
POST /authorizations/create

请求头：
Authorization: Bearer <token>

请求体：
{
  "grantorDid": string;     // 授权者DID
  "granteeDid": string;     // 被授权者DID
  "scope": string[];        // 授权范围
  "resources": string[];    // 授权资源
  "expiresAt": string;      // 过期时间
}

响应体：
{
  "code": 200,
  "message": "授权创建成功",
  "data": {
    "authorizationId": string;
    "createdAt": string;
    "expiresAt": string;
  }
}
```

### 5.2 验证授权
```typescript
POST /authorizations/verify

请求体：
{
  "authorizationId": string;  // 授权ID
  "resource": string;         // 请求资源
  "action": string;           // 请求操作
}

响应体：
{
  "code": 200,
  "message": "验证成功",
  "data": {
    "isAuthorized": boolean;
    "scope": string[];
    "expiresAt": string;
  }
}
```

## 6. 数据共享接口

### 6.1 请求数据共享
```typescript
POST /data-sharing/request

请求头：
Authorization: Bearer <token>

请求体：
{
  "requesterDid": string;    // 请求者DID
  "ownerDid": string;        // 数据所有者DID
  "dataType": string;        // 数据类型
  "purpose": string;         // 使用目的
  "duration": number;        // 共享时长（秒）
}

响应体：
{
  "code": 200,
  "message": "请求已发送",
  "data": {
    "requestId": string;
    "status": "pending";
    "createdAt": string;
  }
}
```

### 6.2 获取共享数据
```typescript
GET /data-sharing/{requestId}

请求头：
Authorization: Bearer <token>

响应体：
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "requestId": string;
    "status": string;
    "data": object;
    "sharedAt": string;
    "expiresAt": string;
  }
}
```

## 7. 审计日志接口

### 7.1 获取操作日志
```typescript
GET /audit-logs

请求头：
Authorization: Bearer <token>

查询参数：
- startTime: string;    // 开始时间
- endTime: string;      // 结束时间
- type: string;         // 操作类型
- did: string;          // 相关DID
- page: number;         // 页码
- pageSize: number;     // 每页数量

响应体：
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "total": number;
    "page": number;
    "pageSize": number;
    "logs": Array<{
      "id": string;
      "type": string;
      "did": string;
      "action": string;
      "timestamp": string;
      "details": object;
    }>;
  }
}
```

## 8. 错误处理

所有接口在发生错误时都会返回统一的错误格式：

```typescript
{
  "code": number;       // 错误码
  "message": string;    // 错误信息
  "errors": Array<{     // 详细错误信息（可选）
    "field": string;    // 错误字段
    "message": string;  // 错误描述
  }>;
}
```

## 9. 安全建议

1. 所有接口必须使用 HTTPS
2. 敏感数据必须加密传输
3. 实现请求频率限制
4. 实现 IP 白名单机制
5. 记录所有关键操作日志
6. 定期清理过期数据
7. 实现数据备份机制

## 10. 开发建议

1. 使用 OpenAPI/Swagger 文档
2. 实现接口版本控制
3. 添加接口监控和告警
4. 实现优雅的降级策略
5. 添加接口性能监控
6. 实现自动化测试
7. 定期进行安全审计 