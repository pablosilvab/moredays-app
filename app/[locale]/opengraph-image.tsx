import { ImageResponse } from "next/og";
import { locale as rootLocale } from "next/root-params";
import type { AppLocale } from "@/lib/types";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const tagline: Record<AppLocale, string> = {
  es: "Más días libres, las mismas vacaciones.",
  en: "More days off, same vacation.",
  pt: "Mais dias livres, as mesmas férias.",
};

export default async function OpenGraphImage() {
  const value = (await rootLocale()) as AppLocale;
  const line = tagline[value] ?? tagline.es;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "#0f1020",
          color: "#f8fafc",
        }}
      >
        <div style={{ display: "flex", fontSize: 84, fontWeight: 700 }}>
          <span>More</span>
          <span style={{ color: "#F59E0B" }}>+</span>
          <span>Days</span>
        </div>
        <div style={{ marginTop: 24, fontSize: 36, color: "#c4c6d4" }}>{line}</div>
      </div>
    ),
    size,
  );
}
