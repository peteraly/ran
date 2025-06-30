import React, { useState } from 'react';
import { FileText, Globe2, Mail, MessageSquare, ChevronDown, ChevronUp, Star, Clock, ExternalLink } from 'lucide-react';

const ChunkPreviewCards = ({ chunks, onChunkSelect }) => {
  const [expandedChunks, setExpandedChunks] = useState(new Set());

  const toggleChunk = (chunkId) => {
    const newExpanded = new Set(expandedChunks);
    if (newExpanded.has(chunkId)) {
      newExpanded.delete(chunkId);
    } else {
      newExpanded.add(chunkId);
    }
    setExpandedChunks(newExpanded);
  };

  const getSourceIcon = (source) => {
    switch (source) {
      case 'local': return <FileText className="w-4 h-4" />;
      case 'web': return <Globe2 className="w-4 h-4" />;
      case 'email': return <Mail className="w-4 h-4" />;
      case 'slack': return <MessageSquare className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getRelevanceColor = (score) => {
    if (score >= 0.8) return 'text-green-600 bg-green-100';
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  if (!chunks || chunks.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Chunks Retrieved</h3>
        <p className="text-gray-500">No relevant content was found for your query.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Retrieved Content ({chunks.length})</h3>
        <div className="text-sm text-gray-500">
          Click chunks to see full content
        </div>
      </div>
      
      <div className="grid gap-4">
        {chunks.map((chunk, index) => (
          <div
            key={chunk.id || index}
            className="bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-all duration-200 cursor-pointer"
            onClick={() => onChunkSelect?.(chunk)}
          >
            {/* Chunk Header */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  {getSourceIcon(chunk.metadata?.source || 'local')}
                  <div>
                    <div className="font-medium text-gray-900">
                      {chunk.metadata?.filename || chunk.metadata?.title || 'Untitled Document'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {chunk.metadata?.source || 'local'} • {formatTimestamp(chunk.metadata?.indexedAt)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRelevanceColor(chunk.score)}`}>
                    {Math.round(chunk.score * 100)}% match
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleChunk(chunk.id || index);
                    }}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    {expandedChunks.has(chunk.id || index) ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              
              {/* Chunk Metadata */}
              <div className="flex items-center gap-4 text-xs text-gray-500">
                {chunk.metadata?.chunkIndex && (
                  <span>Chunk {chunk.metadata.chunkIndex + 1}</span>
                )}
                {chunk.metadata?.page && (
                  <span>Page {chunk.metadata.page}</span>
                )}
                {chunk.metadata?.url && (
                  <a
                    href={chunk.metadata.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 hover:text-blue-600"
                  >
                    <ExternalLink className="w-3 h-3" />
                    View Source
                  </a>
                )}
              </div>
            </div>

            {/* Chunk Content */}
            <div className="p-4">
              <div className="text-sm text-gray-700 leading-relaxed">
                {expandedChunks.has(chunk.id || index) ? (
                  <div>
                    "{chunk.content}"
                  </div>
                ) : (
                  <div>
                    "{chunk.content.substring(0, 200)}..."
                  </div>
                )}
              </div>
              
              {/* Expand/Collapse Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleChunk(chunk.id || index);
                }}
                className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                {expandedChunks.has(chunk.id || index) ? 'Show less' : 'Show more'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChunkPreviewCards; 