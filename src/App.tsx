import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Layers, 
  Database, 
  FileText, 
  PlusCircle, 
  CheckCircle2, 
  ShieldCheck, 
  Smartphone,
  Cpu,
  RefreshCw,
  ExternalLink,
  Sparkles,
  Users,
  Store,
  Terminal,
  ShieldAlert,
  AlertTriangle
} from 'lucide-react';
import { LoanApplication, BlockchainBlock, CBSTransaction, FieldMarketer, MicrobizChannel, CreditOfficerRegistration, ApprovalLevel, RemediationPlan } from './types';
import { INITIAL_LOANS, INITIAL_BLOCKS, INITIAL_CBS_TRANSACTIONS, INITIAL_MARKETERS } from './data/mockData';
import { REGISTERED_CREDIT_OFFICERS } from './utils/channels';
import { 
  generateDefaultApprovalChain, 
  createAuditTrailEvent, 
  getNextApprovalLevel, 
  APPROVAL_HIERARCHY_LEVELS, 
  formatExactDateTime 
} from './utils/approvalHierarchy';
import { Header } from './components/Header';
import { DashboardAnalytics } from './components/DashboardAnalytics';
import { LoanOfficerQueue } from './components/LoanOfficerQueue';
import { LoanDetailModal } from './components/LoanDetailModal';
import { LoanDischargingPipeline } from './components/LoanDischargingPipeline';
import { LoanMonitoringDashboard } from './components/LoanMonitoringDashboard';
import { BlockchainExplorer } from './components/BlockchainExplorer';
import { CoreBankingConsole } from './components/CoreBankingConsole';
import { WalkInCustomerDesk } from './components/WalkInCustomerDesk';
import { MicrobizPortalCaseStudy } from './components/MicrobizPortalCaseStudy';
import { MarketersFieldDesk } from './components/MarketersFieldDesk';
import { PythonCoreConsole } from './components/PythonCoreConsole';
import { sha256 } from './utils/crypto';
import { LoanDischargeStage, getNextStage } from './utils/loanDischarge';

export default function App() {
  const [loans, setLoans] = useState<LoanApplication[]>(INITIAL_LOANS);
  const [blocks, setBlocks] = useState<BlockchainBlock[]>(INITIAL_BLOCKS);
  const [cbsTransactions, setCbsTransactions] = useState<CBSTransaction[]>(INITIAL_CBS_TRANSACTIONS);
  const [marketers, setMarketers] = useState<FieldMarketer[]>(INITIAL_MARKETERS);
  const [selectedBranch, setSelectedBranch] = useState<string>('Abuja Main - New Mpape (BR-001)');
  const [selectedChannelFilter, setSelectedChannelFilter] = useState<MicrobizChannel | 'ALL'>('ALL');
  const [currentOfficer, setCurrentOfficer] = useState<CreditOfficerRegistration>(REGISTERED_CREDIT_OFFICERS[0]);
  
  const [currentView, setCurrentView] = useState<'walkin' | 'officer' | 'casestudy'>('officer');
  const [officerTab, setOfficerTab] = useState<'monitoring' | 'pipeline' | 'queue' | 'analytics' | 'cbs' | 'blockchain' | 'marketers' | 'python'>('monitoring');
  const [selectedLoan, setSelectedLoan] = useState<LoanApplication | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Show temporary toast notification
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Fetch initial state from server if available
  useEffect(() => {
    fetch('/api/blockchain/blocks')
      .then(res => res.json())
      .then(data => {
        if (data.blocks && data.blocks.length > 0) {
          setBlocks(data.blocks);
        }
      })
      .catch(err => console.log('Using local blockchain ledger:', err));

    fetch('/api/cbs/transactions')
      .then(res => res.json())
      .then(data => {
        if (data.transactions && data.transactions.length > 0) {
          setCbsTransactions(data.transactions);
        }
      })
      .catch(err => console.log('Using local CBS ledger:', err));
  }, []);

  // Handle Delinquency Remediation Action
  const handleUpdateLoanRemediation = (loanId: string, updatedPlan: RemediationPlan, actionDesc: string) => {
    const targetLoan = loans.find(l => l.id === loanId);
    if (!targetLoan) return;

    const nowIso = new Date().toISOString();
    const newAuditEvent = createAuditTrailEvent(
      'DELINQUENCY_REMEDIATION',
      'REMEDIATION_PLAN_UPDATED',
      currentOfficer.officerName,
      currentOfficer.role,
      'SUCCESS',
      actionDesc,
      currentOfficer.registrationNumber
    );

    const updated: LoanApplication = {
      ...targetLoan,
      remediationPlan: updatedPlan,
      updatedAt: nowIso,
      auditTrail: [...(targetLoan.auditTrail || []), newAuditEvent]
    };

    setLoans(prev => prev.map(l => l.id === loanId ? updated : l));
    if (selectedLoan && selectedLoan.id === loanId) {
      setSelectedLoan(updated);
    }
    showToast(`Remediation executed for ${loanId}: ${updatedPlan.status.replace(/_/g, ' ')}`);
  };

  // Advance Loan Discharging Stage (1. Application -> 2. Analysis -> 3. Documentation -> 4. Disbursement)
  const handleAdvanceLoanStage = (loanId: string, nextStage: LoanDischargeStage) => {
    const targetLoan = loans.find(l => l.id === loanId);
    if (!targetLoan) return;

    const nowIso = new Date().toISOString();
    let newStatus = targetLoan.status;
    let actionDesc = '';

    if (nextStage === 'ANALYSIS') {
      newStatus = 'OFFICER_REVIEW';
      actionDesc = 'Advanced to Stage 2: Loan Analysis (Underwriting & Credit Scoring)';
    } else if (nextStage === 'DOCUMENTATION') {
      newStatus = 'CREDIT_EVALUATED';
      actionDesc = 'Advanced to Stage 3: Loan Documentation (Physical Sighting & Legal Verification)';
    } else if (nextStage === 'DISBURSEMENT') {
      newStatus = 'APPROVED';
      actionDesc = 'Advanced to Stage 4: Loan Disbursement (7/7 Approvals Completed & Disbursal Ready)';
    }

    const newAuditEvent = createAuditTrailEvent(
      `4-Stage Pipeline: ${nextStage}`,
      'STAGE_ADVANCED',
      currentOfficer.officerName,
      currentOfficer.role,
      'SUCCESS',
      actionDesc,
      currentOfficer.registrationNumber
    );

    const updated: LoanApplication = {
      ...targetLoan,
      status: newStatus,
      updatedAt: nowIso,
      auditTrail: [...(targetLoan.auditTrail || []), newAuditEvent]
    };

    setLoans(prev => prev.map(l => l.id === loanId ? updated : l));
    if (selectedLoan && selectedLoan.id === loanId) {
      setSelectedLoan(updated);
    }
    showToast(`${targetLoan.id}: ${actionDesc}`);
  };

  // Handle Sanction & Blockchain Anchor
  const handleApproveLoan = async (loanId: string, notes: string) => {
    const targetLoan = loans.find(l => l.id === loanId);
    if (!targetLoan) return;

    const previousBlock = blocks[blocks.length - 1];
    const newIndex = previousBlock.index + 1;
    const timestamp = new Date().toISOString();
    const nonce = Math.floor(Math.random() * 10000);

    const blockData = {
      loanId: targetLoan.id,
      applicantName: targetLoan.applicantName,
      amount: targetLoan.amount,
      action: `${targetLoan.loanType}_SANCTIONED`,
      officerId: 'OFF-3392',
      creditScore: targetLoan.creditScore || 750,
      docHash: targetLoan.documents[0]?.hash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      signatureFingerprint: targetLoan.signature?.keyFingerprint || 'sig_ed25519_sanction'
    };

    const hashInput = `${newIndex}-${previousBlock.hash}-${timestamp}-${JSON.stringify(blockData)}-${nonce}`;
    const rawHash = await sha256(hashInput);
    const newHash = `0000${rawHash.slice(4)}`;

    const newBlock: BlockchainBlock = {
      index: newIndex,
      timestamp,
      previousHash: previousBlock.hash,
      hash: newHash,
      data: blockData,
      nonce,
      validator: 'Microbiz-Consortium-Node-01'
    };

    const updatedLoan: LoanApplication = {
      ...targetLoan,
      status: 'APPROVED',
      updatedAt: timestamp,
      blockchainTx: {
        blockIndex: newIndex,
        hash: newHash,
        timestamp,
        status: 'CONFIRMED'
      },
      officerDecision: {
        decision: 'APPROVED',
        officerId: 'OFF-3392',
        officerName: 'Folasade Adebayo (Head of Credit)',
        notes,
        covenants: [
          'Direct debit mandate active on customer primary account',
          'Registration of Tripartite Deed of Legal Mortgage within 30 days'
        ],
        timestamp
      }
    };

    setLoans(prev => prev.map(l => l.id === loanId ? updatedLoan : l));
    setBlocks(prev => [...prev, newBlock]);
    if (selectedLoan && selectedLoan.id === loanId) {
      setSelectedLoan(updatedLoan);
    }

    // Try posting to server endpoint
    fetch('/api/blockchain/record', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(blockData)
    }).catch(e => console.log('Local fallback recorded'));

    showToast(`Facility ${loanId} sanctioned and anchored on Blockchain Block #${newIndex}!`);
  };

  // Handle Multi-Tier Approval Workflow
  const handleAdvanceApproval = async (
    level: ApprovalLevel,
    decision: 'APPROVED' | 'REJECTED' | 'QUERIED',
    comments: string,
    signatureDataUrl: string,
    signatoryName: string,
    registrationNumber: string
  ) => {
    if (!selectedLoan) return;

    const currentChain = selectedLoan.approvalChain || generateDefaultApprovalChain(selectedLoan.amount, selectedLoan.applicantName, selectedLoan.channel, selectedLoan.officerRegistrationNumber);
    const currentLevelConfig = APPROVAL_HIERARCHY_LEVELS.find(l => l.level === level);
    const nowIso = new Date().toISOString();
    const formattedDt = formatExactDateTime(nowIso);

    const updatedChain = currentChain.map(signoff => {
      if (signoff.level === level) {
        return {
          ...signoff,
          status: decision,
          signatoryName: signatoryName || signoff.signatoryName,
          signatoryRegistrationNumber: registrationNumber || signoff.signatoryRegistrationNumber,
          comments,
          signatureDataUrl,
          timestamp: nowIso,
          formattedDatetime: formattedDt
        };
      }
      if (decision === 'APPROVED' && currentLevelConfig && signoff.levelOrder === currentLevelConfig.levelOrder + 1 && signoff.status === 'PENDING') {
        return {
          ...signoff,
          status: 'IN_REVIEW' as const
        };
      }
      return signoff;
    });

    const nextLevel = getNextApprovalLevel(level, updatedChain);
    const allApproved = updatedChain.every(s => s.status === 'APPROVED');
    const isRejected = decision === 'REJECTED';

    const newAuditEvent = createAuditTrailEvent(
      currentLevelConfig?.levelOrder === 1 ? 'APPROVAL_TIER_1' :
      currentLevelConfig?.levelOrder === 2 ? 'APPROVAL_TIER_2' :
      currentLevelConfig?.levelOrder === 3 ? 'APPROVAL_TIER_3' :
      currentLevelConfig?.levelOrder === 4 ? 'APPROVAL_TIER_4' :
      currentLevelConfig?.levelOrder === 5 ? 'APPROVAL_TIER_5' :
      currentLevelConfig?.levelOrder === 6 ? 'APPROVAL_TIER_6' : 'APPROVAL_TIER_7',
      decision === 'APPROVED' ? `${currentLevelConfig?.roleTitle} Sign-Off Executed` : `${currentLevelConfig?.roleTitle} Marked as ${decision}`,
      signatoryName,
      currentLevelConfig?.roleTitle || 'Approver',
      decision === 'APPROVED' ? 'SUCCESS' : decision === 'REJECTED' ? 'REJECTED' : 'ACTION_REQUIRED',
      comments,
      registrationNumber
    );

    const updatedAuditTrail = [...(selectedLoan.auditTrail || []), newAuditEvent];

    let newStatus: LoanApplication['status'] = selectedLoan.status;
    if (isRejected) {
      newStatus = 'REJECTED';
    } else if (allApproved) {
      newStatus = 'APPROVED';
    } else {
      newStatus = 'OFFICER_REVIEW';
    }

    let newBlockChainTx = selectedLoan.blockchainTx;
    if (allApproved && !selectedLoan.blockchainTx) {
      const previousBlock = blocks[blocks.length - 1];
      const newIndex = previousBlock.index + 1;
      const nonce = Math.floor(Math.random() * 10000);
      const blockData = {
        loanId: selectedLoan.id,
        applicantName: selectedLoan.applicantName,
        amount: selectedLoan.amount,
        action: 'ALL_7_APPROVAL_LINES_COMPLETED',
        managingDirector: signatoryName,
        mdLicense: registrationNumber,
        timestamp: nowIso
      };
      const hashInput = `${newIndex}-${previousBlock.hash}-${nowIso}-${JSON.stringify(blockData)}-${nonce}`;
      const rawHash = await sha256(hashInput);
      const newHash = `0000${rawHash.slice(4)}`;
      
      const newBlock: BlockchainBlock = {
        index: newIndex,
        timestamp: nowIso,
        previousHash: previousBlock.hash,
        hash: newHash,
        data: blockData,
        nonce,
        validator: 'Microbiz-Governance-Node'
      };
      setBlocks(prev => [...prev, newBlock]);
      newBlockChainTx = {
        blockIndex: newIndex,
        hash: newHash,
        timestamp: nowIso,
        status: 'CONFIRMED'
      };
    }

    const updatedLoan: LoanApplication = {
      ...selectedLoan,
      status: newStatus,
      currentApprovalLevel: nextLevel || (allApproved ? 'MANAGING_DIRECTOR' : level),
      approvalChain: updatedChain,
      auditTrail: updatedAuditTrail,
      blockchainTx: newBlockChainTx,
      updatedAt: nowIso
    };

    setLoans(prev => prev.map(l => l.id === selectedLoan.id ? updatedLoan : l));
    setSelectedLoan(updatedLoan);

    if (allApproved) {
      showToast(`Managing Director signed! All 7 approval tiers completed. Facility ${selectedLoan.id} sanctioned for disbursal.`);
    } else if (decision === 'APPROVED') {
      const nextConfig = APPROVAL_HIERARCHY_LEVELS.find(l => l.level === nextLevel);
      showToast(`Tier ${currentLevelConfig?.levelOrder}/7 (${currentLevelConfig?.roleTitle}) signed! Escalated to ${nextConfig?.roleTitle || 'Next Tier'}.`);
    } else {
      showToast(`Tier ${currentLevelConfig?.levelOrder}/7 marked as ${decision}.`);
    }
  };

  // Handle Reject
  const handleRejectLoan = (loanId: string, reason: string) => {
    setLoans(prev => prev.map(l => l.id === loanId ? {
      ...l,
      status: 'REJECTED',
      updatedAt: new Date().toISOString(),
      officerDecision: {
        decision: 'REJECTED',
        officerId: 'OFF-3392',
        officerName: 'Folasade Adebayo',
        notes: reason,
        timestamp: new Date().toISOString()
      }
    } : l));

    if (selectedLoan && selectedLoan.id === loanId) {
      setSelectedLoan(prev => prev ? { ...prev, status: 'REJECTED' } : null);
    }
    showToast(`Application ${loanId} declined.`);
  };

  // Handle Core Banking Disbursal
  const handleDisburseLoan = async (loan: LoanApplication) => {
    const txId = `CBS-FT-${Math.floor(100000 + Math.random() * 900000)}`;
    const mandateId = `NIBSS-MND-${Math.floor(100000 + Math.random() * 900000)}`;
    const cbsReference = `FT${new Date().getFullYear()}${Math.floor(10000000 + Math.random() * 90000000)}`;

    const newTx: CBSTransaction = {
      txId,
      timestamp: new Date().toISOString(),
      system: 'Temenos T24 / NIBSS Instant Settlement',
      type: 'LOAN_DISBURSEMENT',
      loanId: loan.id,
      accountNumber: loan.bankAccount?.accountNumber || '0194820194',
      accountName: loan.applicantName,
      bankName: 'Microbiz MFB Current Account',
      amount: loan.amount,
      currency: 'NGN',
      glDebitAccount: 'GL-104020-LOANS-RETAIL',
      glCreditAccount: 'GL-200100-CUSTOMER-CURRENT',
      status: 'SETTLED',
      mandateId,
      cbsReference,
      tenureMonths: loan.tenureMonths
    };

    // Add new blockchain block
    const previousBlock = blocks[blocks.length - 1];
    const newIndex = previousBlock.index + 1;
    const timestamp = new Date().toISOString();
    const nonce = Math.floor(Math.random() * 10000);
    const blockData = {
      loanId: loan.id,
      applicantName: loan.applicantName,
      amount: loan.amount,
      action: 'CORE_BANKING_DISBURSED',
      cbsReference,
      mandateId
    };

    const hashInput = `${newIndex}-${previousBlock.hash}-${timestamp}-${JSON.stringify(blockData)}-${nonce}`;
    const rawHash = await sha256(hashInput);
    const newHash = `0000${rawHash.slice(4)}`;

    const newBlock: BlockchainBlock = {
      index: newIndex,
      timestamp,
      previousHash: previousBlock.hash,
      hash: newHash,
      data: blockData,
      nonce,
      validator: 'Microbiz-CBS-Bridge'
    };

    const updatedLoan: LoanApplication = {
      ...loan,
      status: 'DISBURSED',
      updatedAt: timestamp,
      disbursedAt: timestamp,
      cbsReference,
      mandateId,
      blockchainTx: {
        blockIndex: newIndex,
        hash: newHash,
        timestamp,
        status: 'CONFIRMED'
      }
    };

    setLoans(prev => prev.map(l => l.id === loan.id ? updatedLoan : l));
    setCbsTransactions(prev => [newTx, ...prev]);
    setBlocks(prev => [...prev, newBlock]);
    if (selectedLoan && selectedLoan.id === loan.id) {
      setSelectedLoan(updatedLoan);
    }

    showToast(`Disbursal of ₦${loan.amount.toLocaleString()} settled via Temenos T24! Ref: ${cbsReference}`);
  };

  // Handle Marketer Cash Collection
  const handleRecordCollection = (marketerId: string, amount: number) => {
    setMarketers(prev => prev.map(m => {
      if (m.id === marketerId) {
        return {
          ...m,
          dailyCollectionsActual: m.dailyCollectionsActual + amount,
          lastPing: 'Just now'
        };
      }
      return m;
    }));

    // Post to CBS General Ledger
    const targetMarketer = marketers.find(m => m.id === marketerId);
    const txId = `CBS-COL-${Math.floor(100000 + Math.random() * 900000)}`;
    const newTx: CBSTransaction = {
      txId,
      timestamp: new Date().toISOString(),
      system: 'FINCORE™ Field Collections Gateway / NIP Switch',
      type: 'FIELD_CASH_REMITTANCE',
      loanId: 'MARKET-COLLECTION',
      accountNumber: 'GL-101010-BRANCH-VAULT',
      accountName: `Vault Cash - ${selectedBranch}`,
      bankName: 'Microbiz MFB Central Vault',
      amount,
      currency: 'NGN',
      glDebitAccount: 'GL-101010-BRANCH-VAULT',
      glCreditAccount: 'GL-200300-FIELD-AGENT-SUSPENSE',
      status: 'SETTLED',
      mandateId: `POS-MND-${targetMarketer?.activeTerminalId || '001'}`,
      cbsReference: `VR26${Math.floor(10000000 + Math.random() * 90000000)}`
    };
    setCbsTransactions(prev => [newTx, ...prev]);
    showToast(`Remittance of ₦${amount.toLocaleString()} posted to Branch Vault GL!`);
  };

  // Handle New Application from Borrower Mobile App
  const handleNewApplication = (newLoan: LoanApplication) => {
    setLoans(prev => [newLoan, ...prev]);
    if (newLoan.blockchainTx) {
      const prevBlock = blocks[blocks.length - 1];
      const newIndex = prevBlock.index + 1;
      const newBlock: BlockchainBlock = {
        index: newIndex,
        timestamp: newLoan.blockchainTx.timestamp,
        previousHash: prevBlock.hash,
        hash: newLoan.blockchainTx.hash,
        data: {
          loanId: newLoan.id,
          applicantName: newLoan.applicantName,
          amount: newLoan.amount,
          action: 'MOBILE_APPLICATION_PRE_SANCTIONED',
          creditScore: newLoan.creditScore,
          docHash: newLoan.documents[0]?.hash,
          signatureFingerprint: newLoan.signature?.keyFingerprint
        },
        nonce: Math.floor(Math.random() * 10000),
        validator: 'Microbiz-Mobile-Consortium'
      };
      setBlocks(prev => [...prev, newBlock]);
    }
    showToast(`New application ${newLoan.id} received from Microbiz Pocket mobile!`);
  };

  return (
    <div className="min-h-screen bg-[#07111E] text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      
      {/* Top Navigation Header (Fincore Global Header) */}
      <Header
        currentView={currentView}
        setCurrentView={setCurrentView}
        loanCount={loans.length}
        blockCount={blocks.length}
        selectedBranch={selectedBranch}
        onBranchChange={(b) => {
          setSelectedBranch(b);
          showToast(`Active Branch switched to ${b}`);
        }}
        selectedChannelFilter={selectedChannelFilter}
        onChannelFilterChange={(ch) => {
          setSelectedChannelFilter(ch);
          if (ch !== 'ALL') showToast(`Filtered by ${ch.replace(/_/g, ' ')}`);
        }}
        currentOfficer={currentOfficer}
        onOfficerChange={(off) => {
          setCurrentOfficer(off);
          showToast(`Active Credit Officer: ${off.officerName} (${off.registrationNumber})`);
        }}
        channelLoanCounts={{
          MICROBIZ_INCLUSION_CENTRE: loans.filter(l => l.channel === 'MICROBIZ_INCLUSION_CENTRE').length,
          MICROBIZ_MFB: loans.filter(l => l.channel === 'MICROBIZ_MFB').length,
          PEAK_EMPOWERMENT_CENTRE: loans.filter(l => l.channel === 'PEAK_EMPOWERMENT_CENTRE').length
        }}
      />

      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-5 fade-in duration-200">
          <div className="flex items-center space-x-2 bg-[#0C2445] border border-blue-500/80 text-white px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* VIEW 0: MICROBIZMFB.COM LIVE WEB PORTAL & UI CASE STUDY */}
        {currentView === 'casestudy' && (
          <MicrobizPortalCaseStudy
            onLaunchOfficerCockpit={() => setCurrentView('officer')}
            onLaunchWalkInDesk={() => setCurrentView('walkin')}
          />
        )}

        {/* VIEW 1: FINCORE™ LOAN OFFICER & EXECUTIVE COMMAND CENTER */}
        {currentView === 'officer' && (
          <div className="space-y-6">
            
            {/* Fincore Module Sub-navigation Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1E3A5F] pb-4">
              <div className="flex flex-wrap items-center gap-1.5 bg-[#091527] p-1.5 rounded-xl border border-[#1E3A5F] text-xs font-medium">
                
                <button
                  onClick={() => setOfficerTab('monitoring')}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg transition-all ${
                    officerTab === 'monitoring'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-amber-300 hover:text-white hover:bg-[#0F2440]'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-bold">Monitoring & Surveillance (NPL/PAR)</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-950 text-rose-300 border border-rose-600 font-mono flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse"></span>
                    <span>Live Radar</span>
                  </span>
                </button>

                <button
                  onClick={() => setOfficerTab('pipeline')}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg transition-all ${
                    officerTab === 'pipeline'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-[#0F2440]'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-blue-300" />
                  <span className="font-bold">4-Stage Discharging Pipeline</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-950 text-blue-200 border border-blue-600 font-mono">
                    4 Stages
                  </span>
                </button>

                <button
                  onClick={() => setOfficerTab('queue')}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg transition-all ${
                    officerTab === 'queue'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-[#0F2440]'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Origination Queue</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#07111E] border border-[#1E3A5F] text-slate-300">
                    {loans.length}
                  </span>
                </button>

                <button
                  onClick={() => setOfficerTab('analytics')}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg transition-all ${
                    officerTab === 'analytics'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-[#0F2440]'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Executive Analytics</span>
                </button>

                <button
                  onClick={() => setOfficerTab('cbs')}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg transition-all ${
                    officerTab === 'cbs'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-[#0F2440]'
                  }`}
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>CBS Ledger & Tellers</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                </button>

                <button
                  onClick={() => setOfficerTab('blockchain')}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg transition-all ${
                    officerTab === 'blockchain'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-[#0F2440]'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-blue-400" />
                  <span>Consortium Blockchain</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-950 text-blue-300 border border-blue-700">
                    #{blocks.length - 1}
                  </span>
                </button>

                <button
                  onClick={() => setOfficerTab('marketers')}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg transition-all ${
                    officerTab === 'marketers'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-[#0F2440]'
                  }`}
                >
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                  <span>Marketers & Field Agency</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-950 text-blue-300 border border-blue-700">
                    {marketers.length}
                  </span>
                </button>

                <button
                  onClick={() => setOfficerTab('python')}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg transition-all ${
                    officerTab === 'python'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-blue-300 hover:text-white hover:bg-[#0F2440]'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5 text-blue-400" />
                  <span>Python Core Engine</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-950 text-blue-300 border border-blue-700 font-mono">
                    py 3.10
                  </span>
                </button>

              </div>

              {/* Quick Action Button */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentView('walkin')}
                  className="flex items-center space-x-1.5 px-3 py-2 bg-[#091527] hover:bg-[#0F2440] border border-[#1E3A5F] text-blue-200 hover:text-white rounded-xl text-xs font-semibold transition-colors"
                >
                  <Store className="w-3.5 h-3.5 text-blue-400" />
                  <span>Open Walk-In Customer Desk</span>
                </button>
              </div>
            </div>

            {/* Officer Views */}
            {officerTab === 'monitoring' && (
              <div className="animate-in fade-in duration-200">
                <LoanMonitoringDashboard
                  loans={loans}
                  onSelectLoan={(loan) => setSelectedLoan(loan)}
                  onUpdateLoanRemediation={handleUpdateLoanRemediation}
                />
              </div>
            )}

            {officerTab === 'pipeline' && (
              <div className="animate-in fade-in duration-200">
                <LoanDischargingPipeline
                  loans={loans}
                  onSelectLoan={(loan) => setSelectedLoan(loan)}
                  onDisburseLoan={(loan) => handleDisburseLoan(loan)}
                  onAdvanceStage={(loanId, nextStage) => handleAdvanceLoanStage(loanId, nextStage)}
                />
              </div>
            )}

            {officerTab === 'analytics' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <DashboardAnalytics loans={loans} />
                <LoanOfficerQueue
                  loans={loans}
                  onSelectLoan={(loan) => setSelectedLoan(loan)}
                  onDisburseLoan={(loan) => handleDisburseLoan(loan)}
                  selectedChannelFilter={selectedChannelFilter}
                  onChannelFilterChange={setSelectedChannelFilter}
                />
              </div>
            )}

            {officerTab === 'queue' && (
              <div className="animate-in fade-in duration-200">
                <LoanOfficerQueue
                  loans={loans}
                  onSelectLoan={(loan) => setSelectedLoan(loan)}
                  onDisburseLoan={(loan) => handleDisburseLoan(loan)}
                  selectedChannelFilter={selectedChannelFilter}
                  onChannelFilterChange={setSelectedChannelFilter}
                />
              </div>
            )}

            {officerTab === 'cbs' && (
              <div className="animate-in fade-in duration-200">
                <CoreBankingConsole 
                  transactions={cbsTransactions} 
                  onManualSync={() => showToast('CBS General Ledgers synced with Temenos T24.')}
                />
              </div>
            )}

            {officerTab === 'blockchain' && (
              <div className="animate-in fade-in duration-200">
                <BlockchainExplorer blocks={blocks} />
              </div>
            )}

            {officerTab === 'marketers' && (
              <div className="animate-in fade-in duration-200">
                <MarketersFieldDesk 
                  marketers={marketers}
                  selectedBranch={selectedBranch}
                  onRecordCollection={handleRecordCollection}
                />
              </div>
            )}

            {officerTab === 'python' && (
              <div className="animate-in fade-in duration-200">
                <PythonCoreConsole />
              </div>
            )}

          </div>
        )}

        {/* VIEW 2: WALK-IN CUSTOMER BRANCH COUNTER DESK */}
        {currentView === 'walkin' && (
          <div className="animate-in fade-in duration-200">
            <WalkInCustomerDesk
              branchName={selectedBranch}
              onAddWalkInLoan={(newLoan) => {
                setLoans(prev => [newLoan, ...prev]);
                showToast(`Walk-in customer ${newLoan.applicantName} registered and sanctioned.`);
              }}
              onDisburseWalkInLoan={(loan) => {
                handleDisburseLoan(loan);
              }}
            />
          </div>
        )}

      </main>

      {/* Underwriting Cockpit Modal */}
      {selectedLoan && (
        <LoanDetailModal
          loan={selectedLoan}
          onClose={() => setSelectedLoan(null)}
          onApprove={handleApproveLoan}
          onReject={handleRejectLoan}
          onDisburse={handleDisburseLoan}
          onAdvanceApproval={handleAdvanceApproval}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-[#132B4F] bg-[#060D18] py-4 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            © 2026 Microbiz Microfinance Bank Ltd • FINCORE™ Core Banking & Credit Engine (fincore.microbizmfb.com)
          </div>
          <div className="flex items-center space-x-3 text-[11px]">
            <span className="text-blue-300">CRC Credit Bureau API</span>
            <span>•</span>
            <span className="text-blue-400">Temenos T24 Core CBS</span>
            <span>•</span>
            <span className="text-blue-300">Consortium PoA Blockchain</span>
            <span>•</span>
            <span className="text-blue-200 font-semibold">CBN License: MFB/RC-719401</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
