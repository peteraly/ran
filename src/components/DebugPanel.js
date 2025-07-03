import React, { useState, useEffect } from 'react';
import errorMonitor from '../utils/errorMonitor';

const DebugPanel = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [diagnostics, setDiagnostics] = useState(null);
  const [errorLog, setErrorLog] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV === 'development') {
      setIsVisible(true);
    }
    
    // Initial diagnostics
    runDiagnostics();
    
    // Set up periodic updates
    const interval = setInterval(() => {
      runDiagnostics();
      updateErrorLog();
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const runDiagnostics = async () => {
    setIsLoading(true);
    try {
      const results = await errorMonitor.runDiagnostics();
      setDiagnostics(results);
      setLastUpdate(new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Failed to run diagnostics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateErrorLog = () => {
    const log = errorMonitor.getErrorLog();
    setErrorLog(log);
  };

  const clearErrorLog = () => {
    errorMonitor.clearErrorLog();
    setErrorLog([]);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
      case 'working':
      case 'connected':
      case 'compatible':
        return '#28a745';
      case 'unhealthy':
      case 'error':
      case 'disconnected':
      case 'incompatible':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  const exportErrorLog = () => {
    const dataStr = JSON.stringify(errorLog, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `error-log-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!isVisible) return null;

  return (
    <div className="debug-panel">
      <div className="debug-toggle" onClick={() => setIsVisible(!isVisible)}>
        🐛 Debug
      </div>
      
      {isVisible && (
        <div className="debug-content">
          <div className="debug-header">
            <h3>🔧 Debug Panel</h3>
            <div className="debug-controls">
              <button onClick={runDiagnostics} disabled={isLoading}>
                {isLoading ? '🔄' : '🔄'} Refresh
              </button>
              <button onClick={clearErrorLog}>🗑️ Clear Log</button>
              <button onClick={exportErrorLog}>📥 Export</button>
              <button onClick={() => setIsVisible(false)}>✕</button>
            </div>
          </div>

          {lastUpdate && (
            <div className="last-update">
              Last updated: {lastUpdate}
            </div>
          )}

          {diagnostics && (
            <div className="diagnostics-section">
              <h4>📊 System Status</h4>
              <div className="status-grid">
                <div className="status-item">
                  <span>Backend:</span>
                  <span 
                    className="status-indicator"
                    style={{ backgroundColor: getStatusColor(diagnostics.backendHealth.status) }}
                  >
                    {diagnostics.backendHealth.status}
                  </span>
                </div>
                <div className="status-item">
                  <span>Storage:</span>
                  <span 
                    className="status-indicator"
                    style={{ backgroundColor: getStatusColor(diagnostics.localStorage.status) }}
                  >
                    {diagnostics.localStorage.status}
                  </span>
                </div>
                <div className="status-item">
                  <span>Network:</span>
                  <span 
                    className="status-indicator"
                    style={{ backgroundColor: getStatusColor(diagnostics.networkConnectivity.status) }}
                  >
                    {diagnostics.networkConnectivity.status}
                  </span>
                </div>
                <div className="status-item">
                  <span>Browser:</span>
                  <span 
                    className="status-indicator"
                    style={{ backgroundColor: getStatusColor(diagnostics.browserCompatibility.status) }}
                  >
                    {diagnostics.browserCompatibility.status}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="error-log-section">
            <h4>🚨 Error Log ({errorLog.length})</h4>
            {errorLog.length === 0 ? (
              <div className="no-errors">No errors logged</div>
            ) : (
              <div className="error-list">
                {errorLog.slice(-5).reverse().map((error, index) => (
                  <div key={error.id} className="error-item">
                    <div className="error-header">
                      <span className="error-type">{error.type}</span>
                      <span className="error-time">
                        {new Date(error.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="error-details">
                      {error.details.message || error.details.error || 'No message'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="quick-actions">
            <h4>⚡ Quick Actions</h4>
            <div className="action-buttons">
              <button onClick={() => window.location.reload()}>
                🔄 Reload Page
              </button>
              <button onClick={() => console.clear()}>
                🧹 Clear Console
              </button>
              <button onClick={() => localStorage.clear()}>
                🗑️ Clear Storage
              </button>
              <button onClick={() => {
                console.group('📋 Full Error Log');
                errorLog.forEach((entry, index) => {
                  console.group(`Error ${index + 1}: ${entry.type}`);
                  console.log('Timestamp:', entry.timestamp);
                  console.log('Details:', entry.details);
                  console.groupEnd();
                });
                console.groupEnd();
              }}>
                📋 Log to Console
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .debug-panel {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 9999;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .debug-toggle {
          background: #0366d6;
          color: white;
          padding: 8px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          font-size: 12px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          transition: background-color 0.2s;
        }

        .debug-toggle:hover {
          background: #0256cc;
        }

        .debug-content {
          position: absolute;
          bottom: 100%;
          right: 0;
          width: 400px;
          max-height: 500px;
          background: white;
          border: 1px solid #e1e5e9;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          margin-bottom: 10px;
          overflow: hidden;
        }

        .debug-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: #f6f8fa;
          border-bottom: 1px solid #e1e5e9;
        }

        .debug-header h3 {
          margin: 0;
          font-size: 14px;
          color: #24292e;
        }

        .debug-controls {
          display: flex;
          gap: 4px;
        }

        .debug-controls button {
          padding: 4px 8px;
          border: none;
          border-radius: 4px;
          background: #0366d6;
          color: white;
          cursor: pointer;
          font-size: 11px;
          transition: background-color 0.2s;
        }

        .debug-controls button:hover {
          background: #0256cc;
        }

        .debug-controls button:disabled {
          background: #6c757d;
          cursor: not-allowed;
        }

        .last-update {
          padding: 8px 16px;
          background: #f1f8ff;
          font-size: 11px;
          color: #586069;
        }

        .diagnostics-section,
        .error-log-section,
        .quick-actions {
          padding: 12px 16px;
          border-bottom: 1px solid #e1e5e9;
        }

        .diagnostics-section h4,
        .error-log-section h4,
        .quick-actions h4 {
          margin: 0 0 8px 0;
          font-size: 12px;
          color: #24292e;
        }

        .status-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        .status-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 11px;
        }

        .status-indicator {
          padding: 2px 6px;
          border-radius: 3px;
          color: white;
          font-size: 10px;
          font-weight: 600;
        }

        .error-list {
          max-height: 150px;
          overflow-y: auto;
        }

        .error-item {
          margin-bottom: 8px;
          padding: 8px;
          background: #f6f8fa;
          border-radius: 4px;
          border-left: 3px solid #dc3545;
        }

        .error-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
        }

        .error-type {
          font-weight: 600;
          font-size: 11px;
          color: #d73a49;
        }

        .error-time {
          font-size: 10px;
          color: #586069;
        }

        .error-details {
          font-size: 10px;
          color: #24292e;
          word-break: break-word;
        }

        .no-errors {
          text-align: center;
          color: #28a745;
          font-size: 11px;
          padding: 16px;
        }

        .action-buttons {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        .action-buttons button {
          padding: 6px 8px;
          border: none;
          border-radius: 4px;
          background: #f6f8fa;
          color: #24292e;
          cursor: pointer;
          font-size: 10px;
          transition: background-color 0.2s;
        }

        .action-buttons button:hover {
          background: #e1e5e9;
        }
      `}</style>
    </div>
  );
};

export default DebugPanel; 