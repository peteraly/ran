import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  FileText, 
  Database,
  Search
} from 'lucide-react';
import { getConnectedSources, disconnectSource, syncSource, retrieveRelevantContent } from '../services/connections';

export default function SourceManager() {
  const [sources, setSources] = useState([]);
  const [syncing, setSyncing] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    loadSources();
  }, []);

  const loadSources = () => {
    const connectedSources = getConnectedSources();
    setSources(connectedSources);
  };

  const handleSync = async (provider) => {
    setSyncing(prev => ({ ...prev, [provider]: true }));
    
    try {
      await syncSource(provider);
      loadSources(); // Refresh the sources list
    } catch (error) {
      console.error(`Failed to sync ${provider}:`, error);
    } finally {
      setSyncing(prev => ({ ...prev, [provider]: false }));
    }
  };

  const handleDisconnect = async (provider) => {
    if (window.confirm(`Are you sure you want to disconnect ${provider}?`)) {
      disconnectSource(provider);
      loadSources();
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const results = await retrieveRelevantContent(searchQuery, sources.map(s => s.provider));
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const getSourceIcon = (provider) => {
    const icons = {
      slack: '💬',
      google: '📁',
      microsoft: '📧',
      notion: '📝',
      local: '💾',
      web: '🌐'
    };
    return icons[provider] || '📄';
  };

  const getSourceName = (provider) => {
    const names = {
      slack: 'Slack',
      google: 'Google Drive',
      microsoft: 'Microsoft 365',
      notion: 'Notion',
      local: 'Local Files',
      web: 'Web Sources'
    };
    return names[provider] || provider;
  };

  const formatLastSync = (timestamp) => {
    if (!timestamp) return 'Never';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Data Sources</h2>
          <p className="text-gray-600">Manage your connected sources and search across all content</p>
        </div>
        <div className="text-sm text-gray-500">
          {sources.length} source{sources.length !== 1 ? 's' : ''} connected
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow">
        <div className="flex gap-3">
          <div className="flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search across all your connected sources..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={isSearching || !searchQuery.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
          >
            {isSearching ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            Search
          </button>
        </div>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow">
          <h3 className="font-semibold text-gray-900 mb-3">Search Results</h3>
          <div className="space-y-3">
            {searchResults.map((result, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{result.title || result.filename}</div>
                    <div className="text-sm text-gray-600 mt-1">{result.content.substring(0, 200)}...</div>
                    <div className="text-xs text-gray-500 mt-2">
                      Source: {getSourceName(result.source)} • {formatLastSync(result.timestamp)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Connected Sources */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Connected Sources</h3>
        
        {sources.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl shadow">
            <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No sources connected</h4>
            <p className="text-gray-600">Connect your first data source to get started</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {sources.map((source) => (
              <div key={source.provider} className="bg-white rounded-2xl border border-gray-200 p-6 shadow flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getSourceIcon(source.provider)}</span>
                  <div>
                    <h4 className="font-medium text-gray-900">{getSourceName(source.provider)}</h4>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      {source.connected ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span>Connected</span>
                      <span>•</span>
                      <Clock className="h-4 w-4" />
                      <span>Last sync: {formatLastSync(source.lastSync)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSync(source.provider)}
                    disabled={syncing[source.provider]}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition disabled:opacity-50"
                    title="Sync content"
                  >
                    {syncing[source.provider] ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                  </button>
                  
                  <button
                    onClick={() => handleDisconnect(source.provider)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Disconnect"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      {sources.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow">
          <h3 className="font-semibold text-gray-900 mb-3">Quick Stats</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{sources.length}</div>
              <div className="text-sm text-gray-600">Sources</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {sources.filter(s => s.lastSync).length}
              </div>
              <div className="text-sm text-gray-600">Synced</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {sources.filter(s => !s.lastSync).length}
              </div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {searchResults.length}
              </div>
              <div className="text-sm text-gray-600">Results</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 