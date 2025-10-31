# SSL证书配置

此目录用于存放SSL证书文件，用于HTTPS配置。

## 需要的文件：
- `cert.pem` - SSL证书文件
- `key.pem` - 私钥文件

## 开发环境配置：
对于开发环境，可以生成自签名证书：

```bash
# 生成私钥
openssl genrsa -out key.pem 2048

# 生成证书签名请求
openssl req -new -key key.pem -out csr.pem

# 生成自签名证书
openssl x509 -req -days 365 -in csr.pem -signkey key.pem -out cert.pem

# 清理CSR文件
rm csr.pem
```

## 生产环境：
请使用有效的SSL证书，如Let's Encrypt等。

注意：当前nginx配置已包含HTTPS支持，但需要证书文件才能启用。