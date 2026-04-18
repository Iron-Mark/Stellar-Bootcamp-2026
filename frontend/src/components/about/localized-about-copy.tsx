"use client";

import { useLocale } from "@/hooks/use-locale";
import { i18n } from "@/lib/i18n";

type AboutKey = keyof typeof i18n.en.about;

interface LocalizedAboutCopyProps {
  id: AboutKey;
  className?: string;
}

export function LocalizedAboutCopy({ id, className }: LocalizedAboutCopyProps) {
  const locale = useLocale();
  return <p className={className}>{i18n[locale].about[id]}</p>;
}
