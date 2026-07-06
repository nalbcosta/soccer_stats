import Link from "next/link";
import { AuthForm } from "../../../components/auth/auth-form";
import { LocaleToggleButton, ThemeToggleButton } from "../../../components/public/landing/landing-shared";

export default function LoginPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-canvas px-4 py-4 text-text sm:py-6">
      <div className="pointer-events-none fixed inset-0 opacity-70">
        <div className="absolute right-[-6rem] top-12 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-[-8rem] left-[-6rem] h-72 w-72 rounded-full bg-field/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100svh-2rem)] max-w-6xl flex-col sm:min-h-[calc(100vh-3rem)]">
        <header className="grid gap-3 rounded-xl border border-border bg-surface/72 p-3 shadow-line backdrop-blur sm:flex sm:items-center sm:justify-between sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none">
          <Link href="/" className="flex items-center gap-3 font-black">
            <span className="field-grid grid h-11 w-11 place-items-center rounded-lg bg-field text-sm text-white shadow-line">NB</span>
            <span className="text-lg">NaBola</span>
          </Link>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
            <LocaleToggleButton />
            <ThemeToggleButton />
          </div>
        </header>

        <section className="grid flex-1 content-start gap-7 py-8 sm:content-center sm:py-10 md:grid-cols-[0.9fr_0.82fr] md:items-center">
          <div className="max-w-2xl">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-field">Vestiário online</p>
            <h1 className="mt-3 text-[2.35rem] font-black leading-[1.05] sm:text-5xl">Entre, monte a turma e deixe o placar falar.</h1>
            <p className="mt-4 max-w-lg text-base font-semibold leading-7 text-muted">
              Login simples para organizar jogos, cuidar dos times e guardar os números de quem resolve dentro de campo.
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
