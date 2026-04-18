"use client";

import {
  Address,
  BASE_FEE,
  Operation,
  TransactionBuilder,
  nativeToScVal,
  rpc,
  scValToNative,
} from "@stellar/stellar-sdk";
import { appConfig, getExpectedNetworkPassphrase, hasRequiredConfig } from "@/lib/config";
import { signWithFreighter } from "@/lib/freighter";

function getServer() {
  return new rpc.Server(appConfig.rpcUrl, {
    allowHttp: appConfig.rpcUrl.startsWith("http://"),
  });
}

function ensureConfigured() {
  if (!hasRequiredConfig()) {
    throw new Error(
      "Missing contract configuration. Set the frontend environment variables first.",
    );
  }
}

function getReadAddress() {
  if (!appConfig.readAddress) {
    throw new Error(
      "NEXT_PUBLIC_STELLAR_READ_ADDRESS is not set. Provide a funded testnet account for read-only simulations.",
    );
  }
  return appConfig.readAddress;
}

type ContractArg = {
  value: string | bigint | number;
  type: "address" | "i128" | "u32" | "string";
};

function buildArgs(values: ContractArg[]) {
  return values.map((entry) => nativeToScVal(entry.value, { type: entry.type }));
}

async function buildTransaction(
  sourceAddress: string,
  method: string,
  args: ReturnType<typeof buildArgs>,
) {
  const server = getServer();
  const sourceAccount = await server.getAccount(sourceAddress);

  return new TransactionBuilder(sourceAccount, {
    fee: BASE_FEE,
    networkPassphrase: getExpectedNetworkPassphrase(),
  })
    .addOperation(
      Operation.invokeContractFunction({
        contract: appConfig.contractId,
        function: method,
        args,
      }),
    )
    .setTimeout(30)
    .build();
}

async function simulateRead<T>(
  sourceAddress: string,
  method: string,
  args: ReturnType<typeof buildArgs>,
  transform: (value: unknown) => T,
) {
  ensureConfigured();
  const server = getServer();
  const transaction = await buildTransaction(sourceAddress, method, args);
  const simulation = await server.simulateTransaction(transaction);

  if (rpc.Api.isSimulationError(simulation)) {
    throw new Error(normalizeError(simulation.error));
  }

  if (!simulation.result?.retval) {
    throw new Error(`Simulation for ${method} returned no value.`);
  }

  return transform(scValToNative(simulation.result.retval));
}

async function signAndSubmit<T>(
  sourceAddress: string,
  method: string,
  args: ReturnType<typeof buildArgs>,
  transformReturn?: (value: unknown) => T,
) {
  ensureConfigured();
  const server = getServer();

  const transaction = await buildTransaction(sourceAddress, method, args);
  const preparedTransaction = await server.prepareTransaction(transaction);

  const signedXdr = await signWithFreighter(preparedTransaction.toXDR(), sourceAddress);
  const signedTransaction = TransactionBuilder.fromXDR(
    signedXdr,
    getExpectedNetworkPassphrase(),
  );

  const sendResponse = await server.sendTransaction(signedTransaction);
  if (sendResponse.status !== "PENDING") {
    throw new Error(normalizeError(sendResponse.errorResult ?? sendResponse.status));
  }

  const finalResponse = await server.pollTransaction(sendResponse.hash, {
    attempts: 20,
    sleepStrategy: () => 1200,
  });

  if (finalResponse.status === rpc.Api.GetTransactionStatus.NOT_FOUND) {
    throw new Error("Transaction submitted but not found on the RPC server.");
  }

  if (finalResponse.status === rpc.Api.GetTransactionStatus.FAILED) {
    throw new Error(normalizeError(finalResponse.resultXdr));
  }

  return {
    hash: sendResponse.hash,
    result:
      transformReturn && finalResponse.returnValue
        ? transformReturn(scValToNative(finalResponse.returnValue))
        : undefined,
  };
}

function normalizeAddress(value: unknown): string {
  if (typeof value === "string") return value;
  if (value instanceof Address) return value.toString();
  if (value && typeof value === "object" && "toString" in value) return value.toString();
  throw new Error("Unable to parse Stellar address returned by the contract.");
}

function normalizeBigInt(value: unknown): bigint {
  if (typeof value === "bigint") return value;
  if (typeof value === "number") return BigInt(Math.trunc(value));
  if (typeof value === "string") return BigInt(value);
  throw new Error("Unable to parse integer value returned by the contract.");
}

function normalizeNumber(value: unknown): number {
  const n = Number(normalizeBigInt(value));
  if (!Number.isSafeInteger(n)) throw new Error("ID or count out of safe integer range.");
  return n;
}

function normalizeString(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "toString" in value) return value.toString();
  throw new Error("Unable to parse string value returned by the contract.");
}

function normalizeBoolean(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  throw new Error("Unable to parse boolean value returned by the contract.");
}

function normalizeError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);

  if (message.includes("#1") || /Unauthorized/i.test(message)) {
    return "Only the allowed wallet can perform this action.";
  }
  if (message.includes("#2") || /InvalidInput/i.test(message)) {
    return "Invalid input provided.";
  }
  if (message.includes("#3") || /NotFound/i.test(message)) {
    return "The requested resource does not exist on-chain.";
  }

  return message;
}

// --- Example read/write functions. Replace with methods from your contract. ---

export async function checkMembership(recordId: number, walletAddress: string) {
  return simulateRead(
    getReadAddress(),
    "is_member",
    buildArgs([
      { value: recordId, type: "u32" },
      { value: walletAddress, type: "address" },
    ]),
    normalizeBoolean,
  );
}

export async function createRecord(owner: string, name: string) {
  const response = await signAndSubmit(
    owner,
    "create_record",
    buildArgs([
      { value: owner, type: "address" },
      { value: name, type: "string" },
    ]),
    normalizeNumber,
  );

  return { hash: response.hash, recordId: response.result ?? null };
}

export async function transferAmount(from: string, recordId: number, amount: bigint) {
  return signAndSubmit(
    from,
    "transfer",
    buildArgs([
      { value: from, type: "address" },
      { value: recordId, type: "u32" },
      { value: amount, type: "i128" },
    ]),
  );
}

export { normalizeAddress, normalizeString, normalizeNumber, normalizeBigInt };
