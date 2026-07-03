import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const LOCALE_COOKIE = "soccer-stats-locale";

const inferLocale = (languageHeader: string | null): "pt-BR" | "en" =>
  languageHeader?.toLowerCase().includes("pt") ? "pt-BR" : "en";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  if (!request.cookies.get(LOCALE_COOKIE)) {
    response.cookies.set(LOCALE_COOKIE, inferLocale(request.headers.get("accept-language")), {
      path: "/",
      sameSite: "lax"
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
