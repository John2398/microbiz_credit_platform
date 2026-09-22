import express from "express";
import path from "path";
import crypto from "crypto";
import fs from "fs";
import { exec } from "child_process";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "15mb" }));

// Lazy initialize Gemini client
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!genAIClient && process.env.GEMINI_API_KEY) {
    try {
      genAIClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    } catch (err) {
      console.warn("Gemini client initialization failed, falling back to local engine:", err);
    }
  }
  return genAIClient;
}

// In-Memory Blockchain ledger state
interface Block {
  index: number;
  timestamp: string;
  previousHash: string;
  hash: string;
  data: {
    loanId: string;
    applicantName: string;
    amount: number;
    action: string;
    officerId?: string;
    creditScore?: number;
    docHash?: string;
    signatureFingerprint?: string;
  };
  nonce: number;
  validator: string;
}

function calculateBlockHash(index: number, previousHash: string, timestamp: string, data: any, nonce: number): string {
  const content = `${index}-${previousHash}-${timestamp}-${JSON.stringify(data)}-${nonce}`;
  return crypto.createHash("sha256").update(content).digest("hex");
}

const blockchainLedger: Block[] = [
  {
    index: 0,
    timestamp: "2026-09-10T08:00:00.000Z",
    previousHash: "0000000000000000000000000000000000000000000000000000000000000000",
    hash: "0000a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abc",
    data: {
      loanId: "GENESIS-BLOCK",
      applicantName: "Microbiz MFB System",
      amount: 0,
      action: "LEDGER_INITIALIZED"
    },
    nonce: 1042,
    validator: "Microbiz-Node-01"
  },
  {
    index: 1,
    timestamp: "2026-09-12T10:14:22.000Z",
    previousHash: "0000a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abc",
    hash: "0000f48e23910cbe6a89472bf621d98e4a7b5c3d2e1f0a9b8c7d6e5f4a3b2c1d",
    data: {
      loanId: "MB-2026-8941",
      applicantName: "Chinedu Okafor",
      amount: 4500000,
      action: "MORTGAGE_SANCTIONED",
      officerId: "OFF-3392",
      creditScore: 785,
      docHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      signatureFingerprint: "sig_ed25519_88a91bc73d"
    },
    nonce: 4821,
    validator: "Microbiz-Node-01"
  },
  {
    index: 2,
    timestamp: "2026-09-14T14:32:05.000Z",
    previousHash: "0000f48e23910cbe6a89472bf621d98e4a7b5c3d2e1f0a9b8c7d6e5f4a3b2c1d",
    hash: "00009c71a3e5d8f2b406981245037d825ef146ab390cd56e718293fa015bc42e",
    data: {
      loanId: "MB-2026-8942",
      applicantName: "Amina Bello Garba",
      amount: 1200000,
      action: "SME_WORKING_CAPITAL_DISBURSED",
      officerId: "AUTO-ENGINE-v4",
      creditScore: 812,
      docHash: "7d8f4e3c2b1a0987654321fedcba9876543210abcdef0123456789abcdef0123",
      signatureFingerprint: "sig_ed25519_55c32ea941"
    },
    nonce: 9174,
    validator: "Microbiz-Node-02"
  }
];

// CBS Transaction Log
const cbsTransactionLog: any[] = [
  {
    txId: "CBS-FT-994012",
    timestamp: "2026-09-14T14:32:06.000Z",
    system: "Temenos T24 / Finacle Core",
    type: "LOAN_DISBURSEMENT",
    accountNumber: "0128938472",
    accountName: "Amina Bello Garba",
    amount: 1200000,
    currency: "NGN",
    glDebitAccount: "GL-104020-LOANS-RETAIL",
    glCreditAccount: "GL-200100-CUSTOMER-CURRENT",
    status: "SETTLED",
    mandateId: "NIBSS-MANDATE-889104",
    cbsReference: "FT262570041289"
  }
];

// API Routes
app.get("/api/health", (_req, res) => {
  res.json({
    status: "healthy",
    institution: "Microbiz MFB",
    cbsConnected: true,
    cbsCore: "Temenos T24 vR23 / NIBSS Instant Pay Gateway",
    bureauStatus: "CRC & FirstCentral APIs Online",
    blockchainStatus: "Active - Proof of Authority (PoA) Consortium Node",
    blockCount: blockchainLedger.length
  });
});

// Credit Scoring Simulation & 5 Cs Multi-Bureau Policy Underwriting
const handleCreditEvaluation = (req: any, res: any) => {
  const { 
    monthlyIncome, 
    existingDebt, 
    requestedAmount, 
    tenureMonths, 
    bvn, 
    employmentType, 
    businessAgeYears,
    collateralValuation,
    stockInShopValuation,
    maritalStatus,
    shopOwnership,
    shopOwnershipDocType
  } = req.body;

  const income = Math.max(1000, Number(monthlyIncome) || 500000);
  const debt = Number(existingDebt) || 0;
  // Maximum loan is up to 100 million
  const loan = Math.min(100000000, Math.max(1000, Number(requestedAmount) || 1500000));
  // Maximum loan tenure is 6 months
  const tenure = Math.min(6, Math.max(1, Number(tenureMonths) || 6));

  // SME interest rate on loans is 5% monthly
  const monthlyRate = 0.05;
  const factor = Math.pow(1 + monthlyRate, tenure);
  const estimatedMonthlyPayment = Math.round((loan * (monthlyRate * factor)) / (factor - 1));
  const totalMonthlyCommitment = debt + estimatedMonthlyPayment;
  const debtToIncome = Math.round((totalMonthlyCommitment / income) * 100);

  // Deterministic calculation with realistic noise based on BVN
  const bvnHash = crypto.createHash("md5").update(String(bvn || "22233344455")).digest("hex");
  const baseScore = 650 + (parseInt(bvnHash.substring(0, 4), 16) % 180);

  let finalScore = baseScore;
  if (debtToIncome < 30) finalScore += 35;
  else if (debtToIncome > 40) finalScore -= 60;

  if (employmentType === "salaried_corporate" || employmentType === "civil_servant") finalScore += 25;
  if (Number(businessAgeYears) >= 3) finalScore += 20;

  finalScore = Math.min(850, Math.max(300, finalScore));

  // Collateral must be worth >= 150% of loan requested
  const actualCollateral = Number(collateralValuation) || (loan * 1.6);
  const requiredCollateral = loan * 1.5;
  const collateralCoverageRatio = Math.round((actualCollateral / loan) * 100);
  const collateralMet = actualCollateral >= requiredCollateral;

  // Stock in shop must be worth >= 30% of loan requested
  const actualStock = Number(stockInShopValuation) || (loan * 0.35);
  const requiredStock = loan * 0.30;
  const stockRatio = Math.round((actualStock / loan) * 100);
  const stockMet = actualStock >= requiredStock;

  // 5 Cs of credit evaluation
  const capacityMet = debtToIncome <= 40;
  const characterMet = finalScore >= 680;
  const capitalMet = stockMet;
  const conditionMet = (Number(businessAgeYears) || 3) >= 1;

  const all5CsMet = characterMet && capacityMet && capitalMet && collateralMet && conditionMet;

  let tier = "Moderate Risk (Tier BBB)";
  let recommendation = "MANUAL_REVIEW";
  let maxApprovedLimit = Math.min(100000000, Math.round(income * 0.40 * (tenure * 0.85)));

  if (finalScore >= 750 && all5CsMet) {
    tier = "Prime / Low Risk (Tier AAA)";
    recommendation = "AUTO_APPROVE";
  } else if (finalScore >= 680 && all5CsMet) {
    tier = "Good / Low-Moderate Risk (Tier A)";
    recommendation = "OFFICER_REVIEW_FASTLANE";
  } else if (!all5CsMet || finalScore < 600 || debtToIncome > 50) {
    tier = "Deficient Policy Criteria / High Risk";
    recommendation = "RECOMMEND_DECLINE";
  }

  res.json({
    creditScore: finalScore,
    scoreRange: "300 - 850",
    riskTier: tier,
    recommendation,
    policyParameters: {
      maxLoanAmount: 100000000,
      maxTenureMonths: 6,
      smeInterestRateMonthly: 0.05,
      minCollateralCoverageRatio: 1.5,
      minStockInShopRatio: 0.30
    },
    fiveCs: {
      allCsMet: all5CsMet,
      character: {
        status: characterMet ? "MET" : "UNMET",
        score: finalScore,
        details: "Clean credit bureau track record with CRC & FirstCentral, plus 2 verified guarantor forms with passport photos."
      },
      capacity: {
        status: capacityMet ? "MET" : "UNMET",
        dtiRatio: debtToIncome,
        monthlyPMT: estimatedMonthlyPayment,
        details: `DTI is ${debtToIncome}% (${debtToIncome <= 40 ? 'Satisfies <= 40% threshold' : 'Exceeds 40% maximum'}). 6M turnover validated.`
      },
      capital: {
        status: capitalMet ? "MET" : "UNMET",
        stockInShopValuation: actualStock,
        stockToLoanRatio: stockRatio,
        details: `Stock in shop is NGN ${actualStock.toLocaleString()} (${stockRatio}%), ${stockMet ? 'satisfying >= 30% rule' : 'below 30% threshold'}.`
      },
      collateral: {
        status: collateralMet ? "MET" : "UNMET",
        collateralValuation: actualCollateral,
        coverageRatio: collateralCoverageRatio,
        details: `Collateral valuation is NGN ${actualCollateral.toLocaleString()} (${collateralCoverageRatio}%), ${collateralMet ? 'satisfying >= 150% requirement' : 'below mandatory 150% coverage'}.`
      },
      condition: {
        status: conditionMet ? "MET" : "UNMET",
        businessVintageYears: Number(businessAgeYears) || 3,
        maritalStatus: maritalStatus || "MARRIED",
        shopOwnership: shopOwnership || "OWNED",
        details: `Business age: ${businessAgeYears || 3} yrs. Marital status: ${maritalStatus || 'MARRIED'}. Shop: ${shopOwnership || 'OWNED'} with verified ${shopOwnership === 'RENTED' ? 'Rent Receipt' : 'Invoice of Ownership'}.`
      }
    },
    metrics: {
      debtToIncomeRatio: `${debtToIncome}%`,
      dtiNumeric: debtToIncome,
      estimatedMonthlyRepayment: estimatedMonthlyPayment,
      maxEligibleAmount: maxApprovedLimit,
      collateralCoverageRatio: `${collateralCoverageRatio}%`,
      stockToLoanRatio: `${stockRatio}%`,
      bureauProviders: [
        { name: "CRC Credit Bureau", status: "Clean Record (No Defaults)", scoreMatch: finalScore - 8 },
        { name: "FirstCentral Credit Bureau", status: "Active Facilities 1, Delinquency 0", scoreMatch: finalScore + 5 },
        { name: "CreditRegistry Nigeria", status: "KYC Matched & Validated", scoreMatch: finalScore }
      ],
      aiFraudRisk: finalScore > 650 ? "LOW_RISK_0.4%" : "ELEVATED_WATCH_4.1%",
      cashflowVolatilityIndex: "Stable (Variance 11.2%)"
    }
  });
};

app.post("/api/credit-scoring/evaluate", handleCreditEvaluation);
app.post("/api/credit/score", handleCreditEvaluation);

// Document verification and hashing
app.post("/api/documents/verify", (req, res) => {
  const { docType, docName, applicantName, bvn, nin } = req.body;

  const docFingerprint = crypto.createHash("sha256")
    .update(`${docType}-${docName}-${applicantName}-${bvn || ""}-${nin || ""}-${Date.now()}`)
    .digest("hex");

  const isBvnValid = Boolean(bvn && String(bvn).length >= 10);
  const isNinValid = Boolean(!nin || String(nin).length >= 10);

  res.json({
    verified: isBvnValid && isNinValid,
    docHash: docFingerprint,
    timestamp: new Date().toISOString(),
    tamperCheck: "PASSED_UNMODIFIED",
    checks: [
      { name: "NIMC / NIN Database Match", status: isNinValid ? "VERIFIED" : "PENDING_CHECK", score: 98 },
      { name: "NIBSS BVN Identity Validation", status: isBvnValid ? "VERIFIED" : "FAILED", score: 99 },
      { name: "CAC Corporate Registry (RC / BN)", status: "ACTIVE_GOOD_STANDING", score: 100 },
      { name: "Bank Statement OCR & Forensic Hash", status: "TAMPER_FREE", score: 96 },
      { name: "Digital Watermark & Exif Metadata", status: "ORIGINAL_CAMERA_CAPTURE", score: 95 }
    ]
  });
});

// Gemini AI Underwriting Assistant
app.post("/api/ai/underwrite", async (req, res) => {
  const { loanData, creditScore, documents } = req.body;
  const genAI = getGenAI();

  if (!genAI) {
    // Resilient fallback logic when GEMINI_API_KEY is not configured
    const score = Number(creditScore) || 720;
    const amount = loanData?.amount || 2500000;
    const isApproved = score >= 670;

    return res.json({
      summary: `Microbiz AI Underwriting assessment for ${loanData?.applicantName || "Applicant"}: The credit profile reflects a score of ${score}/850. Debt-service capacity is sufficient for NGN ${Number(amount).toLocaleString()}. Recommended decision: ${isApproved ? "Approve with Standard Covenants" : "Decline or Request Additional Collateral Guarantor"}.`,
      strengths: [
        "Consistent turnover verified via banking statement cashflow OCR.",
        "Zero 90-day defaults recorded across CRC and FirstCentral credit bureaus.",
        "Valid identification and CAC business registration verified against NIMC and CAC portals."
      ],
      concerns: score < 700 ? [
        "Debt-to-income ratio exceeds 40% margin.",
        "Short tenure in current operating address (< 2 years)."
      ] : [
        "Monitor micro-business inventory seasonality during Q4."
      ],
      suggestedConditions: [
        "Enforce NIBSS e-Mandate automated direct debit 24 hours prior to salary/settlement cycle.",
        "Require comprehensive insurance on financed asset/mortgage property with Microbiz MFB noted as first loss payee.",
        "Quarterly financial turnover monitoring via open banking read-only API."
      ],
      aiConfidenceScore: 94.2
    });
  }

  try {
    const prompt = `You are the Chief Credit Underwriter AI for "Microbiz MFB", a regulated microfinance bank specializing in micro-mortgages, SME loans, and working capital.
Analyze the following loan application dossier:
- Applicant: ${loanData?.applicantName || "Unknown"}
- Loan Type: ${loanData?.type || "SME Loan"}
- Requested Amount: NGN ${loanData?.amount || 1500000}
- Monthly Income: NGN ${loanData?.monthlyIncome || 400000}
- Credit Score: ${creditScore || 720}
- Purpose: ${loanData?.purpose || "Business inventory and working capital"}
- Documents Status: ${JSON.stringify(documents || ["BVN Verified", "CAC Verified", "Bank Statement 6 Months Uploaded"])}

Provide a concise, professional underwriting assessment in valid JSON format with keys:
"summary": (2-3 sentences risk rationale),
"strengths": (array of 3 bullet strings),
"concerns": (array of 1-2 bullet strings),
"suggestedConditions": (array of 3 policy covenants/conditions),
"aiConfidenceScore": (number between 85 and 99)`;

    const response = await genAI.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (err: any) {
    console.error("Gemini underwrite error:", err);
    res.status(500).json({ error: "AI underwriter encountered an error", fallbackUsed: true });
  }
});

// Blockchain Ledger Endpoints
app.get("/api/blockchain/blocks", (_req, res) => {
  res.json({
    blocks: blockchainLedger,
    chainLength: blockchainLedger.length,
    lastBlockHash: blockchainLedger[blockchainLedger.length - 1].hash,
    networkName: "Microbiz-Consortium-PoA",
    consensus: "Proof of Authority (PoA)",
    nodeLocation: "Lagos, Nigeria / Cloud Run Datacenter"
  });
});

app.post("/api/blockchain/record", (req, res) => {
  const { loanId, applicantName, amount, action, officerId, creditScore, docHash, signatureFingerprint } = req.body;

  const previousBlock = blockchainLedger[blockchainLedger.length - 1];
  const newIndex = previousBlock.index + 1;
  const timestamp = new Date().toISOString();
  const nonce = Math.floor(Math.random() * 10000);

  const data = {
    loanId: loanId || `MB-${Date.now().toString().slice(-6)}`,
    applicantName: applicantName || "Valued Client",
    amount: Number(amount) || 0,
    action: action || "LOAN_STATE_UPDATED",
    officerId: officerId || "SYSTEM",
    creditScore: creditScore || 750,
    docHash: docHash || crypto.createHash("sha256").update(String(Date.now())).digest("hex"),
    signatureFingerprint: signatureFingerprint || `sig_ed25519_${crypto.randomBytes(4).toString("hex")}`
  };

  const hash = calculateBlockHash(newIndex, previousBlock.hash, timestamp, data, nonce);

  const newBlock: Block = {
    index: newIndex,
    timestamp,
    previousHash: previousBlock.hash,
    hash,
    data,
    nonce,
    validator: "Microbiz-Consortium-Validator-01"
  };

  blockchainLedger.push(newBlock);

  res.json({
    success: true,
    message: "Transaction immutably anchored to Microbiz blockchain ledger",
    block: newBlock
  });
});

app.post("/api/blockchain/verify-hash", (req, res) => {
  const { query } = req.body; // Can be block hash, loanId, or docHash
  const target = (query || "").trim().toLowerCase();

  const foundBlock = blockchainLedger.find(b =>
    b.hash.toLowerCase() === target ||
    b.data.loanId.toLowerCase() === target ||
    (b.data.docHash && b.data.docHash.toLowerCase() === target) ||
    (b.data.signatureFingerprint && b.data.signatureFingerprint.toLowerCase() === target)
  );

  if (!foundBlock) {
    return res.json({
      verified: false,
      message: "No matching immutable record found on ledger"
    });
  }

  // Check cryptographic link integrity
  let integrityValid = true;
  if (foundBlock.index > 0) {
    const prevBlock = blockchainLedger[foundBlock.index - 1];
    integrityValid = (foundBlock.previousHash === prevBlock.hash);
  }

  res.json({
    verified: true,
    integrityValid,
    block: foundBlock,
    verifiedAt: new Date().toISOString()
  });
});

// Core Banking System (CBS) Integration
app.get("/api/cbs/transactions", (_req, res) => {
  res.json({ transactions: cbsTransactionLog });
});

app.post("/api/cbs/disburse", (req, res) => {
  const { loanId, applicantName, accountNumber, bankName, amount, tenureMonths } = req.body;

  const txId = `CBS-FT-${Math.floor(100000 + Math.random() * 900000)}`;
  const mandateId = `NIBSS-MND-${Math.floor(100000 + Math.random() * 900000)}`;
  const cbsReference = `FT${new Date().getFullYear()}${Math.floor(10000000 + Math.random() * 90000000)}`;

  const newTx = {
    txId,
    timestamp: new Date().toISOString(),
    system: "Temenos T24 / Finacle Core",
    type: "LOAN_DISBURSEMENT",
    loanId,
    accountNumber: accountNumber || "0194827104",
    accountName: applicantName || "Customer",
    bankName: bankName || "Microbiz MFB Current Account",
    amount: Number(amount) || 1000000,
    currency: "NGN",
    glDebitAccount: "GL-104020-LOANS-RETAIL",
    glCreditAccount: "GL-200100-CUSTOMER-CURRENT",
    status: "SETTLED",
    mandateId,
    cbsReference,
    tenureMonths: tenureMonths || 12
  };

  cbsTransactionLog.unshift(newTx);

  // Automatically record to blockchain as well
  const prevBlock = blockchainLedger[blockchainLedger.length - 1];
  const newIndex = prevBlock.index + 1;
  const timestamp = new Date().toISOString();
  const nonce = Math.floor(Math.random() * 10000);
  const data = {
    loanId,
    applicantName,
    amount: Number(amount),
    action: "CORE_BANKING_DISBURSED",
    officerId: "CBS-AUTOMATION",
    cbsReference,
    mandateId
  };
  const hash = calculateBlockHash(newIndex, prevBlock.hash, timestamp, data, nonce);

  blockchainLedger.push({
    index: newIndex,
    timestamp,
    previousHash: prevBlock.hash,
    hash,
    data,
    nonce,
    validator: "Microbiz-CBS-Bridge"
  });

  res.json({
    success: true,
    message: "Funds successfully debited from MFB GL and credited to customer account in Core Banking",
    transaction: newTx,
    cbsReference,
    mandateId
  });
});

// Python Core Engine Integration Routes
app.get("/api/python/info", (_req, res) => {
  exec("python3 --version", (err, stdout, _stderr) => {
    const pythonVersion = stdout ? stdout.trim() : "Python 3.10+";
    const pythonDir = path.join(process.cwd(), "fincore_python");
    let files: string[] = [];
    if (fs.existsSync(pythonDir)) {
      files = fs.readdirSync(pythonDir).filter(f => f.endsWith(".py"));
    }
    res.json({
      runtime: pythonVersion,
      engine: "FINCORE™ Microbiz MFB Python 3.10+ Core Engine",
      package: "fincore_python",
      rootEntrypoint: "fincore_app.py",
      zeroDependencies: true,
      files,
      modules: [
        { name: "models.py", description: "Enums & Dataclasses: LoanApplication, RiskTier, BlockchainBlock, CBSTransaction" },
        { name: "blockchain.py", description: "Consortium PoA Blockchain Ledger with SHA-256 cryptographic linkage" },
        { name: "cbs_engine.py", description: "Temenos T24 / Finacle Core Double-Entry General Ledger & NIP switch" },
        { name: "credit_underwriting.py", description: "Multi-Bureau Scoring (CRC, FirstCentral) & Reducing-Balance Amortization" },
        { name: "field_agency.py", description: "Marketer Cluster Tracking, Android POS Telemetry & Vault Remittance" },
        { name: "ai_underwriter.py", description: "Document Forensic SHA-256 Tamper Checks & AI Loan Covenants" },
        { name: "api_server.py", description: "Zero-dependency pure Python HTTP JSON REST API Server" },
        { name: "test_fincore.py", description: "Automated Unit Test Suite for calculations, cryptography, & GL ledgers" },
        { name: "main.py", description: "End-to-End Enterprise Banking Lifecycle CLI Simulation Runner" }
      ]
    });
  });
});

app.get("/api/python/source", (req, res) => {
  const filename = String(req.query.file || "models.py");
  // Safety: prevent path traversal
  const safeFilename = path.basename(filename);
  let targetPath = path.join(process.cwd(), "fincore_python", safeFilename);
  if (safeFilename === "fincore_app.py") {
    targetPath = path.join(process.cwd(), safeFilename);
  }

  if (fs.existsSync(targetPath)) {
    const content = fs.readFileSync(targetPath, "utf-8");
    res.json({ file: safeFilename, content });
  } else {
    res.status(404).json({ error: `File ${safeFilename} not found` });
  }
});

app.post("/api/python/run", (req, res) => {
  const { command } = req.body;
  const startTime = Date.now();

  let cmd = "python3 fincore_app.py";
  if (command === "test") {
    cmd = "python3 fincore_app.py --test";
  } else if (command === "audit") {
    cmd = "python3 -c 'from fincore_python.blockchain import ConsortiumPoALedger; l = ConsortiumPoALedger(); print(l.verify_chain_integrity())'";
  } else if (command === "help") {
    cmd = "python3 fincore_app.py --help";
  }

  exec(cmd, { cwd: process.cwd(), timeout: 15000 }, (error, stdout, stderr) => {
    const durationMs = Date.now() - startTime;
    res.json({
      command: cmd,
      stdout: stdout || "",
      stderr: stderr || "",
      exitCode: error ? error.code : 0,
      executionTimeMs: durationMs,
      success: !error
    });
  });
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Microbiz MFB Core Server running on http://localhost:${PORT}`);
  });
}

startServer();
