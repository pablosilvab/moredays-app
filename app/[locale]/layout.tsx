import type { Metadata } from "next";
import "../globals.css";
import { Inter } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import Script from "next/script";
import { Providers } from "@/components/Providers";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { htmlLang, routing } from "@/i18n/routing";
import { languageAlternates } from "@/lib/seo";
import { siteUrl } from "@/lib/site";
import type { AppLocale } from "@/lib/types";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const current = hasLocale(routing.locales, locale) ? (locale as AppLocale) : routing.defaultLocale;
  const t = await getTranslations({ locale: current, namespace: "meta" });

  return {
    metadataBase: new URL(siteUrl),
    title: { default: t("homeTitle"), template: "%s" },
    description: t("homeDescription"),
    alternates: { languages: languageAlternates(() => "/") },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);
  const messages = await getMessages();
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID;
  const safeAdsense = adsenseId && /^ca-pub-\d+$/.test(adsenseId) ? adsenseId : null;

  return (
    <html
      lang={htmlLang[locale as AppLocale]}
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col bg-background font-sans text-foreground">
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <SiteHeader />
            <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">{children}</main>
            <SiteFooter />
          </Providers>
        </NextIntlClientProvider>
        {safeAdsense ? (
          <Script
            id="adsense"
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${safeAdsense}`}
            strategy="afterInteractive"
            crossOrigin="anonymous"
          />
        ) : null}
      </body>
    </html>
  );
}
