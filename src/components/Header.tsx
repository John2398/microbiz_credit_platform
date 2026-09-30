import React, { useState } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Layers, 
  Database, 
  CheckCircle2, 
  ChevronDown, 
  Globe, 
  Radio, 
  UserCheck,
  Store,
  Sparkles,
  Users,
  Compass,
  Award,
  Filter,
  Check,
  Zap,
  Sun,
  Moon,
  Eye
} from 'lucide-react';
import { MicrobizChannel, CreditOfficerRegistration } from '../types';
import { MICROBIZ_CHANNELS, REGISTERED_CREDIT_OFFICERS, BRANCHES_BY_ORGANISATION, ALL_BRANCHES } from '../utils/channels';

interface HeaderProps {
  currentView: 'visualizer' | 'casestudy' | 'officer' | 'walkin';
  setCurrentView: (view: 'visualizer' | 'casestudy' | 'officer' | 'walkin') => void;
  loanCount: number;
  blockCount: number;
  selectedBranch: string;
  onBranchChange: (branch: string) => void;
  selectedChannelFilter?: MicrobizChannel | 'ALL';
  onChannelFilterChange?: (channel: MicrobizChannel | 'ALL') => void;
  currentOfficer?: CreditOfficerRegistration;
  onOfficerChange?: (officer: CreditOfficerRegistration) => void;
  channelLoanCounts?: Record<MicrobizChannel, number>;
  isBlueWhiteTheme?: boolean;
  onToggleTheme?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  setCurrentView,
  loanCount,
  blockCount,
  selectedBranch,
  onBranchChange,
  selectedChannelFilter = 'ALL',
  onChannelFilterChange,
  currentOfficer = REGISTERED_CREDIT_OFFICERS[0],
  onOfficerChange,
  channelLoanCounts = {
    MICROBIZ_INCLUSION_CENTRE: 2,
    MICROBIZ_MFB: 4,
    PEAK_EMPOWERMENT_CENTRE: 2
  },
  isBlueWhiteTheme = true,
  onToggleTheme
}) => {
  const [showOfficerDropdown, setShowOfficerDropdown] = useState(false);
  const [showPlatformModal, setShowPlatformModal] = useState(false);

  return (
    <header className={`sticky top-0 z-40 transition-colors shadow-lg ${
      isBlueWhiteTheme 
        ? 'bg-[#003366] text-white border-b border-[#004C99]' 
        : 'bg-[#091527]/95 backdrop-blur-md border-b border-[#1E3A5F]'
    }`}>
      
      {/* Top Institutional & Regulatory Band (fincore.microbizmfb.com banner) */}
      <div className={`text-[11px] py-1 px-4 sm:px-6 lg:px-8 transition-colors ${
        isBlueWhiteTheme
          ? 'bg-[#00264D] border-b border-[#003D7A] text-blue-100'
          : 'bg-[#060D18] border-b border-[#132B4F] text-slate-400'
      }`}>
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          
          <div className="flex items-center space-x-3">
            <span className="flex items-center space-x-1.5 font-bold text-white tracking-wide">
              <span className="w-2 h-2 rounded-full bg-blue-300 animate-pulse inline-block"></span>
              <span>MICROBIZ GROUP • FINCORE™ BANKING</span>
            </span>
            <span className="text-blue-300/40 hidden sm:inline">|</span>
            <span className="text-blue-200 hidden sm:inline">
              Host: <strong className="text-white font-mono">fincore.microbizmfb.com</strong>
            </span>
            <span className="text-blue-300/40 hidden md:inline">|</span>
            <span className="text-blue-200 hidden md:inline font-medium">
              CBN Regulated (RC-719401) • NDIC Insured • Temenos T24 + PoA Blockchain
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1.5">
              <span className="text-blue-200/80">Day Status:</span>
              <span className="text-white font-medium">15-SEP-2026 (Open)</span>
            </div>
            
            {/* Credit Officer Registration Pill & Switcher */}
            <div className="relative">
              <button
                id="officer-profile-btn"
                onClick={() => setShowOfficerDropdown(!showOfficerDropdown)}
                className={`flex items-center space-x-1.5 px-2.5 py-0.5 rounded-lg border transition-all cursor-pointer ${
                  isBlueWhiteTheme
                    ? 'bg-[#004080] hover:bg-[#004C99] border-blue-400/40 text-white'
                    : 'bg-[#0B1E36] hover:bg-[#112A4D] border-blue-500/40 text-blue-200 hover:text-white'
                }`}
                title="Click to view or switch Credit Officer Registration"
              >
                <Award className="w-3 h-3 text-blue-300" />
                <span className="font-mono font-semibold text-white">{currentOfficer.officerName}</span>
                <span className="text-blue-200 font-mono text-[10px]">({currentOfficer.registrationNumber})</span>
                <span className="text-[10px] px-1 rounded bg-[#00264D] text-blue-200 font-bold">
                  {currentOfficer.channel === 'MICROBIZ_MFB' ? 'MFB' : currentOfficer.channel === 'MICROBIZ_INCLUSION_CENTRE' ? 'MIC' : 'PEC'}
                </span>
                <ChevronDown className="w-3 h-3 text-blue-300 ml-0.5" />
              </button>

              {/* Officer Dropdown Menu */}
              {showOfficerDropdown && (
                <div 
                  className="absolute right-0 mt-1 w-80 bg-[#0B1E36] border border-blue-500/60 rounded-xl shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-left"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-[#1E3A5F] mb-2">
                    <div>
                      <div className="text-xs font-bold text-white">Credit Officer Registration Registry</div>
                      <div className="text-[10px] text-slate-400">Platform Affiliation & Audit Tracing</div>
                    </div>
                    <span className="text-[10px] bg-blue-950 text-blue-300 border border-blue-700 px-1.5 py-0.5 rounded font-mono">
                      CBN Certified
                    </span>
                  </div>

                  <div className="space-y-1.5 max-h-60 overflow-y-auto">
                    {REGISTERED_CREDIT_OFFICERS.map((officer) => {
                      const isCurrent = officer.registrationNumber === currentOfficer.registrationNumber;
                      const channelMeta = MICROBIZ_CHANNELS[officer.channel];
                      return (
                        <button
                          key={officer.registrationNumber}
                          onClick={() => {
                            if (onOfficerChange) onOfficerChange(officer);
                            setShowOfficerDropdown(false);
                          }}
                          className={`w-full p-2 rounded-lg text-left transition-all flex items-start justify-between ${
                            isCurrent 
                              ? 'bg-blue-600/30 border border-blue-400 text-white' 
                              : 'bg-[#081528] hover:bg-[#0F2440] border border-[#1E3A5F] text-slate-300'
                          }`}
                        >
                          <div>
                            <div className="flex items-center space-x-1.5">
                              <span className="text-xs font-bold">{officer.officerName}</span>
                              {isCurrent && <Check className="w-3 h-3 text-blue-400" />}
                            </div>
                            <div className="text-[10px] font-mono text-blue-300 mt-0.5">
                              {officer.registrationNumber}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              {officer.role}
                            </div>
                          </div>
                          <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${channelMeta.badgeClass}`}>
                            {channelMeta.code}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-2 pt-2 border-t border-[#1E3A5F] text-[10px] text-slate-400 flex items-center justify-between">
                    <span>Officer Registration is stamped on every loan for regulatory audit.</span>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* Main Fincore Workstation Navigation Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Fincore Brand & Branch Selector */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 border border-blue-400/40">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-lg text-white tracking-tight">
                    MICROBIZ <span className="text-blue-400">GROUP</span>
                  </span>
                  <button 
                    onClick={() => setShowPlatformModal(true)}
                    className="text-[10px] font-semibold bg-[#112A4D] hover:bg-[#1A3A66] text-blue-300 border border-[#1E3A5F] px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center space-x-1 transition-colors"
                  >
                    <span>3 Platforms</span>
                    <Sparkles className="w-2.5 h-2.5 text-blue-400" />
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 hidden sm:block">
                  Microbiz Inclusion Centre • Microbiz MFB • Peak Empowerment Centre
                </p>
              </div>
            </div>

            {/* Branch Selector Dropdown */}
            <div className="hidden xl:flex items-center ml-2">
              <div className="relative">
                <select
                  value={selectedBranch}
                  onChange={(e) => onBranchChange(e.target.value)}
                  className="bg-[#0B1E36] border border-[#1E3A5F] text-slate-200 text-xs py-1.5 pl-3 pr-8 rounded-xl focus:outline-none focus:border-blue-500 font-medium cursor-pointer"
                >
                  <option value="All Branches (Consolidated)">All Branches (Consolidated - 12 Hubs)</option>
                  
                  <optgroup label="Microbiz Inclusion Centre">
                    {BRANCHES_BY_ORGANISATION.MICROBIZ_INCLUSION_CENTRE.map(branchName => (
                      <option key={branchName} value={branchName}>MIC • {branchName}</option>
                    ))}
                  </optgroup>

                  <optgroup label="Microbiz MFB">
                    {BRANCHES_BY_ORGANISATION.MICROBIZ_MFB.map(branchName => (
                      <option key={branchName} value={branchName}>MFB • {branchName}</option>
                    ))}
                  </optgroup>

                  <optgroup label="Peak Empowerment Centre">
                    {BRANCHES_BY_ORGANISATION.PEAK_EMPOWERMENT_CENTRE.map(branchName => (
                      <option key={branchName} value={branchName}>PEC • {branchName}</option>
                    ))}
                  </optgroup>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Real-time Fincore Core System Health Indicator (Desktop) */}
          <div className="hidden lg:flex items-center space-x-2 text-xs">
            <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full border ${
              isBlueWhiteTheme
                ? 'bg-white/10 border-white/20 text-blue-100'
                : 'bg-[#0B1E36] border-[#1E3A5F] text-slate-300'
            }`}>
              <Database className="w-3.5 h-3.5 text-blue-300" />
              <span>CBS: <strong className="text-white font-medium">T24 + NIBSS</strong></span>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-300"></span>
            </div>

            <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full border ${
              isBlueWhiteTheme
                ? 'bg-white/10 border-white/20 text-blue-100'
                : 'bg-[#0B1E36] border-[#1E3A5F] text-slate-300'
            }`}>
              <Layers className="w-3.5 h-3.5 text-blue-300" />
              <span>PoA Ledger: <strong className="text-white font-medium">#{blockCount} Blocks</strong></span>
              <CheckCircle2 className="w-3 h-3 text-blue-300" />
            </div>

            <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full border ${
              isBlueWhiteTheme
                ? 'bg-white/10 border-white/20 text-blue-100'
                : 'bg-[#0B1E36] border-[#1E3A5F] text-slate-300'
            }`}>
              <Radio className="w-3.5 h-3.5 text-blue-300" />
              <span>Tracing: <strong className="text-white font-medium font-mono">Active</strong></span>
            </div>
          </div>

          {/* Fincore Workstation Switcher & Theme Toggle */}
          <div className="flex items-center space-x-2">
            
            {/* View Switcher Buttons */}
            <div className={`flex items-center space-x-1 p-1 rounded-xl border ${
              isBlueWhiteTheme
                ? 'bg-[#00264D] border-blue-400/30'
                : 'bg-[#060E1A] border-[#1E3A5F]'
            }`}>
              
              {/* Button 0: Capabilities Visualizer */}
              <button
                id="view-toggle-visualizer-btn"
                onClick={() => setCurrentView('visualizer')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  currentView === 'visualizer'
                    ? isBlueWhiteTheme
                      ? 'bg-white text-[#003366] shadow-md font-bold'
                      : 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : isBlueWhiteTheme
                      ? 'text-blue-100 hover:text-white hover:bg-white/10'
                      : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                <span>Capabilities Visualizer</span>
              </button>

              {/* Button 1: Walk-In Customer Desk */}
              <button
                id="view-toggle-walkin-btn"
                onClick={() => setCurrentView('walkin')}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  currentView === 'walkin'
                    ? isBlueWhiteTheme
                      ? 'bg-white text-[#003366] shadow-md font-bold'
                      : 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : isBlueWhiteTheme
                      ? 'text-blue-100 hover:text-white hover:bg-white/10'
                      : 'text-slate-400 hover:text-white'
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Walk-In Desk</span>
                <span className="sm:hidden">Walk-In</span>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-300"></span>
              </button>

              {/* Button 2: Officer Desk */}
              <button
                id="view-toggle-officer-btn"
                onClick={() => setCurrentView('officer')}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  currentView === 'officer'
                    ? isBlueWhiteTheme
                      ? 'bg-white text-[#003366] shadow-md font-bold'
                      : 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : isBlueWhiteTheme
                      ? 'text-blue-100 hover:text-white hover:bg-white/10'
                      : 'text-slate-400 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Officer Desk</span>
                <span className="sm:hidden">Officer</span>
                <span className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  isBlueWhiteTheme && currentView === 'officer'
                    ? 'bg-[#003366] text-white'
                    : 'bg-blue-900 border border-blue-400/40 text-blue-200'
                }`}>
                  {loanCount}
                </span>
              </button>

              {/* Button 3: Portal */}
              <button
                id="view-toggle-casestudy-btn"
                onClick={() => setCurrentView('casestudy')}
                className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  currentView === 'casestudy'
                    ? isBlueWhiteTheme
                      ? 'bg-white text-[#003366] shadow-md font-bold'
                      : 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : isBlueWhiteTheme
                      ? 'text-blue-100 hover:text-white hover:bg-white/10'
                      : 'text-slate-400 hover:text-white'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span className="hidden md:inline">microbizmfb.com</span>
              </button>

            </div>

            {/* Optional Theme Toggle Button */}
            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                title={isBlueWhiteTheme ? "Switch to Deep Dark Theme" : "Switch to Microbiz Blue-White Theme"}
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  isBlueWhiteTheme 
                    ? 'bg-[#00264D] border-blue-400/30 text-blue-100 hover:bg-[#001F3F]' 
                    : 'bg-[#060E1A] border-[#1E3A5F] text-amber-300 hover:text-white'
                }`}
              >
                {isBlueWhiteTheme ? (
                  <Moon className="w-4 h-4 text-blue-200" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-300" />
                )}
              </button>
            )}

          </div>

        </div>
      </div>

      {/* SECONDARY STRIP: THE 3 MICROBIZ GROUP PLATFORMS & ORIGINATION CHANNELS */}
      <div className={`border-t px-4 sm:px-6 lg:px-8 py-2 transition-colors ${
        isBlueWhiteTheme
          ? 'bg-[#F4F8FC] border-[#D5E4F2] text-slate-700'
          : 'bg-[#071324] border-[#132B4F] text-slate-400'
      }`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs">
          
          <div className="flex items-center space-x-2">
            <span className={`text-[10px] font-mono uppercase tracking-wider font-bold flex items-center space-x-1 ${
              isBlueWhiteTheme ? 'text-[#003366]' : 'text-slate-400'
            }`}>
              <Compass className="w-3 h-3 text-blue-600 inline" />
              <span>Microbiz Group Platforms:</span>
            </span>
            <span className="text-slate-400 hidden sm:inline">•</span>
            <span className={`text-[11px] hidden sm:inline ${isBlueWhiteTheme ? 'text-slate-600' : 'text-slate-400'}`}>
              Loans registered under 3 regulatory origination channels for credit officer tracing
            </span>
          </div>

          {/* 3 Platform Channel Badges & Filter Selector */}
          <div className="flex flex-wrap items-center gap-1.5">
            {onChannelFilterChange && (
              <button
                onClick={() => onChannelFilterChange('ALL')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                  selectedChannelFilter === 'ALL'
                    ? isBlueWhiteTheme
                      ? 'bg-[#003366] text-white shadow-sm font-semibold'
                      : 'bg-blue-600 text-white shadow-sm font-semibold'
                    : isBlueWhiteTheme
                      ? 'bg-white text-slate-700 hover:text-[#003366] border border-blue-200'
                      : 'bg-[#0B1E36] text-slate-400 hover:text-white border border-[#1E3A5F]'
                }`}
              >
                All Platforms ({loanCount})
              </button>
            )}

            {/* 1. Microbiz Inclusion Centre */}
            <button
              onClick={() => onChannelFilterChange && onChannelFilterChange('MICROBIZ_INCLUSION_CENTRE')}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all cursor-pointer ${
                selectedChannelFilter === 'MICROBIZ_INCLUSION_CENTRE'
                  ? isBlueWhiteTheme
                    ? 'bg-[#003366] text-white border-[#003366] shadow-sm font-semibold'
                    : 'bg-blue-800 text-white border-blue-400 ring-1 ring-blue-400/50 shadow-md font-semibold'
                  : isBlueWhiteTheme
                    ? 'bg-white text-slate-700 border-blue-200 hover:border-blue-400'
                    : 'bg-[#0B1E36] text-blue-200 border-[#1E3A5F] hover:border-blue-500/50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span>Microbiz Inclusion Centre</span>
              <span className={`text-[10px] font-mono px-1 rounded ${
                isBlueWhiteTheme ? 'bg-blue-100 text-blue-900 font-bold' : 'bg-[#061224] text-blue-300'
              }`}>
                MIC ({channelLoanCounts.MICROBIZ_INCLUSION_CENTRE || 0})
              </span>
            </button>

            {/* 2. Microbiz MFB */}
            <button
              onClick={() => onChannelFilterChange && onChannelFilterChange('MICROBIZ_MFB')}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all cursor-pointer ${
                selectedChannelFilter === 'MICROBIZ_MFB'
                  ? isBlueWhiteTheme
                    ? 'bg-[#003366] text-white border-[#003366] shadow-sm font-semibold'
                    : 'bg-blue-800 text-white border-blue-400 ring-1 ring-blue-400/50 shadow-md font-semibold'
                  : isBlueWhiteTheme
                    ? 'bg-white text-slate-700 border-blue-200 hover:border-blue-400'
                    : 'bg-[#0B1E36] text-blue-200 border-[#1E3A5F] hover:border-blue-500/50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              <span>Microbiz MFB</span>
              <span className={`text-[10px] font-mono px-1 rounded ${
                isBlueWhiteTheme ? 'bg-blue-100 text-blue-900 font-bold' : 'bg-[#061224] text-blue-300'
              }`}>
                MFB ({channelLoanCounts.MICROBIZ_MFB || 0})
              </span>
            </button>

            {/* 3. Peak Empowerment Centre */}
            <button
              onClick={() => onChannelFilterChange && onChannelFilterChange('PEAK_EMPOWERMENT_CENTRE')}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all cursor-pointer ${
                selectedChannelFilter === 'PEAK_EMPOWERMENT_CENTRE'
                  ? isBlueWhiteTheme
                    ? 'bg-[#003366] text-white border-[#003366] shadow-sm font-semibold'
                    : 'bg-blue-800 text-white border-blue-400 ring-1 ring-blue-400/50 shadow-md font-semibold'
                  : isBlueWhiteTheme
                    ? 'bg-white text-slate-700 border-blue-200 hover:border-blue-400'
                    : 'bg-[#0B1E36] text-blue-200 border-[#1E3A5F] hover:border-blue-500/50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
              <span>Peak Empowerment Centre</span>
              <span className={`text-[10px] font-mono px-1 rounded ${
                isBlueWhiteTheme ? 'bg-blue-100 text-blue-900 font-bold' : 'bg-[#061224] text-blue-300'
              }`}>
                PEC ({channelLoanCounts.PEAK_EMPOWERMENT_CENTRE || 0})
              </span>
            </button>
          </div>

        </div>
      </div>

      {/* MODAL: MICROBIZ GROUP ARCHITECTURE & CHANNEL TRACING EXPLANATION */}
      {showPlatformModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050B14]/80 backdrop-blur-sm">
          <div className="bg-[#0B1E36] border border-blue-500/50 rounded-2xl w-full max-w-2xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#1E3A5F] pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Microbiz Group Architecture & Origination Channels</h3>
                  <p className="text-xs text-slate-400">Institutional division of entities, loan registration channels & credit officer tracing</p>
                </div>
              </div>
              <button 
                onClick={() => setShowPlatformModal(false)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-[#091527] border border-[#1E3A5F]"
              >
                Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-300">
                Under the Microbiz Group framework, all credit facilities are originated and categorized under 
                three core operating platforms that function as regulatory channels. Every facility generates an immutable 
                tracing reference tied directly to the issuing credit officer's registration:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                
                {/* Channel 1 */}
                <div className="p-3.5 rounded-xl bg-[#091C36] border border-blue-600/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-300">Microbiz Inclusion Centre</span>
                    <span className="font-mono text-[10px] bg-blue-900 text-blue-200 px-1.5 py-0.5 rounded">MIC</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {MICROBIZ_CHANNELS.MICROBIZ_INCLUSION_CENTRE.description}
                  </p>
                  <div className="text-[10px] pt-1 border-t border-[#132B4F] text-blue-200">
                    <div className="font-semibold text-white mb-0.5">Branch Network (1 Hub):</div>
                    <div className="font-mono text-emerald-300">• Head Office (Central Area)</div>
                  </div>
                  <div className="pt-1 text-[10px] space-y-0.5 font-mono text-blue-300">
                    <div>Tracing Code: <strong>MIC-TRC-xxxx</strong></div>
                    <div>Officer Reg: <strong>REG/MIC/CO-xxxx</strong></div>
                  </div>
                </div>

                {/* Channel 2 */}
                <div className="p-3.5 rounded-xl bg-[#0B1E36] border border-blue-500 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">Microbiz MFB</span>
                    <span className="font-mono text-[10px] bg-blue-700 text-white px-1.5 py-0.5 rounded">MFB</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {MICROBIZ_CHANNELS.MICROBIZ_MFB.description}
                  </p>
                  <div className="text-[10px] pt-1 border-t border-[#132B4F] text-blue-200">
                    <div className="font-semibold text-white mb-0.5">Branch Network (2 Hubs):</div>
                    <div className="font-mono text-blue-300">• HQ Mpape • Bwari</div>
                  </div>
                  <div className="pt-1 text-[10px] space-y-0.5 font-mono text-blue-300">
                    <div>Tracing Code: <strong>MFB-TRC-xxxx</strong></div>
                    <div>Officer Reg: <strong>REG/MFB/CO-xxxx</strong></div>
                  </div>
                </div>

                {/* Channel 3 */}
                <div className="p-3.5 rounded-xl bg-[#0A182F] border border-blue-700/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-200">Peak Empowerment Centre</span>
                    <span className="font-mono text-[10px] bg-blue-950 text-blue-300 border border-blue-700 px-1.5 py-0.5 rounded">PEC</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {MICROBIZ_CHANNELS.PEAK_EMPOWERMENT_CENTRE.description}
                  </p>
                  <div className="text-[10px] pt-1 border-t border-[#132B4F] text-blue-200">
                    <div className="font-semibold text-white mb-0.5">Branch Network (9 Hubs):</div>
                    <div className="font-mono text-amber-300 text-[9px] leading-tight">
                      Suleja • Lafia 1 • Lafia 2 • Kuje • Keffi • Makurdi • Nasarawa-Toto • Lifecamp • Mararaba
                    </div>
                  </div>
                  <div className="pt-1 text-[10px] space-y-0.5 font-mono text-blue-300">
                    <div>Tracing Code: <strong>PEC-TRC-xxxx</strong></div>
                    <div>Officer Reg: <strong>REG/PEC/CO-xxxx</strong></div>
                  </div>
                </div>

              </div>

              <div className="p-3 rounded-xl bg-[#091527] border border-[#1E3A5F] text-slate-300 space-y-1">
                <div className="font-semibold text-white flex items-center space-x-1.5">
                  <Award className="w-3.5 h-3.5 text-blue-400" />
                  <span>Credit Officer Tracing & Registration Mandate</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Every credit appraisal, verification, and disbursement action is tagged with the officer's verified license number (e.g. <code>REG/MFB/CO-3392</code>), enforcing full traceability across credit committee reviews, CBS settlement, and consortium blockchain blocks.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowPlatformModal(false)}
                className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors"
              >
                Understood & Close
              </button>
            </div>
          </div>
        </div>
      )}

    </header>
  );
};
