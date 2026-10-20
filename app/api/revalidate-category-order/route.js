import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

export async function POST() {
  revalidateTag('category-order');
  return NextResponse.json({ revalidated: true });
}
