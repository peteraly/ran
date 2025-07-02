import React, { useState } from 'react';
import './MultiFormatDeliverableView.css';

const MultiFormatDeliverableView = ({ formats, metadata, onClose }) => {
  const [activeTab, setActiveTab] = useState('executive_summary');
  const [copiedFormat, setCopiedFormat] = useState(null);

  const formatTabs = [
    { id: 'executive_summary', name: 'Executive Summary', icon: '📊' },
    { id: 'detailed_report', name: 'Detailed Report', icon: '📋' },
    { id: 'faq', name: 'FAQ Format', icon: '❓' },
    { id: 'slide_deck', name: 'Slide Deck', icon: '📈' }
  ];

  const copyToClipboard = async (content, formatId) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedFormat(formatId);
      setTimeout(() => setCopiedFormat(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const downloadFormat = (content, formatName) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formatName}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderFormatContent = (format) => {
    if (!format || format.error) {
      return (
        <div className="format-error">
          <p>❌ Error generating this format: {format?.error || 'Unknown error'}</p>
        </div>
      );
    }

    return (
      <div className="format-content">
        <div className="format-header">
          <div className="format-meta">
            <span className="word-count">{format.wordCount} words</span>
            <span className="confidence">Confidence: {format.confidence}%</span>
          </div>
          <div className="format-actions">
            <button
              className="action-button copy-button"
              onClick={() => copyToClipboard(format.content, format.deliverableType)}
            >
              {copiedFormat === format.deliverableType ? '✓ Copied!' : '📋 Copy'}
            </button>
            <button
              className="action-button download-button"
              onClick={() => downloadFormat(format.content, format.deliverableType)}
            >
              💾 Download
            </button>
          </div>
        </div>
        
        <div className="content-display">
          {format.content.split('\n').map((line, index) => (
            <p key={index} className="content-line">
              {line}
            </p>
          ))}
        </div>

        {format.insights && format.insights.length > 0 && (
          <div className="format-insights">
            <h4>🔍 Key Insights</h4>
            <ul>
              {format.insights.map((insight, index) => (
                <li key={index}>{insight}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="multi-format-view">
      <div className="view-header">
        <h2>🚀 Multi-Format Deliverables</h2>
        <button className="close-button" onClick={onClose}>✕</button>
      </div>

      {metadata && (
        <div className="metadata-panel">
          <div className="metadata-item">
            <strong>Query:</strong> {metadata.query}
          </div>
          <div className="metadata-item">
            <strong>Sources Used:</strong> {metadata.sourcesUsed}
          </div>
          <div className="metadata-item">
            <strong>Confidence:</strong> {metadata.diversityAnalysis?.confidence || 0}%
          </div>
        </div>
      )}

      <div className="tab-container">
        <div className="tab-header">
          {formatTabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-name">{tab.name}</span>
              {formats[tab.id]?.error && (
                <span className="error-indicator">⚠️</span>
              )}
            </button>
          ))}
        </div>

        <div className="tab-content">
          {renderFormatContent(formats[activeTab])}
        </div>
      </div>

      {metadata?.diversityAnalysis && (
        <div className="diversity-panel">
          <h4>📊 Source Diversity Analysis</h4>
          <div className="diversity-metrics">
            <div className="metric">
              <span className="metric-label">Total Sources:</span>
              <span className="metric-value">{metadata.diversityAnalysis.totalSources}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Source Types:</span>
              <span className="metric-value">{metadata.diversityAnalysis.sourceTypes}</span>
            </div>
          </div>
          
          {metadata.diversityAnalysis.warnings?.length > 0 && (
            <div className="warnings">
              <h5>⚠️ Warnings</h5>
              <ul>
                {metadata.diversityAnalysis.warnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </div>
          )}

          {metadata.diversityAnalysis.recommendations?.length > 0 && (
            <div className="recommendations">
              <h5>💡 Recommendations</h5>
              <ul>
                {metadata.diversityAnalysis.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MultiFormatDeliverableView; 