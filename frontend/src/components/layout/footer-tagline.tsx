"use client";

import { useLocale } from "@/hooks/use-locale";
import { i18n } from "@/lib/i18n";

export function FooterTagline() {
  const locale = useLocale();
  return <p>{i18n[locale].footer.tagline}</p>;
}
