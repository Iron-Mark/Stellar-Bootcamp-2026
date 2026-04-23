# Security Checklist — Stellaroid Earn

This document records the security controls verified for the Stellaroid Earn MVP
(testnet deployment, Black Belt submission). Items are checked at the
smart-contract, frontend, infrastructure, and operational layers.

---

## Smart Contract Security

| # | Control | Status | Notes |
|---|---------|--------|-------|
| 1 | **Access control** | PASS | Admin-only functions call `admin.require_auth()` and match the stored admin address before executing. |
| 2 | **Issuer gating** | PASS | `register_certificate` and `verify_certificate` reject callers that do not hold approved issuer status. |
| 3 | **Duplicate prevention** | PASS | Re-submitting an existing certificate hash returns `AlreadyExists`; no silent overwrites. |
| 4 | **Credential lifecycle guards** | PASS | `verify` only transitions a cert from `Issued`; `revoke`/`suspend` check caller authorization before mutating state. |
| 5 | **Expiry enforcement** | PASS | `ensure_not_expired()` is called before verification and payment; expired certs are rejected. |
| 6 | **Payment authorization** | PASS | Token transfer only executes when `cert.owner == student` (the submitting address). |
| 7 | **Typed errors** | PASS | `#[contracterror]` enum with 12 variants; frontend `humanizeError()` maps each code to safe, user-facing copy. |
| 8 | **TTL management** | PASS | Storage TTL set to 518,400–1,036,800 ledgers; entries are extended on access to prevent premature archival. |
| 9 | **Re-entrancy** | N/A | Soroban's single-contract execution model makes cross-contract re-entrancy impossible by design. |
| 10 | **Unbounded iteration** | PASS | All reads and writes are O(1) keyed lookups; no loops over dynamic-length storage. |
| 11 | **Source verification** | PASS | Deployed WASM hash verified on Stellar Expert and linked to commit `71d2b03`. |

---

## Frontend Security

| # | Control | Status | Notes |
|---|---------|--------|-------|
| 1 | **Content Security Policy** | PASS | `default-src 'self'`; `connect-src` restricted to `https://*.stellar.org`; `frame-src 'none'` globally. |
| 2 | **X-Content-Type-Options** | PASS | `nosniff` header set on all responses. |
| 3 | **X-Frame-Options** | PASS | `DENY` globally; `/proof/[hash]/embed` route permits controlled framing for embed use-case. |
| 4 | **HSTS** | PASS | `max-age=63072000; includeSubDomains; preload` on all routes. |
| 5 | **Referrer-Policy** | PASS | `strict-origin-when-cross-origin` applied via `next.config.ts` headers. |
| 6 | **Permissions-Policy** | PASS | `camera=(), microphone=(), geolocation=()` — no sensitive device APIs exposed. |
| 7 | **Input validation** | PASS | Proof hash format is validated client-side before any RPC call is issued; malformed hashes are rejected early. |
| 8 | **Error normalization** | PASS | `humanizeError()` maps all contract and network errors to safe, non-leaking copy. |
| 9 | **SSRF prevention** | PASS | `isSafeUri()` blocks `file://`, `localhost`, and private IP ranges from being used as RPC targets. |
| 10 | **No secrets in client bundle** | PASS | All `NEXT_PUBLIC_*` env vars are non-sensitive public config (RPC URL, network passphrase, contract ID). |
| 11 | **Wallet validation** | PASS | Network passphrase returned by Freighter is compared to the expected value before signing; mismatch aborts. |

---

## Infrastructure Security

| # | Control | Status | Notes |
|---|---------|--------|-------|
| 1 | **Automatic HTTPS** | PASS | Hosted on Vercel; TLS termination and certificate renewal are fully managed. |
| 2 | **Zero server-side attack surface** | PASS | No custom backend and no database; the only server-side code is Next.js static/ISR rendering. |
| 3 | **CDN caching** | PASS | Dynamic proof routes use `revalidate=60` to reduce RPC load while keeping data fresh. |
| 4 | **Crawl protection** | PASS | `robots.ts` disallows crawlers from spidering `/proof/[hash]` routes to prevent mass enumeration. |
| 5 | **Dependency audit** | PASS | `npm audit` run pre-submission; no known critical vulnerabilities at time of review. |

---

## Operational Security

| # | Control | Status | Notes |
|---|---------|--------|-------|
| 1 | **Testnet only** | PASS | All contract deployments and transactions target Stellar testnet; mainnet deployment is explicitly out of scope. |
| 2 | **Admin key separation** | PASS | The admin key used for contract deployment is separate from the participant's personal wallet. |
| 3 | **No private key storage** | PASS | No private keys are stored in code, environment variables, or version control. |
| 4 | **RPC health monitoring** | PASS | App surfaces a visible error state when the Soroban RPC endpoint is unreachable. |

---

## Not Applicable (Testnet MVP)

The following controls are standard for production deployments but are explicitly
out of scope for this testnet MVP submission:

- **Formal third-party audit** — not applicable at this stage; planned before any mainnet deployment.
- **Rate limiting** — no custom backend to enforce it; Vercel edge and Stellar RPC provide baseline protection.
- **Web Application Firewall (WAF)** — not configured; deferred to production.
- **Penetration testing** — not performed; deferred to production.

---

Last reviewed: 2026-04-23
