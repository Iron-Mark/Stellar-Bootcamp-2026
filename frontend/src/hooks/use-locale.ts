"use client";

import { useEffect, useState } from "react";
import {
  LOCALE_CHANGE_EVENT,
  LOCALE_STORAGE_KEY,
  type Locale,
} from "@/components/layout/locale-toggle";

export function useLocale(): Locale {
  const [locale, setLocale] = useState<Locale>("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCALE_STORAGE_KEY) as Locale | null;
      if (saved === "en" || saved === "tl") setLocale(saved);
    } catch {
      // SSR or storage denied — stay on default
    }

    function onChange(e: Event) {
      const next = (e as CustomEvent<Locale>).detail;
      if (next === "en" || next === "tl") setLocale(next);
    }

    window.addEventListener(LOCALE_CHANGE_EVENT, onChange);
    return () => window.removeEventListener(LOCALE_CHANGE_EVENT, onChange);
  }, []);

  return locale;
}
