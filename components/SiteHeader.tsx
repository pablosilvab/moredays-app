"use client";

import { Suspense } from "react";
import { useLocale, useTranslations } from "next-intl";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Link, usePathname } from "@/i18n/navigation";
import { DEFAULT_YEAR } from "@/lib/site";
import type { AppLocale } from "@/lib/types";

export function SiteHeader() {
  const t = useTranslations("nav");
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();
  const year = DEFAULT_YEAR;

  function itemClass(href: string) {
    const active = pathname === href || pathname.startsWith(`${href}/`);
    return active
      ? "shrink-0 font-medium text-foreground"
      : "shrink-0 text-foreground/80 hover:text-foreground";
  }

  return (
    <header className="border-b border-border/80 bg-card/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-3">
        <Logo />
        <div className="flex items-center gap-2">
          <Suspense fallback={null}>
            <LocaleSwitcher />
          </Suspense>
          <ThemeToggle />
        </div>
      </div>
      <nav aria-label={t("menu")} className="mx-auto flex w-full max-w-5xl gap-4 overflow-x-auto px-4 pb-3 text-sm">
        <Link href="/calculadora" className={itemClass("/calculadora")} aria-current={pathname === "/calculadora" ? "page" : undefined}>
          {t("calculator")}
        </Link>
        <Link
          href={`/feriados/cl/${year}`}
          className={itemClass(`/feriados/cl/${year}`)}
          hrefLang={locale}
          prefetch
          aria-current={pathname.startsWith("/feriados/") ? "page" : undefined}
        >
          {t("holidays")}
        </Link>
        <Link
          href={`/dias-libres/cl/${year}`}
          className={itemClass(`/dias-libres/cl/${year}`)}
          prefetch
          aria-current={pathname.startsWith("/dias-libres/") ? "page" : undefined}
        >
          {t("bridges")}
        </Link>
        <Link href="/about" className={itemClass("/about")} aria-current={pathname === "/about" ? "page" : undefined}>
          {t("about")}
        </Link>
      </nav>
    </header>
  );
}
