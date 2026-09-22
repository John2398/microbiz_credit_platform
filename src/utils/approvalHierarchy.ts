import { ApprovalLevel, ApprovalSignoff, AuditTrailEvent, LoanApplication } from '../types';

export interface ApproverRoleProfile {
  level: ApprovalLevel;
  levelOrder: number;
  roleTitle: string;
  defaultSignatoryName: string;
  defaultOfficerId: string;
  defaultRegistrationNumber: string;
  shortLabel: string;
  description: string;
}

export const APPROVAL_HIERARCHY_LEVELS: ApproverRoleProfile[] = [
  {
    level: 'CREDIT_OFFICER',
    levelOrder: 1,
    roleTitle: 'Credit Officer',
    defaultSignatoryName: 'Folasade Adebayo',
    defaultOfficerId: 'OFF-3392',
    defaultRegistrationNumber: 'REG/MFB/CO-3392',
    shortLabel: 'Credit Officer',
    description: 'First line appraisal: customer interview, physical KYC/biometric match, and preliminary 5 Cs scoring.'
  },
  {
    level: 'TEAM_LEAD',
    levelOrder: 2,
    roleTitle: 'Team Lead - Credit Operations',
    defaultSignatoryName: 'Ibrahim Galadima',
    defaultOfficerId: 'TL-1044',
    defaultRegistrationNumber: 'REG/MFB/TL-1044',
    shortLabel: 'Team Lead',
    description: 'Supervisory review: verifies branch document sighting, cash flow turnover ratios, and guarantor integrity.'
  },
  {
    level: 'HEAD_OF_CREDIT_RISK',
    levelOrder: 3,
    roleTitle: 'Head of Credit & Risk',
    defaultSignatoryName: 'Ngozi Okonjo-Nwosu',
    defaultOfficerId: 'HCR-8021',
    defaultRegistrationNumber: 'REG/MFB/HCR-8021',
    shortLabel: 'Head of Credit & Risk',
    description: 'Comprehensive risk rating: multi-bureau analysis, collateral perfection assessment, and PAR/LTV exposure check.'
  },
  {
    level: 'HEAD_OF_SME',
    levelOrder: 4,
    roleTitle: 'Head of SME Banking',
    defaultSignatoryName: 'Emeka Uzoechina',
    defaultOfficerId: 'HSME-4491',
    defaultRegistrationNumber: 'REG/MFB/HSME-4491',
    shortLabel: 'Head of SME',
    description: 'Commercial validation: market cluster dynamics, business vintage credibility, and repayment feasibility.'
  },
  {
    level: 'HEAD_OF_AUDIT',
    levelOrder: 5,
    roleTitle: 'Head of Internal Audit & Compliance',
    defaultSignatoryName: 'Babatunde Lawal (FCA)',
    defaultOfficerId: 'AUD-9102',
    defaultRegistrationNumber: 'REG/MFB/AUD-9102',
    shortLabel: 'Head of Audit',
    description: 'Regulatory audit: CBN prudential guidelines adherence, AML/CFT compliance, and vault/mandate verification.'
  },
  {
    level: 'EXECUTIVE_DIRECTOR',
    levelOrder: 6,
    roleTitle: 'Executive Director (Operations & Risk)',
    defaultSignatoryName: 'Chief (Mrs.) Victoria Adeleke',
    defaultOfficerId: 'ED-0004',
    defaultRegistrationNumber: 'REG/MFB/ED-0004',
    shortLabel: 'Executive Director',
    description: 'Executive committee concurrence: institutional capital adequacy, liquidity reservation, and portfolio sanction.'
  },
  {
    level: 'MANAGING_DIRECTOR',
    levelOrder: 7,
    roleTitle: 'Managing Director / Chief Executive Officer',
    defaultSignatoryName: 'Dr. Anthony Chinedu Mbah (MD/CEO)',
    defaultOfficerId: 'MD-0001',
    defaultRegistrationNumber: 'REG/MFB/MD-0001',
    shortLabel: 'Managing Director',
    description: 'Final statutory sign-off: ultimate CBS disbursal mandate authorization and consortium blockchain seal.'
  }
];

export function formatExactDateTime(isoString?: string | Date): string {
  const date = isoString ? new Date(isoString) : new Date();
  if (isNaN(date.getTime())) {
    return new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  }
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
}

export function createAuditTrailEvent(
  stage: string,
  action: string,
  actorName: string,
  actorRole: string,
  status: 'SUCCESS' | 'WARNING' | 'INFO' | 'ACTION_REQUIRED' | 'REJECTED' = 'SUCCESS',
  notes?: string,
  actorRegistrationNumber?: string,
  metadata?: Record<string, string | number | boolean>,
  customTimestamp?: string
): AuditTrailEvent {
  const now = customTimestamp ? new Date(customTimestamp) : new Date();
  const iso = now.toISOString();
  return {
    id: `evt-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    timestamp: iso,
    formattedDatetime: formatExactDateTime(now),
    actorName,
    actorRole,
    actorRegistrationNumber,
    stage,
    action,
    status,
    notes,
    metadata
  };
}

export function generateDefaultApprovalChain(
  loanAmount: number,
  applicantName: string,
  channel: string = 'MICROBIZ_MFB',
  officerRegistrationNumber: string = 'REG/MFB/CO-3392',
  initialStatus: 'ALL_PENDING' | 'AT_LEVEL_1' | 'AT_LEVEL_3' | 'FULLY_APPROVED' = 'AT_LEVEL_1'
): ApprovalSignoff[] {
  const baseTime = new Date();

  return APPROVAL_HIERARCHY_LEVELS.map((profile, idx) => {
    let signoffStatus: 'PENDING' | 'IN_REVIEW' | 'APPROVED' = 'PENDING';
    let signedAt: string | undefined = undefined;
    let signedAtFormatted: string | undefined = undefined;
    let comments: string | undefined = undefined;
    let signatureDataUrl: string | undefined = undefined;
    let keyFingerprint: string | undefined = undefined;

    if (initialStatus === 'FULLY_APPROVED') {
      signoffStatus = 'APPROVED';
      const stepDate = new Date(baseTime.getTime() - (7 - idx) * 3600000);
      signedAt = stepDate.toISOString();
      signedAtFormatted = formatExactDateTime(stepDate);
      signatureDataUrl = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="140" height="40"><path d="M10 25 Q 35 ${8 + idx * 2}, 70 24 T 130 18" stroke="%232563EB" fill="none" stroke-width="2.2"/></svg>`;
      keyFingerprint = `pk_ed25519_${profile.level.toLowerCase()}_${Math.floor(100000 + Math.random() * 900000)}`;
      comments = getStandardApprovalComment(profile.level, applicantName, loanAmount);
    } else if (initialStatus === 'AT_LEVEL_3') {
      if (idx < 2) {
        signoffStatus = 'APPROVED';
        const stepDate = new Date(baseTime.getTime() - (3 - idx) * 3600000);
        signedAt = stepDate.toISOString();
        signedAtFormatted = formatExactDateTime(stepDate);
        signatureDataUrl = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="140" height="40"><path d="M10 25 Q 35 10, 70 24 T 130 18" stroke="%232563EB" fill="none" stroke-width="2"/></svg>`;
        keyFingerprint = `pk_ed25519_${profile.level.toLowerCase()}_${Math.floor(100000 + Math.random() * 900000)}`;
        comments = getStandardApprovalComment(profile.level, applicantName, loanAmount);
      } else if (idx === 2) {
        signoffStatus = 'IN_REVIEW';
      }
    } else if (initialStatus === 'AT_LEVEL_1') {
      if (idx === 0) {
        signoffStatus = 'IN_REVIEW';
      }
    }

    return {
      level: profile.level,
      levelOrder: profile.levelOrder,
      roleTitle: profile.roleTitle,
      signatoryName: profile.defaultSignatoryName,
      officerId: profile.defaultOfficerId,
      registrationNumber: profile.level === 'CREDIT_OFFICER' && officerRegistrationNumber 
        ? officerRegistrationNumber 
        : profile.defaultRegistrationNumber,
      status: signoffStatus,
      decision: signoffStatus === 'APPROVED' ? 'APPROVED' : null,
      comments,
      signatureDataUrl,
      keyFingerprint,
      signedAt,
      signedAtFormatted,
      ipAddress: '10.0.14.' + (20 + idx),
      recommendedAmount: loanAmount,
      conditions: profile.level === 'HEAD_OF_CREDIT_RISK' ? [
        'Enforce automated direct debit mandate on primary turnover account',
        'Physical stock inspection quarterly'
      ] : undefined
    };
  });
}

export function getStandardApprovalComment(level: ApprovalLevel, applicantName: string, amount: number): string {
  const formatted = `₦${amount.toLocaleString()}`;
  switch (level) {
    case 'CREDIT_OFFICER':
      return `Conducted face-to-face intake with ${applicantName}. All identity documents and physical stock verified. Recommended for sanction at ${formatted}.`;
    case 'TEAM_LEAD':
      return `Reviewed branch documentation and guarantor credentials. Cash flow ratios conform strictly to credit policy limits. Recommended for Risk Committee.`;
    case 'HEAD_OF_CREDIT_RISK':
      return `Credit risk analysis completed. Multi-bureau score verified at prime level. 5 Cs of credit evaluated and passed. Approved subject to active direct debit mandate.`;
    case 'HEAD_OF_SME':
      return `Evaluated market stall trading vintage and supply chain turnover. High debt service capacity confirmed. Commercial sign-off granted.`;
    case 'HEAD_OF_AUDIT':
      return `Internal audit compliance verified against CBN Prudential Guidelines. AML/KYC checklist and vault/disbursal GL accounts cleared.`;
    case 'EXECUTIVE_DIRECTOR':
      return `Executive Director concurrence granted. Portfolio limits and institutional risk covenants within authorized operational limits.`;
    case 'MANAGING_DIRECTOR':
      return `Final statutory MD approval executed. Facility sanctioned for immediate Core Banking CBS disbursal and blockchain consortium anchoring.`;
    default:
      return `Approved based on satisfied credit appraisal criteria.`;
  }
}

export function getNextApprovalLevel(currentLevel: ApprovalLevel, chain?: ApprovalSignoff[]): ApprovalLevel | null {
  const currentConfig = APPROVAL_HIERARCHY_LEVELS.find(l => l.level === currentLevel);
  if (!currentConfig) return null;
  const nextConfig = APPROVAL_HIERARCHY_LEVELS.find(l => l.levelOrder === currentConfig.levelOrder + 1);
  return nextConfig ? nextConfig.level : null;
}

export function isAllApprovalLinesSatisfied(loan: LoanApplication): boolean {
  if (!loan.approvalChain || loan.approvalChain.length === 0) {
    // If no chain present, fallback to loan.status === 'APPROVED'
    return loan.status === 'APPROVED' || loan.status === 'DISBURSED';
  }
  return loan.approvalChain.every(signoff => signoff.status === 'APPROVED');
}

export function getCurrentPendingApproval(loan: LoanApplication): ApprovalSignoff | undefined {
  if (!loan.approvalChain || loan.approvalChain.length === 0) return undefined;
  return loan.approvalChain.find(s => s.status === 'PENDING' || s.status === 'IN_REVIEW');
}

export function getApprovalProgressPercentage(loan: LoanApplication): number {
  if (!loan.approvalChain || loan.approvalChain.length === 0) {
    return loan.status === 'APPROVED' || loan.status === 'DISBURSED' ? 100 : 20;
  }
  const approvedCount = loan.approvalChain.filter(s => s.status === 'APPROVED').length;
  return Math.round((approvedCount / loan.approvalChain.length) * 100);
}
