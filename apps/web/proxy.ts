import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { inferLocale, localeCookieName } from "./i18n/config";

export function proxy(request: NextRequest) {
  const response = NextResponse.next();

  if (!request.cookies.get(localeCookieName)) {
    response.cookies.set(localeCookieName, inferLocale(request.headers.get("accept-language")), {
      path: "/",
      sameSite: "lax"
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
