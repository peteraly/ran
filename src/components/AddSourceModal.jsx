import React, { useState } from 'react';
import { X, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { testDatabaseConnection, testApiConnection } from '../services/connections';

const SOURCE_TYPES = {
  // Local & File Sources
  local: {
    name: 'Local Files',
    description: 'Upload files from your computer',
    icon: '💾',
    authType: 'file',
    scopes: [],
    color: 'bg-green-500',
    category: 'local'
  },
  
  // Internal Databases
  postgres: {
    name: 'PostgreSQL',
    description: 'Connect to internal PostgreSQL database',
    icon: '🐘',
    authType: 'database',
    scopes: ['read', 'write'],
    color: 'bg-blue-600',
    category: 'internal'
  },
  mysql: {
    name: 'MySQL',
    description: 'Connect to internal MySQL database',
    icon: '🐬',
    authType: 'database',
    scopes: ['read', 'write'],
    color: 'bg-orange-500',
    category: 'internal'
  },
  mongodb: {
    name: 'MongoDB',
    description: 'Connect to internal MongoDB database',
    icon: '🍃',
    authType: 'database',
    scopes: ['read', 'write'],
    color: 'bg-green-600',
    category: 'internal'
  },
  redis: {
    name: 'Redis',
    description: 'Connect to Redis cache/database',
    icon: '🔴',
    authType: 'database',
    scopes: ['read', 'write'],
    color: 'bg-red-500',
    category: 'internal'
  },
  elasticsearch: {
    name: 'Elasticsearch',
    description: 'Connect to Elasticsearch cluster',
    icon: '🔍',
    authType: 'database',
    scopes: ['read', 'write'],
    color: 'bg-yellow-600',
    category: 'internal'
  },
  
  // External Databases & APIs
  api: {
    name: 'REST API',
    description: 'Connect to external REST API endpoints',
    icon: '🔌',
    authType: 'api',
    scopes: [],
    color: 'bg-purple-500',
    category: 'external'
  },
  webhook: {
    name: 'Webhook',
    description: 'Set up webhook for real-time data',
    icon: '🪝',
    authType: 'webhook',
    scopes: [],
    color: 'bg-indigo-500',
    category: 'external'
  },
  rss: {
    name: 'RSS Feed',
    description: 'Subscribe to RSS feeds for updates',
    icon: '📡',
    authType: 'url',
    scopes: [],
    color: 'bg-orange-400',
    category: 'external'
  },
  
  // Cloud Storage
  s3: {
    name: 'AWS S3',
    description: 'Access files stored in Amazon S3',
    icon: '☁️',
    authType: 'oauth',
    scopes: ['s3:GetObject', 's3:ListBucket'],
    color: 'bg-orange-600',
    category: 'cloud'
  },
  dropbox: {
    name: 'Dropbox',
    description: 'Access files in Dropbox',
    icon: '📦',
    authType: 'oauth',
    scopes: ['files.content.read'],
    color: 'bg-blue-500',
    category: 'cloud'
  },
  box: {
    name: 'Box',
    description: 'Access files in Box',
    icon: '📋',
    authType: 'oauth',
    scopes: ['read_all_files'],
    color: 'bg-blue-600',
    category: 'cloud'
  },
  onedrive: {
    name: 'OneDrive',
    description: 'Access files in Microsoft OneDrive',
    icon: '📁',
    authType: 'oauth',
    scopes: ['Files.Read'],
    color: 'bg-blue-700',
    category: 'cloud'
  },
  
  // Productivity Apps
  slack: {
    name: 'Slack',
    description: 'Connect to Slack workspaces to access messages and files',
    icon: '💬',
    authType: 'oauth',
    scopes: ['channels:read', 'files:read', 'users:read'],
    color: 'bg-purple-500',
    category: 'apps'
  },
  notion: {
    name: 'Notion',
    description: 'Access workspace pages and databases',
    icon: '📝',
    authType: 'oauth',
    scopes: ['read'],
    color: 'bg-gray-800',
    category: 'apps'
  },
  jira: {
    name: 'Jira',
    description: 'Access Jira projects and issues',
    icon: '🎫',
    authType: 'oauth',
    scopes: ['read:jira-work', 'read:jira-user'],
    color: 'bg-blue-500',
    category: 'apps'
  },
  confluence: {
    name: 'Confluence',
    description: 'Access Confluence pages and spaces',
    icon: '📚',
    authType: 'oauth',
    scopes: ['read:confluence-content'],
    color: 'bg-blue-600',
    category: 'apps'
  },
  github: {
    name: 'GitHub',
    description: 'Access repositories and issues',
    icon: '🐙',
    authType: 'oauth',
    scopes: ['repo', 'read:user'],
    color: 'bg-gray-900',
    category: 'apps'
  },
  gitlab: {
    name: 'GitLab',
    description: 'Access GitLab projects and issues',
    icon: '🦊',
    authType: 'oauth',
    scopes: ['read_api'],
    color: 'bg-orange-500',
    category: 'apps'
  },
  trello: {
    name: 'Trello',
    description: 'Access Trello boards and cards',
    icon: '📋',
    authType: 'oauth',
    scopes: ['read'],
    color: 'bg-blue-500',
    category: 'apps'
  },
  asana: {
    name: 'Asana',
    description: 'Access Asana projects and tasks',
    icon: '📊',
    authType: 'oauth',
    scopes: ['default'],
    color: 'bg-orange-500',
    category: 'apps'
  },
  
  // Communication & Email
  google: {
    name: 'Google Drive',
    description: 'Access documents, spreadsheets, and presentations',
    icon: '📁',
    authType: 'oauth',
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    color: 'bg-blue-500',
    category: 'apps'
  },
  microsoft: {
    name: 'Microsoft 365',
    description: 'Read emails, calendar, and OneDrive files',
    icon: '📧',
    authType: 'oauth',
    scopes: ['Mail.Read', 'Files.Read', 'Calendars.Read'],
    color: 'bg-orange-500',
    category: 'apps'
  },
  
  // Automation & Integration
  zapier: {
    name: 'Zapier',
    description: 'Connect to Zapier webhooks and triggers',
    icon: '⚡',
    authType: 'api',
    scopes: [],
    color: 'bg-orange-500',
    category: 'tools'
  },
  
  // Web Sources
  web: {
    name: 'Web Sources',
    description: 'Add websites, RSS feeds, or API endpoints',
    icon: '🌐',
    authType: 'url',
    scopes: [],
    color: 'bg-indigo-500',
    category: 'web'
  }
};

export default function AddSourceModal({ onClose, onAdd }) {
  const [selectedType, setSelectedType] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [webUrl, setWebUrl] = useState('');
  const [dbConfig, setDbConfig] = useState({
    host: '',
    port: '',
    database: '',
    username: '',
    password: ''
  });
  const [apiConfig, setApiConfig] = useState({
    baseUrl: '',
    apiKey: '',
    headers: ''
  });

  const handleSourceSelect = (type) => {
    setSelectedType(type);
    setConnectionStatus(null);
  };

  const handleOAuthConnect = async (type) => {
    setIsConnecting(true);
    setConnectionStatus({ type: 'connecting', message: 'Connecting...' });
    
    try {
      // TODO: Implement real OAuth flow
      // For now, simulate the connection process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setConnectionStatus({ 
        type: 'success', 
        message: `${SOURCE_TYPES[type].name} connected successfully!` 
      });
      
      // Add the connected source
      setTimeout(() => {
        onAdd(type);
        onClose();
      }, 1000);
      
    } catch (error) {
      setConnectionStatus({ 
        type: 'error', 
        message: 'Connection failed. Please try again.' 
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDatabaseConnect = async (type) => {
    setIsConnecting(true);
    setConnectionStatus({ type: 'connecting', message: 'Testing connection...' });
    
    try {
      const result = await testDatabaseConnection(type, dbConfig);
      
      if (result.success) {
        setConnectionStatus({ 
          type: 'success', 
          message: `${SOURCE_TYPES[type].name} connected successfully!` 
        });
        
        // Add the connected source
        setTimeout(() => {
          onAdd(type, { config: dbConfig });
          onClose();
        }, 1000);
      } else {
        setConnectionStatus({ 
          type: 'error', 
          message: result.error || 'Connection failed. Please check your credentials.' 
        });
      }
      
    } catch (error) {
      setConnectionStatus({ 
        type: 'error', 
        message: 'Connection failed. Please check your credentials.' 
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleApiConnect = async (type) => {
    setIsConnecting(true);
    setConnectionStatus({ type: 'connecting', message: 'Testing API connection...' });
    
    try {
      const result = await testApiConnection(type, apiConfig);
      
      if (result.success) {
        setConnectionStatus({ 
          type: 'success', 
          message: `${SOURCE_TYPES[type].name} connected successfully!` 
        });
        
        // Add the connected source
        setTimeout(() => {
          onAdd(type, { config: apiConfig });
          onClose();
        }, 1000);
      } else {
        setConnectionStatus({ 
          type: 'error', 
          message: result.error || 'Connection failed. Please check your API configuration.' 
        });
      }
      
    } catch (error) {
      setConnectionStatus({ 
        type: 'error', 
        message: 'Connection failed. Please check your API configuration.' 
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const handleWebSourceAdd = () => {
    if (webUrl.trim()) {
      onAdd('web', { url: webUrl });
      onClose();
    }
  };

  const handleLocalFilesAdd = () => {
    if (uploadedFiles.length > 0) {
      onAdd('local', { files: uploadedFiles });
      onClose();
    }
  };

  const renderConnectionStep = () => {
    if (!selectedType) return null;

    const source = SOURCE_TYPES[selectedType];

    if (source.authType === 'oauth') {
      return (
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Permissions Required</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              {source.scopes.map(scope => (
                <li key={scope} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  {scope}
                </li>
              ))}
            </ul>
          </div>
          
          {connectionStatus && (
            <div className={`p-3 rounded-lg ${
              connectionStatus.type === 'success' ? 'bg-green-50 text-green-700' :
              connectionStatus.type === 'error' ? 'bg-red-50 text-red-700' :
              'bg-blue-50 text-blue-700'
            }`}>
              <div className="flex items-center gap-2">
                {connectionStatus.type === 'success' ? (
                  <CheckCircle className="h-5 w-5" />
                ) : connectionStatus.type === 'error' ? (
                  <AlertCircle className="h-5 w-5" />
                ) : (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                )}
                {connectionStatus.message}
              </div>
            </div>
          )}

          <button
            onClick={() => handleOAuthConnect(selectedType)}
            disabled={isConnecting}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isConnecting ? 'Connecting...' : `Connect to ${source.name}`}
          </button>
        </div>
      );
    }

    if (source.authType === 'database') {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Host</label>
              <input
                type="text"
                value={dbConfig.host}
                onChange={(e) => setDbConfig(prev => ({ ...prev, host: e.target.value }))}
                placeholder="localhost"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Port</label>
              <input
                type="number"
                value={dbConfig.port}
                onChange={(e) => setDbConfig(prev => ({ ...prev, port: e.target.value }))}
                placeholder={selectedType === 'postgres' ? '5432' : selectedType === 'mysql' ? '3306' : '27017'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Database Name</label>
            <input
              type="text"
              value={dbConfig.database}
              onChange={(e) => setDbConfig(prev => ({ ...prev, database: e.target.value }))}
              placeholder="Enter database name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                value={dbConfig.username}
                onChange={(e) => setDbConfig(prev => ({ ...prev, username: e.target.value }))}
                placeholder="Enter username"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={dbConfig.password}
                onChange={(e) => setDbConfig(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Enter password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {connectionStatus && (
            <div className={`p-3 rounded-lg ${
              connectionStatus.type === 'success' ? 'bg-green-50 text-green-700' :
              connectionStatus.type === 'error' ? 'bg-red-50 text-red-700' :
              'bg-blue-50 text-blue-700'
            }`}>
              <div className="flex items-center gap-2">
                {connectionStatus.type === 'success' ? (
                  <CheckCircle className="h-5 w-5" />
                ) : connectionStatus.type === 'error' ? (
                  <AlertCircle className="h-5 w-5" />
                ) : (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                )}
                {connectionStatus.message}
              </div>
            </div>
          )}

          <button
            onClick={() => handleDatabaseConnect(selectedType)}
            disabled={isConnecting || !dbConfig.host || !dbConfig.database || !dbConfig.username}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isConnecting ? 'Testing Connection...' : `Connect to ${source.name}`}
          </button>
        </div>
      );
    }

    if (source.authType === 'api') {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Base URL</label>
            <input
              type="url"
              value={apiConfig.baseUrl}
              onChange={(e) => setApiConfig(prev => ({ ...prev, baseUrl: e.target.value }))}
              placeholder="https://api.example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
            <input
              type="password"
              value={apiConfig.apiKey}
              onChange={(e) => setApiConfig(prev => ({ ...prev, apiKey: e.target.value }))}
              placeholder="Enter API key"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Additional Headers (JSON)</label>
            <textarea
              value={apiConfig.headers}
              onChange={(e) => setApiConfig(prev => ({ ...prev, headers: e.target.value }))}
              placeholder='{"Content-Type": "application/json"}'
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {connectionStatus && (
            <div className={`p-3 rounded-lg ${
              connectionStatus.type === 'success' ? 'bg-green-50 text-green-700' :
              connectionStatus.type === 'error' ? 'bg-red-50 text-red-700' :
              'bg-blue-50 text-blue-700'
            }`}>
              <div className="flex items-center gap-2">
                {connectionStatus.type === 'success' ? (
                  <CheckCircle className="h-5 w-5" />
                ) : connectionStatus.type === 'error' ? (
                  <AlertCircle className="h-5 w-5" />
                ) : (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                )}
                {connectionStatus.message}
              </div>
            </div>
          )}

          <button
            onClick={() => handleApiConnect(selectedType)}
            disabled={isConnecting || !apiConfig.baseUrl}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isConnecting ? 'Testing Connection...' : `Connect to ${source.name}`}
          </button>
        </div>
      );
    }

    if (source.authType === 'file') {
      return (
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
              accept=".pdf,.docx,.txt,.md,.csv,.json,.eml"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <span className="text-blue-600 hover:text-blue-700 font-medium">
                Choose files
              </span>
              <span className="text-gray-500"> or drag and drop</span>
            </label>
            <p className="text-sm text-gray-500 mt-2">
              PDF, Word, Text, Markdown, CSV, JSON, Email files
            </p>
          </div>

          {uploadedFiles.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Selected Files:</h4>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    {file.name} ({(file.size / 1024).toFixed(1)} KB)
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleLocalFilesAdd}
            disabled={uploadedFiles.length === 0}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Add {uploadedFiles.length} File{uploadedFiles.length !== 1 ? 's' : ''}
          </button>
        </div>
      );
    }

    if (source.authType === 'url') {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Website URL or RSS Feed
            </label>
            <input
              type="url"
              value={webUrl}
              onChange={(e) => setWebUrl(e.target.value)}
              placeholder="https://example.com or https://example.com/feed.xml"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={handleWebSourceAdd}
            disabled={!webUrl.trim()}
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Add Web Source
          </button>
        </div>
      );
    }
  };

  // Group sources by category
  const groupedSources = Object.entries(SOURCE_TYPES).reduce((acc, [key, source]) => {
    if (!acc[source.category]) {
      acc[source.category] = [];
    }
    acc[source.category].push({ key, ...source });
    return acc;
  }, {});

  const categoryNames = {
    local: 'Local & Files',
    internal: 'Internal Databases',
    external: 'External APIs',
    cloud: 'Cloud Storage',
    apps: 'Productivity Apps',
    tools: 'Automation Tools',
    web: 'Web Sources'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Add Data Source</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          {!selectedType ? (
            <div className="space-y-10">
              {Object.entries(groupedSources).map(([category, sources]) => (
                <section key={category} className="mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 pl-1">{categoryNames[category]}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {sources.map((source) => (
                      <button
                        key={source.key}
                        onClick={() => handleSourceSelect(source.key)}
                        className="p-5 bg-white border border-gray-200 rounded-xl shadow hover:border-blue-400 hover:bg-blue-50 transition text-left flex flex-col gap-2"
                      >
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-2xl">{source.icon}</span>
                          <span className="font-medium text-gray-900">{source.name}</span>
                        </div>
                        <p className="text-sm text-gray-600">{source.description}</p>
                      </button>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <button
                onClick={() => setSelectedType(null)}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                ← Back to source selection
              </button>
              
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <span className="text-2xl">{SOURCE_TYPES[selectedType].icon}</span>
                <div>
                  <h3 className="font-medium text-gray-900">{SOURCE_TYPES[selectedType].name}</h3>
                  <p className="text-sm text-gray-600">{SOURCE_TYPES[selectedType].description}</p>
                </div>
              </div>

              {renderConnectionStep()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 