"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const order = ["system", "light", "dark"] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const t = useTranslations("nav");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const current = order.includes(theme as (typeof order)[number])
    ? (theme as (typeof order)[number])
    : "system";
  const next = order[(order.indexOf(current) + 1) % order.length];
  const Icon = !mounted ? Monitor : current === "light" ? Sun : current === "dark" ? Moon : Monitor;

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      aria-label={mounted ? `${t("theme")}: ${current}` : t("theme")}
      onClick={() => setTheme(next)}
    >
      <Icon />
    </Button>
  );
}
