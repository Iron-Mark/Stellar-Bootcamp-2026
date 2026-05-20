export type FeeBumpShapeInput = {
  signedXdr: unknown;
  authorization: string | null;
  expectedToken: string;
  maxXdrLength: number;
};

export type FeeBumpShapeResult =
  | { ok: true; signedXdr: string }
  | { ok: false; status: number; error: string };

export function validateFeeBumpRequestShape({
  signedXdr,
  authorization,
  expectedToken,
  maxXdrLength,
}: FeeBumpShapeInput): FeeBumpShapeResult {
  if (!expectedToken || authorization !== `Bearer ${expectedToken}`) {
    return {
      ok: false,
      status: 401,
      error: "Fee sponsorship requires server authorization.",
    };
  }
  if (typeof signedXdr !== "string" || !signedXdr) {
    return { ok: false, status: 400, error: "Missing signedXdr field." };
  }
  if (signedXdr.length > maxXdrLength) {
    return { ok: false, status: 413, error: "Signed transaction is too large." };
  }
  return { ok: true, signedXdr };
}

