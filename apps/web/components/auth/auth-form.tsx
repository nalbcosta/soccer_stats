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
    password: ""
  });

  const submit = () =>
    startTransition(() => {
      const task =
        mode === "signup"
          ? api.signUp({ ...form, locale })
          : api.signIn({ email: form.email, password: form.password });

      void task
        .then(() => router.push("/app"))
        .catch((error: unknown) => setFeedback(error instanceof Error ? error.message : "Nao deu para entrar agora."));
    });

  return (
    <div className="rounded-lg border border-border bg-surface p-5 shadow-line">
      <div className="grid grid-cols-2 gap-2 rounded-lg bg-canvas p-1">
        <button
          className={`rounded-md px-3 py-2 text-sm font-bold ${mode === "signin" ? "bg-surface text-text shadow-line" : "text-muted"}`}
          type="button"
          onClick={() => setMode("signin")}
        >
          Entrar
        </button>
        <button
          className={`rounded-md px-3 py-2 text-sm font-bold ${mode === "signup" ? "bg-surface text-text shadow-line" : "text-muted"}`}
          type="button"
          onClick={() => setMode("signup")}
        >
          Criar conta
        </button>
      </div>

      <div className="mt-5 space-y-3">
        <Input
          autoComplete="email"
          placeholder="email@exemplo.com"
          type="email"
          value={form.email}
          onChange={(event) => setForm((state) => ({ ...state, email: event.target.value }))}
        />
        {mode === "signup" ? (
          <Input
            autoComplete="username"
            placeholder="seu_apelido"
            value={form.username}
            onChange={(event) => setForm((state) => ({ ...state, username: event.target.value.toLowerCase() }))}
          />
        ) : null}
        <Input
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          placeholder="Senha"
          type="password"
          value={form.password}
          onChange={(event) => setForm((state) => ({ ...state, password: event.target.value }))}
        />

        <Button className="w-full" disabled={isPending} type="button" onClick={submit}>
          {mode === "signup" ? <UserPlus size={18} /> : <LogIn size={18} />}
          {mode === "signup" ? "Criar meu vestiario" : "Entrar no vestiario"}
        </Button>

        <GoogleLogin
          onCredential={async (credential) => {
            await api.signInWithGoogle({ credential, locale });
            router.push("/app");
          }}
        />

        {feedback ? <p className="rounded-lg bg-marker-soft p-3 text-sm font-medium text-text">{feedback}</p> : null}
      </div>
    </div>
  );
}
