import { appConfig } from "@/lib/config";
import {
  formatRelativeTime,
  getRecentEvents,
  type RecentActivityItem,
} from "@/lib/events";
import styles from "./recent-activity.module.css";

interface RecentActivityProps {
  className?: string;
  compact?: boolean;
  sidebar?: boolean;
}

function toneClass(kind: RecentActivityItem["kind"]) {
  if (kind === "payment" || kind === "reward") return styles.tonePayment;
  if (kind === "cert_ver") return styles.toneVerified;
  if (kind === "cert_reg") return styles.toneRegistered;
  return styles.toneNeutral;
}

export async function RecentActivity({
  className,
  compact = false,
  sidebar = false,
}: RecentActivityProps) {
  const events = await getRecentEvents(appConfig.contractId, compact ? 3 : 5);
  const hasContractLink = Boolean(appConfig.contractId);
  const contractEventsUrl = hasContractLink
    ? `${appConfig.explorerUrl}/contract/${appConfig.contractId}#events`
    : null;

  const cardClass = [
    styles.card,
    compact ? styles.compactCard : "",
    sidebar ? styles.sidebarCard : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const headClass = [
    styles.head,
    compact ? styles.compactHead : "",
    sidebar ? styles.sidebarHead : "",
  ]
    .filter(Boolean)
    .join(" ");

  const eyebrowClass = [
    styles.eyebrow,
    compact ? styles.compactEyebrow : "",
    sidebar ? styles.sidebarEyebrow : "",
  ]
    .filter(Boolean)
    .join(" ");

  const titleClass = [
    styles.title,
    compact ? styles.compactTitle : "",
    sidebar ? styles.sidebarTitle : "",
  ]
    .filter(Boolean)
    .join(" ");

  const viewAllClass = [
    styles.viewAll,
    compact ? styles.compactViewAll : "",
    sidebar ? styles.sidebarViewAll : "",
  ]
    .filter(Boolean)
    .join(" ");

  if (events.length === 0) {
    return (
      <section className={cardClass}>
        <div className={headClass}>
          <div>
            <p className={eyebrowClass}>Live on-chain activity</p>
            <h2 className={titleClass}>Recent contract events</h2>
          </div>
          {contractEventsUrl ? (
            <a
              href={contractEventsUrl}
              target="_blank"
              rel="noreferrer"
              className={viewAllClass}
            >
              View all ↗
            </a>
          ) : null}
        </div>
        <p className={[styles.emptyState, compact ? styles.compactEmptyState : ""].join(" ")}>
          {hasContractLink
            ? "No events yet — complete the demo flow to see live on-chain activity here."
            : "Contract ID not configured yet — add it to enable live on-chain activity."}
        </p>
      </section>
    );
  }

  return (
    <section className={cardClass}>
      <div className={headClass}>
        <div>
          <p className={eyebrowClass}>Live on-chain activity</p>
          <h2 className={titleClass}>Recent contract events</h2>
        </div>
        {contractEventsUrl ? (
          <a
            href={contractEventsUrl}
            target="_blank"
            rel="noreferrer"
            className={viewAllClass}
          >
            View all ↗
          </a>
        ) : null}
      </div>
      <div className={styles.list}>
        {events.map((event) => (
          <a
            key={event.id}
            href={`${appConfig.explorerUrl}/tx/${event.txHash}`}
            target="_blank"
            rel="noreferrer"
            className={[styles.row, compact ? styles.compactRow : ""].join(" ")}
          >
            <span className={`${styles.label} ${toneClass(event.kind)}`}>{event.label}</span>
            <span className={styles.detail}>{event.detail}</span>
            <code className={styles.hash}>
              {event.txHash.slice(0, 10)}…{event.txHash.slice(-6)}
            </code>
            <span className={styles.time}>{formatRelativeTime(event.ledgerClosedAt)}</span>
          </a>
        ))}
      </div>
    </section>
  );
}

export default RecentActivity;
