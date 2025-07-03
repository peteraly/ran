import React, { useState, useEffect } from 'react';
import { processRagQuery, generateMultiFormatDeliverables } from '../services/connections';
import EnhancedDeliverableView from './EnhancedDeliverableView';
import DeliverableTypeSelector from './DeliverableTypeSelector';
import MultiFormatDeliverableView from './MultiFormatDeliverableView';
import './PromptDashboardApp.css';

// API Configuration - same as connections.js
const API_BASE_URL = process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : 'https://ran-backend-pp3x.onrender.com');

const PromptDashboardApp = () => {
  const [query, setQuery] = useState('');
  const [selectedSources, setSelectedSources] = useState([]);
  const [deliverableType, setDeliverableType] = useState('executive_summary');
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState(null);
  const [multiFormatResults, setMultiFormatResults] = useState(null);
  const [showMultiFormat, setShowMultiFormat] = useState(false);
  const [isGeneratingMulti, setIsGeneratingMulti] = useState(false);
  const [availableSources, setAvailableSources] = useState([]);
  const [isLoadingSources, setIsLoadingSources] = useState(true);

  // Fetch available sources from backend
  useEffect(() => {
    const fetchSources = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/uploaded-files`);
        const data = await response.json();
        if (data.success && data.files) {
          // Remove duplicates based on filename
          const uniqueFiles = data.files.filter((file, index, self) => 
            index === self.findIndex(f => f.filename === file.filename)
          );
          setAvailableSources(uniqueFiles);
        }
      } catch (error) {
        console.error('Error fetching sources:', error);
      } finally {
        setIsLoadingSources(false);
      }
    };

    fetchSources();
  }, []);

  const handleGenerateDeliverable = async () => {
    if (!query.trim() || selectedSources.length === 0) {
      alert('Please enter a query and select at least one source.');
      return;
    }

    setIsProcessing(true);
    try {
      // Step 1: Retrieve relevant chunks from Pinecone
      console.log('🔄 Retrieving chunks from Pinecone...');
      const retrieveResponse = await fetch(`${API_BASE_URL}/api/retrieve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          sources: selectedSources,
          limit: 10
        }),
      });

      if (!retrieveResponse.ok) {
        throw new Error(`Failed to retrieve chunks: ${retrieveResponse.statusText}`);
      }

      const retrieveData = await retrieveResponse.json();
      console.log('✅ Retrieved chunks:', retrieveData);

      if (!retrieveData.success) {
        throw new Error(retrieveData.error || 'Failed to retrieve chunks');
      }

      // Step 2: Process RAG query with retrieved chunks
      const result = await processRagQuery(query, retrieveData.chunks, selectedSources, deliverableType);
      
      // Add the retrieved chunks to the result
      result.retrievedChunks = retrieveData.chunks;
      
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
      // Step 1: Retrieve relevant chunks from Pinecone
      console.log('🔄 Retrieving chunks for multi-format generation...');
      const retrieveResponse = await fetch(`${API_BASE_URL}/api/retrieve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          sources: selectedSources,
          limit: 10
        }),
      });

      if (!retrieveResponse.ok) {
        throw new Error(`Failed to retrieve chunks: ${retrieveResponse.statusText}`);
      }

      const retrieveData = await retrieveResponse.json();
      console.log('✅ Retrieved chunks for multi-format:', retrieveData);

      if (!retrieveData.success) {
        throw new Error(retrieveData.error || 'Failed to retrieve chunks');
      }

      // Step 2: Generate multi-format deliverables with retrieved chunks
      const result = await generateMultiFormatDeliverables(query, retrieveData.chunks, selectedSources);
      
      // Add the retrieved chunks to the result
      result.retrievedChunks = retrieveData.chunks;
      
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
              {isLoadingSources ? (
                <div className="loading-sources">Loading available sources...</div>
              ) : availableSources.length === 0 ? (
                <div className="no-sources">No sources available. Please upload files first.</div>
              ) : (
                availableSources.map((source) => (
                  <div
                    key={source.id}
                    className={`source-item ${selectedSources.includes(source.filename) ? 'selected' : ''}`}
                    onClick={() => handleSourceToggle(source.filename)}
                  >
                    <span className="source-name">{source.filename}</span>
                    <span className="source-status">
                      {selectedSources.includes(source.filename) ? '✓ Selected' : 'Click to select'}
                    </span>
                  </div>
                ))
              )}
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
              response={results.summary ? results.summary.join('\n\n') : 'No response available'}
              sources={selectedSources.map(source => ({ name: source, type: 'local' }))}
              confidence={results.confidence || 0.5}
              retrievedChunks={results.retrievedChunks || []}
              sourceDiversity={results.sourceDiversity}
              reasoning={results.reasoning}
              thoughtProcess={results.thoughtProcess}
              qualityValidation={results.qualityValidation}
              styleGuideUsed={results.styleGuideUsed}
              deliverableType={deliverableType}
              onDownload={(text) => {
                const blob = new Blob([text], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'deliverable.txt';
                a.click();
                URL.revokeObjectURL(url);
              }}
              onCopy={(text) => {
                navigator.clipboard.writeText(text);
                alert('Copied to clipboard!');
              }}
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