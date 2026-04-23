import { getRecentEvents } from "@/lib/events";
import { appConfig } from "@/lib/config";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Metrics",
  description: "On-chain activity metrics for Stellaroid Earn",
};

export const revalidate = 30;

type KindCount = Record<string, number>;

export default async function MetricsPage() {
  let events: Awaited<ReturnType<typeof getRecentEvents>> = [];
  let error: string | null = null;

  try {
    events = await getRecentEvents(appConfig.contractId, 40);
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load events";
  }

  const byKind = events.reduce<KindCount>((acc, e) => {
    acc[e.kind] = (acc[e.kind] ?? 0) + 1;
    return acc;
  }, {});

  const uniqueProofs = new Set(
    events.filter((e) => e.hashHex).map((e) => e.hashHex),
  ).size;

  const uniqueTxHashes = new Set(events.map((e) => e.txHash)).size;

  const cards = [
    { label: "Total Events", value: events.length },
    { label: "Unique Proofs", value: uniqueProofs },
    { label: "Transactions", value: uniqueTxHashes },
    { label: "Certificates Registered", value: byKind["cert_reg"] ?? 0 },
    { label: "Certificates Verified", value: byKind["cert_ver"] ?? 0 },
    { label: "Rewards Sent", value: byKind["reward"] ?? 0 },
    { label: "Payments Linked", value: byKind["payment"] ?? 0 },
  ];

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="font-heading text-2xl font-bold text-white mb-2">
        On-Chain Metrics
      </h1>
      <p className="text-sm text-neutral-400 mb-8">
        Live activity from contract{" "}
        <a
          href={`${appConfig.explorerUrl}/contract/${appConfig.contractId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-amber-400 hover:underline"
        >
          {appConfig.contractId.slice(0, 8)}…
          {appConfig.contractId.slice(-4)}
        </a>{" "}
        on Stellar testnet. Refreshes every 30 seconds.
      </p>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 mb-8 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 mb-12">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-neutral-700 bg-neutral-900 p-4"
          >
            <p className="text-xs text-neutral-400 uppercase tracking-wider mb-1">
              {card.label}
            </p>
            <p className="font-heading text-2xl font-bold text-white">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <h2 className="font-heading text-lg font-semibold text-white mb-4">
        Recent Activity
      </h2>

      {events.length === 0 && !error && (
        <p className="text-sm text-neutral-500">No events recorded yet.</p>
      )}

      <div className="space-y-2">
        {events.map((event) => (
          <a
            key={event.id}
            href={`${appConfig.explorerUrl}/tx/${event.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-900/50 px-4 py-3 text-sm hover:border-neutral-600 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span
                className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                  event.kind === "cert_ver"
                    ? "bg-emerald-500/20 text-emerald-400"
                    : event.kind === "payment" || event.kind === "reward"
                      ? "bg-amber-500/20 text-amber-400"
                      : "bg-blue-500/20 text-blue-400"
                }`}
              >
                {event.label}
              </span>
              <span className="text-neutral-300">{event.detail}</span>
            </div>
            <span className="text-xs text-neutral-500 shrink-0 ml-4">
              {new Date(event.ledgerClosedAt).toLocaleDateString()}
            </span>
          </a>
        ))}
      </div>
    </main>
  );
}
