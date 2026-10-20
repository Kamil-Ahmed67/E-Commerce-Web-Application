import { google } from 'googleapis';
import { NextResponse } from 'next/server';

function getDriveClient() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_DRIVE_CLIENT_ID,
    process.env.GOOGLE_DRIVE_CLIENT_SECRET,
    'https://developers.google.com/oauthplayground'
  );
  oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_DRIVE_REFRESH_TOKEN });
  return google.drive({ version: 'v3', auth: oauth2Client });
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const fileId = searchParams.get('id');

  if (!fileId) {
    return new NextResponse('Missing file id', { status: 400 });
  }

  try {
    const drive = getDriveClient();

    const metaRes = await drive.files.get({
      fileId,
      fields: 'mimeType',
    });

    const response = await drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'arraybuffer' }
    );

    return new NextResponse(response.data, {
      status: 200,
      headers: {
        'Content-Type': metaRes.data.mimeType || 'image/webp',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (err) {
    console.error('Drive image fetch error:', err);
    return new NextResponse('Image not found', { status: 404 });
  }
}
