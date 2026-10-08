import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { DEFAULT_YEAR } from "@/lib/site";

export function SiteFooter() {
  const t = useTranslations();
  const year = DEFAULT_YEAR;

  return (
    <footer className="mt-12 border-t border-border/80">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground">
        <p className="text-foreground">{t("footer.tagline")}</p>
        <nav className="flex flex-wrap gap-x-4 gap-y-2">
          <Link href={`/feriados/cl/${year}`}>{t("nav.holidays")}</Link>
          <Link href={`/dias-libres/cl/${year}`}>{t("nav.bridges")}</Link>
          <Link href="/about">{t("nav.about")}</Link>
          <Link href="/privacy">{t("nav.privacy")}</Link>
          <Link href="/terms">{t("nav.terms")}</Link>
        </nav>
        <p>{t("footer.rights", { year: 2026 })}</p>
      </div>
    </footer>
  );
}
