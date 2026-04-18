# TODO — Stellar Bootcamp Setup

Legend: **A** = Environment (codespace) · **B** = Manual pre-workshop · **C** = Contract deployment · **D** = Rise In submission · **E** = Phase 2 Fullstack

---

## A. Environment (done in this codespace)
- [x] **A1.** Visit GitHub repo
- [x] **A2.** Install **Rust** (rustc 1.95.0)
- [x] **A3.** Install **Stellar CLI** (v26.0.0 at `~/.local/bin/stellar`)
- [x] **A4.** Install **WASM target** (`wasm32v1-none` + `wasm32-unknown-unknown`)
- [x] **A5.** `build-essential` present
- [x] **A6.** Testnet key generated and funded
  - Alias: `my-key`
  - Address: `GAWIOVGFSPJDEIJJZUSVRFPVP3D5VNO2LGCU47KEHJD6MV277QKNR34D`
- [x] **A7.** Persist PATH for new shells:
  ```bash
  echo 'export PATH="$PATH:$HOME/.local/bin"' >> ~/.bashrc && source ~/.bashrc
  ```

## B. Manual Pre-Workshop (outside codespace)
- [x] **B1.** Submit Google Form: https://forms.gle/uuo7s3A5MoygJWNt5
- [x] **B2.** Join Messenger GC: Stellar PH Offline Bootcamp
- [x] **B3.** Register on Rise In: https://www.risein.com/programs/stellar-bootcamp-ph
- [x] **B4.** ⭐ Star the repo: https://github.com/armlynobinguar/Stellar-Bootcamp-2026
- [x] **B5.** Install **Freighter Wallet** (browser + phone, **Testnet**) — https://freighter.app
- [x] **B6.** Fund Freighter testnet wallet via https://friendbot.stellar.org
  - Address: `GCAUJ4JXMKVANOL3AMZUNGX65LUCHI775XIB6HIPOAKXMVYOWDMAIFPT`
- [x] **B7.** Submit Pull Request (Full Name / Course & Year / Telegram Username)
  - PR: https://github.com/armlynobinguar/Stellar-Bootcamp-2026/pull/73

## C. Contract Deployment (Step 4)
- [ ] **C1.** Get facilitator-provided repo link
- [ ] **C2.** Clone and enter contract folder:
  ```bash
  git clone <facilitator-provided-repo-link>
  cd <contract-folder>
  ```
- [ ] **C3.** Complete `src/lib.rs` + ensure 3+ passing tests in `src/test.rs`
- [ ] **C4.** `cargo test`
- [ ] **C5.** `cargo build --target wasm32-unknown-unknown --release`
- [ ] **C6.** Deploy:
  ```bash
  stellar contract deploy \
    --wasm target/wasm32-unknown-unknown/release/<your_contract>.wasm \
    --source my-key \
    --network testnet
  ```
- [ ] **C7.** Copy Contract ID (starts with `C...`)
- [ ] **C8.** Verify on Stellar Expert: `https://stellar.expert/explorer/testnet/contract/<CONTRACT_ID>`

## D. Rise In Submission (Step 5)
- [ ] **D1.** Push code to your own GitHub repo
- [ ] **D2.** Submit on Rise In: GitHub link, Contract ID, Stellar Expert link, short description

## E. Phase 2 — Fullstack (after Contract ID is verified)
Use the Stellar-provided template prompt to generate a project idea + Soroban contract files, then build the fullstack on top.

Template: [`FULLSTACK_PROMPT_TEMPLATE.md`](./FULLSTACK_PROMPT_TEMPLATE.md)

- [ ] **E1.** Verify deployed Contract ID on Stellar Expert
- [ ] **E2.** Pick project idea using the template prompt (region / user type / theme / Stellar features)
- [ ] **E3.** Generate/adapt Soroban contract (`lib.rs` + 5 tests in `test.rs` + `Cargo.toml` + `README.md`)
- [ ] **E4.** Scaffold fullstack from `src/frontend/` (Next.js 15 + Freighter + stellar-sdk)
  - Base on [`STELLAR_FREIGHTER_INTEGRATION_GUIDE.md`](./STELLAR_FREIGHTER_INTEGRATION_GUIDE.md)
- [ ] **E5.** Wire frontend to deployed Contract ID (set `NEXT_PUBLIC_SOROBAN_CONTRACT_ID`)
- [ ] **E6.** Demo-able MVP flow: user action → on-chain tx → visible result (<2 min)
- [ ] **E7.** Final repo layout: `contract/`, `frontend/`, optional `backend/`

---

## Notes
- Stellar CLI v26 dropped `--global` (global is default); use `--fund` on `keys generate` to auto-fund.
