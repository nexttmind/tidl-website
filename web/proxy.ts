import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  SESSION_COOKIE_NAME,
  isSessionExpired,
  unsealSession,
} from "@/lib/auth/session";

/**
 * Next.js 16 network proxy (replaces middleware.ts).
 * - 404 removed brand/email dump routes
 * - Local session gate for post-account /care/* (no PrescribeRx round-trip)
 */

const REMOVED = [
  /^\/brand\/peptide\/?$/,
  /^\/brand\/emails\/?$/,
  /^\/emails(?:\/|$)/,
];

const PROTECTED_PREFIXES = [
  "/care/waiting",
  "/care/protocol",
  "/care/visit",
  "/care/confirmation",
  "/care/home",
] as const;

function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (REMOVED.some((pattern) => pattern.test(pathname))) {
    return new NextResponse(null, { status: 404 });
  }

  if (isProtected(pathname)) {
    const raw = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = await unsealSession(raw);
    if (!session || isSessionExpired(session)) {
      const login = new URL("/care/account", request.url);
      login.searchParams.set("mode", "login");
      const entry = request.nextUrl.searchParams.get("entry");
      const encounter = request.nextUrl.searchParams.get("encounter");
      if (entry) login.searchParams.set("entry", entry);
      if (encounter) login.searchParams.set("encounter", encounter);
      login.searchParams.set(
        "next",
        `${pathname}${request.nextUrl.search || ""}`,
      );
      return NextResponse.redirect(login);
    }
  }

  return NextResponse.next();
}

export const proxyConfig = {
  matcher: [
    "/brand/peptide",
    "/brand/peptide/",
    "/brand/emails",
    "/brand/emails/",
    "/emails",
    "/emails/:path*",
    "/care/waiting",
    "/care/waiting/:path*",
    "/care/protocol",
    "/care/protocol/:path*",
    "/care/visit",
    "/care/visit/:path*",
    "/care/confirmation",
    "/care/confirmation/:path*",
    "/care/home",
    "/care/home/:path*",
  ],
};
