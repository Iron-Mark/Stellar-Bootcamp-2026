# Soroban QuickStart

Starter repository for Soroban workshop setup and practice.

## Prerequisites

- macOS, Linux, or Windows with terminal access
- Rust toolchain (`rustup`, `cargo`)
- Soroban CLI and related Stellar tooling

## Setup Guide

Follow the full setup instructions in:

- `[ENG] Pre-Workshop Setup Guide.pdf`

## Typical Workflow

1. Complete environment setup from the PDF.
2. Create or open your Soroban project.
3. Build and test contracts locally.
4. Deploy and interact with contracts using the CLI.

## Notes

- This repository currently includes the pre-workshop setup guide as the main resource.
- Add your contract source files and examples here as you progress.


# Soroban Contract Deployment Quickstart

A step-by-step guide for deploying any Soroban smart contract to the Stellar testnet. Follow this guide to go from a compiled Rust contract to a live on-chain deployment.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Step 1 — Add Testnet Network](#step-1--add-testnet-network)
- [Step 2 — Generate and Fund a Keypair](#step-2--generate-and-fund-a-keypair)
- [Step 3 — Build Your Contract](#step-3--build-your-contract)
- [Step 4 — Deploy to Testnet](#step-4--deploy-to-testnet)
- [Step 5 — Initialize Your Contract](#step-5--initialize-your-contract)
- [Step 6 — Invoke Contract Functions](#step-6--invoke-contract-functions)
- [Step 7 — Verify on Explorer](#step-7--verify-on-explorer)
- [Tips and Troubleshooting](#tips-and-troubleshooting)

---

## Deployment of your Smart Contract

Install the following before starting:

- **Rust** — [rustup.rs](https://rustup.rs)
- **Stellar CLI** — [Install guide](https://developers.stellar.org/docs/tools/developer-tools/cli/install-cli)
- **wasm32 target:**
```bash
rustup target add wasm32-unknown-unknown
```

Verify your CLI is installed:
```bash
stellar --version
```

---

## Step 1 — Add Testnet Network

Register the Stellar testnet as a named network so you can reference it by name in subsequent commands:
```bash
soroban network add \
  --rpc-url https://soroban-testnet.stellar.org:443 \
  --network-passphrase "Test SDF Network ; September 2015" \
  testnet
```

Verify it was added:
```bash
stellar network ls
```

Expected output:
```
testnet
```

---

## Step 2 — Generate and Fund a Keypair

Generate a local keypair named `alice` and fund it automatically via Friendbot (testnet faucet):
```bash
stellar keys generate alice --network testnet --fund
```

Confirm the address was created:
```bash
stellar keys ls
stellar keys address alice
```

Expected output:
```
alice
GBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

> **Note:** `alice` is just a local alias. You can name it anything — `deployer`, `admin`, `mykey`, etc. The `--fund` flag only works on testnet.

---

## Step 3 — Build Your Contract

From your contract's root directory, compile it to WebAssembly:
```bash
cargo build --release --target wasm32-unknown-unknown
```

Your compiled artifact will be at:
```
target/wasm32-unknown-unknown/release/<your_contract_name>.wasm
```

**Example** — for a contract named `hello-world` in `Cargo.toml`:
```toml
[package]
name = "hello-world"
version = "0.1.0"
edition = "2021"
```

The wasm output will be:
```
target/wasm32-unknown-unknown/release/hello_world.wasm
```

> **Note:** Rust converts hyphens to underscores in filenames. `hello-world` → `hello_world.wasm`.

---

## Step 4 — Deploy to Testnet

Deploy the compiled wasm to the Stellar testnet:
```bash
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/<your_contract_name>.wasm \
  --source-account alice \
  --network testnet
```

**Example:**
```bash
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/hello_world.wasm \
  --source-account alice \
  --network testnet
```

On success you will see:
```
ℹ️  Uploading contract WASM…
ℹ️  Simulating transaction…
ℹ️  Signing transaction: 3d5ad32df06ca6...
🌎 Sending transaction…
✅ Transaction submitted successfully!
🔗 https://stellar.expert/explorer/testnet/tx/3d5ad32df06ca6...
✅ Deployed!
CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

The last line is your **Contract ID** — save it, you will need it for all invocations.
```bash
# Save it as a variable for convenience
export CONTRACT_ID=CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

---

## Step 5 — Initialize Your Contract

Most contracts have an `initialize` or constructor function that must be called once after deployment. Use `stellar contract invoke` to call it:
```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --source-account alice \
  --network testnet \
  -- <function_name> \
  --<param_name> <param_value>
```

**Example** — initializing a contract with an admin address:
```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --source-account alice \
  --network testnet \
  -- initialize \
  --admin $(stellar keys address alice)
```

**Example** — initializing with multiple parameters:
```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --source-account alice \
  --network testnet \
  -- initialize \
  --admin $(stellar keys address alice) \
  --token CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC \
  --max_amount 1000000
```

> **Note:** The `--` separator between the CLI flags and the contract function arguments is required.

---

## Step 6 — Invoke Contract Functions

Call any contract function the same way:
```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --source-account alice \
  --network testnet \
  -- <function_name> \
  --<param> <value>
```

**Example** — calling a `hello` function that takes a `name` parameter:
```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --source-account alice \
  --network testnet \
  -- hello \
  --name world
```

Expected output:
```json
["Hello", "world"]
```

**Example** — calling a read-only `get_balance` function:
```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --source-account alice \
  --network testnet \
  -- get_balance \
  --address $(stellar keys address alice)
```

**Example** — calling a function with a boolean parameter:
```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --source-account alice \
  --network testnet \
  -- set_active \
  --enabled true
```

**Example** — calling a function with an integer parameter:
```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --source-account alice \
  --network testnet \
  -- set_limit \
  --amount 5000
```

---

## Step 7 — Verify on Explorer

After deploying, verify your contract is live using either of these tools:

**Stellar Expert:**
```
https://stellar.expert/explorer/testnet/contract/<CONTRACT_ID>
```

**Stellar Lab:**
```
https://lab.stellar.org/r/testnet/contract/<CONTRACT_ID>
```

Both show your contract's transaction history, storage state, and invocation logs.

---

## Tips and Troubleshooting

**`contract missing metadata section`**

Your contract is missing the `contractmeta!` macro. Add this to your `lib.rs`:
```rust
use soroban_sdk::contractmeta;

contractmeta!(
    key = "Description",
    val = "Your contract description here"
);
```

Then rebuild and redeploy.

---

**`src refspec master does not match any`**

You have no commits yet. Run:
```bash
git add .
git commit -m "initial commit"
git push -u origin main --force
```

---

**`error: src refspec main does not match any`**

Your local branch is `master` not `main`. Run:
```bash
git push -u origin master --force
```

Or check your current branch:
```bash
git branch
```

---

**`transaction simulation failed: HostError`**

Usually means the contract function arguments are wrong. Double-check:
- Parameter names match exactly what is in your contract
- The `--` separator is present before function name
- Types match (e.g. passing a string where an address is expected)

---

**Friendbot / funding issues**

If `--fund` fails, fund manually:
```bash
curl "https://friendbot.stellar.org?addr=$(stellar keys address alice)"
```

---

**Check account balance**
```bash
stellar contract invoke \
  --id <NATIVE_TOKEN_CONTRACT_ID> \
  --source-account alice \
  --network testnet \
  -- balance \
  --id $(stellar keys address alice)
```

---

## Quick Reference
```bash
# Add network
soroban network add --rpc-url https://soroban-testnet.stellar.org:443 \
  --network-passphrase "Test SDF Network ; September 2015" testnet

# Generate keypair
stellar keys generate alice --network testnet --fund

# Build
cargo build --release --target wasm32-unknown-unknown

# Deploy
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/<contract>.wasm \
  --source-account alice \
  --network testnet

# Invoke
stellar contract invoke \
  --id <CONTRACT_ID> \
  --source-account alice \
  --network testnet \
  -- <function> --<param> <value>
```
