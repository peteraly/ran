// Error Monitoring and Debugging System
class ErrorMonitor {
  constructor() {
    this.errorLog = [];
    this.maxLogSize = 100;
    this.isProduction = process.env.NODE_ENV === 'production';
    this.initializeErrorHandling();
  }

  initializeErrorHandling() {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.logError('Global Error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error?.stack
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.logError('Unhandled Promise Rejection', {
        reason: event.reason,
        promise: event.promise
      });
    });

    // React error boundary fallback
    if (window.React) {
      // This will be used by ErrorBoundary component
      window.errorMonitor = this;
    }
  }

  logError(type, details) {
    const errorEntry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      type,
      details,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    this.errorLog.push(errorEntry);
    
    // Keep log size manageable
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog.shift();
    }

    // Console output for development
    if (!this.isProduction) {
      console.group(`🚨 ${type}`);
      console.error('Details:', details);
      console.log('Suggested Fix:', this.getSuggestedFix(type, details));
      console.groupEnd();
    }

    // Send to backend in production
    if (this.isProduction) {
      this.sendErrorToBackend(errorEntry);
    }
  }

  getSuggestedFix(type, details) {
    const fixes = {
      'Failed to retrieve chunks': {
        cause: 'Backend retrieve endpoint not returning expected format',
        solution: 'Check backend retrieve endpoint response structure',
        action: 'Verify /api/retrieve returns chunks array directly'
      },
      'Cannot read properties of undefined': {
        cause: 'Object property access on undefined/null value',
        solution: 'Add null checks before accessing properties',
        action: 'Use optional chaining (?.) or null checks'
      },
      'EADDRINUSE': {
        cause: 'Port 3001 already in use by another process',
        solution: 'Kill existing process or use different port',
        action: 'Run: pkill -f "node server.js" && sleep 2 && npm start'
      },
      'PineconeBadRequestError': {
        cause: 'Non-ASCII characters in vector IDs',
        solution: 'Filename sanitization not applied correctly',
        action: 'Check filename sanitization in backend'
      },
      'Network Error': {
        cause: 'Backend server not responding',
        solution: 'Check if backend is running and accessible',
        action: 'Verify backend URL and server status'
      }
    };

    return fixes[type] || {
      cause: 'Unknown error type',
      solution: 'Check console for more details',
      action: 'Review error logs and implement appropriate handling'
    };
  }

  async sendErrorToBackend(errorEntry) {
    try {
      const response = await fetch('/api/log-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorEntry)
      });
      
      if (!response.ok) {
        console.warn('Failed to send error to backend');
      }
    } catch (error) {
      console.warn('Error sending error to backend:', error);
    }
  }

  getErrorLog() {
    return this.errorLog;
  }

  clearErrorLog() {
    this.errorLog = [];
  }

  // Health check for backend connectivity
  async checkBackendHealth() {
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      return {
        status: 'healthy',
        data
      };
    } catch (error) {
      this.logError('Backend Health Check Failed', {
        error: error.message,
        url: '/api/health'
      });
      return {
        status: 'unhealthy',
        error: error.message
      };
    }
  }

  // Check for common issues
  async runDiagnostics() {
    const diagnostics = {
      backendHealth: await this.checkBackendHealth(),
      localStorage: this.checkLocalStorage(),
      networkConnectivity: await this.checkNetworkConnectivity(),
      browserCompatibility: this.checkBrowserCompatibility()
    };

    return diagnostics;
  }

  checkLocalStorage() {
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      return { status: 'working' };
    } catch (error) {
      return { status: 'error', error: error.message };
    }
  }

  async checkNetworkConnectivity() {
    try {
      const response = await fetch('https://httpbin.org/get', { 
        method: 'GET',
        mode: 'cors'
      });
      return { status: 'connected' };
    } catch (error) {
      return { status: 'disconnected', error: error.message };
    }
  }

  checkBrowserCompatibility() {
    const issues = [];
    
    if (!window.fetch) {
      issues.push('Fetch API not supported');
    }
    
    if (!window.localStorage) {
      issues.push('LocalStorage not supported');
    }

    return {
      status: issues.length === 0 ? 'compatible' : 'incompatible',
      issues
    };
  }
}

// Create global instance
const errorMonitor = new ErrorMonitor();

export default errorMonitor; 