import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id || !/^[\w-]+$/.test(id)) {
    return new NextResponse('Invalid id', { status: 400 });
  }

  const driveUrl = `https://drive.google.com/thumbnail?id=${id}&sz=w1920`;

  const upstream = await fetch(driveUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
  });

  if (!upstream.ok) {
    return new NextResponse('Failed to fetch image', { status: upstream.status });
  }

  const contentType = upstream.headers.get('content-type') || 'image/jpeg';
  const buffer = await upstream.arrayBuffer();

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
