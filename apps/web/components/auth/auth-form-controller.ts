"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../lib/api";
import { useLocale } from "../locale-provider";

export type AuthMode = "signin" | "signup";

type AuthFormState = {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  rememberMe: boolean;
};

type UsernameAvailabilityStatus = "idle" | "invalid" | "checking" | "available" | "taken" | "error";

const initialForm: AuthFormState = {
  email: "",
  username: "",
  password: "",
  confirmPassword: "",
  rememberMe: false
};

const usernamePattern = /^[a-z0-9_]{3,20}$/;

export function useAuthFormController() {
  const router = useRouter();
  const { locale } = useLocale();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [feedback, setFeedback] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState(initialForm);
  const [usernameAvailability, setUsernameAvailability] = useState<{
    message: string;
    status: UsernameAvailabilityStatus;
  }>({ message: "", status: "idle" });

  const passwordRules = [
    { label: "Pelo menos 8 caracteres", valid: form.password.length >= 8 },
    { label: "Inclua uma letra", valid: /[a-zA-Z]/.test(form.password) },
    { label: "Inclua um numero", valid: /[0-9]/.test(form.password) }
  ];
  const isPasswordValid = passwordRules.every((rule) => rule.valid);
  const passwordsMatch = form.confirmPassword.length > 0 && form.password === form.confirmPassword;

  useEffect(() => {
    if (mode !== "signup") {
      setUsernameAvailability({ message: "", status: "idle" });
      return;
    }

    const username = form.username.trim().toLowerCase();

    if (!username) {
      setUsernameAvailability({ message: "", status: "idle" });
      return;
    }

    if (!usernamePattern.test(username)) {
      setUsernameAvailability({
        message: "Use 3 a 20 caracteres: letras minúsculas, números e _.",
        status: "invalid"
      });
      return;
    }

    setUsernameAvailability({ message: "Verificando apelido...", status: "checking" });

    let active = true;
    const timeout = window.setTimeout(() => {
      void api
        .checkUsernameAvailability(username)
        .then((result) => {
          if (!active) {
            return;
          }

          setUsernameAvailability({
            message: result.message,
            status: result.available ? "available" : "taken"
          });
        })
        .catch(() => {
          if (!active) {
            return;
          }

          setUsernameAvailability({
            message: "Nao deu para verificar agora.",
            status: "error"
          });
        });
    }, 350);

    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, [form.username, mode]);

  const updateField = <Field extends keyof AuthFormState>(field: Field, value: AuthFormState[Field]) => {
    setForm((state) => ({ ...state, [field]: value }));
  };

  const submit = () => {
    setFeedback("");

    if (mode === "signup") {
      if (!isPasswordValid) {
        setFeedback("A senha precisa ter pelo menos 8 caracteres, uma letra e um numero.");
        return;
      }

      if (!passwordsMatch) {
        setFeedback("Confirme a senha para continuar.");
        return;
      }

      if (usernameAvailability.status !== "available") {
        setFeedback("Escolha um apelido disponivel antes de criar a conta.");
        return;
      }
    }

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

  const signInWithGoogle = async (credential: string) => {
    await api.signInWithGoogle({ credential, locale, rememberMe: form.rememberMe });
    router.push("/app");
  };

  return {
    feedback,
    form,
    isConfirmPasswordVisible,
    isPending,
    isPasswordVisible,
    isPasswordValid,
    mode,
    passwordRules,
    passwordsMatch,
    setIsConfirmPasswordVisible,
    setIsPasswordVisible,
    setMode,
    signInWithGoogle,
    submit,
    updateField,
    usernameAvailability
  };
}
