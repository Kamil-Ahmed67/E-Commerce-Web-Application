import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

export async function POST() {
  revalidateTag('pixel-configs');
  return NextResponse.json({ revalidated: true });
}
