import React, { useState } from 'react';
import { FileText, Globe2, Mail, MessageSquare, ExternalLink, Info, ChevronDown, ChevronUp } from 'lucide-react';

const SourceAttribution = ({ response, sources, confidence }) => {
  const [showDetails, setShowDetails] = useState(false);

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

  const renderResponseWithCitations = () => {
    if (!response || !sources) return response;

    let processedResponse = response;
    
    // Add citation markers to response
    sources.forEach((source, index) => {
      const citationMarker = `[${index + 1}]`;
      // This is a simplified version - in a real implementation, you'd want
      // to match specific phrases or sentences to their sources
      processedResponse = processedResponse.replace(
        new RegExp(source.keyPhrase || source.name, 'gi'),
        `${source.keyPhrase || source.name}${citationMarker}`
      );
    });

    return processedResponse;
  };

  return (
    <div className="space-y-4">
      {/* Confidence Indicator */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
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

      {/* Response with Citations */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">AI Response</h3>
        <div className="prose prose-sm max-w-none">
          <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {renderResponseWithCitations()}
          </div>
        </div>
      </div>

      {/* Sources Used */}
      {sources && sources.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Sources Used ({sources.length})</h3>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
            >
              {showDetails ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  Hide Details
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  Show Details
                </>
              )}
            </button>
          </div>

          <div className="space-y-3">
            {sources.map((source, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
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
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          [{index + 1}]
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 mb-2">
                        {source.type} • {source.chunks || 1} chunks used
                      </div>
                      
                      {showDetails && (
                        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded border-l-4 border-blue-200">
                          <div className="font-medium mb-1">Relevant Excerpt:</div>
                          <div className="italic">
                            "{source.excerpt || 'Content from this source was used to generate the response.'}"
                          </div>
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
            ))}
          </div>
        </div>
      )}

      {/* Quality Metrics */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Quality Metrics</h3>
        <div className="grid grid-cols-2 gap-4">
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
        </div>
      </div>
    </div>
  );
};

export default SourceAttribution; 