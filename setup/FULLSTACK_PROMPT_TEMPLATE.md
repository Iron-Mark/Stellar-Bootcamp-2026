# Fullstack Prompt Template (Stellar / Soroban) — v3

Generate a Stellar dApp idea + a compile-ready Soroban contract package + a concrete frontend design spec, as the foundation for a hackathon fullstack demo.

Refined with three skills:
- **stellar-dev** → current Soroban/Stellar CLI correctness, x402/MPP agentic payments
- **ui-ux-pro-max** → concrete UI style, palette, typography, and CTA guidance for the frontend
- **superpowers/writing-skills** → concise, appropriately-scoped prompt design

---

## When to use this

**After** you have a deployed + verified `C...` Contract ID on Stellar testnet. Output becomes the `contract/` and design brief for the `frontend/` of your fullstack repo.

---

## Prompt (copy everything in the fenced block below)

````
<role>
You are a senior Stellar/Soroban engineer and hackathon mentor. You ship demo-ready dApps on Stellar testnet. You write idiomatic Rust against soroban-sdk 22+, use the Stellar CLI (`stellar contract ...`, never the deprecated `soroban contract ...`), and default to Stellar Assets + SAC (Stellar Asset Contract) over custom tokens. You pair this with a concrete frontend design brief — not generic "modern UI" hand-waving.
</role>

<task>
Generate exactly N = {{N}} Stellar dApp idea(s). For EACH idea, produce:
  (A) a filled Idea Spec
  (B) four compile-ready contract files (lib.rs, test.rs, Cargo.toml, README.md)
  (C) a concrete frontend design brief (not code — spec only: style, palette, typography, key screens, primary CTA, UX anti-patterns to avoid)

All contract code must compile against soroban-sdk 22+, target wasm32-unknown-unknown, and map every function to the MVP transaction. No TODOs or placeholders.
</task>

<constraints>
REGION:      [ ] SEA  [ ] Africa  [ ] LATAM  [ ] South Asia  [ ] MENA  [ ] Global
USER_TYPE:   pick 1-2: [ ] Unbanked [ ] Freelancers [ ] Students [ ] SMEs [ ] Creators [ ] Farmers [ ] NGOs [ ] Migrants
COMPLEXITY:  pick 1-2: [ ] Mobile-first [ ] Web app [ ] Soroban required [ ] CLI/API only
THEME:       pick 1-2 (see themes_reference at bottom)
STELLAR_FEATURES: pick only what's truly used
  [ ] XLM / USDC transfers
  [ ] Stellar Assets (classic issuance + trustlines)   ← PREFERRED for fungible tokens
  [ ] Stellar Asset Contract (SAC)                     ← when Soroban needs a classic asset
  [ ] Custom Soroban token                              ← ONLY if logic exceeds SEP-41 basics
  [ ] Soroban smart contracts (auth, storage, events)
  [ ] Built-in DEX / path payments
  [ ] Trustlines / Clawback / Compliance
  [ ] Passkeys / Smart Wallets
  [ ] x402 paid-API pattern                            ← agentic HTTP 402 payments
  [ ] MPP (Charge or Channel)                          ← machine payment protocol
NETWORK: always Stellar Testnet
  - Passphrase: "Test SDF Network ; September 2015"
  - RPC: https://soroban-testnet.stellar.org
N = {{N}}
</constraints>

<hard_rules>
FORBIDDEN
  - Vague terms: "users", "platform", "blockchain solution", "ecosystem"
  - Generic phrases: "people lack access", "revolutionize", "democratize"
  - Deprecated `soroban` CLI (use `stellar`)
  - Mainnet deployment or real-XLM flows
  - Hardcoded secret keys, seed phrases, or private RPC URLs

REQUIRED
  - Real money movement OR on-chain financial coordination
  - At least one STELLAR_FEATURE from constraints
  - <30s verbal pitch
  - Every contract fn maps to a concrete MVP step
  - Explicit storage type per key: Temporary / Persistent / Instance, with TTL extension where needed
  - `require_auth()` on every mutating fn
  - Events emitted for state changes (topics use `symbol_short!`)
  - `#![no_std]` at crate root
  - Frontend spec names specific colors/fonts/screens, not "modern clean minimalist design"
</hard_rules>

<degrees_of_freedom>
HIGH specificity (no freedom):  Cargo.toml, CLI commands, soroban-sdk version, network passphrase, test count (exactly 5)
MEDIUM specificity:             storage/error/event design inside lib.rs — pick what fits the MVP
LOW specificity (creative):     Idea spec copy, frontend style choice (as long as it's concrete)
</degrees_of_freedom>

<output_format>
For each of the N ideas, emit in this exact order:

=== IDEA {{i}} of {{N}} ===

## A. Idea Spec
PROJECT NAME:       (≤4 words; snake_case crate name in parens)
PROBLEM:            (≤40 words — specific person, specific place, concrete cost)
SOLUTION:           (≤40 words — user action → on-chain action → why Stellar)
STELLAR FEATURES:   (subset of constraints, one-phrase justification each)
TARGET USERS:       (role, income band, location, behavior — ≤30 words)
CORE FEATURE (MVP): (3 steps: User action → On-chain action → Result; demoable ≤2 min)
RISK:               (1 sentence — most likely live-demo failure + your mitigation)
OPTIONAL EDGE:      (pick ONE: AI integration / anchor integration / wallet UX / DeFi composability / offline support / x402 / MPP Channel)

## B. Contract Files

### `contract/Cargo.toml`
```toml
[package]
name = "<snake_case_crate_name>"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib", "rlib"]

[dependencies]
soroban-sdk = "22.0.0"

[dev-dependencies]
soroban-sdk = { version = "22.0.0", features = ["testutils"] }

[profile.release]
opt-level = "z"
overflow-checks = true
debug = 0
strip = "symbols"
debug-assertions = false
panic = "abort"
codegen-units = 1
lto = true
```

### `contract/src/lib.rs`
Full implementation. Must include:
  - `#![no_std]`
  - `use soroban_sdk::{contract, contractimpl, contracttype, contracterror, Address, Env, Symbol, symbol_short, Vec, Map, log};`
  - `#[contracttype] enum DataKey { ... }` — explicit storage keys
  - `#[contracterror]` enum with ≥3 variants (Unauthorized, AlreadyExists/NotFound, InvalidInput)
  - `#[contract]` struct + `#[contractimpl]`
  - Each public fn: `require_auth()` on mutations, explicit storage type (`env.storage().persistent()` / `.temporary()` / `.instance()`), TTL extension (`.extend_ttl(threshold, extend_to)`), event emission (`env.events().publish((symbol_short!("topic"),), payload)`)
  - Inline comments explaining WHY each design choice (storage type, auth scope, error variant)

### `contract/src/test.rs`
Exactly 5 tests. `#![cfg(test)]` at top. Use `soroban_sdk::testutils::{Address as _, Events, Ledger}`.
  - T1 Happy path: full MVP tx end-to-end; assert return value
  - T2 Unauthorized caller: no `mock_all_auths`; expect `HostError` via `try_*`
  - T3 State verification: after MVP tx, read storage and assert invariants
  - T4 Edge case: invalid input OR duplicate-entry; expect specific contracterror variant
  - T5 Event emission: `env.events().all()` contains expected topic + payload

### `contract/README.md`
Sections in this order:
  1. `# <Project Name>` + one-line description
  2. `## Problem & Solution` (from Idea Spec)
  3. `## Stellar Features Used`
  4. `## Prerequisites`: Rust 1.74+, Stellar CLI v26+, `wasm32-unknown-unknown` target
  5. `## Build`:
     ```bash
     stellar contract build
     ```
  6. `## Test`:
     ```bash
     cargo test
     ```
  7. `## Deploy to Testnet`:
     ```bash
     stellar keys generate my-key --network testnet --fund
     stellar contract deploy \
       --wasm target/wasm32-unknown-unknown/release/<crate>.wasm \
       --source my-key \
       --network testnet
     ```
  8. `## Sample Invocation` — one `stellar contract invoke` per public fn, realistic args:
     ```bash
     stellar contract invoke \
       --id <CONTRACT_ID> \
       --source my-key \
       --network testnet \
       -- <fn_name> --<arg> <value>
     ```
  9. `## Verify`: `https://stellar.expert/explorer/testnet/contract/<CONTRACT_ID>`
  10. `## License` — MIT

## C. Frontend Design Brief
(spec only — not code. The participant will build from `src/frontend/` Next.js 15 + Freighter reference.)

STYLE CATEGORY:     (e.g., "Bitcoin DeFi Dark", "High-Tech Boutique SaaS", "Financial Dashboard") — must justify fit with target users
COLOR PALETTE:      primary / accent / background / surface / success / danger — use HEX values
TYPOGRAPHY:         display / body / monospace — name specific fonts (e.g., Space Grotesk, Inter, JetBrains Mono)
KEY SCREENS:        list 3–5 screens with one-sentence purpose each (e.g., "Connect Wallet — single CTA, no other actions")
PRIMARY CTA:        exact button copy + what happens (signs tx via Freighter / calls contract fn X / shows result Y)
EMPTY/LOADING/ERROR: one sentence each for the MVP screen
UX ANTI-PATTERNS TO AVOID: list 3 specific pitfalls for this vertical (e.g., "never hide tx fees", "never auto-retry a signing popup", "never show raw ScVal errors to users")
ACCESSIBILITY:      WCAG target (AA default) + specific concern (e.g., "color-blind-safe profit/loss indicators — pair color with icon")
MOBILE vs WEB:      which COMPLEXITY pick this targets + why
</output_format>

<mini_example>
Truncated example to set tone (do NOT copy this idea — generate fresh):

=== IDEA 1 of 1 ===

## A. Idea Spec
PROJECT NAME:       Jeepney Split (jeepney_split)
PROBLEM:            Commuters in Quezon City split a ₱13 jeepney fare with 3 strangers daily; no one has coins, everyone owes everyone, driver waits, the queue behind honks.
SOLUTION:           Passenger scans driver's QR, contract splits a ₱40 pooled USDC payment across N riders and settles instantly via Soroban; Stellar's sub-cent fees make ₱3 splits viable.
STELLAR FEATURES:   USDC transfers (fee < 1 centavo), Soroban contract (pool-and-split auth logic), events (for receipt screen)
TARGET USERS:       QC jeepney riders, ₱400–₱800/day income, smartphone-first, already use GCash — craves one-tap group payment without coin-hunting.
CORE FEATURE (MVP): Rider taps "Join Ride" → contract locks their share + emits `ride_joined` → driver taps "Settle" → contract transfers pooled USDC to driver, emits `ride_settled` → rider sees green checkmark.
RISK:               Testnet RPC latency spikes mid-demo; mitigation: pre-warm RPC + show "Settling…" skeleton with 15s timeout fallback copy.
OPTIONAL EDGE:      Offline support — sign locally, submit when back online.

## C. Frontend Design Brief
STYLE CATEGORY:     Bitcoin DeFi Dark (Mobile) — wallet-native feel, trust cues for money flow
COLOR PALETTE:      bg #030304, surface #0F1115, text #FFFFFF, muted #94A3B8, accent #F7931A, success #22C55E, danger #EF4444
TYPOGRAPHY:         Space Grotesk Bold (headings), Inter (body), JetBrains Mono (amounts + contract IDs)
KEY SCREENS:        1. Connect Freighter (single CTA)  2. Join Ride (amount + rider count)  3. Settling (skeleton + spinner)  4. Receipt (green checkmark + stellar.expert link)  5. History (last 5 rides, mono amounts)
PRIMARY CTA:        "Pay ₱10 share" — triggers Freighter `signTransaction`, submits via Soroban RPC, routes to Settling screen
EMPTY/LOADING/ERROR: Empty: "No rides yet — scan a driver QR". Loading: Skeleton rider cards + "Settling on Stellar…". Error: human message + "Try again" (never raw ScVal).
UX ANTI-PATTERNS:   (1) Never auto-dismiss Freighter popup  (2) Never hide the fee line  (3) Never show Contract ID without a copy button
ACCESSIBILITY:      WCAG AA; pair success green with ✓ icon for color-blind riders; 44×44 touch targets.
MOBILE vs WEB:      Mobile-first — riders are on phones in transit; web is secondary.

(End of mini_example. Generate your own idea(s) fresh.)
</mini_example>

<themes_reference>
Finance & Payments: DeFi · Payroll · Remittance · Micropayments · Savings & lending · Cross-border B2B · Split billing
Social Impact:      Disaster relief · Charity · UBI · Women's economic access
Education:          Scholarship disbursement · Credential verification
Agri & Supply:      Farmer payments · Cooperative tokenization
Work & Gig:         Freelancer invoicing · Escrow
Commerce & Loyalty: SME merchant payments · Marketplace escrow
Governance & ID:    Digital identity / KYC · Transparent fund distribution
</themes_reference>

Now generate N={{N}} idea(s) following <output_format> exactly. Do not skip sections A, B, or C.
````

---

## Usage

1. Set `N` (1–3 recommended for hackathons).
2. Tick boxes in `<constraints>`.
3. Paste into Claude / ChatGPT.
4. Run `cd contract && cargo test && stellar contract build` to verify the generated contract compiles.
5. Deploy winning idea to testnet; wire `src/frontend/` against the new Contract ID using the Frontend Design Brief as the spec.

## Changelog (v2 → v3)

| Change | Source skill | Why |
|---|---|---|
| Added **Section C: Frontend Design Brief** output | ui-ux-pro-max | Stops "modern clean UI" slop; forces concrete palette/fonts/CTA |
| Added mini worked example (Jeepney Split) | superpowers/writing-skills | One-shot anchor drastically reduces tone/depth variance |
| Added **`<degrees_of_freedom>`** block | superpowers/writing-skills | Model knows where to be rigid vs creative |
| Added **x402 + MPP Channel** to STELLAR_FEATURES and OPTIONAL EDGE | stellar-dev | Current agentic-payments patterns |
| Added explicit **network passphrase + RPC URL** | stellar-dev | No more guessing testnet constants |
| Trimmed hard_rules to terse bullets | superpowers/writing-skills (concise) | Lower token cost, same rigor |
| Specified **event topics via `symbol_short!`** | stellar-dev | Indexable by Stellar Expert / RPC |
| Added **TTL extension** hint inline | stellar-dev | Common Soroban footgun |
| UX anti-patterns required (not optional) | ui-ux-pro-max | Hackathon frontends routinely show raw ScVal errors |
