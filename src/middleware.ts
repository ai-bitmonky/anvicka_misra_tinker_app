import { NextResponse, userAgent, type NextRequest } from "next/server";

/** Guesses the device from the user agent so the first paint shows the right version.
 *  The browser's matchMedia check has the final say after load. */
export function middleware(request: NextRequest) {
  const { device } = userAgent(request);
  const guess = device.type === "mobile" || device.type === "tablet" ? "mobile" : "desktop";
  const headers = new Headers(request.headers);
  headers.set("x-device", guess);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon|apple-icon|manifest.webmanifest|robots.txt|og.png|icons/).*)"],
};
