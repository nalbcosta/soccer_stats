"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { useLocale } from "./locale-provider";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (element: HTMLElement, options: Record<string, string>) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export function GoogleLogin({
  onCredential
}: {
  onCredential: (credential: string) => Promise<void>;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const { dictionary } = useLocale();
  const [available, setAvailable] = useState(false);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId) {
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (!window.google || !ref.current) {
        return;
      }

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => void onCredential(response.credential)
      });
      window.google.accounts.id.renderButton(ref.current, {
        theme: "outline",
        size: "large",
        shape: "pill",
        text: "continue_with"
      });
      setAvailable(true);
    };

    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, [clientId, onCredential]);

  if (!clientId) {
    return (
      <Button type="button" variant="secondary" disabled className="w-full">
        {dictionary.google}
      </Button>
    );
  }

  return <div className={available ? "w-full [&>div]:w-full" : "w-full"} ref={ref} />;
}
