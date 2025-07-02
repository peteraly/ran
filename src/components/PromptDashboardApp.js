import React, { useState, useEffect } from 'react';
import { processRagQuery, generateMultiFormatDeliverables } from '../services/connections';
import EnhancedDeliverableView from './EnhancedDeliverableView';
import DeliverableTypeSelector from './DeliverableTypeSelector';
import MultiFormatDeliverableView from './MultiFormatDeliverableView';
import './PromptDashboardApp.css';

const PromptDashboardApp = () => {
  const [query, setQuery] = useState('');
  const [selectedSources, setSelectedSources] = useState([]);
  const [deliverableType, setDeliverableType] = useState('executive_summary');
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState(null);
  const [multiFormatResults, setMultiFormatResults] = useState(null);
  const [showMultiFormat, setShowMultiFormat] = useState(false);
  const [isGeneratingMulti, setIsGeneratingMulti] = useState(false);

  // Mock data for demonstration
  const mockChunks = [
    {
      content: "Visa operates as a trusted bridge, helping connect both platforms and new technologies, including stablecoin-native players, with our global network to provide fair and open access to banking services.",
      score: 0.89,
      metadata: { filename: "Visa's role in stablecoins _ Visa.pdf" }
    },
    {
      content: "In 2025, we believe that every institution that moves money will need a stablecoin strategy. As more players in the payments ecosystem explore this powerful new technology, Visa stands ready to help our partners navigate the transformation.",
      score: 0.87,
      metadata: { filename: "Visa's role in stablecoins _ Visa.pdf" }
    }
  ];

  const handleGenerateDeliverable = async () => {
    if (!query.trim() || selectedSources.length === 0) {
      alert('Please enter a query and select at least one source.');
      return;
    }

    setIsProcessing(true);
    try {
      const result = await processRagQuery(query, mockChunks, selectedSources, deliverableType);
      setResults(result);
      console.log('Deliverable generated:', result);
    } catch (error) {
      console.error('Error generating deliverable:', error);
      alert('Error generating deliverable. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateMultiFormat = async () => {
    if (!query.trim() || selectedSources.length === 0) {
      alert('Please enter a query and select at least one source.');
      return;
    }

    setIsGeneratingMulti(true);
    try {
      const result = await generateMultiFormatDeliverables(query, mockChunks, selectedSources);
      setMultiFormatResults(result);
      setShowMultiFormat(true);
      console.log('Multi-format deliverables generated:', result);
    } catch (error) {
      console.error('Error generating multi-format deliverables:', error);
      alert('Error generating multi-format deliverables. Please try again.');
    } finally {
      setIsGeneratingMulti(false);
    }
  };

  const handleSourceToggle = (source) => {
    setSelectedSources(prev => 
      prev.includes(source) 
        ? prev.filter(s => s !== source)
        : [...prev, source]
    );
  };

  return (
    <div className="prompt-dashboard">
      <div className="dashboard-header">
        <h1>🎯 Enhanced RAG Deliverable Generator</h1>
        <p>Create high-quality, AI-synthesized deliverables from your selected sources</p>
      </div>

      <div className="dashboard-content">
        <div className="left-panel">
          <div className="query-section">
            <h3>📝 Task Prompt</h3>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter your query or task prompt here..."
              rows={4}
            />
          </div>

          <div className="source-selection">
            <h3>📚 Source Selection</h3>
            <div className="source-list">
              {['Visa\'s role in stablecoins _ Visa.pdf'].map((source) => (
                <div
                  key={source}
                  className={`source-item ${selectedSources.includes(source) ? 'selected' : ''}`}
                  onClick={() => handleSourceToggle(source)}
                >
                  <span className="source-name">{source}</span>
                  <span className="source-status">
                    {selectedSources.includes(source) ? '✓ Selected' : 'Click to select'}
                  </span>
                </div>
              ))}
            </div>
            <p className="source-count">
              {selectedSources.length} source(s) selected
            </p>
          </div>

          <DeliverableTypeSelector
            selectedType={deliverableType}
            onTypeChange={setDeliverableType}
            onGenerateMultiFormat={handleGenerateMultiFormat}
            isGenerating={isGeneratingMulti}
          />

          <div className="action-buttons">
            <button
              className="generate-button"
              onClick={handleGenerateDeliverable}
              disabled={isProcessing || !query.trim() || selectedSources.length === 0}
            >
              {isProcessing ? '🔄 Generating...' : '🚀 Generate Deliverable'}
            </button>
          </div>
        </div>

        <div className="right-panel">
          {results && (
            <EnhancedDeliverableView
              results={results}
              query={query}
              selectedSources={selectedSources}
            />
          )}
          
          {!results && (
            <div className="empty-state">
              <div className="empty-icon">📊</div>
              <h3>Ready to Generate</h3>
              <p>Enter a query, select sources, and choose your deliverable format to get started.</p>
            </div>
          )}
        </div>
      </div>

      {showMultiFormat && multiFormatResults && (
        <div className="modal-overlay">
          <MultiFormatDeliverableView
            formats={multiFormatResults.formats || {}}
            metadata={multiFormatResults.metadata || {}}
            onClose={() => setShowMultiFormat(false)}
          />
        </div>
      )}
    </div>
  );
};

export default PromptDashboardApp; 