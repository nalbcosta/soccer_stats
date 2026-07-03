import Link from "next/link";
import { AuthForm } from "../../../components/auth/auth-form";
import { LocaleToggle } from "../../../components/locale-toggle";
import { ThemeToggle } from "../../../components/theme-toggle";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-canvas px-4 py-6 text-text">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-5xl flex-col">
        <header className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-extrabold">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-field text-sm text-white">NB</span>
            NaBola
          </Link>
          <div className="hidden items-center gap-2 sm:flex">
            <LocaleToggle compact />
            <ThemeToggle compact />
          </div>
        </header>

        <section className="grid flex-1 items-center gap-8 py-10 md:grid-cols-[0.9fr_0.8fr]">
          <div>
            <p className="text-sm font-extrabold uppercase text-field">Vestiario online</p>
            <h1 className="mt-3 text-3xl font-black leading-tight md:text-5xl">Entre, monte a turma e deixe o placar falar.</h1>
            <p className="mt-4 max-w-lg text-base leading-7 text-muted">
              Login simples para organizar os jogos, cuidar dos times e guardar os numeros de quem resolve dentro de campo.
            </p>
          </div>
          <AuthForm />
        </section>
      </div>
    </main>
  );
}
