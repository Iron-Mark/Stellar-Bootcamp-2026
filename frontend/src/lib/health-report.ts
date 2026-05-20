import { appConfig, hasRequiredConfig } from "@/lib/config";

export type HealthStatus = "healthy" | "degraded" | "down";

export type HealthReport = {
  status: HealthStatus;
  timestamp: string;
  checks: {
    config: { ok: boolean; detail: string };
    rpc: { ok: boolean; latencyMs: number; detail: string };
    contract: { ok: boolean; detail: string };
  };
};

export async function getHealthReport(): Promise<HealthReport> {
  const timestamp = new Date().toISOString();
  const configOk = hasRequiredConfig();

  let rpcOk = false;
  let rpcLatency = 0;
  let rpcDetail = "Not checked";

  if (configOk) {
    const start = Date.now();
    try {
      const response = await fetch(appConfig.rpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: "health-check",
          method: "getHealth",
          params: {},
        }),
        next: { revalidate: 30 },
        signal: AbortSignal.timeout(5000),
      });

      rpcLatency = Date.now() - start;

      if (response.ok) {
        const json = (await response.json()) as {
          result?: { status?: string };
        };
        rpcOk = json.result?.status === "healthy";
        rpcDetail = rpcOk
          ? `Healthy (${rpcLatency}ms)`
          : `RPC returned status: ${json.result?.status ?? "unknown"}`;
      } else {
        rpcDetail = `HTTP ${response.status}`;
      }
    } catch (err) {
      rpcLatency = Date.now() - start;
      rpcDetail = err instanceof Error ? err.message : "RPC connection failed";
    }
  }

  const contractOk = Boolean(appConfig.contractId);
  const contractDetail = !configOk
    ? "Config missing"
    : contractOk
      ? `Contract ID configured: ${appConfig.contractId.slice(0, 8)}...`
      : "Missing contract ID";

  const status: HealthStatus =
    configOk && rpcOk && contractOk ? "healthy" : configOk ? "degraded" : "down";

  return {
    status,
    timestamp,
    checks: {
      config: {
        ok: configOk,
        detail: configOk
          ? "All required env vars set"
          : "Missing NEXT_PUBLIC_SOROBAN_CONTRACT_ID or RPC URL",
      },
      rpc: { ok: rpcOk, latencyMs: rpcLatency, detail: rpcDetail },
      contract: { ok: contractOk, detail: contractDetail },
    },
  };
}
