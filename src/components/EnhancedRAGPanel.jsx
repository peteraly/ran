import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Brain, 
  FileText, 
  Star, 
  AlertTriangle, 
  CheckCircle, 
  Loader2,
  Zap,
  Target,
  Shield
} from 'lucide-react';

const EnhancedRAGPanel = ({ onQuerySubmit }) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [useActiveRAG, setUseActiveRAG] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Fetch enhanced documents on component mount
  useEffect(() => {
    fetchEnhancedDocuments();
  }, []);

  const fetchEnhancedDocuments = async () => {
    try {
      const response = await fetch('/api/enhanced-documents');
      const data = await response.json();
      if (data.success) {
        setDocuments(data.documents);
      }
    } catch (error) {
      console.error('Error fetching enhanced documents:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/enhanced-query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query.trim(),
          useActiveRAG,
          maxDocuments: 5
        }),
      });

      const data = await response.json();
      if (data.success) {
        setResult(data);
        if (onQuerySubmit) {
          onQuerySubmit(data);
        }
      } else {
        setResult({ error: data.error });
      }
    } catch (error) {
      setResult({ error: 'Failed to process query' });
    } finally {
      setIsLoading(false);
    }
  };

  const getRelevanceColor = (score) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRelevanceIcon = (score) => {
    if (score >= 8) return <Star className="w-4 h-4 text-green-600" />;
    if (score >= 6) return <Target className="w-4 h-4 text-yellow-600" />;
    return <AlertTriangle className="w-4 h-4 text-red-600" />;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <Brain className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900">Enhanced RAG System</h2>
        {useActiveRAG && (
          <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm">
            <Zap className="w-3 h-3" />
            Active RAG
          </div>
        )}
      </div>

      {/* Query Form */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask a question about your documents..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            Search
          </button>
        </div>

        {/* Advanced Options */}
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
          >
            {showAdvanced ? 'Hide' : 'Show'} Advanced Options
          </button>
          
          {showAdvanced && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={useActiveRAG}
                  onChange={(e) => setUseActiveRAG(e.target.checked)}
                  className="rounded"
                />
                <div className="flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  Enable Active RAG (Document grading, hallucination checking)
                </div>
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Active RAG provides better accuracy through document relevance grading and hallucination detection.
              </p>
            </div>
          )}
        </div>
      </form>

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {result.error ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-medium">Error</span>
              </div>
              <p className="text-red-600 mt-1">{result.error}</p>
            </div>
          ) : (
            <>
              {/* Answer */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-900">Answer</span>
                  {result.metadata?.hallucinationCheck && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                      <Shield className="w-3 h-3" />
                      Verified
                    </div>
                  )}
                </div>
                <p className="text-blue-800">{result.answer}</p>
              </div>

              {/* Sources */}
              {result.sources && result.sources.length > 0 && (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-4 h-4 text-gray-600" />
                    <span className="font-medium text-gray-900">Sources</span>
                    <span className="text-sm text-gray-500">
                      ({result.sources.length} documents)
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    {result.sources.map((source, index) => (
                      <div key={index} className="p-3 bg-white border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">{source.filename}</span>
                          {source.relevanceScore && (
                            <div className="flex items-center gap-1">
                              {getRelevanceIcon(source.relevanceScore)}
                              <span className={`text-sm font-medium ${getRelevanceColor(source.relevanceScore)}`}>
                                {source.relevanceScore}/10
                              </span>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {source.summary}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Metadata */}
              {result.metadata && (
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-gray-600" />
                    <span className="font-medium text-gray-900">Query Analysis</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Documents Retrieved:</span>
                      <span className="ml-2 font-medium">{result.metadata.totalDocumentsRetrieved}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Queries Used:</span>
                      <span className="ml-2 font-medium">{result.metadata.queriesUsed?.length || 1}</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Document Stats */}
      {documents.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-gray-600" />
            <span className="font-medium text-gray-900">Enhanced Documents</span>
            <span className="text-sm text-gray-500">({documents.length} total)</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Total Chunks:</span>
              <span className="ml-2 font-medium">
                {documents.reduce((sum, doc) => sum + (doc.chunkCount || 0), 0)}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Latest Upload:</span>
              <span className="ml-2 font-medium">
                {documents.length > 0 ? new Date(documents[0].createdAt).toLocaleDateString() : 'None'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedRAGPanel; 