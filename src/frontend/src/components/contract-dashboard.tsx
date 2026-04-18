"use client";

import { useState } from "react";
import { useFreighterWallet } from "@/hooks/use-freighter-wallet";
import { checkMembership, transferAmount } from "@/lib/contract-client";
import { parseAmountToInt } from "@/lib/format";
import { shortenAddress } from "@/lib/format";
import { appConfig, hasRequiredConfig } from "@/lib/config";
import type { TxFeedback } from "@/lib/types";

export function ContractDashboard() {
  const { wallet, connectWallet, disconnectWallet } = useFreighterWallet();
  const [txFeedback, setTxFeedback] = useState<TxFeedback>({ state: "idle", title: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [recordId, setRecordId] = useState("1");
  const [amount, setAmount] = useState("1");
  const [membershipResult, setMembershipResult] = useState<string | null>(null);

  const configured = hasRequiredConfig();

  const actionsBlocked =
    !configured ||
    isSubmitting ||
    wallet.status !== "connected" ||
    !wallet.address ||
    !wallet.isExpectedNetwork;

  async function handleCheckMembership() {
    if (!wallet.address) return;
    setMembershipResult(null);
    try {
      const id = Number(recordId);
      const result = await checkMembership(id, wallet.address);
      setMembershipResult(result ? "You are a member." : "You are NOT a member.");
    } catch (error) {
      setMembershipResult(error instanceof Error ? error.message : "Error");
    }
  }

  async function handleTransfer() {
    if (!wallet.address) return;
    setIsSubmitting(true);
    setTxFeedback({ state: "signing", title: "Awaiting signature in Freighter..." });

    try {
      const parsedAmount = parseAmountToInt(amount, appConfig.assetDecimals);
      const id = Number(recordId);
      const result = await transferAmount(wallet.address, id, parsedAmount);

      setTxFeedback({
        state: "success",
        title: "Transaction confirmed",
        hash: result?.hash,
      });
    } catch (error) {
      setTxFeedback({
        state: "error",
        title: "Transaction failed",
        detail: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={{ margin: 0 }}>Stellar + Freighter Demo</h1>
        <p style={styles.subtle}>
          Network: <code>{appConfig.network}</code> — Asset:{" "}
          <code>{appConfig.assetCode}</code>
        </p>
      </header>

      <section style={styles.card}>
        <h2>Wallet</h2>
        <p>
          Status: <strong>{wallet.status}</strong>
        </p>
        <p>Address: {shortenAddress(wallet.address)}</p>
        {wallet.network && (
          <p>
            Freighter network: <code>{wallet.network}</code>
          </p>
        )}
        {wallet.error && <p style={styles.error}>{wallet.error}</p>}

        {wallet.status !== "connected" ? (
          <button
            onClick={connectWallet}
            disabled={wallet.status === "connecting"}
            style={styles.button}
          >
            {wallet.status === "connecting" ? "Connecting..." : "Connect Freighter"}
          </button>
        ) : (
          <button onClick={disconnectWallet} style={styles.button}>
            Disconnect
          </button>
        )}

        {wallet.status === "connected" && !wallet.isExpectedNetwork && (
          <p style={styles.warn}>
            Switch Freighter to {appConfig.network} to use this app.
          </p>
        )}
      </section>

      {!configured && (
        <section style={{ ...styles.card, ...styles.warnCard }}>
          <strong>Contract not configured.</strong> Copy <code>.env.example</code> to{" "}
          <code>.env.local</code> and set{" "}
          <code>NEXT_PUBLIC_SOROBAN_CONTRACT_ID</code> and{" "}
          <code>NEXT_PUBLIC_STELLAR_READ_ADDRESS</code> before invoking the contract.
        </section>
      )}

      <section style={styles.card}>
        <h2>Example Read — is_member</h2>
        <label style={styles.label}>
          Record ID
          <input
            value={recordId}
            onChange={(e) => setRecordId(e.target.value)}
            style={styles.input}
          />
        </label>
        <button
          onClick={handleCheckMembership}
          disabled={actionsBlocked}
          style={styles.button}
        >
          Check Membership
        </button>
        {membershipResult && <p>{membershipResult}</p>}
      </section>

      <section style={styles.card}>
        <h2>Example Write — transfer</h2>
        <label style={styles.label}>
          Record ID
          <input
            value={recordId}
            onChange={(e) => setRecordId(e.target.value)}
            style={styles.input}
          />
        </label>
        <label style={styles.label}>
          Amount ({appConfig.assetCode})
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={styles.input}
          />
        </label>
        <button onClick={handleTransfer} disabled={actionsBlocked} style={styles.button}>
          {isSubmitting ? "Submitting..." : "Transfer"}
        </button>

        {txFeedback.state !== "idle" && (
          <div style={styles.feedback}>
            <strong>{txFeedback.title}</strong>
            {txFeedback.detail && <p>{txFeedback.detail}</p>}
            {txFeedback.hash && (
              <p>
                <a
                  href={`${appConfig.explorerUrl}/tx/${txFeedback.hash}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  View on explorer
                </a>
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: 720, margin: "0 auto", padding: 24, fontFamily: "system-ui" },
  header: { marginBottom: 24 },
  subtle: { color: "#666", fontSize: 14 },
  card: {
    border: "1px solid #ddd",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    background: "#fff",
  },
  warnCard: { background: "#fff8e1", borderColor: "#f5c84c" },
  label: { display: "block", marginBottom: 8, fontSize: 14 },
  input: {
    display: "block",
    width: "100%",
    padding: 8,
    marginTop: 4,
    border: "1px solid #ccc",
    borderRadius: 4,
  },
  button: {
    padding: "8px 16px",
    borderRadius: 4,
    border: "1px solid #333",
    background: "#111",
    color: "#fff",
    cursor: "pointer",
  },
  warn: { color: "#b26a00" },
  error: { color: "#c00" },
  feedback: {
    marginTop: 12,
    padding: 12,
    background: "#f5f5f5",
    borderRadius: 4,
  },
};
