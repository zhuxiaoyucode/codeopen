FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# 直接使用本地构建产物（确保在宿主已执行 `cd frontend && npm run build`）
# 复制 dist 下所有内容，覆盖默认文件
COPY dist/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]