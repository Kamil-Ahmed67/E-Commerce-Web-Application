import { uploadToDrive } from '@/lib/drive/drive';
import { processImage, SERVER_IMAGE_PRESETS } from '@/lib/image/processImage';
import { ALLOWED_IMAGE_MIME_TYPES, MAX_UPLOAD_BYTES } from '@/lib/image/constants';
import { NextResponse } from 'next/server';


export async function POST(request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('file');

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files uploaded' },
        { status: 400 }
      );
    }

    for (const file of files) {
      if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: 'Invalid file type. Only JPEG, PNG, GIF and WebP are allowed.' },
          { status: 400 }
        );
      }
      if (file.size > MAX_UPLOAD_BYTES.default) {
        return NextResponse.json(
          { error: 'File size exceeds 7 MB limit.' },
          { status: 400 }
        );
      }
    }

    const uploadPromises = files.map(async (file) => {
      const rawBuffer = Buffer.from(await file.arrayBuffer());
      const buffer = await processImage(rawBuffer, SERVER_IMAGE_PRESETS.default);
      const fileName = file.name.replace(/\.[^.]+$/, '.webp');

      const webViewLink = await uploadToDrive(
        buffer,
        fileName,
        'image/webp'
      );

      return { name: fileName, path: webViewLink };
    });

    const results = await Promise.all(uploadPromises);

    return NextResponse.json({
      success: true,
      message: `${files.length} file(s) uploaded successfully`,
      paths: results,
    });
  } catch (error) {
    console.error('Upload error:', error);

    return NextResponse.json(
      { error: error.message || 'Failed to upload file' },
      { status: 500 }
    );
  }
}
