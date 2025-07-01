import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  RefreshCw, 
  Database, 
  FileText,
  Globe2,
  Mail,
  MessageSquare,
  Cloud,
  Zap,
  TrendingUp,
  BarChart3,
  Search
} from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://ran-backend-pp3x.onrender.com';

export default function SourceActivityDashboard() {
  const [sourceStats, setSourceStats] = useState({});
  const [recentActivity, setRecentActivity] = useState([]);
  const [syncStatus, setSyncStatus] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    // Real-time updates every 5 seconds
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch stats and activity in parallel
      const [statsResponse, activityResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/stats`),
        fetch(`${API_BASE_URL}/api/activity?limit=20`)
      ]);
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setSourceStats(statsData.stats);
      }
      
      if (activityResponse.ok) {
        const activityData = await activityResponse.json();
        setRecentActivity(activityData.activity);
        
        // Generate sync status from activity
        const syncData = {};
        const sourceTypes = ['email', 'slack', 'notion', 'web', 'local', 'database', 'api', 'cloud'];
        
        sourceTypes.forEach(source => {
          const lastActivity = activityData.activity.find(a => a.source === source);
          if (lastActivity) {
            syncData[source] = {
              status: lastActivity.status === 'success' ? 'synced' : lastActivity.status,
              lastSync: formatTimeAgo(new Date(lastActivity.time)),
              nextSync: calculateNextSync(lastActivity.time),
              items: Math.floor(Math.random() * 500) + 50 // Mock item count
            };
          } else {
            syncData[source] = {
              status: 'inactive',
              lastSync: 'Never',
              nextSync: 'N/A',
              items: 0
            };
          }
        });
        
        setSyncStatus(syncData);
      }
    } catch (error) {
      console.error('Failed to fetch activity data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const calculateNextSync = (lastSyncTime) => {
    const lastSync = new Date(lastSyncTime);
    const nextSync = new Date(lastSync.getTime() + 5 * 60000); // 5 minutes later
    const now = new Date();
    const diffMs = nextSync - now;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins <= 0) return 'Due now';
    if (diffMins < 60) return `${diffMins} min`;
    return `${Math.floor(diffMins / 60)} hour${Math.floor(diffMins / 60) > 1 ? 's' : ''}`;
  };

  const getSourceIcon = (source) => {
    const icons = {
      email: Mail,
      slack: MessageSquare,
      notion: FileText,
      web: Globe2,
      local: Database,
      database: Database,
      api: Zap,
      cloud: Cloud
    };
    return icons[source] || Database;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
      case 'synced':
      case 'success':
        return 'text-green-500';
      case 'syncing':
      case 'processing':
        return 'text-blue-500';
      case 'error':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
      case 'synced':
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'syncing':
      case 'processing':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading && Object.keys(sourceStats).length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 text-blue-500 animate-spin" />
          <span className="ml-2 text-gray-600">Loading activity data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-900">Source Activity Dashboard</h3>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Live updates</span>
          <button 
            onClick={fetchData}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title="Refresh data"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Database className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium text-blue-900">Total Sources</span>
          </div>
          <div className="text-2xl font-bold text-blue-900">{sourceStats.totalSources || 0}</div>
          <div className="text-xs text-blue-600">{sourceStats.activeSources || 0} active</div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium text-green-900">Documents</span>
          </div>
          <div className="text-2xl font-bold text-green-900">{sourceStats.totalDocuments || 0}</div>
          <div className="text-xs text-green-600">+{sourceStats.indexedToday || 0} today</div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Search className="h-4 w-4 text-purple-500" />
            <span className="text-sm font-medium text-purple-900">Searches</span>
          </div>
          <div className="text-2xl font-bold text-purple-900">{sourceStats.searchQueries || 0}</div>
          <div className="text-xs text-purple-600">Today</div>
        </div>

        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-orange-500" />
            <span className="text-sm font-medium text-orange-900">Avg Response</span>
          </div>
          <div className="text-2xl font-bold text-orange-900">{(sourceStats.avgResponseTime / 1000 || 0).toFixed(1)}s</div>
          <div className="text-xs text-orange-600">Per query</div>
        </div>
      </div>

      {/* Source Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Source Status</h4>
          <div className="space-y-2">
            {Object.entries(syncStatus).map(([source, data]) => {
              const IconComponent = getSourceIcon(source);
              return (
                <div key={source} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <IconComponent className="h-4 w-4 text-gray-600" />
                    <div>
                      <div className="font-medium text-gray-900 capitalize">{source}</div>
                      <div className="text-xs text-gray-500">{data.items} items</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(data.status)}
                    <div className="text-right">
                      <div className="text-xs text-gray-600">{data.lastSync}</div>
                      <div className="text-xs text-gray-500">Next: {data.nextSync}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-3">Recent Activity</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  {getStatusIcon(activity.status)}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900">{activity.message}</div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="capitalize">{activity.source}</span>
                      <span>•</span>
                      <span>{formatTimeAgo(new Date(activity.time))}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-8">
                <Clock className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">Performance Metrics</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Indexing Speed</span>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium text-green-600">+15%</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Search Accuracy</span>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium text-blue-600">94%</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Uptime</span>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium text-green-600">99.9%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 