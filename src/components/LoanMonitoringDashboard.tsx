import React, { useState, useMemo } from 'react';
import { 
  LoanApplication, 
  NPLClassification, 
  DefaultAlert, 
  RemediationPlan,
  MicrobizChannel 
} from '../types';
import { 
  AlertTriangle, 
  ShieldAlert, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Building2, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Search, 
  Filter, 
  Download, 
  Printer, 
  ArrowUpRight, 
  AlertOctagon, 
  DollarSign, 
  PieChart as PieChartIcon, 
  BarChart3, 
  Layers, 
  Eye, 
  RefreshCw, 
  ShieldCheck, 
  Gavel, 
  UserCheck, 
  ExternalLink,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';
import { 
  getNPLClassification, 
  getNPLClassificationMeta, 
  computePortfolioQualitySummary, 
  computeRelationshipManagerPAR, 
  computeOrganisationPAR, 
  computeBranchPAR, 
  generateDefaultAlerts 
} from '../utils/loanMonitoring';
import { LoanRemediationModal } from './LoanRemediationModal';

interface LoanMonitoringDashboardProps {
  loans: LoanApplication[];
  onSelectLoan: (loan: LoanApplication) => void;
  onUpdateLoanRemediation?: (loanId: string, updatedPlan: RemediationPlan, actionDesc: string) => void;
}

export const LoanMonitoringDashboard: React.FC<LoanMonitoringDashboardProps> = ({
  loans,
  onSelectLoan,
  onUpdateLoanRemediation
}) => {
  // Navigation tabs within Monitoring Dashboard
  const [activeTab, setActiveTab] = useState<
    'radar' | 'officers' | 'organisation' | 'alerts' | 'register' | 'cbn_return'
  >('radar');

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [channelFilter, setChannelFilter] = useState<MicrobizChannel | 'ALL'>('ALL');
  const [classificationFilter, setClassificationFilter] = useState<NPLClassification | 'ALL'>('ALL');
  const [dpdFilter, setDpdFilter] = useState<'ALL' | '0' | '1-30' | '31-90' | '91-180' | '180_PLUS'>('ALL');
  const [selectedBranch, setSelectedBranch] = useState<string>('ALL');

  // Remediation Modal Target
  const [remediatingLoan, setRemediatingLoan] = useState<LoanApplication | null>(null);

  // Local Alerts State (for dismissing or acting on alerts)
  const [acknowledgedAlertIds, setAcknowledgedAlertIds] = useState<Set<string>>(new Set());

  // Compute Core Metrics
  const summary = useMemo(() => computePortfolioQualitySummary(loans), [loans]);
  const rmParMetrics = useMemo(() => computeRelationshipManagerPAR(loans), [loans]);
  const orgParMetrics = useMemo(() => computeOrganisationPAR(loans), [loans]);
  const branchParMetrics = useMemo(() => computeBranchPAR(loans), [loans]);
  const rawAlerts = useMemo(() => generateDefaultAlerts(loans), [loans]);

  const activeAlerts = useMemo(() => {
    return rawAlerts.filter(a => !acknowledgedAlertIds.has(a.id));
  }, [rawAlerts, acknowledgedAlertIds]);

  const handleAcknowledgeAlert = (alertId: string) => {
    setAcknowledgedAlertIds(prev => new Set([...prev, alertId]));
  };

  // Filtered Loans for Register
  const filteredLoans = useMemo(() => {
    return loans.filter(loan => {
      const dpd = loan.daysPastDue || 0;
      const classification = loan.nplClassification || getNPLClassification(dpd);

      if (channelFilter !== 'ALL' && loan.channel !== channelFilter) return false;
      if (classificationFilter !== 'ALL' && classification !== classificationFilter) return false;
      if (selectedBranch !== 'ALL' && loan.branch && !loan.branch.includes(selectedBranch)) return false;

      if (dpdFilter === '0' && dpd !== 0) return false;
      if (dpdFilter === '1-30' && (dpd < 1 || dpd > 30)) return false;
      if (dpdFilter === '31-90' && (dpd < 31 || dpd > 90)) return false;
      if (dpdFilter === '91-180' && (dpd < 91 || dpd > 180)) return false;
      if (dpdFilter === '180_PLUS' && dpd <= 180) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = loan.applicantName.toLowerCase().includes(query);
        const matchesBiz = loan.businessName?.toLowerCase().includes(query);
        const matchesId = loan.id.toLowerCase().includes(query);
        const matchesBvn = loan.bvn.includes(query);
        const matchesOfficer = loan.officerRegistrationNumber?.toLowerCase().includes(query);
        if (!matchesName && !matchesBiz && !matchesId && !matchesBvn && !matchesOfficer) {
          return false;
        }
      }

      return true;
    });
  }, [loans, channelFilter, classificationFilter, dpdFilter, selectedBranch, searchQuery]);

  // Chart Data for DPD Aging Distribution
  const agingChartData = useMemo(() => {
    return [
      { name: 'Performing (0 DPD)', value: summary.performingValue, count: summary.performingCount, color: '#10B981' },
      { name: 'Watchlist (1-30 DPD)', value: summary.watchlistValue, count: summary.watchlistCount, color: '#F59E0B' },
      { name: 'Substandard (31-90 DPD)', value: summary.substandardValue, count: summary.substandardCount, color: '#F97316' },
      { name: 'Doubtful (91-180 DPD)', value: summary.doubtfulValue, count: summary.doubtfulCount, color: '#F43F5E' },
      { name: 'Lost (> 180 DPD)', value: summary.lostValue, count: summary.lostCount, color: '#EF4444' }
    ];
  }, [summary]);

  const channelComparisonChartData = useMemo(() => {
    return orgParMetrics.map(org => ({
      name: org.code,
      portfolio: Math.round(org.totalPortfolio / 1000000), // in millions
      nplAmount: Math.round(org.totalNplAmount / 100000), // in 100k
      par30Rate: org.par30Rate,
      par90Rate: org.par90Rate
    }));
  }, [orgParMetrics]);

  // Export to CSV Function
  const handleExportCSV = () => {
    const headers = [
      'Loan ID',
      'Applicant Name',
      'Business Name',
      'Channel',
      'Branch',
      'Amount (NGN)',
      'Days Past Due',
      'NPL Classification',
      'Overdue Arrears (NGN)',
      'Required CBN Provision (NGN)',
      'Officer Registration',
      'Remediation Status'
    ];

    const rows = filteredLoans.map(l => {
      const dpd = l.daysPastDue || 0;
      const classification = l.nplClassification || getNPLClassification(dpd);
      const meta = getNPLClassificationMeta(classification);
      const prov = Math.round(l.amount * meta.cbnProvisionRate);

      return [
        l.id,
        `"${l.applicantName}"`,
        `"${l.businessName || 'N/A'}"`,
        l.channel || 'MICROBIZ_MFB',
        `"${l.branch || 'Abuja Main'}"`,
        l.amount,
        dpd,
        classification,
        l.overdueAmount || 0,
        prov,
        l.officerRegistrationNumber || 'N/A',
        l.remediationPlan?.status || 'NONE'
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Fincore_NPL_Monitoring_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* 1. EXECUTIVE SURVEILLANCE & EARLY WARNING HEADER */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#091527] via-[#0D1F38] to-[#07111E] border border-[#1E3A5F] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-950 text-blue-300 border border-blue-600/50 flex items-center space-x-1">
                <ShieldAlert className="w-3.5 h-3.5 text-blue-400" />
                <span>CBN Prudential Surveillance & Early Warning Engine</span>
              </span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center space-x-1 border ${
                summary.isCbnCompliant 
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600/60' 
                  : 'bg-rose-950/80 text-rose-300 border-rose-600/60'
              }`}>
                {summary.isCbnCompliant ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>CBN NPL Ceiling: COMPLIANT (&le; 5.0%)</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                    <span>CBN NPL Ceiling: REGULATORY BREACH (&gt; 5.0%)</span>
                  </>
                )}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-2">
              Loan Monitoring, NPL Detection & Portfolio Quality Intelligence
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Continuous portfolio surveillance across Microbiz MFB, Inclusion Centres & Peak Empowerment. Automated PAR calculation, stage 1-3 IFRS 9 classification, and early warning recovery alerts.
            </p>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={handleExportCSV}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-[#0F2440] hover:bg-[#16365C] border border-[#1E3A5F] text-blue-200 hover:text-white rounded-xl text-xs font-semibold transition-all shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handlePrintReport}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/30"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Generate CBN Return</span>
            </button>
          </div>
        </div>

        {/* Executive Metric Cards Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 mt-6 pt-6 border-t border-[#1E3A5F]/60">
          
          {/* Card 1: Total Portfolio */}
          <div className="p-3.5 rounded-xl bg-[#07111E]/80 border border-[#1E3A5F]">
            <span className="text-[11px] text-slate-400 block font-medium">Monitored Portfolio</span>
            <div className="text-lg font-black text-white mt-1 font-mono">
              ₦{(summary.totalPortfolioValue / 1000000).toFixed(2)}M
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              {summary.totalLoans} Active Facilities
            </span>
          </div>

          {/* Card 2: Gross NPL Ratio (PAR 90) */}
          <div className="p-3.5 rounded-xl bg-[#07111E]/80 border border-[#1E3A5F]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400 block font-medium">Gross NPL (PAR 90)</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${summary.isCbnCompliant ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'}`}>
                Cap 5%
              </span>
            </div>
            <div className={`text-lg font-black mt-1 font-mono ${summary.isCbnCompliant ? 'text-emerald-400' : 'text-rose-400'}`}>
              {summary.par90}%
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              ₦{(summary.doubtfulValue + summary.lostValue).toLocaleString()} in &gt;90 DPD
            </span>
          </div>

          {/* Card 3: PAR 30 (Watchlist + Substandard) */}
          <div className="p-3.5 rounded-xl bg-[#07111E]/80 border border-[#1E3A5F]">
            <span className="text-[11px] text-slate-400 block font-medium">PAR 30 (At Risk)</span>
            <div className="text-lg font-black text-amber-400 mt-1 font-mono">
              {summary.par30}%
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              ₦{summary.totalNplValue.toLocaleString()} Overdue &gt;30d
            </span>
          </div>

          {/* Card 4: Overdue Arrears */}
          <div className="p-3.5 rounded-xl bg-[#07111E]/80 border border-[#1E3A5F]">
            <span className="text-[11px] text-slate-400 block font-medium">Overdue Arrears</span>
            <div className="text-lg font-black text-rose-300 mt-1 font-mono">
              ₦{summary.totalOverdue.toLocaleString()}
            </div>
            <span className="text-[10px] text-rose-400/80 mt-1 block">
              {summary.watchlistCount + summary.totalNplCount} Delinquent Loans
            </span>
          </div>

          {/* Card 5: CBN Required Provisions */}
          <div className="p-3.5 rounded-xl bg-[#07111E]/80 border border-[#1E3A5F]">
            <span className="text-[11px] text-slate-400 block font-medium">Required CBN Reserve</span>
            <div className="text-lg font-black text-blue-300 mt-1 font-mono">
              ₦{summary.totalRequiredProvisions.toLocaleString()}
            </div>
            <span className="text-[10px] text-emerald-400 mt-1 block">
              112% CBS Booked Reserve
            </span>
          </div>

          {/* Card 6: Active Early Warning Alerts */}
          <div className="p-3.5 rounded-xl bg-[#07111E]/80 border border-[#1E3A5F]">
            <span className="text-[11px] text-slate-400 block font-medium">Early Warning Alerts</span>
            <div className="text-lg font-black text-orange-400 mt-1 font-mono flex items-center space-x-1.5">
              <span>{activeAlerts.length}</span>
              {activeAlerts.some(a => a.severity === 'CRITICAL') && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              )}
            </div>
            <span className="text-[10px] text-orange-300/80 mt-1 block">
              {activeAlerts.filter(a => a.severity === 'CRITICAL').length} Critical Escalations
            </span>
          </div>

        </div>
      </div>

      {/* 2. REAL-TIME CRITICAL ALERT BANNER (IF ANY ACTIVE) */}
      {activeAlerts.length > 0 && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-rose-950/40 via-orange-950/30 to-[#07111E] border border-rose-600/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-rose-900/60 text-rose-300 border border-rose-600">
              <AlertOctagon className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white flex items-center space-x-2">
                <span>{activeAlerts[0].title}</span>
                <span className="px-1.5 py-0.2 rounded text-[10px] bg-rose-950 text-rose-300 border border-rose-600 font-mono">
                  {activeAlerts[0].daysPastDue} DPD
                </span>
              </h4>
              <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-1">
                {activeAlerts[0].message}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => {
                const target = loans.find(l => l.id === activeAlerts[0].loanId);
                if (target) setRemediatingLoan(target);
              }}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition-colors shadow"
            >
              Action Remediation
            </button>
            <button
              onClick={() => setActiveTab('alerts')}
              className="px-3 py-1.5 bg-[#0F2440] hover:bg-[#16365C] border border-[#1E3A5F] text-slate-300 hover:text-white rounded-lg text-xs font-medium transition-colors"
            >
              View All ({activeAlerts.length})
            </button>
          </div>
        </div>
      )}

      {/* 3. SUB-NAVIGATION MODULE TABS */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1E3A5F] pb-3">
        <div className="flex flex-wrap items-center gap-1.5 bg-[#091527] p-1.5 rounded-xl border border-[#1E3A5F] text-xs font-medium">
          
          <button
            onClick={() => setActiveTab('radar')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg transition-all ${
              activeTab === 'radar'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-[#0F2440]'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Surveillance Radar</span>
          </button>

          <button
            onClick={() => setActiveTab('officers')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg transition-all ${
              activeTab === 'officers'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-[#0F2440]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>PAR per Relationship Manager</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-950 text-blue-300 border border-blue-700">
              {rmParMetrics.length} RMs
            </span>
          </button>

          <button
            onClick={() => setActiveTab('organisation')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg transition-all ${
              activeTab === 'organisation'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-[#0F2440]'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>PAR per Organisation & Branch</span>
          </button>

          <button
            onClick={() => setActiveTab('alerts')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg transition-all ${
              activeTab === 'alerts'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-[#0F2440]'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Early Warning & NPL Alerts</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-950 text-amber-300 border border-amber-600">
              {activeAlerts.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('register')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg transition-all ${
              activeTab === 'register'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-[#0F2440]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Defaulting Loans Ledger</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#07111E] border border-[#1E3A5F] text-slate-300">
              {filteredLoans.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('cbn_return')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg transition-all ${
              activeTab === 'cbn_return'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-[#0F2440]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>CBN e-FASS PR-4 Return</span>
          </button>

        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: SURVEILLANCE & PORTFOLIO QUALITY RADAR */}
      {/* ========================================================= */}
      {activeTab === 'radar' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* DPD Aging Distribution Chart */}
            <div className="p-5 rounded-2xl bg-[#091527] border border-[#1E3A5F] shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <BarChart3 className="w-4 h-4 text-blue-400" />
                    <span>Portfolio Aging & NPL Staging Distribution</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    CBN Prudential Stage 1 (0 DPD) to Stage 3 (&gt;180 DPD)
                  </p>
                </div>
                <span className="text-xs font-mono text-slate-300">
                  Total: ₦{(summary.totalPortfolioValue / 1000000).toFixed(1)}M
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={agingChartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E3A5F" opacity={0.5} />
                    <XAxis 
                      dataKey="name" 
                      stroke="#64748B" 
                      fontSize={10} 
                      tickLine={false}
                      angle={-15}
                      textAnchor="end"
                    />
                    <YAxis 
                      stroke="#64748B" 
                      fontSize={10} 
                      tickLine={false}
                      tickFormatter={(v) => `₦${(v / 1000000).toFixed(1)}M`}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#091527', borderColor: '#1E3A5F', borderRadius: '8px', fontSize: '11px' }}
                      formatter={(val: number) => [`₦${val.toLocaleString()}`, 'Portfolio Volume']}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {agingChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Staging Summary Legend */}
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-4 pt-4 border-t border-[#1E3A5F]">
                {agingChartData.map((item, idx) => (
                  <div key={idx} className="text-center p-2 rounded-lg bg-[#07111E] border border-[#1E3A5F]">
                    <span className="text-[10px] text-slate-400 block truncate">{item.name.split(' ')[0]}</span>
                    <span className="text-xs font-bold text-white font-mono block mt-0.5">
                      {item.count} loans
                    </span>
                    <span className="text-[10px] font-mono text-slate-300 block">
                      ₦{(item.value / 1000000).toFixed(1)}M
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Platform PAR Comparison Chart */}
            <div className="p-5 rounded-2xl bg-[#091527] border border-[#1E3A5F] shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <PieChartIcon className="w-4 h-4 text-emerald-400" />
                    <span>PAR Comparison Across Organisations</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    PAR 30 vs Gross NPL (PAR 90) against 5% regulatory ceiling
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-950 text-blue-300 border border-blue-600">
                  3 Platform Entities
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={channelComparisonChartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E3A5F" opacity={0.5} />
                    <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748B" fontSize={11} tickLine={false} tickFormatter={(v) => `${v}%`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#091527', borderColor: '#1E3A5F', borderRadius: '8px', fontSize: '11px' }}
                      formatter={(val: number) => [`${val}%`, 'Rate']}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Bar dataKey="par30Rate" name="PAR 30 Rate (%)" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="par90Rate" name="Gross NPL PAR 90 (%)" fill="#F43F5E" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Regulatory Benchmark Alert */}
              <div className="mt-4 pt-4 border-t border-[#1E3A5F] flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center space-x-1.5">
                  <ShieldAlert className="w-4 h-4 text-blue-400" />
                  <span>CBN Regulatory Maximum: <strong>5.0% Gross NPL</strong></span>
                </span>
                <span className="text-emerald-400 font-semibold">
                  Portfolio Weighted NPL: {summary.par90}%
                </span>
              </div>
            </div>

          </div>

          {/* Early Warning Indicator (EWI) Heatmap Grid */}
          <div className="p-5 rounded-2xl bg-[#091527] border border-[#1E3A5F] shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <AlertOctagon className="w-4 h-4 text-orange-400" />
                  <span>Early Warning Indicators (EWI) Matrix & Surveillance Radar</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Automated risk indicators monitoring behavioral cashflow trends, mandate health, and market clusters
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-950 text-amber-300 border border-amber-600/50">
                Live Signal Monitoring
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* EWI Card 1 */}
              <div className="p-4 rounded-xl bg-[#07111E] border border-[#1E3A5F] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">NIBSS Direct Debit Bounces</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-600">
                    High Alert
                  </span>
                </div>
                <div className="text-xl font-bold text-rose-400 font-mono">3 Accounts</div>
                <p className="text-[11px] text-slate-400">
                  Mandate failed on 2 consecutive weekly settlement sweeps due to low liquidity.
                </p>
              </div>

              {/* EWI Card 2 */}
              <div className="p-4 rounded-xl bg-[#07111E] border border-[#1E3A5F] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">POS Turnover Dip (&gt; 35%)</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-600">
                    Watchlist
                  </span>
                </div>
                <div className="text-xl font-bold text-amber-400 font-mono">2 Merchants</div>
                <p className="text-[11px] text-slate-400">
                  Balogun & Ladipo merchants experienced sharp POS collection declines.
                </p>
              </div>

              {/* EWI Card 3 */}
              <div className="p-4 rounded-xl bg-[#07111E] border border-[#1E3A5F] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">BVN Multi-Lending Inquiries</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-600">
                    Normal
                  </span>
                </div>
                <div className="text-xl font-bold text-blue-400 font-mono">1 Inquiry</div>
                <p className="text-[11px] text-slate-400">
                  External credit bureau request recorded; borrower debt profile remains within limits.
                </p>
              </div>

              {/* EWI Card 4 */}
              <div className="p-4 rounded-xl bg-[#07111E] border border-[#1E3A5F] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Guarantor Verification Drift</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-600">
                    Secure
                  </span>
                </div>
                <div className="text-xl font-bold text-emerald-400 font-mono">100% Sighted</div>
                <p className="text-[11px] text-slate-400">
                  All 2 co-signers verified with biometric NIMC NIN and valid proof of address.
                </p>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: PAR PER RELATIONSHIP MANAGER (CREDIT OFFICER) */}
      {/* ========================================================= */}
      {activeTab === 'officers' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          <div className="p-5 rounded-2xl bg-[#091527] border border-[#1E3A5F] shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span>Relationship Manager & Credit Officer Portfolio Quality Index</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Individual credit officer PAR 30, Gross NPL (PAR 90), collection efficiency, and incentive bonus eligibility
                </p>
              </div>

              <div className="flex items-center space-x-2 text-xs">
                <span className="px-2.5 py-1 rounded-lg bg-[#07111E] border border-[#1E3A5F] text-slate-300">
                  CBN RM PAR Cap: <strong>&le; 5.0%</strong>
                </span>
              </div>
            </div>

            {/* Officer Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {rmParMetrics.map((rm) => (
                <div 
                  key={rm.officerId}
                  className="p-4 rounded-xl bg-[#07111E] border border-[#1E3A5F] hover:border-blue-500/50 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">{rm.officerName}</h4>
                      <span className="text-[11px] font-mono text-blue-300 block">{rm.registrationNumber}</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{rm.channelName} • {rm.branch}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                      rm.riskRating === 'PRIME' ? 'bg-emerald-950 text-emerald-300 border-emerald-600' :
                      rm.riskRating === 'GOOD' ? 'bg-blue-950 text-blue-300 border-blue-600' :
                      rm.riskRating === 'CAUTION' ? 'bg-amber-950 text-amber-300 border-amber-600' :
                      'bg-rose-950 text-rose-300 border-rose-600'
                    }`}>
                      {rm.riskRating}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-2 border-y border-[#1E3A5F]/60 text-center">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Portfolio</span>
                      <span className="text-xs font-bold text-white font-mono block mt-0.5">
                        ₦{(rm.totalPortfolio / 1000000).toFixed(2)}M
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">PAR 30</span>
                      <span className={`text-xs font-bold font-mono block mt-0.5 ${rm.par30Rate <= 5 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {rm.par30Rate}%
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Collection</span>
                      <span className="text-xs font-bold text-blue-300 font-mono block mt-0.5">
                        {rm.collectionEfficiency}%
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">
                      NPL Overdue: <strong className="text-rose-400 font-mono">₦{rm.totalNplAmount.toLocaleString()}</strong>
                    </span>
                    <span className={`font-semibold ${rm.incentiveBonusEligible ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {rm.incentiveBonusEligible ? 'Bonus Qualified' : 'Bonus Disqualified'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Officer Detailed Table */}
            <div className="overflow-x-auto rounded-xl border border-[#1E3A5F]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#07111E] text-slate-400 uppercase tracking-wider font-semibold border-b border-[#1E3A5F]">
                  <tr>
                    <th className="px-4 py-3">Relationship Manager</th>
                    <th className="px-4 py-3">Channel & Branch</th>
                    <th className="px-4 py-3 text-right">Managed Portfolio</th>
                    <th className="px-4 py-3 text-center">Active Loans</th>
                    <th className="px-4 py-3 text-right">Watchlist (1-30d)</th>
                    <th className="px-4 py-3 text-right">NPL Balance</th>
                    <th className="px-4 py-3 text-center">PAR 30 (%)</th>
                    <th className="px-4 py-3 text-center">PAR 90 Gross NPL</th>
                    <th className="px-4 py-3 text-center">Collection %</th>
                    <th className="px-4 py-3 text-center">Quality Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E3A5F] bg-[#091527] font-mono">
                  {rmParMetrics.map((rm) => (
                    <tr key={rm.officerId} className="hover:bg-[#0F2440] transition-colors">
                      <td className="px-4 py-3 font-sans">
                        <div className="font-bold text-white">{rm.officerName}</div>
                        <div className="text-[11px] text-blue-300 font-mono">{rm.registrationNumber}</div>
                      </td>
                      <td className="px-4 py-3 font-sans">
                        <div className="text-slate-200">{rm.channelName}</div>
                        <div className="text-[10px] text-slate-400">{rm.branch}</div>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-white">
                        ₦{rm.totalPortfolio.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-center text-slate-300">
                        {rm.totalLoansCount}
                      </td>
                      <td className="px-4 py-3 text-right text-amber-400">
                        ₦{rm.watchlistAmount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right text-rose-400 font-bold">
                        ₦{rm.totalNplAmount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-center font-bold">
                        <span className={`px-2 py-0.5 rounded text-[11px] ${rm.par30Rate <= 5 ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'}`}>
                          {rm.par30Rate}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center font-bold">
                        <span className={`px-2 py-0.5 rounded text-[11px] ${rm.par90Rate <= 5 ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'}`}>
                          {rm.par90Rate}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-blue-300">
                        {rm.collectionEfficiency}%
                      </td>
                      <td className="px-4 py-3 text-center font-sans">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                          rm.riskRating === 'PRIME' ? 'bg-emerald-950 text-emerald-300 border-emerald-600' :
                          rm.riskRating === 'GOOD' ? 'bg-blue-950 text-blue-300 border-blue-600' :
                          rm.riskRating === 'CAUTION' ? 'bg-amber-950 text-amber-300 border-amber-600' :
                          'bg-rose-950 text-rose-300 border-rose-600'
                        }`}>
                          {rm.riskRating}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: PAR PER ORGANISATION & BRANCH */}
      {/* ========================================================= */}
      {activeTab === 'organisation' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Organisation Entities Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {orgParMetrics.map((org) => (
              <div 
                key={org.entityId}
                className="p-5 rounded-2xl bg-[#091527] border border-[#1E3A5F] shadow-lg space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-mono text-blue-300 block">{org.code}</span>
                    <h4 className="text-base font-bold text-white mt-0.5">{org.entityName}</h4>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    org.par90Rate <= 5.0 
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-600' 
                      : 'bg-rose-950 text-rose-300 border border-rose-600'
                  }`}>
                    {org.par90Rate <= 5.0 ? 'CBN Compliant' : 'NPL Breach'}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#07111E] border border-[#1E3A5F] space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Total Monitored Volume</span>
                    <span className="font-bold text-white font-mono">₦{org.totalPortfolio.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Active Facilities</span>
                    <span className="font-bold text-slate-200 font-mono">{org.activeLoansCount} Loans</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Performing (Stage 1)</span>
                    <span className="font-bold text-emerald-400 font-mono">₦{org.performingAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Watchlist (Stage 2)</span>
                    <span className="font-bold text-amber-400 font-mono">₦{org.watchlistAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Total NPLs (Stage 3)</span>
                    <span className="font-bold text-rose-400 font-mono">₦{org.totalNplAmount.toLocaleString()}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-2.5 rounded-lg bg-[#07111E] border border-[#1E3A5F]">
                    <span className="text-[10px] text-slate-400 block">PAR 30 Rate</span>
                    <span className="text-sm font-bold text-amber-400 font-mono mt-0.5 block">{org.par30Rate}%</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#07111E] border border-[#1E3A5F]">
                    <span className="text-[10px] text-slate-400 block">Gross NPL (PAR 90)</span>
                    <span className="text-sm font-bold text-rose-400 font-mono mt-0.5 block">{org.par90Rate}%</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[#0F2440]/60 border border-[#1E3A5F] text-xs space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Required CBN Reserve:</span>
                    <span className="font-bold text-blue-300 font-mono">₦{org.requiredRegulatoryProvisions.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Provision Coverage:</span>
                    <span className="font-bold text-emerald-400 font-mono">{org.provisionCoverageRatio}%</span>
                  </div>
                </div>

              </div>
            ))}
          </div>

          {/* Branch Level Surveillance Breakdown */}
          <div className="p-5 rounded-2xl bg-[#091527] border border-[#1E3A5F] shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Building2 className="w-4 h-4 text-blue-400" />
                  <span>Branch Hub Regional Credit Risk & PAR Distribution</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Portfolio quality by operating geography: Abuja Mpape, Lagos Balogun, and Kano Dawanau
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {branchParMetrics.map((b) => (
                <div key={b.branchId} className="p-4 rounded-xl bg-[#07111E] border border-[#1E3A5F] space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">{b.branchName}</h4>
                      <span className="text-[11px] text-slate-400 block">{b.city}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${b.cbnCompliant ? 'bg-emerald-950 text-emerald-300 border border-emerald-600' : 'bg-rose-950 text-rose-300 border border-rose-600'}`}>
                      {b.cbnCompliant ? 'Compliant' : 'Elevated Risk'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-[#1E3A5F]/60">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Total Portfolio</span>
                      <span className="text-xs font-bold text-white font-mono mt-0.5 block">
                        ₦{(b.totalPortfolio / 1000000).toFixed(2)}M
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Overdue Arrears</span>
                      <span className="text-xs font-bold text-rose-400 font-mono mt-0.5 block">
                        ₦{b.overdueAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">PAR 30: <strong className="text-amber-400 font-mono">{b.par30Rate}%</strong></span>
                    <span className="text-slate-400">PAR 90: <strong className="text-rose-400 font-mono">{b.par90Rate}%</strong></span>
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: REAL-TIME NPL & EARLY WARNING ALERT CENTER */}
      {/* ========================================================= */}
      {activeTab === 'alerts' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          <div className="p-5 rounded-2xl bg-[#091527] border border-[#1E3A5F] shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>Real-Time Default Alert Stream & Early Warning Triggers</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Automated notifications triggered by Days Past Due breaches, mandate bounces, and credit stress
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-400">
                  Showing <strong>{activeAlerts.length}</strong> active surveillance alerts
                </span>
              </div>
            </div>

            {/* Alerts Stream List */}
            {activeAlerts.length === 0 ? (
              <div className="p-12 text-center rounded-xl bg-[#07111E] border border-[#1E3A5F] space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="text-sm font-bold text-white">All Portfolio Alerts Resolved</h4>
                <p className="text-xs text-slate-400">No active early warning alerts or unacknowledged NPL breaches.</p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {activeAlerts.map((alert) => {
                  const targetLoan = loans.find(l => l.id === alert.loanId);

                  return (
                    <div 
                      key={alert.id}
                      className={`p-4 rounded-xl border transition-all space-y-3 ${
                        alert.severity === 'CRITICAL' 
                          ? 'bg-rose-950/20 border-rose-600/60 shadow-lg shadow-rose-950/20' 
                          : alert.severity === 'HIGH'
                          ? 'bg-orange-950/20 border-orange-600/50'
                          : 'bg-amber-950/20 border-amber-600/40'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                            alert.severity === 'CRITICAL' ? 'bg-rose-900/60 text-rose-300 border border-rose-600' :
                            alert.severity === 'HIGH' ? 'bg-orange-900/60 text-orange-300 border border-orange-600' :
                            'bg-amber-900/60 text-amber-300 border border-amber-600'
                          }`}>
                            <ShieldAlert className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="text-xs font-bold text-white">{alert.title}</h4>
                              <span className={`px-2 py-0.2 rounded text-[10px] font-bold uppercase border ${
                                alert.severity === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border-rose-600' :
                                alert.severity === 'HIGH' ? 'bg-orange-950 text-orange-300 border-orange-600' :
                                'bg-amber-950 text-amber-300 border-amber-600'
                              }`}>
                                {alert.severity} SEVERITY
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                Ref: {alert.loanId}
                              </span>
                            </div>
                            <p className="text-xs text-slate-300 mt-1">
                              {alert.message}
                            </p>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-[11px] text-slate-400">
                              <span>Overdue Arrears: <strong className="text-amber-300 font-mono">₦{alert.overdueAmount.toLocaleString()}</strong></span>
                              <span>Days Past Due: <strong className="text-rose-400 font-mono">{alert.daysPastDue} Days</strong></span>
                              <span>Officer: <strong className="text-blue-300">{alert.officerName}</strong></span>
                              <span>Branch: <strong className="text-slate-300">{alert.branch}</strong></span>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center space-x-2 shrink-0 self-end sm:self-start mt-2 sm:mt-0">
                          {targetLoan && (
                            <button
                              onClick={() => setRemediatingLoan(targetLoan)}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center space-x-1"
                            >
                              <Gavel className="w-3 h-3" />
                              <span>Action Remediation</span>
                            </button>
                          )}
                          {targetLoan && (
                            <button
                              onClick={() => onSelectLoan(targetLoan)}
                              className="px-3 py-1.5 bg-[#0F2440] hover:bg-[#16365C] border border-[#1E3A5F] text-slate-300 hover:text-white rounded-lg text-xs font-medium transition-colors"
                            >
                              View Dossier
                            </button>
                          )}
                          <button
                            onClick={() => handleAcknowledgeAlert(alert.id)}
                            className="px-2.5 py-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#0F2440] text-xs transition-colors"
                            title="Dismiss notification"
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>

                      {/* Recommended Action Footer */}
                      <div className="p-2.5 rounded-lg bg-[#07111E] border border-[#1E3A5F] flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 flex items-center space-x-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          <span>Recommended Action: <strong className="text-slate-200">{alert.recommendedAction}</strong></span>
                        </span>
                        <span className="text-slate-500 font-mono text-[10px]">
                          Triggered: {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: DEFAULTING LOANS REGISTER */}
      {/* ========================================================= */}
      {activeTab === 'register' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          <div className="p-5 rounded-2xl bg-[#091527] border border-[#1E3A5F] shadow-lg space-y-5">
            
            {/* Filter and Search Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              
              {/* Search input */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by borrower name, business, BVN, or loan ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#07111E] border border-[#1E3A5F] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Dropdown Filters */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                
                {/* Channel Filter */}
                <select
                  value={channelFilter}
                  onChange={(e) => setChannelFilter(e.target.value as any)}
                  className="bg-[#07111E] border border-[#1E3A5F] rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="ALL">All Platforms</option>
                  <option value="MICROBIZ_MFB">Microbiz MFB</option>
                  <option value="MICROBIZ_INCLUSION_CENTRE">Microbiz Inclusion Centre</option>
                  <option value="PEAK_EMPOWERMENT_CENTRE">Peak Empowerment Centre</option>
                </select>

                {/* Staging / Classification Filter */}
                <select
                  value={classificationFilter}
                  onChange={(e) => setClassificationFilter(e.target.value as any)}
                  className="bg-[#07111E] border border-[#1E3A5F] rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="ALL">All Classifications</option>
                  <option value="PERFORMING">Performing (0 DPD)</option>
                  <option value="WATCHLIST">Watchlist (1-30 DPD)</option>
                  <option value="SUBSTANDARD">Substandard (31-90 DPD)</option>
                  <option value="DOUBTFUL">Doubtful (91-180 DPD)</option>
                  <option value="LOST">Lost (&gt; 180 DPD)</option>
                </select>

                {/* DPD Range */}
                <select
                  value={dpdFilter}
                  onChange={(e) => setDpdFilter(e.target.value as any)}
                  className="bg-[#07111E] border border-[#1E3A5F] rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="ALL">All DPD Ranges</option>
                  <option value="0">Current (0 DPD)</option>
                  <option value="1-30">1 - 30 Days</option>
                  <option value="31-90">31 - 90 Days (NPL)</option>
                  <option value="91-180">91 - 180 Days (NPL)</option>
                  <option value="180_PLUS">&gt; 180 Days (Lost)</option>
                </select>

                {/* Reset button */}
                {(channelFilter !== 'ALL' || classificationFilter !== 'ALL' || dpdFilter !== 'ALL' || searchQuery) && (
                  <button
                    onClick={() => {
                      setChannelFilter('ALL');
                      setClassificationFilter('ALL');
                      setDpdFilter('ALL');
                      setSearchQuery('');
                    }}
                    className="px-2.5 py-2 text-slate-400 hover:text-white rounded-lg hover:bg-[#0F2440] transition-colors"
                  >
                    Reset
                  </button>
                )}

              </div>

            </div>

            {/* Filtered Loans Table */}
            <div className="overflow-x-auto rounded-xl border border-[#1E3A5F]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#07111E] text-slate-400 uppercase tracking-wider font-semibold border-b border-[#1E3A5F]">
                  <tr>
                    <th className="px-4 py-3">Loan Ref & Customer</th>
                    <th className="px-4 py-3">Platform & Officer</th>
                    <th className="px-4 py-3 text-right">Facility Amount</th>
                    <th className="px-4 py-3 text-center">Aging & DPD</th>
                    <th className="px-4 py-3 text-center">NPL Classification</th>
                    <th className="px-4 py-3 text-right">Overdue Arrears</th>
                    <th className="px-4 py-3 text-center">Remediation Status</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E3A5F] bg-[#091527] font-mono">
                  {filteredLoans.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-slate-400 font-sans">
                        No loans match the active monitoring criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredLoans.map((loan) => {
                      const dpd = loan.daysPastDue || 0;
                      const classification = loan.nplClassification || getNPLClassification(dpd);
                      const meta = getNPLClassificationMeta(classification);

                      return (
                        <tr key={loan.id} className="hover:bg-[#0F2440] transition-colors">
                          <td className="px-4 py-3 font-sans">
                            <div className="font-bold text-white">{loan.applicantName}</div>
                            <div className="text-[11px] text-slate-400 line-clamp-1">{loan.businessName || 'Microbiz Trader'}</div>
                            <div className="text-[10px] text-blue-400 font-mono mt-0.5">{loan.id}</div>
                          </td>
                          <td className="px-4 py-3 font-sans">
                            <div className="text-slate-200">{loan.channel || 'MICROBIZ_MFB'}</div>
                            <div className="text-[10px] text-blue-300 font-mono">{loan.officerRegistrationNumber || 'REG/MFB/CO-3392'}</div>
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-white">
                            ₦{loan.amount.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              dpd === 0 ? 'bg-emerald-950 text-emerald-300' :
                              dpd <= 30 ? 'bg-amber-950 text-amber-300' :
                              dpd <= 90 ? 'bg-orange-950 text-orange-300' :
                              'bg-rose-950 text-rose-300'
                            }`}>
                              {dpd} DPD
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center font-sans">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${meta.badgeClass}`}>
                              {meta.shortLabel}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right text-rose-300 font-bold">
                            ₦{(loan.overdueAmount || 0).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-center font-sans">
                            {loan.remediationPlan ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-600">
                                {loan.remediationPlan.status.replace(/_/g, ' ')}
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-500">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center font-sans">
                            <div className="flex items-center justify-center space-x-1.5">
                              <button
                                onClick={() => setRemediatingLoan(loan)}
                                className="p-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white transition-colors"
                                title="Action Remediation"
                              >
                                <Gavel className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onSelectLoan(loan)}
                                className="p-1.5 rounded-lg bg-[#07111E] hover:bg-[#16365C] border border-[#1E3A5F] text-slate-300 hover:text-white transition-colors"
                                title="Inspect Full Dossier"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 6: REGULATORY CBN RETURN (e-FASS PR-4) */}
      {/* ========================================================= */}
      {activeTab === 'cbn_return' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          <div className="p-6 rounded-2xl bg-[#091527] border border-[#1E3A5F] shadow-xl space-y-6">
            
            {/* Header with CBN Regulatory Watermark */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#1E3A5F] gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-600">
                    CBN e-FASS SCHEDULE PR-4
                  </span>
                  <span className="text-xs text-slate-400">Prudential Reporting Period: Q3 2026</span>
                </div>
                <h3 className="text-lg font-black text-white mt-1">
                  Central Bank of Nigeria (CBN) Credit Portfolio Risk Quality & Impairment Return
                </h3>
                <p className="text-xs text-slate-400">
                  Institution: Microbiz Microfinance Bank Ltd (RC: 1049281) • Category: National MFB
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePrintReport}
                  className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Statutory Return</span>
                </button>
              </div>
            </div>

            {/* Statutory Summary Table */}
            <div className="overflow-x-auto rounded-xl border border-[#1E3A5F]">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#07111E] text-slate-400 uppercase tracking-wider font-semibold border-b border-[#1E3A5F]">
                  <tr>
                    <th className="px-4 py-3 font-sans">CBN Classification Category</th>
                    <th className="px-4 py-3 text-center font-sans">Days Past Due (DPD)</th>
                    <th className="px-4 py-3 text-right font-sans">Gross Outstanding (₦)</th>
                    <th className="px-4 py-3 text-center font-sans">% Portfolio</th>
                    <th className="px-4 py-3 text-center font-sans">Mandatory Reserve %</th>
                    <th className="px-4 py-3 text-right font-sans">Required Provision (₦)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E3A5F] bg-[#091527]">
                  <tr>
                    <td className="px-4 py-3 font-bold text-emerald-400 font-sans">1. Performing (Stage 1)</td>
                    <td className="px-4 py-3 text-center text-slate-300">0 DPD</td>
                    <td className="px-4 py-3 text-right text-white">₦{summary.performingValue.toLocaleString()}</td>
                    <td className="px-4 py-3 text-center text-slate-300">
                      {summary.totalPortfolioValue > 0 ? ((summary.performingValue / summary.totalPortfolioValue) * 100).toFixed(1) : 0}%
                    </td>
                    <td className="px-4 py-3 text-center text-slate-300">1.0%</td>
                    <td className="px-4 py-3 text-right text-emerald-300">₦{Math.round(summary.performingValue * 0.01).toLocaleString()}</td>
                  </tr>

                  <tr>
                    <td className="px-4 py-3 font-bold text-amber-400 font-sans">2. Watchlist / Special Mention (Stage 2)</td>
                    <td className="px-4 py-3 text-center text-slate-300">1 - 30 DPD</td>
                    <td className="px-4 py-3 text-right text-white">₦{summary.watchlistValue.toLocaleString()}</td>
                    <td className="px-4 py-3 text-center text-slate-300">
                      {summary.totalPortfolioValue > 0 ? ((summary.watchlistValue / summary.totalPortfolioValue) * 100).toFixed(1) : 0}%
                    </td>
                    <td className="px-4 py-3 text-center text-slate-300">5.0%</td>
                    <td className="px-4 py-3 text-right text-amber-300">₦{Math.round(summary.watchlistValue * 0.05).toLocaleString()}</td>
                  </tr>

                  <tr>
                    <td className="px-4 py-3 font-bold text-orange-400 font-sans">3. Substandard (Stage 3 NPL)</td>
                    <td className="px-4 py-3 text-center text-slate-300">31 - 90 DPD</td>
                    <td className="px-4 py-3 text-right text-white">₦{summary.substandardValue.toLocaleString()}</td>
                    <td className="px-4 py-3 text-center text-slate-300">
                      {summary.totalPortfolioValue > 0 ? ((summary.substandardValue / summary.totalPortfolioValue) * 100).toFixed(1) : 0}%
                    </td>
                    <td className="px-4 py-3 text-center text-slate-300">10.0%</td>
                    <td className="px-4 py-3 text-right text-orange-300">₦{Math.round(summary.substandardValue * 0.10).toLocaleString()}</td>
                  </tr>

                  <tr>
                    <td className="px-4 py-3 font-bold text-rose-400 font-sans">4. Doubtful (Stage 3 NPL)</td>
                    <td className="px-4 py-3 text-center text-slate-300">91 - 180 DPD</td>
                    <td className="px-4 py-3 text-right text-white">₦{summary.doubtfulValue.toLocaleString()}</td>
                    <td className="px-4 py-3 text-center text-slate-300">
                      {summary.totalPortfolioValue > 0 ? ((summary.doubtfulValue / summary.totalPortfolioValue) * 100).toFixed(1) : 0}%
                    </td>
                    <td className="px-4 py-3 text-center text-slate-300">50.0%</td>
                    <td className="px-4 py-3 text-right text-rose-300">₦{Math.round(summary.doubtfulValue * 0.50).toLocaleString()}</td>
                  </tr>

                  <tr>
                    <td className="px-4 py-3 font-bold text-red-500 font-sans">5. Lost (Stage 3 Impaired)</td>
                    <td className="px-4 py-3 text-center text-slate-300">&gt; 180 DPD</td>
                    <td className="px-4 py-3 text-right text-white">₦{summary.lostValue.toLocaleString()}</td>
                    <td className="px-4 py-3 text-center text-slate-300">
                      {summary.totalPortfolioValue > 0 ? ((summary.lostValue / summary.totalPortfolioValue) * 100).toFixed(1) : 0}%
                    </td>
                    <td className="px-4 py-3 text-center text-slate-300">100.0%</td>
                    <td className="px-4 py-3 text-right text-red-400">₦{Math.round(summary.lostValue * 1.00).toLocaleString()}</td>
                  </tr>

                  {/* Total Row */}
                  <tr className="bg-[#07111E] font-bold text-white border-t-2 border-[#1E3A5F]">
                    <td className="px-4 py-3.5 font-sans">TOTAL CREDIT PORTFOLIO</td>
                    <td className="px-4 py-3.5 text-center font-sans">—</td>
                    <td className="px-4 py-3.5 text-right font-mono">₦{summary.totalPortfolioValue.toLocaleString()}</td>
                    <td className="px-4 py-3.5 text-center font-mono">100.0%</td>
                    <td className="px-4 py-3.5 text-center font-sans">—</td>
                    <td className="px-4 py-3.5 text-right font-mono text-emerald-400">₦{summary.totalRequiredProvisions.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Key Ratios & Attestations */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-3.5 rounded-xl bg-[#07111E] border border-[#1E3A5F]">
                <span className="text-[11px] text-slate-400 block">Gross NPL Ratio (PAR 90)</span>
                <span className={`text-base font-bold font-mono mt-1 block ${summary.isCbnCompliant ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {summary.par90}% (Ceiling: 5.0%)
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#07111E] border border-[#1E3A5F]">
                <span className="text-[11px] text-slate-400 block">Provision Coverage Ratio</span>
                <span className="text-base font-bold text-blue-300 font-mono mt-1 block">
                  112.4% (Booked vs Required)
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#07111E] border border-[#1E3A5F]">
                <span className="text-[11px] text-slate-400 block">Regulatory Filing Status</span>
                <span className="text-base font-bold text-emerald-400 font-mono mt-1 block flex items-center space-x-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Ready for e-FASS Upload</span>
                </span>
              </div>
            </div>

            {/* Signatory Stamping Box */}
            <div className="p-4 rounded-xl bg-[#07111E] border border-[#1E3A5F] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
              <div>
                <span className="text-slate-400 block">Statutory Signatories:</span>
                <span className="text-white font-semibold">
                  Dr. Anthony Chinedu Mbah (MD/CEO) • Babatunde Lawal (Head of Internal Audit)
                </span>
              </div>
              <div className="text-right text-slate-400 font-mono text-[10px]">
                Cryptographic Anchor: SHA256-CBN-eFASS-Q3-2026-OK
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* 4. LOAN REMEDIATION & RECOVERY MODAL */}
      {/* ========================================================= */}
      {remediatingLoan && (
        <LoanRemediationModal
          loan={remediatingLoan}
          onClose={() => setRemediatingLoan(null)}
          onApplyRemediation={(loanId, updatedPlan, actionDesc) => {
            if (onUpdateLoanRemediation) {
              onUpdateLoanRemediation(loanId, updatedPlan, actionDesc);
            }
          }}
        />
      )}

    </div>
  );
};
