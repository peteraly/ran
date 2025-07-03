import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Globe2, 
  Mail, 
  MessageSquare, 
  ExternalLink, 
  Info, 
  ChevronDown, 
  ChevronUp,
  Download,
  Copy,
  Eye,
  EyeOff,
  Highlighter,
  BookOpen,
  Quote,
  CheckCircle,
  AlertCircle,
  Brain
} from 'lucide-react';
import { Button } from './ui/button';
import SourceDiversityPanel from './SourceDiversityPanel';
import ReasoningPanel from './ReasoningPanel';
import QualityAssessmentPanel from './QualityAssessmentPanel';

const EnhancedDeliverableView = ({ 
  response, 
  sources, 
  confidence, 
  retrievedChunks = [],
  sourceDiversity = null,
  reasoning = null,
  thoughtProcess = null,
  qualityValidation = null,
  styleGuideUsed = null,
  deliverableType = 'executive_summary',
  onDownload,
  onCopy 
}) => {
  const [showSourceDetails, setShowSourceDetails] = useState(true);
  const [showHighlighting, setShowHighlighting] = useState(true);
  const [selectedSource, setSelectedSource] = useState(null);
  const [viewMode, setViewMode] = useState('split'); // 'split', 'deliverable', 'sources'
  const [showReasoning, setShowReasoning] = useState(true);

  const getSourceIcon = (source) => {
    switch (source.type) {
      case 'local': return <FileText className="w-4 h-4" />;
      case 'web': return <Globe2 className="w-4 h-4" />;
      case 'email': return <Mail className="w-4 h-4" />;
      case 'slack': return <MessageSquare className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getConfidenceLabel = (confidence) => {
    if (confidence >= 0.8) return 'High Confidence';
    if (confidence >= 0.6) return 'Medium Confidence';
    return 'Low Confidence';
  };

  // Enhanced response with better citation mapping
  const enhancedResponse = useMemo(() => {
    if (!response || !sources) return { text: response || '', citations: [] };

    let processedResponse = typeof response === 'string' ? response : (response.text || '');
    const citations = [];
    
    // Create citation mapping
    sources.forEach((source, index) => {
      const citationMarker = `[${index + 1}]`;
      citations.push({
        marker: citationMarker,
        source: source,
        index: index
      });
      
      // Add citation markers to response - FIXED: Escape regex special characters
      if (source.keyPhrase) {
        const escapedKeyPhrase = source.keyPhrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${escapedKeyPhrase})`, 'gi');
        processedResponse = processedResponse.replace(regex, `$1${citationMarker}`);
      }
    });

    return { text: processedResponse, citations };
  }, [response, sources]);

  // Find relevant chunks for a specific source
  const getSourceChunks = (sourceName) => {
    console.log('🔍 Looking for chunks for source:', sourceName);
    console.log('🔍 Available chunks:', retrievedChunks);
    
    const matchingChunks = retrievedChunks.filter(chunk => {
      // Match by filename in metadata (from Pinecone)
      const chunkFilename = chunk.metadata?.filename;
      // Match by source name (from frontend)
      const chunkSource = chunk.metadata?.source;
      
      // Create sanitized version of source name for comparison (matching Pinecone's sanitization)
      const sanitizedSourceName = sourceName
        .replace(/[^a-zA-Z0-9]/g, '_')
        .replace(/_+/g, '_')
        .toLowerCase();
      
      const sanitizedChunkFilename = chunkFilename
        ?.replace(/[^a-zA-Z0-9]/g, '_')
        .replace(/_+/g, '_')
        .toLowerCase();
      
      // Multiple matching strategies
      const exactMatch = chunkFilename === sourceName;
      const sourceMatch = chunkSource === sourceName;
      const sanitizedMatch = sanitizedChunkFilename === sanitizedSourceName;
      const containsMatch = chunkFilename?.includes(sourceName) || sourceName.includes(chunkFilename);
      
      const matches = exactMatch || sourceMatch || sanitizedMatch || containsMatch;
      
      console.log(`🔍 Chunk ${chunk.id}: filename="${chunkFilename}", source="${chunkSource}"`);
      console.log(`🔍 Sanitized: chunk="${sanitizedChunkFilename}", source="${sanitizedSourceName}"`);
      console.log(`🔍 Matches: exact=${exactMatch}, source=${sourceMatch}, sanitized=${sanitizedMatch}, contains=${containsMatch}`);
      
      return matches;
    });
    
    console.log(`🔍 Found ${matchingChunks.length} chunks for source: ${sourceName}`);
    return matchingChunks;
  };

  // Enhanced highlighting with confidence levels and source mapping
  const highlightTextWithConfidence = (content, query, sourceMapping = {}) => {
    if (!showHighlighting) return content;
    
    let highlightedContent = content;
    
    // Color coding based on confidence and source type
    const highlightPatterns = [
      {
        pattern: /\[REASONING:\s*([^\]]+)\]/g,
        className: 'bg-blue-100 text-blue-800 border-l-4 border-blue-400 px-2 py-1 rounded',
        icon: '🧠',
        tooltip: 'AI Reasoning'
      },
      {
        pattern: /\[EVIDENCE:\s*([^\]]+)\]/g,
        className: 'bg-green-100 text-green-800 border-l-4 border-green-400 px-2 py-1 rounded',
        icon: '📊',
        tooltip: 'Source Evidence'
      },
      {
        pattern: /\[INFERENCE:\s*([^\]]+)\]/g,
        className: 'bg-purple-100 text-purple-800 border-l-4 border-purple-400 px-2 py-1 rounded',
        icon: '💡',
        tooltip: 'Derived Insight'
      },
      {
        pattern: /\[LIMITATION:\s*([^\]]+)\]/g,
        className: 'bg-yellow-100 text-yellow-800 border-l-4 border-yellow-400 px-2 py-1 rounded',
        icon: '⚠️',
        tooltip: 'Acknowledged Limitation'
      },
      {
        pattern: /\[HIGH_CONFIDENCE:\s*([^\]]+)\]/g,
        className: 'bg-emerald-100 text-emerald-800 border-l-4 border-emerald-400 px-2 py-1 rounded font-semibold',
        icon: '✅',
        tooltip: 'High Confidence (>80%)'
      },
      {
        pattern: /\[MEDIUM_CONFIDENCE:\s*([^\]]+)\]/g,
        className: 'bg-orange-100 text-orange-800 border-l-4 border-orange-400 px-2 py-1 rounded',
        icon: '🟡',
        tooltip: 'Medium Confidence (60-80%)'
      },
      {
        pattern: /\[LOW_CONFIDENCE:\s*([^\]]+)\]/g,
        className: 'bg-red-100 text-red-800 border-l-4 border-red-400 px-2 py-1 rounded italic',
        icon: '❌',
        tooltip: 'Low Confidence (<60%)'
      }
    ];

    // Apply highlighting patterns
    highlightPatterns.forEach(({ pattern, className, icon, tooltip }) => {
      highlightedContent = highlightedContent.replace(pattern, (match, content) => {
        return `<span class="${className} inline-block my-1" title="${tooltip}">${icon} ${content}</span>`;
      });
    });

    // Highlight source citations with confidence indicators
    if (sourceMapping && Object.keys(sourceMapping).length > 0) {
      Object.entries(sourceMapping).forEach(([phrase, sourceInfo]) => {
        const confidence = sourceInfo.confidence || 0.7;
        const sourceName = sourceInfo.source || 'Unknown';
        
        let confidenceClass = 'bg-gray-100 text-gray-800';
        let confidenceIcon = '📄';
        
        if (confidence >= 0.8) {
          confidenceClass = 'bg-emerald-100 text-emerald-800';
          confidenceIcon = '✅';
        } else if (confidence >= 0.6) {
          confidenceClass = 'bg-orange-100 text-orange-800';
          confidenceIcon = '🟡';
        } else {
          confidenceClass = 'bg-red-100 text-red-800';
          confidenceIcon = '❌';
        }
        
        const escapedPhrase = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${escapedPhrase})`, 'gi');
        highlightedContent = highlightedContent.replace(regex, 
          `<span class="${confidenceClass} border-l-4 border-gray-400 px-1 rounded cursor-help" title="Source: ${sourceName} (${Math.round(confidence * 100)}% confidence)">$1 ${confidenceIcon}</span>`
        );
      });
    }

    // Highlight query terms
    if (query) {
      const queryTerms = query.toLowerCase().split(' ').filter(term => term.length > 3);
      queryTerms.forEach(term => {
        const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${escapedTerm})`, 'gi');
        highlightedContent = highlightedContent.replace(regex, 
          '<mark class="bg-blue-200 px-1 rounded font-medium">$1</mark>'
        );
      });
    }

    return highlightedContent;
  };

  // Enhanced source attribution with confidence scoring
  const getSourceConfidence = (source) => {
    const sourceChunks = getSourceChunks(source.name);
    if (sourceChunks.length === 0) return 0.5;
    
    // Calculate average relevance score
    const avgScore = sourceChunks.reduce((sum, chunk) => sum + (chunk.score || 0.5), 0) / sourceChunks.length;
    return Math.min(avgScore, 1.0);
  };

  // Interactive annotation system
  const [selectedAnnotation, setSelectedAnnotation] = useState(null);

  const AnnotationTooltip = ({ annotation, onClose }) => {
    if (!annotation) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md mx-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">{annotation.type}</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <strong>Content:</strong>
              <p className="text-gray-700 mt-1">{annotation.content}</p>
            </div>
            {annotation.source && (
              <div>
                <strong>Source:</strong>
                <p className="text-gray-700 mt-1">{annotation.source}</p>
              </div>
            )}
            {annotation.confidence && (
              <div>
                <strong>Confidence:</strong>
                <p className="text-gray-700 mt-1">{Math.round(annotation.confidence * 100)}%</p>
              </div>
            )}
            <div>
              <strong>Explanation:</strong>
              <p className="text-gray-700 mt-1">{annotation.explanation}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const DeliverablePanel = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          Final Deliverable
        </h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHighlighting(!showHighlighting)}
            className="flex items-center gap-2"
          >
            {showHighlighting ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showHighlighting ? 'Hide' : 'Show'} Highlights
          </Button>
          {onCopy && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCopy(enhancedResponse.text)}
              className="flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Copy
            </Button>
          )}
          {onDownload && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDownload(enhancedResponse.text)}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download
            </Button>
          )}
        </div>
      </div>

      {/* Confidence Indicator */}
      <div className="bg-blue-50 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Info className="w-5 h-5 text-blue-600" />
            <div>
              <div className="font-medium">Response Confidence</div>
              <div className="text-sm text-gray-500">
                Based on {sources?.length || 0} sources
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(confidence)}`}>
              {Math.round(confidence * 100)}%
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {getConfidenceLabel(confidence)}
            </div>
          </div>
        </div>
      </div>

      {/* Deliverable Content */}
      <div className="prose prose-sm max-w-none">
        <div 
          className="text-gray-700 leading-relaxed whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ 
            __html: enhancedResponse.text.replace(/\n/g, '<br>') 
          }}
        />
      </div>

      {/* Citation Legend */}
      {enhancedResponse.citations && enhancedResponse.citations.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Citations</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {enhancedResponse.citations.map((citation) => (
              <div key={citation.index} className="flex items-center gap-2">
                <span className="font-mono text-xs bg-gray-200 px-1 rounded">
                  {citation.marker}
                </span>
                <span className="text-gray-600 truncate">
                  {citation.source.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const SourcesPanel = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Highlighter className="w-5 h-5 text-green-600" />
          Source Attribution
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSourceDetails(!showSourceDetails)}
          className="flex items-center gap-2"
        >
          {showSourceDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          {showSourceDetails ? 'Hide' : 'Show'} Details
        </Button>
      </div>

      {sources && sources.length > 0 ? (
        <div className="space-y-4">
          {sources.map((source, index) => {
            const sourceChunks = getSourceChunks(source.name);
            const isSelected = selectedSource === source.name;
            
            return (
              <div 
                key={index} 
                className={`border border-gray-200 rounded-lg p-4 transition-all cursor-pointer ${
                  isSelected ? 'ring-2 ring-blue-200 bg-blue-50' : 'hover:bg-gray-50'
                }`}
                onClick={() => setSelectedSource(isSelected ? null : source.name)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="flex-shrink-0 mt-1">
                      {getSourceIcon(source)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">
                          {source.name}
                        </span>
                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                          [{index + 1}]
                        </span>
                        {source.type === 'local' && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                      <div className="text-sm text-gray-500 mb-2">
                        {source.type} • {sourceChunks.length} chunks used
                      </div>
                      
                      {showSourceDetails && isSelected && sourceChunks.length > 0 && (
                        <div className="mt-3 space-y-3">
                          <div className="text-sm font-medium text-gray-700">
                            Relevant Excerpts:
                          </div>
                          {sourceChunks.slice(0, 3).map((chunk, chunkIndex) => (
                            <div 
                              key={chunkIndex}
                              className="text-sm text-gray-600 bg-gray-50 p-3 rounded border-l-4 border-green-200"
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <Quote className="w-3 h-3 text-green-500" />
                                <span className="text-xs text-gray-500">
                                  Chunk {chunkIndex + 1} (Score: {Math.round(chunk.score * 100)}%)
                                </span>
                              </div>
                              <div 
                                className="italic"
                                dangerouslySetInnerHTML={{
                                  __html: highlightTextWithConfidence(chunk.content, source.keyPhrase, {
                                    source: source.name,
                                    confidence: getSourceConfidence(source)
                                  })
                                }}
                              />
                            </div>
                          ))}
                          {sourceChunks.length > 3 && (
                            <div className="text-xs text-gray-500 text-center">
                              +{sourceChunks.length - 3} more chunks
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {source.url && (
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-gray-100 rounded"
                        title="View Source"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No sources were used in this response.</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* View Mode Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">View Mode:</span>
          <div className="flex border border-gray-300 rounded-lg">
            <button
              onClick={() => setViewMode('split')}
              className={`px-3 py-1 text-sm ${
                viewMode === 'split' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Split View
            </button>
            <button
              onClick={() => setViewMode('deliverable')}
              className={`px-3 py-1 text-sm ${
                viewMode === 'deliverable' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Deliverable Only
            </button>
            <button
              onClick={() => setViewMode('sources')}
              className={`px-3 py-1 text-sm ${
                viewMode === 'sources' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Sources Only
            </button>
          </div>
        </div>
        
        {/* Reasoning Toggle */}
        {(reasoning || thoughtProcess) && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">AI Reasoning:</span>
            <Button
              variant={showReasoning ? "default" : "outline"}
              size="sm"
              onClick={() => setShowReasoning(!showReasoning)}
              className="flex items-center gap-2"
            >
              <Brain className="w-4 h-4" />
              {showReasoning ? 'Hide' : 'Show'} Analysis
            </Button>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="h-[600px]">
        {viewMode === 'split' ? (
          <div className="grid grid-cols-2 gap-4 h-full">
            <DeliverablePanel />
            <SourcesPanel />
          </div>
        ) : viewMode === 'deliverable' ? (
          <DeliverablePanel />
        ) : (
          <SourcesPanel />
        )}
      </div>

      {/* Quality Assessment */}
      {qualityValidation && (
        <QualityAssessmentPanel 
          qualityValidation={qualityValidation}
          styleGuideUsed={styleGuideUsed}
          deliverableType={deliverableType}
        />
      )}

      {/* Quality Metrics */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Quality Metrics</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {sources?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Sources Used</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {Math.round(confidence * 100)}%
            </div>
            <div className="text-sm text-gray-600">Confidence Score</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {retrievedChunks.length}
            </div>
            <div className="text-sm text-gray-600">Content Chunks</div>
          </div>
        </div>
      </div>

      {/* Source Diversity Analysis */}
      {sourceDiversity && (
        <SourceDiversityPanel 
          sourceDiversity={sourceDiversity} 
          confidence={confidence} 
        />
      )}

      {/* Reasoning Analysis */}
      {showReasoning && (
        <ReasoningPanel 
          reasoning={reasoning}
          thoughtProcess={thoughtProcess}
        />
      )}

      {/* Annotation Tooltip */}
      {selectedAnnotation && (
        <AnnotationTooltip 
          annotation={selectedAnnotation}
          onClose={() => setSelectedAnnotation(null)}
        />
      )}
    </div>
  );
};

export default EnhancedDeliverableView; 