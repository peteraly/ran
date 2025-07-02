import React from 'react';
import './DeliverableTypeSelector.css';

const DeliverableTypeSelector = ({ selectedType, onTypeChange, onGenerateMultiFormat, isGenerating }) => {
  const deliverableTypes = [
    {
      id: 'executive_summary',
      name: 'Executive Summary',
      description: 'Concise 2-3 paragraph summary with key insights and actionable takeaways',
      icon: '📊',
      bestFor: 'C-level presentations, quick overviews'
    },
    {
      id: 'detailed_report',
      name: 'Detailed Report',
      description: 'Comprehensive analysis with sections for findings, analysis, and recommendations',
      icon: '📋',
      bestFor: 'Deep analysis, stakeholder reports'
    },
    {
      id: 'faq',
      name: 'FAQ Format',
      description: 'Question-and-answer format addressing key concerns and questions',
      icon: '❓',
      bestFor: 'Stakeholder Q&A, training materials'
    },
    {
      id: 'slide_deck',
      name: 'Slide Deck Content',
      description: 'Presentation-ready content with headings, bullet points, and key metrics',
      icon: '📈',
      bestFor: 'Presentations, board meetings'
    }
  ];

  return (
    <div className="deliverable-type-selector">
      <div className="selector-header">
        <h3>🎯 Deliverable Format</h3>
        <p>Choose the format that best suits your audience and purpose</p>
      </div>
      
      <div className="type-grid">
        {deliverableTypes.map((type) => (
          <div
            key={type.id}
            className={`type-card ${selectedType === type.id ? 'selected' : ''}`}
            onClick={() => onTypeChange(type.id)}
          >
            <div className="type-icon">{type.icon}</div>
            <div className="type-content">
              <h4>{type.name}</h4>
              <p className="type-description">{type.description}</p>
              <p className="type-best-for">
                <strong>Best for:</strong> {type.bestFor}
              </p>
            </div>
            {selectedType === type.id && (
              <div className="selected-indicator">✓</div>
            )}
          </div>
        ))}
      </div>

      <div className="multi-format-section">
        <div className="multi-format-header">
          <h4>🚀 Generate All Formats</h4>
          <p>Create all four deliverable formats simultaneously for maximum flexibility</p>
        </div>
        <button
          className="multi-format-button"
          onClick={onGenerateMultiFormat}
          disabled={isGenerating}
        >
          {isGenerating ? '🔄 Generating...' : '✨ Generate All Formats'}
        </button>
      </div>
    </div>
  );
};

export default DeliverableTypeSelector; 