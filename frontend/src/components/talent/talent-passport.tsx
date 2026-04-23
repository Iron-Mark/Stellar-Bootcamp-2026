import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/ui/copy-button";
import { shortenAddress } from "@/lib/format";
import type { IssuerRecord } from "@/lib/types";
import type { CertificateRecord } from "@/lib/contract-read-server";

interface TalentPassportProps {
  address: string;
  issuer: IssuerRecord | null;
  credentials: { hash: string; cert: CertificateRecord }[];
}

function statusTone(status: string): "success" | "warning" | "danger" | "neutral" {
  switch (status) {
    case "verified":
      return "success";
    case "revoked":
      return "danger";
    case "suspended":
    case "expired":
      return "warning";
    default:
      return "neutral";
  }
}

export function TalentPassport({
  address,
  issuer,
  credentials,
}: TalentPassportProps) {
  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-border bg-surface p-6">
        <p className="text-xs uppercase tracking-[0.16em] text-text-muted">
          Candidate passport
        </p>
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          <code className="font-mono text-sm text-text">
            {shortenAddress(address, 10)}
          </code>
          <CopyButton value={address} ariaLabel="Copy candidate address" />
        </div>
        {issuer ? (
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <span className="text-sm text-text-muted">Issuer:</span>
            <span className="text-sm font-semibold text-text">{issuer.name}</span>
            <Badge
              tone={issuer.status === "approved" ? "success" : "warning"}
              dot
            >
              {issuer.status}
            </Badge>
          </div>
        ) : null}
      </section>

      <section className="rounded-2xl border border-border bg-surface p-6">
        <h2 className="text-xl font-semibold text-text mb-4">Credentials</h2>
        {credentials.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border/60 bg-bg/50 px-6 py-8 text-center">
            <p className="text-sm text-text-muted max-w-[42ch] leading-relaxed">
              No credentials are linked to this passport yet.
              Credentials appear here once an approved issuer registers them on-chain for this address.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {credentials.map(({ hash, cert }) => (
              <a
                key={hash}
                href={`/proof/${hash}`}
                className="rounded-xl border border-border bg-bg p-4 no-underline hover:border-primary/50 transition-colors flex items-center justify-between gap-3"
              >
                <div>
                  <p className="text-sm font-semibold text-text">
                    {cert.title || "Untitled"}
                  </p>
                  <p className="text-xs text-text-muted mt-1">{cert.cohort}</p>
                </div>
                <Badge tone={statusTone(cert.status)} dot>
                  {cert.status}
                </Badge>
              </a>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
