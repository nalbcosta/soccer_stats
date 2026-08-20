import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "../components/theme-provider";
import { LocaleProvider } from "../i18n/provider";
import { CookieConsentToast } from "../components/legal/cookie-consent-toast";

export const metadata: Metadata = {
  title: "NaBola",
  description: "Pelada organizada, times na mão e números que fazem sentido."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700,900&display=swap"
        />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <LocaleProvider>
            {children}
            <CookieConsentToast />
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
