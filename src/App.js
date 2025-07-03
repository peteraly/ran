import React from 'react';
import PromptDashboardApp from './components/PromptDashboardApp';
import ErrorBoundary from './components/ErrorBoundary';
import DebugPanel from './components/DebugPanel';
import errorMonitor from './utils/errorMonitor';
import './App.css';

// Initialize error monitoring
console.log('🔧 Error monitoring initialized');

function App() {
  return (
    <ErrorBoundary>
      <div className="App">
        <PromptDashboardApp />
        <DebugPanel />
      </div>
    </ErrorBoundary>
  );
}

export default App; // Force Vercel rebuild - Tue Jul  1 23:05:15 EDT 2025
// Force cache invalidation - Tue Jul  1 23:18:09 EDT 2025
