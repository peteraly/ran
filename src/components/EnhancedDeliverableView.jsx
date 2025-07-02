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
  AlertCircle
} from 'lucide-react';
import { Button } from './ui/button';
import SourceDiversityPanel from './SourceDiversityPanel';

const EnhancedDeliverableView = ({ 
  response, 
  sources, 
  confidence, 
  retrievedChunks = [],
  sourceDiversity = null,
  onDownload,
  onCopy 
}) => {
  const [showSourceDetails, setShowSourceDetails] = useState(true);
  const [showHighlighting, setShowHighlighting] = useState(true);
  const [selectedSource, setSelectedSource] = useState(null);
  const [viewMode, setViewMode] = useState('split'); // 'split', 'deliverable', 'sources'

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
      
      const matches = chunkFilename === sourceName || chunkSource === sourceName;
      console.log(`🔍 Chunk ${chunk.id}: filename="${chunkFilename}", source="${chunkSource}", matches=${matches}`);
      
      return matches;
    });
    
    console.log(`🔍 Found ${matchingChunks.length} chunks for source: ${sourceName}`);
    return matchingChunks;
  };

  // Highlight text in source content - FIXED: Escape regex special characters
  const highlightTextInSource = (content, query) => {
    if (!showHighlighting || !query) return content;
    
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    return content.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
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
                                  __html: highlightTextInSource(chunk.content, source.keyPhrase)
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
    </div>
  );
};

export default EnhancedDeliverableView; 