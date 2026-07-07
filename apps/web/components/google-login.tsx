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
        text: "continue_with",
        width: "320"
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
      <Button type="button" variant="secondary" disabled className="w-full rounded-xl">
        <GoogleMark />
        {dictionary.google}
      </Button>
    );
  }

  return <div className={available ? "w-full overflow-hidden rounded-xl [&>div]:!w-full" : "w-full"} ref={ref} />;
}

function GoogleMark() {
  return (
    <svg aria-hidden="true" className="h-[18px] w-[18px]" viewBox="0 0 24 24">
      <path
        d="M21.8 12.23c0-.76-.07-1.49-.2-2.18H12v4.13h5.49a4.7 4.7 0 0 1-2.04 3.08v2.56h3.3c1.93-1.78 3.05-4.4 3.05-7.59Z"
        fill="#4285F4"
      />
      <path
        d="M12 22c2.75 0 5.05-.91 6.74-2.46l-3.3-2.56c-.91.61-2.08.98-3.44.98-2.64 0-4.88-1.78-5.68-4.17H2.9v2.64A10 10 0 0 0 12 22Z"
        fill="#34A853"
      />
      <path
        d="M6.32 13.79A5.99 5.99 0 0 1 6 12c0-.62.11-1.22.32-1.79V7.57H2.9A10 10 0 0 0 2 12c0 1.6.38 3.11 1.05 4.43l3.27-2.64Z"
        fill="#FBBC05"
      />
      <path
        d="M12 6.04c1.5 0 2.84.52 3.9 1.53l2.93-2.93C17.05 2.98 14.75 2 12 2A10 10 0 0 0 2.9 7.57l3.42 2.64c.8-2.39 3.04-4.17 5.68-4.17Z"
        fill="#EA4335"
      />
    </svg>
  );
}
