"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../lib/api";
import { useLocale } from "../../i18n/provider";
import { useTranslations } from "../../i18n/provider";

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

const usernamePattern = /^[A-Za-z0-9_]{3,20}$/;

export function useAuthFormController() {
  const router = useRouter();
  const { locale } = useLocale();
  const t = useTranslations("auth");
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
    { label: t("passwordRuleLength"), valid: form.password.length >= 8 },
    { label: t("passwordRuleLetter"), valid: /[a-zA-Z]/.test(form.password) },
    { label: t("passwordRuleNumber"), valid: /[0-9]/.test(form.password) }
  ];
  const isPasswordValid = passwordRules.every((rule) => rule.valid);
  const passwordsMatch = form.confirmPassword.length > 0 && form.password === form.confirmPassword;

  useEffect(() => {
    if (mode !== "signup") {
      setUsernameAvailability({ message: "", status: "idle" });
      return;
    }

    const username = form.username.trim();

    if (!username) {
      setUsernameAvailability({ message: "", status: "idle" });
      return;
    }

    if (!usernamePattern.test(username)) {
      setUsernameAvailability({
        message: t("usernameInvalid"),
        status: "invalid"
      });
      return;
    }

    setUsernameAvailability({ message: t("checkingUsername"), status: "checking" });

    let active = true;
    const timeout = window.setTimeout(() => {
      void api
        .checkUsernameAvailability(username)
        .then((result) => {
          if (!active) {
            return;
          }

          setUsernameAvailability({
            message: result.available ? t("usernameAvailable") : t("usernameTaken"),
            status: result.available ? "available" : "taken"
          });
        })
        .catch(() => {
          if (!active) {
            return;
          }

          setUsernameAvailability({
            message: t("usernameUnavailable"),
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
        setFeedback(t("invalidPassword"));
        return;
      }

      if (!passwordsMatch) {
        setFeedback(t("confirmPasswordError"));
        return;
      }

      if (usernameAvailability.status !== "available") {
        setFeedback(t("usernameRequired"));
        return;
      }
    }

    startTransition(() => {
      const email = form.email.trim().toLowerCase();
      const username = form.username.trim();
      const task =
        mode === "signup"
          ? api.signUp({ email, username, password: form.password, locale })
          : api.signIn({ email, password: form.password, rememberMe: form.rememberMe });

      void task
        .then(() => router.push("/app"))
        .catch((error: unknown) => setFeedback(error instanceof Error ? error.message : t("signInError")));
    });
  };

  const signInWithGoogle = async (credential: string) => {
    setFeedback("");
    try {
      await api.signInWithGoogle({ credential, locale, rememberMe: form.rememberMe });
      router.push("/app");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : t("signInError"));
    }
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
