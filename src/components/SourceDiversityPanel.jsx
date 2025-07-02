import React, { useState } from 'react';
import { 
  Info, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  FileText, 
  Globe2, 
  Shield, 
  Users, 
  BookOpen,
  ChevronDown,
  ChevronUp,
  Lightbulb
} from 'lucide-react';

const SourceDiversityPanel = ({ sourceDiversity, confidence }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(true);

  if (!sourceDiversity) return null;

  const { analysis, summary, recommendations, warnings } = sourceDiversity;

  const getSourceTypeIcon = (type) => {
    switch (type) {
      case 'primary': return <FileText className="w-4 h-4" />;
      case 'secondary': return <Globe2 className="w-4 h-4" />;
      case 'regulatory': return <Shield className="w-4 h-4" />;
      case 'competitive': return <TrendingUp className="w-4 h-4" />;
      case 'technical': return <BookOpen className="w-4 h-4" />;
      case 'academic': return <BookOpen className="w-4 h-4" />;
      case 'social': return <Users className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getSourceTypeColor = (type) => {
    switch (type) {
      case 'primary': return 'text-blue-600 bg-blue-100';
      case 'secondary': return 'text-green-600 bg-green-100';
      case 'regulatory': return 'text-purple-600 bg-purple-100';
      case 'competitive': return 'text-orange-600 bg-orange-100';
      case 'technical': return 'text-indigo-600 bg-indigo-100';
      case 'academic': return 'text-teal-600 bg-teal-100';
      case 'social': return 'text-pink-600 bg-pink-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-4">
      {/* Confidence and Diversity Overview */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-600" />
            Source Diversity Analysis
          </h3>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
          >
            {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {showDetails ? 'Hide' : 'Show'} Details
          </button>
        </div>

        {/* Confidence Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {summary.confidence}%
            </div>
            <div className="text-sm text-gray-600">Confidence Score</div>
            <div className={`text-xs mt-1 px-2 py-1 rounded-full ${summary.confidenceColor}`}>
              {summary.confidenceLabel}
            </div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {summary.sourceCount}
            </div>
            <div className="text-sm text-gray-600">Total Sources</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {summary.sourceTypes}
            </div>
            <div className="text-sm text-gray-600">Source Types</div>
            <div className={`text-xs mt-1 px-2 py-1 rounded-full ${summary.diversityIndicator.color}`}>
              {summary.diversityIndicator.label}
            </div>
          </div>
        </div>

        {/* Source Type Breakdown */}
        {showDetails && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="font-medium text-gray-900 mb-3">Source Type Distribution</h4>
            <div className="space-y-2">
              {summary.sourceBreakdown.map((source) => (
                <div key={source.type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getSourceTypeIcon(source.type)}
                    <div>
                      <div className="font-medium capitalize">{source.type}</div>
                      <div className="text-sm text-gray-500">{source.count} sources</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{source.percentage}%</div>
                    <div className="text-sm text-gray-500">of total</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Warnings */}
      {warnings && warnings.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="font-medium text-red-900">Source Diversity Warnings</span>
          </div>
          <ul className="space-y-1">
            {warnings.map((warning, index) => (
              <li key={index} className="text-sm text-red-700 flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-900">Improvement Recommendations</span>
            </div>
            <button
              onClick={() => setShowRecommendations(!showRecommendations)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {showRecommendations ? 'Hide' : 'Show'}
            </button>
          </div>
          
          {showRecommendations && (
            <ul className="space-y-2">
              {recommendations.map((recommendation, index) => (
                <li key={index} className="text-sm text-blue-700 flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>{recommendation}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Detailed Metrics */}
      {showDetails && analysis.metrics && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="font-medium text-gray-900 mb-3">Detailed Metrics</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">{analysis.metrics.primarySources}</div>
              <div className="text-xs text-gray-600">Primary Sources</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">{analysis.metrics.secondarySources}</div>
              <div className="text-xs text-gray-600">Secondary Sources</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">{analysis.metrics.regulatorySources}</div>
              <div className="text-xs text-gray-600">Regulatory Sources</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-orange-600">{analysis.metrics.competitiveSources}</div>
              <div className="text-xs text-gray-600">Competitive Sources</div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              <strong>Diversity Score:</strong> {Math.round(analysis.diversity * 100)}%
            </div>
            <div className="text-sm text-gray-600">
              <strong>Base Confidence:</strong> {Math.round(analysis.confidence * 100)}%
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SourceDiversityPanel; 