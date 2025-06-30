import React, { useState } from 'react';
import { TestTube, Play, CheckCircle, AlertCircle, Database, Brain, Search } from 'lucide-react';
import { Button } from './ui/button';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export default function RagTestPanel() {
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [testQuery, setTestQuery] = useState('What are the latest stablecoin regulations?');
  const [step, setStep] = useState('ready');

  const runTest = async () => {
    setIsLoading(true);
    setStep('populating');
    setTestResults(null);

    try {
      // Step 1: Populate with test data
      const populateResponse = await fetch(`${API_BASE_URL}/api/test/populate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!populateResponse.ok) {
        throw new Error('Failed to populate test data');
      }

      setStep('testing');
      
      // Step 2: Test RAG functionality
      const testResponse = await fetch(`${API_BASE_URL}/api/test/rag`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: testQuery })
      });

      if (!testResponse.ok) {
        throw new Error('Failed to test RAG functionality');
      }

      const results = await testResponse.json();
      setTestResults(results);
      setStep('complete');

    } catch (error) {
      console.error('Test failed:', error);
      setTestResults({ error: error.message });
      setStep('error');
    } finally {
      setIsLoading(false);
    }
  };

  const getStepIcon = (currentStep) => {
    switch (currentStep) {
      case 'ready':
        return <TestTube className="h-5 w-5 text-gray-400" />;
      case 'populating':
        return <Database className="h-5 w-5 text-blue-500 animate-pulse" />;
      case 'testing':
        return <Brain className="h-5 w-5 text-purple-500 animate-pulse" />;
      case 'complete':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <TestTube className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStepText = (currentStep) => {
    switch (currentStep) {
      case 'ready':
        return 'Ready to test RAG system';
      case 'populating':
        return 'Populating test data...';
      case 'testing':
        return 'Testing RAG functionality...';
      case 'complete':
        return 'Test completed successfully!';
      case 'error':
        return 'Test failed';
      default:
        return 'Ready to test';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
      <div className="flex items-center gap-2 mb-6">
        <TestTube className="h-5 w-5 text-blue-500" />
        <h3 className="text-lg font-semibold text-gray-900">RAG System Test</h3>
      </div>

      <div className="space-y-4">
        {/* Test Query Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Test Query
          </label>
          <input
            type="text"
            value={testQuery}
            onChange={(e) => setTestQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter a test query..."
            disabled={isLoading}
          />
        </div>

        {/* Test Status */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          {getStepIcon(step)}
          <span className="text-sm font-medium text-gray-700">
            {getStepText(step)}
          </span>
        </div>

        {/* Run Test Button */}
        <Button
          onClick={runTest}
          disabled={isLoading || !testQuery.trim()}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              Running Test...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              Run RAG Test
            </div>
          )}
        </Button>

        {/* Test Results */}
        {testResults && (
          <div className="mt-6 space-y-4">
            <h4 className="font-medium text-gray-900">Test Results</h4>
            
            {testResults.error ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertCircle className="h-4 w-4" />
                  <span className="font-medium">Test Failed</span>
                </div>
                <p className="text-red-700 mt-1">{testResults.error}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Retrieval Results */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-800 mb-2">
                    <Search className="h-4 w-4" />
                    <span className="font-medium">Content Retrieval</span>
                  </div>
                  <div className="text-sm text-blue-700">
                    <p>Query: "{testResults.query}"</p>
                    <p>Retrieved: {testResults.retrieval?.results?.length || 0} relevant documents</p>
                    <p>Response time: {(testResults.retrieval?.responseTime / 1000 || 0).toFixed(2)}s</p>
                  </div>
                </div>

                {/* RAG Results */}
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center gap-2 text-purple-800 mb-2">
                    <Brain className="h-4 w-4" />
                    <span className="font-medium">AI Analysis</span>
                  </div>
                  <div className="text-sm text-purple-700">
                    <p>Confidence: {(testResults.rag?.confidence * 100 || 0).toFixed(0)}%</p>
                    <p>Sources used: {testResults.rag?.sourcesUsed || 0}</p>
                    <p>Processing time: {(testResults.rag?.processingTime / 1000 || 0).toFixed(2)}s</p>
                  </div>
                </div>

                {/* Summary */}
                {testResults.rag?.summary && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 text-green-800 mb-2">
                      <CheckCircle className="h-4 w-4" />
                      <span className="font-medium">Generated Summary</span>
                    </div>
                    <ul className="text-sm text-green-700 space-y-1">
                      {testResults.rag.summary.map((item, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-green-600 mt-1">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Insights */}
                {testResults.rag?.insights && (
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center gap-2 text-orange-800 mb-2">
                      <Brain className="h-4 w-4" />
                      <span className="font-medium">Key Insights</span>
                    </div>
                    <ul className="text-sm text-orange-700 space-y-1">
                      {testResults.rag.insights.map((insight, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-orange-600 mt-1">•</span>
                          <span>{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recommendations */}
                {testResults.rag?.recommendations && (
                  <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                    <div className="flex items-center gap-2 text-indigo-800 mb-2">
                      <CheckCircle className="h-4 w-4" />
                      <span className="font-medium">Recommendations</span>
                    </div>
                    <ul className="text-sm text-indigo-700 space-y-1">
                      {testResults.rag.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-indigo-600 mt-1">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h5 className="font-medium text-gray-900 mb-2">How to verify RAG is working:</h5>
          <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
            <li>Click "Run RAG Test" to populate sample data</li>
            <li>Check that content retrieval finds relevant documents</li>
            <li>Verify AI analysis generates insights from the retrieved content</li>
            <li>Confirm the summary references information from multiple sources</li>
            <li>Check the Source Activity dashboard to see the processing activity</li>
          </ol>
        </div>
      </div>
    </div>
  );
} 