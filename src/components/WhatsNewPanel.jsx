import React, { useState, useEffect } from 'react';
import { Clock, TrendingUp, FileText, MessageSquare, Mail, Database, Globe, Plus } from 'lucide-react';

const WhatsNewPanel = ({ onAddToDeliverable }) => {
  const [recentContent, setRecentContent] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSources, setSelectedSources] = useState([]);

  useEffect(() => {
    fetchRecentContent();
  }, []);

  const fetchRecentContent = async () => {
    try {
      // TODO: Replace with real API call
      const mockContent = [
        {
          id: '1',
          title: 'Q4 Strategy Meeting Notes',
          content: 'Key decisions from the quarterly strategy meeting...',
          source: 'slack',
          type: 'message',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          relevance: 0.95,
          tags: ['strategy', 'meeting', 'Q4']
        },
        {
          id: '2',
          title: 'New Product Requirements Document',
          content: 'Updated PRD for the upcoming product launch...',
          source: 'notion',
          type: 'document',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          relevance: 0.88,
          tags: ['product', 'PRD', 'launch']
        },
        {
          id: '3',
          title: 'Customer Feedback Summary',
          content: 'Aggregated feedback from recent customer interviews...',
          source: 'gmail',
          type: 'email',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          relevance: 0.82,
          tags: ['customer', 'feedback', 'interviews']
        },
        {
          id: '4',
          title: 'Market Analysis Report',
          content: 'Latest market trends and competitive analysis...',
          source: 'web',
          type: 'article',
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
          relevance: 0.78,
          tags: ['market', 'analysis', 'trends']
        },
        {
          id: '5',
          title: 'Database Schema Updates',
          content: 'Recent changes to the user database schema...',
          source: 'postgres',
          type: 'database',
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          relevance: 0.75,
          tags: ['database', 'schema', 'updates']
        }
      ];

      setRecentContent(mockContent);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching recent content:', error);
      setIsLoading(false);
    }
  };

  const getSourceIcon = (source) => {
    const icons = {
      slack: MessageSquare,
      notion: FileText,
      gmail: Mail,
      web: Globe,
      postgres: Database,
      teams: MessageSquare,
      github: FileText,
      jira: FileText,
      confluence: FileText,
      sharepoint: FileText
    };
    return icons[source] || FileText;
  };

  const getSourceColor = (source) => {
    const colors = {
      slack: 'bg-purple-500',
      notion: 'bg-gray-800',
      gmail: 'bg-red-500',
      web: 'bg-indigo-500',
      postgres: 'bg-blue-600',
      teams: 'bg-blue-500',
      github: 'bg-gray-900',
      jira: 'bg-blue-500',
      confluence: 'bg-blue-600',
      sharepoint: 'bg-blue-600'
    };
    return colors[source] || 'bg-gray-500';
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now - time) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const handleAddToDeliverable = (content) => {
    onAddToDeliverable(content);
  };

  const handleSourceFilter = (source) => {
    setSelectedSources(prev => 
      prev.includes(source) 
        ? prev.filter(s => s !== source)
        : [...prev, source]
    );
  };

  const filteredContent = selectedSources.length > 0
    ? recentContent.filter(item => selectedSources.includes(item.source))
    : recentContent;

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-20 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-gray-900">What's New</h3>
          </div>
          <button
            onClick={fetchRecentContent}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Refresh
          </button>
        </div>
        
        {/* Source Filters */}
        <div className="mt-3 flex flex-wrap gap-2">
          {Array.from(new Set(recentContent.map(item => item.source))).map(source => (
            <button
              key={source}
              onClick={() => handleSourceFilter(source)}
              className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedSources.includes(source)
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {source}
            </button>
          ))}
        </div>
      </div>

      {/* Content List */}
      <div className="max-h-96 overflow-y-auto">
        {filteredContent.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No recent content found
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredContent.map((item) => {
              const SourceIcon = getSourceIcon(item.source);
              return (
                <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start space-x-3">
                    <div className={`w-8 h-8 rounded-lg ${getSourceColor(item.source)} flex items-center justify-center text-white`}>
                      <SourceIcon className="w-4 h-4" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900 text-sm truncate">
                          {item.title}
                        </h4>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">
                            {formatTimeAgo(item.timestamp)}
                          </span>
                          <button
                            onClick={() => handleAddToDeliverable(item)}
                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Add to deliverable"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {item.content}
                      </p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex flex-wrap gap-1">
                          {item.tags.slice(0, 3).map(tag => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-xs text-gray-500">
                            {Math.round(item.relevance * 100)}% relevant
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>
            {filteredContent.length} items from {new Set(filteredContent.map(item => item.source)).size} sources
          </span>
          <span>
            Last updated {formatTimeAgo(new Date().toISOString())}
          </span>
        </div>
      </div>
    </div>
  );
};

export default WhatsNewPanel; 