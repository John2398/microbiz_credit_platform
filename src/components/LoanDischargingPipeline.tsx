import React, { useState } from 'react';
import { 
  FileText, 
  PieChart, 
  FileSignature, 
  Send, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  ChevronRight, 
  Building2, 
  UserCheck, 
  ArrowRight,
  Database,
  Layers,
  Sparkles,
  ExternalLink,
  Award,
  Hash,
  Compass,
  Zap,
  Check,
  Filter,
  Eye
} from 'lucide-react';
import { LoanApplication, MicrobizChannel } from '../types';
import { 
  LOAN_DISCHARGE_STAGES, 
  LoanDischargeStage, 
  getLoanDischargeStage, 
  getStageConfig, 
  getStageProgressPercent,
  getStageChecklistStatus 
} from '../utils/loanDischarge';
import { formatCurrency } from '../utils/crypto';
import { MICROBIZ_CHANNELS } from '../utils/channels';

interface LoanDischargingPipelineProps {
  loans: LoanApplication[];
  onSelectLoan: (loan: LoanApplication) => void;
  onDisburseLoan: (loan: LoanApplication) => void;
  selectedBranch: string;
}

export const LoanDischargingPipeline: React.FC<LoanDischargingPipelineProps> = ({
  loans,
  onSelectLoan,
  onDisburseLoan,
  selectedBranch
}) => {
  const [activeStageFilter, setActiveStageFilter] = useState<LoanDischargeStage | 'ALL'>('ALL');
  const [selectedLoanForPreview, setSelectedLoanForPreview] = useState<LoanApplication | null>(
    loans.length > 0 ? loans[0] : null
  );

  // Group loans by the 4 stages
  const stageCounts: Record<LoanDischargeStage, number> = {
    APPLICATION: loans.filter(l => getLoanDischargeStage(l) === 'APPLICATION').length,
    ANALYSIS: loans.filter(l => getLoanDischargeStage(l) === 'ANALYSIS').length,
    DOCUMENTATION: loans.filter(l => getLoanDischargeStage(l) === 'DOCUMENTATION').length,
    DISBURSEMENT: loans.filter(l => getLoanDischargeStage(l) === 'DISBURSEMENT').length
  };

  const filteredLoans = activeStageFilter === 'ALL'
    ? loans
    : loans.filter(l => getLoanDischargeStage(l) === activeStageFilter);

  const previewLoan = selectedLoanForPreview || (filteredLoans.length > 0 ? filteredLoans[0] : null);
  const currentPreviewStage = previewLoan ? getLoanDischargeStage(previewLoan) : 'APPLICATION';

  const getStageIcon = (stageId: LoanDischargeStage, className = "w-4 h-4") => {
    switch (stageId) {
      case 'APPLICATION': return <FileText className={className} />;
      case 'ANALYSIS': return <PieChart className={className} />;
      case 'DOCUMENTATION': return <FileSignature className={className} />;
      case 'DISBURSEMENT': return <Send className={className} />;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 4-STAGE DISCHARGING PIPELINE HERO BANNER */}
      <div className="bg-[#0B1E36] border border-[#1E3A5F] rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#1E3A5F]/80">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-900/60 text-blue-300 border border-blue-500/40 uppercase tracking-wide">
                4-Stage Loan Discharging Architecture
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-300 font-mono">{selectedBranch}</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1.5 flex items-center space-x-2">
              <span>Standard Loan Discharging Flow</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Microbiz MFB loan origination and settlement operates strictly through 4 sequential regulatory gates: from initial customer intake to CBS vault disbursement.
            </p>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <div className="bg-[#081528] px-3 py-2 rounded-xl border border-[#1E3A5F] text-right">
              <div className="text-[10px] text-slate-400">Total Active Portfolio</div>
              <div className="text-sm font-bold text-white font-mono">{loans.length} Facilities</div>
            </div>
            <div className="bg-[#081528] px-3 py-2 rounded-xl border border-[#1E3A5F] text-right">
              <div className="text-[10px] text-slate-400">Fully Disbursed</div>
              <div className="text-sm font-bold text-blue-300 font-mono">{stageCounts.DISBURSEMENT} Settled</div>
            </div>
          </div>
        </div>

        {/* 4-STAGE SEQUENTIAL PIPELINE STEPPER TABS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-6">
          {LOAN_DISCHARGE_STAGES.map((stage, idx) => {
            const isFilterActive = activeStageFilter === stage.id;
            const count = stageCounts[stage.id];

            return (
              <button
                key={stage.id}
                onClick={() => setActiveStageFilter(isFilterActive ? 'ALL' : stage.id)}
                className={`relative p-4 rounded-xl border text-left transition-all group cursor-pointer ${
                  isFilterActive
                    ? 'bg-blue-600/20 border-blue-400 shadow-lg shadow-blue-500/10'
                    : 'bg-[#081528] hover:bg-[#0E223D] border-[#1E3A5F]'
                }`}
              >
                {/* Step number badge & icon */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono ${
                      isFilterActive ? 'bg-blue-500 text-white' : 'bg-[#112A4D] text-blue-300 border border-blue-500/40'
                    }`}>
                      {stage.stepNumber}
                    </span>
                    <span className="text-slate-400 group-hover:text-blue-300 transition-colors">
                      {getStageIcon(stage.id, "w-4 h-4")}
                    </span>
                  </div>
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                    count > 0 ? 'bg-blue-950 text-blue-300 border border-blue-700' : 'bg-slate-800 text-slate-500'
                  }`}>
                    {count} {count === 1 ? 'Loan' : 'Loans'}
                  </span>
                </div>

                <div className="font-bold text-sm text-white">{stage.title}</div>
                <div className="text-[11px] text-blue-300 font-medium mt-0.5">{stage.subtitle}</div>
                <div className="text-[10px] text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                  {stage.description}
                </div>

                {/* Bottom connector arrow indicator */}
                <div className="mt-3 pt-2 border-t border-[#1E3A5F]/60 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="font-mono">
                    {idx < 3 ? `Next: Stage ${idx + 2}` : 'Final Settlement'}
                  </span>
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isFilterActive ? 'text-blue-400 translate-x-0.5' : 'text-slate-500'}`} />
                </div>
              </button>
            );
          })}
        </div>

        {/* Filter Reset if Active */}
        {activeStageFilter !== 'ALL' && (
          <div className="mt-4 pt-3 border-t border-[#1E3A5F]/60 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 text-slate-300">
              <Filter className="w-3.5 h-3.5 text-blue-400" />
              <span>Showing loans currently in <strong>{getStageConfig(activeStageFilter).title}</strong></span>
            </div>
            <button
              onClick={() => setActiveStageFilter('ALL')}
              className="text-blue-400 hover:text-blue-300 font-semibold underline text-xs"
            >
              Show All Stages ({loans.length})
            </button>
          </div>
        )}
      </div>

      {/* PIPELINE WORKBENCH & ACTIVE LOAN STAGE INSPECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: LOANS IN CURRENT PIPELINE (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
              <span>Discharging Queue</span>
              <span className="text-blue-400 font-mono">({filteredLoans.length})</span>
            </div>
            <span className="text-[11px] text-slate-500">Click loan to preview stage breakdown</span>
          </div>

          <div className="space-y-2.5 max-h-[720px] overflow-y-auto pr-1">
            {filteredLoans.length === 0 ? (
              <div className="bg-[#0B1E36] border border-[#1E3A5F] rounded-xl p-8 text-center text-slate-400 text-xs">
                No loan applications currently in {activeStageFilter !== 'ALL' ? getStageConfig(activeStageFilter).shortTitle : 'the queue'}.
              </div>
            ) : (
              filteredLoans.map((loan) => {
                const stage = getLoanDischargeStage(loan);
                const stageConf = getStageConfig(stage);
                const isSelected = previewLoan?.id === loan.id;
                const channelMeta = loan.channel ? MICROBIZ_CHANNELS[loan.channel] : null;
                const progress = getStageProgressPercent(loan);

                return (
                  <div
                    key={loan.id}
                    onClick={() => setSelectedLoanForPreview(loan)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left ${
                      isSelected
                        ? 'bg-[#0E274A] border-blue-400 shadow-md ring-1 ring-blue-500/30'
                        : 'bg-[#0B1E36] hover:bg-[#0F2440] border-[#1E3A5F]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs font-bold text-blue-300">{loan.id}</span>
                          {channelMeta && (
                            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${channelMeta.badgeClass}`}>
                              {channelMeta.code}
                            </span>
                          )}
                        </div>
                        <div className="font-bold text-white text-sm mt-0.5">{loan.applicantName}</div>
                        {loan.businessName && (
                          <div className="text-[11px] text-slate-400 truncate max-w-[200px]">{loan.businessName}</div>
                        )}
                      </div>

                      <div className="text-right">
                        <div className="font-mono font-bold text-white text-sm">{formatCurrency(loan.amount)}</div>
                        <div className="text-[10px] text-slate-400">{loan.tenureMonths} Mo @ 5%/mo</div>
                      </div>
                    </div>

                    {/* 4-Stage Mini Indicator Bar */}
                    <div className="mt-3 pt-2.5 border-t border-[#1E3A5F]/60">
                      <div className="flex items-center justify-between text-[11px] mb-1.5">
                        <span className="flex items-center space-x-1.5 font-semibold text-blue-300">
                          {getStageIcon(stage, "w-3 h-3")}
                          <span>Stage {stageConf.stepNumber}/4: {stageConf.shortTitle}</span>
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">{progress}% Complete</span>
                      </div>

                      {/* 4 Segment Progress Bar */}
                      <div className="grid grid-cols-4 gap-1">
                        {[1, 2, 3, 4].map((stepNum) => {
                          const isCurrent = stageConf.stepNumber === stepNum;
                          const isPassed = stageConf.stepNumber > stepNum || (stage === 'DISBURSEMENT' && loan.status === 'DISBURSED');
                          return (
                            <div 
                              key={stepNum}
                              className={`h-1.5 rounded-full transition-all ${
                                isPassed 
                                  ? 'bg-blue-500' 
                                  : isCurrent 
                                  ? 'bg-blue-400 animate-pulse' 
                                  : 'bg-slate-700/50'
                              }`}
                            />
                          );
                        })}
                      </div>
                    </div>

                    {/* Action buttons footer */}
                    <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-[#1E3A5F]/40 text-xs">
                      <span className="text-[10px] text-slate-400 font-mono">
                        Ref: {loan.channelTracingRef || 'N/A'}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectLoan(loan);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[11px] flex items-center space-x-1 shadow-sm transition-all"
                      >
                        <span>Open Cockpit</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: DETAILED STAGE PROGRESSION BREAKDOWN FOR SELECTED LOAN (7 cols) */}
        <div className="lg:col-span-7">
          {previewLoan ? (
            <div className="bg-[#0B1E36] border border-[#1E3A5F] rounded-2xl p-6 shadow-xl space-y-6">
              
              {/* Selected Loan Stage Header */}
              <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-[#1E3A5F]">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold text-blue-400">{previewLoan.id}</span>
                    <span className="text-slate-600">|</span>
                    <span className="text-xs text-slate-300 font-mono">
                      {previewLoan.channel ? MICROBIZ_CHANNELS[previewLoan.channel].name : 'Microbiz Group'}
                    </span>
                  </div>
                  <h3 className="text-lg font-extrabold text-white mt-1">
                    {previewLoan.applicantName}
                  </h3>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {previewLoan.businessName || 'SME Trade Enterprise'} • {previewLoan.purpose}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-400">Requested Principal</div>
                  <div className="text-xl font-extrabold text-blue-300 font-mono">
                    {formatCurrency(previewLoan.amount)}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Tenure: {previewLoan.tenureMonths} Months @ 5.0% monthly
                  </div>
                </div>
              </div>

              {/* 4 STAGES STEP-BY-STEP CHECKLIST */}
              <div className="space-y-4">
                <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-blue-400" />
                  <span>4-Stage Discharging Compliance Checklist</span>
                </div>

                <div className="space-y-3">
                  {LOAN_DISCHARGE_STAGES.map((stage) => {
                    const checklist = getStageChecklistStatus(previewLoan, stage.id);
                    const isCurrent = currentPreviewStage === stage.id;
                    const isPassed = getStageConfig(currentPreviewStage).stepNumber > stage.stepNumber || 
                      (currentPreviewStage === 'DISBURSEMENT' && previewLoan.status === 'DISBURSED');

                    return (
                      <div 
                        key={stage.id}
                        className={`p-4 rounded-xl border transition-all ${
                          isCurrent
                            ? 'bg-[#0E274A] border-blue-400 shadow-md'
                            : isPassed
                            ? 'bg-[#081528] border-blue-900/60'
                            : 'bg-[#081528]/60 border-[#1E3A5F]/50 opacity-80'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2.5">
                          <div className="flex items-center space-x-2.5">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono ${
                              isPassed
                                ? 'bg-blue-500 text-white'
                                : isCurrent
                                ? 'bg-blue-600 text-white animate-pulse'
                                : 'bg-[#112A4D] text-slate-400'
                            }`}>
                              {isPassed ? <Check className="w-3.5 h-3.5" /> : stage.stepNumber}
                            </span>
                            <div>
                              <div className="text-sm font-bold text-white flex items-center space-x-2">
                                <span>{stage.title}</span>
                                {isCurrent && (
                                  <span className="px-2 py-0.2 rounded-full text-[10px] font-mono bg-blue-900 text-blue-200 border border-blue-500 animate-pulse">
                                    CURRENT ACTIVE STAGE
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-blue-300">{stage.subtitle}</div>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                              checklist.isComplete
                                ? 'bg-blue-950 text-blue-300 border border-blue-700'
                                : 'bg-slate-800 text-slate-300 border border-slate-700'
                            }`}>
                              {checklist.completedItems}/{checklist.totalItems} Checks
                            </span>
                          </div>
                        </div>

                        {/* Stage Specific Criteria Checklist */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-[#1E3A5F]/60 text-xs">
                          {checklist.items.map((item, i) => (
                            <div 
                              key={i} 
                              className={`p-2 rounded-lg flex items-start space-x-2 ${
                                item.passed ? 'bg-[#0B1E36] text-slate-200' : 'bg-[#081220] text-slate-400'
                              }`}
                            >
                              {item.passed ? (
                                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                              ) : (
                                <Clock className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                              )}
                              <div className="min-w-0 flex-1">
                                <div className={`text-xs font-medium ${item.passed ? 'text-white' : 'text-slate-400'}`}>
                                  {item.label}
                                </div>
                                {item.details && (
                                  <div className="text-[10px] font-mono text-blue-300 mt-0.5 truncate">
                                    {item.details}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* CBN Regulatory Tag */}
                        <div className="mt-2.5 pt-2 border-t border-[#1E3A5F]/40 text-[10px] text-slate-400 flex items-center justify-between">
                          <span className="truncate"><strong>CBN Focus:</strong> {stage.cbnRegulatoryFocus}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ACTION EXECUTION BAR */}
              <div className="pt-4 border-t border-[#1E3A5F] flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-slate-400">
                  <span>Current Step: </span>
                  <strong className="text-white font-mono">
                    {getStageConfig(currentPreviewStage).title}
                  </strong>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onSelectLoan(previewLoan)}
                    className="px-4 py-2 rounded-xl bg-[#0F2748] hover:bg-[#153460] border border-blue-500/50 text-blue-200 hover:text-white text-xs font-bold transition-all flex items-center space-x-1.5"
                  >
                    <Eye className="w-3.5 h-3.5 text-blue-400" />
                    <span>Open Multi-Tier Review</span>
                  </button>

                  {currentPreviewStage === 'DISBURSEMENT' && previewLoan.status !== 'DISBURSED' && (
                    <button
                      onClick={() => onDisburseLoan(previewLoan)}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all flex items-center space-x-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Execute T24 Core Disbursement</span>
                    </button>
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-[#0B1E36] border border-[#1E3A5F] rounded-2xl p-12 text-center text-slate-400 text-xs">
              Select a loan to view the 4-stage discharging breakdown.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
