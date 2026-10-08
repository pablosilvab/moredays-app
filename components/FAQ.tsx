import { getTranslations } from "next-intl/server";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { JsonLd } from "@/components/JsonLd";
import type { AppLocale } from "@/lib/types";

const keys = ["1", "2", "3", "4", "5", "6"] as const;

export async function FAQ({ locale }: { locale: AppLocale }) {
  const t = await getTranslations({ locale, namespace: "faq" });
  const items = keys.map((key) => ({
    id: key,
    question: t(`q${key}`),
    answer: t(`a${key}`),
  }));

  return (
    <section className="grid gap-3">
      <h2 className="text-xl font-semibold tracking-tight">{t("title")}</h2>
      <Accordion className="rounded-xl bg-card px-4 ring-1 ring-foreground/10">
        {items.map((item) => (
          <AccordionItem key={item.id} value={item.id}>
            <AccordionTrigger>{item.question}</AccordionTrigger>
            <AccordionContent>
              <p>{item.answer}</p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: items.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: { "@type": "Answer", text: item.answer },
          })),
        }}
      />
    </section>
  );
}
