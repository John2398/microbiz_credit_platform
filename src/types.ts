export type MicrobizChannel = 
  | 'MICROBIZ_INCLUSION_CENTRE'
  | 'MICROBIZ_MFB'
  | 'PEAK_EMPOWERMENT_CENTRE';

export interface CreditOfficerRegistration {
  officerId: string;
  officerName: string;
  registrationNumber: string; // e.g. "REG/MFB/CO-3392", "REG/MIC/CO-1088", "REG/PEC/CO-5514"
  channel: MicrobizChannel;
  channelName: string;
  branch?: string;
  role: string;
  licensedSince: string;
  status: 'ACTIVE_REGISTERED' | 'PROVISIONAL';
}

export type LoanType = 
  | 'SABI_TRADER'
  | 'BETTABIZ_SME'
  | 'MINIMONIE_GROUP'
  | 'MICRO_MORTGAGE'
  | 'SME_WORKING_CAPITAL'
  | 'EQUIPMENT_FINANCE' 
  | 'AGRO_LOAN';

export type LoanStatus = 
  | 'SUBMITTED' 
  | 'DOCS_VERIFIED' 
  | 'CREDIT_EVALUATED' 
  | 'OFFICER_REVIEW' 
  | 'APPROVED' 
  | 'DISBURSED' 
  | 'REJECTED';

export type MaritalStatus = 'MARRIED' | 'SINGLE' | 'DIVORCED' | 'WIDOWED';
export type ShopOwnershipType = 'OWNED' | 'RENTED';

export type RequiredDocumentCategory =
  | 'NIN_SLIP'
  | 'BANK_STATEMENTS_6M'
  | 'GUARANTORS_FORMS_2_PASSPORTS'
  | 'PROOF_OF_ADDRESS'
  | 'BORROWER_PASSPORT_PHOTO'
  | 'CAC_CERTIFICATE'
  | 'TIN_DOCUMENT'
  | 'COLLATERAL_DOCUMENTS'
  | 'POST_DATED_CHEQUES'
  | 'SHOP_OWNERSHIP_INVOICE'
  | 'SHOP_RENT_RECEIPT';

export interface VerifiedDocument {
  id: string;
  name: string;
  type: 
    | 'GOVERNMENT_ID' 
    | 'BVN_NIN' 
    | 'BANK_STATEMENT' 
    | 'CAC_REGISTRATION' 
    | 'TITLE_DEED'
    | RequiredDocumentCategory;
  category?: RequiredDocumentCategory;
  status: 'VERIFIED' | 'PENDING' | 'FLAGGED';
  hash: string;
  size: string;
  verifiedAt?: string;
  extractedDetails?: {
    label: string;
    value: string;
  }[];
}

export interface FiveCsEvaluation {
  character: {
    status: 'MET' | 'UNMET';
    score: number; // 0 - 100
    bureauSummary: string;
    bvnNinCheck: 'VERIFIED' | 'FAILED';
    guarantorsSighted: boolean; // 2 guarantors with passport photographs
    notes: string;
  };
  capacity: {
    status: 'MET' | 'UNMET';
    score: number;
    dtiRatio: number; // percentage
    monthlyTurnover: number;
    monthlyInstallment: number;
    sixMonthsStatementsVerified: boolean;
    notes: string;
  };
  capital: {
    status: 'MET' | 'UNMET';
    score: number;
    ownerEquity: number;
    stockInShopValuation: number;
    stockToLoanRatio: number; // percentage (must be >= 30%)
    stockRequirementMet: boolean; // stock >= 30% of loan requested
    notes: string;
  };
  collateral: {
    status: 'MET' | 'UNMET';
    score: number;
    collateralValuation: number;
    coverageRatio: number; // percentage (must be >= 150%)
    collateralRequirementMet: boolean; // collateral >= 150% of loan requested
    collateralDocsVerified: boolean;
    notes: string;
  };
  condition: {
    status: 'MET' | 'UNMET';
    score: number;
    businessVintageYears: number; // length of business counts
    businessVintageMet: boolean;
    maritalStatus: MaritalStatus;
    shopOwnership: ShopOwnershipType;
    shopProofDocumentType: 'OWNERSHIP_INVOICE' | 'RENT_RECEIPT';
    shopDocVerified: boolean;
    macroIndustryRisk: string;
    notes: string;
  };
  overallPassed: boolean;
  approvalEligibility: 'ELIGIBLE_FOR_SANCTION' | 'INELIGIBLE_DEFICIENT_CRITERIA';
}

export type ApprovalLevel = 
  | 'CREDIT_OFFICER'
  | 'TEAM_LEAD'
  | 'HEAD_OF_CREDIT_RISK'
  | 'HEAD_OF_SME'
  | 'HEAD_OF_AUDIT'
  | 'EXECUTIVE_DIRECTOR'
  | 'MANAGING_DIRECTOR';

export interface ApprovalSignoff {
  level: ApprovalLevel;
  levelOrder: number; // 1 to 7
  roleTitle: string;
  signatoryName: string;
  officerId: string;
  registrationNumber: string;
  status: 'PENDING' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED' | 'QUERIED';
  decision?: 'APPROVED' | 'REJECTED' | 'QUERIED' | null;
  comments?: string;
  signatureDataUrl?: string;
  keyFingerprint?: string;
  signedAt?: string; // ISO string
  signedAtFormatted?: string;
  ipAddress?: string;
  recommendedAmount?: number;
  conditions?: string[];
}

export interface AuditTrailEvent {
  id: string;
  timestamp: string; // ISO datetime
  formattedDatetime: string; // e.g. "Sep 16, 2026, 12:44:02 PM"
  actorName: string;
  actorRole: string;
  actorRegistrationNumber?: string;
  stage: string;
  action: string;
  status: 'SUCCESS' | 'WARNING' | 'INFO' | 'ACTION_REQUIRED' | 'REJECTED';
  notes?: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface DigitalSignature {
  dataUrl: string;
  timestamp: string;
  signatoryName: string;
  bvn: string;
  keyFingerprint: string;
  ipAddress: string;
}

export interface RepaymentInstallment {
  installmentNo: number;
  dueDate: string;
  amount: number;
  principal: number;
  interest: number;
  remainingBalance: number;
  status: 'PAID' | 'DUE' | 'UPCOMING';
  autoDebitMandateId?: string;
}

export interface LoanApplication {
  id: string;
  applicantName: string;
  businessName?: string;
  email: string;
  phone: string;
  bvn: string;
  nin: string;
  loanType: LoanType;
  amount: number;
  tenureMonths: number;
  interestRateAnnual: number;
  monthlyIncome: number;
  existingDebt: number;
  purpose: string;
  collateralDescription?: string;
  collateralValuation?: number;
  status: LoanStatus;
  createdAt: string;
  updatedAt: string;
  creditScore?: number;
  riskTier?: string;
  dti?: number;

  // Microbiz Group Channel & Tracing Registration
  channel?: MicrobizChannel;
  channelTracingRef?: string;
  officerRegistrationNumber?: string;

  // Credit policy enhancements
  maritalStatus?: MaritalStatus;
  businessVintageYears?: number;
  shopOwnership?: ShopOwnershipType;
  shopOwnershipDocType?: 'OWNERSHIP_INVOICE' | 'RENT_RECEIPT';
  stockInShopValuation?: number;
  fiveCs?: FiveCsEvaluation;

  // 7-Stage Multi-Tier Approval Pipeline & Chronological Datetime Audit Trail
  approvalChain?: ApprovalSignoff[];
  currentApprovalLevel?: ApprovalLevel;
  auditTrail?: AuditTrailEvent[];

  documents: VerifiedDocument[];
  signature?: DigitalSignature;
  blockchainTx?: {
    blockIndex: number;
    hash: string;
    timestamp: string;
    status: 'CONFIRMED';
  };
  cbsReference?: string;
  mandateId?: string;
  disbursedAt?: string;
  bankAccount?: {
    accountNumber: string;
    accountName: string;
    bankName: string;
  };
  officerDecision?: {
    decision: 'APPROVED' | 'REJECTED' | 'CONDITIONAL';
    officerId: string;
    officerName: string;
    officerRegistrationNumber?: string;
    channel?: MicrobizChannel;
    notes: string;
    covenants?: string[];
    timestamp: string;
  };
  repaymentSchedule?: RepaymentInstallment[];
  
  // Loan Monitoring & NPL Surveillance Attributes
  daysPastDue?: number;
  nplClassification?: NPLClassification;
  overdueAmount?: number;
  overduePrincipal?: number;
  overdueInterest?: number;
  lastRepaymentDate?: string;
  nextRepaymentDueDate?: string;
  monthlyInstallmentAmount?: number;
  missedInstallmentsCount?: number;
  earlyWarningFlags?: EarlyWarningFlag[];
  remediationPlan?: RemediationPlan;
  assignedRelationshipManager?: string;
  branch?: string;
}

export type NPLClassification = 
  | 'PERFORMING'     // Stage 1: 0 DPD (Standard)
  | 'WATCHLIST'      // Stage 2: 1 - 30 DPD (Special Mention / EWI)
  | 'SUBSTANDARD'    // Stage 3: 31 - 90 DPD (NPL)
  | 'DOUBTFUL'       // Stage 3: 91 - 180 DPD (NPL)
  | 'LOST';          // Stage 3: > 180 DPD (NPL / Bad Debt)

export interface EarlyWarningFlag {
  id: string;
  code: 'MISSED_PAYMENT' | 'POS_TURNOVER_DIP' | 'BVN_MULTI_LOAN' | 'MARKET_DISRUPTION' | 'BOUNCED_MANDATE' | 'CONTACT_UNREACHABLE';
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  detectedAt: string;
  description: string;
  status: 'ACTIVE' | 'RESOLVED' | 'UNDER_INVESTIGATION';
}

export interface RemediationPlan {
  status: 'NONE' | 'DEMAND_NOTICE_ISSUED' | 'RESTRUCTURED' | 'RECOVERY_AGENT_ASSIGNED' | 'COLLATERAL_FORECLOSURE' | 'LEGAL_RECOVERY';
  initiatedAt?: string;
  officerNotes?: string;
  repaymentExtensionMonths?: number;
  revisedMonthlyAmount?: number;
  assignedRecoveryAgent?: string;
}

export interface DefaultAlert {
  id: string;
  loanId: string;
  borrowerName: string;
  businessName?: string;
  channel: MicrobizChannel;
  branch: string;
  officerId: string;
  officerName: string;
  officerRegistrationNumber?: string;
  loanAmount: number;
  outstandingBalance: number;
  overdueAmount: number;
  daysPastDue: number;
  nplClassification: NPLClassification;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  alertType: 'NPL_STAGE_3' | 'WATCHLIST_SURGE' | 'EWI_TRIGGER' | 'MANDATE_BOUNCE' | 'GUARANTOR_ACTION';
  timestamp: string;
  title: string;
  message: string;
  isAcknowledged: boolean;
  recommendedAction: string;
}

export interface RelationshipManagerPAR {
  officerId: string;
  officerName: string;
  registrationNumber: string;
  channel: MicrobizChannel;
  channelName: string;
  branch: string;
  totalPortfolio: number;
  totalLoansCount: number;
  performingAmount: number;
  watchlistAmount: number; // 1-30 DPD
  substandardAmount: number; // 31-90 DPD
  doubtfulAmount: number; // 91-180 DPD
  lostAmount: number; // >180 DPD
  totalOverdueAmount: number;
  totalNplAmount: number; // >30 DPD (Substandard + Doubtful + Lost)
  par30Rate: number; // (Overdue > 30 days) / Total Portfolio %
  par60Rate: number; // (Overdue > 60 days) / Total Portfolio %
  par90Rate: number; // Gross NPL Ratio (Overdue > 90 days) / Total Portfolio %
  collectionEfficiency: number; // Actual Collected / Due %
  riskRating: 'PRIME' | 'GOOD' | 'CAUTION' | 'SEVERE';
  incentiveBonusEligible: boolean;
}

export interface OrganisationPAR {
  entityId: string;
  entityName: string;
  code: string;
  badgeClass: string;
  totalPortfolio: number;
  activeLoansCount: number;
  performingAmount: number;
  watchlistAmount: number;
  substandardAmount: number;
  doubtfulAmount: number;
  lostAmount: number;
  totalNplAmount: number;
  par30Rate: number; // %
  par60Rate: number; // %
  par90Rate: number; // Gross NPL % (CBN threshold: 5.0%)
  cbnBenchmark: number; // 5.0%
  requiredRegulatoryProvisions: number; // IFRS 9 / CBN Prudential Provisioning
  bookedProvisions: number;
  provisionCoverageRatio: number; // Booked / Required %
  collectionEfficiency: number;
}

export interface BranchInfo {
  id: string;
  name: string;
  shortName: string;
  channel: MicrobizChannel;
  channelName: string;
  state: string;
  city: string;
  address: string;
  isHeadOffice?: boolean;
}

export interface BranchPAR {
  branchId: string;
  branchName: string;
  channel: MicrobizChannel;
  channelName: string;
  city: string;
  state: string;
  totalPortfolio: number;
  totalLoansCount: number;
  performingAmount: number;
  watchlistAmount: number;
  nplAmount: number;
  overdueAmount: number;
  par30Rate: number;
  par90Rate: number;
  cbnCompliant: boolean;
}

export interface MonitoringFilterState {
  search: string;
  channel: MicrobizChannel | 'ALL';
  branch: string | 'ALL';
  nplClassification: NPLClassification | 'ALL';
  dpdRange: 'ALL' | 'CURRENT' | '1-30' | '31-60' | '61-90' | '91-180' | '180_PLUS';
  officerId: string | 'ALL';
  severity: 'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM';
}

export interface BlockchainBlock {
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
    cbsReference?: string;
    mandateId?: string;
  };
  nonce: number;
  validator: string;
}

export interface CBSTransaction {
  txId: string;
  timestamp: string;
  system: string;
  type: string;
  loanId: string;
  accountNumber: string;
  accountName: string;
  bankName: string;
  amount: number;
  currency: string;
  glDebitAccount: string;
  glCreditAccount: string;
  status: 'SETTLED' | 'PENDING' | 'FAILED';
  mandateId: string;
  cbsReference: string;
  tenureMonths?: number;
}

export interface FieldMarketer {
  id: string;
  fullName: string;
  code: string;
  branch: string;
  marketCluster: string;
  phone: string;
  activeTerminalId: string;
  activeBorrowersCount: number;
  dailyCollectionsTarget: number;
  dailyCollectionsActual: number;
  portfolioValue: number;
  par30Rate: number;
  status: 'ACTIVE_FIELD' | 'OFFLINE' | 'AT_BRANCH';
  lastPing: string;
}
