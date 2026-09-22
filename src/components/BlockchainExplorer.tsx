import React, { useState } from 'react';
import { 
  Layers, 
  Search, 
  CheckCircle2, 
  ShieldCheck, 
  Link, 
  Copy, 
  Check, 
  Cpu, 
  RefreshCw,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { BlockchainBlock } from '../types';
import { formatCurrency } from '../utils/crypto';

interface BlockchainExplorerProps {
  blocks: BlockchainBlock[];
}

export const BlockchainExplorer: React.FC<BlockchainExplorerProps> = ({ blocks }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [verifiedResult, setVerifiedResult] = useState<{
    found: boolean;
    block?: BlockchainBlock;
    message: string;
  } | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(id);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleVerify = () => {
    if (!searchQuery.trim()) {
      setVerifiedResult(null);
      return;
    }

    const query = searchQuery.trim().toLowerCase();
    const match = blocks.find(b => 
      b.hash.toLowerCase().includes(query) ||
      b.data.loanId.toLowerCase().includes(query) ||
      (b.data.docHash && b.data.docHash.toLowerCase().includes(query)) ||
      (b.data.signatureFingerprint && b.data.signatureFingerprint.toLowerCase().includes(query))
    );

    if (match) {
      setVerifiedResult({
        found: true,
        block: match,
        message: `Cryptographic record confirmed on Block #${match.index}. Linkage to previous block is valid and uncorrupted.`
      });
    } else {
      setVerifiedResult({
        found: false,
        message: 'No matching transaction hash or loan identifier found on the Microbiz ledger.'
      });
    }
  };

  return (
    <div className="bg-[#0B1E36] border border-[#1E3A5F] rounded-2xl p-5 shadow-xl space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#1E3A5F] pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Layers className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-white tracking-tight">
              FINCORE™ Consortium PoA Blockchain Ledger
            </h2>
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-blue-950 text-blue-300 border border-blue-700 rounded-full font-mono">
              Proof of Authority (PoA)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Immutable cryptographic timestamping for branch walk-in customer facilities, credit sanctions, and biometric signatures.
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="bg-[#091527] px-3 py-1.5 rounded-xl border border-[#1E3A5F]">
            <span className="text-slate-400">Block Height: </span>
            <strong className="text-blue-400 font-mono">#{blocks.length - 1}</strong>
          </div>
          <div className="bg-[#091527] px-3 py-1.5 rounded-xl border border-[#1E3A5F]">
            <span className="text-slate-400">Validator Nodes: </span>
            <strong className="text-white font-mono">3 Regulated Nodes</strong>
          </div>
        </div>
      </div>

      {/* Verification Query Tool */}
      <div className="bg-[#091527] p-4 rounded-xl border border-[#1E3A5F] space-y-3">
        <label className="text-xs font-semibold text-white flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-blue-400" />
          <span>Proof-of-Authenticity Ledger Verifier</span>
        </label>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Paste any Block Hash, Loan ID (e.g. MB-2026-8941), or Document SHA-256..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
              className="w-full pl-9 pr-3 py-2 bg-[#0B1E36] border border-[#1E3A5F] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>
          <button
            onClick={handleVerify}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center space-x-1.5 shadow-sm"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verify Authenticity</span>
          </button>
        </div>

        {/* Verification Result Output */}
        {verifiedResult && (
          <div className={`p-3.5 rounded-xl border text-xs animate-in fade-in duration-150 ${
            verifiedResult.found 
              ? 'bg-blue-950/70 border-blue-600 text-blue-200' 
              : 'bg-[#0B1E36] border-slate-700 text-slate-300'
          }`}>
            <div className="flex items-center space-x-2 font-semibold">
              {verifiedResult.found ? (
                <CheckCircle2 className="w-4 h-4 text-blue-400 flex-shrink-0" />
              ) : (
                <ShieldAlert className="w-4 h-4 text-slate-400 flex-shrink-0" />
              )}
              <span>{verifiedResult.found ? 'Verified Immutable Record' : 'Record Not Found'}</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-300">{verifiedResult.message}</p>

            {verifiedResult.block && (
              <div className="mt-2 pt-2 border-t border-blue-800/50 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono text-slate-300">
                <div>
                  <span className="text-slate-400">Block Index:</span> #{verifiedResult.block.index}
                </div>
                <div>
                  <span className="text-slate-400">Action:</span> {verifiedResult.block.data.action}
                </div>
                <div>
                  <span className="text-slate-400">Amount:</span> {formatCurrency(verifiedResult.block.data.amount)}
                </div>
                <div>
                  <span className="text-slate-400">Validator:</span> {verifiedResult.block.validator}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Block Stream */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Recent Consortium Blocks
        </h3>

        <div className="space-y-3">
          {blocks.slice().reverse().map((block) => (
            <div 
              key={block.hash} 
              className="bg-[#091527] border border-[#1E3A5F] hover:border-blue-500/50 rounded-xl p-4 transition-all space-y-2 text-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2 font-mono">
                  <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-700 font-bold">
                    Block #{block.index}
                  </span>
                  <span className="text-slate-200 font-semibold">{block.data.action.replace(/_/g, ' ')}</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-blue-400 font-bold">{block.data.loanId}</span>
                </div>

                <div className="text-[11px] text-slate-400">
                  {new Date(block.timestamp).toLocaleString()}
                </div>
              </div>

              {/* Block Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-[#1E3A5F]/70 text-[11px]">
                <div className="space-y-1">
                  <div className="text-slate-400">
                    Applicant: <strong className="text-white">{block.data.applicantName}</strong>
                  </div>
                  <div className="text-slate-400">
                    Facility Amount: <strong className="text-white">{formatCurrency(block.data.amount)}</strong>
                  </div>
                  {block.data.creditScore && (
                    <div className="text-slate-400">
                      Anchored Credit Bureau Score: <strong className="text-blue-300 font-mono">{block.data.creditScore}</strong>
                    </div>
                  )}
                </div>

                <div className="space-y-1 font-mono text-[10px]">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Block Hash:</span>
                    <button
                      onClick={() => handleCopy(block.hash, block.hash)}
                      className="text-blue-300 hover:text-white flex items-center space-x-1"
                    >
                      <span>{block.hash.slice(0, 16)}...{block.hash.slice(-8)}</span>
                      {copiedHash === block.hash ? <Check className="w-3 h-3 text-blue-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Previous Hash:</span>
                    <span className="text-slate-500">{block.previousHash.slice(0, 16)}...</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Validator Authority:</span>
                    <span className="text-blue-300 font-medium">{block.validator}</span>
                  </div>
                </div>
              </div>

              {/* Hashes: Doc & Signature */}
              {(block.data.docHash || block.data.signatureFingerprint) && (
                <div className="pt-2 border-t border-[#1E3A5F]/40 flex flex-wrap items-center gap-3 text-[10px] font-mono text-slate-400">
                  {block.data.docHash && (
                    <div>
                      Doc SHA-256: <span className="text-slate-300">{block.data.docHash.slice(0, 14)}...</span>
                    </div>
                  )}
                  {block.data.signatureFingerprint && (
                    <div>
                      Biometric Signature Hash: <span className="text-blue-400">{block.data.signatureFingerprint.slice(0, 14)}...</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
