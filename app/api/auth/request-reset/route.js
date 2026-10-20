import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { generateResetToken } from '@/lib/server/resetToken';

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }

    const resetToken = generateResetToken(email);
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    if (process.env.NODE_ENV !== 'production') {
      console.log('[dev only] Password reset URL:', resetUrl);
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.GOOGLE_ACCOUNT_USER,
        pass: process.env.GOOGLE_ACCOUNT_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    await transporter.verify();

    await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.GOOGLE_ACCOUNT_USER}>`,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset</title>
          <style>
            body {
              font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .content {
              background-color: #f9f9f9;
              padding: 30px;
              border-radius: 8px;
            }
            h1 {
              color: #32BBAB;
              margin-top: 0;
            }
            .button {
              display: inline-block;
              padding: 12px 24px;
              background-color:#32BBAB;
              color: white !important;
              text-decoration: none;
              border-radius: 4px;
              font-weight: 600;
              margin: 20px 0;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              color: #666;
              font-size: 14px;
            }
            .expiry-note {
              color: #dc2626;
              font-weight: 500;
            }
          </style>
        </head>
        <body>  
          <div class="content">
            <h1>Mingle Password Reset Request</h1>
            <p>Hello,</p>
            <p>We received a request to reset your password. Click the button below to proceed:</p>
            
            <p>
              <a href="${resetUrl}" class="button">Reset Password</a>
            </p>
            
            <p>If you didn't request this, please ignore this email or contact support if you have concerns.</p>
            
            <p class="expiry-note">This link will expire in 1 hour</p>
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} ${process.env.EMAIL_FROM_NAME}. All rights reserved.</p>
            <p>ROAD-33,SECTOR-3, BALY COMPLEX, AJAMPUR, UTTARA, DHAKA-1230.</p>
            <p>If you're having trouble with the button above, copy and paste this link into your browser:</p>
            <p><small>${resetUrl}</small></p>
          </div>
        </body>
        </html>
      `,
    });

    return NextResponse.json({
      success: true,
      message: 'Password reset link has been sent.',
      ...(process.env.NODE_ENV !== 'production' ? { devResetUrl: resetUrl } : {}),
    });

  } catch (error) {
    console.error('Email Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process request',
        debugMessage: error?.message || String(error),
        debugCode: error?.code || null,
      },
      { status: 500 }
    );
  }
}
