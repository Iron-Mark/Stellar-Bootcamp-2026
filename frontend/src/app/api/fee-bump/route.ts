import { NextResponse } from "next/server";
import {
  Keypair,
  Transaction,
  TransactionBuilder,
  Networks,
} from "@stellar/stellar-sdk";

const SPONSOR_SECRET = process.env.FEE_SPONSOR_SECRET ?? "";
const NETWORK_PASSPHRASE =
  process.env.NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE ?? Networks.TESTNET;

export async function POST(request: Request) {
  if (!SPONSOR_SECRET) {
    return NextResponse.json(
      { error: "Fee sponsorship is not configured on this server." },
      { status: 503 },
    );
  }

  let body: { signedXdr?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { signedXdr } = body;
  if (!signedXdr || typeof signedXdr !== "string") {
    return NextResponse.json(
      { error: "Missing signedXdr field." },
      { status: 400 },
    );
  }

  try {
    const sponsorKeypair = Keypair.fromSecret(SPONSOR_SECRET);
    const innerTx = TransactionBuilder.fromXDR(
      signedXdr,
      NETWORK_PASSPHRASE,
    ) as Transaction;

    const feeBumpTx = TransactionBuilder.buildFeeBumpTransaction(
      sponsorKeypair,
      "1000000", // 0.1 XLM max fee — generous ceiling for testnet
      innerTx,
      NETWORK_PASSPHRASE,
    );

    feeBumpTx.sign(sponsorKeypair);

    return NextResponse.json({ feeBumpXdr: feeBumpTx.toXDR() });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Fee bump failed.";
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
