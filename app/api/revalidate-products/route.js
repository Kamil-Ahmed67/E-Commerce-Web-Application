import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

export async function POST() {
  revalidateTag('products');
  return NextResponse.json({ revalidated: true });
}
