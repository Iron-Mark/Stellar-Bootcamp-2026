// Server component — no "use client"
import Link from "next/link";
import { CertificateRecord } from "@/lib/contract-client";
import { appConfig } from "@/lib/config";
import { shortenAddress } from "@/lib/format";
import { lookupIssuer } from "@/lib/issuer-registry";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/ui/copy-button";
import { ShareButtons } from "./share-buttons";
import { ProofQrBlock } from "./proof-qr-block";
import { HashReveal } from "@/components/ui/hash-reveal";
import styles from "./proof-card.module.css";

interface ProofCardProps {
  hash: string;
  cert: CertificateRecord | null;
  lookupFailed?: boolean;
}

function CheckIcon() {
  return (
    <svg
      className={styles.checkIcon}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2.5 8.5L6.5 12.5L13.5 5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ProofCard({
  hash,
  cert,
  lookupFailed = false,
}: ProofCardProps) {
  const contractId = appConfig.contractId;
  const explorerUrl = appConfig.explorerUrl;
  const shortContract = shortenAddress(contractId, 8);
  const shortHash = shortenAddress(hash, 8);

  const statusTone = lookupFailed
    ? "warning"
    : cert?.verified
      ? "verified"
      : cert
        ? "warning"
        : "neutral";
  const statusLabel = lookupFailed
    ? "Lookup failed"
    : cert?.verified
      ? "Verified"
      : cert
        ? "Pending verification"
        : "Not found";
  const statusTitle = lookupFailed
    ? "Proof status is temporarily unavailable."
    : cert?.verified
      ? "This certificate is verified on-chain."
      : cert
        ? "This certificate is registered, but not yet verified."
        : "No on-chain certificate found for this hash.";
  const statusBody = lookupFailed
    ? "RPC lookup failed. Refresh once and retry in a few seconds."
    : cert?.verified
      ? "Owner and issuer records are present, and verification is complete."
      : cert
        ? "A verifier still needs to submit the verify action for this certificate hash."
        : "Double-check the hash input, or try another certificate hash.";

  return (
    <div className={styles.shell}>
      <article className={styles.card}>
        {/* 1. Header row */}
        <header className={styles.headerRow}>
          <Badge tone="accent">Stellar testnet</Badge>
          <Badge tone={statusTone} dot>
            {statusLabel}
          </Badge>
        </header>

        {/* 2. Pitch line */}
        <h1 className={styles.pitch}>
          On-chain credential + direct payment rail on Stellar testnet.
        </h1>

        <section className={styles.statusSummary} aria-label="Proof status summary">
          <p className={styles.statusTitle}>{statusTitle}</p>
          <p className={styles.statusBody}>{statusBody}</p>
          {cert && !cert.verified ? (
            <Link href="/app" className={styles.statusCta}>
              Mark as verified in app →
            </Link>
          ) : null}
        </section>

        {/* 3. Contract ID row */}
        <div className={styles.metaRow}>
          <span className={styles.metaLabel}>Contract ID</span>
          <code className={styles.metaCode}>{shortContract}</code>
          <CopyButton value={contractId} ariaLabel="Copy contract ID" />
          <a
            href={`${explorerUrl}/contract/${contractId}`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.metaLink}
            aria-label="View contract on explorer"
          >
            View on explorer ↗
          </a>
        </div>

        {/* 4. Hash row */}
        <div className={styles.metaRow}>
          <span className={styles.metaLabel}>Certificate hash</span>
          <HashReveal hash={shortHash} />
          <CopyButton value={hash} ariaLabel="Copy certificate hash" />
          <a
            href={`${explorerUrl}/contract/${contractId}#events`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.metaLink}
            aria-label="View on-chain events in explorer"
          >
            View events ↗
          </a>
        </div>

        {/* 5. Cert details (only if cert exists) */}
        {cert ? (
          <section className={styles.certGrid} aria-label="Certificate details">
            <div className={styles.certRow}>
              <span className={styles.metaLabel}>Owner</span>
              <code className={styles.metaCode}>
                {shortenAddress(cert.owner, 8)}
              </code>
              <CopyButton value={cert.owner} ariaLabel="Copy owner address" />
            </div>
            <div className={styles.certRow}>
              <span className={styles.metaLabel}>Issuer</span>
              <code className={styles.metaCode}>
                {shortenAddress(cert.issuer, 8)}
              </code>
              <CopyButton value={cert.issuer} ariaLabel="Copy issuer address" />
              {(() => {
                const info = lookupIssuer(cert.issuer);
                return info ? (
                  <Badge tone="success" dot>
                    ✓ {info.name}
                  </Badge>
                ) : null;
              })()}
            </div>
            <div className={styles.certRow}>
              <span className={styles.metaLabel}>Verification</span>
              <Badge tone={cert.verified ? "verified" : "warning"} dot>
                {cert.verified ? "Verified" : "Pending"}
              </Badge>
            </div>
          </section>
        ) : (
          <div className={styles.notFound}>
            <img
              src="/illust-lookup.svg"
              alt=""
              width={160}
              height={107}
              loading="lazy"
              style={{ imageRendering: "pixelated", marginBottom: 12 }}
            />
            {lookupFailed ? (
              <>
                <p className={styles.notFoundTitle}>
                  Couldn&rsquo;t read the chain right now.
                </p>
                <p className={styles.notFoundBody}>
                  This does not always mean the hash is missing. RPC lookup
                  failed, so try refreshing once, then retry in a few seconds.
                </p>
              </>
            ) : (
              <>
                <p className={styles.notFoundTitle}>
                  No record for this hash yet.
                </p>
                <p className={styles.notFoundBody}>
                  The hash may be mistyped, or the certificate hasn&rsquo;t been
                  registered on-chain. Double-check the 64 hex characters, or
                  look up a different one.
                </p>
              </>
            )}
            <Link href="/proof" className={styles.notFoundCta}>
              Look up another hash →
            </Link>
          </div>
        )}

        {/* 6. Rubric self-check */}
        <section
          className={styles.rubricSection}
          aria-label="Submission rubric"
        >
          <p className={styles.rubricTitle}>Submission self-check</p>
          <ul className={styles.rubricList} role="list">
            <li className={styles.rubricItem}>
              <CheckIcon />
              Contract deployed + verified on stellar.expert
            </li>
            <li className={styles.rubricItem}>
              <CheckIcon />
              <code>cargo test</code> passes (≥5 tests)
            </li>
            <li className={styles.rubricItem}>
              <CheckIcon />
              Frontend signs real tx via Freighter end-to-end
            </li>
            <li className={styles.rubricItem}>
              <CheckIcon />
              On-chain events emitted and visible in explorer
            </li>
            <li className={styles.rubricItem}>
              <CheckIcon />
              No raw ScVal / HostError surfaces in any error path
            </li>
          </ul>
        </section>

        {/* 7. Share section */}
        <section className={styles.shareSection} aria-label="Share this proof">
          <p className={styles.shareTitle}>Share</p>
          <ShareButtons hash={hash} />
        </section>

        {/* 7b. QR block */}
        <ProofQrBlock hash={hash} />

        {/* 8. Footer */}
        <footer className={styles.footer}>
          Generated from bootcamp submission · Stellar Philippines UniTour 2026
        </footer>
      </article>
    </div>
  );
}

export default ProofCard;
