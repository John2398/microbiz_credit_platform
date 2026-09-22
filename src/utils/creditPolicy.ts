import { 
  LoanApplication, 
  FiveCsEvaluation, 
  MaritalStatus, 
  ShopOwnershipType, 
  RequiredDocumentCategory,
  VerifiedDocument 
} from '../types';

export const CREDIT_POLICY_CONSTANTS = {
  MAX_LOAN_LIMIT_NAIRA: 100000000, // Up to 100 Million Naira
  MAX_LOAN_TENURE_MONTHS: 6, // Maximum loan tenure is 6 months
  SME_INTEREST_RATE_MONTHLY: 5.0, // 5% monthly on SME loans
  MIN_COLLATERAL_COVERAGE_RATIO: 1.5, // Collateral must be >= 150% of loan
  MIN_STOCK_IN_SHOP_RATIO: 0.30, // Stock in shop must be >= 30% of loan requested
  MAX_RECOMMENDED_DTI: 40 // DTI threshold
};

export interface RequiredDocumentDef {
  category: RequiredDocumentCategory;
  title: string;
  shortLabel: string;
  description: string;
  isMandatoryForSme: boolean;
  sampleFileName: string;
}

export const MANDATORY_LOAN_DOCUMENTS: RequiredDocumentDef[] = [
  {
    category: 'NIN_SLIP',
    title: 'National Identity Number (NIN) Slip',
    shortLabel: 'NIN Slip',
    description: 'NIMC official identity slip with 2D barcode and verified biometric match.',
    isMandatoryForSme: true,
    sampleFileName: 'NIMC_National_ID_Slip.pdf'
  },
  {
    category: 'BANK_STATEMENTS_6M',
    title: '6 Months Bank Statements',
    shortLabel: '6M Bank Statements',
    description: 'Stamped commercial or microfinance bank statements verifying 6 months of daily transaction cashflows.',
    isMandatoryForSme: true,
    sampleFileName: 'Official_Bank_Statement_6M.pdf'
  },
  {
    category: 'GUARANTORS_FORMS_2_PASSPORTS',
    title: '2 Guarantors Forms with Passport Photographs',
    shortLabel: '2 Guarantors + Passports',
    description: 'Two fully executed guarantor undertaking forms with 2 verified passport photographs attached.',
    isMandatoryForSme: true,
    sampleFileName: 'Guarantor_Forms_Dual_Passports.pdf'
  },
  {
    category: 'PROOF_OF_ADDRESS',
    title: 'Proof of Address',
    shortLabel: 'Proof of Address',
    description: 'Recent utility bill (AEDC/EKEDC/IBEDC) within 3 months or stamped residential verification report.',
    isMandatoryForSme: true,
    sampleFileName: 'Utility_Bill_Proof_Address.pdf'
  },
  {
    category: 'BORROWER_PASSPORT_PHOTO',
    title: 'Borrower Passport Photograph',
    shortLabel: 'Borrower Passport Photo',
    description: 'Recent white-background clear passport photograph of the primary applicant/director.',
    isMandatoryForSme: true,
    sampleFileName: 'Applicant_Recent_Passport_Photo.jpg'
  },
  {
    category: 'CAC_CERTIFICATE',
    title: 'CAC Certificate (Corporate Affairs Commission)',
    shortLabel: 'CAC Certificate',
    description: 'Certificate of Incorporation (RC) or Business Name Registration (BN) for SME & business clients.',
    isMandatoryForSme: true,
    sampleFileName: 'CAC_Registration_Certificate.pdf'
  },
  {
    category: 'TIN_DOCUMENT',
    title: 'Tax Identification Number (TIN)',
    shortLabel: 'TIN Slip',
    description: 'FIRS / State Internal Revenue Service verified Tax Identification Number (JTB validation).',
    isMandatoryForSme: true,
    sampleFileName: 'FIRS_Tax_Identification_TIN.pdf'
  },
  {
    category: 'COLLATERAL_DOCUMENTS',
    title: 'Collateral Documents (Title / Deeds / Valuation)',
    shortLabel: 'Collateral Documents',
    description: 'Title deeds, C of O, Governor Consent, or vehicle logbooks worth >= 150% of the loan requested.',
    isMandatoryForSme: true,
    sampleFileName: 'Deed_Of_Legal_Mortgage_Collateral.pdf'
  },
  {
    category: 'POST_DATED_CHEQUES',
    title: 'Post-Dated Repayment Cheques',
    shortLabel: 'Cheques',
    description: 'Signed post-dated repayment cheques covering the loan installments from an active commercial bank account.',
    isMandatoryForSme: true,
    sampleFileName: 'Post_Dated_Repayment_Cheques.pdf'
  }
];

/**
 * Computes standard reducing-balance or flat repayment for 5% monthly rate.
 */
export function calculateSmeRepayment(amount: number, tenureMonths: number, monthlyRatePct: number = 5.0) {
  const safeTenure = Math.max(1, Math.min(CREDIT_POLICY_CONSTANTS.MAX_LOAN_TENURE_MONTHS, tenureMonths));
  const r = monthlyRatePct / 100;
  
  // Standard PMT formula: P * (r * (1+r)^n) / ((1+r)^n - 1)
  const factor = Math.pow(1 + r, safeTenure);
  const monthlyPayment = Math.round((amount * (r * factor)) / (factor - 1));
  const totalRepayable = monthlyPayment * safeTenure;
  const totalInterest = totalRepayable - amount;

  return {
    monthlyPayment,
    totalRepayable,
    totalInterest,
    tenureMonths: safeTenure,
    monthlyRatePct
  };
}

/**
 * Rigorously evaluates the 5 Cs of Credit:
 * 1. Character: Bureau score >= 680, clean KYC, 2 guarantors forms + photos
 * 2. Capacity: DTI <= 40%, 6M statements verified, income covers repayment
 * 3. Capital: Equity stake, stock in shop >= 30% of loan requested
 * 4. Collateral: Collateral valuation >= 150% of loan requested, legal title documents sighted
 * 5. Condition: Business vintage, marital status, shop ownership (ownership invoice or rent receipt)
 */
export function evaluate5CsOfCredit(params: {
  amount: number;
  tenureMonths: number;
  monthlyIncome: number;
  existingDebt: number;
  creditScore: number;
  collateralValuation: number;
  stockInShopValuation: number;
  businessVintageYears: number;
  maritalStatus: MaritalStatus;
  shopOwnership: ShopOwnershipType;
  hasOwnershipInvoiceOrRentReceipt: boolean;
  hasGuarantorsForms: boolean;
  has6MonthsStatements: boolean;
  hasCollateralDocs: boolean;
  bvnNinVerified: boolean;
}): FiveCsEvaluation {
  const {
    amount,
    tenureMonths,
    monthlyIncome,
    existingDebt,
    creditScore,
    collateralValuation,
    stockInShopValuation,
    businessVintageYears,
    maritalStatus,
    shopOwnership,
    hasOwnershipInvoiceOrRentReceipt,
    hasGuarantorsForms,
    has6MonthsStatements,
    hasCollateralDocs,
    bvnNinVerified
  } = params;

  // 1. Capacity Calculations
  const repayment = calculateSmeRepayment(amount, tenureMonths, CREDIT_POLICY_CONSTANTS.SME_INTEREST_RATE_MONTHLY);
  const totalDebtService = existingDebt + repayment.monthlyPayment;
  const dti = monthlyIncome > 0 ? Math.round((totalDebtService / monthlyIncome) * 100) : 99;
  const capacityMet = dti <= 40 && has6MonthsStatements && monthlyIncome >= repayment.monthlyPayment * 2.2;
  const capacityScore = Math.max(30, Math.min(100, Math.round(100 - dti + (has6MonthsStatements ? 15 : -30))));

  // 2. Character Calculations
  const characterBureauMet = creditScore >= 680;
  const characterMet = characterBureauMet && bvnNinVerified && hasGuarantorsForms;
  const characterScore = Math.round(
    ((creditScore / 850) * 60) + 
    (bvnNinVerified ? 20 : 0) + 
    (hasGuarantorsForms ? 20 : 0)
  );

  // 3. Collateral Calculations (>= 150% threshold)
  const requiredCollateral = amount * CREDIT_POLICY_CONSTANTS.MIN_COLLATERAL_COVERAGE_RATIO;
  const coverageRatio = amount > 0 ? Math.round((collateralValuation / amount) * 100) : 0;
  const collateralMet = collateralValuation >= requiredCollateral && hasCollateralDocs;
  const collateralScore = Math.min(100, Math.round((coverageRatio / 150) * 80) + (hasCollateralDocs ? 20 : 0));

  // 4. Capital Calculations (Stock in shop >= 30% of loan)
  const requiredStock = amount * CREDIT_POLICY_CONSTANTS.MIN_STOCK_IN_SHOP_RATIO;
  const stockToLoanRatio = amount > 0 ? Math.round((stockInShopValuation / amount) * 100) : 0;
  const stockRequirementMet = stockInShopValuation >= requiredStock;
  const capitalMet = stockRequirementMet && stockInShopValuation > 0;
  const capitalScore = Math.min(100, Math.round((stockToLoanRatio / 30) * 75) + 15);

  // 5. Condition Calculations (Business vintage, marital status, shop ownership invoice/rent receipt)
  const businessVintageMet = businessVintageYears >= 1; // at least 1 year in continuous operation
  const conditionMet = businessVintageMet && hasOwnershipInvoiceOrRentReceipt;
  const conditionScore = Math.min(
    100, 
    (businessVintageYears >= 3 ? 40 : businessVintageYears >= 1 ? 25 : 10) +
    (hasOwnershipInvoiceOrRentReceipt ? 40 : 0) +
    (maritalStatus === 'MARRIED' ? 20 : 15)
  );

  const overallPassed = characterMet && capacityMet && capitalMet && collateralMet && conditionMet;

  return {
    character: {
      status: characterMet ? 'MET' : 'UNMET',
      score: characterScore,
      bureauSummary: `Multi-Bureau FICO Score ${creditScore}/850 (${creditScore >= 750 ? 'Tier AAA' : creditScore >= 680 ? 'Tier A' : 'Subprime/Caution'}).`,
      bvnNinCheck: bvnNinVerified ? 'VERIFIED' : 'FAILED',
      guarantorsSighted: hasGuarantorsForms,
      notes: characterMet 
        ? 'Borrower demonstrates pristine integrity with 2 verified guarantors & clear bureau track record.'
        : 'Guarantor undertaking or bureau threshold not fully satisfied.'
    },
    capacity: {
      status: capacityMet ? 'MET' : 'UNMET',
      score: capacityScore,
      dtiRatio: dti,
      monthlyTurnover: monthlyIncome,
      monthlyInstallment: repayment.monthlyPayment,
      sixMonthsStatementsVerified: has6MonthsStatements,
      notes: capacityMet 
        ? `Debt-to-income ratio of ${dti}% is within the strict <= 40% prudential limit. Cash turnover covers repayment comfortably.`
        : `DTI (${dti}%) exceeds 40% maximum or 6 months bank turnover statements unverified.`
    },
    capital: {
      status: capitalMet ? 'MET' : 'UNMET',
      score: capitalScore,
      ownerEquity: stockInShopValuation * 1.2,
      stockInShopValuation,
      stockToLoanRatio,
      stockRequirementMet,
      notes: stockRequirementMet 
        ? `Stock in shop is ₦${stockInShopValuation.toLocaleString()} (${stockToLoanRatio}% of loan requested, exceeding the mandatory >= 30% rule).`
        : `Deficient shop inventory: Stock is ${stockToLoanRatio}% of requested facility (mandatory >= 30% rule failed).`
    },
    collateral: {
      status: collateralMet ? 'MET' : 'UNMET',
      score: collateralScore,
      collateralValuation,
      coverageRatio,
      collateralRequirementMet: collateralValuation >= requiredCollateral,
      collateralDocsVerified: hasCollateralDocs,
      notes: collateralMet 
        ? `Collateral coverage is ${coverageRatio}% (₦${collateralValuation.toLocaleString()}), strictly satisfying the mandatory >= 150% coverage ratio.`
        : `Collateral valuation of ₦${collateralValuation.toLocaleString()} (${coverageRatio}%) falls below required 150% coverage (₦${requiredCollateral.toLocaleString()}).`
    },
    condition: {
      status: conditionMet ? 'MET' : 'UNMET',
      score: conditionScore,
      businessVintageYears,
      businessVintageMet,
      maritalStatus,
      shopOwnership,
      shopProofDocumentType: shopOwnership === 'OWNED' ? 'OWNERSHIP_INVOICE' : 'RENT_RECEIPT',
      shopDocVerified: hasOwnershipInvoiceOrRentReceipt,
      macroIndustryRisk: 'Stable commercial retail sector with consistent seasonal liquidity.',
      notes: conditionMet 
        ? `Business operating length: ${businessVintageYears} yrs. Marital status: ${maritalStatus}. Shop premises: ${shopOwnership} with verified ${shopOwnership === 'OWNED' ? 'Invoice of Ownership' : 'Receipt of Rentage'}.`
        : `Premises documentation missing: ${shopOwnership === 'OWNED' ? 'Invoice of Ownership' : 'Receipt of Rentage'} required, or business vintage < 1 year.`
    },
    overallPassed,
    approvalEligibility: overallPassed ? 'ELIGIBLE_FOR_SANCTION' : 'INELIGIBLE_DEFICIENT_CRITERIA'
  };
}
