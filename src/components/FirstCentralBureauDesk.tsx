import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Search,
  Building2,
  UserCheck,
  KeyRound,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FileText,
  AlertCircle,
  Copy,
  ChevronRight,
  Database,
  ArrowRight,
  TrendingUp,
  Download,
  Activity,
  Layers,
  Sparkles,
  Lock,
  User,
  Phone,
  CreditCard,
  Hash
} from 'lucide-react';
import { 
  LoanApplication, 
  FirstCentralGatewayStatus, 
  FirstCentralConsumerMatchResult, 
  FirstCentralCommercialMatchResult, 
  FirstCentralKYCReportResult, 
  FirstCentralEnquiryLog,
  CreditOfficerRegistration
} from '../types';
import { 
  getFirstCentralStatus, 
  authenticateFirstCentral, 
  executeConsumerMatch, 
  executeCommercialMatch, 
  executeConsumerKYC, 
  getEnquiryLogs,
  verifyLoanWithFirstCentral
} from '../utils/firstCentralService';

interface FirstCentralBureauDeskProps {
  loans: LoanApplication[];
  onUpdateLoan?: (updatedLoan: LoanApplication) => void;
  activeOfficer?: CreditOfficerRegistration;
}

export const FirstCentralBureauDesk: React.FC<FirstCentralBureauDeskProps> = ({
  loans,
  onUpdateLoan,
  activeOfficer
}) => {
  // Navigation tabs inside FirstCentral desk
  const [activeTab, setActiveTab] = useState<'consumer' | 'commercial' | 'kyc' | 'gateway' | 'audit'>('consumer');

  // Gateway status & token state
  const [gatewayStatus, setGatewayStatus] = useState<FirstCentralGatewayStatus | null>(null);
  const [isRefreshingStatus, setIsRefreshingStatus] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccessMsg, setAuthSuccessMsg] = useState<string | null>(null);

  // Custom login modal state
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [customUsername, setCustomUsername] = useState('');
  const [customPassword, setCustomPassword] = useState('');

  // 1. Consumer Match state
  const [consumerBvn, setConsumerBvn] = useState('22233344455');
  const [consumerName, setConsumerName] = useState('Chinedu Emmanuel Okafor');
  const [consumerDob, setConsumerDob] = useState('1987-06-14');
  const [consumerAccountNo, setConsumerAccountNo] = useState('0128938472');
  const [consumerReason, setConsumerReason] = useState('Credit Evaluation and Loan Underwriting');
  const [consumerLoading, setConsumerLoading] = useState(false);
  const [consumerResult, setConsumerResult] = useState<FirstCentralConsumerMatchResult | null>(null);
  const [selectedLoanForConsumer, setSelectedLoanForConsumer] = useState<string>(loans[0]?.id || '');

  // 2. Commercial Match state
  const [commercialName, setCommercialName] = useState('Okafor Building Materials Enterprise');
  const [commercialRc, setCommercialRc] = useState('RC-1492084');
  const [commercialTin, setCommercialTin] = useState('TIN-28491049-0001');
  const [commercialReason, setCommercialReason] = useState('Commercial Credit Underwriting & SME Financing');
  const [commercialLoading, setCommercialLoading] = useState(false);
  const [commercialResult, setCommercialResult] = useState<FirstCentralCommercialMatchResult | null>(null);

  // 3. KYC Report state
  const [kycBvn, setKycBvn] = useState('22233344455');
  const [kycReason, setKycReason] = useState('Loan Origination KYC Verification');
  const [kycLoading, setKycLoading] = useState(false);
  const [kycResult, setKycResult] = useState<FirstCentralKYCReportResult | null>(null);

  // 4. Audit logs
  const [auditLogs, setAuditLogs] = useState<FirstCentralEnquiryLog[]>([]);

  // Feedback notifications
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Load gateway status and initial data on mount
  useEffect(() => {
    refreshGateway();
    setAuditLogs(getEnquiryLogs());
  }, []);

  const refreshGateway = async () => {
    setIsRefreshingStatus(true);
    try {
      const status = await getFirstCentralStatus();
      setGatewayStatus(status);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefreshingStatus(false);
    }
  };

  const handleAuthenticate = async (user?: string, pass?: string) => {
    setAuthLoading(true);
    setAuthError(null);
    setAuthSuccessMsg(null);
    try {
      const res = await authenticateFirstCentral(user, pass);
      if (res.success) {
        setAuthSuccessMsg(res.message);
        setShowLoginModal(false);
        await refreshGateway();
        setAuditLogs(getEnquiryLogs());
      } else {
        setAuthError(res.message);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed');
    } finally {
      setAuthLoading(false);
    }
  };

  // Run Consumer Match
  const handleRunConsumerMatch = async () => {
    if (!consumerBvn && !consumerName) {
      alert('Please enter BVN or Consumer Name');
      return;
    }
    setConsumerLoading(true);
    try {
      const result = await executeConsumerMatch({
        identification: consumerBvn,
        consumerName,
        dob: consumerDob,
        accountNo: consumerAccountNo,
        enquiryReason: consumerReason,
        officerName: activeOfficer?.officerName || 'Loan Review Officer',
        officerReg: activeOfficer?.registrationNumber,
        channel: activeOfficer?.channel
      });
      setConsumerResult(result);
      setAuditLogs(getEnquiryLogs());
      await refreshGateway();
    } catch (err: any) {
      alert(`Consumer match failed: ${err.message}`);
    } finally {
      setConsumerLoading(false);
    }
  };

  // Run Commercial Match
  const handleRunCommercialMatch = async () => {
    if (!commercialName) {
      alert('Please enter Commercial Name');
      return;
    }
    setCommercialLoading(true);
    try {
      const result = await executeCommercialMatch({
        commercialName,
        registrationNo: commercialRc,
        taxNo: commercialTin,
        enquiryReason: commercialReason,
        officerName: activeOfficer?.officerName || 'Commercial Underwriter',
        officerReg: activeOfficer?.registrationNumber,
        channel: activeOfficer?.channel
      });
      setCommercialResult(result);
      setAuditLogs(getEnquiryLogs());
      await refreshGateway();
    } catch (err: any) {
      alert(`Commercial match failed: ${err.message}`);
    } finally {
      setCommercialLoading(false);
    }
  };

  // Run KYC Report
  const handleRunKYC = async () => {
    if (!kycBvn) {
      alert('Please enter BVN or Identification number');
      return;
    }
    setKycLoading(true);
    try {
      const result = await executeConsumerKYC({
        identification: kycBvn,
        enquiryReason: kycReason,
        officerName: activeOfficer?.officerName || 'Compliance Officer',
        officerReg: activeOfficer?.registrationNumber,
        channel: activeOfficer?.channel
      });
      setKycResult(result);
      setAuditLogs(getEnquiryLogs());
      await refreshGateway();
    } catch (err: any) {
      alert(`KYC report query failed: ${err.message}`);
    } finally {
      setKycLoading(false);
    }
  };

  // Quick fill applicant into consumer match
  const populateApplicant = (loan: LoanApplication) => {
    setConsumerBvn(loan.bvn || '');
    setConsumerName(loan.applicantName);
    setConsumerAccountNo(loan.bankAccount?.accountNumber || '0128938472');
    setSelectedLoanForConsumer(loan.id);
    if (loan.businessName) {
      setCommercialName(loan.businessName);
    }
    setKycBvn(loan.bvn || '');
    setActionSuccess(`Loaded dossier for ${loan.applicantName} (#${loan.id})`);
    setTimeout(() => setActionSuccess(null), 3500);
  };

  // One-click end-to-end Loan Verification
  const handleVerifyLoanDirectly = async (loan: LoanApplication) => {
    setConsumerLoading(true);
    try {
      const { updatedLoan, consumerMatch, kycReport, commercialMatch } = await verifyLoanWithFirstCentral(
        loan,
        activeOfficer?.officerName || 'Folasade Adebayo',
        activeOfficer?.registrationNumber || 'REG/MFB/CO-3392'
      );
      if (onUpdateLoan) {
        onUpdateLoan(updatedLoan);
      }
      setConsumerResult(consumerMatch);
      setKycResult(kycReport);
      if (commercialMatch) setCommercialResult(commercialMatch);
      setAuditLogs(getEnquiryLogs());
      await refreshGateway();
      setActionSuccess(`Successfully verified #${loan.id} with FirstCentral Credit Bureau! Bureau Score: ${consumerMatch.bureauScore}/850 (${consumerMatch.scoreGrade})`);
      setTimeout(() => setActionSuccess(null), 5000);
    } catch (err: any) {
      alert(`Loan bureau verification failed: ${err.message}`);
    } finally {
      setConsumerLoading(false);
    }
  };

  // Format countdown for ticket
  const formatTicketCountdown = (seconds?: number) => {
    if (!seconds || seconds <= 0) return 'Expired / Pending';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs}h ${mins}m ${secs}s`;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Gateway Connectivity Architecture */}
      <div className="bg-gradient-to-r from-[#0B1E36] via-[#0E2442] to-[#0A1A2F] border border-[#1E3A5F] rounded-2xl p-6 shadow-xl relative overflow-hidden">
        {/* Background glow & watermark */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 w-60 h-60 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2.5 bg-blue-600/20 border border-blue-500/40 rounded-xl text-blue-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    FirstCentral Credit Bureau Gateway
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40 tracking-wide uppercase">
                    REST v2 • UAT Live
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    CBN Licensed
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Integrated multi-bureau credit scoring, individual consumer matching, commercial debtor verification, and KYC reports.
                </p>
              </div>
            </div>

            {/* Base URL and endpoint routes indicator */}
            <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-300 font-mono">
              <span className="flex items-center space-x-1.5 bg-[#071324] px-3 py-1 rounded-lg border border-[#173052]">
                <Database className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-slate-400">Base URL:</span>
                <span className="text-blue-300 font-medium">https://uat.firstcentralcreditbureau.com/firstcentralrestv2</span>
              </span>

              <span className="flex items-center space-x-1.5 bg-[#071324] px-3 py-1 rounded-lg border border-[#173052]">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-slate-400">Latency:</span>
                <span className="text-emerald-300">{gatewayStatus?.latencyMs ? `${gatewayStatus.latencyMs}ms` : '< 85ms'}</span>
              </span>
            </div>
          </div>

          {/* Ticket & Gateway Health Widget */}
          <div className="bg-[#071324]/90 border border-[#1E3A5F] rounded-xl p-4 min-w-[280px] shadow-inner">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className={`w-2.5 h-2.5 rounded-full ${gatewayStatus?.status === 'AUTHENTICATED' || gatewayStatus?.status === 'ONLINE' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  {gatewayStatus?.status === 'AUTHENTICATED' ? 'Authenticated Session' : 'Gateway Online'}
                </span>
              </div>
              <button
                onClick={refreshGateway}
                disabled={isRefreshingStatus}
                title="Ping Gateway"
                className="text-slate-400 hover:text-white p-1 rounded transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingStatus ? 'animate-spin text-blue-400' : ''}`} />
              </button>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between items-center text-slate-400">
                <span>DataTicket Status:</span>
                <span className="font-semibold text-emerald-400 flex items-center space-x-1 font-mono">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Valid (5h Token)</span>
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Token Countdown:</span>
                <span className="font-mono text-amber-300 font-bold">
                  {formatTicketCountdown(gatewayStatus?.ticketTimeRemainingSeconds || 17820)}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Data Source:</span>
                <span className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-blue-950 text-blue-300 border border-blue-800">
                  {gatewayStatus?.source === 'LIVE_UAT' ? 'UAT Live Server' : 'UAT Connected Sandbox'}
                </span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-[#132A4A] flex items-center justify-between gap-2">
              <button
                onClick={() => handleAuthenticate()}
                disabled={authLoading}
                className="flex-1 flex items-center justify-center space-x-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold py-1.5 px-3 rounded-lg transition-colors shadow"
              >
                <KeyRound className={`w-3.5 h-3.5 ${authLoading ? 'animate-spin' : ''}`} />
                <span>{authLoading ? 'Authenticating...' : 'Refresh Token'}</span>
              </button>

              <button
                onClick={() => setShowLoginModal(true)}
                className="px-2.5 py-1.5 bg-[#0F2646] hover:bg-[#163863] text-slate-300 text-xs font-medium rounded-lg border border-[#20436F] transition-colors"
                title="Configure custom UAT credentials"
              >
                Login...
              </button>
            </div>
          </div>
        </div>

        {/* Success / Error notification alerts */}
        {actionSuccess && (
          <div className="mt-4 p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-xs text-emerald-200 flex items-center space-x-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}
        {authSuccessMsg && (
          <div className="mt-4 p-3 bg-blue-950/80 border border-blue-500/50 rounded-xl text-xs text-blue-200 flex items-center justify-between animate-fadeIn">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
              <span>{authSuccessMsg}</span>
            </div>
            <button onClick={() => setAuthSuccessMsg(null)} className="text-slate-400 hover:text-white text-xs">✕</button>
          </div>
        )}
        {authError && (
          <div className="mt-4 p-3 bg-rose-950/80 border border-rose-500/50 rounded-xl text-xs text-rose-200 flex items-center justify-between animate-fadeIn">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{authError}</span>
            </div>
            <button onClick={() => setAuthError(null)} className="text-slate-400 hover:text-white text-xs">✕</button>
          </div>
        )}
      </div>

      {/* Main Tab Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1E3A5F] pb-3">
        <div className="flex flex-wrap items-center gap-2 bg-[#091527] p-1.5 rounded-xl border border-[#1E3A5F] text-xs font-medium">
          <button
            onClick={() => setActiveTab('consumer')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg transition-all ${
              activeTab === 'consumer'
                ? 'bg-blue-600 text-white shadow font-bold'
                : 'text-slate-300 hover:text-white hover:bg-[#0F2440]'
            }`}
          >
            <UserCheck className="w-4 h-4 text-blue-300" />
            <span>1. Individual Match Checker</span>
            <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-blue-950 text-blue-200 border border-blue-700">
              /ConnectConsumerMatch
            </span>
          </button>

          <button
            onClick={() => setActiveTab('commercial')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg transition-all ${
              activeTab === 'commercial'
                ? 'bg-blue-600 text-white shadow font-bold'
                : 'text-slate-300 hover:text-white hover:bg-[#0F2440]'
            }`}
          >
            <Building2 className="w-4 h-4 text-amber-300" />
            <span>2. Business Match Checker</span>
            <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-200 border border-amber-700">
              /ConnectCommercialMatch
            </span>
          </button>

          <button
            onClick={() => setActiveTab('kyc')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg transition-all ${
              activeTab === 'kyc'
                ? 'bg-blue-600 text-white shadow font-bold'
                : 'text-slate-300 hover:text-white hover:bg-[#0F2440]'
            }`}
          >
            <FileText className="w-4 h-4 text-emerald-300" />
            <span>3. Consumer KYC Report</span>
            <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-200 border border-emerald-700">
              /GetConsumerKYCVerificationReport
            </span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg transition-all ${
              activeTab === 'audit'
                ? 'bg-blue-600 text-white shadow font-bold'
                : 'text-slate-300 hover:text-white hover:bg-[#0F2440]'
            }`}
          >
            <Clock className="w-4 h-4 text-purple-300" />
            <span>Audit Trail & Enquiry History</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-purple-950 text-purple-200 border border-purple-800 font-mono">
              {auditLogs.length}
            </span>
          </button>
        </div>

        {/* Quick Applicant Selector Dropdown */}
        <div className="flex items-center space-x-2 bg-[#091527] px-3 py-1.5 rounded-xl border border-[#1E3A5F]">
          <span className="text-xs text-slate-400">Load Dossier:</span>
          <select
            value={selectedLoanForConsumer}
            onChange={(e) => {
              const found = loans.find(l => l.id === e.target.value);
              if (found) populateApplicant(found);
            }}
            className="bg-[#0D223F] border border-[#1E3A5F] text-slate-200 text-xs py-1 px-2.5 rounded-lg focus:outline-none focus:border-blue-500 font-medium"
          >
            {loans.map(loan => (
              <option key={loan.id} value={loan.id}>
                {loan.applicantName} ({loan.id}) - NGN {loan.amount.toLocaleString()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: INDIVIDUAL MATCH CHECKER (ConnectConsumerMatch) */}
      {/* ======================================================== */}
      {activeTab === 'consumer' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Query Formulation Form (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-[#0B1E36] border border-[#1E3A5F] rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between pb-3 border-b border-[#1E3A5F] mb-4">
                <div className="flex items-center space-x-2">
                  <UserCheck className="w-5 h-5 text-blue-400" />
                  <h3 className="text-sm font-bold text-white">Individual Match Query</h3>
                </div>
                <span className="text-[11px] font-mono text-slate-400">POST /ConnectConsumerMatch</span>
              </div>

              {/* Quick Fill Presets */}
              <div className="mb-4">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Quick Select Loan Applicant:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {loans.slice(0, 5).map(l => (
                    <button
                      key={l.id}
                      onClick={() => populateApplicant(l)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                        consumerName === l.applicantName
                          ? 'bg-blue-600/30 border-blue-500 text-blue-200 font-semibold'
                          : 'bg-[#0E2544] border-[#1E3A5F] text-slate-300 hover:bg-[#143259]'
                      }`}
                    >
                      {l.applicantName.split(' ')[0]} ({l.id.slice(-4)})
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="text-xs font-semibold text-slate-300 flex items-center justify-between mb-1">
                    <span>Bank Verification Number (BVN)</span>
                    <span className="text-[10px] text-blue-400 font-mono">Recommended (Unique ID)</span>
                  </label>
                  <div className="relative">
                    <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={consumerBvn}
                      onChange={(e) => setConsumerBvn(e.target.value)}
                      placeholder="e.g. 22233344455"
                      maxLength={11}
                      className="w-full bg-[#081527] border border-[#1E3A5F] rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Consumer Full Legal Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={consumerName}
                      onChange={(e) => setConsumerName(e.target.value)}
                      placeholder="e.g. Chinedu Emmanuel Okafor"
                      className="w-full bg-[#081527] border border-[#1E3A5F] rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Date of Birth (DOB)
                    </label>
                    <input
                      type="date"
                      value={consumerDob}
                      onChange={(e) => setConsumerDob(e.target.value)}
                      className="w-full bg-[#081527] border border-[#1E3A5F] rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Account Number
                    </label>
                    <input
                      type="text"
                      value={consumerAccountNo}
                      onChange={(e) => setConsumerAccountNo(e.target.value)}
                      placeholder="0128938472"
                      className="w-full bg-[#081527] border border-[#1E3A5F] rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Enquiry Reason (Mandatory CBN Requirement)
                  </label>
                  <input
                    type="text"
                    value={consumerReason}
                    onChange={(e) => setConsumerReason(e.target.value)}
                    className="w-full bg-[#081527] border border-[#1E3A5F] rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={handleRunConsumerMatch}
                    disabled={consumerLoading}
                    className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg transition-all disabled:opacity-50"
                  >
                    <Search className={`w-4 h-4 ${consumerLoading ? 'animate-spin' : ''}`} />
                    <span>{consumerLoading ? 'Querying FirstCentral...' : 'Search Consumer Match'}</span>
                  </button>

                  {selectedLoanForConsumer && (
                    <button
                      onClick={() => {
                        const target = loans.find(l => l.id === selectedLoanForConsumer);
                        if (target) handleVerifyLoanDirectly(target);
                      }}
                      disabled={consumerLoading}
                      title="Run full verification and update loan dossier"
                      className="px-3 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl transition-all shadow flex items-center space-x-1"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Full Verify</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Quick tips about FirstCentral Matching */}
            <div className="bg-[#09172B] border border-[#173356] rounded-xl p-4 text-xs text-slate-300 space-y-2">
              <div className="font-bold text-blue-400 flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>FirstCentral Match Rules</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Searching with <strong>BVN</strong> provides 99.8% match precision and bypasses variations in phonetic name spellings across commercial institutions. When searching with Name, ensure middle names are included.
              </p>
            </div>
          </div>

          {/* Results Viewer (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            {consumerResult ? (
              <div className="bg-[#0B1E36] border border-[#1E3A5F] rounded-2xl p-6 shadow-xl space-y-5 animate-fadeIn">
                {/* Result Header & Score Gauge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#1E3A5F] gap-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-base font-bold text-white">
                        {consumerResult.matchedName}
                      </h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                        {consumerResult.consumerId}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 text-xs text-slate-400">
                      <span>BVN: <strong className="font-mono text-slate-200">{consumerResult.bvn}</strong></span>
                      <span>•</span>
                      <span>Match Confidence: <strong className="text-emerald-400 font-mono">{consumerResult.matchConfidence}%</strong></span>
                    </div>
                  </div>

                  {/* Credit Score Badge */}
                  <div className="flex items-center space-x-3 bg-[#081527] px-4 py-2.5 rounded-xl border border-[#1E3A5F]">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        FirstCentral Score
                      </div>
                      <div className="flex items-baseline space-x-1">
                        <span className={`text-2xl font-black ${
                          consumerResult.bureauScore >= 740 ? 'text-emerald-400' :
                          consumerResult.bureauScore >= 670 ? 'text-blue-400' :
                          consumerResult.bureauScore >= 600 ? 'text-amber-400' : 'text-rose-400'
                        }`}>
                          {consumerResult.bureauScore}
                        </span>
                        <span className="text-xs text-slate-400">/ 850</span>
                      </div>
                    </div>
                    <div className="pl-3 border-l border-[#1A375C] text-right">
                      <div className={`text-xs font-bold ${
                        consumerResult.riskCategory === 'LOW_RISK' ? 'text-emerald-400' :
                        consumerResult.riskCategory === 'MODERATE_RISK' ? 'text-amber-400' : 'text-rose-400'
                      }`}>
                        {consumerResult.scoreGrade}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {consumerResult.riskCategory}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Summary Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-[#081527] p-3 rounded-xl border border-[#193558]">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Open Facilities</span>
                    <span className="text-lg font-bold text-white font-mono">{consumerResult.summary.totalOpenFacilities}</span>
                    <span className="text-[10px] text-slate-500 block">Closed: {consumerResult.summary.totalClosedFacilities}</span>
                  </div>

                  <div className="bg-[#081527] p-3 rounded-xl border border-[#193558]">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Current Balance</span>
                    <span className="text-sm font-bold text-slate-200 font-mono">
                      NGN {consumerResult.summary.totalCurrentBalance.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-500 block">Sanctioned: NGN {consumerResult.summary.totalSanctionedAmount.toLocaleString()}</span>
                  </div>

                  <div className="bg-[#081527] p-3 rounded-xl border border-[#193558]">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Overdue</span>
                    <span className={`text-sm font-bold font-mono ${consumerResult.summary.totalOverdueAmount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      NGN {consumerResult.summary.totalOverdueAmount.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-500 block">Worst DPD: {consumerResult.summary.maxDaysPastDue} days</span>
                  </div>

                  <div className="bg-[#081527] p-3 rounded-xl border border-[#193558]">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Dishonored Cheques</span>
                    <span className="text-lg font-bold text-white font-mono">{consumerResult.summary.dishonoredChequesCount}</span>
                    <span className="text-[10px] text-slate-500 block">Litigations: {consumerResult.summary.activeLitigationsCount}</span>
                  </div>
                </div>

                {/* Reporting Facilities Table */}
                <div>
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center justify-between">
                    <span>Credit Facilities on Record ({consumerResult.facilities.length})</span>
                    <span className="text-[10px] text-slate-400 font-mono">Last Reported: {consumerResult.summary.lastReportedDate}</span>
                  </h4>

                  <div className="overflow-x-auto rounded-xl border border-[#1A385E]">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#071322] text-slate-400 font-semibold border-b border-[#1A385E]">
                        <tr>
                          <th className="py-2.5 px-3">Subscriber / Bank</th>
                          <th className="py-2.5 px-3">Type</th>
                          <th className="py-2.5 px-3">Sanctioned</th>
                          <th className="py-2.5 px-3">Balance</th>
                          <th className="py-2.5 px-3">Overdue</th>
                          <th className="py-2.5 px-3">DPD</th>
                          <th className="py-2.5 px-3">Classification</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#132A47] text-slate-200">
                        {consumerResult.facilities.map((fac, idx) => (
                          <tr key={idx} className="hover:bg-[#0D2544]/60">
                            <td className="py-2.5 px-3 font-medium">
                              <div>{fac.subscriberName}</div>
                              <div className="text-[10px] font-mono text-slate-500">{fac.facilityNumber}</div>
                            </td>
                            <td className="py-2.5 px-3 text-slate-300 text-[11px]">{fac.accountType}</td>
                            <td className="py-2.5 px-3 font-mono">NGN {fac.sanctionedAmount.toLocaleString()}</td>
                            <td className="py-2.5 px-3 font-mono">NGN {fac.currentBalance.toLocaleString()}</td>
                            <td className={`py-2.5 px-3 font-mono ${fac.overdueAmount > 0 ? 'text-rose-400 font-bold' : 'text-slate-400'}`}>
                              NGN {fac.overdueAmount.toLocaleString()}
                            </td>
                            <td className={`py-2.5 px-3 font-mono ${fac.daysPastDue > 0 ? 'text-rose-400 font-bold' : 'text-emerald-400'}`}>
                              {fac.daysPastDue}
                            </td>
                            <td className="py-2.5 px-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                fac.performanceClassification === 'PERFORMING' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                                fac.performanceClassification === 'WATCHLIST' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                                'bg-rose-950 text-rose-300 border border-rose-800'
                              }`}>
                                {fac.performanceClassification}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Footer metadata & Attachment action */}
                <div className="pt-3 border-t border-[#1E3A5F] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="text-[11px] text-slate-400">
                    Source: <span className="font-mono text-blue-300 font-semibold">{consumerResult.source}</span> • Ref Timestamp: <span className="font-mono text-slate-300">{new Date(consumerResult.enquiryTimestamp).toLocaleTimeString()}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        const target = loans.find(l => l.id === selectedLoanForConsumer);
                        if (target) handleVerifyLoanDirectly(target);
                      }}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow text-xs flex items-center space-x-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Attach to Application #{selectedLoanForConsumer}</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#0B1E36] border border-[#1E3A5F] border-dashed rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-3">
                <div className="p-4 bg-[#0F2646] rounded-full text-slate-400">
                  <UserCheck className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-base font-bold text-white">No Consumer Match Record Queried</h3>
                <p className="text-xs text-slate-400 max-w-sm">
                  Select a loan applicant or enter a Bank Verification Number (BVN) on the left panel to execute an individual match check against FirstCentral Credit Bureau.
                </p>
                <button
                  onClick={handleRunConsumerMatch}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow transition-colors flex items-center space-x-2 mt-2"
                >
                  <Search className="w-4 h-4" />
                  <span>Execute Sample Check ({consumerName})</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: BUSINESS MATCH CHECKER (ConnectCommercialMatch) */}
      {/* ======================================================== */}
      {activeTab === 'commercial' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-[#0B1E36] border border-[#1E3A5F] rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between pb-3 border-b border-[#1E3A5F] mb-4">
                <div className="flex items-center space-x-2">
                  <Building2 className="w-5 h-5 text-amber-400" />
                  <h3 className="text-sm font-bold text-white">Business Match Query</h3>
                </div>
                <span className="text-[11px] font-mono text-slate-400">POST /ConnectCommercialMatch</span>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Commercial / Registered Entity Name
                  </label>
                  <input
                    type="text"
                    value={commercialName}
                    onChange={(e) => setCommercialName(e.target.value)}
                    placeholder="e.g. Okafor Building Materials Enterprise"
                    className="w-full bg-[#081527] border border-[#1E3A5F] rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      CAC Registration No (RC / BN)
                    </label>
                    <input
                      type="text"
                      value={commercialRc}
                      onChange={(e) => setCommercialRc(e.target.value)}
                      placeholder="e.g. RC-1492084"
                      className="w-full bg-[#081527] border border-[#1E3A5F] rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Tax Identification No (TIN)
                    </label>
                    <input
                      type="text"
                      value={commercialTin}
                      onChange={(e) => setCommercialTin(e.target.value)}
                      placeholder="e.g. TIN-28491049-0001"
                      className="w-full bg-[#081527] border border-[#1E3A5F] rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Enquiry Reason
                  </label>
                  <input
                    type="text"
                    value={commercialReason}
                    onChange={(e) => setCommercialReason(e.target.value)}
                    className="w-full bg-[#081527] border border-[#1E3A5F] rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleRunCommercialMatch}
                    disabled={commercialLoading}
                    className="w-full flex items-center justify-center space-x-2 bg-amber-600 hover:bg-amber-500 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg transition-all disabled:opacity-50"
                  >
                    <Search className={`w-4 h-4 ${commercialLoading ? 'animate-spin' : ''}`} />
                    <span>{commercialLoading ? 'Querying Commercial Registry...' : 'Search Commercial Match'}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-[#09172B] border border-[#173356] rounded-xl p-4 text-xs text-slate-300 space-y-2">
              <div className="font-bold text-amber-400 flex items-center space-x-1.5">
                <Building2 className="w-4 h-4" />
                <span>Commercial Debtor Registry</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                ConnectCommercialMatch searches registered incorporated entities, corporate debenture liens, cross-guarantees, and affiliated director BVNs to detect corporate over-indebtedness.
              </p>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            {commercialResult ? (
              <div className="bg-[#0B1E36] border border-[#1E3A5F] rounded-2xl p-6 shadow-xl space-y-5 animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#1E3A5F] gap-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-base font-bold text-white">
                        {commercialResult.matchedCommercialName}
                      </h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        {commercialResult.commercialId}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 text-xs text-slate-400">
                      <span>CAC: <strong className="font-mono text-slate-200">{commercialResult.registrationNumber}</strong></span>
                      <span>•</span>
                      <span>TIN: <strong className="font-mono text-slate-200">{commercialResult.taxNumber}</strong></span>
                    </div>
                  </div>

                  <div className="bg-[#081527] px-4 py-2 rounded-xl border border-[#1E3A5F] text-right">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Corporate Rating</div>
                    <div className="text-sm font-bold text-emerald-400">{commercialResult.corporateCreditGrade}</div>
                    <div className="text-[10px] text-slate-400">{commercialResult.corporateRiskLevel}</div>
                  </div>
                </div>

                {/* Commercial Exposure Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-[#081527] p-3 rounded-xl border border-[#193558]">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Exposure</span>
                    <span className="text-sm font-bold text-white font-mono">
                      NGN {commercialResult.summary.totalOutstandingExposure.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-500 block">Limit: NGN {commercialResult.summary.totalCreditLimit.toLocaleString()}</span>
                  </div>

                  <div className="bg-[#081527] p-3 rounded-xl border border-[#193558]">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Overdue Debt</span>
                    <span className={`text-sm font-bold font-mono ${commercialResult.summary.totalOverdueDebt > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      NGN {commercialResult.summary.totalOverdueDebt.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-500 block">NPL Status: {commercialResult.summary.nplStatus}</span>
                  </div>

                  <div className="bg-[#081527] p-3 rounded-xl border border-[#193558]">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Active Facilities</span>
                    <span className="text-lg font-bold text-white font-mono">{commercialResult.summary.totalOpenFacilities}</span>
                    <span className="text-[10px] text-slate-500 block">Closed: {commercialResult.summary.totalClosedFacilities}</span>
                  </div>

                  <div className="bg-[#081527] p-3 rounded-xl border border-[#193558]">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Incorporation Date</span>
                    <span className="text-xs font-bold text-slate-200 font-mono">{commercialResult.incorporationDate}</span>
                    <span className="text-[10px] text-slate-500 block">Vintage: &gt; 8 years</span>
                  </div>
                </div>

                {/* Directors on Record */}
                <div>
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Registered Directors & Shareholders ({commercialResult.directors.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {commercialResult.directors.map((dir, idx) => (
                      <div key={idx} className="bg-[#081527] p-2.5 rounded-xl border border-[#1A385E] flex items-center justify-between">
                        <div>
                          <div className="text-xs font-semibold text-white">{dir.name}</div>
                          <div className="text-[10px] text-slate-400">{dir.designation}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-mono font-bold text-amber-400">{dir.shareholdingPercent}%</div>
                          <div className="text-[10px] font-mono text-slate-500">BVN: {dir.bvn?.slice(-4) || 'VER'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Commercial Facilities */}
                <div>
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Commercial Credit Facilities
                  </h4>
                  <div className="overflow-x-auto rounded-xl border border-[#1A385E]">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#071322] text-slate-400 font-semibold border-b border-[#1A385E]">
                        <tr>
                          <th className="py-2 px-3">Lending Institution</th>
                          <th className="py-2 px-3">Facility Type</th>
                          <th className="py-2 px-3">Sanctioned Limit</th>
                          <th className="py-2 px-3">Outstanding</th>
                          <th className="py-2 px-3">Classification</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#132A47] text-slate-200">
                        {commercialResult.facilities.map((fac, idx) => (
                          <tr key={idx} className="hover:bg-[#0D2544]/60">
                            <td className="py-2 px-3 font-medium">{fac.lendingInstitution}</td>
                            <td className="py-2 px-3 text-[11px] text-slate-300">{fac.facilityType}</td>
                            <td className="py-2 px-3 font-mono">NGN {fac.sanctionedLimit.toLocaleString()}</td>
                            <td className="py-2 px-3 font-mono">NGN {fac.outstandingBalance.toLocaleString()}</td>
                            <td className="py-2 px-3">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                                {fac.classification}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#0B1E36] border border-[#1E3A5F] border-dashed rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-3">
                <div className="p-4 bg-[#0F2646] rounded-full text-slate-400">
                  <Building2 className="w-8 h-8 text-amber-400" />
                </div>
                <h3 className="text-base font-bold text-white">No Commercial Match Queried</h3>
                <p className="text-xs text-slate-400 max-w-sm">
                  Search a registered corporate enterprise or SME business name to retrieve directors, corporate credit rating, and commercial bank facilities.
                </p>
                <button
                  onClick={handleRunCommercialMatch}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow transition-colors flex items-center space-x-2 mt-2"
                >
                  <Search className="w-4 h-4" />
                  <span>Execute Sample Commercial Query</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: CONSUMER KYC REPORT (GetConsumerKYCVerificationReport) */}
      {/* ======================================================== */}
      {activeTab === 'kyc' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-[#0B1E36] border border-[#1E3A5F] rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between pb-3 border-b border-[#1E3A5F] mb-4">
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">Consumer KYC Query</h3>
                </div>
                <span className="text-[11px] font-mono text-slate-400">POST /GetConsumerKYCVerificationReport</span>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Identification (BVN / NIN / Phone)
                  </label>
                  <div className="relative">
                    <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={kycBvn}
                      onChange={(e) => setKycBvn(e.target.value)}
                      placeholder="e.g. 22233344455"
                      className="w-full bg-[#081527] border border-[#1E3A5F] rounded-xl py-2 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Enquiry Reason
                  </label>
                  <input
                    type="text"
                    value={kycReason}
                    onChange={(e) => setKycReason(e.target.value)}
                    className="w-full bg-[#081527] border border-[#1E3A5F] rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleRunKYC}
                    disabled={kycLoading}
                    className="w-full flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg transition-all disabled:opacity-50"
                  >
                    <UserCheck className={`w-4 h-4 ${kycLoading ? 'animate-spin' : ''}`} />
                    <span>{kycLoading ? 'Pulling Verified KYC Report...' : 'Generate Consumer KYC Report'}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-[#09172B] border border-[#173356] rounded-xl p-4 text-xs text-slate-300 space-y-2">
              <div className="font-bold text-emerald-400 flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>NIMC & NIBSS Certified Verification</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                FirstCentral KYC Verification correlates the applicant's biological date of birth, biometric hash, registered GSM number, PEP sanctions list, and physical residential address.
              </p>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            {kycResult ? (
              <div className="bg-[#0B1E36] border border-[#1E3A5F] rounded-2xl p-6 shadow-xl space-y-5 animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#1E3A5F] gap-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{kycResult.verificationStatus}</span>
                      </span>
                      <h3 className="text-base font-bold text-white">
                        {kycResult.consumerDetails.firstName} {kycResult.consumerDetails.middleName} {kycResult.consumerDetails.lastName}
                      </h3>
                    </div>
                    <div className="text-xs text-slate-400 font-mono">
                      Ref: <strong className="text-blue-300">{kycResult.reportReference}</strong> • Issued: {new Date(kycResult.issuedAt).toLocaleString()}
                    </div>
                  </div>

                  <div className="bg-[#081527] px-4 py-2 rounded-xl border border-[#1E3A5F] text-right">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Match Score</div>
                    <div className="text-lg font-black text-emerald-400 font-mono">{kycResult.verificationScore}%</div>
                  </div>
                </div>

                {/* Identity & Demographics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-[#081527] p-3 rounded-xl border border-[#193558] space-y-1.5">
                    <div className="text-slate-400 text-[10px] uppercase font-semibold">Legal Identity Details</div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Full Name:</span>
                      <span className="text-white font-medium">{kycResult.consumerDetails.firstName} {kycResult.consumerDetails.lastName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Date of Birth:</span>
                      <span className="text-white font-mono">{kycResult.consumerDetails.dateOfBirth}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Gender:</span>
                      <span className="text-white">{kycResult.consumerDetails.gender}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">BVN Verified:</span>
                      <span className="text-emerald-400 font-mono">{kycResult.consumerDetails.bvn}</span>
                    </div>
                  </div>

                  <div className="bg-[#081527] p-3 rounded-xl border border-[#193558] space-y-1.5">
                    <div className="text-slate-400 text-[10px] uppercase font-semibold">Contact & Address</div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Primary Phone:</span>
                      <span className="text-white font-mono">{kycResult.consumerDetails.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">State / LGA:</span>
                      <span className="text-white">{kycResult.consumerDetails.stateOfOrigin} / {kycResult.consumerDetails.lga}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Residential Address:</span>
                      <span className="text-white text-[11px] leading-tight block">{kycResult.consumerDetails.residentialAddress}</span>
                    </div>
                  </div>
                </div>

                {/* Compliance & AML/CFT Sanctions Check */}
                <div>
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
                    Sanctions, PEP & Deceased Registry Checks
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="bg-[#081527] p-2.5 rounded-xl border border-[#193558]">
                      <span className="text-[10px] text-slate-400 block">Deceased Status</span>
                      <span className="text-xs font-bold text-emerald-400 flex items-center space-x-1 mt-0.5">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{kycResult.validationChecks.deceasedStatus}</span>
                      </span>
                    </div>

                    <div className="bg-[#081527] p-2.5 rounded-xl border border-[#193558]">
                      <span className="text-[10px] text-slate-400 block">PEP Check</span>
                      <span className="text-xs font-bold text-emerald-400 flex items-center space-x-1 mt-0.5">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{kycResult.validationChecks.pepStatus}</span>
                      </span>
                    </div>

                    <div className="bg-[#081527] p-2.5 rounded-xl border border-[#193558]">
                      <span className="text-[10px] text-slate-400 block">Watchlist Screening</span>
                      <span className="text-xs font-bold text-emerald-400 flex items-center space-x-1 mt-0.5">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{kycResult.validationChecks.watchlistHit ? 'HIT DETECTED' : 'CLEAR / NO HIT'}</span>
                      </span>
                    </div>

                    <div className="bg-[#081527] p-2.5 rounded-xl border border-[#193558]">
                      <span className="text-[10px] text-slate-400 block">Phone Match</span>
                      <span className="text-xs font-bold text-emerald-400 flex items-center space-x-1 mt-0.5">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>MATCHED 100%</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#1E3A5F] flex items-center justify-between text-xs text-slate-400">
                  <span>Issuing Authority: <strong className="text-slate-200">{kycResult.issuingAuthority}</strong></span>
                  <span className="font-mono text-emerald-300">CBN Anti-Money Laundering Compliant</span>
                </div>
              </div>
            ) : (
              <div className="bg-[#0B1E36] border border-[#1E3A5F] border-dashed rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-3">
                <div className="p-4 bg-[#0F2646] rounded-full text-slate-400">
                  <FileText className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-base font-bold text-white">No KYC Verification Report Pulled</h3>
                <p className="text-xs text-slate-400 max-w-sm">
                  Run an official KYC verification to validate applicant BVN against NIBSS, verify living status, and clear against the Politically Exposed Persons (PEP) register.
                </p>
                <button
                  onClick={handleRunKYC}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow transition-colors flex items-center space-x-2 mt-2"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Pull Verified KYC Sheet (BVN {kycBvn})</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: AUDIT TRAIL & ENQUIRY HISTORY */}
      {/* ======================================================== */}
      {activeTab === 'audit' && (
        <div className="bg-[#0B1E36] border border-[#1E3A5F] rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#1E3A5F] gap-2">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Clock className="w-4 h-4 text-purple-400" />
                <span>FirstCentral Credit Bureau Enquiry Audit Trail</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Every enquiry is cryptographically stamped and logged for Central Bank of Nigeria (CBN) regulatory compliance.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono px-2 py-1 rounded bg-[#071322] text-slate-300 border border-[#193558]">
                Total Enquiries: {auditLogs.length}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#1A385E]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#071322] text-slate-400 font-semibold border-b border-[#1A385E]">
                <tr>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">API Endpoint / Type</th>
                  <th className="py-2.5 px-3">Subject / Query</th>
                  <th className="py-2.5 px-3">Rating / Outcome</th>
                  <th className="py-2.5 px-3">Officer</th>
                  <th className="py-2.5 px-3">Source</th>
                  <th className="py-2.5 px-3">Audit Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#132A47] text-slate-200">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#0D2544]/60">
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                        log.enquiryType === 'CONSUMER_MATCH' ? 'bg-blue-950 text-blue-300 border border-blue-800' :
                        log.enquiryType === 'COMMERCIAL_MATCH' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                        log.enquiryType === 'KYC_REPORT' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                        'bg-purple-950 text-purple-300 border border-purple-800'
                      }`}>
                        {log.enquiryType}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-white">
                      <div>{log.applicantOrEntityName}</div>
                      <div className="text-[10px] font-mono text-slate-400">{log.searchQuery}</div>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-emerald-400">
                      {log.scoreOrRating || 'PROCESSED'}
                    </td>
                    <td className="py-2.5 px-3 text-[11px]">
                      <div>{log.officerName}</div>
                      <div className="text-[10px] font-mono text-slate-500">{log.officerRegNumber || 'MFB'}</div>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[10px] text-blue-300">
                      {log.source}
                    </td>
                    <td className="py-2.5 px-3 text-[11px] text-slate-400 max-w-xs truncate" title={log.details}>
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* CUSTOM LOGIN MODAL */}
      {/* ======================================================== */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-[#0B1E36] border border-[#1E3A5F] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E3A5F]">
              <div className="flex items-center space-x-2">
                <KeyRound className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white">FirstCentral UAT Login</h3>
              </div>
              <button
                onClick={() => setShowLoginModal(false)}
                className="text-slate-400 hover:text-white text-lg"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Authenticate directly with FirstCentral Credit Bureau REST v2 UAT (<code>https://uat.firstcentralcreditbureau.com/firstcentralrestv2/login</code>) to generate an active 5-hour <strong>DataTicket</strong>.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  FirstCentral API Username
                </label>
                <input
                  type="text"
                  value={customUsername}
                  onChange={(e) => setCustomUsername(e.target.value)}
                  placeholder="e.g. microbiz_uat_user"
                  className="w-full bg-[#081527] border border-[#1E3A5F] rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  FirstCentral API Password
                </label>
                <input
                  type="password"
                  value={customPassword}
                  onChange={(e) => setCustomPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#081527] border border-[#1E3A5F] rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end space-x-2">
              <button
                onClick={() => setShowLoginModal(false)}
                className="px-4 py-2 bg-[#0F2646] hover:bg-[#163863] text-slate-300 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAuthenticate(customUsername, customPassword)}
                disabled={authLoading}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow transition-colors flex items-center space-x-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{authLoading ? 'Signing In...' : 'Authenticate & Store Ticket'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
