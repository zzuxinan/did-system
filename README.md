# DID System - 去中心化身份认证系统

这是一个基于区块链的去中心化身份认证系统，使用 Flask 和 Next.js 构建。

## 项目结构

```
did-system/
├── backend/         # Flask 后端
├── frontend/        # Next.js 前端
└── docs/           # 项目文档
```

## 技术栈

### 后端
- Python 3.8+
- Flask
- SQLAlchemy
- Flask-CORS
- JWT

### 前端
- Next.js 14
- TypeScript
- Tailwind CSS
- Axios

## 开发环境设置

### 后端设置
1. 进入后端目录：
   ```bash
   cd backend
   ```

2. 创建虚拟环境：
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # Linux/Mac
   # 或
   .\venv\Scripts\activate  # Windows
   ```

3. 安装依赖：
   ```bash
   pip install -r requirements.txt
   ```

4. 运行开发服务器：
   ```bash
   python run.py
   ```

### 前端设置
1. 进入前端目录：
   ```bash
   cd frontend
   ```

2. 安装依赖：
   ```bash
   npm install
   ```

3. 运行开发服务器：
   ```bash
   npm run dev
   ```

## API 文档

API 文档位于 `docs/api.md`。

## 环境变量

### 后端
创建 `.env` 文件：
```
DATABASE_URL=sqlite:///did_system.db
SECRET_KEY=your-secret-key
```

### 前端
创建 `.env.local` 文件：
```
NEXT_PUBLIC_API_URL=http://localhost:5050
```

## 许可证

MIT 