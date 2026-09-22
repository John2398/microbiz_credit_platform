import React, { useState } from 'react';
import { 
  Users, 
  Store, 
  Smartphone, 
  TrendingUp, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  Search, 
  ShieldCheck, 
  ArrowUpRight,
  Filter,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { FieldMarketer } from '../types';
import { formatCurrency } from '../utils/crypto';

interface MarketersFieldDeskProps {
  marketers: FieldMarketer[];
  selectedBranch: string;
  onRecordCollection?: (marketerId: string, amount: number) => void;
}

export const MarketersFieldDesk: React.FC<MarketersFieldDeskProps> = ({
  marketers,
  selectedBranch,
  onRecordCollection
}) => {
  const [filterCluster, setFilterCluster] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeMarketer, setActiveMarketer] = useState<FieldMarketer | null>(marketers[0] || null);
  const [collectionAmount, setCollectionAmount] = useState<string>('50000');
  const [collectionSuccess, setCollectionSuccess] = useState<string | null>(null);

  // Filter marketers
  const filteredMarketers = marketers.filter(m => {
    const matchesSearch = 
      m.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.activeTerminalId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.marketCluster.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterCluster === 'ALL') return matchesSearch;
    return matchesSearch && m.marketCluster.toLowerCase().includes(filterCluster.toLowerCase());
  });

  const totalDailyTarget = marketers.reduce((acc, m) => acc + m.dailyCollectionsTarget, 0);
  const totalDailyActual = marketers.reduce((acc, m) => acc + m.dailyCollectionsActual, 0);
  const totalPortfolio = marketers.reduce((acc, m) => acc + m.portfolioValue, 0);
  const collectionPerformance = Math.round((totalDailyActual / totalDailyTarget) * 100);

  const handlePostCollection = () => {
    if (!activeMarketer) return;
    const amt = Number(collectionAmount);
    if (!amt || amt <= 0) return;
    
    if (onRecordCollection) {
      onRecordCollection(activeMarketer.id, amt);
    }
    setCollectionSuccess(`Recorded ₦${amt.toLocaleString()} field remittal for ${activeMarketer.fullName} via POS ${activeMarketer.activeTerminalId}`);
    setTimeout(() => setCollectionSuccess(null), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* FINCORE Header Bar for Marketers Module */}
      <div className="bg-[#0B1E36] border border-[#1E3A5F] rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-blue-900/60 border border-blue-600/40 flex items-center justify-center text-blue-400">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                FINCORE™ Marketers & Agency Field Operations Desk
              </h2>
              <div className="flex items-center space-x-2 mt-0.5">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                  Module: MKT-OPS-v2.4
                </span>
                <span className="text-xs text-slate-400">
                  Live Cash-In/Cash-Out & Field Repayment Synchronization
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-[#091527] border border-[#1E3A5F] text-xs">
            <span className="text-slate-400">Active Branch: </span>
            <strong className="text-white font-medium">{selectedBranch}</strong>
          </div>
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-950/60 border border-blue-700/60 text-blue-300 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
            <span>All Terminals Online</span>
          </div>
        </div>
      </div>

      {/* High-Level Field Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-[#0B1E36] border border-[#1E3A5F] rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Today's Field Target</span>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {formatCurrency(totalDailyTarget)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Expected from {marketers.length} accredited market agents
          </div>
        </div>

        <div className="bg-[#0B1E36] border border-[#1E3A5F] rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Actual Remitted to Vault</span>
            <CheckCircle2 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {formatCurrency(totalDailyActual)}
          </div>
          <div className="text-[11px] text-blue-300 mt-1 flex items-center gap-1">
            <span>{collectionPerformance}% realization rate</span>
            <span className="text-slate-500">•</span>
            <span>Real-time POS push</span>
          </div>
        </div>

        <div className="bg-[#0B1E36] border border-[#1E3A5F] rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Field Supervised Portfolio</span>
            <Store className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {formatCurrency(totalPortfolio)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Across 182 SabiTrader & Minimonie stalls
          </div>
        </div>

        <div className="bg-[#0B1E36] border border-[#1E3A5F] rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Average Field PAR 30+</span>
            <ShieldCheck className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            1.02%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Well below CBN regulatory limit of 5.0%
          </div>
        </div>

      </div>

      {/* Main Two-Column Workstation: Marketers Roster & POS Remittance Terminal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Marketers Roster with Cluster Filter */}
        <div className="lg:col-span-8 bg-[#0B1E36] border border-[#1E3A5F] rounded-2xl p-5 shadow-xl space-y-4">
          
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search marketer name, code, POS ID, or market..."
                className="w-full bg-[#091527] border border-[#1E3A5F] text-slate-200 text-xs pl-9 pr-3 py-2 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={filterCluster}
                onChange={(e) => setFilterCluster(e.target.value)}
                className="bg-[#091527] border border-[#1E3A5F] text-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">All Market Clusters</option>
                <option value="Mpape">New Mpape Market</option>
                <option value="Balogun">Balogun Textile Plaza</option>
                <option value="Kano">Kano Dawanau</option>
                <option value="Wuse">Wuse Zone 4</option>
              </select>
            </div>
          </div>

          {/* Marketers Table */}
          <div className="overflow-x-auto rounded-xl border border-[#1E3A5F]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#091527] text-slate-400 uppercase text-[10px] font-semibold tracking-wider">
                <tr>
                  <th className="p-3">Field Marketer</th>
                  <th className="p-3">Market Cluster</th>
                  <th className="p-3">POS Terminal</th>
                  <th className="p-3">Today Target / Actual</th>
                  <th className="p-3">PAR 30+</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E3A5F]/60">
                {filteredMarketers.map((m) => {
                  const isSelected = activeMarketer?.id === m.id;
                  const pct = Math.round((m.dailyCollectionsActual / m.dailyCollectionsTarget) * 100);
                  return (
                    <tr 
                      key={m.id}
                      onClick={() => setActiveMarketer(m)}
                      className={`cursor-pointer transition-colors ${
                        isSelected 
                          ? 'bg-blue-950/40 border-l-4 border-l-blue-500' 
                          : 'hover:bg-[#0E2442]/60'
                      }`}
                    >
                      <td className="p-3">
                        <div className="font-bold text-white">{m.fullName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{m.code} • {m.phone}</div>
                      </td>
                      <td className="p-3">
                        <div className="text-slate-200 font-medium flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-blue-400 flex-shrink-0" />
                          <span className="truncate max-w-[160px]">{m.marketCluster}</span>
                        </div>
                        <div className="text-[10px] text-slate-400">{m.activeBorrowersCount} Active Stalls</div>
                      </td>
                      <td className="p-3">
                        <div className="font-mono text-slate-300 text-[11px] bg-[#091527] px-2 py-0.5 rounded border border-[#1E3A5F] inline-block">
                          {m.activeTerminalId}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-white">
                          {formatCurrency(m.dailyCollectionsActual)}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Target: {formatCurrency(m.dailyCollectionsTarget)} ({pct}%)
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-700">
                          {m.par30Rate}%
                        </span>
                      </td>
                      <td className="p-3">
                        {m.status === 'ACTIVE_FIELD' && (
                          <span className="inline-flex items-center gap-1 text-blue-300 text-[10px] font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping"></span>
                            <span>In Field ({m.lastPing})</span>
                          </span>
                        )}
                        {m.status === 'AT_BRANCH' && (
                          <span className="inline-flex items-center gap-1 text-blue-400 text-[10px] font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                            <span>At Branch</span>
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMarketer(m);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-[11px] transition-colors"
                        >
                          Select
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>

        {/* Right Column: Selected Marketer Dossier & POS Vault Remittance Terminal */}
        <div className="lg:col-span-4 bg-[#0B1E36] border border-[#1E3A5F] rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-5">
          
          {activeMarketer ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#1E3A5F]">
                <div>
                  <span className="text-[10px] font-mono text-blue-400 uppercase tracking-wider">
                    Assigned Field Officer
                  </span>
                  <h3 className="text-base font-bold text-white">{activeMarketer.fullName}</h3>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-blue-950 border border-blue-800 text-blue-300">
                  {activeMarketer.code}
                </span>
              </div>

              {/* Marketer Quick Stats */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-[#091527] border border-[#1E3A5F]">
                  <span className="text-slate-400 text-[10px]">Supervised Portfolio</span>
                  <div className="font-bold text-white text-sm mt-0.5">
                    {formatCurrency(activeMarketer.portfolioValue)}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-[#091527] border border-[#1E3A5F]">
                  <span className="text-slate-400 text-[10px]">Stalls in Cluster</span>
                  <div className="font-bold text-white text-sm mt-0.5">
                    {activeMarketer.activeBorrowersCount} Merchants
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-[#091527] border border-[#1E3A5F]">
                  <span className="text-slate-400 text-[10px]">Active POS Device</span>
                  <div className="font-mono text-blue-300 text-xs font-semibold mt-0.5">
                    {activeMarketer.activeTerminalId}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-[#091527] border border-[#1E3A5F]">
                  <span className="text-slate-400 text-[10px]">Assigned Cluster</span>
                  <div className="text-slate-200 text-[11px] font-medium truncate mt-0.5">
                    {activeMarketer.marketCluster}
                  </div>
                </div>
              </div>

              {/* POS Daily Remittance Form */}
              <div className="p-4 rounded-xl bg-[#091527] border border-[#1E3A5F] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-blue-400" />
                    <span>Post Daily Cash Remittance</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">GL-101010</span>
                </div>

                <p className="text-[11px] text-slate-400">
                  Accept cash collected in market clusters and credit the branch vault GL account.
                </p>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-300 font-medium">Remittance Amount (NGN)</label>
                  <input
                    type="number"
                    value={collectionAmount}
                    onChange={(e) => setCollectionAmount(e.target.value)}
                    className="w-full bg-[#0B1E36] border border-[#1E3A5F] text-white text-sm px-3 py-2 rounded-lg font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                {collectionSuccess && (
                  <div className="p-2 rounded-lg bg-blue-950/80 border border-blue-700 text-[11px] text-blue-200 flex items-start gap-1.5 animate-in fade-in">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span>{collectionSuccess}</span>
                  </div>
                )}

                <button
                  onClick={handlePostCollection}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-md flex items-center justify-center space-x-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify POS Remittance & Post to CBS</span>
                </button>
              </div>

            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">
              Select a field marketer from the roster to view credentials and post collections.
            </div>
          )}

          <div className="text-[10px] text-slate-500 text-center border-t border-[#1E3A5F]/60 pt-3">
            Integrated with NIBSS E-Settlement & Microbiz Vault Cash Registers.
          </div>

        </div>

      </div>

    </div>
  );
};
