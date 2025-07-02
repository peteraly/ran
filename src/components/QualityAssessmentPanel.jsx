import React from 'react';
import { 
  CheckCircle, 
  AlertCircle, 
  Info, 
  FileText, 
  Target, 
  TrendingUp,
  Award,
  AlertTriangle
} from 'lucide-react';

const QualityAssessmentPanel = ({ qualityValidation, styleGuideUsed, deliverableType }) => {
  if (!qualityValidation) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Info className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Quality Assessment</h3>
        </div>
        <p className="text-gray-500">Quality validation not available for this deliverable.</p>
      </div>
    );
  }

  const { isValid, issues, wordCount, citationCount } = qualityValidation;

  const getQualityScore = () => {
    let score = 100;
    
    // Deduct points for issues
    issues.forEach(issue => {
      if (issue.includes('Length')) score -= 20;
      if (issue.includes('citations')) score -= 30;
      if (issue.includes('bullet points')) score -= 15;
    });
    
    return Math.max(0, score);
  };

  const qualityScore = getQualityScore();
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold">Quality Assessment</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Style Guide:</span>
          <span className="text-sm font-medium text-gray-700 capitalize">
            {styleGuideUsed || deliverableType}
          </span>
        </div>
      </div>

      {/* Quality Score */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Overall Quality Score</span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(qualityScore)}`}>
            {qualityScore}/100
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              qualityScore >= 80 ? 'bg-green-500' : 
              qualityScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${qualityScore}%` }}
          />
        </div>
        <div className="flex items-center gap-2 mt-2">
          {isValid ? (
            <CheckCircle className="w-4 h-4 text-green-500" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
          )}
          <span className="text-sm text-gray-600">
            {getScoreLabel(qualityScore)} Quality
          </span>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{wordCount}</div>
          <div className="text-xs text-gray-600">Words</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{citationCount}</div>
          <div className="text-xs text-gray-600">Citations</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            {isValid ? '✓' : '⚠'}
          </div>
          <div className="text-xs text-gray-600">Status</div>
        </div>
      </div>

      {/* Issues */}
      {issues.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 text-yellow-500" />
            <h4 className="font-medium text-gray-900">Quality Issues</h4>
          </div>
          <div className="space-y-2">
            {issues.map((issue, index) => (
              <div key={index} className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-yellow-800">{issue}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-blue-500" />
          <h4 className="font-medium text-gray-900">Recommendations</h4>
        </div>
        <div className="space-y-2">
          {qualityScore < 80 && (
            <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <strong>Improve Quality:</strong> Consider adding more citations, adjusting length, or including more structured content.
              </div>
            </div>
          )}
          
          {citationCount < 3 && (
            <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <FileText className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <strong>Add Citations:</strong> Include more source references [1], [2], etc. to improve credibility.
              </div>
            </div>
          )}
          
          {isValid && (
            <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-green-800">
                <strong>Excellent Quality:</strong> This deliverable meets all quality standards for {deliverableType}.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Style Guide Info */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Style Guide Applied</span>
        </div>
        <div className="text-sm text-gray-600">
          This deliverable was generated using the {styleGuideUsed || deliverableType} style guide, 
          which ensures consistent formatting, appropriate length, and proper citation structure.
        </div>
      </div>
    </div>
  );
};

export default QualityAssessmentPanel; 