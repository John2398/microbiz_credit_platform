import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  PenTool, 
  UserCheck, 
  ArrowRight, 
  FileText, 
  Award, 
  Lock, 
  Unlock, 
  Sparkles,
  ChevronRight,
  MessageSquare,
  Calendar,
  XCircle,
  Hash
} from 'lucide-react';
import { LoanApplication, ApprovalSignoff, ApprovalLevel } from '../types';
import { 
  APPROVAL_HIERARCHY_LEVELS, 
  getStandardApprovalComment, 
  formatExactDateTime,
  createAuditTrailEvent
} from '../utils/approvalHierarchy';
import { formatCurrency } from '../utils/crypto';

interface MultiTierApprovalFlowProps {
  loan: LoanApplication;
  onAdvanceApproval: (
    level: ApprovalLevel,
    decision: 'APPROVED' | 'REJECTED' | 'QUERIED',
    comments: string,
    signatureDataUrl: string,
    signatoryName: string,
    registrationNumber: string
  ) => void;
  onDisburse?: (loan: LoanApplication) => void;
}

export const MultiTierApprovalFlow: React.FC<MultiTierApprovalFlowProps> = ({
  loan,
  onAdvanceApproval,
  onDisburse
}) => {
  const chain: ApprovalSignoff[] = loan.approvalChain || [];
  
  // Find current active pending level
  const activeLevelSignoff = chain.find(s => s.status === 'IN_REVIEW') || 
                             chain.find(s => s.status === 'PENDING') || 
                             chain[chain.length - 1];

  const [selectedLevel, setSelectedLevel] = useState<ApprovalLevel>(activeLevelSignoff ? activeLevelSignoff.level : 'CREDIT_OFFICER');
  const [commentText, setCommentText] = useState<string>('');
  const [selectedApproverName, setSelectedApproverName] = useState<string>('');
  const [isSigning, setIsSigning] = useState<boolean>(false);
  const [signPadDrawn, setSignPadDrawn] = useState<boolean>(true);

  // Update default comments when level changes
  React.useEffect(() => {
    if (activeLevelSignoff) {
      setSelectedLevel(activeLevelSignoff.level);
      const defaultProfile = APPROVAL_HIERARCHY_LEVELS.find(p => p.level === activeLevelSignoff.level);
      if (defaultProfile) {
        setSelectedApproverName(defaultProfile.defaultSignatoryName);
        setCommentText(activeLevelSignoff.comments || getStandardApprovalComment(activeLevelSignoff.level, loan.applicantName, loan.amount));
      }
    }
  }, [loan.id, loan.currentApprovalLevel]);

  const currentLevelProfile = APPROVAL_HIERARCHY_LEVELS.find(p => p.level === selectedLevel) || APPROVAL_HIERARCHY_LEVELS[0];
  const currentSignoff = chain.find(s => s.level === selectedLevel);

  const approvedCount = chain.filter(s => s.status === 'APPROVED').length;
  const isFullyApproved = approvedCount === 7 && chain.length === 7;
  const isDisbursed = loan.status === 'DISBURSED';

  const handleSignAndSubmit = (decision: 'APPROVED' | 'REJECTED' | 'QUERIED') => {
    setIsSigning(true);
    const signatureSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="48"><path d="M12 32 Q 40 ${12 + currentLevelProfile.levelOrder * 3}, 80 28 T 150 20" stroke="%232563EB" fill="none" stroke-width="2.5"/></svg>`;
    
    setTimeout(() => {
      onAdvanceApproval(
        selectedLevel,
        decision,
        commentText || getStandardApprovalComment(selectedLevel, loan.applicantName, loan.amount),
        signatureSvg,
        selectedApproverName || currentLevelProfile.defaultSignatoryName,
        currentLevelProfile.defaultRegistrationNumber
      );
      setIsSigning(false);
    }, 400);
  };

  return (
    <div className="space-y-6">
      
      {/* Governance & Policy Notice Header */}
      <div className="bg-[#091527] border border-[#1E3A5F] rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-white tracking-tight">
                7-Tier Mandatory Approval Hierarchy & Digital Sign-off Matrix
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-700">
                CBN & POL-CR-2026
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Prudential regulation requires sequential sign-off with recorded datetime logs from Credit Officer up to Managing Director.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="text-right">
            <div className="text-[11px] text-slate-400">Governance Clearance</div>
            <div className="text-sm font-bold font-mono text-white">
              {approvedCount} of 7 Signatures Completed
            </div>
          </div>
          <div className="w-12 h-12 rounded-full border-2 border-blue-500 flex items-center justify-center bg-blue-950 text-xs font-black text-blue-300">
            {Math.round((approvedCount / 7) * 100)}%
          </div>
        </div>
      </div>

      {/* Visual Stepper Progression Horizontal Flow */}
      <div className="bg-[#0B1E36] border border-[#1E3A5F] rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#1E3A5F] pb-3">
          <span className="text-xs font-bold uppercase text-slate-300 tracking-wider">
            Multi-Tier Signatory Chain Progress
          </span>
          <span className="text-xs text-blue-300 font-mono">
            {isFullyApproved ? (
              <span className="text-blue-300 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> All 7 Executive Sign-offs Granted
              </span>
            ) : (
              <span>Awaiting Tier {approvedCount + 1}: {APPROVAL_HIERARCHY_LEVELS[approvedCount]?.shortLabel}</span>
            )}
          </span>
        </div>

        {/* Stepper Node List */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {APPROVAL_HIERARCHY_LEVELS.map((profile, idx) => {
            const signoff = chain.find(s => s.level === profile.level);
            const isApproved = signoff?.status === 'APPROVED';
            const isInReview = signoff?.status === 'IN_REVIEW';
            const isSelected = selectedLevel === profile.level;

            return (
              <button
                key={profile.level}
                onClick={() => setSelectedLevel(profile.level)}
                className={`p-3 rounded-xl text-left border transition-all relative flex flex-col justify-between ${
                  isSelected 
                    ? 'border-blue-400 bg-blue-950/80 ring-2 ring-blue-500/30' 
                    : isApproved
                    ? 'border-blue-800 bg-[#091527] hover:border-blue-600'
                    : isInReview
                    ? 'border-blue-400/80 bg-blue-950/40 hover:border-blue-400 animate-pulse'
                    : 'border-[#1E3A5F] bg-[#07111E] opacity-70 hover:opacity-100'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#060D18] border border-[#1E3A5F] text-slate-300">
                      Tier {profile.levelOrder}
                    </span>
                    {isApproved ? (
                      <CheckCircle2 className="w-4 h-4 text-blue-400" />
                    ) : isInReview ? (
                      <Clock className="w-4 h-4 text-blue-300 animate-spin" />
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-slate-500" />
                    )}
                  </div>
                  <div className="text-xs font-bold text-white leading-snug">
                    {profile.shortLabel}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">
                    {signoff?.signatoryName || profile.defaultSignatoryName}
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-[#1E3A5F]/60 text-[10px]">
                  {isApproved ? (
                    <span className="text-blue-300 font-mono font-medium truncate block">
                      Signed: {signoff?.signedAtFormatted ? signoff.signedAtFormatted.split(',')[1] : 'Logged'}
                    </span>
                  ) : isInReview ? (
                    <span className="text-blue-300 font-bold">Action Pending</span>
                  ) : (
                    <span className="text-slate-500">Queued</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Level Sign-off & Audit Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 7 Columns: Sign-off Details & Digital Signature Form */}
        <div className="lg:col-span-7 bg-[#0B1E36] border border-[#1E3A5F] rounded-2xl p-5 shadow-xl space-y-5">
          
          <div className="flex items-start justify-between border-b border-[#1E3A5F] pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-900 text-white border border-blue-400">
                  TIER {currentLevelProfile.levelOrder} OF 7
                </span>
                <h4 className="text-base font-bold text-white">
                  {currentLevelProfile.roleTitle}
                </h4>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {currentLevelProfile.description}
              </p>
            </div>

            <div className="text-right">
              <div className="text-[11px] text-slate-400">Signatory Registration</div>
              <div className="text-xs font-mono font-bold text-blue-300">
                {currentSignoff?.registrationNumber || currentLevelProfile.defaultRegistrationNumber}
              </div>
            </div>
          </div>

          {/* Current Tier Status Display */}
          {currentSignoff?.status === 'APPROVED' ? (
            <div className="bg-[#091527] border border-blue-800/80 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-blue-400" />
                  <span className="text-sm font-bold text-white">
                    Approval Signed & Datetime Sealed
                  </span>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-700">
                  {currentSignoff.signedAtFormatted || formatExactDateTime(currentSignoff.signedAt)}
                </span>
              </div>

              <div className="text-xs text-slate-300 bg-[#060D18] p-3 rounded-lg border border-[#1E3A5F] leading-relaxed">
                <strong className="text-slate-400 block mb-1">Executive Decision Comment:</strong>
                "{currentSignoff.comments}"
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#1E3A5F] text-xs">
                <div>
                  <div className="text-[11px] text-slate-400">Authorizing Official:</div>
                  <div className="font-bold text-white">{currentSignoff.signatoryName}</div>
                  <div className="text-[10px] font-mono text-slate-400">{currentSignoff.registrationNumber}</div>
                </div>

                {/* Digital Signature Render */}
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 mb-1">Cryptographic Signature Seal</div>
                  <div className="bg-white/90 px-3 py-1 rounded-lg border border-blue-400 shadow-sm inline-block">
                    <img 
                      src={currentSignoff.signatureDataUrl} 
                      alt="Signature" 
                      className="h-8 max-w-[120px] object-contain"
                    />
                  </div>
                  <div className="text-[9px] font-mono text-blue-400 mt-1">
                    Key: {currentSignoff.keyFingerprint || 'pk_ed25519_cert_valid'}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Action Form for Reviewer */
            <div className="space-y-4">
              <div className="bg-[#091527] border border-blue-900/60 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                    <PenTool className="w-3.5 h-3.5 text-blue-400" />
                    Execute Official Level {currentLevelProfile.levelOrder} Sign-off
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    Live Clock: {formatExactDateTime()}
                  </span>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Signatory Name & Title:
                  </label>
                  <input
                    type="text"
                    value={selectedApproverName || currentLevelProfile.defaultSignatoryName}
                    onChange={(e) => setSelectedApproverName(e.target.value)}
                    className="w-full bg-[#060D18] border border-[#1E3A5F] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Mandatory Review Comment & Underwriting Notes:
                  </label>
                  <textarea
                    rows={3}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Enter thorough appraisal assessment, covenants, or reasons for concurrence..."
                    className="w-full bg-[#060D18] border border-[#1E3A5F] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 leading-relaxed font-sans"
                  />
                </div>

                {/* Digital Signature Pad Preview */}
                <div className="bg-[#060D18] border border-[#1E3A5F] rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-medium text-slate-400">Digital Signature Certificate (Ed25519)</span>
                    <span className="text-[10px] font-mono text-blue-400">Auth IP: 10.0.14.{20 + currentLevelProfile.levelOrder}</span>
                  </div>
                  <div className="h-14 bg-white/95 rounded border border-blue-500/50 flex items-center justify-center relative overflow-hidden">
                    <svg className="w-full h-full text-blue-700" viewBox="0 0 300 60">
                      <path 
                        d={`M 20 ${35} Q 80 ${10 + currentLevelProfile.levelOrder * 4}, 160 32 T 280 25`} 
                        stroke="#1D4ED8" 
                        fill="none" 
                        strokeWidth="3"
                      />
                    </svg>
                    <span className="absolute bottom-1 right-2 text-[9px] font-mono text-slate-500">
                      Digitally Sealed • {formatExactDateTime()}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#1E3A5F]">
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => handleSignAndSubmit('QUERIED')}
                      disabled={isSigning}
                      className="px-3 py-2 bg-[#060D18] hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
                    >
                      Query / Request Doc
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSignAndSubmit('REJECTED')}
                      disabled={isSigning}
                      className="px-3 py-2 bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 rounded-lg text-xs font-semibold"
                    >
                      Decline
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSignAndSubmit('APPROVED')}
                    disabled={isSigning}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-600/30 flex items-center space-x-2"
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    <span>
                      {selectedLevel === 'MANAGING_DIRECTOR'
                        ? 'Execute Final MD Approval & Unlock CBS'
                        : `Sign & Escalate to Tier ${currentLevelProfile.levelOrder + 1}`}
                    </span>
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* If All 7 Tiers Approved -> Disbursal Action */}
          {isFullyApproved && !isDisbursed && onDisburse && (
            <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-[#0B1E36] border-2 border-blue-500 rounded-xl p-4 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-sm font-black text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-300" />
                  All 7 Approval Lines Cleared & Certified!
                </div>
                <p className="text-xs text-blue-200 mt-0.5">
                  Full governance sanction verified. Ready to execute instant Temenos T24 core banking disbursal.
                </p>
              </div>

              <button
                type="button"
                onClick={() => onDisburse(loan)}
                className="px-5 py-3 bg-white text-blue-950 hover:bg-blue-50 rounded-xl text-xs font-black shadow-lg uppercase tracking-wider flex items-center space-x-2 whitespace-nowrap"
              >
                <span>Execute CBS Disbursal ({formatCurrency(loan.amount)})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>

        {/* Right 5 Columns: Chronological Datetime Audit Log for every single step */}
        <div className="lg:col-span-5 bg-[#0B1E36] border border-[#1E3A5F] rounded-2xl p-5 shadow-xl space-y-4">
          
          <div className="flex items-center justify-between border-b border-[#1E3A5F] pb-3">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-blue-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Chronological Datetime Audit Log
              </h4>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              {loan.auditTrail?.length || 0} Events Logged
            </span>
          </div>

          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
            {loan.auditTrail && loan.auditTrail.length > 0 ? (
              loan.auditTrail.map((evt, idx) => (
                <div 
                  key={evt.id || idx}
                  className="bg-[#091527] border border-[#1E3A5F] rounded-xl p-3 space-y-1.5 text-xs hover:border-blue-500/50 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-blue-300 text-[11px]">
                      {evt.formattedDatetime || formatExactDateTime(evt.timestamp)}
                    </span>
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold font-mono ${
                      evt.status === 'SUCCESS' ? 'bg-blue-950 text-blue-300 border border-blue-700' :
                      evt.status === 'WARNING' ? 'bg-amber-950 text-amber-300 border border-amber-700' :
                      'bg-slate-800 text-slate-300'
                    }`}>
                      {evt.stage}
                    </span>
                  </div>

                  <div className="font-semibold text-white">
                    {evt.action}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-[#1E3A5F]/60">
                    <span>Actor: <strong className="text-slate-300">{evt.actorName}</strong> ({evt.actorRole})</span>
                    {evt.actorRegistrationNumber && (
                      <span className="font-mono text-blue-400">{evt.actorRegistrationNumber}</span>
                    )}
                  </div>

                  {evt.notes && (
                    <div className="text-[11px] text-slate-400 italic bg-[#060D18] p-1.5 rounded border border-[#1E3A5F]/40">
                      "{evt.notes}"
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-slate-400">
                No audit events recorded yet.
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
