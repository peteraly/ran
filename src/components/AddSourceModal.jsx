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
  
  // Email & Communication
  gmail: {
    name: 'Gmail',
    description: 'Access emails, attachments, and labels',
    icon: '📧',
    authType: 'oauth',
    scopes: ['https://www.googleapis.com/auth/gmail.readonly'],
    color: 'bg-red-500',
    category: 'email'
  },
  outlook: {
    name: 'Outlook',
    description: 'Access emails, calendar, and contacts',
    icon: '📨',
    authType: 'oauth',
    scopes: ['Mail.Read', 'Calendars.Read', 'Contacts.Read'],
    color: 'bg-blue-600',
    category: 'email'
  },
  imap: {
    name: 'IMAP Email',
    description: 'Connect to any IMAP email server',
    icon: '📬',
    authType: 'imap',
    scopes: [],
    color: 'bg-purple-500',
    category: 'email'
  },
  exchange: {
    name: 'Exchange Server',
    description: 'Connect to Microsoft Exchange server',
    icon: '🏢',
    authType: 'exchange',
    scopes: [],
    color: 'bg-blue-700',
    category: 'email'
  },
  
  // Messaging & Chat
  slack: {
    name: 'Slack',
    description: 'Access channels, messages, and files',
    icon: '💬',
    authType: 'oauth',
    scopes: ['channels:read', 'files:read', 'users:read', 'groups:read'],
    color: 'bg-purple-500',
    category: 'messaging'
  },
  teams: {
    name: 'Microsoft Teams',
    description: 'Access teams, channels, and messages',
    icon: '👥',
    authType: 'oauth',
    scopes: ['Channel.ReadBasic.All', 'Chat.Read', 'Files.Read'],
    color: 'bg-blue-500',
    category: 'messaging'
  },
  discord: {
    name: 'Discord',
    description: 'Access Discord servers and channels',
    icon: '🎮',
    authType: 'oauth',
    scopes: ['identify', 'guilds.read'],
    color: 'bg-indigo-500',
    category: 'messaging'
  },
  telegram: {
    name: 'Telegram',
    description: 'Access Telegram channels and messages',
    icon: '📱',
    authType: 'bot',
    scopes: [],
    color: 'bg-blue-400',
    category: 'messaging'
  },
  whatsapp: {
    name: 'WhatsApp Business',
    description: 'Access WhatsApp Business messages',
    icon: '📞',
    authType: 'api',
    scopes: [],
    color: 'bg-green-500',
    category: 'messaging'
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
  sqlserver: {
    name: 'SQL Server',
    description: 'Connect to Microsoft SQL Server',
    icon: '🗄️',
    authType: 'database',
    scopes: ['read', 'write'],
    color: 'bg-red-600',
    category: 'internal'
  },
  oracle: {
    name: 'Oracle Database',
    description: 'Connect to Oracle database',
    icon: '🏛️',
    authType: 'database',
    scopes: ['read', 'write'],
    color: 'bg-red-700',
    category: 'internal'
  },
  snowflake: {
    name: 'Snowflake',
    description: 'Connect to Snowflake data warehouse',
    icon: '❄️',
    authType: 'database',
    scopes: ['read', 'write'],
    color: 'bg-blue-400',
    category: 'internal'
  },
  bigquery: {
    name: 'BigQuery',
    description: 'Connect to Google BigQuery',
    icon: '📊',
    authType: 'oauth',
    scopes: ['https://www.googleapis.com/auth/bigquery.readonly'],
    color: 'bg-blue-500',
    category: 'internal'
  },
  
  // Enterprise Systems
  sharepoint: {
    name: 'SharePoint',
    description: 'Access SharePoint sites and documents',
    icon: '📋',
    authType: 'oauth',
    scopes: ['Sites.Read.All', 'Files.Read.All'],
    color: 'bg-blue-600',
    category: 'enterprise'
  },
  confluence: {
    name: 'Confluence',
    description: 'Access Confluence pages and spaces',
    icon: '📚',
    authType: 'oauth',
    scopes: ['read:confluence-content'],
    color: 'bg-blue-600',
    category: 'enterprise'
  },
  jira: {
    name: 'Jira',
    description: 'Access Jira projects and issues',
    icon: '🎫',
    authType: 'oauth',
    scopes: ['read:jira-work', 'read:jira-user'],
    color: 'bg-blue-500',
    category: 'enterprise'
  },
  servicenow: {
    name: 'ServiceNow',
    description: 'Access ServiceNow incidents and knowledge base',
    icon: '🛠️',
    authType: 'api',
    scopes: [],
    color: 'bg-orange-500',
    category: 'enterprise'
  },
  salesforce: {
    name: 'Salesforce',
    description: 'Access Salesforce CRM data',
    icon: '☁️',
    authType: 'oauth',
    scopes: ['api'],
    color: 'bg-blue-500',
    category: 'enterprise'
  },
  workday: {
    name: 'Workday',
    description: 'Access Workday HR and finance data',
    icon: '👥',
    authType: 'api',
    scopes: [],
    color: 'bg-orange-600',
    category: 'enterprise'
  },
  sap: {
    name: 'SAP',
    description: 'Connect to SAP ERP system',
    icon: '🏭',
    authType: 'api',
    scopes: [],
    color: 'bg-blue-700',
    category: 'enterprise'
  },
  
  // Cloud Storage & File Systems
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
  googledrive: {
    name: 'Google Drive',
    description: 'Access documents, spreadsheets, and presentations',
    icon: '📁',
    authType: 'oauth',
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    color: 'bg-blue-500',
    category: 'cloud'
  },
  
  // Productivity & Collaboration
  notion: {
    name: 'Notion',
    description: 'Access workspace pages and databases',
    icon: '📝',
    authType: 'oauth',
    scopes: ['read'],
    color: 'bg-gray-800',
    category: 'productivity'
  },
  github: {
    name: 'GitHub',
    description: 'Access repositories and issues',
    icon: '🐙',
    authType: 'oauth',
    scopes: ['repo', 'read:user'],
    color: 'bg-gray-900',
    category: 'productivity'
  },
  gitlab: {
    name: 'GitLab',
    description: 'Access GitLab projects and issues',
    icon: '🦊',
    authType: 'oauth',
    scopes: ['read_api'],
    color: 'bg-orange-500',
    category: 'productivity'
  },
  trello: {
    name: 'Trello',
    description: 'Access Trello boards and cards',
    icon: '📋',
    authType: 'oauth',
    scopes: ['read'],
    color: 'bg-blue-500',
    category: 'productivity'
  },
  asana: {
    name: 'Asana',
    description: 'Access Asana projects and tasks',
    icon: '📊',
    authType: 'oauth',
    scopes: ['default'],
    color: 'bg-orange-500',
    category: 'productivity'
  },
  monday: {
    name: 'Monday.com',
    description: 'Access Monday.com boards and items',
    icon: '📅',
    authType: 'oauth',
    scopes: ['boards:read'],
    color: 'bg-red-500',
    category: 'productivity'
  },
  clickup: {
    name: 'ClickUp',
    description: 'Access ClickUp spaces and tasks',
    icon: '🎯',
    authType: 'oauth',
    scopes: ['read'],
    color: 'bg-purple-500',
    category: 'productivity'
  },
  
  // Social Media & News
  linkedin: {
    name: 'LinkedIn',
    description: 'Access LinkedIn posts and company updates',
    icon: '💼',
    authType: 'oauth',
    scopes: ['r_liteprofile', 'r_emailaddress'],
    color: 'bg-blue-600',
    category: 'social'
  },
  twitter: {
    name: 'Twitter',
    description: 'Access Twitter posts and conversations',
    icon: '🐦',
    authType: 'oauth',
    scopes: ['tweet.read', 'users.read'],
    color: 'bg-blue-400',
    category: 'social'
  },
  reddit: {
    name: 'Reddit',
    description: 'Access Reddit posts and comments',
    icon: '🤖',
    authType: 'oauth',
    scopes: ['read'],
    color: 'bg-orange-500',
    category: 'social'
  },
  facebook: {
    name: 'Facebook',
    description: 'Access Facebook pages and posts',
    icon: '📘',
    authType: 'oauth',
    scopes: ['pages_read_engagement'],
    color: 'bg-blue-600',
    category: 'social'
  },
  
  // News & Research
  rss: {
    name: 'RSS Feeds',
    description: 'Subscribe to RSS feeds for updates',
    icon: '📡',
    authType: 'url',
    scopes: [],
    color: 'bg-orange-400',
    category: 'research'
  },
  newsapi: {
    name: 'News API',
    description: 'Access news articles and headlines',
    icon: '📰',
    authType: 'api',
    scopes: [],
    color: 'bg-red-500',
    category: 'research'
  },
  arxiv: {
    name: 'arXiv',
    description: 'Access academic papers and research',
    icon: '📚',
    authType: 'api',
    scopes: [],
    color: 'bg-green-600',
    category: 'research'
  },
  pubmed: {
    name: 'PubMed',
    description: 'Access medical and scientific literature',
    icon: '🏥',
    authType: 'api',
    scopes: [],
    color: 'bg-blue-600',
    category: 'research'
  },
  
  // Financial & Market Data
  bloomberg: {
    name: 'Bloomberg Terminal',
    description: 'Access Bloomberg market data and news',
    icon: '📈',
    authType: 'api',
    scopes: [],
    color: 'bg-orange-500',
    category: 'financial'
  },
  yahoo_finance: {
    name: 'Yahoo Finance',
    description: 'Access stock prices and financial data',
    icon: '💰',
    authType: 'api',
    scopes: [],
    color: 'bg-purple-500',
    category: 'financial'
  },
  alpha_vantage: {
    name: 'Alpha Vantage',
    description: 'Access real-time and historical market data',
    icon: '📊',
    authType: 'api',
    scopes: [],
    color: 'bg-blue-500',
    category: 'financial'
  },
  coinbase: {
    name: 'Coinbase',
    description: 'Access cryptocurrency data and prices',
    icon: '₿',
    authType: 'api',
    scopes: [],
    color: 'bg-blue-500',
    category: 'financial'
  },
  
  // External APIs & Web Services
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
  graphql: {
    name: 'GraphQL API',
    description: 'Connect to GraphQL API endpoints',
    icon: '🔗',
    authType: 'api',
    scopes: [],
    color: 'bg-pink-500',
    category: 'external'
  },
  soap: {
    name: 'SOAP API',
    description: 'Connect to SOAP web services',
    icon: '🧼',
    authType: 'api',
    scopes: [],
    color: 'bg-gray-500',
    category: 'external'
  },
  
  // Automation & Integration
  zapier: {
    name: 'Zapier',
    description: 'Connect to Zapier webhooks and triggers',
    icon: '⚡',
    authType: 'api',
    scopes: [],
    color: 'bg-orange-500',
    category: 'automation'
  },
  ifttt: {
    name: 'IFTTT',
    description: 'Connect to IFTTT applets and triggers',
    icon: '🔧',
    authType: 'api',
    scopes: [],
    color: 'bg-red-500',
    category: 'automation'
  },
  n8n: {
    name: 'n8n',
    description: 'Connect to n8n workflows and nodes',
    icon: '🔄',
    authType: 'api',
    scopes: [],
    color: 'bg-purple-500',
    category: 'automation'
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
  },
  
  // Custom & Advanced
  custom: {
    name: 'Custom Connector',
    description: 'Create a custom data source connector',
    icon: '⚙️',
    authType: 'custom',
    scopes: [],
    color: 'bg-gray-600',
    category: 'custom'
  },
  email_forward: {
    name: 'Email Forwarding',
    description: 'Forward emails to prompt@yourapp.ai for automatic indexing',
    icon: '📧',
    authType: 'email',
    scopes: [],
    color: 'bg-blue-500',
    category: 'automated'
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

  const renderSourceSelection = () => {
    const categories = {
      email: { name: 'Email & Communication', icon: '📧' },
      messaging: { name: 'Messaging & Chat', icon: '💬' },
      internal: { name: 'Internal Databases', icon: '🗄️' },
      enterprise: { name: 'Enterprise Systems', icon: '🏢' },
      cloud: { name: 'Cloud Storage', icon: '☁️' },
      productivity: { name: 'Productivity Tools', icon: '📊' },
      social: { name: 'Social Media', icon: '📱' },
      research: { name: 'Research & News', icon: '📰' },
      financial: { name: 'Financial Data', icon: '💰' },
      external: { name: 'External APIs', icon: '🔌' },
      automation: { name: 'Automation Tools', icon: '⚡' },
      web: { name: 'Web Sources', icon: '🌐' },
      local: { name: 'Local Files', icon: '💾' },
      custom: { name: 'Custom & Advanced', icon: '⚙️' },
      automated: { name: 'Automated Sources', icon: '🤖' }
    };

    const groupedSources = {};
    Object.entries(SOURCE_TYPES).forEach(([key, source]) => {
      if (!groupedSources[source.category]) {
        groupedSources[source.category] = [];
      }
      groupedSources[source.category].push({ key, ...source });
    });

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Connect Your Data Sources
          </h3>
          <p className="text-sm text-gray-600">
            Choose from 50+ data sources to aggregate and search across all your information
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
          {Object.entries(groupedSources).map(([category, sources]) => (
            <div key={category} className="space-y-3">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{categories[category]?.icon}</span>
                <h4 className="font-medium text-gray-900 text-sm">
                  {categories[category]?.name}
                </h4>
              </div>
              <div className="space-y-2">
                {sources.map((source) => (
                  <button
                    key={source.key}
                    onClick={() => handleSourceSelect(source.key)}
                    className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-lg ${source.color} flex items-center justify-center text-white text-sm font-medium`}>
                        {source.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 text-sm truncate">
                          {source.name}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {source.description}
                        </div>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Can't find what you're looking for? Use the "Custom Connector" to connect any data source.
          </p>
        </div>
      </div>
    );
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
            renderSourceSelection()
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