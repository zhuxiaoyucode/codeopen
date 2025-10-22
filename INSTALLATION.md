# CodeShare 安装指南

## 系统要求

### 最低配置
- **操作系统**: Windows 10 / macOS 10.15 / Ubuntu 18.04+
- **内存**: 4GB RAM
- **存储**: 2GB 可用空间
- **网络**: 稳定的互联网连接

### 推荐配置
- **操作系统**: Windows 11 / macOS 12+ / Ubuntu 20.04+
- **内存**: 8GB RAM 或更高
- **存储**: 5GB 可用空间
- **处理器**: 多核处理器

## 环境准备

### 1. 安装 Node.js

**Windows**
1. 访问 [Node.js 官网](https://nodejs.org/)
2. 下载 LTS 版本（推荐 18.x）
3. 运行安装程序，按默认设置安装
4. 验证安装：
```bash
node --version  # 应该显示 v18.x.x
npm --version   # 应该显示 8.x.x
```

**macOS**
```bash
# 使用 Homebrew 安装
brew install node@18

# 或下载官方安装包
```

**Linux (Ubuntu)**
```bash
# 使用 NodeSource 仓库
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. 安装 MongoDB

**Windows**
1. 下载 [MongoDB Community Server](https://www.mongodb.com/try/download/community)
2. 运行安装程序，选择 "Complete" 安装
3. 将 MongoDB 添加到 PATH
4. 启动 MongoDB 服务

**macOS**
```bash
# 使用 Homebrew 安装
brew tap mongodb/brew
brew install mongodb-community@7.0

# 启动服务
brew services start mongodb-community
```

**Linux (Ubuntu)**
```bash
# 添加 MongoDB 仓库
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# 安装 MongoDB
sudo apt-get update
sudo apt-get install -y mongodb-org

# 启动服务
sudo systemctl start mongod
sudo systemctl enable mongod
```

### 3. 安装 Git（可选）

**Windows**
- 下载 [Git for Windows](https://git-scm.com/download/win)
- 按默认设置安装

**macOS**
```bash
brew install git
```

**Linux**
```bash
sudo apt-get install git
```

## 项目安装

### 方法一：使用安装脚本（推荐）

1. **下载项目**
```bash
# 使用 Git
git clone https://github.com/your-username/codeshare.git
cd codeshare

# 或下载 ZIP 文件并解压
```

2. **一键安装**
```bash
# 运行安装脚本（自动安装所有依赖）
npm run install:all
```

### 方法二：手动安装

1. **安装根目录依赖**
```bash
npm install
```

2. **安装前端依赖**
```bash
cd frontend
npm install
cd ..
```

3. **安装后端依赖**
```bash
cd backend  
npm install
cd ..
```

## 环境配置

### 1. 配置后端环境变量

```bash
# 复制环境变量模板
cp backend/.env.example backend/.env

# 编辑环境变量文件
# 使用文本编辑器打开 backend/.env
```

修改以下配置：
```env
MONGODB_URI=mongodb://localhost:27017/codeshare
JWT_SECRET=your-super-secret-jwt-key-change-this
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### 2. 配置前端环境变量（可选）

如果需要自定义 API 地址，创建 `frontend/.env`：
```env
VITE_API_BASE_URL=http://localhost:3001/api
```

## 启动应用

### 开发模式
```bash
# 同时启动前后端（推荐）
npm run dev

# 访问前端：http://localhost:3000
# 访问后端API：http://localhost:3001
```

### 分别启动
```bash
# 终端1：启动后端
npm run dev:backend

# 终端2：启动前端  
npm run dev:frontend
```

### 生产模式
```bash
# 构建生产版本
npm run build

# 启动生产服务器
npm start
```

## Docker 安装（替代方案）

### 使用 Docker Compose

1. **安装 Docker 和 Docker Compose**
   - [Docker Desktop](https://www.docker.com/products/docker-desktop)

2. **一键启动**
```bash
docker-compose up -d
```

3. **访问应用**
- 前端：http://localhost:3000
- 后端API：http://localhost:3001

## 验证安装

### 1. 检查服务状态

**MongoDB 连接**
```bash
# 连接到 MongoDB
mongosh
> show dbs
```

**后端服务**
```bash
curl http://localhost:3001/api/health
# 应该返回：{"status":"OK","timestamp":"...","version":"1.0.0"}
```

**前端服务**
- 打开浏览器访问 http://localhost:3000
- 应该看到 CodeShare 首页

### 2. 测试功能

1. 创建新的代码片段
2. 分享链接给他人
3. 注册用户账号
4. 管理个人片段

## 故障排除

### 常见问题

**端口被占用**
```bash
# 查找占用端口的进程
netstat -ano | findstr :3000  # Windows
lsof -i :3000                 # macOS/Linux

# 终止进程或修改端口
```

**MongoDB 连接失败**
```bash
# 检查 MongoDB 服务状态
sudo systemctl status mongod  # Linux
brew services list           # macOS

# 重启服务
sudo systemctl restart mongod
```

**依赖安装失败**
```bash
# 清除缓存重新安装
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**权限问题**
```bash
# Linux/macOS 权限修复
sudo chown -R $USER:$USER .
```

## 获取帮助

如果遇到问题：
1. 查看 [README.md](README.md) 文档
2. 检查 [DEVELOPMENT.md](DEVELOPMENT.md) 开发指南
3. 创建 Issue 报告问题
4. 查看项目 Wiki 页面

## 下一步

- [ ] 阅读 [README.md](README.md) 了解功能特性
- [ ] 查看 [DEVELOPMENT.md](DEVELOPMENT.md) 开始开发
- [ ] 探索 API 文档了解接口使用
- [ ] 参与项目贡献