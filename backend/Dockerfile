FROM node:18-alpine AS base
WORKDIR /app

# 仅复制包管理文件以最大化缓存利用
COPY package*.json ./

# 安装全部依赖用于构建（改用 npm install 以兼容 package-lock 变化）
RUN npm install

# 复制源代码
COPY . .

# 构建 TypeScript
RUN npm run build

# 生产镜像：仅保留生产依赖与构建产物
FROM node:18-alpine AS runner
WORKDIR /app

# 仅复制包管理文件并安装生产依赖（改用 npm install）
COPY package*.json ./
RUN npm install --production && npm cache clean --force

# 复制构建产物与必要的运行时文件
COPY --from=base /app/dist ./dist


# 安装 docker 客户端以便沙箱功能调用宿主机 Docker
RUN apk add --no-cache docker-cli

# 为了访问 /var/run/docker.sock，保持 root 运行（如需更安全可在宿主调整 socket 权限并使用非 root）
EXPOSE 3001
CMD ["npm", "start"]