import { appConfig } from "@/lib/config";

export function isFeeSponsorAvailable(): boolean {
  return Boolean(appConfig.sponsorAddress);
}

export async function requestFeeBump(signedXdr: string): Promise<string> {
  const response = await fetch("/api/fee-bump", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ signedXdr }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(
      (body as { error?: string }).error ?? "Fee bump request failed.",
    );
  }

  const result = (await response.json()) as { feeBumpXdr: string };
  return result.feeBumpXdr;
}
