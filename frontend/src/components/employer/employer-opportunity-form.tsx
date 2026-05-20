"use client";

import { useState } from "react";
import { Button, Input, useToast } from "@/components/ui";
import { Badge } from "@/components/ui/badge";
import { useFreighterWallet } from "@/hooks/use-freighter-wallet";
import { appConfig, hasRequiredConfig } from "@/lib/config";
import {
  getCertificate,
  createOpportunity,
  fundOpportunity,
} from "@/lib/contract-client";
import type { CertificateRecord } from "@/lib/contract-client";
import { humanizeError } from "@/lib/errors";
import { isValidDecimalAmount, parseAmountToInt } from "@/lib/format";
import { MAX_OPPORTUNITY_MILESTONES } from "@/lib/types";
import { withTimeout } from "@/lib/with-timeout";
import { ExternalLink } from "lucide-react";

interface EmployerOpportunityFormProps {
  initialHash?: string;
  initialCandidate?: string;
}

export function EmployerOpportunityForm({
  initialHash = "",
  initialCandidate = "",
}: EmployerOpportunityFormProps) {
  const { wallet } = useFreighterWallet();
  const { toast } = useToast();

  const [certHash, setCertHash] = useState(initialHash);
  const [cert, setCert] = useState<CertificateRecord | null>(null);
  const [lookupBusy, setLookupBusy] = useState(false);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [milestones, setMilestones] = useState("1");
  const [submitting, setSubmitting] = useState(false);
  const [createdOppId, setCreatedOppId] = useState<number | null>(null);
  const [opportunityFunded, setOpportunityFunded] = useState(false);
  const [funding, setFunding] = useState(false);

  const walletConnected =
    wallet.status === "connected" && !!wallet.address && wallet.isExpectedNetwork;

  async function handleLookup() {
    if (!certHash.trim()) return;
    setLookupBusy(true);
    setCert(null);
    try {
      const record = await getCertificate(certHash.trim());
      setCert(record);
      if (!record) {
        toast({
          title: "Not found",
          detail: "No certificate on-chain for that hash.",
          tone: "warning",
        });
      }
    } catch (e) {
      const h = humanizeError(e);
      toast({ title: h.title, detail: h.detail, tone: "danger" });
    } finally {
      setLookupBusy(false);
    }
  }

  async function handleCreate() {
    if (!wallet.address || !cert) return;
    setSubmitting(true);
    try {
      const milestoneCount = Number.parseInt(milestones.trim(), 10);
      const result = await withTimeout(
        createOpportunity(
          wallet.address,
          cert.owner,
          certHash.trim(),
          title.trim() || "Paid trial",
          parseAmountToInt(amount, appConfig.assetDecimals),
          milestoneCount,
        ),
        15000,
        "create opportunity",
      );
      const oppId = result?.result as number | undefined;
      if (oppId !== undefined) {
        setCreatedOppId(oppId);
        setOpportunityFunded(false);
      }
      toast({
        title: "Opportunity created",
        detail: `Opportunity ${oppId ?? ""} is in Draft status. Fund it next to start the escrow.`,
        tone: "success",
        action: result?.hash
          ? {
              label: <>View tx <ExternalLink className="inline w-3 h-3 ml-1" /></>,
              href: `${appConfig.explorerUrl}/tx/${result.hash}`,
            }
          : undefined,
      });
    } catch (e) {
      const h = humanizeError(e);
      toast({ title: h.title, detail: h.detail, tone: "danger" });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleFund() {
    if (!wallet.address || createdOppId === null) return;
    setFunding(true);
    try {
      const result = await withTimeout(
        fundOpportunity(wallet.address, createdOppId),
        15000,
        "fund opportunity",
      );
      toast({
        title: "Opportunity funded",
        detail: "Escrow is live. The candidate can now begin work.",
        tone: "success",
        action: result?.hash
          ? {
              label: <>View tx <ExternalLink className="inline w-3 h-3 ml-1" /></>,
              href: `${appConfig.explorerUrl}/tx/${result.hash}`,
            }
          : undefined,
      });
      setOpportunityFunded(true);
    } catch (e) {
      const h = humanizeError(e);
      toast({ title: h.title, detail: h.detail, tone: "danger" });
    } finally {
      setFunding(false);
    }
  }

  const parsedMilestones = Number.parseInt(milestones.trim(), 10);
  const validMilestoneCount =
    Number.isInteger(parsedMilestones) &&
    String(parsedMilestones) === milestones.trim() &&
    parsedMilestones >= 1 &&
    parsedMilestones <= MAX_OPPORTUNITY_MILESTONES;
  const canCreate =
    hasRequiredConfig() &&
    walletConnected &&
    cert &&
    cert.status === "verified" &&
    !submitting &&
    isValidDecimalAmount(amount, appConfig.assetDecimals) &&
    validMilestoneCount;

  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-2xl border border-border bg-surface p-5 flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-text">Look up credential</h2>
        <div className="flex gap-3 items-end">
          <Input
            label="Certificate hash"
            value={certHash}
            onChange={(e) => {
              setCertHash(e.target.value);
              setCert(null);
              setCreatedOppId(null);
              setOpportunityFunded(false);
            }}
            placeholder="64 hex characters"
            mono
            className="flex-1"
          />
          <Button
            variant="secondary"
            onClick={() => void handleLookup()}
            loading={lookupBusy}
            disabled={!certHash.trim()}
          >
            Look up
          </Button>
        </div>

        {cert ? (
          <div className="rounded-xl border border-border bg-bg px-4 py-3 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-sm font-semibold text-text">
                {cert.title || "Untitled credential"}
              </span>
              <Badge
                tone={cert.status === "verified" ? "success" : "warning"}
                dot
              >
                {cert.status}
              </Badge>
            </div>
            <span className="text-xs text-text-muted font-mono">
              Owner: {cert.owner}
            </span>
          </div>
        ) : initialCandidate ? (
          <div className="rounded-xl border border-border bg-bg px-4 py-3 flex flex-col gap-1">
            <span className="text-xs uppercase tracking-[0.14em] text-text-muted">
              Candidate from proof link
            </span>
            <code className="text-xs text-text break-all">{initialCandidate}</code>
          </div>
        ) : null}
      </section>

      {cert && cert.status === "verified" ? (
        <section className="rounded-2xl border border-border bg-surface p-5 flex flex-col gap-4">
          <h2 className="text-xl font-semibold text-text">Create paid trial</h2>
          <Input
            label="Opportunity title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., 2-week frontend trial"
          />
          <Input
            label={`Amount (${appConfig.assetCode})`}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g., 100"
            helper="Funds will be held in escrow until you release them."
          />
          <Input
            label="Number of milestones"
            value={milestones}
            onChange={(e) => setMilestones(e.target.value)}
            placeholder="1"
            helper={`Use 1-${MAX_OPPORTUNITY_MILESTONES} milestones. Candidate submits each milestone for your approval before release.`}
          />
          <div className="flex gap-3 flex-wrap">
            <Button
              variant="primary"
              onClick={() => void handleCreate()}
              loading={submitting}
              disabled={!canCreate}
            >
              Create opportunity
            </Button>
            {createdOppId !== null ? (
              <Button
                variant="primary"
                onClick={() => void handleFund()}
                loading={funding}
                disabled={opportunityFunded}
              >
                {opportunityFunded ? "Escrow funded" : "Fund escrow"}
              </Button>
            ) : null}
          </div>
          {createdOppId !== null ? (
            <div className="rounded-xl border border-success/30 bg-success/10 px-4 py-3">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <p className="text-sm font-semibold text-text">
                    Opportunity #{createdOppId} is ready to track
                  </p>
                  <p className="mt-1 text-sm text-text-muted">
                    Keep the flow moving from creation to funding to milestone review without
                    losing the candidate context.
                  </p>
                </div>
                <Badge tone={opportunityFunded ? "success" : "warning"} dot>
                  {opportunityFunded ? "funded" : "draft"}
                </Badge>
              </div>
              <div className="mt-3 flex gap-3 flex-wrap">
                <Button variant="secondary" href={`/opportunity/${createdOppId}`}>
                  Open opportunity
                </Button>
                <Button variant="ghost" href={`/talent/${cert.owner}`}>
                  View candidate passport
                </Button>
                <Button variant="ghost" href={`/proof/${certHash.trim()}`}>
                  Back to proof
                </Button>
              </div>
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
