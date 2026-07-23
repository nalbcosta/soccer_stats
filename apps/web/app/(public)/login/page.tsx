"use client";

import { AuthForm } from "../../../components/auth/auth-form";
import { useTranslations } from "../../../i18n/provider";

export default function LoginPage() {
  const t = useTranslations("auth");

  return (
    <main className="min-h-screen overflow-hidden bg-canvas px-4 py-3 text-text sm:py-6">
      <div className="pointer-events-none fixed inset-0 opacity-70">
        <div className="absolute right-[-6rem] top-12 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-[-8rem] left-[-6rem] h-72 w-72 rounded-full bg-field/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100svh-1.5rem)] max-w-6xl flex-col sm:min-h-[calc(100vh-3rem)]">
        <section className="grid flex-1 content-start gap-8 py-6 sm:content-center sm:py-10 md:grid-cols-[0.92fr_0.8fr] md:items-center md:gap-10">
          <div className="hidden md:flex md:flex-col max-w-2xl pt-2 sm:pt-0">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-field">{t("loginEyebrow")}</p>
            <h1 className="mt-3 max-w-xl text-[2rem] font-black leading-[1.04] sm:text-5xl">{t("loginTitle")}</h1>
            <p className="mt-4 max-w-lg text-base font-semibold leading-7 text-muted">
              {t("loginDescription")}
            </p>
          </div>
          <div className="w-full justify-self-center md:max-w-xl md:justify-self-end">
            <AuthForm />
          </div>
        </section>
      </div>
    </main>
  );
}

