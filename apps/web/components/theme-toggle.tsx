"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Monitor, Sun } from "lucide-react";
import { useTranslations } from "../i18n/provider";
import { Button } from "./ui/button";

const themeItems = [
  { value: "light", icon: Sun },
  { value: "dark", icon: Moon },
  { value: "system", icon: Monitor }
] as const;

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { setTheme, theme: activeTheme } = useTheme();
  const t = useTranslations("navigation");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex gap-2">
      {themeItems.map((themeItem) => {
        const Icon = themeItem.icon;
        const active = mounted && activeTheme === themeItem.value;
        const label = t(themeItem.value === "system" ? "auto" : themeItem.value);

        return (
          <Button
            key={themeItem.value}
            type="button"
            variant={active ? "primary" : "secondary"}
            className={compact ? "min-h-9 px-3 text-xs" : "min-w-20"}
            onClick={() => setTheme(themeItem.value)}
            title={label}
          >
            <Icon size={compact ? 15 : 16} />
            {compact ? null : label}
          </Button>
        );
      })}
    </div>
  );
}
