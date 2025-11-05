import { User } from '../models/User';

/**
 * 用户自动解禁服务
 * 定时检查并自动解禁到期的用户
 */
export class UserAutoEnableService {
  private static instance: UserAutoEnableService;
  private intervalId: NodeJS.Timeout | null = null;
  
  private constructor() {}
  
  public static getInstance(): UserAutoEnableService {
    if (!UserAutoEnableService.instance) {
      UserAutoEnableService.instance = new UserAutoEnableService();
    }
    return UserAutoEnableService.instance;
  }
  
  /**
   * 启动自动解禁服务
   * @param intervalMinutes 检查间隔（分钟），默认30分钟
   */
  public start(intervalMinutes: number = 30): void {
    if (this.intervalId) {
      console.log('用户自动解禁服务已在运行中');
      return;
    }
    
    console.log(`启动用户自动解禁服务，检查间隔：${intervalMinutes}分钟`);
    
    // 立即执行一次检查
    this.checkAndEnableUsers();
    
    // 设置定时检查
    this.intervalId = setInterval(() => {
      this.checkAndEnableUsers();
    }, intervalMinutes * 60 * 1000);
  }
  
  /**
   * 停止自动解禁服务
   */
  public stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('用户自动解禁服务已停止');
    }
  }
  
  /**
   * 检查并自动解禁到期的用户
   */
  private async checkAndEnableUsers(): Promise<void> {
    try {
      const now = new Date();
      
      // 查找需要解禁的用户：禁用时间已过且当前状态为禁用的用户
      const usersToEnable = await User.find({
        isActive: false,
        disabledUntil: { $lte: now }
      });
      
      if (usersToEnable.length === 0) {
        console.log(`[${new Date().toISOString()}] 没有需要自动解禁的用户`);
        return;
      }
      
      console.log(`[${new Date().toISOString()}] 发现 ${usersToEnable.length} 个用户需要自动解禁`);
      
      // 批量更新用户状态
      const userIds = usersToEnable.map(user => user._id);
      const result = await User.updateMany(
        { _id: { $in: userIds } },
        { 
          $set: { 
            isActive: true,
            disabledUntil: null 
          } 
        }
      );
      
      console.log(`[${new Date().toISOString()}] 成功自动解禁 ${result.modifiedCount} 个用户`);
      
      // 记录详细的用户信息
      usersToEnable.forEach(user => {
        console.log(`[${new Date().toISOString()}] 用户 ${user.username} (${user.email}) 已自动解禁`);
      });
      
    } catch (error) {
      console.error(`[${new Date().toISOString()}] 自动解禁用户时发生错误:`, error);
    }
  }
  
  /**
   * 手动执行一次检查（用于测试或手动触发）
   */
  public async manualCheck(): Promise<number> {
    try {
      const now = new Date();
      const usersToEnable = await User.find({
        isActive: false,
        disabledUntil: { $lte: now }
      });
      
      if (usersToEnable.length === 0) {
        return 0;
      }
      
      const userIds = usersToEnable.map(user => user._id);
      const result = await User.updateMany(
        { _id: { $in: userIds } },
        { 
          $set: { 
            isActive: true,
            disabledUntil: null 
          } 
        }
      );
      
      return result.modifiedCount || 0;
    } catch (error) {
      console.error('手动检查用户解禁时发生错误:', error);
      throw error;
    }
  }
}

// 导出单例实例
export const userAutoEnableService = UserAutoEnableService.getInstance();