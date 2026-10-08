import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { pageMetadata } from "@/lib/seo";
import type { AppLocale } from "@/lib/types";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "meta" });
  return pageMetadata({
    locale: locale as AppLocale,
    title: t("aboutTitle"),
    description: t("aboutDescription"),
    path: "/about",
  });
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "about" });
  const nav = await getTranslations({ locale, namespace: "nav" });
  const calculator = await getTranslations({ locale, namespace: "calculator" });

  return (
    <div className="grid gap-8">
      <h1 className="text-3xl font-semibold tracking-tight">{nav("about")}</h1>
      <div className="grid gap-4 text-lg leading-relaxed text-muted-foreground">
        <p>{t("p1")}</p>
        <p>{t("p2")}</p>
        <p>{t("p3")}</p>
      </div>
      <Link href="/calculadora" className={buttonVariants({ size: "lg", className: "w-fit" })}>
        {calculator("submit")}
      </Link>
    </div>
  );
}
