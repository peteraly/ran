import React, { useState } from 'react';
import { Brain, Lightbulb, AlertTriangle, Info, ChevronDown, ChevronRight } from 'lucide-react';

const ReasoningPanel = ({ reasoning, thoughtProcess, content }) => {
  const [expandedSections, setExpandedSections] = useState({
    reasoning: true,
    evidence: true,
    inference: true,
    limitation: true,
    thoughtProcess: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const renderAnnotationType = (type, items, icon, color) => {
    if (!items || items.length === 0) return null;

    return (
      <div className="mb-4">
        <button
          onClick={() => toggleSection(type)}
          className="flex items-center gap-2 w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {icon}
          <span className="font-medium text-gray-900 capitalize">
            {type} ({items.length})
          </span>
          {expandedSections[type] ? (
            <ChevronDown className="h-4 w-4 ml-auto" />
          ) : (
            <ChevronRight className="h-4 w-4 ml-auto" />
          )}
        </button>
        
        {expandedSections[type] && (
          <div className="mt-2 space-y-2">
            {items.map((item, index) => (
              <div key={index} className={`p-3 rounded-lg border-l-4 ${color} bg-white`}>
                <p className="text-sm text-gray-700">{item}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderAnnotatedContent = () => {
    if (!content) return null;

    // Highlight reasoning annotations in the content
    const highlightedContent = content
      .replace(/\[REASONING:\s*([^\]]+)\]/g, '<span class="bg-blue-100 text-blue-800 px-1 rounded text-sm">[REASONING: $1]</span>')
      .replace(/\[EVIDENCE:\s*([^\]]+)\]/g, '<span class="bg-green-100 text-green-800 px-1 rounded text-sm">[EVIDENCE: $1]</span>')
      .replace(/\[INFERENCE:\s*([^\]]+)\]/g, '<span class="bg-purple-100 text-purple-800 px-1 rounded text-sm">[INFERENCE: $1]</span>')
      .replace(/\[LIMITATION:\s*([^\]]+)\]/g, '<span class="bg-yellow-100 text-yellow-800 px-1 rounded text-sm">[LIMITATION: $1]</span>');

    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-500" />
          Annotated Content
        </h3>
        <div 
          className="prose prose-sm max-w-none p-4 bg-gray-50 rounded-lg"
          dangerouslySetInnerHTML={{ __html: highlightedContent }}
        />
      </div>
    );
  };

  if (!reasoning && !thoughtProcess) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="h-5 w-5 text-purple-500" />
        <h2 className="text-xl font-semibold text-gray-900">AI Reasoning Analysis</h2>
        {reasoning?.totalAnnotations > 0 && (
          <span className="ml-auto text-sm text-gray-500">
            {reasoning.totalAnnotations} annotations
          </span>
        )}
      </div>

      {/* Annotated Content Preview */}
      {renderAnnotatedContent()}

      {/* Reasoning Breakdown */}
      <div className="space-y-4">
        {renderAnnotationType(
          'reasoning', 
          reasoning?.reasoning, 
          <Lightbulb className="h-4 w-4 text-blue-500" />,
          'border-blue-500'
        )}
        
        {renderAnnotationType(
          'evidence', 
          reasoning?.evidence, 
          <Info className="h-4 w-4 text-green-500" />,
          'border-green-500'
        )}
        
        {renderAnnotationType(
          'inference', 
          reasoning?.inference, 
          <Brain className="h-4 w-4 text-purple-500" />,
          'border-purple-500'
        )}
        
        {renderAnnotationType(
          'limitation', 
          reasoning?.limitation, 
          <AlertTriangle className="h-4 w-4 text-yellow-500" />,
          'border-yellow-500'
        )}
      </div>

      {/* Thought Process Analysis */}
      {thoughtProcess && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={() => toggleSection('thoughtProcess')}
            className="flex items-center gap-2 w-full text-left p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <Brain className="h-4 w-4 text-purple-500" />
            <span className="font-medium text-purple-900">
              AI Thought Process
            </span>
            {expandedSections.thoughtProcess ? (
              <ChevronDown className="h-4 w-4 ml-auto" />
            ) : (
              <ChevronRight className="h-4 w-4 ml-auto" />
            )}
          </button>
          
          {expandedSections.thoughtProcess && (
            <div className="mt-3 p-4 bg-purple-50 rounded-lg">
              <div className="prose prose-sm max-w-none text-purple-900">
                {thoughtProcess.split('\n').map((line, index) => (
                  <p key={index} className="mb-2">{line}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Annotation Legend</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-100 rounded"></div>
            <span>Reasoning</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-100 rounded"></div>
            <span>Evidence</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-purple-100 rounded"></div>
            <span>Inference</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-100 rounded"></div>
            <span>Limitation</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReasoningPanel; 