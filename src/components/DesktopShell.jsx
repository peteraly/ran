import React, { useState, useEffect } from 'react';
import { Terminal, Settings, Mail, Database, Slack as SlackIcon, Book, Globe2, Command, Activity, TestTube } from 'lucide-react';
import PromptDashboardApp from './PromptDashboardApp';
import AddSourceModal from './AddSourceModal';
import SourceManager from './SourceManager';
import SourceActivityDashboard from './SourceActivityDashboard';
import RagTestPanel from './RagTestPanel';
import { initiateOAuth, processUploadedFiles, processWebContent, indexContent } from '../services/connections';

// Start with only essential tabs - no demo data
const BASE_APPS = [
  { key: 'dashboard', name: 'Prompt Dashboard', icon: <Terminal className="h-5 w-5" />, shortcut: '⌘+1' },
  { key: 'sources', name: 'Data Sources', icon: <Settings className="h-5 w-5" />, shortcut: '⌘+2' },
  { key: 'activity', name: 'Source Activity', icon: <Activity className="h-5 w-5" />, shortcut: '⌘+3' },
  { key: 'test', name: 'RAG Test', icon: <TestTube className="h-5 w-5" />, shortcut: '⌘+4' },
];

const DEMO_SOURCE_ICONS = {
  slack: <SlackIcon className="h-5 w-5" />,
  notion: <Book className="h-5 w-5" />,
  web: <Globe2 className="h-5 w-5" />,
  email: <Mail className="h-5 w-5" />,
  internaldb: <Database className="h-5 w-5" />,
  google: <Globe2 className="h-5 w-5" />,
  microsoft: <Mail className="h-5 w-5" />,
  local: <Book className="h-5 w-5" />,
  postgres: <Database className="h-5 w-5" />,
  mysql: <Database className="h-5 w-5" />,
  mongodb: <Database className="h-5 w-5" />,
  redis: <Database className="h-5 w-5" />,
  elasticsearch: <Database className="h-5 w-5" />,
  jira: <Book className="h-5 w-5" />,
  confluence: <Book className="h-5 w-5" />,
  github: <Book className="h-5 w-5" />,
  gitlab: <Book className="h-5 w-5" />,
  trello: <Book className="h-5 w-5" />,
  asana: <Book className="h-5 w-5" />,
  zapier: <Globe2 className="h-5 w-5" />,
  webhook: <Globe2 className="h-5 w-5" />,
  api: <Globe2 className="h-5 w-5" />,
  rss: <Globe2 className="h-5 w-5" />,
  s3: <Database className="h-5 w-5" />,
  dropbox: <Database className="h-5 w-5" />,
  box: <Database className="h-5 w-5" />,
  onedrive: <Database className="h-5 w-5" />,
};

export default function DesktopShell() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddSource, setShowAddSource] = useState(false);
  const [extraTabs, setExtraTabs] = useState([]); // { key, name, icon, panel }
  const [connectionStatus, setConnectionStatus] = useState({});
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // ⌘+K to show add source modal
      if (e.metaKey && e.key === 'k') {
        e.preventDefault();
        setShowAddSource(true);
      }
      // ⌘+1 for dashboard
      if (e.metaKey && e.key === '1') {
        e.preventDefault();
        setActiveTab('dashboard');
      }
      // ⌘+2 for sources
      if (e.metaKey && e.key === '2') {
        e.preventDefault();
        setActiveTab('sources');
      }
      // ⌘+/ to show keyboard shortcuts
      if (e.metaKey && e.key === '/') {
        e.preventDefault();
        setShowKeyboardShortcuts(!showKeyboardShortcuts);
      }
      // Escape to close modals
      if (e.key === 'Escape') {
        setShowAddSource(false);
        setShowKeyboardShortcuts(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showKeyboardShortcuts]);

  const handleAddSource = async (type, metadata = {}) => {
    try {
      setConnectionStatus({ type: 'connecting', message: 'Processing...' });

      let processedContent = null;
      let sourceName = type.charAt(0).toUpperCase() + type.slice(1);

      // Handle different source types
      if (type === 'local' && metadata.files) {
        // Process uploaded files
        processedContent = await processUploadedFiles(metadata.files);
        sourceName = `Local Files (${processedContent.length})`;
        
        // Backend automatically indexes content during upload
      } else if (type === 'web' && metadata.url) {
        // Process web content
        processedContent = await processWebContent(metadata.url);
        sourceName = `Web: ${new URL(metadata.url).hostname}`;
        
        // Index the content
        await indexContent(processedContent.content, {
          source: 'web',
          url: metadata.url,
          title: processedContent.title,
          processedAt: processedContent.processedAt
        });
      } else if (['slack', 'google', 'microsoft', 'notion'].includes(type)) {
        // Handle OAuth connections
        initiateOAuth(type);
        return; // Don't add tab yet, wait for OAuth callback
      }

      // Add the new source as a tab
      const key = `${type}-${Date.now()}`;
      let icon = DEMO_SOURCE_ICONS[type] || <Book className="h-5 w-5" />;
      let panel = null;

      if (type === 'local') {
        panel = (
          <div className="p-8">
            <h3 className="text-lg font-semibold mb-4">Uploaded Files</h3>
            <div className="space-y-3">
              {processedContent?.map((file, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium">{file.name}</div>
                  <div className="text-sm text-gray-600">
                    {(file.size / 1024).toFixed(1)} KB • {Array.isArray(file.content) ? file.content.length : 1} chunks indexed
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      } else if (type === 'web') {
        panel = (
          <div className="p-8">
            <h3 className="text-lg font-semibold mb-4">Web Content</h3>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="font-medium">{processedContent?.title}</div>
              <div className="text-sm text-gray-600 mb-2">{metadata.url}</div>
              <div className="text-sm text-gray-500">
                Content indexed and ready for search
              </div>
            </div>
          </div>
        );
      } else {
        panel = <div className="p-8 text-center text-gray-500">Integration coming soon! (Real connection mode)</div>;
      }

      setExtraTabs(prev => [...prev, { key, name: sourceName, icon, panel }]);
      setActiveTab(key);
      setConnectionStatus({ type: 'success', message: 'Source added successfully!' });

    } catch (error) {
      console.error('Error adding source:', error);
      setConnectionStatus({ type: 'error', message: `Failed to add source: ${error.message}` });
    }
  };

  const allTabs = [...BASE_APPS, ...extraTabs];

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-100 via-white to-purple-100 flex flex-col">
      {/* Tab bar */}
      <div className="flex gap-2 px-8 pt-8 pb-3 bg-white/80 border-b border-gray-200 shadow-sm z-10 rounded-t-3xl max-w-4xl mx-auto mt-8 items-center">
        {allTabs.map(app => (
          <button
            key={app.key}
            className={`group flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-base transition-all duration-200 relative
              ${activeTab === app.key
                ? 'bg-white shadow-lg text-blue-700 border border-blue-200 transform scale-105'
                : 'bg-transparent text-gray-500 hover:text-blue-600 hover:bg-blue-50/80 border border-transparent hover:border-blue-200/50 hover:shadow-md'}
            `}
            style={{ minWidth: 0 }}
            onClick={() => setActiveTab(app.key)}
          >
            <div className={`transition-transform duration-200 ${activeTab === app.key ? 'scale-110' : 'group-hover:scale-105'}`}>
              {app.icon}
            </div>
            <span className="truncate">{app.name}</span>
            {app.shortcut && (
              <span className={`text-xs opacity-0 group-hover:opacity-60 transition-opacity duration-200 ml-1 ${
                activeTab === app.key ? 'opacity-60' : ''
              }`}>
                {app.shortcut}
              </span>
            )}
          </button>
        ))}
        <button
          className="ml-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          onClick={() => setShowAddSource(true)}
        >
          <Command className="h-4 w-4" />
          + Add Source
          <span className="text-xs opacity-80">⌘+K</span>
        </button>
      </div>

      {/* Connection Status */}
      {connectionStatus.message && (
        <div className={`max-w-4xl mx-auto mt-4 px-4 ${
          connectionStatus.type === 'success' ? 'text-green-700' :
          connectionStatus.type === 'error' ? 'text-red-700' :
          'text-blue-700'
        }`}>
          <div className="bg-white/90 rounded-lg p-3 text-sm shadow-sm border">
            {connectionStatus.message}
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Overlay */}
      {showKeyboardShortcuts && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Keyboard Shortcuts</h3>
              <button 
                onClick={() => setShowKeyboardShortcuts(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span>Add Source</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">⌘+K</kbd>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span>Prompt Dashboard</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">⌘+1</kbd>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span>Data Sources</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">⌘+2</kbd>
              </div>
              <div className="flex justify-between items-center py-2">
                <span>Show Shortcuts</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">⌘+/</kbd>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main dashboard area */}
      <div className="flex-1 flex flex-col items-center justify-start px-4 py-10 bg-gradient-to-br from-white/80 to-blue-50">
        <div className="w-full max-w-4xl mx-auto p-6 space-y-8">
          {/* Apple-style section divider */}
          <div className="flex items-center justify-center space-x-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            <h1 className="text-2xl font-semibold text-gray-800 tracking-tight">
              {activeTab === 'dashboard' ? 'Prompt Dashboard' : 
               activeTab === 'sources' ? 'Data Sources' : 
               activeTab === 'activity' ? 'Source Activity' :
               activeTab === 'test' ? 'RAG Test' :
               extraTabs.find(tab => tab.key === activeTab)?.name || 'Application'}
            </h1>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
          </div>
          
          <div className="bg-white/95 rounded-3xl border border-gray-200 shadow-2xl p-0 overflow-hidden min-h-[540px] flex flex-col backdrop-blur-sm">
            <div className="flex-1 flex flex-col">
              {activeTab === 'dashboard' && <PromptDashboardApp />}
              {activeTab === 'sources' && <SourceManager />}
              {activeTab === 'activity' && <SourceActivityDashboard />}
              {activeTab === 'test' && <RagTestPanel />}
              {/* Render extra tabs */}
              {extraTabs.map(tab => (
                activeTab === tab.key ? <React.Fragment key={tab.key}>{tab.panel}</React.Fragment> : null
              ))}
            </div>
          </div>
        </div>
        {showAddSource && (
          <AddSourceModal
            onClose={() => setShowAddSource(false)}
            onAdd={handleAddSource}
          />
        )}
      </div>
    </div>
  );
} 