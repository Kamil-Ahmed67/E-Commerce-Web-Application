import { NextResponse } from 'next/server';
import { verifyResetToken } from '@/lib/server/resetToken';
import config from '@/config';

export async function POST(request) {
  try {
    const { email, token, password } = await request.json();

    if (!email || !token || !password) {
      return NextResponse.json(
        { success: false, error: 'Email, token and new password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    if (!verifyResetToken(token, email)) {
      return NextResponse.json(
        { success: false, error: 'This reset link is invalid or has expired' },
        { status: 400 }
      );
    }

    const response = await fetch(`${config.API_BASE_URL}api/EItem/ResetPassword`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        TenantId: config.tenantId,
      },
      body: JSON.stringify({ Email: email, Password: password }),
    });

    if (!response.ok) {
      throw new Error('Failed to update password');
    }

    return NextResponse.json({ success: true, message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to reset password',
        debugMessage: error?.message || String(error),
        debugCode: error?.code || null,
      },
      { status: 500 }
    );
  }
}
