'use client';
import { useState, useRef, useCallback } from 'react';
import { Sparkles, Play, Loader2, AlertCircle, Database, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import api from '@/lib/axios';

// ─── Example prompts carousel ─────────────────────────────────────────────────
const EXAMPLE_PROMPTS = [
  'Total number of students',
  'Students enrolled today',
  'Count of approved enrolments',
  'Upcoming holidays this month',
  'Most popular courses by enrolments',
  'Faculty count per department',
  'Pending enrolment requests',
  'Library resources uploaded this year',
];

// ─── Security: client-side pre-flight check (real enforcement is on backend) ──
function isSafeQuery(sql) {
  const lower = sql.toLowerCase().trim();
  if (!lower.startsWith('select')) return false;
  const blocked = /\b(delete|update|insert|drop|alter|truncate|create|replace|exec|execute|grant|revoke)\b/i;
  return !blocked.test(sql);
}

export default function AIQueryBox() {
  const [input, setInput] = useState('');
  const [sql, setSql] = useState('');
  const [results, setResults] = useState(null);
  const [resultCount, setResultCount] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [showPrompts, setShowPrompts] = useState(false);
  const inputRef = useRef(null);

  const clearError = () => setError('');

  // ── Generate SQL ────────────────────────────────────────────────
  const handleGenerate = useCallback(async () => {
    if (!input.trim()) return;
    setIsGenerating(true);
    setError('');
    setResults(null);
    setSql('');
    try {
      const { data } = await api.post('/ai/generate-sql', { query: input.trim() });
      setSql(data.data.sql || '');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate SQL. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }, [input]);

  // ── Execute Query ───────────────────────────────────────────────
  const handleExecute = useCallback(async () => {
    if (!sql.trim()) return;
    // Client-side pre-flight
    if (!isSafeQuery(sql)) {
      setError('Only SELECT queries are allowed. Destructive queries are blocked.');
      return;
    }
    setIsExecuting(true);
    setError('');
    setResults(null);
    try {
      const { data } = await api.post('/ai/run-query', { sql: sql.trim() });
      setResults(data.data.results);
      setResultCount(data.data.count);
    } catch (err) {
      setError(err.response?.data?.error || 'Query execution failed. Check your SQL syntax.');
    } finally {
      setIsExecuting(false);
    }
  }, [sql]);

  // ── Copy SQL ────────────────────────────────────────────────────
  const handleCopy = useCallback(async () => {
    if (!sql) return;
    await navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [sql]);

  // ── Keyboard: Enter to generate ─────────────────────────────────
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !isGenerating) {
      e.preventDefault();
      handleGenerate();
    }
  };

  // ── Select example prompt ───────────────────────────────────────
  const selectPrompt = (prompt) => {
    setInput(prompt);
    setShowPrompts(false);
    setSql('');
    setResults(null);
    setError('');
    inputRef.current?.focus();
  };

  // ── Derive table columns from first result row ──────────────────
  const columns = results && results.length > 0 ? Object.keys(results[0]) : [];

  return (
    <div className="card border border-accent/20 bg-white relative overflow-hidden">
      {/* Header glow accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent via-indigo-400 to-accent rounded-t-card" />

      {/* ── Header ── */}
      <div className="flex items-center gap-3 mb-6 pt-1">
        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h3 className="font-bold text-primary-900 text-base">Ask AI Data Analyst</h3>
          <p className="text-xs text-muted">Ask anything about your university data in plain English</p>
        </div>
        <div className="ml-auto">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/10 border border-success/20 text-[10px] font-bold text-success uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            Read-only · Secure
          </span>
        </div>
      </div>

      {/* ── Input Section ── */}
      <div className="mb-5">
        <label className="form-label mb-2">What would you like to know?</label>

        <div className="flex gap-3">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => { setInput(e.target.value); clearError(); }}
              onKeyDown={handleKeyDown}
              placeholder="e.g. how many students enrolled this month?"
              className="form-input h-11 pr-10"
              disabled={isGenerating || isExecuting}
            />
            {/* Example prompts trigger */}
            <button
              type="button"
              onClick={() => setShowPrompts((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-accent transition-colors"
              title="Show example prompts"
            >
              {showPrompts ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
          <button
            onClick={handleGenerate}
            disabled={!input.trim() || isGenerating || isExecuting}
            className="btn-primary h-11 px-5 gap-2 shrink-0"
          >
            {isGenerating ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</>
            ) : (
              <><Sparkles className="w-4 h-4" /> Generate SQL</>
            )}
          </button>
        </div>

        {/* Example prompts dropdown */}
        {showPrompts && (
          <div className="mt-2 p-3 bg-primary-50 rounded-xl border border-border grid grid-cols-2 gap-1.5">
            {EXAMPLE_PROMPTS.map((p) => (
              <button
                key={p}
                onClick={() => selectPrompt(p)}
                className="text-left text-xs px-3 py-2 rounded-lg hover:bg-accent/10 hover:text-accent text-primary-600 transition-colors font-medium border border-transparent hover:border-accent/20"
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── SQL Box ── */}
      {(sql || isGenerating) && (
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <label className="form-label mb-0">Generated Query <span className="font-normal text-muted">(Editable)</span></label>
            <div className="flex items-center gap-2">
              {sql && (
                <button
                  onClick={handleCopy}
                  className="btn-ghost btn-sm gap-1.5 text-xs py-1"
                  title="Copy SQL"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              )}
              <button
                onClick={handleExecute}
                disabled={!sql.trim() || isExecuting || isGenerating}
                className="btn-primary btn-sm gap-1.5 bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500"
              >
                {isExecuting ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Executing…</>
                ) : (
                  <><Play className="w-3.5 h-3.5 fill-white" /> Execute Query</>
                )}
              </button>
            </div>
          </div>

          {/* Dark SQL textarea */}
          <div className="relative rounded-xl overflow-hidden border border-slate-700 shadow-lg">
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 border-b border-slate-700">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <span className="text-[10px] text-slate-400 font-mono ml-1 uppercase tracking-widest">SQL — MySQL</span>
            </div>
            {isGenerating ? (
              <div className="bg-slate-900 px-5 py-8 flex items-center gap-3">
                <Loader2 className="w-4 h-4 text-accent animate-spin" />
                <span className="text-sm text-slate-400 font-mono animate-pulse">Generating query…</span>
              </div>
            ) : (
              <textarea
                value={sql}
                onChange={(e) => { setSql(e.target.value); setResults(null); clearError(); }}
                rows={4}
                spellCheck={false}
                className="w-full bg-slate-900 text-emerald-400 font-mono text-sm px-5 py-4 resize-y focus:outline-none focus:ring-2 focus:ring-accent/30 placeholder-slate-600 scrollbar-hide"
                placeholder="Your SQL query will appear here..."
                disabled={isExecuting}
              />
            )}
          </div>
        </div>
      )}

      {/* ── Error Banner ── */}
      {error && (
        <div className="mb-5 flex items-start gap-3 p-4 rounded-xl bg-danger-soft border border-danger/20">
          <AlertCircle className="w-4 h-4 text-danger mt-0.5 shrink-0" />
          <p className="text-sm text-danger font-medium">{error}</p>
        </div>
      )}

      {/* ── Results Table ── */}
      {results !== null && (
        <div>
          <div className="flex items-center gap-3 mb-3">
            <Database className="w-4 h-4 text-accent" />
            <span className="font-bold text-primary-900 text-sm">Results</span>
            <span className="text-xs text-muted font-medium">
              {resultCount === 0 ? 'No rows returned' : `${resultCount} row${resultCount !== 1 ? 's' : ''}`}
            </span>
            {resultCount > 0 && (
              <span className="ml-auto text-[10px] text-muted font-mono">
                {columns.length} column{columns.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {results.length === 0 ? (
            <div className="table-wrapper px-6 py-10 text-center text-muted text-sm">
              No data matched your query.
            </div>
          ) : (
            <div className="table-wrapper overflow-x-auto">
              <table className="table min-w-full">
                <thead>
                  <tr>
                    {columns.map((col) => (
                      <th key={col} className="whitespace-nowrap">
                        {col.replace(/_/g, ' ')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.map((row, i) => (
                    <tr key={i}>
                      {columns.map((col) => {
                        const val = row[col];
                        let display;
                        if (val === null || val === undefined) {
                          display = <span className="text-muted italic text-xs">null</span>;
                        } else if (val instanceof Date) {
                          display = new Date(val).toLocaleDateString('en-IN');
                        } else {
                          display = String(val);
                        }
                        return (
                          <td key={col} className="whitespace-nowrap max-w-[260px] truncate" title={String(val ?? '')}>
                            {display}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!sql && !isGenerating && results === null && !error && (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-primary-300" />
          </div>
          <p className="text-sm text-muted max-w-xs">
            Type a question above and click <strong className="text-primary-700">Generate SQL</strong> to query your university database with AI.
          </p>
          <button
            onClick={() => setShowPrompts(true)}
            className="text-xs text-accent font-bold hover:underline mt-1"
          >
            See example prompts →
          </button>
        </div>
      )}
    </div>
  );
}
