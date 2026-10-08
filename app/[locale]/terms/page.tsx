import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { pageMetadata } from "@/lib/seo";
import type { AppLocale } from "@/lib/types";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "meta" });
  return pageMetadata({
    locale: locale as AppLocale,
    title: t("termsTitle"),
    description: t("termsDescription"),
    path: "/terms",
  });
}

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "terms" });
  const meta = await getTranslations({ locale, namespace: "meta" });

  return (
    <article className="grid max-w-2xl gap-4">
      <h1 className="text-3xl font-semibold tracking-tight">{meta("termsTitle")}</h1>
      <p>{t("p1")}</p>
      <p>{t("p2")}</p>
      <p>{t("p3")}</p>
    </article>
  );
}
