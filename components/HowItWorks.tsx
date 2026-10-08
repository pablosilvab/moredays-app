import { getTranslations } from "next-intl/server";
import type { AppLocale } from "@/lib/types";

export async function HowItWorks({ locale }: { locale: AppLocale }) {
  const t = await getTranslations({ locale, namespace: "how" });
  const steps = [
    { title: t("step1Title"), body: t("step1Body") },
    { title: t("step2Title"), body: t("step2Body") },
    { title: t("step3Title"), body: t("step3Body") },
  ];

  return (
    <section className="grid gap-4">
      <h2 className="text-xl font-semibold tracking-tight">{t("title")}</h2>
      <ol className="grid gap-3 md:grid-cols-3">
        {steps.map((step, index) => (
          <li key={step.title} className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
            <p className="text-sm font-medium text-primary">{index + 1}</p>
            <h3 className="mt-1 font-medium">{step.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{step.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
