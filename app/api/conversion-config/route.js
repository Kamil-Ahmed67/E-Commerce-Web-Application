import { NextResponse } from 'next/server';
import { getPixelConfigs } from '@/lib/server/getPixelConfigs';

export async function GET() {
  const configs = await getPixelConfigs();
  return NextResponse.json(configs);
}
