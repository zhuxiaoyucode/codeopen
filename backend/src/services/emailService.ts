import nodemailer from 'nodemailer';

// QQ邮箱配置
const emailConfig = {
  host: 'smtp.qq.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.QQ_EMAIL_USER, // QQ邮箱地址
    pass: process.env.QQ_EMAIL_PASS, // QQ邮箱授权码（不是密码）
  },
};

// 创建邮件传输器
const transporter = nodemailer.createTransport(emailConfig);

// 验证邮件配置
const verifyEmailConfig = async () => {
  try {
    await transporter.verify();
    return true;
  } catch (error: any) {
    return false;
  }
};

// 验证码存储（内存存储，实际项目中建议使用数据库或缓存）
const verificationCodes: Record<string, { code: string; expiresAt: number }> = {};

// 发送验证码邮件
export const sendVerificationCodeEmail = async (toEmail: string, code: string): Promise<boolean> => {
  try {
    // 存储验证码（有效期10分钟）
    verificationCodes[toEmail] = {
      code,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10分钟有效期
    };

    // 检查环境变量是否配置
    if (!process.env.QQ_EMAIL_USER || !process.env.QQ_EMAIL_PASS) {
      return true;
    }

    // 验证邮箱配置
    const isConfigValid = await verifyEmailConfig();
    if (!isConfigValid) {
      return true;
    }

    const mailOptions = {
      from: `"代码片段共享平台" <${process.env.QQ_EMAIL_USER}>`,
      to: toEmail,
      subject: '密码重置验证码',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">代码片段共享平台</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">密码重置验证码</p>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
              您好！您正在尝试重置密码，请使用以下验证码完成操作：
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <div style="display: inline-block; background: #fff; padding: 20px 40px; border: 2px dashed #667eea; border-radius: 10px;">
                <span style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px;">${code}</span>
              </div>
            </div>
            <p style="font-size: 14px; color: #666; margin-bottom: 10px;">
              • 验证码有效期：10分钟
            </p>
            <p style="font-size: 14px; color: #666; margin-bottom: 10px;">
              • 如非本人操作，请忽略此邮件
            </p>
            <p style="font-size: 14px; color: #666;">
              • 请勿将验证码透露给他人
            </p>
          </div>
          <div style="background: #f0f0f0; padding: 20px; text-align: center; color: #666; font-size: 12px;">
            <p style="margin: 0;">此邮件由系统自动发送，请勿回复</p>
            <p style="margin: 5px 0 0 0;">代码片段共享平台 © ${new Date().getFullYear()}</p>
          </div>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    return true;
  } catch (error: any) {
    console.error('邮件发送失败:', error);
    return false;
  }
};

// 测试邮件发送
export const testEmailService = async () => {
  try {
    const testCode = '123456';
    const result = await sendVerificationCodeEmail('test@example.com', testCode);
    return result;
  } catch (error: any) {
    console.error('邮件服务测试失败:', error);
    return false;
  }
};