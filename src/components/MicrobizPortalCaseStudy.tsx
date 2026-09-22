import React, { useState } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Smartphone, 
  Users, 
  Store, 
  Home, 
  TrendingUp, 
  PiggyBank, 
  CreditCard, 
  PhoneCall, 
  BadgeCheck, 
  Lock, 
  ChevronRight, 
  Layers, 
  Database, 
  Cpu, 
  Clock, 
  Award, 
  Coins, 
  HelpCircle, 
  FileText,
  Calculator,
  ChevronDown,
  ChevronUp,
  MapPin,
  ExternalLink,
  Zap,
  Check
} from 'lucide-react';
import { formatCurrency } from '../utils/crypto';

interface MicrobizPortalCaseStudyProps {
  onLaunchOfficerCockpit: () => void;
  onLaunchBorrowerApp: () => void;
  onSelectProductForApplication?: (productType: string) => void;
}

export const MicrobizPortalCaseStudy: React.FC<MicrobizPortalCaseStudyProps> = ({
  onLaunchOfficerCockpit,
  onLaunchBorrowerApp,
  onSelectProductForApplication
}) => {
  // Mode: 'portal' (Live Web Case Study) | 'teardown' (UI/UX Case Study Analysis)
  const [activeTab, setActiveTab] = useState<'portal' | 'teardown'>('portal');

  // Interactive Product Selector for the Calculator
  const [selectedProduct, setSelectedProduct] = useState<'sabi' | 'betta' | 'mini' | 'mortgage' | 'masta'>('sabi');
  const [calcAmount, setCalcAmount] = useState<number>(750000);
  const [calcTenure, setCalcTenure] = useState<number>(6);

  // USSD Simulator State
  const [showUssdModal, setShowUssdModal] = useState<boolean>(false);
  const [ussdInput, setUssdInput] = useState<string>('*5092#');
  const [ussdScreen, setUssdScreen] = useState<'dialer' | 'menu' | 'loan_offer' | 'balance' | 'masta_status'>('dialer');
  const [ussdSelection, setUssdSelection] = useState<string>('');

  // FAQ accordion state
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  // Product configurations strictly aligned with Microbiz Credit Underwriting Policy
  const productConfig = {
    sabi: {
      name: 'SabiTrader Walk-in Facility',
      category: 'Market Traders & Micro-Retailers',
      headline: 'Working Capital for Walk-in Market Merchants',
      badge: 'Walk-In Desk Fastlane',
      desc: 'In-branch walk-in facility for retail stall owners and FMCG merchants with physical shop verification and inventory inspection.',
      minAmount: 100000,
      maxAmount: 10000000,
      step: 100000,
      minTenure: 1,
      maxTenure: 6, // maximum loan tenure is 6 months
      interestRate: 5.0, // interest on loans for SMEs is 5%
      accentColor: 'text-blue-400',
      borderColor: 'border-blue-500',
      bgColor: 'bg-blue-950/30',
      requirements: [
        'NIN slip & Borrower passport photograph',
        '6 months bank statements (turnover proof)',
        '2 guarantors forms with passport photographs',
        'Proof of address (utility bill within 3 mos)',
        'CAC certificate & Tax Identification Number',
        'Collateral documents (worth >= 150% of loan)',
        'Signed post-dated cheques',
        'Shop ownership: Invoice if owned, rent receipt if rented',
        'Stock in shop worth >= 30% of loan requested',
        '5 Cs of credit (Character, Capacity, Capital, Collateral, Condition)'
      ]
    },
    betta: {
      name: 'Bettabiz SME Commercial Loan',
      category: 'Growing Enterprises & Mid-Sized Businesses',
      headline: 'Prime Working Capital for Commercial Enterprises',
      badge: 'Up to ₦100,000,000 (100M Cap)',
      desc: 'Walk-in SME facility for registered commercial merchants, contractors, and distributors. Enforces 5% monthly interest with up to 6 months tenure.',
      minAmount: 1000000,
      maxAmount: 100000000, // up to 100 million
      step: 1000000,
      minTenure: 1,
      maxTenure: 6, // maximum loan tenure is 6 months
      interestRate: 5.0, // interest on loans for SMEs is 5%
      accentColor: 'text-blue-300',
      borderColor: 'border-blue-400',
      bgColor: 'bg-blue-950/30',
      requirements: [
        'NIN slip & Director passport photograph',
        '6 months certified bank statements',
        '2 guarantors forms with passport photographs',
        'Proof of address & office verification',
        'CAC certificate of incorporation & TIN',
        'Collateral documents (worth >= 150% of loan requested)',
        'Signed post-dated commercial cheques',
        'Shop/office invoice for ownership or rent receipt',
        'Stock in shop worth >= 30% of loan requested',
        '5 Cs of credit validation strictly certified'
      ]
    },
    mini: {
      name: 'Minimonie Trader Facility',
      category: 'Market Women & Trade Clusters',
      headline: 'Structured Trade Capital for Verified Walk-in Merchants',
      badge: 'Up to ₦5,000,000',
      desc: 'Branch walk-in micro-merchant facility with peer guarantor verification, 6-month turnover assessment, and inventory evaluation.',
      minAmount: 100000,
      maxAmount: 5000000,
      step: 100000,
      minTenure: 1,
      maxTenure: 6, // maximum loan tenure is 6 months
      interestRate: 5.0, // interest is 5%
      accentColor: 'text-blue-200',
      borderColor: 'border-blue-600',
      bgColor: 'bg-blue-950/30',
      requirements: [
        'NIN slip & passport photograph',
        '6 months bank statements',
        '2 guarantors forms with passport photographs',
        'Proof of address',
        'CAC certificate & TIN (if registered)',
        'Collateral documents (worth >= 150% of loan)',
        'Signed post-dated cheques',
        'Stock in shop worth >= 30% of loan',
        'Shop ownership invoice or rent receipt'
      ]
    },
    mortgage: {
      name: 'Property-Backed SME Facility',
      category: 'Asset-Backed Corporate Lending',
      headline: 'Commercial Capital Backed by Legal Mortgage & Stock',
      badge: 'Up to ₦100,000,000',
      desc: 'Secured credit for walk-in business clients with verified title deeds, governor consent, or landed collateral worth >= 150% of facility requested.',
      minAmount: 5000000,
      maxAmount: 100000000, // up to 100 million
      step: 5000000,
      minTenure: 1,
      maxTenure: 6, // maximum loan tenure is 6 months
      interestRate: 5.0, // 5% SME interest
      accentColor: 'text-blue-400',
      borderColor: 'border-blue-500',
      bgColor: 'bg-blue-950/30',
      requirements: [
        'Registered Title Deed / C of O / Governor Consent (>= 150% loan value)',
        'NIN slip & 2 passport photographs',
        '6 months certified bank statements',
        '2 guarantors forms with passport photographs',
        'CAC certificate & Tax Identification Number',
        'Stock in shop worth >= 30% of loan',
        'Shop premises: Ownership invoice or rent receipt',
        'Post-dated cheques for all 6 installments'
      ]
    },
    masta: {
      name: 'MASTA Enterprise Reserve',
      category: 'Corporate Liquidity & Cash Reserves',
      headline: 'Automated High-Yield Reserve with Up to 14.5% p.a.',
      badge: 'Walk-In Liquidity Reserve',
      desc: 'Save and accumulate capital for business expansions, equipment purchases, and tax settlements with instant branch liquidity access.',
      minAmount: 50000,
      maxAmount: 100000000,
      step: 50000,
      minTenure: 1,
      maxTenure: 6,
      interestRate: 1.2, // yield
      accentColor: 'text-blue-300',
      borderColor: 'border-blue-400',
      bgColor: 'bg-blue-950/30',
      requirements: [
        'Branch walk-in opening with valid NIN slip',
        'Proof of address',
        'Passport photograph',
        'Zero withdrawal fee on maturity',
        'NDIC insurance coverage'
      ]
    }
  };

  const currentProd = productConfig[selectedProduct];

  // Calculate monthly repayment or yield
  const isSavings = selectedProduct === 'masta';
  const monthlyRateDecimal = currentProd.interestRate / 100;
  const monthlyRepayment = Math.round(
    (calcAmount * (monthlyRateDecimal * Math.pow(1 + monthlyRateDecimal, calcTenure))) / 
    (Math.pow(1 + monthlyRateDecimal, calcTenure) - 1)
  );
  const totalRepayment = monthlyRepayment * calcTenure;
  const totalInterest = totalRepayment - calcAmount;

  const estimatedMastaYield = Math.round(calcAmount * (1 + (0.145 * (calcTenure / 12))));

  // Handle USSD simulation
  const handleUssdDial = () => {
    if (ussdInput.trim() === '*5092#') {
      setUssdScreen('menu');
    } else {
      alert('Invalid USSD shortcode. Please dial *5092# for Microbiz MFB.');
    }
  };

  const handleUssdSelect = (choice: string) => {
    setUssdSelection(choice);
    if (choice === '1') setUssdScreen('loan_offer');
    else if (choice === '2') setUssdScreen('balance');
    else if (choice === '3') setUssdScreen('masta_status');
    else setUssdScreen('menu');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* CASE STUDY NAVIGATION & PERSPECTIVE SWITCHER */}
      <div className="bg-[#0B1E36] border border-[#1E3A5F] rounded-2xl p-4 shadow-xl backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-950 text-blue-300 border border-blue-700">
              Live Walk-In Customer Portal
            </span>
            <span className="text-xs text-slate-400 font-mono">microbizmfb.com</span>
          </div>
          <h2 className="text-lg font-extrabold text-white mt-1">
            Microbiz Microfinance Bank — Digital Transformation Showcase
          </h2>
          <p className="text-xs text-slate-400">
            Examining the real-world UI/UX, product portfolio, and automated credit architecture of Nigeria&apos;s leading inclusion MFB.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 bg-[#091527] p-1.5 rounded-xl border border-[#1E3A5F] w-full md:w-auto">
          <button
            id="casestudy-tab-portal"
            onClick={() => setActiveTab('portal')}
            className={`flex-1 md:flex-initial flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'portal'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Interactive Web Portal</span>
          </button>

          <button
            id="casestudy-tab-teardown"
            onClick={() => setActiveTab('teardown')}
            className={`flex-1 md:flex-initial flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'teardown'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4 text-blue-300" />
            <span>UI/UX Architecture Tear-down</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: INTERACTIVE WEB PORTAL SHOWCASE (microbizmfb.com Re-imagined)      */}
      {/* ========================================================================= */}
      {activeTab === 'portal' && (
        <div className="space-y-8">
          
          {/* Official Bank Top Banner (Regulatory & Compliance) */}
          <div className="bg-blue-950/70 border border-blue-800/60 rounded-xl px-4 py-2 flex flex-wrap items-center justify-between text-[11px] text-blue-200/90 gap-2">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-blue-400 flex-shrink-0" />
              <span>
                <strong>Licensed by the Central Bank of Nigeria (CBN)</strong> • All deposits insured by the <strong>NDIC</strong>
              </span>
            </div>
            <div className="flex items-center space-x-4 text-xs">
              <span className="flex items-center gap-1">
                <PhoneCall className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-slate-300 font-mono">+234 908 777 5092</span>
              </span>
              <button
                onClick={() => setShowUssdModal(true)}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-800/80 hover:bg-blue-700 text-white font-mono font-bold text-[10px] transition-colors"
              >
                <Smartphone className="w-3 h-3 text-blue-200" />
                <span>Dial *5092#</span>
              </button>
            </div>
          </div>

          {/* Hero Section */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#091527] via-[#0B1E36] to-blue-950/60 border border-[#1E3A5F] p-6 md:p-10 shadow-2xl">
            {/* Background Ambient Glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

            <div className="relative z-10 max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-500/30 text-blue-300 text-xs font-medium">
                <BadgeCheck className="w-4 h-4 text-blue-400" />
                <span>Branch Walk-In Customer Portal • microbizmfb.com</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Driving Financial Inclusion to the <span className="text-blue-400">Last Mile</span> in Nigeria
              </h1>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                Microbiz Microfinance Bank delivers instant working capital loans, paperless micro-mortgages, and high-yield target savings to Nigerian traders, cooperatives, and growing MSMEs via physical branch walk-ins.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  id="portal-hero-apply-btn"
                  onClick={onLaunchBorrowerApp}
                  className="flex items-center space-x-2 px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-lg shadow-blue-600/30 hover:scale-[1.02]"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Walk-In Customer Loan Desk</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  id="portal-hero-officer-btn"
                  onClick={onLaunchOfficerCockpit}
                  className="flex items-center space-x-2 px-5 py-3 bg-[#091527] hover:bg-[#0F2440] border border-[#1E3A5F] text-slate-200 rounded-xl text-xs sm:text-sm font-semibold transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                  <span>Open Underwriting Cockpit</span>
                </button>

                <button
                  onClick={() => setShowUssdModal(true)}
                  className="flex items-center space-x-1.5 px-4 py-3 bg-[#091527] hover:bg-[#0F2440] border border-blue-700/60 text-blue-300 rounded-xl text-xs sm:text-sm font-mono transition-colors"
                >
                  <Smartphone className="w-4 h-4 text-blue-300" />
                  <span>Test USSD *5092#</span>
                </button>
              </div>

              {/* Trust & Volume Statistics */}
              <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-800/80 text-xs">
                <div>
                  <div className="text-lg sm:text-xl font-black text-white">₦18.4 Billion+</div>
                  <div className="text-slate-400 text-[11px]">Disbursed to MSMEs</div>
                </div>
                <div>
                  <div className="text-lg sm:text-xl font-black text-blue-400">152,000+</div>
                  <div className="text-slate-400 text-[11px]">Empowered Traders</div>
                </div>
                <div>
                  <div className="text-lg sm:text-xl font-black text-white">4.2 Minutes</div>
                  <div className="text-slate-400 text-[11px]">Average Approval TAT</div>
                </div>
                <div>
                  <div className="text-lg sm:text-xl font-black text-blue-400">98.4%</div>
                  <div className="text-slate-400 text-[11px]">Repayment Performance</div>
                </div>
              </div>
            </div>
          </div>

          {/* INTERACTIVE PRODUCT SUITE & LOAN CALCULATOR */}
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-2">
              <div>
                <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                  Microbiz Signature Facilities
                </span>
                <h3 className="text-xl font-bold text-white mt-0.5">
                  Choose a Financing or Wealth Product
                </h3>
              </div>
              <p className="text-xs text-slate-400 max-w-md">
                Directly digitized from microbizmfb.com products: SabiTrader, Bettabiz, Minimonie, Micro-Mortgage, and MASTA savings.
              </p>
            </div>

            {/* Product Selector Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {(['sabi', 'betta', 'mini', 'mortgage', 'masta'] as const).map((key) => {
                const item = productConfig[key];
                const isSelected = selectedProduct === key;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      setSelectedProduct(key);
                      setCalcAmount(item.minAmount + (item.maxAmount - item.minAmount) * 0.2);
                      setCalcTenure(item.minTenure);
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition-all relative ${
                      isSelected
                        ? 'bg-[#091527] border-blue-500 ring-2 ring-blue-500/20 shadow-lg'
                        : 'bg-[#0B1E36]/60 border-[#1E3A5F] hover:border-blue-400 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={`p-2 rounded-xl bg-slate-900 border border-slate-800 ${item.accentColor}`}>
                        {key === 'sabi' && <Store className="w-4 h-4" />}
                        {key === 'betta' && <Building2 className="w-4 h-4" />}
                        {key === 'mini' && <Users className="w-4 h-4" />}
                        {key === 'mortgage' && <Home className="w-4 h-4" />}
                        {key === 'masta' && <PiggyBank className="w-4 h-4" />}
                      </div>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                      )}
                    </div>
                    <div className="font-bold text-white text-xs leading-snug">{item.name}</div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">{item.category}</div>
                  </button>
                );
              })}
            </div>

            {/* PRODUCT SPOTLIGHT & LIVE SIMULATION CALCULATOR */}
            <div className="bg-[#0B1E36] border border-[#1E3A5F] rounded-3xl p-6 md:p-8 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column: Product Dossier */}
              <div className="lg:col-span-6 space-y-4">
                <div className="flex items-center space-x-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-800 ${currentProd.accentColor}`}>
                    {currentProd.badge}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">Interest {currentProd.interestRate}%/mo</span>
                </div>

                <h3 className="text-xl font-black text-white">
                  {currentProd.headline}
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {currentProd.desc}
                </p>

                {/* Requirements Checklist */}
                <div className="space-y-2 pt-2">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Origination Requirements (Walk-In Verification)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {currentProd.requirements.map((req, idx) => (
                      <div key={idx} className="flex items-start space-x-2 p-2 rounded-xl bg-[#091527] border border-[#1E3A5F]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-300 text-[11px]">{req}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Trigger */}
                <div className="pt-3">
                  <button
                    onClick={onLaunchBorrowerApp}
                    className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-lg shadow-blue-600/20"
                  >
                    <span>Register Walk-In for {currentProd.name}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Right Column: Live Repayment / Yield Calculator */}
              <div className="lg:col-span-6 bg-[#091527] p-6 rounded-2xl border border-[#1E3A5F] flex flex-col justify-between space-y-6">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-[#1E3A5F]">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Calculator className="w-4 h-4 text-blue-400" />
                      <span>{isSavings ? 'Target Savings Projection' : 'Facility Repayment Calculator'}</span>
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">NIBSS Auto-Debit</span>
                  </div>

                  {/* Amount Slider */}
                  <div className="space-y-2 mt-4">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">{isSavings ? 'Target Principal:' : 'Loan Principal:'}</span>
                      <strong className="text-base text-blue-400 font-extrabold">
                        {formatCurrency(calcAmount)}
                      </strong>
                    </div>
                    <input
                      type="range"
                      min={currentProd.minAmount}
                      max={currentProd.maxAmount}
                      step={currentProd.step}
                      value={calcAmount}
                      onChange={(e) => setCalcAmount(Number(e.target.value))}
                      className="w-full accent-blue-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>{formatCurrency(currentProd.minAmount)}</span>
                      <span>{formatCurrency(currentProd.maxAmount)}</span>
                    </div>
                  </div>

                  {/* Tenure Slider */}
                  <div className="space-y-2 mt-5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">{isSavings ? 'Savings Duration:' : 'Tenure Period:'}</span>
                      <strong className="text-white text-xs font-bold">{calcTenure} Months</strong>
                    </div>
                    <input
                      type="range"
                      min={currentProd.minTenure}
                      max={currentProd.maxTenure}
                      step={1}
                      value={calcTenure}
                      onChange={(e) => setCalcTenure(Number(e.target.value))}
                      className="w-full accent-blue-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>{currentProd.minTenure} Months</span>
                      <span>{currentProd.maxTenure} Months</span>
                    </div>
                  </div>
                </div>

                {/* Calculation Output Box */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-slate-400">
                      {isSavings ? 'Maturity Target Value:' : 'Estimated Monthly Deduction:'}
                    </span>
                    <span className="text-xl font-black text-blue-400">
                      {isSavings ? formatCurrency(estimatedMastaYield) : formatCurrency(monthlyRepayment)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
                    <div>
                      <span className="text-slate-500">{isSavings ? 'Interest Yield:' : 'Total Interest:'}</span>
                      <div className="font-semibold text-slate-200">
                        {isSavings ? '+14.5% p.a.' : formatCurrency(totalInterest)}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-500">{isSavings ? 'Lock Status:' : 'Total Outflow:'}</span>
                      <div className="font-semibold text-slate-200">
                        {isSavings ? 'Compounded Monthly' : formatCurrency(totalRepayment)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 text-center">
                  Rates comply with Central Bank of Nigeria (CBN) prudential guidelines.
                </div>

              </div>

            </div>
          </div>

          {/* LAST-MILE CHANNEL MATRIX: HOW MICROBIZ REACHES UNBANKED TRADERS */}
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-2">
              <div>
                <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                  Omnichannel Access Engine
                </span>
                <h3 className="text-xl font-bold text-white mt-0.5">
                  Reaching Every Market Stall in Nigeria
                </h3>
              </div>
              <p className="text-xs text-slate-400 max-w-md">
                Combining high-tech biometric branch walk-in onboarding with offline USSD *5092# and local market agency banking.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Channel 1: Walk-In Branch Intake Desk */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-950 border border-blue-700 flex items-center justify-center text-blue-400">
                  <Store className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-white text-sm">Walk-In Branch Intake Desk</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  WebAuthn facial capture, BVN/NIN biometric verification, digital signature capture, and instant statement verification at branch counters.
                </p>
                <div className="pt-1">
                  <button
                    onClick={onLaunchBorrowerApp}
                    className="text-blue-400 hover:text-blue-300 font-semibold text-xs inline-flex items-center gap-1"
                  >
                    <span>Launch Walk-In Intake Desk</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Channel 2: USSD Banking (*5092#) */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-950 border border-blue-700 flex items-center justify-center text-blue-300">
                  <Zap className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-white text-sm">USSD Quick Banking (*5092#)</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Zero-data offline banking accessible on any basic feature phone. Disburse emergency SabiTrader loans and balance inquiries in seconds.
                </p>
                <div className="pt-1">
                  <button
                    onClick={() => setShowUssdModal(true)}
                    className="text-blue-300 hover:text-blue-200 font-semibold text-xs inline-flex items-center gap-1"
                  >
                    <span>Test *5092# Dialpad</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Channel 3: Market Agency Terminals */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-950 border border-blue-800 flex items-center justify-center text-blue-400">
                  <Store className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-white text-sm">Market Agency Network</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Microbiz POS agents stationed across New Mpape Modern Market (Abuja), Balogun (Lagos), and major commercial trading clusters.
                </p>
                <div className="pt-1 text-xs text-slate-500">
                  Over 1,200 active cash-in/cash-out agents
                </div>
              </div>

            </div>
          </div>

          {/* REAL-WORLD CASE STUDIES: NIGERIAN ENTREPRENEURS */}
          <div className="p-6 md:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                  Field Testimonials & Case Evidence
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  Real Impact Across Nigerian Commercial Markets
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-blue-900 text-blue-300 font-bold flex items-center justify-center text-xs">
                    IN
                  </div>
                  <div>
                    <div className="font-bold text-white">Mrs. Ifeoma Nnamdi</div>
                    <div className="text-[10px] text-slate-400">Provisions Trader • Balogun Market, Lagos</div>
                  </div>
                </div>
                <p className="text-slate-300 italic text-[11px] leading-relaxed">
                  &quot;Before Microbiz, obtaining loan from commercial banks took 3 weeks of paperwork. With SabiTrader on *5092#, I received ₦750,000 within 5 minutes directly into my account.&quot;
                </p>
                <div className="pt-1 text-[10px] text-blue-400 font-medium">
                  Facility: SabiTrader ₦750,000 (Repaid in full)
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-blue-950 text-blue-300 font-bold flex items-center justify-center text-xs">
                    UD
                  </div>
                  <div>
                    <div className="font-bold text-white">Alhaji Usman Danladi</div>
                    <div className="text-[10px] text-slate-400">Hardware & Construction • Maitama Ext, Abuja</div>
                  </div>
                </div>
                <p className="text-slate-300 italic text-[11px] leading-relaxed">
                  &quot;The Bettabiz SME facility allowed us to acquire bulk cement directly from Dangote factory before the price hike. The digital approval was seamless.&quot;
                </p>
                <div className="pt-1 text-[10px] text-blue-300 font-medium">
                  Facility: Bettabiz SME ₦8,500,000 (Active)
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-blue-900 text-blue-200 font-bold flex items-center justify-center text-xs">
                    AA
                  </div>
                  <div>
                    <div className="font-bold text-white">Aisha Aliyu</div>
                    <div className="text-[10px] text-slate-400">Leader • New Mpape Market Women Co-op #4</div>
                  </div>
                </div>
                <p className="text-slate-300 italic text-[11px] leading-relaxed">
                  &quot;Minimonie group loan enabled 12 women in our cooperative to restock grains without pledging our family land. The weekly automated deductions keep us on track.&quot;
                </p>
                <div className="pt-1 text-[10px] text-blue-300 font-medium">
                  Facility: Minimonie Group ₦1,800,000 (100% On-time)
                </div>
              </div>

            </div>
          </div>

          {/* FREQUENTLY ASKED QUESTIONS ACCORDION */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-white">Frequently Asked Questions</h3>
            <div className="space-y-2">
              {[
                {
                  q: 'How fast can I get a loan disbursed after applying?',
                  a: 'For SabiTrader and Minimonie facilities, our automated credit decisioning engine evaluates your BVN, CRC credit bureau record, and bank statement turnover in real time. Approvals occur in under 5 minutes with instant settlement to your bank account via NIBSS.'
                },
                {
                  q: 'Do I need physical asset collateral for a Microbiz loan?',
                  a: 'SabiTrader and Minimonie group loans require zero physical asset collateral. They are secured via business cashflow turnover, credible peer guarantors, and group liability. Bettabiz SME loans and Micro-Mortgages utilize registered commercial assets and property title deeds.'
                },
                {
                  q: 'How does automated loan repayment work?',
                  a: 'During paperless onboarding, you authorize a NIBSS Direct Debit e-Mandate linked to your BVN and primary bank account. Monthly installments are deducted automatically, protecting your credit score from accidental delinquency.'
                },
                {
                  q: 'Is my money and data safe with Microbiz MFB?',
                  a: 'Microbiz Microfinance Bank is fully licensed by the Central Bank of Nigeria (CBN), and all client deposits are legally insured by the Nigeria Deposit Insurance Corporation (NDIC). All contract signatures and loan agreements are cryptographically hashed and anchored on our consortium blockchain.'
                }
              ].map((faq, idx) => (
                <div key={idx} className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                    className="w-full px-4 py-3 text-left flex items-center justify-between text-xs font-semibold text-slate-200 hover:text-white"
                  >
                    <span>{faq.q}</span>
                    {expandedFaq === idx ? (
                      <ChevronUp className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    )}
                  </button>
                  {expandedFaq === idx && (
                    <div className="px-4 pb-3 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60 pt-2">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* OFFICIAL REGULATORY FOOTER (microbizmfb.com Compliance) */}
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                    M
                  </div>
                  <span className="font-bold text-white">Microbiz MFB</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Driving financial and social inclusion through flexible fintech technology and transparent customer service.
                </p>
              </div>

              <div>
                <span className="font-bold text-white text-xs block mb-2">Head Office</span>
                <div className="text-[11px] text-slate-400 space-y-1">
                  <p className="flex items-start gap-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span>Block B, Shop 13, 16, New Mpape Modern Market, Maitama Extension, Abuja, Nigeria</span>
                  </p>
                  <p className="text-slate-500">Regional Branch: Lagos & Kano Commercial Corridors</p>
                </div>
              </div>

              <div>
                <span className="font-bold text-white text-xs block mb-2">Fintech & Products</span>
                <div className="text-[11px] text-slate-400 space-y-1">
                  <div>• SabiTrader Working Capital</div>
                  <div>• Bettabiz SME Expansion</div>
                  <div>• Minimonie Group Lending</div>
                  <div>• MASTA Target Savings</div>
                  <div>• Micro-Mortgage Property Equity</div>
                </div>
              </div>

              <div>
                <span className="font-bold text-white text-xs block mb-2">Regulatory Oversight</span>
                <div className="text-[11px] text-slate-400 space-y-1">
                  <div>• Central Bank of Nigeria (CBN)</div>
                  <div>• NDIC Insured Deposits</div>
                  <div>• CRC & FirstCentral APIs</div>
                  <div>• USSD Code: <strong className="text-blue-400 font-mono">*5092#</strong></div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-900 text-[11px] text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-2">
              <div>© 2026 Microbiz Microfinance Bank Ltd. All rights reserved.</div>
              <div className="flex items-center space-x-3 text-slate-400">
                <span>Privacy Policy</span>
                <span>•</span>
                <span>Whistleblower Policy</span>
                <span>•</span>
                <span>CBN Consumer Protection</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: UI/UX ARCHITECTURE & DESIGN SYSTEM TEARDOWN                         */}
      {/* ========================================================================= */}
      {activeTab === 'teardown' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          
          {/* Executive Summary of the Case Study */}
          <div className="p-6 md:p-8 rounded-3xl bg-[#0B1E36] border border-[#1E3A5F] space-y-4">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-950 text-blue-300 border border-blue-700">
                Design & Technology Case Study
              </span>
              <span className="text-xs text-slate-400">Published September 2026</span>
            </div>

            <h2 className="text-2xl font-black text-white tracking-tight">
              How Microbiz MFB Slashed Loan Turnaround Time from 14 Days to 4.2 Minutes
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
              This case study examines how Microbiz Microfinance Bank re-engineered traditional paper-based micro-lending into a hyper-automated, fraud-resistant digital credit origination suite serving Nigeria&apos;s unbanked and MSME economy.
            </p>
          </div>

          {/* 1. Problem vs Solution Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* The Old Way (Friction Points) */}
            <div className="p-6 rounded-2xl bg-[#091527] border border-[#1E3A5F] space-y-4">
              <div className="flex items-center space-x-2 text-slate-300 font-bold text-sm">
                <Clock className="w-5 h-5 text-blue-400" />
                <span>The Legacy Challenge (Pre-Digitization)</span>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold">•</span>
                  <span><strong>14-day manual underwriting cycles:</strong> Loan officers physically carried paper files between Abuja market branches and credit committees.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold">•</span>
                  <span><strong>High default & identity fraud:</strong> Manual physical checking of paper IDs and forged title documents caused severe portfolio risk.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold">•</span>
                  <span><strong>Market distance & exclusion:</strong> Small traders could not leave their market stalls in Balogun or Mpape to visit physical bank branches during business hours.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold">•</span>
                  <span><strong>Manual cash collection overhead:</strong> Cash collection runs created physical security hazards and 78% higher administrative cost per loan.</span>
                </li>
              </ul>
            </div>

            {/* The New Way (Microbiz Automated Engine) */}
            <div className="p-6 rounded-2xl bg-blue-950/40 border border-blue-800/60 space-y-4">
              <div className="flex items-center space-x-2 text-blue-300 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-blue-400" />
                <span>The Microbiz Engineered Solution</span>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold">•</span>
                  <span><strong>4.2-minute automated approval:</strong> Real-time API calls to CRC Credit Bureau, FirstCentral, and NIMC instantly compute Debt-to-Income and creditworthiness.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold">•</span>
                  <span><strong>Cryptographic tamper-proofing:</strong> Document hashes (SHA-256) and Ed25519 digital signatures are anchored onto a consortium PoA blockchain ledger.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold">•</span>
                  <span><strong>Dual-speed inclusion (Walk-In Desk + USSD):</strong> Modern WebAuthn biometrics at branch counters, coupled with *5092# for basic 2G feature phones.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold">•</span>
                  <span><strong>Automated NIBSS Direct Debit & T24 Core:</strong> Instant disbursement via NIP and automated loan deductions eliminate manual collection overhead.</span>
                </li>
              </ul>
            </div>

          </div>

          {/* 2. System Architecture Flow Diagram */}
          <div className="p-6 md:p-8 rounded-3xl bg-[#0B1E36] border border-[#1E3A5F] space-y-6">
            <div>
              <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                Full-Stack End-to-End Pipeline
              </span>
              <h3 className="text-lg font-bold text-white mt-0.5">
                5-Layer Origination & Settlement Architecture
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {[
                {
                  step: 'Layer 1',
                  title: 'Walk-In Intake',
                  tech: 'Branch Desk / USSD *5092#',
                  desc: 'Biometric capture & BVN intake without paper forms.',
                  icon: Smartphone,
                  color: 'text-blue-400',
                  border: 'border-blue-500/40'
                },
                {
                  step: 'Layer 2',
                  title: 'Bureau Scoring',
                  tech: 'CRC + FirstCentral API',
                  desc: 'Instant risk tiering and DTI calculation.',
                  icon: Cpu,
                  color: 'text-blue-300',
                  border: 'border-blue-400/40'
                },
                {
                  step: 'Layer 3',
                  title: 'Forensic Hashing',
                  tech: 'SHA-256 & OCR',
                  desc: 'Title deeds & statements stamped immutable.',
                  icon: FileText,
                  color: 'text-blue-400',
                  border: 'border-blue-500/40'
                },
                {
                  step: 'Layer 4',
                  title: 'Consortium Ledger',
                  tech: 'PoA Blockchain',
                  desc: 'Proof of Authority decentralized sanction record.',
                  icon: Layers,
                  color: 'text-blue-300',
                  border: 'border-blue-400/40'
                },
                {
                  step: 'Layer 5',
                  title: 'Core Disbursal',
                  tech: 'Temenos T24 + NIBSS',
                  desc: 'GL entry + direct account transfer in 10 secs.',
                  icon: Database,
                  color: 'text-blue-200',
                  border: 'border-blue-300/40'
                }
              ].map((layer, idx) => {
                const IconComponent = layer.icon;
                return (
                  <div key={idx} className={`p-4 rounded-2xl bg-[#091527] border ${layer.border} space-y-2 flex flex-col justify-between`}>
                    <div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                        <span>{layer.step}</span>
                        <IconComponent className={`w-4 h-4 ${layer.color}`} />
                      </div>
                      <h4 className="font-bold text-white text-xs mt-1">{layer.title}</h4>
                      <div className={`text-[10px] font-mono font-medium ${layer.color}`}>{layer.tech}</div>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      {layer.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Microbiz Design System Tokens */}
          <div className="p-6 md:p-8 rounded-3xl bg-[#0B1E36] border border-[#1E3A5F] space-y-6">
            <div>
              <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                Microbiz Brand & Visual Tokens
              </span>
              <h3 className="text-lg font-bold text-white mt-0.5">
                Design System Specification
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              
              {/* Token 1 */}
              <div className="p-4 rounded-xl bg-[#091527] border border-[#1E3A5F] space-y-2">
                <div className="h-10 rounded-lg bg-blue-600 border border-blue-400 flex items-center justify-center font-mono font-bold text-white text-xs">
                  #2563EB • Royal Blue
                </div>
                <div className="font-bold text-white">Microbiz Primary Blue</div>
                <p className="text-[11px] text-slate-400">
                  Represents institutional trust, stability, and CBN regulatory compliance in the Nigerian banking ecosystem.
                </p>
              </div>

              {/* Token 2 */}
              <div className="p-4 rounded-xl bg-[#091527] border border-[#1E3A5F] space-y-2">
                <div className="h-10 rounded-lg bg-[#0B1E36] border border-[#1E3A5F] flex items-center justify-center font-mono font-bold text-slate-300 text-xs">
                  #091527 • Deep Banking Slate
                </div>
                <div className="font-bold text-white">Institutional Dark Neutral</div>
                <p className="text-[11px] text-slate-400">
                  Deep, high-clarity surface delivering WCAG AAA contrast for financial figures and statements.
                </p>
              </div>

              {/* Token 3 */}
              <div className="p-4 rounded-xl bg-[#091527] border border-[#1E3A5F] space-y-2">
                <div className="h-10 rounded-lg bg-blue-500 border border-blue-300 flex items-center justify-center font-mono font-bold text-white text-xs">
                  #60A5FA • Sky Blue Accent
                </div>
                <div className="font-bold text-white">Trust & Direct Debit Stream</div>
                <p className="text-[11px] text-slate-400">
                  Used for MASTA savings yields, NDIC insurance seals, and active loan notification toasts.
                </p>
              </div>

              {/* Token 4 */}
              <div className="p-4 rounded-xl bg-[#091527] border border-[#1E3A5F] space-y-2">
                <div className="h-10 rounded-lg bg-blue-900 border border-blue-500 flex items-center justify-center font-mono font-bold text-blue-200 text-xs">
                  #1E40AF • Ledger Blue
                </div>
                <div className="font-bold text-white">Cryptographic Blockchain</div>
                <p className="text-[11px] text-slate-400">
                  Highlights immutable PoA blockchain transaction receipts and officer digital signatures.
                </p>
              </div>

            </div>
          </div>

          {/* Direct CTA back to Cockpit and Borrower App */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-950 via-[#0B1E36] to-slate-900 border border-blue-800/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-white text-base">Ready to test the live banking suite?</h4>
              <p className="text-xs text-slate-300 mt-0.5">
                Toggle into the Officer Cockpit to underwrite walk-in loans, or launch the Walk-In Customer Intake Desk.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onLaunchOfficerCockpit}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors shadow-md"
              >
                Officer Cockpit
              </button>
              <button
                onClick={onLaunchBorrowerApp}
                className="px-4 py-2.5 bg-[#091527] hover:bg-[#0F2440] border border-[#1E3A5F] text-slate-200 rounded-xl text-xs font-semibold transition-colors"
              >
                Walk-In Intake Desk
              </button>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* INTERACTIVE USSD *5092# SIMULATOR MODAL                                   */}
      {/* ========================================================================= */}
      {showUssdModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-[#0B1E36] border-2 border-[#1E3A5F] rounded-3xl p-5 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-[#1E3A5F] pb-3">
              <div className="flex items-center space-x-2">
                <Smartphone className="w-4 h-4 text-blue-400" />
                <span className="font-bold text-white text-sm">Microbiz USSD Engine</span>
              </div>
              <button
                onClick={() => setShowUssdModal(false)}
                className="p-1 text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕ Close
              </button>
            </div>

            {/* Simulated Feature Phone Screen */}
            <div className="bg-blue-950/40 border border-blue-800/60 rounded-xl p-4 font-mono text-xs text-blue-200 space-y-2">
              <div className="text-[10px] text-slate-400 border-b border-blue-900 pb-1 flex justify-between">
                <span>Microbiz MFB *5092#</span>
                <span>Session Active</span>
              </div>

              {ussdScreen === 'dialer' && (
                <div className="space-y-3 py-2 text-center">
                  <div className="text-slate-300 text-sm font-bold">Shortcode Dialpad</div>
                  <div className="text-xl text-white font-extrabold tracking-widest bg-[#091527] p-2 rounded-lg border border-[#1E3A5F]">
                    {ussdInput}
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Accessible on all Nigerian mobile networks (MTN, Airtel, Glo, 9mobile) without mobile data.
                  </p>
                </div>
              )}

              {ussdScreen === 'menu' && (
                <div className="space-y-1 text-[11px] leading-relaxed">
                  <div className="font-bold text-white pb-1">Welcome to Microbiz Pocket:</div>
                  <div>1. Quick SabiTrader Loan (₦50k - ₦500k)</div>
                  <div>2. Check Account Balance</div>
                  <div>3. MASTA Target Savings</div>
                  <div>4. Instant Transfer (NIP)</div>
                  <div>5. Buy Airtime / Data</div>
                  <div>0. Exit</div>
                </div>
              )}

              {ussdScreen === 'loan_offer' && (
                <div className="space-y-2 text-[11px]">
                  <div className="font-bold text-white">SabiTrader Instant Pre-Approval</div>
                  <p className="text-blue-400">
                    You qualify for up to ₦350,000 based on your POS turnover history!
                  </p>
                  <div>Repayment: ₦64,800/mo (6 months)</div>
                  <div className="text-[10px] text-slate-400">Reply 1 to Accept & Disburse</div>
                </div>
              )}

              {ussdScreen === 'balance' && (
                <div className="space-y-2 text-[11px]">
                  <div className="font-bold text-white">Account Balance Enquiry</div>
                  <div>Account: 0281940192</div>
                  <div className="text-sm font-bold text-white">Available: ₦428,950.00</div>
                  <div className="text-blue-400">Ledger: ₦428,950.00</div>
                  <div className="text-[10px] text-slate-400">Thank you for banking with Microbiz MFB.</div>
                </div>
              )}

              {ussdScreen === 'masta_status' && (
                <div className="space-y-2 text-[11px]">
                  <div className="font-bold text-white">MASTA Target Savings</div>
                  <div>Active Target: Shop Expansion 2026</div>
                  <div className="text-sm font-bold text-white">Saved: ₦620,000.00</div>
                  <div className="text-blue-300">Interest Accrued: ₦34,800 (+14.5% p.a.)</div>
                </div>
              )}
            </div>

            {/* USSD Keypad Controls */}
            {ussdScreen === 'dialer' ? (
              <button
                onClick={handleUssdDial}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Dial *5092#</span>
              </button>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-1.5 text-xs">
                  {['1', '2', '3', '4', '5', '0'].map((btn) => (
                    <button
                      key={btn}
                      onClick={() => handleUssdSelect(btn)}
                      className="py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-white font-mono font-bold"
                    >
                      Option {btn}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setUssdScreen('menu')}
                    className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium"
                  >
                    Main Menu
                  </button>
                  <button
                    onClick={() => setUssdScreen('dialer')}
                    className="flex-1 py-1.5 bg-[#091527] hover:bg-[#0F2440] border border-[#1E3A5F] text-slate-300 rounded-lg text-xs font-medium"
                  >
                    End Call
                  </button>
                </div>
              </div>
            )}

            <div className="text-[10px] text-slate-500 text-center">
              Protected by NIBSS & Telecommunications VAS Regulatory Guidelines
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
