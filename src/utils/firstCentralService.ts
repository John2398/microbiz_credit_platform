import { 
  FirstCentralGatewayStatus, 
  FirstCentralAuthResponse, 
  FirstCentralConsumerMatchResult, 
  FirstCentralCommercialMatchResult, 
  FirstCentralKYCReportResult, 
  FirstCentralEnquiryLog,
  LoanApplication,
  AuditTrailEvent,
  MicrobizChannel
} from '../types';

const STORAGE_KEY_ENQUIRIES = 'microbiz_firstcentral_enquiries_v1';

/**
 * Checks the status of the FirstCentral Credit Bureau REST v2 UAT Gateway
 */
export async function getFirstCentralStatus(): Promise<FirstCentralGatewayStatus> {
  try {
    const res = await fetch('/api/firstcentral/status');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error: any) {
    return {
      status: 'OFFLINE',
      baseUrl: 'https://uat.firstcentralcreditbureau.com/firstcentralrestv2',
      endpoints: {
        login: 'https://uat.firstcentralcreditbureau.com/firstcentralrestv2/login',
        consumerMatch: 'https://uat.firstcentralcreditbureau.com/firstcentralrestv2/ConnectConsumerMatch',
        commercialMatch: 'https://uat.firstcentralcreditbureau.com/firstcentralrestv2/ConnectCommercialMatch',
        kycReport: 'https://uat.firstcentralcreditbureau.com/firstcentralrestv2/GetConsumerKYCVerificationReport'
      },
      hasValidTicket: false,
      environment: 'UAT',
      lastChecked: new Date().toISOString()
    };
  }
}

/**
 * Authenticates with FirstCentral UAT and generates/retrieves a DataTicket session
 */
export async function authenticateFirstCentral(
  username?: string, 
  password?: string
): Promise<FirstCentralAuthResponse> {
  try {
    const res = await fetch('/api/firstcentral/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (!res.ok) throw new Error(`Authentication failed with status ${res.status}`);
    const data: FirstCentralAuthResponse = await res.json();
    
    // Log enquiry
    recordEnquiryLog({
      enquiryType: 'LOGIN',
      searchQuery: username || 'System Service Account',
      applicantOrEntityName: 'Credit Risk Gateway',
      matchResult: data.success ? 'SUCCESS' : 'ERROR',
      details: data.message,
      officerName: 'Credit Risk Automated Gateway',
      channel: 'MICROBIZ_MFB',
      source: data.source
    });

    return data;
  } catch (error: any) {
    return {
      success: false,
      statusCode: '99',
      message: error.message || 'Network connection to FirstCentral UAT timed out',
      source: 'SANDBOX_FALLBACK',
      serverTimestamp: new Date().toISOString()
    };
  }
}

/**
 * Executes Individual Match Checker (ConnectConsumerMatch)
 */
export async function executeConsumerMatch(params: {
  identification: string;
  consumerName?: string;
  dob?: string;
  accountNo?: string;
  enquiryReason?: string;
  officerName?: string;
  officerReg?: string;
  channel?: MicrobizChannel;
}): Promise<FirstCentralConsumerMatchResult> {
  const res = await fetch('/api/firstcentral/consumer-match', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identification: params.identification,
      consumerName: params.consumerName,
      dob: params.dob,
      accountNo: params.accountNo,
      enquiryReason: params.enquiryReason || 'Credit Evaluation and Loan Underwriting'
    })
  });

  if (!res.ok) {
    throw new Error(`Consumer Match request failed with status ${res.status}`);
  }

  const data: FirstCentralConsumerMatchResult = await res.json();

  // Record audit log
  recordEnquiryLog({
    enquiryType: 'CONSUMER_MATCH',
    searchQuery: `${params.identification} (${params.consumerName || 'Unnamed'})`,
    applicantOrEntityName: data.matchedName,
    matchResult: 'SUCCESS',
    scoreOrRating: `${data.bureauScore} / 850 (${data.scoreGrade})`,
    officerName: params.officerName || 'Loan Review Officer',
    officerRegNumber: params.officerReg,
    channel: params.channel || 'MICROBIZ_MFB',
    source: data.source,
    details: `Matched Consumer ID: ${data.consumerId} | Open Facilities: ${data.summary.totalOpenFacilities} | Overdue: NGN ${data.summary.totalOverdueAmount.toLocaleString()} | DPD: ${data.summary.maxDaysPastDue}`
  });

  return data;
}

/**
 * Executes Business Match Checker (ConnectCommercialMatch)
 */
export async function executeCommercialMatch(params: {
  commercialName: string;
  registrationNo?: string;
  taxNo?: string;
  enquiryReason?: string;
  officerName?: string;
  officerReg?: string;
  channel?: MicrobizChannel;
}): Promise<FirstCentralCommercialMatchResult> {
  const res = await fetch('/api/firstcentral/commercial-match', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      commercialName: params.commercialName,
      registrationNo: params.registrationNo,
      taxNo: params.taxNo,
      enquiryReason: params.enquiryReason || 'Commercial Credit Underwriting'
    })
  });

  if (!res.ok) {
    throw new Error(`Commercial Match request failed with status ${res.status}`);
  }

  const data: FirstCentralCommercialMatchResult = await res.json();

  // Record audit log
  recordEnquiryLog({
    enquiryType: 'COMMERCIAL_MATCH',
    searchQuery: `${params.commercialName} (RC: ${params.registrationNo || 'N/A'})`,
    applicantOrEntityName: data.matchedCommercialName,
    matchResult: 'SUCCESS',
    scoreOrRating: data.corporateCreditGrade,
    officerName: params.officerName || 'Commercial Loan Underwriter',
    officerRegNumber: params.officerReg,
    channel: params.channel || 'MICROBIZ_MFB',
    source: data.source,
    details: `Commercial ID: ${data.commercialId} | Rating: ${data.corporateCreditGrade} | Exposure: NGN ${data.summary.totalOutstandingExposure.toLocaleString()} | Overdue: NGN ${data.summary.totalOverdueDebt.toLocaleString()}`
  });

  return data;
}

/**
 * Executes Consumer KYC Verification Report (GetConsumerKYCVerificationReport)
 */
export async function executeConsumerKYC(params: {
  identification: string;
  enquiryReason?: string;
  officerName?: string;
  officerReg?: string;
  channel?: MicrobizChannel;
}): Promise<FirstCentralKYCReportResult> {
  const res = await fetch('/api/firstcentral/consumer-kyc', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identification: params.identification,
      enquiryReason: params.enquiryReason || 'KYC Verification & Identity Match'
    })
  });

  if (!res.ok) {
    throw new Error(`KYC report request failed with status ${res.status}`);
  }

  const data: FirstCentralKYCReportResult = await res.json();

  // Record audit log
  recordEnquiryLog({
    enquiryType: 'KYC_REPORT',
    searchQuery: params.identification,
    applicantOrEntityName: `${data.consumerDetails.firstName} ${data.consumerDetails.lastName}`,
    matchResult: data.verificationStatus === 'VERIFIED' ? 'SUCCESS' : 'NO_MATCH',
    scoreOrRating: `Score: ${data.verificationScore}% (${data.verificationStatus})`,
    officerName: params.officerName || 'Compliance Officer',
    officerRegNumber: params.officerReg,
    channel: params.channel || 'MICROBIZ_MFB',
    source: data.source,
    details: `Ref: ${data.reportReference} | PEP Check: ${data.validationChecks.pepStatus} | BVN Match: ${data.validationChecks.bvnValid ? 'YES' : 'NO'}`
  });

  return data;
}

/**
 * End-to-end Loan Applicant Bureau Verification Integration
 * Pulls Consumer Match, KYC, and updates loan application state and audit trail
 */
export async function verifyLoanWithFirstCentral(
  loan: LoanApplication,
  officerName: string = 'Folasade Adebayo',
  officerRegNumber: string = 'REG/MFB/CO-3392'
): Promise<{
  updatedLoan: LoanApplication;
  consumerMatch: FirstCentralConsumerMatchResult;
  kycReport: FirstCentralKYCReportResult;
  commercialMatch?: FirstCentralCommercialMatchResult;
}> {
  // 1. Pull Consumer Match
  const consumerMatch = await executeConsumerMatch({
    identification: loan.bvn || loan.phone,
    consumerName: loan.applicantName,
    accountNo: loan.bankAccount?.accountNumber,
    enquiryReason: `Loan Origination for Application #${loan.id} (NGN ${loan.amount.toLocaleString()})`,
    officerName,
    officerReg: officerRegNumber,
    channel: loan.channel
  });

  // 2. Pull KYC Report
  const kycReport = await executeConsumerKYC({
    identification: loan.bvn || loan.phone,
    enquiryReason: `Loan Origination KYC Verification #${loan.id}`,
    officerName,
    officerReg: officerRegNumber,
    channel: loan.channel
  });

  // 3. If SME / Commercial loan, also run Commercial Match
  let commercialMatch: FirstCentralCommercialMatchResult | undefined;
  if (loan.businessName || loan.loanType === 'BETTABIZ_SME' || loan.loanType === 'SME_WORKING_CAPITAL') {
    try {
      commercialMatch = await executeCommercialMatch({
        commercialName: loan.businessName || loan.applicantName,
        enquiryReason: `Corporate Credit Underwriting #${loan.id}`,
        officerName,
        officerReg: officerRegNumber,
        channel: loan.channel
      });
    } catch (e) {
      console.warn('Commercial match skipped:', e);
    }
  }

  // 4. Update Loan Object with FirstCentral Report
  const nowIso = new Date().toISOString();
  const updatedLoan: LoanApplication = {
    ...loan,
    creditScore: consumerMatch.bureauScore,
    riskTier: `Tier ${consumerMatch.scoreGrade.substring(0, 3)} (${consumerMatch.riskCategory})`,
    firstCentralReport: {
      lastCheckedAt: nowIso,
      consumerId: consumerMatch.consumerId,
      commercialId: commercialMatch?.commercialId,
      matchedName: consumerMatch.matchedName,
      bureauScore: consumerMatch.bureauScore,
      scoreGrade: consumerMatch.scoreGrade,
      delinquencySummary: consumerMatch.summary.totalOverdueAmount > 0 
        ? `Delinquent: NGN ${consumerMatch.summary.totalOverdueAmount.toLocaleString()} overdue (${consumerMatch.summary.maxDaysPastDue} DPD)`
        : 'Clean Track Record: 0 Overdue, 0 DPD across all reporting institutions',
      totalOpenFacilities: consumerMatch.summary.totalOpenFacilities,
      totalOverdueAmount: consumerMatch.summary.totalOverdueAmount,
      maxDaysPastDue: consumerMatch.summary.maxDaysPastDue,
      riskRating: consumerMatch.riskCategory,
      kycStatus: kycReport.verificationStatus,
      source: consumerMatch.source
    }
  };

  // 5. Append Audit Event
  const auditEvent: AuditTrailEvent = {
    id: `AUDIT-FC-${Date.now()}`,
    timestamp: nowIso,
    formattedDatetime: new Date().toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }),
    actorName: officerName,
    actorRole: 'Credit Officer / Underwriter',
    actorRegistrationNumber: officerRegNumber,
    stage: 'Loan Analysis & Bureau Pull',
    action: 'FirstCentral Credit Bureau REST v2 Verification Completed',
    status: consumerMatch.bureauScore >= 670 ? 'SUCCESS' : 'WARNING',
    notes: `Consumer match #${consumerMatch.consumerId} returned bureau score ${consumerMatch.bureauScore}/850 (${consumerMatch.scoreGrade}). KYC verification status: ${kycReport.verificationStatus} (Ref: ${kycReport.reportReference}). Source: ${consumerMatch.source}.`
  };

  updatedLoan.auditTrail = [auditEvent, ...(updatedLoan.auditTrail || [])];

  return {
    updatedLoan,
    consumerMatch,
    kycReport,
    commercialMatch
  };
}

/**
 * Local audit log management
 */
export function getEnquiryLogs(): FirstCentralEnquiryLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ENQUIRIES);
    if (!raw) return getDefaultInitialLogs();
    return JSON.parse(raw);
  } catch (e) {
    return getDefaultInitialLogs();
  }
}

export function recordEnquiryLog(entry: Omit<FirstCentralEnquiryLog, 'id' | 'timestamp'>): FirstCentralEnquiryLog {
  const newLog: FirstCentralEnquiryLog = {
    ...entry,
    id: `LOG-FC-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString()
  };

  try {
    const current = getEnquiryLogs();
    const updated = [newLog, ...current.slice(0, 49)]; // keep latest 50
    localStorage.setItem(STORAGE_KEY_ENQUIRIES, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save enquiry log:', e);
  }

  return newLog;
}

function getDefaultInitialLogs(): FirstCentralEnquiryLog[] {
  return [
    {
      id: 'LOG-FC-INIT-01',
      timestamp: '2026-09-23T08:14:20.000Z',
      enquiryType: 'CONSUMER_MATCH',
      searchQuery: '22233344455 (Chinedu Emmanuel Okafor)',
      applicantOrEntityName: 'Chinedu Emmanuel Okafor',
      matchResult: 'SUCCESS',
      scoreOrRating: '785 / 850 (AAA Prime Credit)',
      officerName: 'Folasade Adebayo',
      officerRegNumber: 'REG/MFB/CO-3392',
      channel: 'MICROBIZ_MFB',
      source: 'SANDBOX_FALLBACK',
      details: 'Matched Consumer ID: FC-CON-CHIN8941 | Open Facilities: 2 | Overdue: NGN 0 | DPD: 0'
    },
    {
      id: 'LOG-FC-INIT-02',
      timestamp: '2026-09-23T07:45:10.000Z',
      enquiryType: 'KYC_REPORT',
      searchQuery: '22819204911 (Musa Abdullahi)',
      applicantOrEntityName: 'Musa Abdullahi',
      matchResult: 'SUCCESS',
      scoreOrRating: 'Score: 99.4% (VERIFIED)',
      officerName: 'Halima Abubakar',
      officerRegNumber: 'REG/PEC/CO-5514',
      channel: 'PEAK_EMPOWERMENT_CENTRE',
      source: 'SANDBOX_FALLBACK',
      details: 'Ref: FC-KYC-99182410 | PEP Check: NOT_PEP | BVN Match: YES'
    },
    {
      id: 'LOG-FC-INIT-03',
      timestamp: '2026-09-23T06:30:00.000Z',
      enquiryType: 'COMMERCIAL_MATCH',
      searchQuery: 'Okafor Building Materials Enterprise (RC-1492084)',
      applicantOrEntityName: 'Okafor Building Materials Enterprise',
      matchResult: 'SUCCESS',
      scoreOrRating: 'CR-1 (Prime / Investment Grade)',
      officerName: 'Ibrahim Galadima',
      officerRegNumber: 'REG/MFB/CO-2041',
      channel: 'MICROBIZ_MFB',
      source: 'SANDBOX_FALLBACK',
      details: 'Commercial ID: FC-COM-OKA8812 | Rating: CR-1 | Exposure: NGN 2,450,000 | Overdue: NGN 0'
    }
  ];
}
