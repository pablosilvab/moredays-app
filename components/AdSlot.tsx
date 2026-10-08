"use client";

import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { adsenseClient } from "@/lib/site";

type SlotName = "leaderboard" | "rectangle" | "footer";

const slotEnv: Record<SlotName, string | undefined> = {
  leaderboard: process.env.NEXT_PUBLIC_ADSENSE_SLOT_LEADERBOARD,
  rectangle: process.env.NEXT_PUBLIC_ADSENSE_SLOT_RECTANGLE,
  footer: process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER,
};

const minHeight: Record<SlotName, string> = {
  leaderboard: "min-h-24",
  rectangle: "min-h-64",
  footer: "min-h-24",
};

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export function AdSlot({ slot }: { slot: SlotName }) {
  const t = useTranslations("ads");
  const client = adsenseClient;
  const slotId = slotEnv[slot];

  useEffect(() => {
    if (!client || !slotId) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // El script de AdSense puede no estar listo en el primer render.
    }
  }, [client, slotId]);

  if (!client) {
    if (process.env.NODE_ENV === "production") return null;
    return (
      <div
        className={`flex items-center justify-center rounded-xl border border-dashed border-border text-xs text-muted-foreground ${minHeight[slot]}`}
      >
        {t("placeholder")}
      </div>
    );
  }

  if (!slotId) return null;

  return (
    <ins
      className={`adsbygoogle block ${minHeight[slot]}`}
      data-ad-client={client}
      data-ad-slot={slotId}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}
