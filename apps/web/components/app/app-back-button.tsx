"use client";

import { ChevronLeft } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { canUseRouterBack, resolveAppBackFallback } from "../../lib/navigation";
import { Button } from "../ui/button";

export function AppBackButton() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/app") {
    return null;
  }

  return (
    <Button
      aria-label="Voltar"
      className="h-10 min-h-10 w-10 shrink-0 rounded-xl px-0 md:hidden"
      onClick={() => {
        if (canUseRouterBack(window.history.state)) {
          router.back();
          return;
        }

        router.push(resolveAppBackFallback(pathname));
      }}
      title="Voltar"
      type="button"
      variant="secondary"
    >
      <ChevronLeft size={21} strokeWidth={2.4} />
    </Button>
  );
}
