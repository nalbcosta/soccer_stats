"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Monitor, Sun } from "lucide-react";
import { Button } from "./ui/button";

const themeItems = [
  { value: "light", label: "Claro", icon: Sun },
  { value: "dark", label: "Escuro", icon: Moon },
  { value: "system", label: "Auto", icon: Monitor }
] as const;

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex gap-2">
      {themeItems.map((theme) => {
        const Icon = theme.icon;
        const active = mounted && resolvedTheme === theme.value;

        return (
          <Button
            key={theme.value}
            type="button"
            variant={active ? "primary" : "secondary"}
            className={compact ? "min-h-9 px-3 text-xs" : "min-w-20"}
            onClick={() => setTheme(theme.value)}
            title={theme.label}
          >
            <Icon size={compact ? 15 : 16} />
            {compact ? null : theme.label}
          </Button>
        );
      })}
    </div>
  );
}
