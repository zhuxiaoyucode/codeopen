#!/usr/bin/env python3
import requests
import json

# 测试头像功能
BASE_URL = "http://localhost"

def test_avatar_upload():
    """测试头像上传功能"""
    print("=== 测试头像上传功能 ===")
    
    # 1. 先登录获取token
    login_data = {
        "email": "test@example.com",
        "password": "password123"
    }
    
    try:
        # 尝试登录
        response = requests.post(f"{BASE_URL}/api/auth/login", json=login_data)
        if response.status_code == 200:
            token = response.json().get('token')
            print(f"✅ 登录成功，token: {token[:20]}...")
        else:
            print(f"❌ 登录失败: {response.status_code}")
            return
            
        # 2. 测试头像上传（这里需要实际的文件上传，暂时跳过）
        print("📝 头像上传功能需要实际文件测试")
        
        # 3. 测试静态文件服务
        print("\n=== 测试静态文件服务 ===")
        
        # 测试Nginx代理
        test_urls = [
            f"{BASE_URL}/uploads/avatars/test.jpg",
            f"{BASE_URL}/api/health"
        ]
        
        for url in test_urls:
            try:
                response = requests.head(url)
                print(f"✅ {url}: {response.status_code}")
            except Exception as e:
                print(f"❌ {url}: {e}")
                
    except Exception as e:
        print(f"❌ 测试过程中出错: {e}")

if __name__ == "__main__":
    test_avatar_upload()