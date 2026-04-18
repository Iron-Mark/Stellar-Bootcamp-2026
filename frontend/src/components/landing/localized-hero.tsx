// frontend/src/components/landing/localized-hero.tsx
"use client";

import Link from "next/link";
import styles from "@/app/page.module.css";
import { DEFAULT_SAMPLE_PROOF_HASH } from "@/lib/demo-data";
import { useLocale } from "@/hooks/use-locale";
import { i18n } from "@/lib/i18n";

export function LocalizedHero() {
  const locale = useLocale();
  const t = i18n[locale].hero;

  return (
    <section className={styles.hero}>
      <span className={styles.eyebrow}>{t.eyebrow}</span>
      <h1 className={styles.h1}>
        {t.h1a}
        <br />
        <em>{t.h1b}</em>
      </h1>
      <p className={styles.lede}>{t.lede}</p>
      <div className={styles.ctaRow}>
        <Link href="/app" className={styles.ctaPrimary}>
          {t.ctaPrimary}
        </Link>
        <Link href={`/proof/${DEFAULT_SAMPLE_PROOF_HASH}`} className={styles.ctaGhost}>
          {t.ctaGhost}
        </Link>
      </div>
      <img
        src="/illust-hero.svg"
        alt="Register, verify, and pay flow"
        width={560}
        height={187}
        style={{
          display: "block",
          maxWidth: "100%",
          height: "auto",
          margin: "48px auto 0",
          imageRendering: "pixelated",
        }}
      />
    </section>
  );
}

export default LocalizedHero;
