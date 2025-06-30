import React from 'react';
import { Search, Database, Brain, CheckCircle, AlertCircle, Clock, Zap, FileText, Globe2, Mail, MessageSquare } from 'lucide-react';

const RagProcessingPipeline = ({ 
  currentStage, 
  stages, 
  retrievedChunks, 
  processingTime, 
  confidence,
  sourceBreakdown 
}) => {
  const getStageIcon = (stage) => {
    switch (stage.type) {
      case 'scanning': return <Search className="w-4 h-4" />;
      case 'retrieving': return <Database className="w-4 h-4" />;
      case 'analyzing': return <Brain className="w-4 h-4" />;
      case 'complete': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStageColor = (stage, currentStage) => {
    if (stage.status === 'error') return 'text-red-500 bg-red-50 border-red-200';
    if (stage.status === 'complete') return 'text-green-600 bg-green-50 border-green-200';
    if (stage.type === currentStage) return 'text-blue-600 bg-blue-50 border-blue-200 animate-pulse';
    return 'text-gray-500 bg-gray-50 border-gray-200';
  };

  const getSourceIcon = (source) => {
    switch (source.type) {
      case 'local': return <FileText className="w-3 h-3" />;
      case 'web': return <Globe2 className="w-3 h-3" />;
      case 'email': return <Mail className="w-3 h-3" />;
      case 'slack': return <MessageSquare className="w-3 h-3" />;
      default: return <FileText className="w-3 h-3" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Processing Pipeline */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-blue-600" />
          RAG Processing Pipeline
        </h3>
        
        <div className="space-y-3">
          {stages.map((stage, index) => (
            <div
              key={stage.type}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-300 ${getStageColor(stage, currentStage)}`}
            >
              <div className="flex-shrink-0">
                {getStageIcon(stage)}
              </div>
              <div className="flex-1">
                <div className="font-medium">{stage.title}</div>
                <div className="text-sm opacity-75">{stage.description}</div>
                {stage.details && (
                  <div className="text-xs mt-1 opacity-60">{stage.details}</div>
                )}
              </div>
              <div className="flex-shrink-0">
                {stage.status === 'complete' && <CheckCircle className="w-4 h-4 text-green-600" />}
                {stage.status === 'error' && <AlertCircle className="w-4 h-4 text-red-600" />}
                {stage.status === 'processing' && (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Processing Stats */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="font-medium text-gray-900">{retrievedChunks?.length || 0}</div>
              <div className="text-gray-500">Chunks Retrieved</div>
            </div>
            <div>
              <div className="font-medium text-gray-900">{processingTime}ms</div>
              <div className="text-gray-500">Processing Time</div>
            </div>
            <div>
              <div className="font-medium text-gray-900">{Math.round(confidence * 100)}%</div>
              <div className="text-gray-500">Confidence</div>
            </div>
          </div>
        </div>
      </div>

      {/* Source Breakdown */}
      {sourceBreakdown && sourceBreakdown.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Source Contribution</h3>
          <div className="space-y-3">
            {sourceBreakdown.map((source, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {getSourceIcon(source)}
                  <div>
                    <div className="font-medium">{source.name}</div>
                    <div className="text-sm text-gray-500">{source.type}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{source.chunks} chunks</div>
                  <div className="text-sm text-gray-500">{source.contribution}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RagProcessingPipeline; 