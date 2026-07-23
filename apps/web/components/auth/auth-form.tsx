"use client";

import { CheckCircle2, Eye, EyeOff, Loader2, LogIn, UserPlus, XCircle } from "lucide-react";
import { GoogleLogin } from "../google-login";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useAuthFormController } from "./auth-form-controller";
import { useTranslations } from "../../i18n/provider";

export function AuthForm() {
  const t = useTranslations("auth");
  const {
    feedback,
    form,
    isConfirmPasswordVisible,
    isPending,
    isPasswordValid,
    isPasswordVisible,
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
  } = useAuthFormController();
  const isSignUp = mode === "signup";
  const canSubmit = !isPending && (!isSignUp || (isPasswordValid && passwordsMatch && usernameAvailability.status === "available"));

  return (
    <form
      className="rounded-xl border border-border bg-surface/94 p-4 shadow-panel backdrop-blur sm:p-5"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <div className="grid gap-1">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-muted">{isSignUp ? t("createAccess") : t("access")}</p>
        <p className="text-sm font-semibold leading-6 text-muted">
          {isSignUp ? t("createDescription") : t("accessDescription")}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 rounded-lg bg-canvas p-1">
        <button
          className={`min-h-11 rounded-md px-3 py-2 text-sm font-black transition ${mode === "signin" ? "bg-surface text-text shadow-line" : "text-muted"}`}
          type="button"
          onClick={() => setMode("signin")}
        >
          {t("signIn")}
        </button>
        <button
          className={`min-h-11 rounded-md px-3 py-2 text-sm font-black transition ${mode === "signup" ? "bg-surface text-text shadow-line" : "text-muted"}`}
          type="button"
          onClick={() => setMode("signup")}
        >
          {t("signUp")}
        </button>
      </div>

      <div className="mt-5 space-y-3.5">
        <label className="grid gap-1.5">
          <span className="text-xs font-black uppercase tracking-[0.14em] text-muted">{t("email")}</span>
          <Input
            autoComplete="email"
            disabled={isPending}
            placeholder={t("emailPlaceholder")}
            required
            type="email"
            value={form.email}
            onChange={(event) => updateField("email", event.target.value)}
          />
        </label>
        {mode === "signup" ? (
          <label className="grid gap-1.5">
            <span className="text-xs font-black uppercase tracking-[0.14em] text-muted">{t("username")}</span>
            <Input
              autoComplete="username"
              disabled={isPending}
              maxLength={20}
              minLength={3}
              pattern="[a-z0-9_]+"
              placeholder={t("usernamePlaceholder")}
              required
              value={form.username}
              onChange={(event) => updateField("username", event.target.value.toLowerCase())}
            />
            <UsernameAvailabilityMessage message={usernameAvailability.message} status={usernameAvailability.status} />
          </label>
        ) : null}
        <label className="grid gap-1.5">
          <span className="text-xs font-black uppercase tracking-[0.14em] text-muted">{t("password")}</span>
          <div className="relative">
            <Input
              autoComplete={isSignUp ? "new-password" : "current-password"}
              className="pr-12"
              disabled={isPending}
              maxLength={72}
              minLength={8}
              placeholder={isSignUp ? t("passwordMinimum") : "•••••••••"}
              required
              type={isPasswordVisible ? "text" : "password"}
              value={form.password}
              onChange={(event) => updateField("password", event.target.value)}
            />
            <button
              aria-label={isPasswordVisible ? t("hidePassword") : t("showPassword")}
              className="absolute right-1 top-1 grid h-9 w-9 place-items-center rounded-md text-muted transition hover:bg-canvas hover:text-text"
              disabled={isPending}
              type="button"
              onClick={() => setIsPasswordVisible((state) => !state)}
            >
              {isPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {isSignUp ? (
            <div className="grid gap-1 rounded-lg bg-canvas/65 p-2">
              {passwordRules.map((rule) => (
                <span className={`flex items-center gap-2 text-xs font-bold ${rule.valid ? "text-primary-strong" : "text-muted"}`} key={rule.label}>
                  {rule.valid ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                  {rule.label}
                </span>
              ))}
            </div>
          ) : null}
        </label>

        {isSignUp ? (
          <label className="grid gap-1.5">
            <span className="text-xs font-black uppercase tracking-[0.14em] text-muted">{t("confirmPassword")}</span>
            <div className="relative">
              <Input
                autoComplete="new-password"
                className="pr-12"
                disabled={isPending}
                maxLength={72}
                minLength={8}
                placeholder={t("repeatPassword")}
                required
                type={isConfirmPasswordVisible ? "text" : "password"}
                value={form.confirmPassword}
                onChange={(event) => updateField("confirmPassword", event.target.value)}
              />
              <button
              aria-label={isConfirmPasswordVisible ? t("hideConfirmPassword") : t("showConfirmPassword")}
                className="absolute right-1 top-1 grid h-9 w-9 place-items-center rounded-md text-muted transition hover:bg-canvas hover:text-text"
                disabled={isPending}
                type="button"
                onClick={() => setIsConfirmPasswordVisible((state) => !state)}
              >
                {isConfirmPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {form.confirmPassword ? (
              <span className={`text-xs font-bold ${passwordsMatch ? "text-primary-strong" : "text-error"}`}>
                {passwordsMatch ? t("passwordsMatch") : t("passwordsMismatch")}
              </span>
            ) : null}
          </label>
        ) : null}

        {!isSignUp ? (
          <label className="flex items-start gap-3 rounded-lg border border-border bg-canvas/65 p-3">
            <input
              checked={form.rememberMe}
              className="mt-1 h-4 w-4 accent-[var(--color-primary)]"
              disabled={isPending}
              type="checkbox"
              onChange={(event) => updateField("rememberMe", event.target.checked)}
            />
            <span className="grid gap-0.5">
              <span className="text-sm font-black text-text">{t("rememberMe")}</span>
              <span className="text-xs font-semibold leading-5 text-muted">
                {t("rememberMeDescription")}
              </span>
            </span>
          </label>
        ) : null}

        <Button className="mt-1 w-full rounded-xl" disabled={!canSubmit} type="submit">
          {isSignUp ? <UserPlus size={18} /> : <LogIn size={18} />}
          {isPending ? t("pending") : isSignUp ? t("createLockerRoom") : t("enterLockerRoom")}
        </Button>

        <div className="flex items-center gap-3 py-1">
          <div className="h-px flex-1 bg-border" />
          <span className="text-[11px] font-black uppercase tracking-[0.14em] text-muted">{t("orContinue")}</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <GoogleLogin onCredential={signInWithGoogle} />

        {feedback ? (
          <p className="rounded-lg bg-marker-soft p-3 text-sm font-bold leading-5 text-text" role="alert">
            {feedback}
          </p>
        ) : null}
      </div>
    </form>
  );
}

function UsernameAvailabilityMessage({
  message,
  status
}: {
  message: string;
  status: "idle" | "invalid" | "checking" | "available" | "taken" | "error";
}) {
  if (!message) {
    return null;
  }

  const tone =
    status === "available"
      ? "text-primary-strong"
      : status === "checking"
        ? "text-muted"
        : "text-error";

  return (
    <span className={`flex items-center gap-2 text-xs font-bold ${tone}`}>
      {status === "checking" ? <Loader2 className="animate-spin" size={14} /> : status === "available" ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
      {message}
    </span>
  );
}
