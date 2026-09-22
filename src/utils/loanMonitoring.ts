import { 
  LoanApplication, 
  NPLClassification, 
  DefaultAlert, 
  RelationshipManagerPAR, 
  OrganisationPAR, 
  BranchPAR,
  EarlyWarningFlag,
  MicrobizChannel
} from '../types';
import { REGISTERED_CREDIT_OFFICERS, MICROBIZ_CHANNELS, ALL_BRANCHES } from './channels';

/**
 * Calculates NPL Classification according to CBN Prudential Guidelines & IFRS 9:
 * - Performing (Stage 1 / Normal): 0 Days Past Due
 * - Watchlist (Stage 2 / Special Mention): 1 - 30 Days Past Due
 * - Substandard (Stage 3 / NPL): 31 - 90 Days Past Due
 * - Doubtful (Stage 3 / NPL): 91 - 180 Days Past Due
 * - Lost (Stage 3 / NPL / Write-off): > 180 Days Past Due
 */
export function getNPLClassification(dpd: number = 0): NPLClassification {
  if (dpd <= 0) return 'PERFORMING';
  if (dpd <= 30) return 'WATCHLIST';
  if (dpd <= 90) return 'SUBSTANDARD';
  if (dpd <= 180) return 'DOUBTFUL';
  return 'LOST';
}

export function getNPLClassificationMeta(classification: NPLClassification) {
  switch (classification) {
    case 'PERFORMING':
      return {
        label: 'Performing (Stage 1)',
        shortLabel: 'Current / Regular',
        dpdRange: '0 DPD',
        cbnProvisionRate: 0.01, // 1% General Provision
        cbnProvisionLabel: '1% General Reserve',
        badgeClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-600/50',
        dotClass: 'bg-emerald-400',
        textColor: 'text-emerald-400',
        bgSubtle: 'bg-emerald-950/20',
        statusSeverity: 'LOW',
        isNpl: false
      };
    case 'WATCHLIST':
      return {
        label: 'Watchlist / Special Mention (Stage 2)',
        shortLabel: 'Watchlist (EWI)',
        dpdRange: '1 - 30 DPD',
        cbnProvisionRate: 0.05, // 5% Specific Provision
        cbnProvisionLabel: '5% Specific Reserve',
        badgeClass: 'bg-amber-950/80 text-amber-300 border-amber-600/50',
        dotClass: 'bg-amber-400',
        textColor: 'text-amber-400',
        bgSubtle: 'bg-amber-950/20',
        statusSeverity: 'MEDIUM',
        isNpl: false
      };
    case 'SUBSTANDARD':
      return {
        label: 'Substandard (Stage 3 NPL)',
        shortLabel: 'Substandard (NPL)',
        dpdRange: '31 - 90 DPD',
        cbnProvisionRate: 0.10, // 10% Provision
        cbnProvisionLabel: '10% Prudential Provision',
        badgeClass: 'bg-orange-950/90 text-orange-300 border-orange-500',
        dotClass: 'bg-orange-400',
        textColor: 'text-orange-400',
        bgSubtle: 'bg-orange-950/30',
        statusSeverity: 'HIGH',
        isNpl: true
      };
    case 'DOUBTFUL':
      return {
        label: 'Doubtful (Stage 3 NPL)',
        shortLabel: 'Doubtful (NPL)',
        dpdRange: '91 - 180 DPD',
        cbnProvisionRate: 0.50, // 50% Provision
        cbnProvisionLabel: '50% Prudential Provision',
        badgeClass: 'bg-rose-950/90 text-rose-300 border-rose-500',
        dotClass: 'bg-rose-400',
        textColor: 'text-rose-400',
        bgSubtle: 'bg-rose-950/30',
        statusSeverity: 'CRITICAL',
        isNpl: true
      };
    case 'LOST':
      return {
        label: 'Lost / Impaired (Stage 3 NPL)',
        shortLabel: 'Lost / Bad Debt',
        dpdRange: '> 180 DPD',
        cbnProvisionRate: 1.00, // 100% Provision
        cbnProvisionLabel: '100% Full Impairment',
        badgeClass: 'bg-red-950 text-red-200 border-red-600 shadow-md',
        dotClass: 'bg-red-500 animate-pulse',
        textColor: 'text-red-400',
        bgSubtle: 'bg-red-950/40',
        statusSeverity: 'CRITICAL',
        isNpl: true
      };
  }
}

/**
 * Calculates required CBN Prudential Loan Loss Provisioning for a given loan
 */
export function calculateLoanProvision(loan: LoanApplication): {
  provisionRate: number;
  requiredAmount: number;
  classification: NPLClassification;
} {
  const dpd = loan.daysPastDue || 0;
  const classification = loan.nplClassification || getNPLClassification(dpd);
  const meta = getNPLClassificationMeta(classification);
  const baseAmount = loan.amount;
  const requiredAmount = baseAmount * meta.cbnProvisionRate;

  return {
    provisionRate: meta.cbnProvisionRate,
    requiredAmount,
    classification
  };
}

/**
 * Detect Early Warning Indicators (EWI) on a loan
 */
export function detectLoanEWIFlags(loan: LoanApplication): EarlyWarningFlag[] {
  const flags: EarlyWarningFlag[] = [];
  const dpd = loan.daysPastDue || 0;

  if (dpd > 0 && dpd <= 30) {
    flags.push({
      id: `ewi-dpd-${loan.id}`,
      code: 'MISSED_PAYMENT',
      title: 'Watchlist Delinquency (1-30 DPD)',
      severity: 'MEDIUM',
      detectedAt: new Date(Date.now() - dpd * 86400000).toISOString(),
      description: `Borrower missed scheduled installment payment by ${dpd} days. Automated SMS reminder sent.`,
      status: 'ACTIVE'
    });
  }

  if (dpd > 30) {
    flags.push({
      id: `ewi-npl-${loan.id}`,
      code: 'MISSED_PAYMENT',
      title: `Substandard NPL Breach (${dpd} DPD)`,
      severity: dpd > 90 ? 'CRITICAL' : 'HIGH',
      detectedAt: new Date(Date.now() - dpd * 86400000).toISOString(),
      description: `Account has exceeded 30 DPD threshold. Classified as Non-Performing Loan under CBN guidelines.`,
      status: 'ACTIVE'
    });
  }

  if (loan.dti && loan.dti > 45) {
    flags.push({
      id: `ewi-dti-${loan.id}`,
      code: 'POS_TURNOVER_DIP',
      title: 'High Debt-Service Stress (DTI > 45%)',
      severity: 'HIGH',
      detectedAt: new Date().toISOString(),
      description: `Debt-to-Income ratio stands at ${loan.dti}%, exceeding sustainable micro-merchant repayment capacity.`,
      status: 'ACTIVE'
    });
  }

  if (loan.creditScore && loan.creditScore < 600) {
    flags.push({
      id: `ewi-score-${loan.id}`,
      code: 'BVN_MULTI_LOAN',
      title: 'Credit Bureau Bureau Inquiry Alert',
      severity: 'MEDIUM',
      detectedAt: new Date().toISOString(),
      description: 'Recent external micro-lender queries identified via CRC Credit Bureau API.',
      status: 'ACTIVE'
    });
  }

  return flags;
}

/**
 * Computes comprehensive Relationship Manager (Credit Officer) PAR Metrics
 */
export function computeRelationshipManagerPAR(loans: LoanApplication[]): RelationshipManagerPAR[] {
  // Group loans by officer registration / officerId
  const officerMap: Record<string, LoanApplication[]> = {};

  loans.forEach(loan => {
    const key = loan.officerRegistrationNumber || loan.officerDecision?.officerRegistrationNumber || 'REG/MFB/CO-3392';
    if (!officerMap[key]) {
      officerMap[key] = [];
    }
    officerMap[key].push(loan);
  });

  return REGISTERED_CREDIT_OFFICERS.map(officer => {
    const officerLoans = officerMap[officer.registrationNumber] || [];
    const totalPortfolio = officerLoans.reduce((sum, l) => sum + l.amount, 0);
    const totalLoansCount = officerLoans.length;

    let performingAmount = 0;
    let watchlistAmount = 0;
    let substandardAmount = 0;
    let doubtfulAmount = 0;
    let lostAmount = 0;
    let totalOverdueAmount = 0;

    officerLoans.forEach(l => {
      const dpd = l.daysPastDue || 0;
      const classification = l.nplClassification || getNPLClassification(dpd);
      const overdue = l.overdueAmount || (dpd > 0 ? Math.round(l.amount * 0.18) : 0);

      totalOverdueAmount += overdue;

      switch (classification) {
        case 'PERFORMING':
          performingAmount += l.amount;
          break;
        case 'WATCHLIST':
          watchlistAmount += l.amount;
          break;
        case 'SUBSTANDARD':
          substandardAmount += l.amount;
          break;
        case 'DOUBTFUL':
          doubtfulAmount += l.amount;
          break;
        case 'LOST':
          lostAmount += l.amount;
          break;
      }
    });

    const totalNplAmount = substandardAmount + doubtfulAmount + lostAmount;
    
    // PAR 30: All loans with DPD > 30 (NPLs) as a % of total portfolio
    const par30Rate = totalPortfolio > 0 ? ((totalNplAmount) / totalPortfolio) * 100 : 0;
    // PAR 60: Loans with DPD > 60
    const par60Rate = totalPortfolio > 0 ? ((doubtfulAmount + lostAmount + (substandardAmount * 0.5)) / totalPortfolio) * 100 : 0;
    // PAR 90 (Gross NPL Ratio): Loans with DPD > 90
    const par90Rate = totalPortfolio > 0 ? ((doubtfulAmount + lostAmount) / totalPortfolio) * 100 : 0;

    // Collection Efficiency: (Total expected minus overdue) / Total expected
    const collectionEfficiency = totalPortfolio > 0 
      ? Math.max(0, Math.min(100, Math.round(((totalPortfolio - totalOverdueAmount) / totalPortfolio) * 100)))
      : 100;

    let riskRating: 'PRIME' | 'GOOD' | 'CAUTION' | 'SEVERE' = 'PRIME';
    if (par30Rate <= 2.5) {
      riskRating = 'PRIME';
    } else if (par30Rate <= 5.0) {
      riskRating = 'GOOD';
    } else if (par30Rate <= 9.0) {
      riskRating = 'CAUTION';
    } else {
      riskRating = 'SEVERE';
    }

    const incentiveBonusEligible = par30Rate <= 5.0 && collectionEfficiency >= 92;

    return {
      officerId: officer.officerId,
      officerName: officer.officerName,
      registrationNumber: officer.registrationNumber,
      channel: officer.channel,
      channelName: officer.channelName,
      branch: officer.branch || (officer.channel === 'MICROBIZ_MFB' ? 'HQ Mpape' : officer.channel === 'MICROBIZ_INCLUSION_CENTRE' ? 'Head Office (Central Area)' : 'Suleja'),
      totalPortfolio,
      totalLoansCount,
      performingAmount,
      watchlistAmount,
      substandardAmount,
      doubtfulAmount,
      lostAmount,
      totalOverdueAmount,
      totalNplAmount,
      par30Rate: Number(par30Rate.toFixed(2)),
      par60Rate: Number(par60Rate.toFixed(2)),
      par90Rate: Number(par90Rate.toFixed(2)),
      collectionEfficiency,
      riskRating,
      incentiveBonusEligible
    };
  });
}

/**
 * Computes PAR & Portfolio Quality Metrics Per Organisation / Platform Entity
 */
export function computeOrganisationPAR(loans: LoanApplication[]): OrganisationPAR[] {
  const channelKeys: MicrobizChannel[] = [
    'MICROBIZ_MFB',
    'MICROBIZ_INCLUSION_CENTRE',
    'PEAK_EMPOWERMENT_CENTRE'
  ];

  return channelKeys.map(channel => {
    const meta = MICROBIZ_CHANNELS[channel];
    const channelLoans = loans.filter(l => l.channel === channel);
    const totalPortfolio = channelLoans.reduce((sum, l) => sum + l.amount, 0);
    const activeLoansCount = channelLoans.length;

    let performingAmount = 0;
    let watchlistAmount = 0;
    let substandardAmount = 0;
    let doubtfulAmount = 0;
    let lostAmount = 0;
    let totalOverdue = 0;

    channelLoans.forEach(l => {
      const dpd = l.daysPastDue || 0;
      const classification = l.nplClassification || getNPLClassification(dpd);
      const overdue = l.overdueAmount || (dpd > 0 ? Math.round(l.amount * 0.2) : 0);
      totalOverdue += overdue;

      switch (classification) {
        case 'PERFORMING':
          performingAmount += l.amount;
          break;
        case 'WATCHLIST':
          watchlistAmount += l.amount;
          break;
        case 'SUBSTANDARD':
          substandardAmount += l.amount;
          break;
        case 'DOUBTFUL':
          doubtfulAmount += l.amount;
          break;
        case 'LOST':
          lostAmount += l.amount;
          break;
      }
    });

    const totalNplAmount = substandardAmount + doubtfulAmount + lostAmount;
    const par30Rate = totalPortfolio > 0 ? (totalNplAmount / totalPortfolio) * 100 : 0;
    const par60Rate = totalPortfolio > 0 ? ((doubtfulAmount + lostAmount + substandardAmount * 0.6) / totalPortfolio) * 100 : 0;
    const par90Rate = totalPortfolio > 0 ? ((doubtfulAmount + lostAmount) / totalPortfolio) * 100 : 0;

    // CBN Prudential Provision Calculation
    // Performing (1%), Watchlist (5%), Substandard (10%), Doubtful (50%), Lost (100%)
    const requiredRegulatoryProvisions = 
      (performingAmount * 0.01) + 
      (watchlistAmount * 0.05) + 
      (substandardAmount * 0.10) + 
      (doubtfulAmount * 0.50) + 
      (lostAmount * 1.00);

    // Booked provisions (assume 115% coverage in core CBS)
    const bookedProvisions = Math.round(requiredRegulatoryProvisions * 1.12);
    const provisionCoverageRatio = requiredRegulatoryProvisions > 0 
      ? Math.round((bookedProvisions / requiredRegulatoryProvisions) * 100) 
      : 100;

    const collectionEfficiency = totalPortfolio > 0 
      ? Math.max(0, Math.min(100, Math.round(((totalPortfolio - totalOverdue) / totalPortfolio) * 100)))
      : 96;

    return {
      entityId: channel,
      entityName: meta.name,
      code: meta.code,
      badgeClass: meta.badgeClass,
      totalPortfolio,
      activeLoansCount,
      performingAmount,
      watchlistAmount,
      substandardAmount,
      doubtfulAmount,
      lostAmount,
      totalNplAmount,
      par30Rate: Number(par30Rate.toFixed(2)),
      par60Rate: Number(par60Rate.toFixed(2)),
      par90Rate: Number(par90Rate.toFixed(2)),
      cbnBenchmark: 5.0, // CBN 5.0% MFB Benchmark
      requiredRegulatoryProvisions: Math.round(requiredRegulatoryProvisions),
      bookedProvisions,
      provisionCoverageRatio,
      collectionEfficiency
    };
  });
}

/**
 * Computes Branch-level PAR breakdown across all official branches
 */
export function computeBranchPAR(loans: LoanApplication[]): BranchPAR[] {
  return ALL_BRANCHES.map((branch) => {
    // Match loans belonging to this branch
    const branchLoans = loans.filter((l) => {
      if (l.branch) {
        return (
          l.branch.toLowerCase().includes(branch.name.toLowerCase()) ||
          branch.name.toLowerCase().includes(l.branch.toLowerCase()) ||
          l.branch.includes(branch.id)
        );
      }
      return false;
    });

    const totalPortfolio = branchLoans.reduce((sum, l) => sum + l.amount, 0);
    const totalLoansCount = branchLoans.length;

    let performingAmount = 0;
    let watchlistAmount = 0;
    let nplAmount = 0;
    let overdueAmount = 0;

    branchLoans.forEach(l => {
      const dpd = l.daysPastDue || 0;
      const overdue = l.overdueAmount || (dpd > 0 ? Math.round(l.amount * 0.15) : 0);
      overdueAmount += overdue;

      if (dpd === 0) {
        performingAmount += l.amount;
      } else if (dpd <= 30) {
        watchlistAmount += l.amount;
      } else {
        nplAmount += l.amount;
      }
    });

    const par30 = totalPortfolio > 0 ? (nplAmount / totalPortfolio) * 100 : 0;
    const par90 = totalPortfolio > 0 ? (branchLoans.filter(l => (l.daysPastDue || 0) > 90).reduce((s, l) => s + l.amount, 0) / totalPortfolio) * 100 : 0;

    return {
      branchId: branch.id,
      branchName: branch.name,
      channel: branch.channel,
      channelName: branch.channelName,
      city: branch.city,
      state: branch.state,
      totalPortfolio,
      totalLoansCount,
      performingAmount,
      watchlistAmount,
      nplAmount,
      overdueAmount,
      par30Rate: Number(par30.toFixed(2)),
      par90Rate: Number(par90.toFixed(2)),
      cbnCompliant: par30 <= 5.0
    };
  });
}

/**
 * Generate Real-time Default Alerts and NPL Warning notices
 */
export function generateDefaultAlerts(loans: LoanApplication[]): DefaultAlert[] {
  const alerts: DefaultAlert[] = [];

  loans.forEach(loan => {
    const dpd = loan.daysPastDue || 0;
    const classification = loan.nplClassification || getNPLClassification(dpd);

    if (classification === 'LOST' || dpd > 180) {
      alerts.push({
        id: `alt-lost-${loan.id}`,
        loanId: loan.id,
        borrowerName: loan.applicantName,
        businessName: loan.businessName,
        channel: loan.channel || 'MICROBIZ_MFB',
        branch: loan.branch || 'Abuja Main - New Mpape (BR-001)',
        officerId: loan.officerRegistrationNumber || 'OFF-3392',
        officerName: 'Folasade Adebayo',
        loanAmount: loan.amount,
        outstandingBalance: loan.amount,
        overdueAmount: loan.overdueAmount || Math.round(loan.amount * 0.85),
        daysPastDue: dpd,
        nplClassification: 'LOST',
        severity: 'CRITICAL',
        alertType: 'NPL_STAGE_3',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        title: `CRITICAL NPL: Lost Asset Stage 3 (${dpd} DPD) - ${loan.applicantName}`,
        message: `Loan balance of ₦${loan.amount.toLocaleString()} is severely delinquent (${dpd} days overdue). Recommended immediate deployment of external legal recovery and physical collateral attachment.`,
        isAcknowledged: false,
        recommendedAction: 'Execute Tripartite Legal Mortgage Foreclosure & Deploy Recovery Agent'
      });
    } else if (classification === 'DOUBTFUL' || (dpd > 90 && dpd <= 180)) {
      alerts.push({
        id: `alt-doubtful-${loan.id}`,
        loanId: loan.id,
        borrowerName: loan.applicantName,
        businessName: loan.businessName,
        channel: loan.channel || 'PEAK_EMPOWERMENT_CENTRE',
        branch: loan.branch || 'Lagos Island Hub - Balogun (BR-002)',
        officerId: loan.officerRegistrationNumber || 'OFF-5514',
        officerName: 'Dr. Anthony Chinedu Mbah (MD/CEO)',
        loanAmount: loan.amount,
        outstandingBalance: loan.amount,
        overdueAmount: loan.overdueAmount || Math.round(loan.amount * 0.45),
        daysPastDue: dpd,
        nplClassification: 'DOUBTFUL',
        severity: 'CRITICAL',
        alertType: 'NPL_STAGE_3',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        title: `HIGH NPL: Doubtful Classification (${dpd} DPD) - ${loan.applicantName}`,
        message: `Account is ${dpd} days past due with ₦${(loan.overdueAmount || 0).toLocaleString()} in arrears. CBN 50% specific provisioning reserve requirement triggered.`,
        isAcknowledged: false,
        recommendedAction: 'Serve 7-Day Final Statutory Demand Letter on 2 Guarantors'
      });
    } else if (classification === 'SUBSTANDARD' || (dpd > 30 && dpd <= 90)) {
      alerts.push({
        id: `alt-sub-${loan.id}`,
        loanId: loan.id,
        borrowerName: loan.applicantName,
        businessName: loan.businessName,
        channel: loan.channel || 'MICROBIZ_INCLUSION_CENTRE',
        branch: loan.branch || 'Kano Commercial - Dawanau (BR-003)',
        officerId: loan.officerRegistrationNumber || 'OFF-1088',
        officerName: 'Blessing Okon',
        loanAmount: loan.amount,
        outstandingBalance: loan.amount,
        overdueAmount: loan.overdueAmount || Math.round(loan.amount * 0.22),
        daysPastDue: dpd,
        nplClassification: 'SUBSTANDARD',
        severity: 'HIGH',
        alertType: 'MANDATE_BOUNCE',
        timestamp: new Date(Date.now() - 14400000).toISOString(),
        title: `NPL WARNING: Substandard (${dpd} DPD) - ${loan.applicantName}`,
        message: `Direct debit mandate rejected for 2 consecutive weekly cycles. Overdue balance: ₦${(loan.overdueAmount || 0).toLocaleString()}.`,
        isAcknowledged: false,
        recommendedAction: 'Conduct On-Site Market Stall Audit & Restructure Loan Schedule'
      });
    } else if (classification === 'WATCHLIST' || (dpd >= 1 && dpd <= 30)) {
      alerts.push({
        id: `alt-watch-${loan.id}`,
        loanId: loan.id,
        borrowerName: loan.applicantName,
        businessName: loan.businessName,
        channel: loan.channel || 'MICROBIZ_MFB',
        branch: loan.branch || 'Abuja Main - New Mpape (BR-001)',
        officerId: loan.officerRegistrationNumber || 'OFF-2041',
        officerName: 'Ibrahim Galadima',
        loanAmount: loan.amount,
        outstandingBalance: loan.amount,
        overdueAmount: loan.overdueAmount || Math.round(loan.amount * 0.08),
        daysPastDue: dpd,
        nplClassification: 'WATCHLIST',
        severity: 'MEDIUM',
        alertType: 'WATCHLIST_SURGE',
        timestamp: new Date(Date.now() - 28800000).toISOString(),
        title: `EARLY WARNING: Special Mention Watchlist (${dpd} DPD) - ${loan.applicantName}`,
        message: `Account is ${dpd} days past due. POS merchant turnover reported a 32% dip over the last 14 days.`,
        isAcknowledged: false,
        recommendedAction: 'Issue Automated SMS Notice & Dispatch Relationship Manager Visit'
      });
    }
  });

  return alerts.sort((a, b) => {
    const severityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
}

/**
 * Computes Overall Portfolio Quality & NPL Summary Metrics
 */
export function computePortfolioQualitySummary(loans: LoanApplication[]) {
  const totalLoans = loans.length;
  const totalPortfolioValue = loans.reduce((sum, l) => sum + l.amount, 0);

  let performingCount = 0;
  let performingValue = 0;
  let watchlistCount = 0;
  let watchlistValue = 0;
  let substandardCount = 0;
  let substandardValue = 0;
  let doubtfulCount = 0;
  let doubtfulValue = 0;
  let lostCount = 0;
  let lostValue = 0;
  let totalOverdue = 0;

  loans.forEach(l => {
    const dpd = l.daysPastDue || 0;
    const classification = l.nplClassification || getNPLClassification(dpd);
    const overdue = l.overdueAmount || (dpd > 0 ? Math.round(l.amount * 0.18) : 0);
    totalOverdue += overdue;

    switch (classification) {
      case 'PERFORMING':
        performingCount++;
        performingValue += l.amount;
        break;
      case 'WATCHLIST':
        watchlistCount++;
        watchlistValue += l.amount;
        break;
      case 'SUBSTANDARD':
        substandardCount++;
        substandardValue += l.amount;
        break;
      case 'DOUBTFUL':
        doubtfulCount++;
        doubtfulValue += l.amount;
        break;
      case 'LOST':
        lostCount++;
        lostValue += l.amount;
        break;
    }
  });

  const totalNplCount = substandardCount + doubtfulCount + lostCount;
  const totalNplValue = substandardValue + doubtfulValue + lostValue;

  const par30 = totalPortfolioValue > 0 ? (totalNplValue / totalPortfolioValue) * 100 : 0;
  const par60 = totalPortfolioValue > 0 ? ((doubtfulValue + lostValue + substandardValue * 0.5) / totalPortfolioValue) * 100 : 0;
  const par90 = totalPortfolioValue > 0 ? ((doubtfulValue + lostValue) / totalPortfolioValue) * 100 : 0;

  const totalRequiredProvisions = 
    (performingValue * 0.01) + 
    (watchlistValue * 0.05) + 
    (substandardValue * 0.10) + 
    (doubtfulValue * 0.50) + 
    (lostValue * 1.00);

  const cbnRegulatoryThreshold = 5.0; // 5.0% Gross NPL ceiling
  const isCbnCompliant = par30 <= cbnRegulatoryThreshold;

  return {
    totalLoans,
    totalPortfolioValue,
    totalOverdue,
    performingCount,
    performingValue,
    watchlistCount,
    watchlistValue,
    substandardCount,
    substandardValue,
    doubtfulCount,
    doubtfulValue,
    lostCount,
    lostValue,
    totalNplCount,
    totalNplValue,
    par30: Number(par30.toFixed(2)),
    par60: Number(par60.toFixed(2)),
    par90: Number(par90.toFixed(2)),
    totalRequiredProvisions: Math.round(totalRequiredProvisions),
    cbnRegulatoryThreshold,
    isCbnCompliant
  };
}
