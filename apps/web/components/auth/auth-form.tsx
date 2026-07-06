"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LogIn, UserPlus } from "lucide-react";
import { api } from "../../lib/api";
import { GoogleLogin } from "../google-login";
import { useLocale } from "../locale-provider";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export function AuthForm() {
  const router = useRouter();
  const { locale } = useLocale();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [feedback, setFeedback] = useState("");
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
    rememberMe: false
  });

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback("");

    startTransition(() => {
      const email = form.email.trim().toLowerCase();
      const username = form.username.trim().toLowerCase();
      const task =
        mode === "signup"
          ? api.signUp({ email, username, password: form.password, locale })
          : api.signIn({ email, password: form.password, rememberMe: form.rememberMe });

      void task
        .then(() => router.push("/app"))
        .catch((error: unknown) => setFeedback(error instanceof Error ? error.message : "Nao deu para entrar agora."));
    });
  };

  return (
    <form className="rounded-xl border border-border bg-surface/94 p-4 shadow-panel backdrop-blur sm:p-5" onSubmit={submit}>
      <div className="grid grid-cols-2 gap-2 rounded-lg bg-canvas p-1">
        <button
          className={`min-h-11 rounded-md px-3 py-2 text-sm font-black ${mode === "signin" ? "bg-surface text-text shadow-line" : "text-muted"}`}
          type="button"
          onClick={() => setMode("signin")}
        >
          Entrar
        </button>
        <button
          className={`min-h-11 rounded-md px-3 py-2 text-sm font-black ${mode === "signup" ? "bg-surface text-text shadow-line" : "text-muted"}`}
          type="button"
          onClick={() => setMode("signup")}
        >
          Criar conta
        </button>
      </div>

      <div className="mt-5 space-y-3">
        <label className="grid gap-1.5">
          <span className="text-xs font-black uppercase tracking-[0.14em] text-muted">Email</span>
        <Input
          autoComplete="email"
          disabled={isPending}
          placeholder="email@exemplo.com"
          required
          type="email"
          value={form.email}
          onChange={(event) => setForm((state) => ({ ...state, email: event.target.value }))}
        />
        </label>
        {mode === "signup" ? (
          <label className="grid gap-1.5">
            <span className="text-xs font-black uppercase tracking-[0.14em] text-muted">Apelido</span>
            <Input
              autoComplete="username"
              disabled={isPending}
              maxLength={20}
              minLength={3}
              pattern="[a-z0-9_]+"
              placeholder="seu_apelido"
              required
              value={form.username}
              onChange={(event) => setForm((state) => ({ ...state, username: event.target.value.toLowerCase() }))}
            />
          </label>
        ) : null}
        <label className="grid gap-1.5">
          <span className="text-xs font-black uppercase tracking-[0.14em] text-muted">Senha</span>
          <Input
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            disabled={isPending}
            maxLength={72}
            minLength={8}
            placeholder="Mínimo 8 caracteres"
            required
            type="password"
            value={form.password}
            onChange={(event) => setForm((state) => ({ ...state, password: event.target.value }))}
          />
        </label>

        {mode === "signin" ? (
          <label className="flex items-start gap-3 rounded-lg border border-border bg-canvas/65 p-3">
            <input
              checked={form.rememberMe}
              className="mt-1 h-4 w-4 accent-[var(--color-primary)]"
              disabled={isPending}
              type="checkbox"
              onChange={(event) => setForm((state) => ({ ...state, rememberMe: event.target.checked }))}
            />
            <span className="grid gap-0.5">
              <span className="text-sm font-black text-text">Lembrar de mim neste dispositivo</span>
              <span className="text-xs font-semibold leading-5 text-muted">
                Mantém sua sessão por até 14 dias. Não salva sua senha no navegador.
              </span>
            </span>
          </label>
        ) : null}

        <Button className="w-full rounded-xl" disabled={isPending} type="submit">
          {mode === "signup" ? <UserPlus size={18} /> : <LogIn size={18} />}
          {isPending ? "Só um instante..." : mode === "signup" ? "Criar meu vestiário" : "Entrar no vestiário"}
        </Button>

        <GoogleLogin
          onCredential={async (credential) => {
            await api.signInWithGoogle({ credential, locale, rememberMe: form.rememberMe });
            router.push("/app");
          }}
        />

        {feedback ? (
          <p className="rounded-lg bg-marker-soft p-3 text-sm font-bold leading-5 text-text" role="alert">
            {feedback}
          </p>
        ) : null}
      </div>
    </form>
  );
}
