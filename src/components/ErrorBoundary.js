import React from 'react';
import errorMonitor from '../utils/errorMonitor';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      diagnostics: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Log error to our monitoring system
    errorMonitor.logError('React Component Error', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });

    // Run diagnostics
    this.runDiagnostics();
  }

  async runDiagnostics() {
    try {
      const diagnostics = await errorMonitor.runDiagnostics();
      this.setState({ diagnostics });
    } catch (error) {
      console.error('Failed to run diagnostics:', error);
    }
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      diagnostics: null 
    });
  };

  handleShowErrorLog = () => {
    const errorLog = errorMonitor.getErrorLog();
    console.group('📋 Error Log');
    errorLog.forEach((entry, index) => {
      console.group(`Error ${index + 1}: ${entry.type}`);
      console.log('Timestamp:', entry.timestamp);
      console.log('Details:', entry.details);
      console.groupEnd();
    });
    console.groupEnd();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-container">
            <div className="error-header">
              <h2>🚨 Something went wrong</h2>
              <p>We've encountered an error and are working to fix it.</p>
            </div>

            <div className="error-details">
              <h3>Error Details:</h3>
              <pre className="error-message">
                {this.state.error && this.state.error.toString()}
              </pre>
              
              {this.state.errorInfo && (
                <details>
                  <summary>Component Stack Trace</summary>
                  <pre className="error-stack">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>

            {this.state.diagnostics && (
              <div className="diagnostics">
                <h3>🔍 System Diagnostics:</h3>
                <div className="diagnostic-grid">
                  <div className="diagnostic-item">
                    <strong>Backend Health:</strong>
                    <span className={`status ${this.state.diagnostics.backendHealth.status}`}>
                      {this.state.diagnostics.backendHealth.status}
                    </span>
                  </div>
                  <div className="diagnostic-item">
                    <strong>Local Storage:</strong>
                    <span className={`status ${this.state.diagnostics.localStorage.status}`}>
                      {this.state.diagnostics.localStorage.status}
                    </span>
                  </div>
                  <div className="diagnostic-item">
                    <strong>Network:</strong>
                    <span className={`status ${this.state.diagnostics.networkConnectivity.status}`}>
                      {this.state.diagnostics.networkConnectivity.status}
                    </span>
                  </div>
                  <div className="diagnostic-item">
                    <strong>Browser:</strong>
                    <span className={`status ${this.state.diagnostics.browserCompatibility.status}`}>
                      {this.state.diagnostics.browserCompatibility.status}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="error-actions">
              <button onClick={this.handleRetry} className="retry-button">
                🔄 Try Again
              </button>
              <button onClick={this.handleShowErrorLog} className="log-button">
                📋 Show Error Log
              </button>
              <button onClick={() => window.location.reload()} className="reload-button">
                🔄 Reload Page
              </button>
            </div>

            <div className="error-help">
              <h3>💡 Quick Fixes:</h3>
              <ul>
                <li>Check if the backend server is running</li>
                <li>Clear browser cache and reload</li>
                <li>Check browser console for more details</li>
                <li>Try a different browser</li>
              </ul>
            </div>
          </div>

          <style jsx>{`
            .error-boundary {
              padding: 20px;
              max-width: 800px;
              margin: 0 auto;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            
            .error-container {
              background: #fff;
              border: 1px solid #e1e5e9;
              border-radius: 8px;
              padding: 24px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            
            .error-header h2 {
              color: #d73a49;
              margin: 0 0 8px 0;
            }
            
            .error-header p {
              color: #586069;
              margin: 0 0 20px 0;
            }
            
            .error-details {
              margin: 20px 0;
            }
            
            .error-details h3 {
              color: #24292e;
              margin: 0 0 12px 0;
            }
            
            .error-message, .error-stack {
              background: #f6f8fa;
              border: 1px solid #e1e4e8;
              border-radius: 6px;
              padding: 12px;
              font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
              font-size: 12px;
              overflow-x: auto;
              white-space: pre-wrap;
              word-break: break-word;
            }
            
            .diagnostics {
              margin: 20px 0;
            }
            
            .diagnostic-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 12px;
              margin: 12px 0;
            }
            
            .diagnostic-item {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 8px 12px;
              background: #f6f8fa;
              border-radius: 6px;
            }
            
            .status {
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 12px;
              font-weight: 600;
            }
            
            .status.healthy, .status.working, .status.connected, .status.compatible {
              background: #28a745;
              color: white;
            }
            
            .status.unhealthy, .status.error, .status.disconnected, .status.incompatible {
              background: #dc3545;
              color: white;
            }
            
            .error-actions {
              display: flex;
              gap: 12px;
              margin: 20px 0;
              flex-wrap: wrap;
            }
            
            .retry-button, .log-button, .reload-button {
              padding: 8px 16px;
              border: none;
              border-radius: 6px;
              cursor: pointer;
              font-weight: 600;
              transition: background-color 0.2s;
            }
            
            .retry-button {
              background: #0366d6;
              color: white;
            }
            
            .retry-button:hover {
              background: #0256cc;
            }
            
            .log-button {
              background: #6f42c1;
              color: white;
            }
            
            .log-button:hover {
              background: #5a32a3;
            }
            
            .reload-button {
              background: #28a745;
              color: white;
            }
            
            .reload-button:hover {
              background: #22863a;
            }
            
            .error-help {
              margin: 20px 0 0 0;
              padding: 16px;
              background: #f1f8ff;
              border: 1px solid #c8e1ff;
              border-radius: 6px;
            }
            
            .error-help h3 {
              color: #0366d6;
              margin: 0 0 12px 0;
            }
            
            .error-help ul {
              margin: 0;
              padding-left: 20px;
            }
            
            .error-help li {
              margin: 4px 0;
              color: #586069;
            }
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 