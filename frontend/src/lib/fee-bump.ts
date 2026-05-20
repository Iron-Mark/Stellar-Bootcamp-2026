import { appConfig } from "@/lib/config";

export function isFeeSponsorAvailable(): boolean {
  return Boolean(appConfig.sponsorAddress && appConfig.feeSponsorClientEnabled);
}

export async function requestFeeBump(
  signedXdr: string,
  authorizationToken?: string,
): Promise<string> {
  if (!authorizationToken) {
    throw new Error("Fee sponsorship requires server authorization.");
  }
  const response = await fetch("/api/fee-bump", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authorizationToken}`,
    },
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
