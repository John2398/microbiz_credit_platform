import React, { useState } from 'react';
import { 
  LoanApplication, 
  RemediationPlan 
} from '../types';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Gavel, 
  ShieldAlert, 
  UserCheck, 
  X, 
  Calendar,
  Send,
  Building2,
  Phone,
  DollarSign
} from 'lucide-react';
import { getNPLClassificationMeta } from '../utils/loanMonitoring';

interface LoanRemediationModalProps {
  loan: LoanApplication;
  onClose: () => void;
  onApplyRemediation: (loanId: string, updatedPlan: RemediationPlan, actionDescription: string) => void;
}

export const LoanRemediationModal: React.FC<LoanRemediationModalProps> = ({
  loan,
  onClose,
  onApplyRemediation
}) => {
  const dpd = loan.daysPastDue || 0;
  const nplClassification = loan.nplClassification || 'SUBSTANDARD';
  const meta = getNPLClassificationMeta(nplClassification);

  const [selectedAction, setSelectedAction] = useState<RemediationPlan['status']>(
    loan.remediationPlan?.status || 'DEMAND_NOTICE_ISSUED'
  );
  const [officerNotes, setOfficerNotes] = useState(loan.remediationPlan?.officerNotes || '');
  const [extensionMonths, setExtensionMonths] = useState<number>(loan.remediationPlan?.repaymentExtensionMonths || 3);
  const [revisedMonthly, setRevisedMonthly] = useState<number>(
    loan.remediationPlan?.revisedMonthlyAmount || Math.round((loan.amount * 1.15) / (loan.tenureMonths + 3))
  );
  const [recoveryAgent, setRecoveryAgent] = useState(
    loan.remediationPlan?.assignedRecoveryAgent || 'Apex Debt Recovery & Legal Partners'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleExecute = () => {
    setIsSubmitting(true);
    let desc = '';

    switch (selectedAction) {
      case 'DEMAND_NOTICE_ISSUED':
        desc = `Issued official 14-Day Statutory Demand Notice to ${loan.applicantName} and 2 registered guarantors.`;
        break;
      case 'RESTRUCTURED':
        desc = `Restructured facility: Extended tenure by +${extensionMonths} months. Revised monthly repayment: ₦${revisedMonthly.toLocaleString()}.`;
        break;
      case 'RECOVERY_AGENT_ASSIGNED':
        desc = `Assigned external debt recovery unit: ${recoveryAgent} for on-site enforcement.`;
        break;
      case 'COLLATERAL_FORECLOSURE':
        desc = `Initiated collateral foreclosure procedure on pledged asset: ${loan.collateralDescription || 'Shop inventory and equipment'}.`;
        break;
      case 'LEGAL_RECOVERY':
        desc = `Initiated High Court debt recovery and legal mortgage enforcement proceedings.`;
        break;
      default:
        desc = `Updated remediation status for loan ${loan.id}.`;
    }

    const updatedPlan: RemediationPlan = {
      status: selectedAction,
      initiatedAt: new Date().toISOString(),
      officerNotes,
      repaymentExtensionMonths: selectedAction === 'RESTRUCTURED' ? extensionMonths : undefined,
      revisedMonthlyAmount: selectedAction === 'RESTRUCTURED' ? revisedMonthly : undefined,
      assignedRecoveryAgent: (selectedAction === 'RECOVERY_AGENT_ASSIGNED' || selectedAction === 'COLLATERAL_FORECLOSURE') ? recoveryAgent : undefined
    };

    setTimeout(() => {
      onApplyRemediation(loan.id, updatedPlan, desc);
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#091527] border border-[#1E3A5F] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E3A5F] bg-[#07111E]">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-amber-950/80 border border-amber-600/50 text-amber-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white">Delinquency Remediation & Recovery Action</h3>
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase border ${meta.badgeClass}`}>
                  {meta.shortLabel}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Loan Ref: <span className="font-mono text-blue-300">{loan.id}</span> • {loan.applicantName} ({loan.businessName || 'Micro Enterprise'})
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#0F2440] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[78vh] overflow-y-auto">
          
          {/* Delinquency Summary Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-[#07111E] border border-[#1E3A5F]">
              <span className="text-[11px] text-slate-400 block mb-1">Days Past Due (DPD)</span>
              <div className="flex items-center space-x-1.5">
                <Clock className="w-4 h-4 text-rose-400" />
                <span className="text-base font-bold text-rose-300 font-mono">{dpd} Days</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#07111E] border border-[#1E3A5F]">
              <span className="text-[11px] text-slate-400 block mb-1">Total Overdue Arrears</span>
              <div className="flex items-center space-x-1.5">
                <DollarSign className="w-4 h-4 text-amber-400" />
                <span className="text-base font-bold text-amber-300 font-mono">₦{(loan.overdueAmount || 0).toLocaleString()}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#07111E] border border-[#1E3A5F]">
              <span className="text-[11px] text-slate-400 block mb-1">Total Monitored Balance</span>
              <span className="text-base font-bold text-white font-mono">₦{loan.amount.toLocaleString()}</span>
            </div>

            <div className="p-3 rounded-xl bg-[#07111E] border border-[#1E3A5F]">
              <span className="text-[11px] text-slate-400 block mb-1">Collateral Valuation</span>
              <span className="text-base font-bold text-emerald-400 font-mono">
                ₦{(loan.collateralValuation || loan.amount * 1.5).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Remediation Strategy Selector */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Select Strategic Remediation Pathway
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              
              {/* Option 1: Statutory Demand Notice */}
              <button
                type="button"
                onClick={() => setSelectedAction('DEMAND_NOTICE_ISSUED')}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  selectedAction === 'DEMAND_NOTICE_ISSUED'
                    ? 'bg-amber-950/40 border-amber-500 shadow-md ring-1 ring-amber-500/40'
                    : 'bg-[#07111E] border-[#1E3A5F] hover:border-slate-500'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${selectedAction === 'DEMAND_NOTICE_ISSUED' ? 'bg-amber-600 text-white' : 'bg-[#0F2440] text-amber-400'}`}>
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">1. Issue Statutory Demand Notice</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Serve 14-day formal demand notice on borrower and both co-signer guarantors.
                    </p>
                  </div>
                </div>
              </button>

              {/* Option 2: Loan Restructure */}
              <button
                type="button"
                onClick={() => setSelectedAction('RESTRUCTURED')}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  selectedAction === 'RESTRUCTURED'
                    ? 'bg-blue-950/40 border-blue-500 shadow-md ring-1 ring-blue-500/40'
                    : 'bg-[#07111E] border-[#1E3A5F] hover:border-slate-500'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${selectedAction === 'RESTRUCTURED' ? 'bg-blue-600 text-white' : 'bg-[#0F2440] text-blue-400'}`}>
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">2. Restructure Facility Terms</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Extend amortization tenure and lower weekly/monthly debt service burden.
                    </p>
                  </div>
                </div>
              </button>

              {/* Option 3: External Recovery Agent */}
              <button
                type="button"
                onClick={() => setSelectedAction('RECOVERY_AGENT_ASSIGNED')}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  selectedAction === 'RECOVERY_AGENT_ASSIGNED'
                    ? 'bg-orange-950/40 border-orange-500 shadow-md ring-1 ring-orange-500/40'
                    : 'bg-[#07111E] border-[#1E3A5F] hover:border-slate-500'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${selectedAction === 'RECOVERY_AGENT_ASSIGNED' ? 'bg-orange-600 text-white' : 'bg-[#0F2440] text-orange-400'}`}>
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">3. Assign Field Recovery Unit</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Deploy certified on-ground recovery agents to merchant's market stall.
                    </p>
                  </div>
                </div>
              </button>

              {/* Option 4: Collateral Foreclosure / Legal */}
              <button
                type="button"
                onClick={() => setSelectedAction('COLLATERAL_FORECLOSURE')}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  selectedAction === 'COLLATERAL_FORECLOSURE'
                    ? 'bg-rose-950/40 border-rose-500 shadow-md ring-1 ring-rose-500/40'
                    : 'bg-[#07111E] border-[#1E3A5F] hover:border-slate-500'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${selectedAction === 'COLLATERAL_FORECLOSURE' ? 'bg-rose-600 text-white' : 'bg-[#0F2440] text-rose-400'}`}>
                    <Gavel className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">4. Foreclose Collateral Asset</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Trigger legal lien attachment and court-ordered seizure of pledged property.
                    </p>
                  </div>
                </div>
              </button>

            </div>
          </div>

          {/* Conditional Sub-settings based on Action */}
          {selectedAction === 'RESTRUCTURED' && (
            <div className="p-4 rounded-xl bg-[#07111E] border border-blue-500/40 space-y-4 animate-in fade-in duration-150">
              <h5 className="text-xs font-bold text-blue-300 flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Restructuring Parameters</span>
              </h5>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Tenure Extension (Months)</label>
                  <select
                    value={extensionMonths}
                    onChange={(e) => setExtensionMonths(Number(e.target.value))}
                    className="w-full bg-[#091527] border border-[#1E3A5F] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value={2}>+2 Months (Total: {loan.tenureMonths + 2} mos)</option>
                    <option value={3}>+3 Months (Total: {loan.tenureMonths + 3} mos)</option>
                    <option value={6}>+6 Months (Total: {loan.tenureMonths + 6} mos)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Revised Monthly Repayment (₦)</label>
                  <input
                    type="number"
                    value={revisedMonthly}
                    onChange={(e) => setRevisedMonthly(Number(e.target.value))}
                    className="w-full bg-[#091527] border border-[#1E3A5F] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {(selectedAction === 'RECOVERY_AGENT_ASSIGNED' || selectedAction === 'COLLATERAL_FORECLOSURE') && (
            <div className="p-4 rounded-xl bg-[#07111E] border border-orange-500/40 space-y-4 animate-in fade-in duration-150">
              <h5 className="text-xs font-bold text-orange-300 flex items-center space-x-2">
                <Building2 className="w-4 h-4" />
                <span>External Recovery & Legal Agency Assignment</span>
              </h5>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Assigned Partner Agency</label>
                <select
                  value={recoveryAgent}
                  onChange={(e) => setRecoveryAgent(e.target.value)}
                  className="w-full bg-[#091527] border border-[#1E3A5F] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="Apex Debt Recovery & Legal Partners">Apex Debt Recovery & Legal Partners (Lagos & FCT)</option>
                  <option value="Barrister Kayode Sanusi & Co. (External Recovery Solicitors)">Barrister Kayode Sanusi & Co. (External Recovery Solicitors)</option>
                  <option value="Northern Commercial Asset Recovery Agency">Northern Commercial Asset Recovery Agency (Kano & Kaduna)</option>
                </select>
              </div>
            </div>
          )}

          {/* Officer Remediation Notes */}
          <div>
            <label className="text-[11px] font-semibold text-slate-300 block mb-1.5">
              Risk Officer Remediation Justification & Audit Notes
            </label>
            <textarea
              rows={3}
              value={officerNotes}
              onChange={(e) => setOfficerNotes(e.target.value)}
              placeholder="Detail reasons for chosen remediation action, borrower contact attempts, and expected recovery milestone..."
              className="w-full bg-[#07111E] border border-[#1E3A5F] rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#1E3A5F] bg-[#07111E]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-lg hover:bg-[#0F2440] transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleExecute}
            disabled={isSubmitting}
            className="flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-600/30 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Executing Protocol...' : 'Commit Remediation Directive'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
