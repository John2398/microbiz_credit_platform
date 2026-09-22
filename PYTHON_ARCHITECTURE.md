# FINCORE™ Microbiz MFB — Python 3.10+ Architecture Specification

**Host Reference:** `fincore.microbizmfb.com`  
**License:** Central Bank of Nigeria (CBN) MFB/RC-719401 | NDIC Insured  
**Runtime Requirement:** Pure Python 3.10+ (Standard Library Only — Zero pip dependencies)

---

## 1. Executive Summary

This enterprise credit origination, consortium blockchain, and core banking system (CBS) is completely implemented in idiomatic, production-grade **Python 3.10+**. 

The package is self-contained in `/fincore_python` with an executable root entrypoint in `/fincore_app.py`. It requires **zero external pip dependencies**, leveraging Python's standard library (`dataclasses`, `hashlib`, `json`, `http.server`, `urllib.parse`, `time`, and `unittest`).

---

## 2. Directory & Module Breakdown

```
├── fincore_app.py                     # Root executable CLI & server entrypoint
├── fincore_python/
│   ├── __init__.py                    # Package export declarations
│   ├── models.py                      # Data models, Enums, and Dataclasses
│   ├── blockchain.py                  # Consortium PoA Blockchain Ledger
│   ├── cbs_engine.py                  # Temenos T24 Double-Entry General Ledger
│   ├── credit_underwriting.py         # CRC/FirstCentral Bureau Scoring & DTI
│   ├── field_agency.py                # Marketer POS Terminals & Market Clusters
│   ├── ai_underwriter.py              # SHA-256 Forensic Tamper Hashing & Covenants
│   ├── api_server.py                  # Pure Python HTTP REST API Server (http.server)
│   ├── test_fincore.py                # Comprehensive Unit Test Suite
│   └── main.py                        # Complete 6-Step End-to-End Simulation
```

---

## 3. How to Run the Python System

### A. Run the Complete Banking Lifecycle Simulation
Executes loan intake, bureau scoring, document hashing, PoA block mining, T24 CBS double-entry disbursal, and marketer vault remittance:
```bash
python3 fincore_app.py
# or
python3 -m fincore_python.main
```

### B. Run the Automated Unit Test Suite
Executes unit tests verifying cryptographic hash linkage, reducing-balance loan amortization, double-entry GL balance preservation, and bureau risk tiers:
```bash
python3 fincore_app.py --test
# or
python3 -m unittest fincore_python.test_fincore
```

### C. Launch the Pure Python Standalone REST API Server
Starts an HTTP REST API server on port 8080 (or custom port):
```bash
python3 fincore_app.py --server 8080
```

---

## 4. Python Core Banking System (CBS) GL Accounts

| GL Account Number | Account Title | Type | Normal Balance |
|---|---|---|---|
| `GL-104020-LOANS-RETAIL` | Retail & SME Loans Asset | Asset | Debit (Dr) |
| `GL-200100-CUSTOMER-CURRENT` | Customer Current & Savings Deposits | Liability | Credit (Cr) |
| `GL-101010-BRANCH-VAULT` | Branch Cash in Vault Float | Asset | Debit (Dr) |
| `GL-200300-FIELD-AGENT-SUSPENSE` | Field Marketer Collection Suspense | Liability | Credit (Cr) |
| `GL-400100-INTEREST-INCOME` | Interest & Facility Fee Income | Revenue | Credit (Cr) |

---

## 5. Python REST API Endpoints (`api_server.py`)

- `GET /health`: Node status, CBS connectivity, and blockchain tip hash.
- `POST /api/credit-scoring/evaluate`: Multi-bureau credit scoring, DTI computation, and amortization schedules.
- `POST /api/documents/verify`: Computes tamper-proof SHA-256 digital document hashes.
- `POST /api/blockchain/record`: Mines and appends an immutable transaction block into the consortium PoA ledger.
- `POST /api/blockchain/verify-hash`: Cryptographically verifies a block hash or document fingerprint.
- `GET /api/blockchain/blocks`: Returns the full chain and validates cryptographic integrity.
- `POST /api/cbs/disburse`: Executes Temenos T24 disbursal with double-entry GL postings.
- `POST /api/field/remit`: Records market collections from marketer POS terminals into the branch vault.
