import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  UserCheck, 
  FileText, 
  ShieldCheck, 
  Printer, 
  Clock, 
  CreditCard, 
  Fingerprint, 
  BadgeCheck, 
  ArrowRight,
  MapPin,
  Check,
  RotateCcw,
  Banknote,
  Percent,
  Briefcase,
  Store,
  Home,
  Compass,
  Award,
  Hash
} from 'lucide-react';
import { LoanApplication, LoanType, MaritalStatus, ShopOwnershipType, FiveCsEvaluation, MicrobizChannel } from '../types';
import { formatCurrency, sha256 } from '../utils/crypto';
import { 
  CREDIT_POLICY_CONSTANTS, 
  MANDATORY_LOAN_DOCUMENTS, 
  calculateSmeRepayment, 
  evaluate5CsOfCredit 
} from '../utils/creditPolicy';
import { MICROBIZ_CHANNELS, REGISTERED_CREDIT_OFFICERS, generateChannelTracingRef, getOfficerByRegistration } from '../utils/channels';
import { generateDefaultApprovalChain, createAuditTrailEvent, formatExactDateTime } from '../utils/approvalHierarchy';

interface WalkInCustomerDeskProps {
  onAddWalkInLoan: (loan: LoanApplication) => void;
  onDisburseWalkInLoan: (loan: LoanApplication) => void;
  branchName: string;
}

interface WalkInTicket {
  ticketNo: string;
  customerName: string;
  businessType: string;
  marketCluster: string;
  facilityRequested: string;
  amount: number;
  status: 'AT_DESK' | 'WAITING' | 'BIOMETRICS_DONE' | 'SANCTIONED';
  arrivalTime: string;
  phone: string;
  bvn: string;
  nin: string;
  maritalStatus: MaritalStatus;
  businessVintageYears: number;
  shopOwnership: ShopOwnershipType;
  stockInShopValuation: number;
  collateralValuation: number;
  monthlyTurnover: number;
}

const INITIAL_WALK_IN_TICKETS: WalkInTicket[] = [
  {
    ticketNo: 'W-104',
    customerName: 'Alhaji Musa Danjuma',
    businessType: 'Building Materials & Iron Rods Wholesale',
    marketCluster: 'Mpape Main Building Plaza',
    facilityRequested: 'Bettabiz SME Commercial Facility',
    amount: 15000000,
    status: 'AT_DESK',
    arrivalTime: '09:15 AM',
    phone: '+234 803 291 8841',
    bvn: '22194019284',
    nin: '60192849102',
    maritalStatus: 'MARRIED',
    businessVintageYears: 6,
    shopOwnership: 'OWNED',
    stockInShopValuation: 8500000,
    collateralValuation: 24000000,
    monthlyTurnover: 9200000
  },
  {
    ticketNo: 'W-105',
    customerName: 'Mrs. Ngozi Eze',
    businessType: 'Provisions & FMCG Superstore',
    marketCluster: 'Balogun Central Hub',
    facilityRequested: 'SabiTrader Walk-in Overdraft',
    amount: 2500000,
    status: 'WAITING',
    arrivalTime: '09:30 AM',
    phone: '+234 812 449 1902',
    bvn: '22301928491',
    nin: '50192840192',
    maritalStatus: 'MARRIED',
    businessVintageYears: 4,
    shopOwnership: 'RENTED',
    stockInShopValuation: 1200000,
    collateralValuation: 4200000,
    monthlyTurnover: 1850000
  },
  {
    ticketNo: 'W-106',
    customerName: 'Chief Emmanuel Oladipo',
    businessType: 'Agro Seeds & Commercial Fertilizer Depot',
    marketCluster: 'Dawanau Grain Market',
    facilityRequested: 'Bettabiz SME Commercial Facility',
    amount: 45000000,
    status: 'WAITING',
    arrivalTime: '09:42 AM',
    phone: '+234 802 881 9204',
    bvn: '22940192841',
    nin: '70192849104',
    maritalStatus: 'MARRIED',
    businessVintageYears: 9,
    shopOwnership: 'OWNED',
    stockInShopValuation: 22000000,
    collateralValuation: 72000000,
    monthlyTurnover: 28000000
  },
  {
    ticketNo: 'W-107',
    customerName: 'Hajia Fatima Bello',
    businessType: 'Lace & African Wax Textiles Import',
    marketCluster: 'Wuse Market Zone 5',
    facilityRequested: 'Minimonie Daily Trader',
    amount: 1200000,
    status: 'BIOMETRICS_DONE',
    arrivalTime: '09:50 AM',
    phone: '+234 818 901 8821',
    bvn: '22490192849',
    nin: '80192849103',
    maritalStatus: 'SINGLE',
    businessVintageYears: 3,
    shopOwnership: 'RENTED',
    stockInShopValuation: 600000,
    collateralValuation: 2000000,
    monthlyTurnover: 980000
  }
];

export const WalkInCustomerDesk: React.FC<WalkInCustomerDeskProps> = ({
  onAddWalkInLoan,
  onDisburseWalkInLoan,
  branchName
}) => {
  // Ticket management
  const [tickets, setTickets] = useState<WalkInTicket[]>(INITIAL_WALK_IN_TICKETS);
  const [activeTicket, setActiveTicket] = useState<WalkInTicket>(INITIAL_WALK_IN_TICKETS[0]);
  
  // 4 Steps: 1: Biodata & Business, 2: Facility & 5% SME, 3: Document Inspection (All 9), 4: 5 Cs Evaluation & Sanction
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form states
  const [customerName, setCustomerName] = useState<string>(INITIAL_WALK_IN_TICKETS[0].customerName);
  const [businessName, setBusinessName] = useState<string>(INITIAL_WALK_IN_TICKETS[0].businessType);
  const [phone, setPhone] = useState<string>(INITIAL_WALK_IN_TICKETS[0].phone);
  const [bvn, setBvn] = useState<string>(INITIAL_WALK_IN_TICKETS[0].bvn);
  const [nin, setNin] = useState<string>(INITIAL_WALK_IN_TICKETS[0].nin);
  const [marketCluster, setMarketCluster] = useState<string>(INITIAL_WALK_IN_TICKETS[0].marketCluster);
  
  // Policy parameters
  const [maritalStatus, setMaritalStatus] = useState<MaritalStatus>(INITIAL_WALK_IN_TICKETS[0].maritalStatus);
  const [businessVintageYears, setBusinessVintageYears] = useState<number>(INITIAL_WALK_IN_TICKETS[0].businessVintageYears);
  const [shopOwnership, setShopOwnership] = useState<ShopOwnershipType>(INITIAL_WALK_IN_TICKETS[0].shopOwnership);
  
  // Optical scanner
  const [fingerprintScanning, setFingerprintScanning] = useState<boolean>(false);
  const [fingerprintVerified, setFingerprintVerified] = useState<boolean>(true);

  // Facility state (Max 100M, max 6 months, 5% interest)
  const [selectedChannel, setSelectedChannel] = useState<MicrobizChannel>('MICROBIZ_MFB');
  const [selectedOfficerReg, setSelectedOfficerReg] = useState<string>('REG/MFB/CO-3392');
  const [loanType, setLoanType] = useState<LoanType>('BETTABIZ_SME');
  const [amount, setAmount] = useState<number>(INITIAL_WALK_IN_TICKETS[0].amount);
  const [tenureMonths, setTenureMonths] = useState<number>(6);
  const monthlyRatePct = CREDIT_POLICY_CONSTANTS.SME_INTEREST_RATE_MONTHLY; // 5%
  const [monthlyTurnover, setMonthlyTurnover] = useState<number>(INITIAL_WALK_IN_TICKETS[0].monthlyTurnover);
  const [existingDebt, setExistingDebt] = useState<number>(0);

  // Collateral (>= 150%) and Stock (>= 30%)
  const [collateralValuation, setCollateralValuation] = useState<number>(INITIAL_WALK_IN_TICKETS[0].collateralValuation);
  const [stockInShopValuation, setStockInShopValuation] = useState<number>(INITIAL_WALK_IN_TICKETS[0].stockInShopValuation);

  // Physical document inspection checks (Sighted across counter)
  const [docsChecked, setDocsChecked] = useState<{ [category: string]: boolean }>({
    'NIN_SLIP': true,
    'BANK_STATEMENTS_6M': true,
    'GUARANTORS_FORMS_2_PASSPORTS': true,
    'PROOF_OF_ADDRESS': true,
    'BORROWER_PASSPORT_PHOTO': true,
    'CAC_CERTIFICATE': true,
    'TIN_DOCUMENT': true,
    'COLLATERAL_DOCUMENTS': true,
    'POST_DATED_CHEQUES': true,
    'SHOP_OWNERSHIP_OR_RENT_PROOF': true
  });

  const [bureauScore] = useState<number>(756);
  const [disbursalMode, setDisbursalMode] = useState<'VAULT_CASH_VOUCHER' | 'NUBAN_TRANSFER'>('VAULT_CASH_VOUCHER');
  const [accountNumber] = useState<string>('0198471029');
  const [sanctionedLoan, setSanctionedLoan] = useState<LoanApplication | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const toggleDocChecked = (category: string) => {
    setDocsChecked(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const repayment = useMemo(() => {
    return calculateSmeRepayment(amount, tenureMonths, monthlyRatePct);
  }, [amount, tenureMonths, monthlyRatePct]);

  const minRequiredCollateral = amount * CREDIT_POLICY_CONSTANTS.MIN_COLLATERAL_COVERAGE_RATIO;
  const collateralCoverageRatio = amount > 0 ? Math.round((collateralValuation / amount) * 100) : 0;
  const isCollateralSufficient = collateralValuation >= minRequiredCollateral;

  const minRequiredStock = amount * CREDIT_POLICY_CONSTANTS.MIN_STOCK_IN_SHOP_RATIO;
  const stockCoverageRatio = amount > 0 ? Math.round((stockInShopValuation / amount) * 100) : 0;
  const isStockSufficient = stockInShopValuation >= minRequiredStock;

  const fiveCs: FiveCsEvaluation = useMemo(() => {
    return evaluate5CsOfCredit({
      amount,
      tenureMonths,
      monthlyIncome: monthlyTurnover,
      existingDebt,
      creditScore: bureauScore,
      collateralValuation,
      stockInShopValuation,
      businessVintageYears,
      maritalStatus,
      shopOwnership,
      hasOwnershipInvoiceOrRentReceipt: !!docsChecked['SHOP_OWNERSHIP_OR_RENT_PROOF'],
      hasGuarantorsForms: !!docsChecked['GUARANTORS_FORMS_2_PASSPORTS'],
      has6MonthsStatements: !!docsChecked['BANK_STATEMENTS_6M'],
      hasCollateralDocs: !!docsChecked['COLLATERAL_DOCUMENTS'],
      bvnNinVerified: fingerprintVerified && !!docsChecked['NIN_SLIP']
    });
  }, [
    amount,
    tenureMonths,
    monthlyTurnover,
    existingDebt,
    bureauScore,
    collateralValuation,
    stockInShopValuation,
    businessVintageYears,
    maritalStatus,
    shopOwnership,
    docsChecked,
    fingerprintVerified
  ]);

  const handleSelectTicket = (t: WalkInTicket) => {
    setActiveTicket(t);
    setCustomerName(t.customerName);
    setBusinessName(t.businessType);
    setPhone(t.phone);
    setBvn(t.bvn);
    setNin(t.nin);
    setMarketCluster(t.marketCluster);
    setAmount(t.amount);
    setMaritalStatus(t.maritalStatus);
    setBusinessVintageYears(t.businessVintageYears);
    setShopOwnership(t.shopOwnership);
    setStockInShopValuation(t.stockInShopValuation);
    setCollateralValuation(t.collateralValuation);
    setMonthlyTurnover(t.monthlyTurnover);
    setCurrentStep(1);
    setSanctionedLoan(null);
  };

  const handleCallNextTicket = () => {
    const nextWaiting = tickets.find(t => t.status === 'WAITING');
    if (nextWaiting) {
      setTickets(prev => prev.map(t => {
        if (t.ticketNo === activeTicket.ticketNo) return { ...t, status: 'WAITING' };
        if (t.ticketNo === nextWaiting.ticketNo) return { ...t, status: 'AT_DESK' };
        return t;
      }));
      handleSelectTicket(nextWaiting);
    }
  };

  const handleScanFingerprint = () => {
    setFingerprintScanning(true);
    setFingerprintVerified(false);
    setTimeout(() => {
      setFingerprintScanning(false);
      setFingerprintVerified(true);
    }, 1200);
  };

  const handleProcessWalkInLoan = async () => {
    setIsProcessing(true);

    const docHash1 = await sha256(`${bvn}-${nin}-NIMC-BIOMETRIC-PASSPORT`);
    const docHash2 = await sha256(`${customerName}-${marketCluster}-COLLATERAL-LIEN`);
    const newLoanId = `MB-WALKIN-${Math.floor(1000 + Math.random() * 9000)}`;
    const tracingCode = generateChannelTracingRef(selectedChannel, newLoanId.slice(-4));
    const activeOfficer = getOfficerByRegistration(selectedOfficerReg) || REGISTERED_CREDIT_OFFICERS[0];

    const newLoan: LoanApplication = {
      id: newLoanId,
      applicantName: customerName,
      businessName: businessName,
      email: `${customerName.toLowerCase().replace(/[^a-z]/g, '')}@microbiz-walkin.ng`,
      phone: phone,
      bvn: bvn,
      nin: nin,
      channel: selectedChannel,
      channelTracingRef: tracingCode,
      officerRegistrationNumber: selectedOfficerReg,
      loanType: loanType,
      amount: amount,
      tenureMonths: tenureMonths,
      interestRateAnnual: monthlyRatePct * 12,
      monthlyIncome: monthlyTurnover,
      existingDebt: existingDebt,
      purpose: `Walk-in SME Credit Facility: Restocking & working capital at ${marketCluster}`,
      collateralDescription: `Physically inspected collateral documents worth ${formatCurrency(collateralValuation)} (Coverage: ${collateralCoverageRatio}%) and stock-in-shop worth ${formatCurrency(stockInShopValuation)} (Stock ratio: ${stockCoverageRatio}%)`,
      collateralValuation: collateralValuation,
      status: 'APPROVED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      creditScore: bureauScore,
      riskTier: bureauScore >= 740 ? 'Tier AAA (Prime Walk-in SME)' : 'Tier AA (Low Risk SME)',
      dti: fiveCs.capacity.dtiRatio,
      bankAccount: {
        accountNumber: accountNumber,
        accountName: customerName,
        bankName: 'Microbiz Microfinance Bank Ltd (Branch Counter Vault)'
      },
      maritalStatus: maritalStatus,
      businessVintageYears: businessVintageYears,
      shopOwnership: shopOwnership,
      stockInShopValuation: stockInShopValuation,
      fiveCs: fiveCs,
      documents: [
        {
          id: `doc-wi-nin`,
          name: 'NIMC_National_Identity_Slip_Sighted.pdf',
          type: 'BVN_NIN',
          category: 'NIN_SLIP',
          status: 'VERIFIED',
          hash: docHash1,
          size: '1.2 MB',
          verifiedAt: new Date().toISOString(),
          extractedDetails: [
            { label: 'Optical Fingerprint', value: '100% Match (NIMC Live Switch)' },
            { label: 'Desk Officer Verification', value: 'Physical slip sighted and stamped' }
          ]
        },
        {
          id: `doc-wi-bank6m`,
          name: 'Official_6M_Bank_Statements_Turnover.pdf',
          type: 'BANK_STATEMENT',
          category: 'BANK_STATEMENTS_6M',
          status: 'VERIFIED',
          hash: 'b1a8f4c2e91048b29148c201948ba98104812903841029384710928374615243',
          size: '2.4 MB',
          verifiedAt: new Date().toISOString(),
          extractedDetails: [
            { label: 'Average Monthly Inflow', value: formatCurrency(monthlyTurnover) },
            { label: 'Consistency', value: '98.5% daily cashflow' }
          ]
        },
        {
          id: `doc-wi-collateral`,
          name: 'Collateral_Title_Deed_Valuation_Report.pdf',
          type: 'TITLE_DEED',
          category: 'COLLATERAL_DOCUMENTS',
          status: 'VERIFIED',
          hash: docHash2,
          size: '3.1 MB',
          verifiedAt: new Date().toISOString(),
          extractedDetails: [
            { label: 'Assessed Valuation', value: formatCurrency(collateralValuation) },
            { label: 'Collateral Coverage', value: `${collateralCoverageRatio}% (>= 150% Rule Met)` }
          ]
        },
        {
          id: `doc-wi-guarantors`,
          name: '2_Guarantors_Executed_Forms_Passports.pdf',
          type: 'GUARANTORS_FORMS_2_PASSPORTS',
          category: 'GUARANTORS_FORMS_2_PASSPORTS',
          status: 'VERIFIED',
          hash: 'f720194827519401928410293847102938471029384710293847102938471029',
          size: '1.8 MB',
          verifiedAt: new Date().toISOString(),
          extractedDetails: [
            { label: 'Guarantor 1', value: 'Verified Tier-1 Account Holder' },
            { label: 'Guarantor 2', value: 'Market Executive Committee Member' }
          ]
        },
        {
          id: `doc-wi-shopproof`,
          name: shopOwnership === 'OWNED' ? 'Shop_Ownership_Invoice_Title.pdf' : 'Shop_Rent_Tenancy_Receipt.pdf',
          type: 'CAC_REGISTRATION',
          category: shopOwnership === 'OWNED' ? 'SHOP_OWNERSHIP_INVOICE' : 'SHOP_RENT_RECEIPT',
          status: 'VERIFIED',
          hash: 'd4c8290384710293847102938471029384710293847102938471029384710293',
          size: '950 KB',
          verifiedAt: new Date().toISOString(),
          extractedDetails: [
            { label: 'Premises Status', value: shopOwnership === 'OWNED' ? 'Owned (Invoice Sighted)' : 'Rented (Receipt Sighted)' },
            { label: 'Stock in Shop', value: `${formatCurrency(stockInShopValuation)} (${stockCoverageRatio}% of loan)` }
          ]
        },
        {
          id: `doc-wi-cheques`,
          name: 'Signed_Post_Dated_Repayment_Cheques.pdf',
          type: 'POST_DATED_CHEQUES',
          category: 'POST_DATED_CHEQUES',
          status: 'VERIFIED',
          hash: 'e81049281a049182b30491820491829038471029384710293847102938471029',
          size: '800 KB',
          verifiedAt: new Date().toISOString(),
          extractedDetails: [
            { label: 'Cheque Count', value: `${tenureMonths} Post-dated Cheques` },
            { label: 'Installment Value', value: `${formatCurrency(repayment.monthlyPayment)} / month` }
          ]
        }
      ],
      signature: {
        dataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="40"><path d="M10 25 Q 30 5, 50 25 T 90 20" stroke="%232563EB" fill="none" stroke-width="2"/></svg>',
        timestamp: new Date().toISOString(),
        signatoryName: customerName,
        bvn: bvn,
        keyFingerprint: `counter_sig_${bvn.slice(-4)}_${Date.now()}`,
        ipAddress: '10.0.14.2 (Branch Desk Station #02)'
      },
      officerDecision: {
        decision: 'APPROVED',
        officerId: activeOfficer.officerId,
        officerName: activeOfficer.officerName,
        officerRegistrationNumber: selectedOfficerReg,
        channel: selectedChannel,
        notes: `Walk-in customer verified live at branch desk under ${MICROBIZ_CHANNELS[selectedChannel].name}. Strict 5 Cs of credit criteria fully satisfied. Collateral at ${collateralCoverageRatio}% (>= 150%) and stock at ${stockCoverageRatio}% (>= 30%). 5% monthly SME rate applied for ${tenureMonths} months. Officer license: ${selectedOfficerReg}.`,
        covenants: [
          'Maintain primary business cash turnover via Microbiz MFB account',
          'Post-dated cheques deposited in vault for monthly clearance',
          'Bi-weekly physical stock inventory verification by branch officer'
        ],
        timestamp: new Date().toISOString()
      },
      currentApprovalLevel: 'MANAGING_DIRECTOR',
      approvalChain: generateDefaultApprovalChain(amount, customerName, selectedChannel, selectedOfficerReg, 'FULLY_APPROVED'),
      auditTrail: [
        {
          id: `evt-wi-${Date.now()}-1`,
          timestamp: new Date(Date.now() - 600000).toISOString(),
          formattedDatetime: formatExactDateTime(new Date(Date.now() - 600000).toISOString()),
          actorName: customerName,
          actorRole: 'Walk-In Applicant',
          stage: 'INTAKE_REGISTRATION',
          action: `Walk-in customer intake at ${branchName} Counter Station #02`,
          status: 'SUCCESS',
          notes: `Requested ${formatCurrency(amount)} for ${tenureMonths} months @ 5% monthly rate.`
        },
        {
          id: `evt-wi-${Date.now()}-2`,
          timestamp: new Date(Date.now() - 480000).toISOString(),
          formattedDatetime: formatExactDateTime(new Date(Date.now() - 480000).toISOString()),
          actorName: 'NIMC / NIBSS Biometric Desk Scanner',
          actorRole: 'Identity Verification Rail',
          stage: 'BIOMETRIC_KYC',
          action: `NIN (${nin}) & BVN (${bvn}) live optical biometric facial match verified (99.8% match)`,
          status: 'SUCCESS'
        },
        {
          id: `evt-wi-${Date.now()}-3`,
          timestamp: new Date(Date.now() - 360000).toISOString(),
          formattedDatetime: formatExactDateTime(new Date(Date.now() - 360000).toISOString()),
          actorName: activeOfficer.officerName,
          actorRole: 'Credit Officer',
          actorRegistrationNumber: selectedOfficerReg,
          stage: 'DOCUMENTS_SIGHTED',
          action: 'All 9 mandatory physical documents inspected and counter-stamped',
          status: 'SUCCESS',
          notes: `Shop premises status: ${shopOwnership === 'OWNED' ? 'Ownership Invoice' : 'Rent Receipt'} verified.`
        },
        {
          id: `evt-wi-${Date.now()}-4`,
          timestamp: new Date(Date.now() - 240000).toISOString(),
          formattedDatetime: formatExactDateTime(new Date(Date.now() - 240000).toISOString()),
          actorName: activeOfficer.officerName,
          actorRole: 'Credit Officer',
          actorRegistrationNumber: selectedOfficerReg,
          stage: '5_CS_EVALUATION',
          action: 'Character, Capacity, Capital, Collateral, Condition evaluated and passed',
          status: 'SUCCESS',
          notes: `Collateral coverage: ${collateralCoverageRatio}% (>=150%), Stock in shop: ${stockCoverageRatio}% (>=30%).`
        },
        {
          id: `evt-wi-${Date.now()}-5`,
          timestamp: new Date(Date.now() - 120000).toISOString(),
          formattedDatetime: formatExactDateTime(new Date(Date.now() - 120000).toISOString()),
          actorName: 'Dr. Anthony Chinedu Mbah (MD/CEO)',
          actorRole: 'Managing Director / CEO',
          actorRegistrationNumber: 'REG/MFB/MD-0001',
          stage: 'APPROVAL_TIER_7',
          action: '7-Tier Approval Chain fully completed and digitally signed',
          status: 'SUCCESS',
          notes: 'Prudential sanction cleared for immediate branch vault cash / NUBAN settlement.'
        },
        {
          id: `evt-wi-${Date.now()}-6`,
          timestamp: new Date().toISOString(),
          formattedDatetime: formatExactDateTime(new Date().toISOString()),
          actorName: 'Temenos T24 Core Banking Engine',
          actorRole: 'Settlement Rail',
          stage: 'CBS_DISBURSAL',
          action: `Immediate walk-in counter disbursal executed via ${disbursalMode}`,
          status: 'SUCCESS',
          notes: `Mandate: NIBSS-MND-WI-${Math.floor(100000 + Math.random() * 900000)}. Ref: T24-WI-${Date.now().toString().slice(-8)}`
        }
      ],
      mandateId: `NIBSS-MND-WI-${Math.floor(100000 + Math.random() * 900000)}`,
      cbsReference: `T24-WI-${Date.now().toString().slice(-8)}`
    };

    onAddWalkInLoan(newLoan);
    onDisburseWalkInLoan(newLoan);

    setTickets(prev => prev.map(t => t.ticketNo === activeTicket.ticketNo ? { ...t, status: 'SANCTIONED' } : t));
    setIsProcessing(false);
    setSanctionedLoan(newLoan);
  };

  return (
    <div className="space-y-6">
      
      {/* Branch Counter Desk Header Banner (Strict Blue and White Theme) */}
      <div className="bg-[#0B1E36] border border-blue-900 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600 border border-blue-400 flex items-center justify-center text-white shadow-md shadow-blue-600/30">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-white tracking-tight">
                  Branch Walk-In Customer Desk
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-900 text-blue-200 border border-blue-600">
                  Station #02
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#061224] text-blue-300 border border-blue-800">
                  In-Branch Walk-In Desk
                </span>
              </div>
              <p className="text-xs text-blue-200/90 mt-1">
                Direct in-person loan intake, physical document sighting, biometric verification, and immediate counter disbursal for walk-in SME and trade clients.
              </p>
            </div>
          </div>

          {/* Desk Officer Info & Call Next Button */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="px-3.5 py-2 rounded-xl bg-[#061224] border border-blue-900 text-xs">
              <div className="text-[10px] text-blue-300">Desk Officer on Duty</div>
              <div className="font-semibold text-white flex items-center gap-1.5 mt-0.5">
                <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>Folasade Adebayo (OFF-3392)</span>
              </div>
            </div>

            <div className="px-3.5 py-2 rounded-xl bg-[#061224] border border-blue-900 text-xs">
              <div className="text-[10px] text-blue-300">Branch Terminal</div>
              <div className="font-semibold text-white flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                <span>{branchName}</span>
              </div>
            </div>

            <button
              onClick={handleCallNextTicket}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/30 flex items-center space-x-2"
            >
              <span>Call Next Customer</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

        {/* Live Walk-In Customer Waiting Hall Queue */}
        <div className="mt-5 pt-4 border-t border-blue-900">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2 text-xs text-blue-200 font-semibold">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span>Branch Lobby Queue (Walk-In Customers)</span>
              <span className="text-[10px] font-normal text-blue-300">
                ({tickets.filter(t => t.status === 'WAITING').length} customers waiting in lobby)
              </span>
            </div>
            <span className="text-[11px] text-blue-200">
              Serving at Counter: <strong className="text-white font-mono">{activeTicket.ticketNo}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {tickets.map((t) => {
              const isSelected = t.ticketNo === activeTicket.ticketNo;
              return (
                <button
                  key={t.ticketNo}
                  onClick={() => handleSelectTicket(t)}
                  className={`p-3 rounded-xl text-left border transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-300 shadow-md shadow-blue-600/40'
                      : 'bg-[#071529] hover:bg-[#0E2648] border-blue-900 text-blue-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-mono text-xs font-bold px-1.5 py-0.5 rounded ${
                      isSelected ? 'bg-blue-800 text-white' : 'bg-blue-950 text-blue-300 border border-blue-800'
                    }`}>
                      {t.ticketNo}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      t.status === 'SANCTIONED'
                        ? isSelected ? 'bg-blue-900 text-white' : 'bg-blue-950 text-blue-300 border border-blue-700'
                        : t.status === 'AT_DESK'
                        ? isSelected ? 'bg-white text-blue-900 font-bold' : 'bg-blue-600 text-white'
                        : isSelected ? 'bg-blue-800 text-blue-200' : 'bg-[#061224] text-blue-300 border border-blue-900'
                    }`}>
                      {t.status === 'AT_DESK' ? 'At Counter Desk' : t.status === 'SANCTIONED' ? 'Disbursed' : 'In Lobby'}
                    </span>
                  </div>
                  <div className="mt-2 font-bold text-xs truncate">
                    {t.customerName}
                  </div>
                  <div className={`text-[10px] truncate mt-0.5 ${isSelected ? 'text-blue-100' : 'text-blue-300'}`}>
                    {t.businessType}
                  </div>
                  <div className="mt-1.5 flex items-center justify-between text-[11px] font-mono">
                    <span className={isSelected ? 'text-white font-bold' : 'text-blue-400 font-semibold'}>
                      {formatCurrency(t.amount)}
                    </span>
                    <span className={`text-[10px] ${isSelected ? 'text-blue-100' : 'text-blue-400'}`}>
                      {t.arrivalTime}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Walk-In Workflow Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Step-by-Step Counter Processing */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Step Navigation Tabs */}
          <div className="bg-[#0B1E36] border border-blue-900 rounded-2xl p-3 flex items-center justify-between gap-1 overflow-x-auto">
            {[
              { num: 1, title: '1. Loan Application' },
              { num: 2, title: '2. Loan Analysis' },
              { num: 3, title: '3. Loan Documentation' },
              { num: 4, title: '4. Loan Disbursement' }
            ].map((step) => {
              const isActive = currentStep === step.num;
              const isPast = currentStep > step.num;
              return (
                <button
                  key={step.num}
                  onClick={() => setCurrentStep(step.num)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-left transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'hover:bg-blue-900/40 text-blue-200'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                    isActive
                      ? 'bg-white text-blue-900 font-extrabold'
                      : isPast
                      ? 'bg-blue-800 text-white'
                      : 'bg-[#071529] text-blue-400 border border-blue-800'
                  }`}>
                    {isPast ? <Check className="w-3.5 h-3.5 text-white" /> : step.num}
                  </div>
                  <span className="text-xs font-semibold whitespace-nowrap">
                    {step.title}
                  </span>
                </button>
              );
            })}
          </div>

          {/* STEP 1: 1. LOAN APPLICATION */}
          {currentStep === 1 && (
            <div className="bg-[#0B1E36] border border-blue-900 rounded-2xl p-6 space-y-6 shadow-xl">
              <div className="border-b border-blue-900 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <Fingerprint className="w-5 h-5 text-blue-400" />
                      <span>Stage 1: Loan Application (Customer Intake, Biometrics & Profile)</span>
                    </h2>
                    <p className="text-xs text-blue-200/90 mt-0.5">
                      Interview walk-in client at the counter, capture optical fingerprint for NIBSS/NIMC live match, and record business background.
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-[#071529] text-blue-300 border border-blue-800">
                    Ticket: {activeTicket.ticketNo}
                  </span>
                </div>
              </div>

              {/* Channel Platform and Credit Officer Selection */}
              <div className="bg-[#071529] border border-blue-800/80 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Compass className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Microbiz Group Channel & Credit Officer Tracing Desk
                    </span>
                  </div>
                  <span className="text-[10px] text-blue-300 font-mono">
                    Live Tracing Ref: {generateChannelTracingRef(selectedChannel, activeTicket.ticketNo)}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1">
                      Origination Platform Channel
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(Object.keys(MICROBIZ_CHANNELS) as MicrobizChannel[]).map((ch) => {
                        const meta = MICROBIZ_CHANNELS[ch];
                        const isSelected = selectedChannel === ch;
                        return (
                          <button
                            key={ch}
                            type="button"
                            onClick={() => {
                              setSelectedChannel(ch);
                              // Auto pick an officer in that channel
                              const matchingOfficer = REGISTERED_CREDIT_OFFICERS.find(o => o.channel === ch);
                              if (matchingOfficer) setSelectedOfficerReg(matchingOfficer.registrationNumber);
                            }}
                            className={`p-2 rounded-lg text-left border transition-all text-xs flex flex-col justify-between ${
                              isSelected
                                ? 'bg-blue-800 text-white border-blue-400 shadow-md ring-1 ring-blue-400'
                                : 'bg-[#0B1E36] text-slate-300 border-blue-900 hover:border-blue-700'
                            }`}
                          >
                            <span className="font-mono font-bold text-[10px] text-blue-300">{meta.code}</span>
                            <span className="font-semibold text-[11px] leading-tight line-clamp-1">{meta.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1">
                      Credit Officer on Duty (Registration Number)
                    </label>
                    <select
                      value={selectedOfficerReg}
                      onChange={(e) => setSelectedOfficerReg(e.target.value)}
                      className="w-full bg-[#0B1E36] border border-blue-800 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-400 font-medium"
                    >
                      {REGISTERED_CREDIT_OFFICERS.map((officer) => (
                        <option key={officer.registrationNumber} value={officer.registrationNumber}>
                          {officer.registrationNumber} • {officer.officerName} ({officer.role})
                        </option>
                      ))}
                    </select>
                    <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                      <Award className="w-3 h-3 text-blue-400" />
                      <span>Certified license stamped on loan voucher and PoA ledger</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white mb-1.5">
                    Walk-in Customer Full Name
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-[#071529] border border-blue-800 text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-blue-400 font-medium"
                    placeholder="e.g. Alhaji Musa Danjuma"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white mb-1.5">
                    Trading Business / Enterprise Name
                  </label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full bg-[#071529] border border-blue-800 text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-blue-400 font-medium"
                    placeholder="e.g. Danjuma Iron Rods & Building Wholesale"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white mb-1.5">
                    Phone Number (SMS & e-Mandate Alerts)
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#071529] border border-blue-800 text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-blue-400 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white mb-1.5">
                    Market Cluster / Stall Location
                  </label>
                  <input
                    type="text"
                    value={marketCluster}
                    onChange={(e) => setMarketCluster(e.target.value)}
                    className="w-full bg-[#071529] border border-blue-800 text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-blue-400 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white mb-1.5">
                    Bank Verification Number (BVN)
                  </label>
                  <input
                    type="text"
                    value={bvn}
                    onChange={(e) => setBvn(e.target.value)}
                    maxLength={11}
                    className="w-full bg-[#071529] border border-blue-800 text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-blue-400 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white mb-1.5">
                    National Identity Number (NIN)
                  </label>
                  <input
                    type="text"
                    value={nin}
                    onChange={(e) => setNin(e.target.value)}
                    maxLength={11}
                    className="w-full bg-[#071529] border border-blue-800 text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-blue-400 font-mono"
                  />
                </div>

                {/* Marital Status Selector (Required by User Policy) */}
                <div>
                  <label className="block text-xs font-bold text-white mb-1.5">
                    Marital Status (Policy Verification)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['MARRIED', 'SINGLE'] as MaritalStatus[]).map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setMaritalStatus(status)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                          maritalStatus === status
                            ? 'bg-blue-600 text-white border-blue-400 shadow-md'
                            : 'bg-[#071529] text-blue-200 border-blue-900 hover:border-blue-700'
                        }`}
                      >
                        {status === 'MARRIED' ? 'Married' : 'Single'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Length of Business in Operation (Years) (Required by User Policy) */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-bold text-white">
                      Length of Business in Operation
                    </label>
                    <span className="text-xs font-bold text-blue-300 font-mono">
                      {businessVintageYears} {businessVintageYears === 1 ? 'Year' : 'Years'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={25}
                    step={1}
                    value={businessVintageYears}
                    onChange={(e) => setBusinessVintageYears(Number(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                  <div className="flex justify-between text-[10px] text-blue-400 font-mono mt-0.5">
                    <span>1 yr (min)</span>
                    <span>5 yrs</span>
                    <span>15 yrs</span>
                    <span>25 yrs</span>
                  </div>
                </div>
              </div>

              {/* Optical Biometric Desk Scanner */}
              <div className="bg-[#071529] border border-blue-900 rounded-xl p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all ${
                      fingerprintScanning
                        ? 'bg-blue-600 text-white animate-pulse border-blue-300'
                        : fingerprintVerified
                        ? 'bg-blue-950 text-blue-300 border-blue-600'
                        : 'bg-[#0B1E36] text-blue-400 border-blue-900'
                    }`}>
                      <Fingerprint className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>Counter Biometric Optical Scanner</span>
                        {fingerprintVerified && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-600 text-white font-bold">
                            NIMC Biometrics Matched 100%
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-blue-200/90 mt-0.5">
                        Customer places thumb on counter scanner connected to NIBSS / NIMC verification gateway.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleScanFingerprint}
                    disabled={fingerprintScanning}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center space-x-1.5 disabled:opacity-50"
                  >
                    {fingerprintScanning ? (
                      <>
                        <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                        <span>Scanning...</span>
                      </>
                    ) : (
                      <>
                        <Fingerprint className="w-3.5 h-3.5" />
                        <span>{fingerprintVerified ? 'Re-scan Biometrics' : 'Capture Fingerprint'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/30 flex items-center space-x-2"
                >
                  <span>Proceed to Facility & 5% SME Amortization</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: 2. LOAN ANALYSIS */}
          {currentStep === 2 && (
            <div className="bg-[#0B1E36] border border-blue-900 rounded-2xl p-6 space-y-6 shadow-xl">
              <div className="border-b border-blue-900 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-blue-400" />
                      <span>Stage 2: Loan Analysis (5% Monthly SME Rate & Underwriting Ratios)</span>
                    </h2>
                    <p className="text-xs text-blue-200/90 mt-0.5">
                      Enforce credit policy: Maximum loan up to ₦100,000,000, 5% monthly interest on SME loans, maximum tenure of 6 months, collateral coverage &ge; 150%, and stock in shop &ge; 30%.
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-900 text-white border border-blue-500 font-mono">
                    5% Monthly Interest
                  </span>
                </div>
              </div>

              {/* Loan Product Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  {
                    type: 'BETTABIZ_SME' as LoanType,
                    title: 'Bettabiz SME Loan',
                    cap: 'Up to ₦100,000,000',
                    tenure: '1 to 6 Months',
                    desc: 'Primary SME facility for registered trade businesses & distributors.'
                  },
                  {
                    type: 'SABI_TRADER' as LoanType,
                    title: 'SabiTrader Overdraft',
                    cap: 'Up to ₦10,000,000',
                    tenure: '1 to 6 Months',
                    desc: 'Fast working capital for market stall retailers & wholesale traders.'
                  },
                  {
                    type: 'MICRO_MORTGAGE' as LoanType,
                    title: 'Property-Backed SME',
                    cap: 'Up to ₦100,000,000',
                    tenure: '1 to 6 Months',
                    desc: 'Secured commercial capital backed by landed collateral & stock.'
                  },
                  {
                    type: 'MINIMONIE_GROUP' as LoanType,
                    title: 'Minimonie Daily Trader',
                    cap: 'Up to ₦5,000,000',
                    tenure: '1 to 6 Months',
                    desc: 'Micro-credit facility with peer guarantor verification & turnover inspection.'
                  }
                ].map((prod) => {
                  const isSelected = loanType === prod.type;
                  return (
                    <button
                      key={prod.type}
                      type="button"
                      onClick={() => setLoanType(prod.type)}
                      className={`p-3.5 rounded-xl text-left border transition-all ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-300 shadow-md shadow-blue-600/30'
                          : 'bg-[#071529] hover:bg-[#0E2648] border-blue-900 text-blue-100'
                      }`}
                    >
                      <div className="font-bold text-xs">{prod.title}</div>
                      <div className={`text-[10px] mt-1 font-mono font-bold ${isSelected ? 'text-white' : 'text-blue-300'}`}>
                        {prod.cap} • {prod.tenure}
                      </div>
                      <div className={`text-[11px] mt-1.5 line-clamp-2 ${isSelected ? 'text-blue-100' : 'text-blue-200/80'}`}>
                        {prod.desc}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Amount Input with Presets up to 100M */}
              <div className="bg-[#071529] border border-blue-900 rounded-xl p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="text-xs font-bold text-white block">
                      Facility Amount Requested (Maximum Cap: ₦100,000,000)
                    </label>
                    <span className="text-[10px] text-blue-300">
                      Enter amount or select from quick branch presets.
                    </span>
                  </div>
                  <div className="text-lg font-extrabold text-white font-mono bg-blue-950 px-3 py-1 rounded-lg border border-blue-700">
                    {formatCurrency(amount)}
                  </div>
                </div>

                {/* Amount Quick Presets */}
                <div className="flex flex-wrap gap-2">
                  {[
                    1000000,
                    2500000,
                    5000000,
                    15000000,
                    30000000,
                    50000000,
                    100000000
                  ].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAmount(val)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all ${
                        amount === val
                          ? 'bg-blue-600 text-white border-blue-400'
                          : 'bg-[#0B1E36] text-blue-200 border-blue-900 hover:border-blue-700'
                      }`}
                    >
                      {val >= 1000000 ? `₦${val / 1000000}M` : formatCurrency(val)}
                    </button>
                  ))}
                </div>

                <input
                  type="range"
                  min={100000}
                  max={CREDIT_POLICY_CONSTANTS.MAX_LOAN_LIMIT_NAIRA}
                  step={500000}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
                <div className="flex justify-between text-[10px] text-blue-400 font-mono">
                  <span>₦100,000</span>
                  <span>₦25,000,000</span>
                  <span>₦50,000,000</span>
                  <span className="font-bold text-blue-200">₦100,000,000 (Max)</span>
                </div>
              </div>

              {/* Tenure (Strictly Max 6 Months) & Monthly Rate (Strictly 5% Monthly) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Tenure Selector (1 to 6 Months) */}
                <div className="bg-[#071529] border border-blue-900 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-white">
                      Loan Tenure (Max 6 Months Policy)
                    </label>
                    <span className="text-xs font-bold text-white font-mono bg-blue-900 px-2 py-0.5 rounded">
                      {tenureMonths} {tenureMonths === 1 ? 'Month' : 'Months'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-6 gap-1.5 mb-2">
                    {[1, 2, 3, 4, 5, 6].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setTenureMonths(m)}
                        className={`py-2 rounded-lg text-xs font-mono font-bold border transition-all ${
                          tenureMonths === m
                            ? 'bg-blue-600 text-white border-blue-300 shadow-md'
                            : 'bg-[#0B1E36] text-blue-200 border-blue-900 hover:border-blue-700'
                        }`}
                      >
                        {m}M
                      </button>
                    ))}
                  </div>
                  <div className="text-[10px] text-blue-300">
                    Maximum loan tenure permitted by SME underwriting policy is strictly 6 months.
                  </div>
                </div>

                {/* Interest Rate & Monthly Turnover */}
                <div className="bg-[#071529] border border-blue-900 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-white">SME Monthly Interest Rate</span>
                    <span className="text-xs font-extrabold text-blue-300 font-mono bg-blue-950 px-2.5 py-0.5 rounded border border-blue-700">
                      5.0% / Month
                    </span>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-blue-200 mb-1">
                      Applicant 6-Month Monthly Turnover Average
                    </label>
                    <input
                      type="number"
                      value={monthlyTurnover}
                      onChange={(e) => setMonthlyTurnover(Number(e.target.value))}
                      className="w-full bg-[#0B1E36] border border-blue-800 text-white rounded-lg px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-blue-400"
                      placeholder="e.g. 9200000"
                    />
                  </div>
                </div>

              </div>

              {/* CRITICAL POLICY INPUTS: Collateral (>=150%) and Stock in Shop (>=30%) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Collateral Valuation Card (Must be >= 150%) */}
                <div className={`p-4 rounded-xl border transition-all ${
                  isCollateralSufficient
                    ? 'bg-[#071529] border-blue-600'
                    : 'bg-[#071529] border-blue-900'
                }`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center space-x-1.5">
                      <ShieldCheck className="w-4 h-4 text-blue-400" />
                      <label className="text-xs font-bold text-white">
                        Collateral Valuation (&ge; 150% Rule)
                      </label>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isCollateralSufficient
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-950 text-blue-300 border border-blue-700'
                    }`}>
                      {isCollateralSufficient ? 'COVERAGE MET' : 'DEFICIENT'}
                    </span>
                  </div>

                  <p className="text-[10px] text-blue-200/80 mb-2">
                    Required: &ge; {formatCurrency(minRequiredCollateral)} (150% of loan). Current Coverage: <strong className="text-white font-mono">{collateralCoverageRatio}%</strong>
                  </p>

                  <input
                    type="number"
                    value={collateralValuation}
                    onChange={(e) => setCollateralValuation(Number(e.target.value))}
                    className="w-full bg-[#0B1E36] border border-blue-800 text-white rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-blue-400 font-bold"
                  />

                  <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-blue-300">
                    <span>Valuation: {formatCurrency(collateralValuation)}</span>
                    <span className={isCollateralSufficient ? 'text-white font-bold' : 'text-blue-300'}>
                      {collateralCoverageRatio}% of loan
                    </span>
                  </div>
                </div>

                {/* Stock in Shop Valuation Card (Must be >= 30%) */}
                <div className={`p-4 rounded-xl border transition-all ${
                  isStockSufficient
                    ? 'bg-[#071529] border-blue-600'
                    : 'bg-[#071529] border-blue-900'
                }`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center space-x-1.5">
                      <Store className="w-4 h-4 text-blue-400" />
                      <label className="text-xs font-bold text-white">
                        Stock in Shop Valuation (&ge; 30% Rule)
                      </label>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isStockSufficient
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-950 text-blue-300 border border-blue-700'
                    }`}>
                      {isStockSufficient ? 'STOCK MET' : 'DEFICIENT'}
                    </span>
                  </div>

                  <p className="text-[10px] text-blue-200/80 mb-2">
                    Required: &ge; {formatCurrency(minRequiredStock)} (30% of loan). Current Ratio: <strong className="text-white font-mono">{stockCoverageRatio}%</strong>
                  </p>

                  <input
                    type="number"
                    value={stockInShopValuation}
                    onChange={(e) => setStockInShopValuation(Number(e.target.value))}
                    className="w-full bg-[#0B1E36] border border-blue-800 text-white rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-blue-400 font-bold"
                  />

                  <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-blue-300">
                    <span>Stock: {formatCurrency(stockInShopValuation)}</span>
                    <span className={isStockSufficient ? 'text-white font-bold' : 'text-blue-300'}>
                      {stockCoverageRatio}% of loan
                    </span>
                  </div>
                </div>

              </div>

              {/* Shop Ownership Status: Owned (Invoice) vs Rented (Rent Receipt) */}
              <div className="bg-[#071529] border border-blue-900 rounded-xl p-4 space-y-2">
                <label className="block text-xs font-bold text-white">
                  Shop Premises Status (Required by Underwriting Policy)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setShopOwnership('OWNED')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      shopOwnership === 'OWNED'
                        ? 'bg-blue-600 text-white border-blue-400 shadow-md'
                        : 'bg-[#0B1E36] text-blue-200 border-blue-900 hover:border-blue-700'
                    }`}
                  >
                    <div className="font-bold text-xs flex items-center gap-1.5">
                      <Home className="w-4 h-4" />
                      <span>Client Owns the Shop</span>
                    </div>
                    <div className={`text-[10px] mt-1 ${shopOwnership === 'OWNED' ? 'text-blue-100' : 'text-blue-300'}`}>
                      Mandatory: Must present <strong>Invoice for Ownership</strong> or Deed of Assignment.
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShopOwnership('RENTED')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      shopOwnership === 'RENTED'
                        ? 'bg-blue-600 text-white border-blue-400 shadow-md'
                        : 'bg-[#0B1E36] text-blue-200 border-blue-900 hover:border-blue-700'
                    }`}
                  >
                    <div className="font-bold text-xs flex items-center gap-1.5">
                      <Store className="w-4 h-4" />
                      <span>Client Rents the Shop</span>
                    </div>
                    <div className={`text-[10px] mt-1 ${shopOwnership === 'RENTED' ? 'text-blue-100' : 'text-blue-300'}`}>
                      Mandatory: Must present <strong>Receipt of Rentage</strong> (valid for current period).
                    </div>
                  </button>
                </div>
              </div>

              {/* Computed 5% SME Repayment Breakdown */}
              <div className="bg-[#071529] border border-blue-900 rounded-xl p-4">
                <div className="text-xs font-bold text-white mb-3 flex items-center justify-between">
                  <span>SME Repayment Schedule (5.0% Monthly Interest Rate)</span>
                  <span className="text-[11px] text-blue-300 font-mono font-bold">
                    Tenure: {tenureMonths} Months
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-2.5 rounded-lg bg-[#0B1E36] border border-blue-900">
                    <div className="text-[10px] text-blue-300">Principal</div>
                    <div className="text-sm font-bold text-white font-mono mt-0.5">
                      {formatCurrency(amount)}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#0B1E36] border border-blue-900">
                    <div className="text-[10px] text-blue-300">Monthly Installment (5%)</div>
                    <div className="text-sm font-extrabold text-blue-300 font-mono mt-0.5">
                      {formatCurrency(repayment.monthlyPayment)}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#0B1E36] border border-blue-900">
                    <div className="text-[10px] text-blue-300">Total Interest (5% / mo)</div>
                    <div className="text-sm font-bold text-white font-mono mt-0.5">
                      {formatCurrency(repayment.totalInterest)}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#0B1E36] border border-blue-900">
                    <div className="text-[10px] text-blue-300">Total Repayable</div>
                    <div className="text-sm font-bold text-white font-mono mt-0.5">
                      {formatCurrency(repayment.totalRepayable)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2 border border-blue-800 text-blue-200 hover:text-white rounded-xl text-xs font-semibold"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/30 flex items-center space-x-2"
                >
                  <span>Proceed to Physical Document Inspection (All 9 Required)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: 3. LOAN DOCUMENTATION */}
          {currentStep === 3 && (
            <div className="bg-[#0B1E36] border border-blue-900 rounded-2xl p-6 space-y-6 shadow-xl">
              <div className="border-b border-blue-900 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-400" />
                      <span>Stage 3: Loan Documentation (Physical Document Inspection & Counter Sighting)</span>
                    </h2>
                    <p className="text-xs text-blue-200/90 mt-0.5">
                      The desk officer inspects and verifies original hard copies across the counter. All 9 mandated documents must be sighted and verified.
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-900 text-blue-200 border border-blue-700">
                    Mandatory Policy Checklist
                  </span>
                </div>
              </div>

              {/* Document Checklist Items */}
              <div className="space-y-3">
                {MANDATORY_LOAN_DOCUMENTS.map((docDef) => {
                  const isChecked = !!docsChecked[docDef.category];
                  return (
                    <div
                      key={docDef.category}
                      onClick={() => toggleDocChecked(docDef.category)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start space-x-3.5 ${
                        isChecked
                          ? 'bg-[#071529] border-blue-600 text-white'
                          : 'bg-[#07111E] border-blue-950 text-blue-300/70 hover:border-blue-800'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center mt-0.5 border transition-all ${
                        isChecked ? 'bg-blue-600 border-blue-400 text-white' : 'border-blue-800 bg-[#0B1E36]'
                      }`}>
                        {isChecked && <Check className="w-3.5 h-3.5 text-white" />}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">{docDef.title}</span>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                            isChecked
                              ? 'bg-blue-900 text-blue-200 font-bold'
                              : 'bg-blue-950 text-blue-400'
                          }`}>
                            {isChecked ? 'Physically Sighted & Verified' : 'Pending Sighting'}
                          </span>
                        </div>
                        <p className="text-[11px] text-blue-200/80 mt-1">{docDef.description}</p>
                        <div className="text-[10px] font-mono text-blue-400 mt-1">
                          File: {docDef.sampleFileName}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Specific Shop Premises Document (Invoice if owned, Receipt if rented) */}
                <div
                  onClick={() => toggleDocChecked('SHOP_OWNERSHIP_OR_RENT_PROOF')}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start space-x-3.5 ${
                    docsChecked['SHOP_OWNERSHIP_OR_RENT_PROOF']
                      ? 'bg-[#071529] border-blue-600 text-white'
                      : 'bg-[#07111E] border-blue-950 text-blue-300/70 hover:border-blue-800'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center mt-0.5 border transition-all ${
                    docsChecked['SHOP_OWNERSHIP_OR_RENT_PROOF'] ? 'bg-blue-600 border-blue-400 text-white' : 'border-blue-800 bg-[#0B1E36]'
                  }`}>
                    {docsChecked['SHOP_OWNERSHIP_OR_RENT_PROOF'] && <Check className="w-3.5 h-3.5 text-white" />}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">
                        {shopOwnership === 'OWNED' ? 'Shop Premises Invoice of Ownership' : 'Shop Premises Receipt of Rentage'}
                      </span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                        docsChecked['SHOP_OWNERSHIP_OR_RENT_PROOF']
                          ? 'bg-blue-900 text-blue-200 font-bold'
                          : 'bg-blue-950 text-blue-400'
                      }`}>
                        {docsChecked['SHOP_OWNERSHIP_OR_RENT_PROOF'] ? 'Original Document Verified' : 'Pending Sighting'}
                      </span>
                    </div>
                    <p className="text-[11px] text-blue-200/80 mt-1">
                      {shopOwnership === 'OWNED'
                        ? 'Official purchase invoice or allotment deed proving client owns the shop stall premises.'
                        : 'Official stamped landlord/market authority receipt of rentage confirming rental tenure.'}
                    </p>
                    <div className="text-[10px] font-mono text-blue-400 mt-1">
                      Category: {shopOwnership === 'OWNED' ? 'Invoice of Ownership' : 'Receipt of Rentage'}
                    </div>
                  </div>
                </div>

              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2 border border-blue-800 text-blue-200 hover:text-white rounded-xl text-xs font-semibold"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/30 flex items-center space-x-2"
                >
                  <span>Proceed to 5 Cs Evaluation & Sanction</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: 4. LOAN DISBURSEMENT */}
          {currentStep === 4 && (
            <div className="bg-[#0B1E36] border border-blue-900 rounded-2xl p-6 space-y-6 shadow-xl">
              <div className="border-b border-blue-900 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-blue-400" />
                      <span>Stage 4: Loan Disbursement (5 Cs Sanction & Counter Disbursal)</span>
                    </h2>
                    <p className="text-xs text-blue-200/90 mt-0.5">
                      Character, Capacity, Capital, Collateral, and Condition must all be strictly MET for facility sanction.
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                    fiveCs.overallPassed
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-blue-950 text-blue-300 border border-blue-700'
                  }`}>
                    {fiveCs.overallPassed ? 'ALL 5 Cs SATISFIED' : 'DEFICIENT CRITERIA'}
                  </span>
                </div>
              </div>

              {/* The 5 Cs Interactive Evaluation Dashboard */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                
                {/* 1. Character */}
                <div className={`p-4 rounded-xl border ${
                  fiveCs.character.status === 'MET' ? 'bg-[#071529] border-blue-600' : 'bg-[#07111E] border-blue-900'
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                      <span>1. Character</span>
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      fiveCs.character.status === 'MET' ? 'bg-blue-600 text-white' : 'bg-blue-950 text-blue-300 border border-blue-800'
                    }`}>
                      {fiveCs.character.status} ({fiveCs.character.score}/100)
                    </span>
                  </div>
                  <div className="text-[11px] text-blue-100 font-medium mt-1">
                    Bureau Score: <strong>{bureauScore}/850</strong>
                  </div>
                  <div className="text-[10px] text-blue-200/80 mt-1">
                    {fiveCs.character.notes}
                  </div>
                </div>

                {/* 2. Capacity */}
                <div className={`p-4 rounded-xl border ${
                  fiveCs.capacity.status === 'MET' ? 'bg-[#071529] border-blue-600' : 'bg-[#07111E] border-blue-900'
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white flex items-center gap-1">
                      <Percent className="w-3.5 h-3.5 text-blue-400" />
                      <span>2. Capacity</span>
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      fiveCs.capacity.status === 'MET' ? 'bg-blue-600 text-white' : 'bg-blue-950 text-blue-300 border border-blue-800'
                    }`}>
                      {fiveCs.capacity.status} ({fiveCs.capacity.score}/100)
                    </span>
                  </div>
                  <div className="text-[11px] text-blue-100 font-medium mt-1">
                    DTI Ratio: <strong>{fiveCs.capacity.dtiRatio}%</strong> (&le; 40% threshold)
                  </div>
                  <div className="text-[10px] text-blue-200/80 mt-1">
                    {fiveCs.capacity.notes}
                  </div>
                </div>

                {/* 3. Capital */}
                <div className={`p-4 rounded-xl border ${
                  fiveCs.capital.status === 'MET' ? 'bg-[#071529] border-blue-600' : 'bg-[#07111E] border-blue-900'
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5 text-blue-400" />
                      <span>3. Capital</span>
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      fiveCs.capital.status === 'MET' ? 'bg-blue-600 text-white' : 'bg-blue-950 text-blue-300 border border-blue-800'
                    }`}>
                      {fiveCs.capital.status} ({fiveCs.capital.score}/100)
                    </span>
                  </div>
                  <div className="text-[11px] text-blue-100 font-medium mt-1">
                    Stock in Shop: <strong>{stockCoverageRatio}%</strong> (&ge; 30% rule)
                  </div>
                  <div className="text-[10px] text-blue-200/80 mt-1">
                    {fiveCs.capital.notes}
                  </div>
                </div>

                {/* 4. Collateral */}
                <div className={`p-4 rounded-xl border ${
                  fiveCs.collateral.status === 'MET' ? 'bg-[#071529] border-blue-600' : 'bg-[#07111E] border-blue-900'
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                      <span>4. Collateral</span>
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      fiveCs.collateral.status === 'MET' ? 'bg-blue-600 text-white' : 'bg-blue-950 text-blue-300 border border-blue-800'
                    }`}>
                      {fiveCs.collateral.status} ({fiveCs.collateral.score}/100)
                    </span>
                  </div>
                  <div className="text-[11px] text-blue-100 font-medium mt-1">
                    Collateral Coverage: <strong>{collateralCoverageRatio}%</strong> (&ge; 150% rule)
                  </div>
                  <div className="text-[10px] text-blue-200/80 mt-1">
                    {fiveCs.collateral.notes}
                  </div>
                </div>

                {/* 5. Condition */}
                <div className={`p-4 rounded-xl border sm:col-span-2 lg:col-span-2 ${
                  fiveCs.condition.status === 'MET' ? 'bg-[#071529] border-blue-600' : 'bg-[#07111E] border-blue-900'
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white flex items-center gap-1">
                      <Store className="w-3.5 h-3.5 text-blue-400" />
                      <span>5. Condition (Vintage, Marital Status & Shop Ownership)</span>
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      fiveCs.condition.status === 'MET' ? 'bg-blue-600 text-white' : 'bg-blue-950 text-blue-300 border border-blue-800'
                    }`}>
                      {fiveCs.condition.status} ({fiveCs.condition.score}/100)
                    </span>
                  </div>
                  <div className="text-[11px] text-blue-100 font-medium mt-1">
                    Operating: {businessVintageYears} yrs • Marital: {maritalStatus} • Shop: {shopOwnership} ({shopOwnership === 'OWNED' ? 'Ownership Invoice Verified' : 'Rent Receipt Verified'})
                  </div>
                  <div className="text-[10px] text-blue-200/80 mt-1">
                    {fiveCs.condition.notes}
                  </div>
                </div>

              </div>

              {/* Disbursal Settlement Method */}
              <div className="bg-[#071529] border border-blue-900 rounded-xl p-4 space-y-3">
                <label className="block text-xs font-bold text-white">
                  Select Walk-In Disbursal Settlement Method
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  <button
                    type="button"
                    onClick={() => setDisbursalMode('VAULT_CASH_VOUCHER')}
                    className={`p-4 rounded-xl text-left border transition-all ${
                      disbursalMode === 'VAULT_CASH_VOUCHER'
                        ? 'bg-blue-600 text-white border-blue-300 shadow-md shadow-blue-600/30'
                        : 'bg-[#0B1E36] border-blue-900 text-blue-100 hover:border-blue-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2 font-bold text-xs">
                      <Banknote className="w-4 h-4" />
                      <span>Branch Vault Cashier Payout Voucher</span>
                    </div>
                    <p className={`text-[11px] mt-1.5 ${disbursalMode === 'VAULT_CASH_VOUCHER' ? 'text-blue-100' : 'text-blue-300/80'}`}>
                      Print counter cash withdrawal voucher. Customer walks over to Teller Cash Counter #1 with voucher and collects cash immediately from branch vault float.
                    </p>
                    <div className={`text-[10px] font-mono mt-2 font-semibold ${disbursalMode === 'VAULT_CASH_VOUCHER' ? 'text-white' : 'text-blue-400'}`}>
                      GL-101010-BRANCH-VAULT (Cr)
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDisbursalMode('NUBAN_TRANSFER')}
                    className={`p-4 rounded-xl text-left border transition-all ${
                      disbursalMode === 'NUBAN_TRANSFER'
                        ? 'bg-blue-600 text-white border-blue-300 shadow-md shadow-blue-600/30'
                        : 'bg-[#0B1E36] border-blue-900 text-blue-100 hover:border-blue-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2 font-bold text-xs">
                      <CreditCard className="w-4 h-4" />
                      <span>Instant NUBAN Account Credit</span>
                    </div>
                    <p className={`text-[11px] mt-1.5 ${disbursalMode === 'NUBAN_TRANSFER' ? 'text-blue-100' : 'text-blue-300/80'}`}>
                      Direct instantaneous credit to customer’s Microbiz MFB or commercial bank NUBAN via Temenos T24 NIP switch.
                    </p>
                    <div className={`text-[10px] font-mono mt-2 font-semibold ${disbursalMode === 'NUBAN_TRANSFER' ? 'text-white' : 'text-blue-400'}`}>
                      GL-200100-CUSTOMER-CURRENT (Cr)
                    </div>
                  </button>

                </div>
              </div>

              {/* Sanction Trigger Button */}
              <div className="pt-2 border-t border-blue-900 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-4 py-2 border border-blue-800 text-blue-200 hover:text-white rounded-xl text-xs font-semibold"
                >
                  Back
                </button>

                <button
                  type="button"
                  onClick={handleProcessWalkInLoan}
                  disabled={isProcessing}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-600/40 flex items-center space-x-2 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <RotateCcw className="w-4 h-4 animate-spin" />
                      <span>Posting CBS & Generating Passbook...</span>
                    </>
                  ) : (
                    <>
                      <BadgeCheck className="w-4 h-4" />
                      <span>Sanction & Execute Counter Disbursal ({formatCurrency(amount)})</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Right 1 Column: Walk-In Summary & Printable Official Counter Sanction Voucher */}
        <div className="space-y-6">
          
          {/* Real-time Customer Summary Card */}
          <div className="bg-[#0B1E36] border border-blue-900 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="border-b border-blue-900 pb-3">
              <span className="text-[11px] font-bold text-blue-300 uppercase tracking-wider">
                Walk-In Customer Profile
              </span>
              <div className="text-base font-bold text-white mt-1">
                {customerName}
              </div>
              <div className="text-xs text-blue-200/90">{businessName}</div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-blue-900/60">
                <span className="text-blue-300">Ticket Number:</span>
                <span className="font-mono font-bold text-white">{activeTicket.ticketNo}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-blue-900/60">
                <span className="text-blue-300">Phone:</span>
                <span className="font-mono text-white">{phone}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-blue-900/60">
                <span className="text-blue-300">Market Cluster:</span>
                <span className="text-white">{marketCluster}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-blue-900/60">
                <span className="text-blue-300">Business Vintage:</span>
                <span className="text-white font-semibold">{businessVintageYears} Years</span>
              </div>
              <div className="flex justify-between py-1 border-b border-blue-900/60">
                <span className="text-blue-300">Marital Status:</span>
                <span className="text-white font-semibold">{maritalStatus}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-blue-900/60">
                <span className="text-blue-300">Shop Premises:</span>
                <span className="text-white font-semibold">
                  {shopOwnership === 'OWNED' ? 'Owned (Invoice)' : 'Rented (Receipt)'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-blue-900/60">
                <span className="text-blue-300">Collateral Coverage:</span>
                <span className={`font-mono font-bold ${isCollateralSufficient ? 'text-white' : 'text-blue-300'}`}>
                  {collateralCoverageRatio}% (&ge; 150%)
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-blue-900/60">
                <span className="text-blue-300">Stock in Shop Ratio:</span>
                <span className={`font-mono font-bold ${isStockSufficient ? 'text-white' : 'text-blue-300'}`}>
                  {stockCoverageRatio}% (&ge; 30%)
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-blue-300">Facility Requested:</span>
                <span className="text-white font-extrabold">{formatCurrency(amount)}</span>
              </div>
            </div>

            <div className="bg-[#071529] rounded-xl p-3 border border-blue-900 text-xs">
              <div className="text-[10px] text-blue-300 uppercase font-bold">Regulatory & Central Bank Policy</div>
              <p className="text-[11px] text-blue-200 mt-1 leading-relaxed">
                Central Bank of Nigeria (CBN) Prudential Guidelines compliant. Maximum tenure: 6 months. SME loan interest: 5% monthly.
              </p>
            </div>
          </div>

          {/* Official Counter Sanction Voucher (Strict Blue and White Theme) */}
          {sanctionedLoan && (
            <div className="bg-white text-slate-900 rounded-2xl p-5 shadow-2xl border-2 border-blue-600 space-y-4 animate-in fade-in duration-300">
              <div className="text-center border-b border-blue-100 pb-3">
                <div className="text-xs font-extrabold uppercase tracking-wider text-blue-900">
                  Microbiz Microfinance Bank Ltd
                </div>
                <div className="text-[10px] text-blue-700 font-medium">
                  Central Bank of Nigeria (CBN) Licensed • NDIC Insured
                </div>
                <div className="text-sm font-black text-blue-900 mt-1">
                  OFFICIAL COUNTER SANCTION VOUCHER
                </div>
                <div className="text-[10px] font-mono text-slate-600">
                  Ref: {sanctionedLoan.cbsReference} • {sanctionedLoan.id}
                </div>
                <div className="text-[10px] font-mono text-blue-800 font-bold mt-0.5">
                  Platform: {MICROBIZ_CHANNELS[sanctionedLoan.channel || 'MICROBIZ_MFB'].name} | Tracing: {sanctionedLoan.channelTracingRef}
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-600 font-medium">Beneficiary:</span>
                  <span className="font-bold text-blue-950">{sanctionedLoan.applicantName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 font-medium">Enterprise:</span>
                  <span className="font-semibold">{sanctionedLoan.businessName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 font-medium">Registering Officer:</span>
                  <span className="font-bold text-blue-900 font-mono">
                    {sanctionedLoan.officerRegistrationNumber || 'REG/MFB/CO-3392'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 font-medium">Sanctioned Amount:</span>
                  <span className="font-mono font-black text-blue-800">
                    {formatCurrency(sanctionedLoan.amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 font-medium">Monthly Installment (5%):</span>
                  <span className="font-mono font-bold text-blue-900">
                    {formatCurrency(repayment.monthlyPayment)} / mo
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 font-medium">Tenure:</span>
                  <span className="font-bold">{sanctionedLoan.tenureMonths} Months (Max 6 Mos)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 font-medium">Collateral Coverage:</span>
                  <span className="font-bold text-blue-900">{collateralCoverageRatio}% (Passed &ge; 150%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 font-medium">Stock in Shop:</span>
                  <span className="font-bold text-blue-900">{stockCoverageRatio}% (Passed &ge; 30%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 font-medium">Disbursal Type:</span>
                  <span className="font-bold text-blue-900">
                    {disbursalMode === 'VAULT_CASH_VOUCHER' ? 'Branch Cashier Vault Payout' : 'Instant NUBAN Credit'}
                  </span>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-[11px] text-blue-950 font-mono">
                <div className="font-bold">CBS Double-Entry Verification:</div>
                <div>Dr: GL-104020-LOANS-RETAIL ({formatCurrency(sanctionedLoan.amount)})</div>
                <div>Cr: {disbursalMode === 'VAULT_CASH_VOUCHER' ? 'GL-101010-BRANCH-VAULT' : 'GL-200100-CUSTOMER-CURRENT'}</div>
                <div className="mt-1 text-[10px] text-blue-800 truncate">
                  5 Cs Audit: Character (OK), Capacity (OK), Capital (OK), Collateral (OK), Condition (OK)
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => window.print()}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-blue-600/30"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Customer Counter Sanction & Voucher</span>
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
