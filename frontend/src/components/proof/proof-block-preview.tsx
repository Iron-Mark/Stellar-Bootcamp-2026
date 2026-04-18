import Link from "next/link";
import { Badge } from "@/components/ui";
import styles from "./proof-block-preview.module.css";

export interface ProofBlockPreviewProps {
  hash?: string;
}

export function ProofBlockPreview({ hash }: ProofBlockPreviewProps) {
  return (
    <div className={styles.card}>
      <Badge tone="accent">Proof Block</Badge>
      <h2 className={styles.title}>Share your verified demo</h2>
      <p className={styles.muted}>
        Publishing the proof card converts your submission into distribution.
      </p>
      {hash ? (
        <Link href={`/proof/${hash}`} className={styles.openLink}>
          Open public Proof Block
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            aria-hidden="true"
            focusable="false"
          >
            <path
              d="M2 7h10M7 2l5 5-5 5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      ) : (
        <span className={styles.disabledBtn} aria-disabled="true">
          <svg
            width="13"
            height="13"
            viewBox="0 0 13 13"
            fill="none"
            aria-hidden="true"
            focusable="false"
          >
            <rect
              x="2"
              y="5.5"
              width="9"
              height="7"
              rx="1.5"
              stroke="currentColor"
              strokeWidth="1.25"
            />
            <path
              d="M4 5.5V3.5a2.5 2.5 0 0 1 5 0v2"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeLinecap="round"
            />
          </svg>
          Proof Block unlocks after registration
        </span>
      )}
    </div>
  );
}

export default ProofBlockPreview;
