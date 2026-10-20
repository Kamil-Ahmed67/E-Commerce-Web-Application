import { uploadToDrive } from '@/lib/drive/drive';
import { processImage, SERVER_IMAGE_PRESETS } from '@/lib/image/processImage';
import { ALLOWED_IMAGE_MIME_TYPES, MAX_UPLOAD_BYTES } from '@/lib/image/constants';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, GIF and WebP are allowed.' },
        { status: 400 }
      );
    }

    if (file.size > MAX_UPLOAD_BYTES.logo) {
      return NextResponse.json({ error: 'File size exceeds 7 MB limit.' }, { status: 400 });
    }

    const rawBuffer = Buffer.from(await file.arrayBuffer());
    const buffer = await processImage(rawBuffer, SERVER_IMAGE_PRESETS.small);
    const fileName = `logo-${Date.now()}.webp`;

    const driveUrl = await uploadToDrive(buffer, fileName, 'image/webp');

    return NextResponse.json({
      success: true,
      filename: fileName,
      filePath: driveUrl,
    });
  } catch (error) {
    console.error('Logo upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Upload failed' },
      { status: 500 }
    );
  }
}
