/**
 * Email Service
 *
 * Provides email sending functionality for various application needs.
 * Uses Resend for transactional emails.
 */

import { resend, emailConfig } from '../config/email.js';
import { env } from '../config/env.js';

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  /**
   * Check if email service is available
   */
  static isEnabled(): boolean {
    return emailConfig.enabled;
  }

  /**
   * Send an email
   */
  static async send(options: SendEmailOptions): Promise<boolean> {
    if (!resend) {
      if (env.NODE_ENV === 'development') {
        // Log email details in development when Resend is not configured
        process.stdout.write(`[EmailService] Would send email:\n`);
        process.stdout.write(`  To: ${options.to}\n`);
        process.stdout.write(`  Subject: ${options.subject}\n`);
        process.stdout.write(`  Body preview: ${options.text?.slice(0, 100) || 'HTML only'}...\n`);
      }
      return false;
    }

    try {
      await resend.emails.send({
        from: emailConfig.from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });
      return true;
    } catch {
      // Silent fail - email should never break main flow
      return false;
    }
  }

  /**
   * Send password reset email
   */
  static async sendPasswordResetEmail(
    email: string,
    resetToken: string
  ): Promise<boolean> {
    const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const appName = env.APP_NAME;

    const subject = `Reset your ${appName} password`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">${appName}</h1>
  </div>

  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
    <h2 style="color: #1f2937; margin-top: 0;">Reset Your Password</h2>

    <p style="color: #4b5563;">
      We received a request to reset the password for your ${appName} account.
      Click the button below to create a new password:
    </p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetUrl}"
         style="background: #667eea; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
        Reset Password
      </a>
    </div>

    <p style="color: #6b7280; font-size: 14px;">
      This link will expire in <strong>1 hour</strong>.
    </p>

    <p style="color: #6b7280; font-size: 14px;">
      If you didn't request a password reset, you can safely ignore this email.
      Your password will remain unchanged.
    </p>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

    <p style="color: #9ca3af; font-size: 12px; margin-bottom: 0;">
      If the button doesn't work, copy and paste this link into your browser:
      <br>
      <a href="${resetUrl}" style="color: #667eea; word-break: break-all;">${resetUrl}</a>
    </p>
  </div>

  <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
    &copy; ${new Date().getFullYear()} ${appName}. All rights reserved.
  </div>
</body>
</html>`;

    const text = `
Reset Your ${appName} Password

We received a request to reset the password for your ${appName} account.

To reset your password, visit this link:
${resetUrl}

This link will expire in 1 hour.

If you didn't request a password reset, you can safely ignore this email.
Your password will remain unchanged.

© ${new Date().getFullYear()} ${appName}
`;

    return this.send({
      to: email,
      subject,
      html,
      text,
    });
  }

  /**
   * Send welcome email (optional - can be enabled later)
   */
  static async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
    const appName = env.APP_NAME;
    const loginUrl = `${env.FRONTEND_URL}/login`;

    const subject = `Welcome to ${appName}!`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">${appName}</h1>
  </div>

  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
    <h2 style="color: #1f2937; margin-top: 0;">Welcome, ${name}!</h2>

    <p style="color: #4b5563;">
      Thank you for joining ${appName}! We're excited to have you on board.
    </p>

    <p style="color: #4b5563;">
      ${appName} helps you organize your projects and tasks with a beautiful Kanban board interface.
      Get started by creating your first project!
    </p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${loginUrl}"
         style="background: #667eea; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
        Get Started
      </a>
    </div>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

    <p style="color: #9ca3af; font-size: 12px; margin-bottom: 0;">
      If you have any questions, feel free to reach out to our support team.
    </p>
  </div>

  <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
    &copy; ${new Date().getFullYear()} ${appName}. All rights reserved.
  </div>
</body>
</html>`;

    const text = `
Welcome to ${appName}, ${name}!

Thank you for joining ${appName}! We're excited to have you on board.

${appName} helps you organize your projects and tasks with a beautiful Kanban board interface.
Get started by creating your first project!

Visit: ${loginUrl}

© ${new Date().getFullYear()} ${appName}
`;

    return this.send({
      to: email,
      subject,
      html,
      text,
    });
  }
}

export default EmailService;
