import React, { useState } from 'react';
import { 
  Database, 
  RefreshCw, 
  CheckCircle2, 
  Send, 
  ArrowDownRight, 
  Check, 
  Copy, 
  ShieldCheck,
  Building,
  Key,
  Layers,
  Sparkles
} from 'lucide-react';
import { CBSTransaction } from '../types';
import { formatCurrency } from '../utils/crypto';

interface CoreBankingConsoleProps {
  transactions: CBSTransaction[];
  onManualSync?: () => void;
}

export const CoreBankingConsole: React.FC<CoreBankingConsoleProps> = ({
  transactions,
  onManualSync
}) => {
  const [accountQuery, setAccountQuery] = useState('0128938472');
  const [inquiryResult, setInquiryResult] = useState<{
    accountName: string;
    accountNumber: string;
    bvn: string;
    status: string;
    tier: string;
    balance: number;
  } | null>({
    accountName: 'Amina Bello Garba',
    accountNumber: '0128938472',
    bvn: '22199048123',
    status: 'ACTIVE_TIER_3',
    tier: 'Tier 3 Full KYC',
    balance: 1420500
  });
  const [inquiryLoading, setInquiryLoading] = useState(false);
  const [copiedTx, setCopiedTx] = useState<string | null>(null);

  const handleInquire = () => {
    setInquiryLoading(true);
    setTimeout(() => {
      setInquiryResult({
        accountName: accountQuery.endsWith('2') ? 'Amina Bello Garba' : 'Chinedu Okafor',
        accountNumber: accountQuery,
        bvn: '22' + Math.floor(100000000 + Math.random() * 900000000),
        status: 'ACTIVE_TIER_3',
        tier: 'Tier 3 (Unrestricted CBN Limits)',
        balance: 2450000 + Math.floor(Math.random() * 1000000)
      });
      setInquiryLoading(false);
    }, 600);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTx(id);
    setTimeout(() => setCopiedTx(null), 2000);
  };

  return (
    <div className="bg-[#0B1E36] border border-[#1E3A5F] rounded-2xl p-5 shadow-xl space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#1E3A5F] pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Database className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-white tracking-tight">FINCORE™ Core Banking (CBS) Gateway & General Ledgers</h2>
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-blue-950 text-blue-300 border border-blue-800 rounded-full">
              Temenos T24 vR23 • Live Bridge
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Automated double-entry GL journal postings, direct NIBSS NIP settlement, and mandate verification.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-[#091527] border border-[#1E3A5F] flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
            <span className="text-slate-300">NIP Rails: <strong className="text-blue-300">ONLINE (0.42s)</strong></span>
          </div>

          {onManualSync && (
            <button
              onClick={onManualSync}
              className="p-2 bg-[#091527] hover:bg-[#0F2440] border border-[#1E3A5F] text-slate-300 hover:text-white rounded-xl transition-colors"
              title="Sync Ledger"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* CBS General Ledgers & Real-time Account Validator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* General Ledger Positions */}
        <div className="lg:col-span-1 bg-[#091527] p-4 rounded-xl border border-[#1E3A5F] space-y-3">
          <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center justify-between">
            <span>Microbiz MFB General Ledgers</span>
            <span className="text-[10px] text-blue-400 font-mono">FINCORE-GL</span>
          </h3>
          <div className="space-y-2 text-xs">
            <div className="p-2.5 bg-[#0B1E36] rounded-lg border border-[#1E3A5F]">
              <div className="text-[10px] text-slate-400">GL-104020: Retail & SME Loans Asset</div>
              <div className="text-sm font-bold text-white mt-0.5">₦148,500,000.00</div>
              <div className="text-[10px] text-blue-300 mt-1">+₦4.5M branch walk-in disbursal today</div>
            </div>

            <div className="p-2.5 bg-[#0B1E36] rounded-lg border border-[#1E3A5F]">
              <div className="text-[10px] text-slate-400">GL-200100: Customer Current & Savings Deposits</div>
              <div className="text-sm font-bold text-white mt-0.5">₦412,980,450.00</div>
              <div className="text-[10px] text-blue-400 mt-1">NIP Settlement Inflow Clearing OK</div>
            </div>

            <div className="p-2.5 bg-[#0B1E36] rounded-lg border border-[#1E3A5F]">
              <div className="text-[10px] text-slate-400">GL-101010: Cash in Vault & Teller Float</div>
              <div className="text-sm font-bold text-white mt-0.5">₦34,220,900.00</div>
              <div className="text-[10px] text-blue-300 mt-1">Counter Cash Float Balanced</div>
            </div>
          </div>
        </div>

        {/* Real-time Account Inquiry via Core API */}
        <div className="lg:col-span-2 bg-[#091527] p-4 rounded-xl border border-[#1E3A5F] space-y-3">
          <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
            Live CBS Account & Mandate Inquiry
          </h3>
          
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter 10-digit NUBAN account number..."
              value={accountQuery}
              onChange={(e) => setAccountQuery(e.target.value)}
              className="flex-1 px-3 py-2 bg-[#0B1E36] border border-[#1E3A5F] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
            />
            <button
              onClick={handleInquire}
              disabled={inquiryLoading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 shadow-sm"
            >
              {inquiryLoading ? 'Querying CBS...' : 'Inquire Account'}
            </button>
          </div>

          {inquiryResult && (
            <div className="p-3.5 bg-[#0B1E36] border border-[#1E3A5F] rounded-xl text-xs space-y-2.5">
              <div className="flex items-center justify-between border-b border-[#1E3A5F] pb-2">
                <div className="flex items-center space-x-2">
                  <Building className="w-4 h-4 text-blue-400" />
                  <span className="font-bold text-white">{inquiryResult.accountName}</span>
                </div>
                <span className="px-2 py-0.5 text-[10px] bg-blue-950 text-blue-300 border border-blue-700 rounded font-mono font-bold">
                  {inquiryResult.status}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-[11px]">
                <div>
                  <span className="text-slate-400">Account NUBAN:</span>
                  <div className="text-white font-mono font-medium">{inquiryResult.accountNumber}</div>
                </div>
                <div>
                  <span className="text-slate-400">BVN Match:</span>
                  <div className="text-blue-300 font-mono font-medium">{inquiryResult.bvn} (Validated)</div>
                </div>
                <div>
                  <span className="text-slate-400">Available Balance:</span>
                  <div className="text-white font-bold">{formatCurrency(inquiryResult.balance)}</div>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Disbursal & Mandate Settlement Log */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          CBS Real-time Transaction Ledger & Disbursal Audit Trail
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#1E3A5F] bg-[#091527] text-[10px] uppercase tracking-wider text-slate-400">
                <th className="py-2.5 px-3">CBS Ref / TxID</th>
                <th className="py-2.5 px-3">Beneficiary Account</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3">GL Posting</th>
                <th className="py-2.5 px-3">NIBSS e-Mandate</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E3A5F]/60 font-mono text-[11px]">
              {transactions.map((tx) => (
                <tr key={tx.txId} className="hover:bg-blue-950/20 transition-colors">
                  <td className="py-2.5 px-3">
                    <div className="font-bold text-white">{tx.cbsReference}</div>
                    <div className="text-[10px] text-slate-500">{tx.txId}</div>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="text-slate-200 font-sans font-medium">{tx.accountName}</div>
                    <div className="text-slate-400 text-[10px]">{tx.accountNumber} • Microbiz MFB</div>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-bold text-white font-sans">{formatCurrency(tx.amount)}</div>
                    <div className="text-[10px] text-slate-500">{new Date(tx.timestamp).toLocaleTimeString()}</div>
                  </td>
                  <td className="py-2.5 px-3 text-[10px]">
                    <div className="text-slate-300">Dr: {tx.glDebitAccount}</div>
                    <div className="text-slate-400">Cr: {tx.glCreditAccount}</div>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="text-blue-400">{tx.mandateId}</div>
                    <div className="text-[10px] text-slate-500">Auto-Debit Registered</div>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] bg-blue-950 text-blue-300 border border-blue-700 font-sans">
                      <CheckCircle2 className="w-2.5 h-2.5 mr-1 text-blue-400" />
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
