# CodeShare 开发指南

## 本地开发环境设置

### 前置要求
- Node.js 16.0.0 或更高版本
- MongoDB 4.4 或更高版本
- npm 8.0.0 或更高版本

### 快速开始

1. **克隆项目**
```bash
git clone <repository-url>
cd codeshare
```

2. **安装依赖**
```bash
# 安装所有依赖（前后端）
npm run install:all
```

3. **配置环境变量**
```bash
# 复制后端环境变量模板
cp backend/.env.example backend/.env

# 编辑后端环境变量
# 修改 MONGODB_URI 和 JWT_SECRET
```

4. **启动开发服务器**
```bash
# 同时启动前后端开发服务器
npm run dev

# 或者分别启动
npm run dev:backend  # 后端服务 (http://localhost:3001)
npm run dev:frontend # 前端服务 (http://localhost:3000)
```

## 项目结构

```
codeshare/
├── frontend/                 # React前端应用
│   ├── src/
│   │   ├── components/       # 可复用组件
│   │   ├── pages/           # 页面组件
│   │   ├── store/           # Redux状态管理
│   │   ├── hooks/           # 自定义Hooks
│   │   ├── services/        # API服务
│   │   ├── types/           # TypeScript类型定义
│   │   └── utils/           # 工具函数
│   ├── public/              # 静态资源
│   └── package.json
├── backend/                  # Node.js后端服务
│   ├── src/
│   │   ├── controllers/     # 控制器
│   │   ├── models/          # 数据模型
│   │   ├── routes/          # 路由定义
│   │   ├── middleware/      # 中间件
│   │   ├── config/          # 配置文件
│   │   └── utils/           # 工具函数
│   └── package.json
├── docs/                    # 项目文档
└── README.md
```

## 开发规范

### 代码风格
- 使用 TypeScript 进行类型检查
- 遵循 ESLint 规则
- 使用 Prettier 格式化代码
- 提交前运行代码检查

### Git 工作流
1. 从 main 分支创建功能分支
2. 提交信息使用约定式提交格式
3. 创建 Pull Request 进行代码审查
4. 通过 CI/CD 流水线后合并

### 测试
```bash
# 运行前端测试
cd frontend && npm test

# 运行后端测试  
cd backend && npm test

# 运行所有测试
npm test
```

## API 开发

### 添加新 API 端点
1. 在 `backend/src/routes/` 创建路由文件
2. 在控制器中实现业务逻辑
3. 添加中间件处理认证和验证
4. 更新 API 文档

### 数据模型
- 在 `backend/src/models/` 定义 Mongoose 模型
- 使用 TypeScript 接口定义类型
- 添加必要的索引和验证

## 前端开发

### 组件开发
- 使用函数组件和 Hooks
- 遵循单一职责原则
- 添加 PropTypes 或 TypeScript 类型
- 实现响应式设计

### 状态管理
- 使用 Redux Toolkit 管理全局状态
- 使用 React Context 管理局部状态
- 实现适当的错误处理

## 部署

### 生产环境构建
```bash
# 构建生产版本
npm run build

# 启动生产服务器
npm start
```

### Docker 部署
```bash
# 使用 Docker Compose
docker-compose up -d

# 构建镜像
docker-compose build
```

## 故障排除

### 常见问题

**MongoDB 连接失败**
- 检查 MongoDB 服务是否运行
- 验证环境变量中的连接字符串
- 检查防火墙设置

**前端构建失败**
- 清除 node_modules 重新安装
- 检查 TypeScript 类型错误
- 验证依赖版本兼容性

**API 请求失败**
- 检查后端服务是否正常运行
- 验证 CORS 配置
- 检查 JWT 令牌有效性

### 调试技巧

**后端调试**
```bash
# 启用调试模式
DEBUG=* npm run dev:backend

# 使用 Node.js 调试器
node --inspect src/index.ts
```

**前端调试**
- 使用 React DevTools 浏览器扩展
- 启用 Redux DevTools
- 使用浏览器开发者工具

## 性能优化

### 前端优化
- 实现代码分割和懒加载
- 使用 React.memo 优化重渲染
- 压缩和缓存静态资源

### 后端优化
- 实现数据库查询优化
- 使用缓存策略
- 启用 Gzip 压缩

## 安全考虑

- 使用环境变量存储敏感信息
- 实现输入验证和清理
- 使用 HTTPS 在生产环境
- 定期更新依赖包