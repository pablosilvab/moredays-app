import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function NotFound() {
  const t = await getTranslations("notFound");

  return (
    <div className="grid gap-3 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
      <p className="text-muted-foreground">{t("body")}</p>
      <Link href="/" className="text-primary underline-offset-4 hover:underline">
        {t("back")}
      </Link>
    </div>
  );
}
