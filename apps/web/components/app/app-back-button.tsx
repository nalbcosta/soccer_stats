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
      className="flex rounded-xl px-2.5 md:hidden"
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
      <ChevronLeft size={18} strokeWidth={2.4} />
    </Button>
  );
}
