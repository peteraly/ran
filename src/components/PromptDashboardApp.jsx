import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Command, Sparkles, FileText, BarChart3, Table, Search, Database, Globe2, Mail, CheckCircle, Clock, AlertCircle, Brain, Zap, X } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import SourcePanel from './SourcePanel';
import sourceRegistry from '../data/source_registry.json';
import { retrieveRelevantContent, processRagQuery, processUploadedFiles, processRagQueryFallback } from '../services/connections';
import RagProcessingPipeline from './RagProcessingPipeline';
import ChunkPreviewCards from './ChunkPreviewCards';
import SourceAttribution from './SourceAttribution';

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
  const [localFiles, setLocalFiles] = useState([]);

  // RAG Processing States
  const [processingStage, setProcessingStage] = useState(null);
  const [retrievedContent, setRetrievedContent] = useState([]);
  const [sourceContributions, setSourceContributions] = useState({});
  const [llmResponse, setLlmResponse] = useState(null);
  const [processingTime, setProcessingTime] = useState(0);
  const [processingStages, setProcessingStages] = useState([]);
  const [retrievedChunks, setRetrievedChunks] = useState([]);
  const [ragResponse, setRagResponse] = useState(null);
  const [confidence, setConfidence] = useState(0);
  const [sourceBreakdown, setSourceBreakdown] = useState([]);

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

  // Fetch uploaded local files on mount
  useEffect(() => {
    async function fetchLocalFiles() {
      try {
        // Fetch from backend: get all indexed local files
        const res = await fetch(`${process.env.REACT_APP_API_URL || 'https://ran-1.onrender.com'}/api/activity?limit=100`);
        if (!res.ok) {
          console.log('Activity endpoint not available, skipping local files fetch');
          return;
        }
        const data = await res.json();
        if (data.success) {
          // Filter for local uploads
          const files = data.activity
            .filter(a => a.type === 'upload' && a.status === 'success')
            .map(a => a.message.match(/Processed (.+) into (\d+) chunks/))
            .filter(Boolean)
            .map(match => ({
              name: match[1],
              chunks: parseInt(match[2], 10)
            }));
          setLocalFiles(files);
        }
      } catch (err) {
        console.log('Activity fetch failed, continuing without local files:', err.message);
        // Continue without local files - this is not critical
      }
    }
    fetchLocalFiles();
  }, []);

  const grouped = groupSourcesByType(sources);

  const handleToggleUsed = (type, idx) => {
    setSources(prev => {
      const grouped = groupSourcesByType(prev);
      const typeSources = grouped[type] || [];
      const sourceToToggle = typeSources[idx];
      
      if (!sourceToToggle) return prev;
      
      return prev.map(src => 
        src === sourceToToggle ? { ...src, used: !src.used } : src
      );
    });
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

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setProcessingTime(0);
    setRetrievedChunks([]);
    setRagResponse(null);
    setConfidence(0);
    setSourceBreakdown([]);
    
    const startTime = Date.now();
    
    // Initialize processing stages
    const stages = [
      {
        type: 'scanning',
        title: 'Scanning Sources',
        description: 'Analyzing available data sources',
        status: 'processing',
        details: 'Checking local files, web content, and connected sources...'
      },
      {
        type: 'retrieving',
        title: 'Retrieving Content',
        description: 'Finding relevant information',
        status: 'pending'
      },
      {
        type: 'analyzing',
        title: 'AI Analysis',
        description: 'Processing with AI models',
        status: 'pending'
      },
      {
        type: 'complete',
        title: 'Response Generated',
        description: 'Analysis complete',
        status: 'pending'
      }
    ];
    
    setProcessingStages(stages);
    setProcessingStage('scanning');
    
    try {
      // Get selected sources
      const usedSources = sources.filter(s => s.used).map(s => s.type);
      
      // Stage 1: Retrieve relevant content
      setProcessingStages(prev => prev.map(stage => 
        stage.type === 'scanning' 
          ? { ...stage, status: 'complete', details: `Found ${usedSources.length} active sources` }
          : stage.type === 'retrieving'
          ? { ...stage, status: 'processing', details: 'Querying vector database...' }
          : stage
      ));
      setProcessingStage('retrieving');
      
      const retrievalResult = await retrieveRelevantContent(prompt, usedSources);
      
      if (retrievalResult.success && retrievalResult.chunks) {
        setRetrievedChunks(retrievalResult.chunks);
        
        // Calculate source breakdown
        const breakdown = calculateSourceBreakdown(retrievalResult.chunks);
        setSourceBreakdown(breakdown);
        
        setProcessingStages(prev => prev.map(stage => 
          stage.type === 'retrieving' 
            ? { ...stage, status: 'complete', details: `Retrieved ${retrievalResult.chunks.length} relevant chunks` }
            : stage.type === 'analyzing'
            ? { ...stage, status: 'processing', details: 'Generating AI response...' }
            : stage
        ));
        setProcessingStage('analyzing');
        
        // Stage 2: Process with RAG
        let ragResult;
        try {
          ragResult = await processRagQuery(prompt, retrievalResult.chunks, usedSources);
        } catch (error) {
          console.log('Backend RAG endpoint failed, using fallback:', error.message);
          ragResult = await processRagQueryFallback(prompt, retrievalResult.chunks, usedSources);
        }
        
        if (ragResult.success) {
          setRagResponse(ragResult);
          setConfidence(ragResult.confidence || 0.8);
          
          setProcessingStages(prev => prev.map(stage => 
            stage.type === 'analyzing' 
              ? { ...stage, status: 'complete', details: 'AI analysis completed' }
              : stage.type === 'complete'
              ? { ...stage, status: 'complete', details: 'Response ready' }
              : stage
          ));
          setProcessingStage('complete');
        }
      }
      
      const endTime = Date.now();
      setProcessingTime(endTime - startTime);
      
    } catch (error) {
      console.error('Error generating response:', error);
      setProcessingStages(prev => prev.map(stage => 
        stage.status === 'processing' 
          ? { ...stage, status: 'error', details: error.message }
          : stage
      ));
    } finally {
      setIsGenerating(false);
    }
  };

  const calculateSourceBreakdown = (chunks) => {
    const breakdown = {};
    
    chunks.forEach(chunk => {
      const source = chunk.metadata?.source || 'unknown';
      const filename = chunk.metadata?.filename || 'Unknown Document';
      
      if (!breakdown[source]) {
        breakdown[source] = {
          name: filename,
          type: source,
          chunks: 0,
          contribution: 0
        };
      }
      
      breakdown[source].chunks++;
    });
    
    // Calculate contribution percentages
    const totalChunks = chunks.length;
    Object.values(breakdown).forEach(source => {
      source.contribution = Math.round((source.chunks / totalChunks) * 100);
    });
    
    return Object.values(breakdown);
  };

  const handleChunkSelect = (chunk) => {
    // Could open a modal or sidebar with full chunk details
    console.log('Selected chunk:', chunk);
  };

  const ProcessingIndicator = () => {
    if (!isGenerating) return null;

    const stages = {
      scanning: { icon: Search, text: 'Scanning sources...', color: 'text-blue-500' },
      processing: { icon: Brain, text: 'Processing with AI...', color: 'text-purple-500' },
      complete: { icon: CheckCircle, text: 'Complete!', color: 'text-green-500' },
      error: { icon: AlertCircle, text: 'Error occurred', color: 'text-red-500' }
    };

    const currentStage = stages[processingStage] || stages.scanning;
    const IconComponent = currentStage.icon;

    return (
      <div className="fixed top-4 right-4 bg-white border border-gray-200 rounded-xl shadow-lg p-4 z-50 min-w-64">
        <div className="flex items-center gap-3 mb-3">
          <IconComponent className={`h-5 w-5 ${currentStage.color}`} />
          <span className="font-medium text-gray-900">{currentStage.text}</span>
        </div>
        
        {processingStage === 'scanning' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Sources scanned:</span>
              <span className="font-medium">{Object.keys(sourceContributions).length}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Content retrieved:</span>
              <span className="font-medium">{retrievedContent.length} items</span>
            </div>
          </div>
        )}
        
        {processingStage === 'processing' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Context assembled:</span>
              <span className="font-medium">{retrievedContent.length} chunks</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">AI processing:</span>
              <span className="font-medium">In progress...</span>
            </div>
          </div>
        )}
        
        {processingStage === 'complete' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Confidence:</span>
              <span className="font-medium text-green-600">87%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Processing time:</span>
              <span className="font-medium">{(processingTime / 1000).toFixed(1)}s</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  const SourceContributionsPanel = () => {
    if (!retrievedContent.length) return null;

    return (
      <div className="bg-white/80 border border-gray-100 rounded-2xl p-6 shadow-sm mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Database className="h-5 w-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-900">Source Contributions</h3>
          <div className="ml-auto flex items-center gap-2 text-sm text-gray-500">
            <span>{retrievedContent.length} items retrieved</span>
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          </div>
        </div>
        
        <div className="space-y-4">
          {Object.entries(sourceContributions).map(([source, data]) => (
            <div key={source} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                  <span className="font-medium text-gray-900 capitalize">{source}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>{data.count} items</span>
                  <span>{(data.totalScore / data.count).toFixed(2)} avg score</span>
                </div>
              </div>
              
              <div className="space-y-2">
                {data.snippets.slice(0, 2).map((snippet, idx) => (
                  <div key={idx} className="bg-white rounded p-3 border-l-4 border-blue-400">
                    <div className="font-medium text-sm text-gray-900 mb-1">{snippet.title}</div>
                    <div className="text-xs text-gray-600 line-clamp-2">{snippet.content}</div>
                    <div className="text-xs text-gray-500 mt-1">Relevance: {(snippet.score * 100).toFixed(0)}%</div>
                  </div>
                ))}
                {data.snippets.length > 2 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{data.snippets.length - 2} more items
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const LlmResponsePanel = () => {
    if (!llmResponse) return null;

    return (
      <div className="bg-white/80 border border-gray-100 rounded-2xl p-6 shadow-sm mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="h-5 w-5 text-purple-500" />
          <h3 className="text-lg font-semibold text-gray-900">AI Analysis</h3>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-sm text-gray-600">Confidence:</span>
            <span className="text-sm font-medium text-green-600">{(llmResponse.confidence * 100).toFixed(0)}%</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Key Insights</h4>
            <ul className="space-y-1 text-sm text-blue-800">
              {llmResponse.insights?.map((insight, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-2">Recommendations</h4>
            <ul className="space-y-1 text-sm text-green-800">
              {llmResponse.recommendations?.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4">
            <h4 className="font-medium text-purple-900 mb-2">Processing Stats</h4>
            <div className="space-y-2 text-sm text-purple-800">
              <div className="flex justify-between">
                <span>Sources used:</span>
                <span className="font-medium">{llmResponse.sourcesUsed}</span>
              </div>
              <div className="flex justify-between">
                <span>Processing time:</span>
                <span className="font-medium">{(processingTime / 1000).toFixed(1)}s</span>
              </div>
              <div className="flex justify-between">
                <span>Context chunks:</span>
                <span className="font-medium">{retrievedContent.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl h-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Terminal className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold">Prompt Dashboard</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex">
          {/* Left Panel - Sources */}
          <div className="w-80 border-r border-gray-200 overflow-y-auto">
            <SourcePanel
              sources={sources}
              onSourceToggle={handleToggleUsed}
              onAddSource={() => {}}
            />
          </div>

          {/* Right Panel - Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Prompt Input */}
            <div className="p-6 border-b border-gray-200">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Task Prompt
                  </label>
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe what you need to analyze or generate..."
                    className="min-h-[100px]"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <select
                      value={selectedDeliverableType}
                      onChange={(e) => setSelectedDeliverableType(e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                    >
                      <option value="1-pager">1-pager</option>
                      <option value="chart">Chart</option>
                      <option value="table">Table</option>
                      <option value="summary">Summary</option>
                    </select>
                    
                    <div className="text-sm text-gray-500">
                      {sources.filter(s => s.used).length} sources selected
                    </div>
                  </div>
                  
                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating || !prompt.trim()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Deliverable
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6">
              {isGenerating ? (
                <div className="space-y-6">
                  <RagProcessingPipeline
                    currentStage={processingStage}
                    stages={processingStages}
                    retrievedChunks={retrievedChunks}
                    processingTime={processingTime}
                    confidence={confidence}
                    sourceBreakdown={sourceBreakdown}
                  />
                </div>
              ) : ragResponse ? (
                <div className="space-y-6">
                  {/* RAG Response with Attribution */}
                  <SourceAttribution
                    response={ragResponse.summary?.join('\n\n') || ragResponse.insights?.join('\n\n') || 'Response generated successfully.'}
                    sources={sourceBreakdown}
                    confidence={confidence}
                  />
                  
                  {/* Retrieved Chunks */}
                  <ChunkPreviewCards
                    chunks={retrievedChunks}
                    onChunkSelect={handleChunkSelect}
                  />
                </div>
              ) : (
                <div className="text-center py-12">
                  <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Ready to Generate
                  </h3>
                  <p className="text-gray-500">
                    Enter your prompt and select data sources to get started.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 