import type { ProofMetadata } from "./types";

const MAX_TEXT = {
  title: 140,
  description: 700,
  cohort: 80,
  criteria: 700,
  skill: 64,
  evidenceLabel: 100,
};

function truncate(value: string, max: number) {
  return value.trim().slice(0, max);
}

function isPrivateHostname(hostname: string) {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host === "0.0.0.0" ||
    host === "::1" ||
    host.startsWith("127.") ||
    host.startsWith("10.") ||
    host.startsWith("192.168.") ||
    host.startsWith("169.254.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(host) ||
    /^f[cd][0-9a-f]{2}:/i.test(host) ||
    /^fe80:/i.test(host)
  ) {
    return true;
  }
  return false;
}

export function isSafeExternalHttpUrl(value: string): boolean {
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:" && url.protocol !== "http:") return false;
    return !isPrivateHostname(url.hostname);
  } catch {
    return false;
  }
}

export function isSafeInternalHref(value: string): boolean {
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return false;
  }
  try {
    const url = new URL(value, "https://stellaroid.tech");
    return url.origin === "https://stellaroid.tech" && url.pathname.startsWith("/");
  } catch {
    return false;
  }
}

export function sanitizeProofMetadata(json: unknown): ProofMetadata | null {
  if (!json || typeof json !== "object") return null;
  const obj = json as Record<string, unknown>;
  const title = typeof obj.title === "string" ? truncate(obj.title, MAX_TEXT.title) : "";
  if (!title) return null;

  const evidence = Array.isArray(obj.evidence)
    ? obj.evidence
        .filter(
          (item): item is { label: string; href: string } =>
            typeof item === "object" &&
            item !== null &&
            typeof (item as Record<string, unknown>).label === "string" &&
            typeof (item as Record<string, unknown>).href === "string",
        )
        .map((item) => ({
          label: truncate(item.label, MAX_TEXT.evidenceLabel),
          href: item.href.trim(),
        }))
        .filter(
          (item) =>
            item.label &&
            (isSafeExternalHttpUrl(item.href) || isSafeInternalHref(item.href)),
        )
        .slice(0, 8)
    : [];

  return {
    title,
    description:
      typeof obj.description === "string"
        ? truncate(obj.description, MAX_TEXT.description)
        : "",
    cohort:
      typeof obj.cohort === "string"
        ? truncate(obj.cohort, MAX_TEXT.cohort) || undefined
        : undefined,
    criteria:
      typeof obj.criteria === "string"
        ? truncate(obj.criteria, MAX_TEXT.criteria) || undefined
        : undefined,
    skills: Array.isArray(obj.skills)
      ? obj.skills
          .filter((skill): skill is string => typeof skill === "string")
          .map((skill) => truncate(skill, MAX_TEXT.skill))
          .filter(Boolean)
          .slice(0, 12)
      : [],
    evidence,
  };
}

export function isE2EModeAllowed({
  nodeEnv,
  ci,
  playwright,
  vercelEnv,
}: {
  nodeEnv?: string;
  ci?: boolean;
  playwright?: boolean;
  vercelEnv?: string;
}) {
  if (nodeEnv === "production" || vercelEnv === "production" || vercelEnv === "preview") {
    return false;
  }
  return nodeEnv === "test" || Boolean(ci) || Boolean(playwright);
}
