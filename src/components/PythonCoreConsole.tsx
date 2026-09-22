import React, { useState, useEffect } from 'react';
import { 
  Terminal, 
  Code2, 
  Play, 
  CheckCircle2, 
  FileCode, 
  Copy, 
  Check, 
  RefreshCw, 
  Cpu, 
  ShieldCheck, 
  Layers, 
  Download,
  AlertCircle
} from 'lucide-react';

interface PythonModuleInfo {
  name: string;
  description: string;
}

interface PythonEnvInfo {
  runtime: string;
  engine: string;
  package: string;
  rootEntrypoint: string;
  zeroDependencies: boolean;
  files: string[];
  modules: PythonModuleInfo[];
}

export const PythonCoreConsole: React.FC = () => {
  const [envInfo, setEnvInfo] = useState<PythonEnvInfo | null>(null);
  const [selectedFile, setSelectedFile] = useState<string>('main.py');
  const [fileContent, setFileContent] = useState<string>('');
  const [loadingFile, setLoadingFile] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Runner state
  const [executing, setExecuting] = useState<boolean>(false);
  const [terminalOutput, setTerminalOutput] = useState<string>(
    '# FINCORE™ Microbiz MFB Python 3.10+ Native Engine\n# Click "Run Lifecycle Simulation" or "Run Test Suite" below to execute directly in the runtime container.\n'
  );
  const [lastExitCode, setLastExitCode] = useState<number | null>(null);
  const [executionTime, setExecutionTime] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/python/info')
      .then(res => res.json())
      .then(data => setEnvInfo(data))
      .catch(err => console.error('Failed to load python info', err));
  }, []);

  useEffect(() => {
    if (!selectedFile) return;
    setLoadingFile(true);
    fetch(`/api/python/source?file=${selectedFile}`)
      .then(res => res.json())
      .then(data => {
        setFileContent(data.content || '# Error loading file content');
        setLoadingFile(false);
      })
      .catch(err => {
        setFileContent('# Failed to load source file: ' + err.message);
        setLoadingFile(false);
      });
  }, [selectedFile]);

  const handleRunCommand = (commandType: 'simulation' | 'test' | 'audit') => {
    setExecuting(true);
    setTerminalOutput(prev => prev + `\n$ python3 fincore_app.py ${commandType === 'test' ? '--test' : commandType === 'audit' ? '(PoA Audit)' : ''}\n[Executing process in container...]\n`);

    fetch('/api/python/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: commandType })
    })
      .then(res => res.json())
      .then(data => {
        setExecuting(false);
        setLastExitCode(data.exitCode);
        setExecutionTime(data.executionTimeMs);
        setTerminalOutput(data.stdout || data.stderr || 'Command executed with no output.');
      })
      .catch(err => {
        setExecuting(false);
        setLastExitCode(1);
        setTerminalOutput(`Error executing command: ${err.message}`);
      });
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(fileContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Environment Status */}
      <div className="bg-[#0B1E36] border border-[#1E3A5F] rounded-xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-white tracking-tight">FINCORE™ Python 3.10+ Banking Core</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-950 text-blue-300 border border-blue-700">
                  Pure Python stdlib
                </span>
                <span className="px-2 py-0.5 rounded text-xs font-mono bg-[#091527] border border-[#1E3A5F] text-blue-300">
                  {envInfo?.runtime || 'Python 3.10.12'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Zero third-party pip dependencies required. Built with native standard library modules: <code className="text-blue-300">dataclasses</code>, <code className="text-blue-300">hashlib</code>, <code className="text-blue-300">json</code>, and <code className="text-blue-300">http.server</code>.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleRunCommand('simulation')}
              disabled={executing}
              className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-sm transition-all disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{executing ? 'Executing...' : 'Run Simulation'}</span>
            </button>
            <button
              onClick={() => handleRunCommand('test')}
              disabled={executing}
              className="px-3.5 py-2 rounded-lg bg-[#091527] border border-[#1E3A5F] hover:border-blue-400 text-slate-200 hover:text-white text-xs font-semibold flex items-center space-x-1.5 transition-all disabled:opacity-50"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Run Test Suite</span>
            </button>
          </div>
        </div>

        {/* Feature badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5 pt-4 border-t border-[#1E3A5F]">
          <div className="flex items-center space-x-2 text-xs text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
            <span>Double-Entry GL Accounting</span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
            <span>Consortium PoA Blockchain</span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
            <span>Multi-Bureau CRC Scoring</span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
            <span>Field Marketer Vault Remittance</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Code Explorer & Live Interactive Terminal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Module Sidebar & File Explorer (4 cols) */}
        <div className="lg:col-span-4 bg-[#0B1E36] border border-[#1E3A5F] rounded-xl flex flex-col overflow-hidden">
          <div className="p-3.5 border-b border-[#1E3A5F] bg-[#091527] flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileCode className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">Python Modules</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">fincore_python/</span>
          </div>

          <div className="p-2 space-y-1 overflow-y-auto max-h-[580px]">
            {envInfo?.modules.map(mod => {
              const isActive = selectedFile === mod.name;
              return (
                <button
                  key={mod.name}
                  onClick={() => setSelectedFile(mod.name)}
                  className={`w-full text-left p-2.5 rounded-lg text-xs transition-all flex flex-col space-y-1 ${
                    isActive
                      ? 'bg-blue-600/20 border border-blue-500/40 text-blue-200'
                      : 'hover:bg-[#0F2440] text-slate-300 border border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-semibold text-white flex items-center space-x-1.5">
                      <Code2 className="w-3.5 h-3.5 text-blue-400" />
                      <span>{mod.name}</span>
                    </span>
                    {isActive && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">
                        active
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 line-clamp-2">
                    {mod.description}
                  </span>
                </button>
              );
            })}

            {/* Root Entry point */}
            <div className="pt-2 border-t border-[#1E3A5F]/60 mt-2">
              <button
                onClick={() => setSelectedFile('fincore_app.py')}
                className={`w-full text-left p-2.5 rounded-lg text-xs transition-all flex flex-col space-y-1 ${
                  selectedFile === 'fincore_app.py'
                    ? 'bg-blue-600/20 border border-blue-500/40 text-blue-200'
                    : 'hover:bg-[#0F2440] text-slate-300 border border-transparent'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-semibold text-white flex items-center space-x-1.5">
                    <Terminal className="w-3.5 h-3.5 text-blue-400" />
                    <span>fincore_app.py (Root)</span>
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">
                  CLI runner & REST API server entrypoint.
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Source Code Viewer (8 cols) */}
        <div className="lg:col-span-8 bg-[#0B1E36] border border-[#1E3A5F] rounded-xl flex flex-col overflow-hidden">
          <div className="p-3.5 border-b border-[#1E3A5F] bg-[#091527] flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
              <span className="text-xs font-mono font-bold text-white">{selectedFile}</span>
              <span className="text-[10px] text-slate-400 px-2 py-0.5 rounded bg-[#07111E] border border-[#1E3A5F]">
                Python 3
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopyCode}
                className="px-2.5 py-1 rounded bg-[#07111E] border border-[#1E3A5F] hover:border-blue-400 text-xs text-slate-300 hover:text-white flex items-center space-x-1 transition-all"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-blue-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>
          </div>

          <div className="p-4 bg-[#07111E] overflow-x-auto font-mono text-xs text-slate-200 leading-relaxed max-h-[580px] select-text">
            {loadingFile ? (
              <div className="p-8 text-center text-slate-400 flex items-center justify-center space-x-2">
                <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
                <span>Loading source code...</span>
              </div>
            ) : (
              <pre className="whitespace-pre">{fileContent}</pre>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Execution Console (Terminal) */}
      <div className="bg-[#0B1E36] border border-[#1E3A5F] rounded-xl overflow-hidden shadow-lg">
        <div className="p-3.5 border-b border-[#1E3A5F] bg-[#091527] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Terminal className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              FINCORE™ Python Terminal & Test Output
            </span>
            {lastExitCode !== null && (
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                lastExitCode === 0 
                  ? 'bg-blue-950 text-blue-300 border border-blue-700' 
                  : 'bg-[#081528] text-slate-300 border border-slate-700'
              }`}>
                exit: {lastExitCode} {executionTime ? `(${executionTime}ms)` : ''}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleRunCommand('simulation')}
              disabled={executing}
              className="px-2.5 py-1 rounded bg-blue-600/20 border border-blue-500/40 text-blue-300 hover:bg-blue-600/40 text-xs font-mono font-medium flex items-center space-x-1"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Run Lifecycle</span>
            </button>
            <button
              onClick={() => handleRunCommand('test')}
              disabled={executing}
              className="px-2.5 py-1 rounded bg-[#07111E] border border-[#1E3A5F] text-slate-300 hover:text-white text-xs font-mono font-medium flex items-center space-x-1"
            >
              <ShieldCheck className="w-3 h-3 text-blue-400" />
              <span>Unit Tests</span>
            </button>
            <button
              onClick={() => setTerminalOutput('')}
              className="px-2 py-1 rounded bg-[#07111E] border border-[#1E3A5F] text-slate-400 hover:text-white text-xs"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="p-4 bg-[#050B14] font-mono text-xs text-blue-300 overflow-x-auto min-h-[180px] max-h-[300px] leading-relaxed select-text">
          <pre className="whitespace-pre-wrap">{terminalOutput}</pre>
        </div>
      </div>
    </div>
  );
};
