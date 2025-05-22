# App 目录说明

## 目录功能
该目录是 Next.js 13+ 的应用路由目录，采用基于文件系统的路由方式。

## 目录结构
- `layout.tsx`: 全局布局组件
- `page.tsx`: 首页组件
- `(routes)/`: 其他页面路由
- `api/`: API 路由处理
- `globals.css`: 全局样式文件

## 开发规范
1. 每个页面都应该导出一个默认组件
2. 使用 layout.tsx 定义布局
3. loading.tsx 用于加载状态
4. error.tsx 用于错误处理
5. 使用 route.ts 处理 API 请求

## 注意事项
- 保持目录结构清晰
- 遵循 React Server Components 规范
- 合理使用客户端和服务端组件
- 注意数据获取和缓存策略 