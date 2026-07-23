"use client";

import Link from "next/link";
import { CheckCircle2, Cookie, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { useTranslations } from "../../i18n/provider";

export const LEGAL_CONSENT_STORAGE_KEY = "nabola-legal-consent";
export const LEGAL_CONSENT_COOKIE = "nabola-legal-consent";

type ConsentState = "checking" | "pending" | "accepted" | "dismissed";

function saveConsent() {
  window.localStorage.setItem(LEGAL_CONSENT_STORAGE_KEY, "accepted");
  document.cookie = `${LEGAL_CONSENT_COOKIE}=accepted; path=/; max-age=31536000; samesite=lax`;
}

export function CookieConsentToast() {
  const [state, setState] = useState<ConsentState>("checking");
  const t = useTranslations("legal");
  const common = useTranslations("common");

  useEffect(() => {
    setState(window.localStorage.getItem(LEGAL_CONSENT_STORAGE_KEY) === "accepted" ? "dismissed" : "pending");

    const handleAccepted = () => {
      setState("accepted");
      window.setTimeout(() => setState("dismissed"), 3600);
    };

    window.addEventListener("nabola:legal-consent-accepted", handleAccepted);
    return () => window.removeEventListener("nabola:legal-consent-accepted", handleAccepted);
  }, []);

  const accept = () => {
    saveConsent();
    setState("accepted");
    window.setTimeout(() => setState("dismissed"), 3600);
  };

  if (state === "checking" || state === "dismissed") {
    return null;
  }

  if (state === "accepted") {
    return (
      <div className="fixed inset-x-3 bottom-4 z-[70] md:left-auto md:right-5 md:w-[390px]" role="status">
        <div className="flex items-start gap-3 rounded-lg border border-success-soft bg-surface p-4 text-sm shadow-panel">
          <CheckCircle2 className="mt-0.5 shrink-0 text-success" size={19} />
          <div className="min-w-0 flex-1">
            <p className="font-black text-text">{t("acceptedTitle")}</p>
            <p className="mt-1 font-semibold leading-5 text-muted">{t("acceptedDescription")}</p>
          </div>
          <button className="text-muted transition hover:text-text" type="button" onClick={() => setState("dismissed")} aria-label={common("close")}>
            <X size={17} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-x-3 bottom-4 z-[70] md:left-auto md:right-5 md:w-[420px]" role="dialog" aria-label={t("consentTitle")}>
      <div className="rounded-lg border border-border bg-surface p-4 shadow-panel">
        <div className="flex items-start gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary-strong">
            <Cookie size={18} />
          </div>
          <div className="min-w-0">
            <p className="font-black text-text">{t("consentTitle")}</p>
            <p className="mt-1 text-sm font-semibold leading-5 text-muted">
              {t("consentDescription")} <Link className="text-primary-strong underline underline-offset-2" href="/termos">{t("termsTitle").toLowerCase()}</Link>.
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button className="w-full sm:w-auto" type="button" variant="ghost" onClick={() => setState("dismissed")}>{t("later")}</Button>
          <Button className="w-full sm:w-auto" type="button" onClick={accept}>{t("accept")}</Button>
        </div>
      </div>
    </div>
  );
}

export function acceptLegalConsent() {
  saveConsent();
  window.dispatchEvent(new Event("nabola:legal-consent-accepted"));
}
