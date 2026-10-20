import { NextResponse } from 'next/server';

export function proxy(request) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: ['/((?!_next|favicon.ico|api).*)'],
};
