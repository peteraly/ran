import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Command, Sparkles, FileText, BarChart3, Table } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import SourcePanel from './SourcePanel';
import sourceRegistry from '../data/source_registry.json';

function groupSourcesByType(sources) {
  return sources.reduce((acc, src) => {
    if (!acc[src.type]) acc[src.type] = [];
    acc[src.type].push(src);
    return acc;
  }, {});
}

const DELIVERABLE_TYPES = [
  { id: '1-pager + chart', name: '1-pager + Chart', icon: <FileText className="h-4 w-4" />, description: 'Concise summary with visual data' },
  { id: '2-page report', name: '2-page Report', icon: <FileText className="h-4 w-4" />, description: 'Detailed analysis with insights' },
  { id: 'table only', name: 'Table Only', icon: <Table className="h-4 w-4" />, description: 'Structured data presentation' },
  { id: 'chart only', name: 'Chart Only', icon: <BarChart3 className="h-4 w-4" />, description: 'Visual data representation' },
];

export default function PromptDashboardApp({ onClose }) {
  const [prompt, setPrompt] = useState('');
  const [deliverableType, setDeliverableType] = useState('1-pager + chart');
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastPrompt, setLastPrompt] = useState('');
  const [lastChartType, setLastChartType] = useState('table');
  const [lastSummary, setLastSummary] = useState([]);
  const [sources, setSources] = useState([]);
  const [showCommandBar, setShowCommandBar] = useState(false);
  const [selectedDeliverableType, setSelectedDeliverableType] = useState(null);
  const commandBarRef = useRef(null);

  useEffect(() => {
    // Deep clone to avoid mutating the imported JSON
    setSources(JSON.parse(JSON.stringify(sourceRegistry)));
  }, []);

  // Command bar keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.metaKey && e.key === 'k') {
        e.preventDefault();
        setShowCommandBar(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus command bar when shown
  useEffect(() => {
    if (showCommandBar && commandBarRef.current) {
      commandBarRef.current.focus();
    }
  }, [showCommandBar]);

  const grouped = groupSourcesByType(sources);

  const handleToggleUsed = (type, idx) => {
    setSources(prev => prev.map((src, i) =>
      src.type === type && grouped[type].indexOf(src) === idx
        ? { ...src, used: !src.used }
        : src
    ));
  };

  function parsePrompt(prompt) {
    const lower = prompt.toLowerCase();
    let chartType = 'table';
    if (lower.includes('trend') || lower.includes('time')) chartType = 'line';
    else if (lower.includes('compare') || lower.includes('versus') || lower.includes('ranking')) chartType = 'bar';
    else if (lower.includes('region') || lower.includes('geography') || lower.includes('heatmap')) chartType = 'heatmap';
    else if (lower.includes('distribution') || lower.includes('share')) chartType = 'pie';
    return { chartType };
  }

  function getSummary(prompt) {
    if (prompt.toLowerCase().includes('stablecoin')) {
      return [
        '🇺🇸 U.S. Regulation: New Stablecoin Oversight Act introduced, requiring 100% reserves and real-time attestations.',
        '💸 Tether Volatility: $1.2B net outflow, peg briefly lost, restored by arbitrage.',
        '🇪🇺 EU MiCA Enforcement: MiCA now in effect, only USDC/EURC approved, Tether/DAI not approved.',
        '🌐 Internal Risk: Cross-border corridors using non-compliant stablecoins may face operational halts.',
      ];
    }
    // Default fallback
    return ['No specific summary available for this prompt.'];
  }

  function Chart({ chartType }) {
    if (chartType === 'heatmap') {
      return (
        <div className="my-4">
          <div className="font-semibold mb-2">📊 Stablecoin Regulatory Coverage — Global Summary (as of June 30, 2025)</div>
          <table className="w-full text-xs border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2">Jurisdiction</th>
                <th className="p-2">Regulation</th>
                <th className="p-2">Status</th>
                <th className="p-2">Key Rules</th>
                <th className="p-2">Impact Summary</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-white">
                <td className="p-2">🇺🇸 U.S.</td>
                <td className="p-2">Stablecoin Oversight Act</td>
                <td className="p-2">Drafted</td>
                <td className="p-2">Fed license, 24h reserve audit, US-only use</td>
                <td className="p-2">High scrutiny expected by end of Q3 2025</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="p-2">🇪🇺 EU</td>
                <td className="p-2">MiCA</td>
                <td className="p-2">Active</td>
                <td className="p-2">Audits, reserve proof, EUR-denom limits</td>
                <td className="p-2">Immediate risk to non-compliant issuers</td>
              </tr>
              <tr className="bg-white">
                <td className="p-2">🇸🇬 Singapore</td>
                <td className="p-2">Payment Services Act</td>
                <td className="p-2">Active</td>
                <td className="p-2">Licensing, AML controls</td>
                <td className="p-2">Binance and Circle licensed, Tether under review</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="p-2">🌎 G7</td>
                <td className="p-2">BIS Supervisory Guidance</td>
                <td className="p-2">Drafting</td>
                <td className="p-2">Interoperability, systemic risk thresholds</td>
                <td className="p-2">Expected to harmonize cross-border regulatory paths</td>
              </tr>
            </tbody>
          </table>
        </div>
      );
    }
    // Fallback: simple table
    return (
      <div className="my-4">
        <div className="font-semibold mb-2">📊 Table: Example Data</div>
        <table className="w-full text-xs border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2">Source</th>
              <th className="p-2">Title/Message</th>
            </tr>
          </thead>
          <tbody>
            {sources.filter(s => s.used).map((src, i) => (
              <tr key={i} className="bg-white">
                <td className="p-2">{src.type.charAt(0).toUpperCase() + src.type.slice(1)}</td>
                <td className="p-2">{src.subject || src.title || src.msg}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const { chartType } = parsePrompt(prompt);
      const summary = getSummary(prompt);
      setLastPrompt(prompt);
      setLastChartType(chartType);
      setLastSummary(summary);
      setIsGenerating(false);
    }, 800);
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-8">
      <div className="bg-gradient-to-br from-white via-gray-50 to-blue-50 rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Title bar */}
        <div className="flex items-center justify-between px-8 py-5 bg-white/80 border-b border-gray-200 rounded-t-3xl" data-drag-handle>
          <div className="flex items-center gap-2">
            {/* Apple-style window controls */}
            <div className="flex gap-1 mr-3">
              <button onClick={onClose} className="w-3 h-3 rounded-full bg-red-500 border border-red-300 hover:scale-110 transition-transform" title="Close" />
              <span className="w-3 h-3 rounded-full bg-yellow-400 border border-yellow-200" />
              <span className="w-3 h-3 rounded-full bg-green-500 border border-green-300" />
            </div>
            <Terminal className="h-5 w-5 text-green-500" />
            <span className="font-semibold text-gray-900 text-xl tracking-tight">Prompt Dashboard</span>
          </div>
        </div>
        
        {/* Prompt dashboard */}
        <div className="p-10 space-y-10">
          {/* Linear-style Command Bar */}
          <div className="relative">
            <div className="bg-white/90 border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center gap-3">
                <Command className="h-4 w-4 text-gray-400" />
                <input
                  ref={commandBarRef}
                  type="text"
                  placeholder="⌘+K to search deliverable types or start typing your prompt..."
                  className="flex-1 bg-transparent border-none outline-none text-gray-700 placeholder-gray-400 text-sm"
                  onFocus={() => setShowCommandBar(true)}
                  onBlur={() => setTimeout(() => setShowCommandBar(false), 200)}
                />
                <kbd className="px-2 py-1 text-xs bg-gray-100 rounded text-gray-500">⌘+K</kbd>
              </div>
            </div>
            
            {/* Command Bar Dropdown */}
            {showCommandBar && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
                <div className="p-2 border-b border-gray-100">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Deliverable Types</div>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {DELIVERABLE_TYPES.map((type) => (
                    <button
                      key={type.id}
                      className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors text-left"
                      onClick={() => {
                        setDeliverableType(type.id);
                        setShowCommandBar(false);
                      }}
                    >
                      <div className="text-gray-400">{type.icon}</div>
                      <div>
                        <div className="font-medium text-gray-900">{type.name}</div>
                        <div className="text-xs text-gray-500">{type.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Prompt Input */}
          <div className="bg-white/90 border border-gray-100 rounded-2xl p-8 mb-2 shadow hover:shadow-lg transition-all duration-200">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-blue-500" />
              <label className="text-lg font-semibold text-gray-800 tracking-tight">Task Prompt</label>
            </div>
            <Textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="e.g. Create a concise summary of today's stablecoin regulatory developments with key insights and market impact..."
              rows={3}
              className="w-full mb-4 text-base border-gray-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
            />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600">Type:</span>
                  <span className="text-sm text-gray-800 font-medium">
                    {DELIVERABLE_TYPES.find(t => t.id === deliverableType)?.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600">Sources:</span>
                  <span className="text-sm text-gray-800 font-medium">
                    {sources.filter(s => s.used).length} selected
                  </span>
                </div>
              </div>
              
              <Button 
                onClick={handleGenerate} 
                disabled={isGenerating || !prompt} 
                className="px-6 py-2.5 text-base rounded-xl shadow-sm hover:shadow-md transition-all duration-200 bg-blue-600 hover:bg-blue-700"
              >
                {isGenerating ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Generating...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Generate Deliverable
                  </div>
                )}
              </Button>
            </div>
          </div>

          {/* Source panels for each type */}
          <div className="bg-white/80 border border-gray-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 tracking-tight">Data Sources</h3>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>{sources.filter(s => s.used).length} of {sources.length} selected</span>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {Object.keys(grouped).map(type => (
                <SourcePanel
                  key={type}
                  type={type}
                  sources={grouped[type]}
                  onToggleUsed={idx => handleToggleUsed(type, idx)}
                />
              ))}
            </div>
          </div>
          {/* Deliverable output */}
          {lastPrompt && (
            <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-shadow">
              <div className="mb-3 text-xs text-gray-500 flex flex-wrap gap-4">
                <span>Deliverable Type: <span className="font-semibold text-gray-700">{deliverableType}</span></span>
                <span>Prompt: <span className="font-semibold text-gray-700">{lastPrompt}</span></span>
              </div>
              <div className="mb-3 text-xs text-gray-500">Sources Used:</div>
              <ul className="mb-3 text-xs list-disc pl-5">
                {sources.filter(s => s.used).map((src, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-blue-400 mr-1"></span>
                    <span className="font-medium text-gray-700">[{src.type.charAt(0).toUpperCase() + src.type.slice(1)}]</span>
                    <span>{src.subject || src.title || src.msg}</span>
                    {src.attachments && src.attachments > 0 && (
                      <span className="ml-2 text-blue-500" title="Attachment">📎 {src.attachments}</span>
                    )}
                  </li>
                ))}
              </ul>
              <div className="mb-3">
                <span className="font-semibold text-gray-700">Summary (Expanded):</span>
                <ul className="list-disc pl-5 mt-1">
                  {lastSummary.map((s, i) => <li key={i} className="text-xs text-gray-700">{s}</li>)}
                </ul>
              </div>
              <div className="border-t border-gray-100 my-6"></div>
              <Chart chartType={lastChartType} />
              <Button
                className="mt-4 px-5 py-2 rounded-xl text-base shadow-sm"
                onClick={() => navigator.clipboard.writeText(
                  `Deliverable Type: ${deliverableType}\nPrompt: ${lastPrompt}\nSources Used:\n${sources.filter(s=>s.used).map(src=>`[${src.type.charAt(0).toUpperCase() + src.type.slice(1)}] ${src.subject || src.title || src.msg}`).join('\n')}\nSummary:\n${lastSummary.join('\n')}`
                )}
              >Copy to Clipboard</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 