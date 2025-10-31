import React, { useState, useEffect } from 'react';
import { Modal, Upload, Button, Avatar, Space, List, Image, Popconfirm, message } from 'antd';
import { UploadOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import { avatarAPI } from '../services/api';
import { useAppDispatch } from '../hooks/redux';
import { getCurrentUser } from '../store/slices/authSlice';

interface AvatarUploadModalProps {
  visible: boolean;
  onClose: () => void;
}

const AvatarUploadModal: React.FC<AvatarUploadModalProps> = ({ visible, onClose }) => {
  const dispatch = useAppDispatch();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [avatarHistory, setAvatarHistory] = useState<string[]>([]);
  const [currentAvatar, setCurrentAvatar] = useState<string>('');
  const [loadingHistory, setLoadingHistory] = useState(false);

  // 加载头像历史记录
  const loadAvatarHistory = async () => {
    try {
      setLoadingHistory(true);
      const response = await avatarAPI.getAvatarHistory();
      setCurrentAvatar(response.data.currentAvatar || '');
      setAvatarHistory(response.data.avatarHistory || []);
    } catch (error) {
      console.error('加载头像历史记录失败:', error);
      message.error('加载头像历史记录失败');
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (visible) {
      loadAvatarHistory();
    }
  }, [visible]);

  const uploadProps: UploadProps = {
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (file) => {
      // 检查文件类型
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('只能上传图片文件!');
        return false;
      }

      // 检查文件大小（5MB）
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error('图片大小不能超过5MB!');
        return false;
      }

      setFileList([file]);
      return false; // 阻止自动上传
    },
    fileList,
    maxCount: 1,
  };

  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.warning({
        content: '请选择要上传的头像文件',
        duration: 3,
      });
      return;
    }

    try {
      setUploading(true);
      
      // 显示上传进度提示
      const uploadMessage = message.loading({
        content: '正在上传头像...',
        duration: 0, // 持续显示直到手动关闭
        key: 'uploading',
      });

      const formData = new FormData();
      formData.append('avatar', fileList[0] as any);

      const response = await avatarAPI.uploadAvatar(formData);
      
      // 关闭上传进度提示
      message.destroy('uploading');
      
      message.success({
        content: '🎉 头像上传成功！',
        duration: 3,
        style: {
          marginTop: '50vh',
        },
      });
      
      setFileList([]);
      
      // 更新本地状态
      setCurrentAvatar(response.data.avatar);
      setAvatarHistory(response.data.avatarHistory || []);
      
      // 更新Redux状态
      await dispatch(getCurrentUser());
      
      // 自动关闭模态框（可选）
      setTimeout(() => {
        onClose();
      }, 2000);
      
    } catch (error: any) {
      // 关闭上传进度提示
      message.destroy('uploading');
      
      const errorMessage = error.response?.data?.error || '头像上传失败';
      message.error({
        content: `❌ ${errorMessage}`,
        duration: 5,
      });
      console.error('头像上传失败:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleSelectAvatar = async (avatarUrl: string) => {
    try {
      await avatarAPI.selectAvatar(avatarUrl);
      message.success({
        content: '✅ 头像切换成功',
        duration: 2,
      });
      setCurrentAvatar(avatarUrl);
      
      // 更新Redux状态
      await dispatch(getCurrentUser());
      
    } catch (error: any) {
      console.error('切换头像失败:', error);
      message.error({
        content: `❌ ${error.response?.data?.error || '切换头像失败'}`,
        duration: 3,
      });
    }
  };

  const handleDeleteAvatar = async (avatarUrl: string) => {
    try {
      await avatarAPI.deleteAvatar(avatarUrl);
      message.success({
        content: '🗑️ 头像删除成功',
        duration: 2,
      });
      
      // 更新本地状态
      setAvatarHistory(prev => prev.filter(url => url !== avatarUrl));
      
    } catch (error: any) {
      console.error('删除头像失败:', error);
      message.error({
        content: `❌ ${error.response?.data?.error || '删除头像失败'}`,
        duration: 3,
      });
    }
  };

  const getAvatarUrl = (avatarUrl: string) => {
    if (!avatarUrl) return '';
    // 如果是相对路径，直接使用，因为Nginx已经配置了代理
    if (avatarUrl.startsWith('/uploads/')) {
      return avatarUrl;
    }
    return avatarUrl;
  };

  return (
    <Modal
      title="头像管理"
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          取消
        </Button>,
        <Button
          key="upload"
          type="primary"
          loading={uploading}
          onClick={handleUpload}
          disabled={fileList.length === 0}
        >
          上传头像
        </Button>
      ]}
      width={600}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* 当前头像 */}
        <div>
          <h4>当前头像</h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Avatar 
              size={64} 
              src={getAvatarUrl(currentAvatar)} 
              icon={<UserOutlined />}
            />
            <div>
              <div style={{ fontSize: '14px', color: '#666' }}>
                当前使用的头像
              </div>
            </div>
          </div>
        </div>

        {/* 上传新头像 */}
        <div>
          <h4>上传新头像</h4>
          <Upload {...uploadProps}>
            <Button icon={<UploadOutlined />}>选择图片</Button>
          </Upload>
          <div style={{ fontSize: '12px', color: '#999', marginTop: 8 }}>
            支持 JPG、PNG 格式，大小不超过 5MB
          </div>
        </div>

        {/* 头像历史记录 */}
        <div>
          <h4>历史头像</h4>
          {loadingHistory ? (
            <div style={{ textAlign: 'center', padding: 20 }}>加载中...</div>
          ) : avatarHistory.length > 0 ? (
            <List
              grid={{ gutter: 16, column: 4 }}
              dataSource={avatarHistory}
              renderItem={(avatarUrl) => (
                <List.Item>
                  <div style={{ position: 'relative' }}>
                    <Image
                      width={60}
                      height={60}
                      src={getAvatarUrl(avatarUrl)}
                      style={{ 
                        borderRadius: '50%', 
                        cursor: 'pointer',
                        border: currentAvatar === avatarUrl ? '2px solid #1890ff' : '1px solid #d9d9d9'
                      }}
                      preview={false}
                      onClick={() => handleSelectAvatar(avatarUrl)}
                    />
                    <Popconfirm
                      title="确定要删除这个头像吗？"
                      onConfirm={() => handleDeleteAvatar(avatarUrl)}
                      okText="确定"
                      cancelText="取消"
                    >
                      <Button
                        type="text"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        style={{
                          position: 'absolute',
                          top: -8,
                          right: -8,
                          width: 20,
                          height: 20,
                          minWidth: 20,
                          padding: 0
                        }}
                      />
                    </Popconfirm>
                  </div>
                </List.Item>
              )}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: 20, color: '#999' }}>
              暂无历史头像记录
            </div>
          )}
        </div>
      </Space>
    </Modal>
  );
};

export default AvatarUploadModal;