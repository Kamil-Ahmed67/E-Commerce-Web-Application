import { uploadToDrive } from '@/lib/drive/drive';
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

    const uploadPromises = files.map(async (file) => {
      const buffer = Buffer.from(await file.arrayBuffer());
      const fileName = file.name;
      const mimeType = file.type;

      const webViewLink = await uploadToDrive(
        buffer,
        fileName,
        mimeType
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
