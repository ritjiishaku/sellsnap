import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'sandbox.smtp.mailtrap.io',
  port: Number(process.env.SMTP_PORT) || 2525,
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

export async function sendPasswordResetEmail(email: string, resetLink: string): Promise<void> {
  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'noreply@sellsnap.com',
    to: email,
    subject: 'Reset your SellSnap password',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #1A7F3C;">SellSnap</h2>
        <p>You requested a password reset. Click the link below to set a new password:</p>
        <a href="${resetLink}" style="display: inline-block; background: #1A7F3C; color: white; padding: 12px 24px; border-radius: 4px; text-decoration: none; margin: 16px 0;">
          Reset Password
        </a>
        <p style="color: #5A6270; font-size: 14px;">This link expires in 1 hour. If you didn't request this, you can ignore this email.</p>
      </div>
    `,
  });
}
