import React from 'react';
import { 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  ShieldAlert, 
  Wallet, 
  FileCheck, 
  ArrowUpRight, 
  Sparkles,
  Layers,
  Database,
  Users,
  ShieldCheck,
  Compass,
  Award,
  Hash
} from 'lucide-react';
import { LoanApplication, MicrobizChannel } from '../types';
import { formatCurrency } from '../utils/crypto';
import { MICROBIZ_CHANNELS, REGISTERED_CREDIT_OFFICERS } from '../utils/channels';

interface DashboardAnalyticsProps {
  loans: LoanApplication[];
}

export const DashboardAnalytics: React.FC<DashboardAnalyticsProps> = ({ loans }) => {
  const totalVolume = loans.reduce((acc, l) => acc + l.amount, 0);
  const disbursedLoans = loans.filter(l => l.status === 'DISBURSED');
  const disbursedVolume = disbursedLoans.reduce((acc, l) => acc + l.amount, 0);
  
  const approvedLoans = loans.filter(l => l.status === 'APPROVED' || l.status === 'DISBURSED');
  const approvalRate = loans.length ? Math.round((approvedLoans.length / loans.length) * 100) : 0;

  const averageCreditScore = Math.round(
    loans.reduce((acc, l) => acc + (l.creditScore || 700), 0) / (loans.length || 1)
  );

  // Microbiz Group Channel Metrics
  const micLoans = loans.filter(l => l.channel === 'MICROBIZ_INCLUSION_CENTRE');
  const mfbLoans = loans.filter(l => l.channel === 'MICROBIZ_MFB');
  const pecLoans = loans.filter(l => l.channel === 'PEAK_EMPOWERMENT_CENTRE');

  const micVol = micLoans.reduce((sum, l) => sum + l.amount, 0);
  const mfbVol = mfbLoans.reduce((sum, l) => sum + l.amount, 0);
  const pecVol = pecLoans.reduce((sum, l) => sum + l.amount, 0);

  return (
    <div className="space-y-5">
      
      {/* FINCORE Executive Banner */}
      <div className="bg-[#0B1E36] border border-[#1E3A5F] rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold text-white tracking-tight">
                FINCORE™ Executive Operations & Channel Tracing Analytics
              </h2>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-700">
                LIVE CBS SYNC
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Integrated monitoring across Microbiz Inclusion Centre, Microbiz MFB, and Peak Empowerment Centre platforms.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs text-slate-300">
          <span className="font-mono bg-[#091527] px-2.5 py-1 rounded-lg border border-[#1E3A5F]">
            CBN License: <strong className="text-blue-400">MFB/2019/042</strong>
          </span>
        </div>
      </div>

      {/* Top Headline Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Disbursed */}
        <div className="bg-[#0B1E36] border border-[#1E3A5F] rounded-2xl p-5 hover:border-blue-500/50 transition-all shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">Total Disbursed Volume</span>
            <div className="w-8 h-8 rounded-lg bg-blue-950/80 border border-blue-700/60 flex items-center justify-center text-blue-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-white tracking-tight">{formatCurrency(disbursedVolume)}</span>
          </div>
          <div className="mt-2 flex items-center text-xs text-blue-300 font-medium">
            <TrendingUp className="w-3.5 h-3.5 mr-1 text-blue-400" />
            <span>+34.8% vs last month via Fincore engine</span>
          </div>
        </div>

        {/* Turnaround Time (TAT) */}
        <div className="bg-[#0B1E36] border border-[#1E3A5F] rounded-2xl p-5 hover:border-blue-500/50 transition-all shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">Average Approval TAT</span>
            <div className="w-8 h-8 rounded-lg bg-blue-950/80 border border-blue-700/60 flex items-center justify-center text-blue-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-white tracking-tight">4.2 Minutes</span>
            <span className="text-xs text-slate-400 line-through">14 Days (Manual)</span>
          </div>
          <div className="mt-2 flex items-center text-xs text-blue-300 font-medium">
            <Sparkles className="w-3.5 h-3.5 mr-1 text-blue-400" />
            <span>98.6% faster than paper MFB files</span>
          </div>
        </div>

        {/* Approval Rate & Automation */}
        <div className="bg-[#0B1E36] border border-[#1E3A5F] rounded-2xl p-5 hover:border-blue-500/50 transition-all shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">Automated Decision Rate</span>
            <div className="w-8 h-8 rounded-lg bg-blue-950/80 border border-blue-700/60 flex items-center justify-center text-blue-400">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-white tracking-tight">{approvalRate}%</span>
            <span className="text-xs text-blue-300">({approvedLoans.length}/{loans.length} sanctioned)</span>
          </div>
          <div className="mt-2 flex items-center text-xs text-blue-300 font-medium">
            <span>Avg Credit Score: <strong className="text-white">{averageCreditScore} / 850</strong></span>
          </div>
        </div>

        {/* Registered Credit Officers */}
        <div className="bg-[#0B1E36] border border-[#1E3A5F] rounded-2xl p-5 hover:border-blue-500/50 transition-all shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">Registered Credit Officers</span>
            <div className="w-8 h-8 rounded-lg bg-blue-950/80 border border-blue-700/60 flex items-center justify-center text-blue-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-white tracking-tight">{REGISTERED_CREDIT_OFFICERS.length} Officers</span>
          </div>
          <div className="mt-2 flex items-center text-xs text-slate-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 mr-1 text-blue-400" />
            <span>100% Licensed & Traced on PoA Ledger</span>
          </div>
        </div>

      </div>

      {/* MICROBIZ GROUP PLATFORMS & CHANNELS DISTRIBUTION PANEL */}
      <div className="bg-[#0B1E36] border border-[#1E3A5F] rounded-2xl p-5 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1E3A5F] pb-3">
          <div className="flex items-center space-x-2">
            <Compass className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Microbiz Group Channel Origination & Platform Portfolio
            </h3>
          </div>
          <span className="text-xs text-blue-300 font-mono">
            Total Channels Volume: <strong className="text-white">{formatCurrency(totalVolume)}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Microbiz Inclusion Centre */}
          <div className="bg-[#091527] border border-[#1E3A5F] rounded-xl p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-950 text-blue-200 border border-blue-700">
                  MIC • INCLUSION
                </span>
                <h4 className="font-bold text-white text-sm mt-1.5">Microbiz Inclusion Centre</h4>
                <p className="text-[11px] text-slate-400">Grassroots market stall & nano-trader financial inclusion outreach.</p>
              </div>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-[#1E3A5F] text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Active Facilities:</span>
                <span className="font-bold text-white">{micLoans.length} Loans</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Capital Portfolio:</span>
                <span className="font-mono font-bold text-blue-300">{formatCurrency(micVol)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Lead Officer:</span>
                <span className="font-mono text-slate-300 text-[11px]">REG/MIC/CO-1088</span>
              </div>
            </div>
          </div>

          {/* Microbiz MFB */}
          <div className="bg-[#091527] border border-[#1E3A5F] rounded-xl p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-900 text-white border border-blue-400">
                  MFB • COMMERCIAL
                </span>
                <h4 className="font-bold text-white text-sm mt-1.5">Microbiz Microfinance Bank</h4>
                <p className="text-[11px] text-slate-400">Core licensed commercial banking, SME working capital, and asset finance.</p>
              </div>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-[#1E3A5F] text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Active Facilities:</span>
                <span className="font-bold text-white">{mfbLoans.length} Loans</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Capital Portfolio:</span>
                <span className="font-mono font-bold text-blue-300">{formatCurrency(mfbVol)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Lead Officer:</span>
                <span className="font-mono text-slate-300 text-[11px]">REG/MFB/CO-3392</span>
              </div>
            </div>
          </div>

          {/* Peak Empowerment Centre */}
          <div className="bg-[#091527] border border-[#1E3A5F] rounded-xl p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-950 text-blue-200 border border-blue-700">
                  PEC • EMPOWERMENT
                </span>
                <h4 className="font-bold text-white text-sm mt-1.5">Peak Empowerment Centre</h4>
                <p className="text-[11px] text-slate-400">Social empowerment, youth agri-tech hubs, and women cooperative loans.</p>
              </div>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-[#1E3A5F] text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Active Facilities:</span>
                <span className="font-bold text-white">{pecLoans.length} Loans</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Capital Portfolio:</span>
                <span className="font-mono font-bold text-blue-300">{formatCurrency(pecVol)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Lead Officer:</span>
                <span className="font-mono text-slate-300 text-[11px]">REG/PEC/CO-5514</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Underwriting Pipeline & System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Pipeline Distribution */}
        <div className="lg:col-span-2 bg-[#0B1E36] border border-[#1E3A5F] rounded-2xl p-5 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">FINCORE™ Underwriting & Settlement Pipeline</h3>
              <p className="text-xs text-slate-400">
                End-to-end progression from borrower intake to Core Banking instant credit
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-[#091527] border border-[#1E3A5F] text-blue-300 font-mono">
              Pipeline: {formatCurrency(totalVolume)}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            
            <div className="bg-[#091527] border border-[#1E3A5F] rounded-xl p-3">
              <div className="text-xs text-slate-400 mb-1">1. Digital Intake</div>
              <div className="text-xl font-bold text-white">
                {loans.filter(l => l.status === 'SUBMITTED').length}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">BVN + NIN Biometrics</div>
            </div>

            <div className="bg-[#091527] border border-[#1E3A5F] rounded-xl p-3">
              <div className="text-xs text-blue-400 mb-1">2. Bureau & Collateral</div>
              <div className="text-xl font-bold text-blue-400">
                {loans.filter(l => l.status === 'DOCS_VERIFIED' || l.status === 'CREDIT_EVALUATED').length}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">CRC & Title Deed Forensic</div>
            </div>

            <div className="bg-[#091527] border border-[#1E3A5F] rounded-xl p-3">
              <div className="text-xs text-blue-300 mb-1">3. Officer Decision</div>
              <div className="text-xl font-bold text-white">
                {loans.filter(l => l.status === 'OFFICER_REVIEW').length}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Underwriter Sanction</div>
            </div>

            <div className="bg-[#091527] border border-[#1E3A5F] rounded-xl p-3">
              <div className="text-xs text-blue-400 mb-1">4. CBS Disbursed</div>
              <div className="text-xl font-bold text-white">
                {disbursedLoans.length}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">PoA Blockchain Anchored</div>
            </div>

          </div>
        </div>

        {/* Regulatory Rail Status Card */}
        <div className="bg-[#0B1E36] border border-[#1E3A5F] rounded-2xl p-5 flex flex-col justify-between shadow-md">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-white">Compliance & Gateway Health</span>
              <span className="px-2 py-0.5 text-[10px] font-medium bg-blue-950 text-blue-300 border border-blue-700 rounded">
                CBN Compliant
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every facility sanction binds an automated NIBSS e-Mandate, records the officer registration number, and anchors a SHA-256 hash onto the consortium ledger.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-[#1E3A5F] space-y-2 text-xs">
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">NIBSS Instant Payment (NIP):</span>
              <span className="text-blue-300 font-medium">Connected (0.38s)</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">CRC & FirstCentral Gateway:</span>
              <span className="text-blue-300 font-medium">Active (100% uptime)</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Consortium PoA Node:</span>
              <span className="text-blue-300 font-medium font-mono">Node-01 Verified</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
