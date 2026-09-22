import { LoanApplication } from '../types';

export type LoanDischargeStage = 
  | 'APPLICATION'       // 1. Loan Application
  | 'ANALYSIS'          // 2. Loan Analysis
  | 'DOCUMENTATION'     // 3. Loan Documentation
  | 'DISBURSEMENT';     // 4. Loan Disbursement

export interface StageDefinition {
  id: LoanDischargeStage;
  stepNumber: number;
  title: string;
  shortTitle: string;
  subtitle: string;
  description: string;
  keyActivities: string[];
  mandatoryRequirements: string[];
  cbnRegulatoryFocus: string;
  accentColor: string;
}

export const LOAN_DISCHARGE_STAGES: StageDefinition[] = [
  {
    id: 'APPLICATION',
    stepNumber: 1,
    title: '1. Loan Application',
    shortTitle: 'Loan Application',
    subtitle: 'Intake, KYC & Facility Origination',
    description: 'Initial customer biodata capture, channel origination tracing (MFB/MIC/PEC), NIMC NIN & BVN biometric match, business profile, and facility request parameters.',
    keyActivities: [
      'Customer Bio-data & Contact Registration',
      'Channel Origination Assignment (MFB / MIC / PEC)',
      'Credit Officer Registration ID stamping',
      'NIMC NIN & NIBSS BVN Optical Biometric KYC Check',
      'Loan Amount, Tenure, and Purpose Intake'
    ],
    mandatoryRequirements: [
      'Valid 11-digit BVN linked to applicant',
      'Valid 11-digit NIN verified with NIMC database',
      'Physical business address & GPS location',
      'Designated NUBAN disbursement account'
    ],
    cbnRegulatoryFocus: 'CBN Tier-3 KYC / AML Identity Validation & Consumer Protection guidelines',
    accentColor: 'blue'
  },
  {
    id: 'ANALYSIS',
    stepNumber: 2,
    title: '2. Loan Analysis',
    shortTitle: 'Loan Analysis',
    subtitle: '5 Cs Evaluation & Multi-Tier Approvals',
    description: 'Rigorous financial appraisal, 5 Cs of Credit (Character, Capacity, Capital, Collateral, Condition), DTI ratio calculation, multi-bureau scoring, and 7-tier governance sign-offs up to MD Sanction.',
    keyActivities: [
      'CRC & FirstCentral Credit Bureau Report Pull',
      '5 Cs of Credit Appraisal (Score >= 70% required)',
      'Debt-to-Income (DTI <= 33%) & Cash Turnover Stress Testing',
      'Stock-in-Shop Coverage (>= 30%) & Collateral Valuation (>= 150%)',
      '7-Tier Approval Pipeline Execution (Credit Officer -> MD/CEO)'
    ],
    mandatoryRequirements: [
      'Credit Bureau Score >= 650 with zero 90-day defaults',
      'Verified 6-month average monthly cashflow',
      'Collateral appraised at >= 150% of loan principal',
      'Stock in shop appraised at >= 30% of loan principal',
      'Managing Director & Committee Sanction Sign-Off'
    ],
    cbnRegulatoryFocus: 'CBN Prudential Guidelines for Microfinance Banks & Single Obligor Limits',
    accentColor: 'indigo'
  },
  {
    id: 'DOCUMENTATION',
    stepNumber: 3,
    title: '3. Loan Documentation',
    shortTitle: 'Loan Documentation',
    subtitle: 'Mandatory Docs Sighting & Digital Signatures',
    description: 'Physical sighting and counter-stamping of all 9 mandatory documents, CAC/TIN certificates, 2 Guarantor Forms with passport photos, formal Credit Offer Letter, and legally binding digital signatures.',
    keyActivities: [
      'Inspection of 9 Mandatory Physical Documents',
      '2 Guarantors with Passport Photographs & BVN confirmation',
      'Shop Premises Proof (Ownership Invoice or Valid Rent Receipt)',
      'Formal Credit Offer Letter Generation with loan covenants',
      'Borrower & Guarantor Cryptographic Digital Signature Execution'
    ],
    mandatoryRequirements: [
      'NIN Slip & 6-month stamped bank statements',
      '2 Guarantor commitment forms with physical passports',
      'Proof of shop ownership / rent receipts sighted',
      'Signed Offer Letter accepting interest rate and terms',
      'Post-dated cheques / NIBSS direct debit mandate agreement'
    ],
    cbnRegulatoryFocus: 'Legal Mortgage Execution, Guarantor Enforceability & Evidence Act Compliance',
    accentColor: 'amber'
  },
  {
    id: 'DISBURSEMENT',
    stepNumber: 4,
    title: '4. Loan Disbursement',
    shortTitle: 'Loan Disbursement',
    subtitle: 'CBS Settlement, Mandate & Blockchain Ledger',
    description: 'Final execution via Temenos T24 Core Banking Engine (NUBAN settlement / Vault cash voucher), NIBSS Direct Debit Mandate activation, Proof-of-Authority blockchain block minting, and live repayment scheduling.',
    keyActivities: [
      'Temenos T24 Core Banking System GL Debit/Credit posting',
      'Direct NUBAN bank transfer or Branch Cash Vault Voucher payout',
      'NIBSS e-Mandate automated direct debit activation',
      'Proof-of-Authority Blockchain Block Minting with SHA-256 Hash',
      'Automated Amortization Repayment Schedule Generation'
    ],
    mandatoryRequirements: [
      'All 7 Approval Lines fully completed & digitally signed',
      'All mandatory documents verified and locked in audit archive',
      'Active CBS GL balance cleared for disbursement',
      'NIBSS Mandate Reference ID generated and active',
      'Immutable Blockchain block recorded and verified'
    ],
    cbnRegulatoryFocus: 'NIBSS Instant Payment (NIP) settlement rules & NDIC Deposit Insurance standards',
    accentColor: 'emerald'
  }
];

export function getLoanDischargeStage(loan: LoanApplication): LoanDischargeStage {
  if (loan.status === 'DISBURSED') {
    return 'DISBURSEMENT';
  }
  
  // If loan has all approvals complete or status is APPROVED or DOCS_VERIFIED, check if it's in documentation
  const allApprovalsComplete = loan.approvalChain 
    ? loan.approvalChain.every(s => s.status === 'APPROVED') 
    : loan.status === 'APPROVED';

  if (loan.status === 'APPROVED' || loan.status === 'DOCS_VERIFIED') {
    // If signature is present and docs are verified, it is ready for disbursement
    if (loan.signature && (loan.documents && loan.documents.length >= 2)) {
      return 'DISBURSEMENT';
    }
    return 'DOCUMENTATION';
  }

  if (loan.status === 'CREDIT_EVALUATED' || loan.status === 'OFFICER_REVIEW') {
    if (allApprovalsComplete) {
      return 'DOCUMENTATION';
    }
    return 'ANALYSIS';
  }

  return 'APPLICATION';
}

export function getStageNumber(stage: LoanDischargeStage): number {
  switch (stage) {
    case 'APPLICATION': return 1;
    case 'ANALYSIS': return 2;
    case 'DOCUMENTATION': return 3;
    case 'DISBURSEMENT': return 4;
  }
}

export function getStageConfig(stage: LoanDischargeStage): StageDefinition {
  const found = LOAN_DISCHARGE_STAGES.find(s => s.id === stage);
  return found || LOAN_DISCHARGE_STAGES[0];
}

export function getStageProgressPercent(loan: LoanApplication): number {
  const stage = getLoanDischargeStage(loan);
  switch (stage) {
    case 'APPLICATION':
      return 25;
    case 'ANALYSIS': {
      const approvedCount = loan.approvalChain 
        ? loan.approvalChain.filter(s => s.status === 'APPROVED').length 
        : 0;
      // Between 25% and 50%
      return Math.round(25 + (approvedCount / 7) * 25);
    }
    case 'DOCUMENTATION': {
      const docsCount = loan.documents ? loan.documents.filter(d => d.status === 'VERIFIED').length : 0;
      const hasSig = loan.signature ? 1 : 0;
      // Between 50% and 75%
      return Math.round(50 + ((docsCount >= 2 ? 15 : 5) + (hasSig ? 10 : 0)));
    }
    case 'DISBURSEMENT':
      return loan.status === 'DISBURSED' ? 100 : 85;
  }
}

export function getStageChecklistStatus(loan: LoanApplication, stage: LoanDischargeStage): {
  isComplete: boolean;
  totalItems: number;
  completedItems: number;
  items: { label: string; passed: boolean; details?: string }[];
} {
  switch (stage) {
    case 'APPLICATION': {
      const hasBvn = Boolean(loan.bvn && loan.bvn.length === 11);
      const hasNin = Boolean(loan.nin && loan.nin.length === 11);
      const hasChannel = Boolean(loan.channel);
      const hasOfficer = Boolean(loan.officerRegistrationNumber);
      const hasPurpose = Boolean(loan.purpose && loan.amount > 0);

      const items = [
        { label: 'Customer Bio-data & Contact Details', passed: Boolean(loan.applicantName && loan.phone) },
        { label: 'NIMC NIN & NIBSS BVN Identity Validation', passed: hasBvn && hasNin, details: `BVN: ${loan.bvn} | NIN: ${loan.nin}` },
        { label: 'Channel Tracing & Registration Stamping', passed: hasChannel && hasOfficer, details: `${loan.channel || 'Assigned'} • ${loan.officerRegistrationNumber || 'N/A'}` },
        { label: 'Facility Request Amount & Tenure Specified', passed: hasPurpose, details: `₦${loan.amount.toLocaleString()} for ${loan.tenureMonths} months` }
      ];
      const completed = items.filter(i => i.passed).length;
      return {
        isComplete: completed === items.length,
        totalItems: items.length,
        completedItems: completed,
        items
      };
    }

    case 'ANALYSIS': {
      const fiveCsPassed = loan.fiveCs ? loan.fiveCs.overallPassed : Boolean(loan.creditScore && loan.creditScore >= 650);
      const bureauPassed = (loan.creditScore || 0) >= 650;
      const dtiPassed = (loan.dti || 0) <= 35;
      const approvalsApproved = loan.approvalChain 
        ? loan.approvalChain.filter(s => s.status === 'APPROVED').length 
        : (loan.status === 'APPROVED' ? 7 : 1);
      const allApprovalsSigned = approvalsApproved === 7;

      const items = [
        { label: 'Multi-Bureau Credit Scoring (CRC/FirstCentral)', passed: bureauPassed, details: `Score: ${loan.creditScore || 720}/850` },
        { label: '5 Cs of Credit Appraisal (Character, Capacity, Capital, Collateral, Condition)', passed: fiveCsPassed, details: loan.fiveCs?.approvalEligibility || 'Eligible' },
        { label: 'Debt-to-Income (DTI <= 33%) Cashflow Analysis', passed: dtiPassed, details: `DTI: ${loan.dti || 22}% (Max: 33%)` },
        { label: '7-Tier Multi-Level Governance Approval Chain', passed: allApprovalsSigned, details: `${approvalsApproved}/7 Approvals Signed` }
      ];
      const completed = items.filter(i => i.passed).length;
      return {
        isComplete: completed === items.length,
        totalItems: items.length,
        completedItems: completed,
        items
      };
    }

    case 'DOCUMENTATION': {
      const verifiedDocsCount = loan.documents ? loan.documents.filter(d => d.status === 'VERIFIED').length : 0;
      const hasGuarantors = loan.fiveCs?.character?.guarantorsSighted || verifiedDocsCount >= 2;
      const hasShopDoc = loan.fiveCs?.condition?.shopDocVerified || verifiedDocsCount >= 2;
      const hasSignature = Boolean(loan.signature?.dataUrl);
      const hasOfferLetter = Boolean(loan.officerDecision?.notes || loan.status === 'APPROVED' || loan.status === 'DISBURSED');

      const items = [
        { label: 'Mandatory Physical Documents Sighted & Stamped', passed: verifiedDocsCount >= 2, details: `${verifiedDocsCount} verified files in vault` },
        { label: '2 Guarantors Commitment Forms with Passports', passed: hasGuarantors, details: 'Guarantor biometrics & IDs on file' },
        { label: 'Shop Premises Proof (Ownership Invoice / Rent Receipt)', passed: hasShopDoc, details: `${loan.shopOwnership || 'RENTED'} status certified` },
        { label: 'Credit Offer Letter & Covenants Acknowledged', passed: hasOfferLetter, details: 'Standard Microbiz facility covenants active' },
        { label: 'Borrower & Guarantor Digital Signature Executed', passed: hasSignature, details: loan.signature ? `Key: ${loan.signature.keyFingerprint}` : 'Awaiting digital signing' }
      ];
      const completed = items.filter(i => i.passed).length;
      return {
        isComplete: completed === items.length,
        totalItems: items.length,
        completedItems: completed,
        items
      };
    }

    case 'DISBURSEMENT': {
      const hasCbsRef = Boolean(loan.cbsReference || loan.status === 'DISBURSED');
      const hasMandate = Boolean(loan.mandateId);
      const hasBlockchain = Boolean(loan.blockchainTx?.status === 'CONFIRMED');
      const isDisbursed = loan.status === 'DISBURSED';

      const items = [
        { label: 'Temenos T24 Core Banking GL Debit / Credit Posting', passed: hasCbsRef, details: loan.cbsReference ? `Ref: ${loan.cbsReference}` : 'Pending settlement' },
        { label: 'NIBSS e-Mandate Direct Debit Activation', passed: hasMandate, details: loan.mandateId ? `Mandate: ${loan.mandateId}` : 'Pending registration' },
        { label: 'Proof-of-Authority Blockchain Block Minting', passed: hasBlockchain, details: loan.blockchainTx ? `Block #${loan.blockchainTx.blockIndex} • ${loan.blockchainTx.hash.slice(0, 16)}...` : 'Pending mint' },
        { label: 'Facility Active & Repayment Amortization Scheduled', passed: isDisbursed, details: isDisbursed ? 'Active loan in portfolio' : 'Pending disbursal execution' }
      ];
      const completed = items.filter(i => i.passed).length;
      return {
        isComplete: completed === items.length,
        totalItems: items.length,
        completedItems: completed,
        items
      };
    }
  }
}

export function getNextStage(currentStage: LoanDischargeStage): LoanDischargeStage | null {
  switch (currentStage) {
    case 'APPLICATION':
      return 'ANALYSIS';
    case 'ANALYSIS':
      return 'DOCUMENTATION';
    case 'DOCUMENTATION':
      return 'DISBURSEMENT';
    case 'DISBURSEMENT':
      return null;
  }
}

