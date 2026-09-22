import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ArrowRight, 
  Layers, 
  FileText, 
  CreditCard,
  Send,
  Building,
  Home,
  Truck,
  Sprout,
  Store,
  Users,
  ShieldCheck,
  Compass,
  Award,
  Hash,
  Sparkles,
  PieChart,
  FileSignature
} from 'lucide-react';
import { LoanApplication, LoanType, MicrobizChannel } from '../types';
import { formatCurrency } from '../utils/crypto';
import { MICROBIZ_CHANNELS, getOfficerByRegistration } from '../utils/channels';
import { 
  LOAN_DISCHARGE_STAGES, 
  LoanDischargeStage, 
  getLoanDischargeStage, 
  getStageConfig, 
  getStageChecklistStatus 
} from '../utils/loanDischarge';

interface LoanOfficerQueueProps {
  loans: LoanApplication[];
  onSelectLoan: (loan: LoanApplication) => void;
  onDisburseLoan: (loan: LoanApplication) => void;
  selectedChannelFilter?: MicrobizChannel | 'ALL';
  onChannelFilterChange?: (channel: MicrobizChannel | 'ALL') => void;
}

export const LoanOfficerQueue: React.FC<LoanOfficerQueueProps> = ({
  loans,
  onSelectLoan,
  onDisburseLoan,
  selectedChannelFilter = 'ALL',
  onChannelFilterChange
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState<LoanDischargeStage | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OFFICER_REVIEW' | 'APPROVED' | 'DISBURSED' | 'SUBMITTED'>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [localChannelFilter, setLocalChannelFilter] = useState<MicrobizChannel | 'ALL'>(selectedChannelFilter);

  // Sync with prop if it changes
  const activeChannel = onChannelFilterChange ? selectedChannelFilter : localChannelFilter;
  const handleSetChannel = (ch: MicrobizChannel | 'ALL') => {
    setLocalChannelFilter(ch);
    if (onChannelFilterChange) onChannelFilterChange(ch);
  };

  const filteredLoans = loans.filter(loan => {
    const matchesSearch = 
      loan.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (loan.businessName && loan.businessName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      loan.bvn.includes(searchTerm) ||
      (loan.channelTracingRef && loan.channelTracingRef.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (loan.officerRegistrationNumber && loan.officerRegistrationNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (loan.channel && loan.channel.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = 
      statusFilter === 'ALL' ? true :
      statusFilter === 'OFFICER_REVIEW' ? (loan.status === 'OFFICER_REVIEW' || loan.status === 'CREDIT_EVALUATED') :
      loan.status === statusFilter;

    const loanStage = getLoanDischargeStage(loan);
    const matchesStage = stageFilter === 'ALL' ? true : loanStage === stageFilter;

    const matchesType = typeFilter === 'ALL' ? true : loan.loanType === typeFilter;

    const matchesChannel = 
      activeChannel === 'ALL' ? true :
      loan.channel === activeChannel;

    return matchesSearch && matchesStatus && matchesStage && matchesType && matchesChannel;
  });

  const getLoanIcon = (type: LoanType) => {
    switch(type) {
      case 'SABI_TRADER':
        return <Store className="w-4 h-4 text-blue-400" />;
      case 'BETTABIZ_SME':
        return <Building className="w-4 h-4 text-blue-300" />;
      case 'MINIMONIE_GROUP':
        return <Users className="w-4 h-4 text-blue-400" />;
      case 'MICRO_MORTGAGE':
        return <Home className="w-4 h-4 text-blue-300" />;
      case 'EQUIPMENT_FINANCE':
        return <Truck className="w-4 h-4 text-blue-400" />;
      case 'AGRO_LOAN':
        return <Sprout className="w-4 h-4 text-blue-300" />;
      default:
        return <Building className="w-4 h-4 text-blue-400" />;
    }
  };

  const getLoanTypeLabel = (type: LoanType) => {
    switch(type) {
      case 'SABI_TRADER': return 'SabiTrader (Market)';
      case 'BETTABIZ_SME': return 'Bettabiz SME';
      case 'MINIMONIE_GROUP': return 'Minimonie Group';
      case 'MICRO_MORTGAGE': return 'Micro-Mortgage';
      case 'EQUIPMENT_FINANCE': return 'Equipment Asset';
      case 'AGRO_LOAN': return 'Agro-Micro';
      default: return 'SME Working Capital';
    }
  };

  const getScoreBadge = (score?: number) => {
    if (!score) return <span className="text-slate-500 text-xs">Unscored</span>;
    if (score >= 750) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-900 text-white border border-blue-400">
          {score} • Prime (AAA)
        </span>
      );
    }
    if (score >= 680) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-950 text-blue-200 border border-blue-600">
          {score} • Low Risk (A)
        </span>
      );
    }
    if (score >= 600) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-[#0B1E36] text-blue-300 border border-[#1E3A5F]">
          {score} • Moderate (BBB)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-[#081528] text-slate-400 border border-slate-700">
        {score} • High Risk (Subprime)
      </span>
    );
  };

  const getStageBadge = (loan: LoanApplication) => {
    const stage = getLoanDischargeStage(loan);
    const config = getStageConfig(stage);
    const checklist = getStageChecklistStatus(loan, stage);

    return (
      <div className="space-y-1">
        <div className="flex items-center space-x-1.5">
          <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center font-mono">
            {config.stepNumber}
          </span>
          <span className="font-semibold text-white text-xs">
            {config.title}
          </span>
        </div>

        {/* 4-Step Mini Progress Dots */}
        <div className="flex items-center space-x-1 pt-0.5">
          {[1, 2, 3, 4].map((step) => {
            const isCompleted = step < config.stepNumber || (config.stepNumber === 4 && loan.status === 'DISBURSED');
            const isCurrent = step === config.stepNumber;
            return (
              <div
                key={step}
                className={`h-1.5 rounded-full transition-all ${
                  isCompleted 
                    ? 'w-4 bg-blue-400' 
                    : isCurrent 
                    ? 'w-5 bg-blue-500 ring-1 ring-blue-300' 
                    : 'w-3 bg-slate-700'
                }`}
                title={`Stage ${step}`}
              />
            );
          })}
          <span className="text-[10px] font-mono text-blue-300 ml-1">
            {checklist.completedItems}/{checklist.totalItems}
          </span>
        </div>
      </div>
    );
  };

  const getStatusBadge = (loan: LoanApplication) => {
    const approvedCount = loan.approvalChain ? loan.approvalChain.filter(s => s.status === 'APPROVED').length : 0;
    
    if (loan.status === 'DISBURSED') {
      return (
        <div className="space-y-1">
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-950 text-blue-200 border border-blue-500">
            <CheckCircle2 className="w-3 h-3 text-blue-400" />
            <span>Disbursed & Active</span>
          </span>
          <div className="text-[10px] font-mono text-blue-300">
            7/7 Approvals Complete
          </div>
        </div>
      );
    }

    if (loan.status === 'APPROVED') {
      return (
        <div className="space-y-1">
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-900 text-white border border-blue-400">
            <CheckCircle2 className="w-3 h-3 text-blue-300" />
            <span>MD Sanctioned (7/7)</span>
          </span>
          <div className="text-[10px] text-blue-300 font-semibold">
            Ready for Disbursal
          </div>
        </div>
      );
    }

    if (loan.status === 'OFFICER_REVIEW' || loan.status === 'CREDIT_EVALUATED') {
      const pendingSignoff = loan.approvalChain?.find(s => s.status === 'IN_REVIEW' || s.status === 'PENDING');
      return (
        <div className="space-y-1">
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-950 text-blue-300 border border-blue-600">
            <Clock className="w-3 h-3 text-blue-400 animate-spin" />
            <span>Tier {approvedCount + 1}/7 Review</span>
          </span>
          <div className="text-[10px] text-slate-400 truncate max-w-[130px]">
            {pendingSignoff?.roleTitle || 'Approval Line Active'}
          </div>
        </div>
      );
    }

    if (loan.status === 'REJECTED') {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#081528] text-slate-400 border border-slate-700">
          <AlertTriangle className="w-3 h-3" />
          <span>Declined</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#091527] text-slate-300 border border-[#1E3A5F]">
        <Clock className="w-3 h-3 text-slate-400" />
        <span>Intake Received</span>
      </span>
    );
  };

  const getChannelDisplay = (channel?: MicrobizChannel, tracingRef?: string, officerReg?: string) => {
    if (!channel) {
      return (
        <span className="text-[11px] text-slate-500 italic">Unassigned Platform</span>
      );
    }
    const meta = MICROBIZ_CHANNELS[channel];
    return (
      <div className="space-y-1">
        <div className="flex items-center space-x-1.5">
          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${meta.badgeClass}`}>
            {meta.code}
          </span>
          <span className="font-semibold text-slate-200 text-[11px] truncate max-w-[130px]" title={meta.name}>
            {meta.name}
          </span>
        </div>
        {tracingRef && (
          <div className="flex items-center space-x-1 text-[10px] text-blue-300 font-mono">
            <Hash className="w-2.5 h-2.5 text-blue-400" />
            <span>{tracingRef}</span>
          </div>
        )}
        {officerReg && (
          <div className="flex items-center space-x-1 text-[10px] text-slate-400 font-mono">
            <Award className="w-2.5 h-2.5 text-blue-400" />
            <span>{officerReg}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-[#0B1E36] border border-[#1E3A5F] rounded-2xl shadow-xl overflow-hidden">
      
      {/* 4-STAGE LOAN DISCHARGING LIFECYCLE SUMMARY BANNER */}
      <div className="p-4 bg-[#081528] border-b border-[#1E3A5F]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-400">
              Microbiz End-to-End Loan Discharging Architecture
            </span>
            <h3 className="text-sm font-bold text-white">4-Stage Discharging Pipeline Flow</h3>
          </div>
          <button
            onClick={() => setStageFilter('ALL')}
            className={`text-xs px-2.5 py-1 rounded-lg border font-mono transition-all ${
              stageFilter === 'ALL'
                ? 'bg-blue-600 text-white border-blue-400'
                : 'bg-[#0B1E36] text-slate-400 border-[#1E3A5F] hover:text-white'
            }`}
          >
            Show All ({loans.length})
          </button>
        </div>

        {/* 4 Clickable Stage Selector Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {LOAN_DISCHARGE_STAGES.map((st) => {
            const count = loans.filter(l => getLoanDischargeStage(l) === st.id).length;
            const isSelected = stageFilter === st.id;

            return (
              <button
                key={st.id}
                onClick={() => setStageFilter(isSelected ? 'ALL' : st.id)}
                className={`p-3 rounded-xl border text-left transition-all relative ${
                  isSelected
                    ? 'bg-blue-600/30 border-blue-400 text-white shadow-md ring-1 ring-blue-500/40'
                    : 'bg-[#0B1E36] hover:bg-[#0F2440] border-[#1E3A5F] text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center font-mono">
                    {st.stepNumber}
                  </span>
                  <span className="text-xs font-mono font-bold text-blue-300 bg-[#071529] px-2 py-0.5 rounded border border-[#1E3A5F]">
                    {count}
                  </span>
                </div>
                <div className="font-bold text-xs truncate text-white">{st.title}</div>
                <div className="text-[10px] text-blue-300/80 truncate mt-0.5">{st.subtitle}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* FINCORE Queue Header & Filter Toolbar */}
      <div className="p-5 border-b border-[#1E3A5F] bg-[#091527]/70 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider">
                FINCORE™ Core Banking Module
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs text-slate-400">Section: Credit Origination & Channel Tracing Desk</span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">Active Underwriting & Channel Disbursal Queue</h2>
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono">
            <span className="px-2.5 py-1 rounded-lg bg-[#0B1E36] border border-[#1E3A5F] text-slate-300">
              Filtered: <strong className="text-white">{filteredLoans.length}</strong> of {loans.length}
            </span>
          </div>
        </div>

        {/* Filter Controls Row 1: Search, Status, Type */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by borrower, channel tracing ref, officer reg, BVN..."
              className="w-full bg-[#0B1E36] border border-[#1E3A5F] text-slate-200 text-xs pl-9 pr-3 py-2 rounded-xl focus:outline-none focus:border-blue-500 font-sans"
            />
          </div>

          {/* Status Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 text-xs">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                statusFilter === 'ALL' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white hover:bg-[#0F2440]'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('OFFICER_REVIEW')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center space-x-1 ${
                statusFilter === 'OFFICER_REVIEW' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white hover:bg-[#0F2440]'
              }`}
            >
              <Clock className="w-3 h-3 text-blue-400" />
              <span>Needs Action</span>
            </button>
            <button
              onClick={() => setStatusFilter('APPROVED')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                statusFilter === 'APPROVED' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white hover:bg-[#0F2440]'
              }`}
            >
              Sanctioned
            </button>
            <button
              onClick={() => setStatusFilter('DISBURSED')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                statusFilter === 'DISBURSED' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white hover:bg-[#0F2440]'
              }`}
            >
              Disbursed
            </button>
          </div>

          {/* Facility Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-[#0B1E36] border border-[#1E3A5F] text-slate-300 rounded-xl text-xs py-2 px-3 focus:outline-none focus:border-blue-500 font-medium cursor-pointer"
          >
            <option value="ALL">All Microbiz Facilities</option>
            <option value="SABI_TRADER">SabiTrader (Market Stall)</option>
            <option value="BETTABIZ_SME">Bettabiz SME</option>
            <option value="MINIMONIE_GROUP">Minimonie Group</option>
            <option value="MICRO_MORTGAGE">Micro-Mortgage</option>
            <option value="SME_WORKING_CAPITAL">SME Working Capital</option>
            <option value="EQUIPMENT_FINANCE">Equipment Finance</option>
            <option value="AGRO_LOAN">Agro-Micro</option>
          </select>

        </div>

        {/* Filter Controls Row 2: Microbiz Group Platform Channels Filter Strip */}
        <div className="pt-2 border-t border-[#1E3A5F]/60 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center space-x-2 text-slate-400">
            <Compass className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-semibold text-slate-300">Filter By Origination Platform:</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => handleSetChannel('ALL')}
              className={`px-2.5 py-1 rounded-lg text-xs transition-all ${
                activeChannel === 'ALL'
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'bg-[#0B1E36] text-slate-400 hover:text-white border border-[#1E3A5F]'
              }`}
            >
              All Channels ({loans.length})
            </button>
            <button
              onClick={() => handleSetChannel('MICROBIZ_INCLUSION_CENTRE')}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs border transition-all ${
                activeChannel === 'MICROBIZ_INCLUSION_CENTRE'
                  ? 'bg-blue-800 text-white border-blue-400 font-semibold'
                  : 'bg-[#0B1E36] text-blue-200 border-[#1E3A5F] hover:border-blue-400/40'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-300"></span>
              <span>Microbiz Inclusion Centre</span>
              <span className="font-mono text-[10px] text-blue-300">
                ({loans.filter(l => l.channel === 'MICROBIZ_INCLUSION_CENTRE').length})
              </span>
            </button>
            <button
              onClick={() => handleSetChannel('MICROBIZ_MFB')}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs border transition-all ${
                activeChannel === 'MICROBIZ_MFB'
                  ? 'bg-blue-800 text-white border-blue-400 font-semibold'
                  : 'bg-[#0B1E36] text-blue-200 border-[#1E3A5F] hover:border-blue-400/40'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
              <span>Microbiz MFB</span>
              <span className="font-mono text-[10px] text-blue-300">
                ({loans.filter(l => l.channel === 'MICROBIZ_MFB').length})
              </span>
            </button>
            <button
              onClick={() => handleSetChannel('PEAK_EMPOWERMENT_CENTRE')}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs border transition-all ${
                activeChannel === 'PEAK_EMPOWERMENT_CENTRE'
                  ? 'bg-blue-800 text-white border-blue-400 font-semibold'
                  : 'bg-[#0B1E36] text-blue-200 border-[#1E3A5F] hover:border-blue-400/40'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-200"></span>
              <span>Peak Empowerment Centre</span>
              <span className="font-mono text-[10px] text-blue-300">
                ({loans.filter(l => l.channel === 'PEAK_EMPOWERMENT_CENTRE').length})
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Queue Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#1E3A5F] bg-[#091527] text-[10px] uppercase tracking-wider text-slate-400">
              <th className="py-3 px-4 font-semibold">Facility & Applicant</th>
              <th className="py-3 px-4 font-semibold">Platform & Tracing Ref</th>
              <th className="py-3 px-4 font-semibold">Discharging Stage</th>
              <th className="py-3 px-4 font-semibold">Amount & Tenure</th>
              <th className="py-3 px-4 font-semibold">Credit Score</th>
              <th className="py-3 px-4 font-semibold">Blockchain Proof</th>
              <th className="py-3 px-4 font-semibold">Status</th>
              <th className="py-3 px-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E3A5F]/60 text-xs">
            {filteredLoans.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-slate-500">
                  No loan applications found matching criteria.
                </td>
              </tr>
            ) : (
              filteredLoans.map((loan) => (
                <tr 
                  key={loan.id}
                  className="hover:bg-blue-950/20 transition-colors group cursor-pointer"
                  onClick={() => onSelectLoan(loan)}
                >
                  
                  {/* Facility & Applicant */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-[#091527] border border-[#1E3A5F] flex items-center justify-center flex-shrink-0 mt-0.5">
                        {getLoanIcon(loan.loanType)}
                      </div>
                      <div>
                        <div className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                          {loan.applicantName}
                        </div>
                        <div className="text-slate-400 text-[11px] flex items-center gap-1.5">
                          <span className="font-mono text-blue-300">{loan.id}</span>
                          <span>•</span>
                          <span>{getLoanTypeLabel(loan.loanType)}</span>
                        </div>
                        {loan.businessName && (
                          <div className="text-[11px] text-slate-400 truncate max-w-[180px]">
                            {loan.businessName}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Platform & Tracing Ref */}
                  <td className="py-3.5 px-4">
                    {getChannelDisplay(loan.channel, loan.channelTracingRef, loan.officerRegistrationNumber)}
                  </td>

                  {/* 4-Stage Discharging Status */}
                  <td className="py-3.5 px-4">
                    {getStageBadge(loan)}
                  </td>

                  {/* Amount & Tenure */}
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-white tracking-tight font-mono">
                      {formatCurrency(loan.amount)}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {loan.tenureMonths} mos @ 5.0%/mo
                    </div>
                    <div className="text-[10px] text-blue-300">
                      DTI: {loan.dti || 24}%
                    </div>
                  </td>

                  {/* Credit Bureau Score */}
                  <td className="py-3.5 px-4">
                    <div className="space-y-1">
                      {getScoreBadge(loan.creditScore)}
                      <div className="text-[10px] text-slate-400">
                        CRC + FirstCentral
                      </div>
                    </div>
                  </td>

                  {/* Blockchain Ledger Proof */}
                  <td className="py-3.5 px-4">
                    {loan.blockchainTx ? (
                      <div className="space-y-0.5 font-mono text-[10px]">
                        <div className="text-blue-400 flex items-center space-x-1">
                          <Layers className="w-3 h-3" />
                          <span>Block #{loan.blockchainTx.blockIndex}</span>
                        </div>
                        <div className="text-slate-400 truncate max-w-[120px]">
                          {loan.blockchainTx.hash.slice(0, 10)}...{loan.blockchainTx.hash.slice(-6)}
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-500 text-[11px] font-mono">
                        Not Anchored
                      </span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    {getStatusBadge(loan)}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      {loan.status === 'APPROVED' ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDisburseLoan(loan);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all flex items-center space-x-1 shadow-md shadow-blue-600/30"
                        >
                          <Send className="w-3 h-3" />
                          <span>Disburse</span>
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectLoan(loan);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[#0F2440] hover:bg-[#1A3B66] text-blue-300 hover:text-white font-medium text-xs border border-[#1E3A5F] transition-all flex items-center space-x-1"
                        >
                          <span>Review</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer with Summary Stats */}
      <div className="p-4 border-t border-[#1E3A5F] bg-[#091527] flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
        <div className="flex items-center space-x-4">
          <span>Active Facilities: <strong className="text-white">{filteredLoans.length}</strong></span>
          <span>•</span>
          <span>Total Capital: <strong className="text-white font-mono">{formatCurrency(filteredLoans.reduce((sum, l) => sum + l.amount, 0))}</strong></span>
        </div>
        <div className="flex items-center space-x-2 text-[11px]">
          <span className="w-2 h-2 rounded-full bg-blue-400"></span>
          <span>Core CBS Switch: Operational</span>
        </div>
      </div>

    </div>
  );
};
