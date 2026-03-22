import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * No-op middleware so Next always emits `middleware-manifest.json` during dev/build.
 * A missing manifest (e.g. after `.next` was deleted while `next dev` was running) crashes the dev server.
 */
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

/** Empty matcher = never runs, but middleware still generates `middleware-manifest.json`. */
export const config = {
  matcher: [],
};
