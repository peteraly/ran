const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');
require('dotenv').config();
const { index } = require('./pinecone');
const { OpenAI } = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'https://ran-et6u26nn3-peteralys-projects.vercel.app',
      'https://ran-eight.vercel.app',
      'https://ran-oej6u92pf-peteralys-projects.vercel.app',
      'https://ran-bqtmmstz7-peteralys-projects.vercel.app',
      'https://ran-nhv6pa4rv-peteralys-projects.vercel.app',
      'https://ran-hbc37h4cy-peteralys-projects.vercel.app',
      'https://ran-7mmw0v4hb-peteralys-projects.vercel.app'
    ];
    
    // Allow any Vercel domain
    if (origin.includes('vercel.app') || origin.includes('localhost')) {
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    
    return callback(null, true); // Allow all origins for now
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// File upload configuration
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/markdown',
      'text/csv',
      'application/json',
      'message/rfc822'
    ];
    
    if (allowedTypes.includes(file.mimetype) || file.originalname.endsWith('.md')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

// In-memory storage for demo (replace with proper database)
let contentIndex = [];
let oauthTokens = {};

// Real-time activity tracking
let activityLog = [];
let sourceStats = {
  totalSources: 0,
  activeSources: 0,
  totalDocuments: 0,
  indexedToday: 0,
  searchQueries: 0,
  avgResponseTime: 0
};

// Activity logging function
const logActivity = (type, source, message, status = 'success') => {
  const activity = {
    id: Date.now(),
    type,
    source,
    message,
    status,
    time: new Date().toISOString()
  };
  activityLog.unshift(activity);
  if (activityLog.length > 100) activityLog.pop(); // Keep last 100 activities
};

// OAuth Token Exchange
app.post('/api/oauth/token', async (req, res) => {
  try {
    const { provider, code } = req.body;
    
    // TODO: Implement proper OAuth token exchange for each provider
    // For now, simulate successful token exchange
    const mockTokens = {
      access_token: `mock_${provider}_token_${Date.now()}`,
      refresh_token: `mock_${provider}_refresh_${Date.now()}`,
      expires_in: 3600
    };
    
    oauthTokens[provider] = mockTokens;
    
    res.json({
      success: true,
      tokens: mockTokens,
      message: `${provider} connected successfully`
    });
  } catch (error) {
    console.error('OAuth token exchange error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to exchange OAuth token'
    });
  }
});

// Content Indexing
app.post('/api/index', async (req, res) => {
  try {
    const { content, metadata } = req.body;
    
    // Simple content indexing (replace with proper vector embedding)
    const indexedContent = {
      id: `content_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      content: content,
      metadata: {
        ...metadata,
        indexedAt: new Date().toISOString(),
        chunks: Array.isArray(content) ? content.length : 1
      }
    };
    
    contentIndex.push(indexedContent);
    
    res.json({
      success: true,
      id: indexedContent.id,
      message: 'Content indexed successfully'
    });
  } catch (error) {
    console.error('Content indexing error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to index content'
    });
  }
});

// Enhanced source sync endpoints for all source types
app.post('/api/sync/:provider', async (req, res) => {
  try {
    const { provider } = req.params;
    const { tokens, config } = req.body;
    
    let syncData = {
      provider,
      syncedAt: new Date().toISOString(),
      status: 'completed'
    };

    // Provider-specific sync logic
    switch (provider) {
      // Email providers
      case 'gmail':
        syncData = await syncGmail(tokens);
        break;
      case 'outlook':
        syncData = await syncOutlook(tokens);
        break;
      case 'imap':
        syncData = await syncImap(config);
        break;
      case 'exchange':
        syncData = await syncExchange(config);
        break;
      
      // Messaging providers
      case 'slack':
        syncData = await syncSlack(tokens);
        break;
      case 'teams':
        syncData = await syncTeams(tokens);
        break;
      case 'discord':
        syncData = await syncDiscord(tokens);
        break;
      case 'telegram':
        syncData = await syncTelegram(config);
        break;
      case 'whatsapp':
        syncData = await syncWhatsApp(config);
        break;
      
      // Database providers
      case 'postgres':
      case 'mysql':
      case 'mongodb':
      case 'redis':
      case 'elasticsearch':
      case 'sqlserver':
      case 'oracle':
      case 'snowflake':
        syncData = await syncDatabase(provider, config);
        break;
      
      // Enterprise systems
      case 'sharepoint':
        syncData = await syncSharePoint(tokens);
        break;
      case 'confluence':
        syncData = await syncConfluence(tokens);
        break;
      case 'jira':
        syncData = await syncJira(tokens);
        break;
      case 'servicenow':
        syncData = await syncServiceNow(config);
        break;
      case 'salesforce':
        syncData = await syncSalesforce(tokens);
        break;
      case 'workday':
        syncData = await syncWorkday(config);
        break;
      case 'sap':
        syncData = await syncSAP(config);
        break;
      
      // Cloud storage
      case 's3':
        syncData = await syncS3(config);
        break;
      case 'dropbox':
        syncData = await syncDropbox(tokens);
        break;
      case 'box':
        syncData = await syncBox(tokens);
        break;
      case 'onedrive':
        syncData = await syncOneDrive(tokens);
        break;
      case 'googledrive':
        syncData = await syncGoogleDrive(tokens);
        break;
      
      // Productivity tools
      case 'notion':
        syncData = await syncNotion(tokens);
        break;
      case 'github':
        syncData = await syncGitHub(tokens);
        break;
      case 'gitlab':
        syncData = await syncGitLab(tokens);
        break;
      case 'trello':
        syncData = await syncTrello(tokens);
        break;
      case 'asana':
        syncData = await syncAsana(tokens);
        break;
      case 'monday':
        syncData = await syncMonday(tokens);
        break;
      case 'clickup':
        syncData = await syncClickUp(tokens);
        break;
      
      // Social media
      case 'linkedin':
        syncData = await syncLinkedIn(tokens);
        break;
      case 'twitter':
        syncData = await syncTwitter(tokens);
        break;
      case 'reddit':
        syncData = await syncReddit(tokens);
        break;
      case 'facebook':
        syncData = await syncFacebook(tokens);
        break;
      
      // Research & News
      case 'rss':
        syncData = await syncRSS(config);
        break;
      case 'newsapi':
        syncData = await syncNewsAPI(config);
        break;
      case 'arxiv':
        syncData = await syncArxiv(config);
        break;
      case 'pubmed':
        syncData = await syncPubMed(config);
        break;
      
      // Financial data
      case 'bloomberg':
        syncData = await syncBloomberg(config);
        break;
      case 'yahoo_finance':
        syncData = await syncYahooFinance(config);
        break;
      case 'alpha_vantage':
        syncData = await syncAlphaVantage(config);
        break;
      case 'coinbase':
        syncData = await syncCoinbase(config);
        break;
      
      // External APIs
      case 'api':
        syncData = await syncRESTAPI(config);
        break;
      case 'webhook':
        syncData = await syncWebhook(config);
        break;
      case 'graphql':
        syncData = await syncGraphQL(config);
        break;
      case 'soap':
        syncData = await syncSOAP(config);
        break;
      
      // Automation tools
      case 'zapier':
        syncData = await syncZapier(config);
        break;
      case 'ifttt':
        syncData = await syncIFTTT(config);
        break;
      case 'n8n':
        syncData = await syncN8N(config);
        break;
      
      default:
        // Generic sync for unknown providers
        syncData = await syncGeneric(provider, tokens, config);
    }
    
    res.json({
      success: true,
      ...syncData
    });
  } catch (error) {
    console.error('Source sync error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to sync source'
    });
  }
});

// Email forwarding endpoint for automatic indexing
app.post('/api/email/forward', async (req, res) => {
  try {
    const { from, to, subject, body, attachments } = req.body;
    
    // Process forwarded email
    const emailContent = {
      id: `email_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      from,
      to,
      subject,
      body,
      attachments: attachments || [],
      receivedAt: new Date().toISOString(),
      source: 'email_forward'
    };
    
    // Index the email content
    contentIndex.push({
      id: emailContent.id,
      content: `${subject}\n\n${body}`,
      metadata: {
        source: 'email_forward',
        type: 'email',
        from,
        subject,
        receivedAt: emailContent.receivedAt,
        indexedAt: new Date().toISOString()
      }
    });
    
    res.json({
      success: true,
      message: 'Email indexed successfully',
      id: emailContent.id
    });
  } catch (error) {
    console.error('Email forwarding error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process forwarded email'
    });
  }
});

// Webhook endpoint for real-time data ingestion
app.post('/api/webhook/:source', async (req, res) => {
  try {
    const { source } = req.params;
    const data = req.body;
    
    // Process webhook data
    const webhookContent = {
      id: `webhook_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      source,
      data,
      receivedAt: new Date().toISOString()
    };
    
    // Index the webhook content
    contentIndex.push({
      id: webhookContent.id,
      content: JSON.stringify(data),
      metadata: {
        source: `webhook_${source}`,
        type: 'webhook',
        receivedAt: webhookContent.receivedAt,
        indexedAt: new Date().toISOString()
      }
    });
    
    res.json({
      success: true,
      message: 'Webhook data indexed successfully',
      id: webhookContent.id
    });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process webhook data'
    });
  }
});

// Enhanced content retrieval with RAG processing
app.post('/api/retrieve', async (req, res) => {
  try {
    const { query, sources, limit } = req.body;
    const topK = limit || 5;
    const relevantChunks = await retrieveRelevantChunksFromPinecone(query, topK);
    res.json({ success: true, chunks: relevantChunks });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// RAG processing endpoint with LLM integration
app.post('/api/rag/process', async (req, res) => {
  try {
    const { query, context, sources = [] } = req.body;
    const startTime = Date.now();
    
    logActivity('rag', 'all', `RAG processing: "${query}"`, 'processing');
    
    // TODO: Integrate with real LLM (OpenAI, Anthropic, etc.)
    // For now, simulate LLM processing with enhanced context analysis
    
    const mockLlmResponse = {
      summary: generateMockSummary(query, context),
      insights: generateMockInsights(query, context),
      recommendations: generateMockRecommendations(query, context),
      confidence: calculateConfidence(context),
      sourcesUsed: context.length,
      processingTime: Date.now() - startTime
    };
    
    logActivity('rag', 'all', `RAG completed: ${mockLlmResponse.sourcesUsed} sources used`, 'success');
    
    res.json({
      success: true,
      ...mockLlmResponse
    });
  } catch (error) {
    console.error('RAG processing error:', error);
    logActivity('rag', 'all', `RAG failed: ${error.message}`, 'error');
    res.status(500).json({
      success: false,
      error: 'Failed to process RAG request'
    });
  }
});

// Activity tracking endpoints
app.get('/api/activity', (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const recentActivity = activityLog.slice(0, parseInt(limit));
    
    res.json({
      success: true,
      activity: recentActivity,
      total: activityLog.length
    });
  } catch (error) {
    console.error('Activity retrieval error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve activity'
    });
  }
});

app.get('/api/stats', (req, res) => {
  try {
    // Update stats based on current content
    sourceStats.totalDocuments = contentIndex.length;
    sourceStats.activeSources = new Set(contentIndex.map(item => item.metadata.source)).size;
    sourceStats.totalSources = sourceStats.activeSources;
    
    // Calculate today's indexed content
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    sourceStats.indexedToday = contentIndex.filter(item => 
      new Date(item.metadata.indexedAt) >= today
    ).length;
    
    res.json({
      success: true,
      stats: sourceStats
    });
  } catch (error) {
    console.error('Stats retrieval error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve stats'
    });
  }
});

// Helper functions for RAG processing
function generateMockSummary(query, context) {
  if (query.toLowerCase().includes('stablecoin')) {
    return [
      '🇺🇸 U.S. Regulation: New Stablecoin Oversight Act introduced, requiring 100% reserves and real-time attestations.',
      '💸 Tether Volatility: $1.2B net outflow, peg briefly lost, restored by arbitrage.',
      '🇪🇺 EU MiCA Enforcement: MiCA now in effect, only USDC/EURC approved, Tether/DAI not approved.',
      '🌐 Internal Risk: Cross-border corridors using non-compliant stablecoins may face operational halts.',
    ];
  }
  
  return [
    `Based on ${context.length} relevant sources, here are the key findings:`,
    'Analysis completed with high confidence level',
    'Sources analyzed: ' + [...new Set(context.map(item => item.source))].join(', '),
    'Context relevance: ' + (context.reduce((sum, item) => sum + item.score, 0) / context.length * 100).toFixed(0) + '%'
  ];
}

function generateMockInsights(query, context) {
  const insights = [
    'Market volatility increased by 23% in the last quarter',
    'Regulatory uncertainty is the primary concern for 67% of respondents',
    'Technology adoption is accelerating across all sectors'
  ];
  
  if (query.toLowerCase().includes('regulation')) {
    insights.unshift('Regulatory changes are driving market consolidation');
  }
  
  return insights;
}

function generateMockRecommendations(query, context) {
  const recommendations = [
    'Monitor regulatory developments closely',
    'Diversify holdings across compliant options',
    'Implement real-time risk monitoring systems'
  ];
  
  if (query.toLowerCase().includes('stablecoin')) {
    recommendations.unshift('Review stablecoin compliance status');
  }
  
  return recommendations;
}

function calculateConfidence(context) {
  if (context.length === 0) return 0.1;
  
  const avgScore = context.reduce((sum, item) => sum + item.score, 0) / context.length;
  const sourceDiversity = new Set(context.map(item => item.source)).size;
  const recency = context.filter(item => {
    const daysSince = (Date.now() - new Date(item.timestamp).getTime()) / (1000 * 60 * 60 * 24);
    return daysSince < 7;
  }).length / context.length;
  
  return Math.min(0.95, avgScore * 0.6 + (sourceDiversity / 10) * 0.2 + recency * 0.2);
}

// Source health check endpoint
app.get('/api/sources/health', async (req, res) => {
  try {
    const healthStatus = {};
    
    // Check health of all connected sources
    for (const [provider, tokens] of Object.entries(oauthTokens)) {
      try {
        const status = await checkSourceHealth(provider, tokens);
        healthStatus[provider] = status;
      } catch (error) {
        healthStatus[provider] = {
          status: 'error',
          error: error.message,
          lastChecked: new Date().toISOString()
        };
      }
    }
    
    res.json({
      success: true,
      sources: healthStatus,
      totalSources: Object.keys(oauthTokens).length,
      healthySources: Object.values(healthStatus).filter(s => s.status === 'healthy').length
    });
  } catch (error) {
    console.error('Source health check error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check source health'
    });
  }
});

// Helper functions for source-specific sync operations
async function syncGmail(tokens) {
  // TODO: Implement Gmail API integration
  return {
    provider: 'gmail',
    syncedAt: new Date().toISOString(),
    itemsProcessed: Math.floor(Math.random() * 100) + 10,
    status: 'completed'
  };
}

async function syncOutlook(tokens) {
  // TODO: Implement Microsoft Graph API integration
  return {
    provider: 'outlook',
    syncedAt: new Date().toISOString(),
    itemsProcessed: Math.floor(Math.random() * 50) + 5,
    status: 'completed'
  };
}

async function syncSlack(tokens) {
  // TODO: Implement Slack API integration
  return {
    provider: 'slack',
    syncedAt: new Date().toISOString(),
    itemsProcessed: Math.floor(Math.random() * 200) + 20,
    status: 'completed'
  };
}

async function syncDatabase(provider, config) {
  // TODO: Implement database-specific sync logic
  return {
    provider,
    syncedAt: new Date().toISOString(),
    tablesProcessed: Math.floor(Math.random() * 10) + 1,
    recordsIndexed: Math.floor(Math.random() * 10000) + 100,
    status: 'completed'
  };
}

async function checkSourceHealth(provider, tokens) {
  // TODO: Implement source-specific health checks
  return {
    status: 'healthy',
    lastSync: new Date().toISOString(),
    responseTime: Math.floor(Math.random() * 1000) + 100
  };
}

// Add more sync functions for other providers...
async function syncImap(config) { return { provider: 'imap', status: 'completed' }; }
async function syncExchange(config) { return { provider: 'exchange', status: 'completed' }; }
async function syncTeams(tokens) { return { provider: 'teams', status: 'completed' }; }
async function syncDiscord(tokens) { return { provider: 'discord', status: 'completed' }; }
async function syncTelegram(config) { return { provider: 'telegram', status: 'completed' }; }
async function syncWhatsApp(config) { return { provider: 'whatsapp', status: 'completed' }; }
async function syncSharePoint(tokens) { return { provider: 'sharepoint', status: 'completed' }; }
async function syncConfluence(tokens) { return { provider: 'confluence', status: 'completed' }; }
async function syncJira(tokens) { return { provider: 'jira', status: 'completed' }; }
async function syncServiceNow(config) { return { provider: 'servicenow', status: 'completed' }; }
async function syncSalesforce(tokens) { return { provider: 'salesforce', status: 'completed' }; }
async function syncWorkday(config) { return { provider: 'workday', status: 'completed' }; }
async function syncSAP(config) { return { provider: 'sap', status: 'completed' }; }
async function syncS3(config) { return { provider: 's3', status: 'completed' }; }
async function syncDropbox(tokens) { return { provider: 'dropbox', status: 'completed' }; }
async function syncBox(tokens) { return { provider: 'box', status: 'completed' }; }
async function syncOneDrive(tokens) { return { provider: 'onedrive', status: 'completed' }; }
async function syncGoogleDrive(tokens) { return { provider: 'googledrive', status: 'completed' }; }
async function syncNotion(tokens) { return { provider: 'notion', status: 'completed' }; }
async function syncGitHub(tokens) { return { provider: 'github', status: 'completed' }; }
async function syncGitLab(tokens) { return { provider: 'gitlab', status: 'completed' }; }
async function syncTrello(tokens) { return { provider: 'trello', status: 'completed' }; }
async function syncAsana(tokens) { return { provider: 'asana', status: 'completed' }; }
async function syncMonday(tokens) { return { provider: 'monday', status: 'completed' }; }
async function syncClickUp(tokens) { return { provider: 'clickup', status: 'completed' }; }
async function syncLinkedIn(tokens) { return { provider: 'linkedin', status: 'completed' }; }
async function syncTwitter(tokens) { return { provider: 'twitter', status: 'completed' }; }
async function syncReddit(tokens) { return { provider: 'reddit', status: 'completed' }; }
async function syncFacebook(tokens) { return { provider: 'facebook', status: 'completed' }; }
async function syncRSS(config) { return { provider: 'rss', status: 'completed' }; }
async function syncNewsAPI(config) { return { provider: 'newsapi', status: 'completed' }; }
async function syncArxiv(config) { return { provider: 'arxiv', status: 'completed' }; }
async function syncPubMed(config) { return { provider: 'pubmed', status: 'completed' }; }
async function syncBloomberg(config) { return { provider: 'bloomberg', status: 'completed' }; }
async function syncYahooFinance(config) { return { provider: 'yahoo_finance', status: 'completed' }; }
async function syncAlphaVantage(config) { return { provider: 'alpha_vantage', status: 'completed' }; }
async function syncCoinbase(config) { return { provider: 'coinbase', status: 'completed' }; }
async function syncRESTAPI(config) { return { provider: 'api', status: 'completed' }; }
async function syncWebhook(config) { return { provider: 'webhook', status: 'completed' }; }
async function syncGraphQL(config) { return { provider: 'graphql', status: 'completed' }; }
async function syncSOAP(config) { return { provider: 'soap', status: 'completed' }; }
async function syncZapier(config) { return { provider: 'zapier', status: 'completed' }; }
async function syncIFTTT(config) { return { provider: 'ifttt', status: 'completed' }; }
async function syncN8N(config) { return { provider: 'n8n', status: 'completed' }; }
async function syncGeneric(provider, tokens, config) { return { provider, status: 'completed' }; }

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    contentIndexSize: contentIndex.length
  });
});

// Database Connection Test
app.post('/api/database/test', async (req, res) => {
  try {
    const { type, config } = req.body;
    
    // TODO: Implement real database connection testing
    // For now, simulate connection test
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock connection test result
    const isConnected = Math.random() > 0.2; // 80% success rate for demo
    
    if (isConnected) {
      res.json({
        success: true,
        message: `${type} connection successful`,
        tables: ['users', 'products', 'orders', 'analytics'], // Mock table list
        recordCount: Math.floor(Math.random() * 10000) + 100
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Connection failed. Please check your credentials.'
      });
    }
  } catch (error) {
    console.error('Database connection test error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to test database connection'
    });
  }
});

// API Connection Test
app.post('/api/external/test', async (req, res) => {
  try {
    const { type, config } = req.body;
    
    // TODO: Implement real API connection testing
    // For now, simulate connection test
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock API test result
    const isConnected = Math.random() > 0.2; // 80% success rate for demo
    
    if (isConnected) {
      res.json({
        success: true,
        message: `${type} connection successful`,
        endpoints: ['/users', '/data', '/analytics'], // Mock endpoint list
        rateLimit: '1000 requests/hour'
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Connection failed. Please check your API configuration.'
      });
    }
  } catch (error) {
    console.error('API connection test error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to test API connection'
    });
  }
});

// Database Content Sync
app.post('/api/sync/database/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const { config } = req.body;
    
    // TODO: Implement real database content sync
    // For now, return mock sync data
    const mockData = {
      type,
      syncedAt: new Date().toISOString(),
      tablesProcessed: Math.floor(Math.random() * 10) + 1,
      recordsIndexed: Math.floor(Math.random() * 10000) + 100,
      status: 'completed'
    };
    
    res.json({
      success: true,
      ...mockData
    });
  } catch (error) {
    console.error('Database sync error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to sync database content'
    });
  }
});

// External API Content Sync
app.post('/api/sync/external/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const { config } = req.body;
    
    // TODO: Implement real API content sync
    // For now, return mock sync data
    const mockData = {
      type,
      syncedAt: new Date().toISOString(),
      endpointsProcessed: Math.floor(Math.random() * 5) + 1,
      recordsIndexed: Math.floor(Math.random() * 1000) + 50,
      status: 'completed'
    };
    
    res.json({
      success: true,
      ...mockData
    });
  } catch (error) {
    console.error('External API sync error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to sync external API content'
    });
  }
});

// Web Scraping
app.get('/api/scrape', async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL parameter is required'
      });
    }
    
    // Implement proper web scraping with cheerio
    try {
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      const $ = cheerio.load(response.data);
      
      // Extract title
      const title = $('title').text().trim() || $('h1').first().text().trim() || new URL(url).hostname;
      
      // Remove script and style elements
      $('script, style, nav, header, footer, .nav, .header, .footer, .sidebar, .ad, .advertisement').remove();
      
      // Extract main content
      let content = '';
      
      // Try to find main content areas
      const mainSelectors = [
        'main',
        'article',
        '.content',
        '.main-content',
        '#content',
        '#main',
        '.post-content',
        '.entry-content'
      ];
      
      for (const selector of mainSelectors) {
        const element = $(selector);
        if (element.length > 0) {
          content = element.text().trim();
          break;
        }
      }
      
      // If no main content found, use body text
      if (!content) {
        content = $('body').text().trim();
      }
      
      // Clean up the content
      content = content
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .replace(/\n\s*\n/g, '\n\n') // Clean up line breaks
        .trim();
      
      // Limit content length
      if (content.length > 50000) {
        content = content.substring(0, 50000) + '...';
      }
      
      console.log(`Successfully scraped ${url}, extracted ${content.length} characters`);
      
      // Index the scraped content
      const chunks = chunkContent(content, `web_${new URL(url).hostname}`);
      chunks.forEach((chunk, index) => {
        contentIndex.push({
          id: `web_${Date.now()}_${Math.random().toString(36).substring(2, 9)}_chunk_${index}`,
          content: chunk.content,
          metadata: {
            source: 'web',
            url: url,
            title: title,
            scrapedAt: new Date().toISOString(),
            indexedAt: new Date().toISOString(),
            chunkIndex: index,
            totalChunks: chunks.length
          }
        });
      });
      
      logActivity('scrape', 'web', `Scraped ${url} into ${chunks.length} chunks`, 'success');
      
      res.json({
        success: true,
        title: title,
        content: content,
        url: url,
        chunks: chunks.length
      });
      
    } catch (scrapeError) {
      console.error(`Error scraping ${url}:`, scrapeError);
      res.status(500).json({
        success: false,
        error: `Failed to scrape web content: ${scrapeError.message}`
      });
    }
  } catch (error) {
    console.error('Web scraping error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to scrape web content'
    });
  }
});

// File Upload and Processing
app.post('/api/upload', upload.array('files'), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files uploaded'
      });
    }
    const processedFiles = [];
    for (const file of req.files) {
      try {
        let content = '';
        if (file.mimetype === 'application/pdf') {
          // PDF parsing
          const pdfData = await pdfParse(file.buffer);
          content = pdfData.text;
          if (!content || content.trim().length === 0) {
            throw new Error('No text could be extracted from the PDF. The file may be scanned or image-based.');
          }
        } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
          // DOCX parsing
          const docxData = await mammoth.extractRawText({ buffer: file.buffer });
          content = docxData.value;
        } else if (file.mimetype.startsWith('text/')) {
          content = file.buffer.toString('utf-8');
        } else {
          throw new Error('Unsupported file type');
        }
        // Chunk content
        const chunkSize = 1000;
        const overlap = 200;
        const chunks = [];
        let i = 0;
        while (i < content.length) {
          const chunkText = content.slice(i, i + chunkSize);
          chunks.push({
            id: `${file.originalname}-chunk-${i}`,
            content: chunkText,
          });
          i += chunkSize - overlap;
        }
        // Index chunks in Pinecone
        await indexChunksWithPinecone(chunks, { source: 'local', filename: file.originalname });
        processedFiles.push({
          name: file.originalname,
          size: file.size,
          content: chunks,
          type: file.mimetype,
          error: null,
        });
      } catch (err) {
        processedFiles.push({
          name: file.originalname,
          size: file.size,
          content: [],
          type: file.mimetype,
          error: err.message,
        });
      }
    }
    res.json({ success: true, files: processedFiles });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Helper function to chunk content
function chunkContent(content, filename) {
  // Split content into paragraphs and filter out empty ones
  const paragraphs = content
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(p => p.length > 50); // Only keep paragraphs with substantial content
  
  // If we have paragraphs, use them as chunks
  if (paragraphs.length > 0) {
    return paragraphs.map((paragraph, index) => ({
      id: `${filename}_chunk_${index}`,
      content: paragraph,
      metadata: {
        filename,
        chunkIndex: index,
        chunkType: 'paragraph'
      }
    }));
  }
  
  // Fallback: split by sentences if no good paragraphs
  const sentences = content
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 20);
  
  return sentences.map((sentence, index) => ({
    id: `${filename}_chunk_${index}`,
    content: sentence,
    metadata: {
      filename,
      chunkIndex: index,
      chunkType: 'sentence'
    }
  }));
}

// Test endpoint to populate with sample data
app.post('/api/test/populate', async (req, res) => {
  try {
    const sampleData = [
      {
        content: "The new Stablecoin Oversight Act requires all stablecoin issuers to maintain 100% reserves and provide real-time attestations. This regulation affects major players like Tether, USDC, and DAI.",
        metadata: {
          source: 'email',
          type: 'email',
          subject: 'Stablecoin Regulation Update',
          from: 'regulatory@company.com',
          indexedAt: new Date().toISOString()
        }
      },
      {
        content: "Tether experienced a $1.2 billion net outflow last week, causing the USDT peg to briefly deviate from $1.00. The peg was restored through arbitrage mechanisms within 24 hours.",
        metadata: {
          source: 'web',
          type: 'web',
          title: 'Tether Volatility Report',
          url: 'https://example.com/tether-report',
          indexedAt: new Date().toISOString()
        }
      },
      {
        content: "EU MiCA regulations are now in full effect. Only USDC and EURC are approved for use in the EU. Tether and DAI are not compliant and may face operational restrictions.",
        metadata: {
          source: 'slack',
          type: 'message',
          channel: '#regulatory-updates',
          user: 'legal-team',
          indexedAt: new Date().toISOString()
        }
      },
      {
        content: "Our cross-border payment corridors using non-compliant stablecoins may face operational halts. We need to review our stablecoin strategy and consider migrating to approved alternatives.",
        metadata: {
          source: 'local',
          type: 'document',
          filename: 'risk_assessment.pdf',
          indexedAt: new Date().toISOString()
        }
      },
      {
        content: "Market analysis shows that regulatory uncertainty is driving consolidation in the stablecoin space. Companies are seeking regulatory clarity before making major investments.",
        metadata: {
          source: 'database',
          type: 'report',
          title: 'Market Analysis Q2 2024',
          author: 'research-team',
          indexedAt: new Date().toISOString()
        }
      }
    ];

    // Clear existing content and add sample data
    contentIndex = [];
    sampleData.forEach(item => {
      contentIndex.push({
        id: `sample_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        content: item.content,
        metadata: item.metadata
      });
    });

    // Log the population activity
    logActivity('test', 'all', `Populated system with ${sampleData.length} sample documents`, 'success');

    res.json({
      success: true,
      message: `Populated system with ${sampleData.length} sample documents`,
      documents: sampleData.length
    });
  } catch (error) {
    console.error('Test population error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to populate test data'
    });
  }
});

// Test RAG functionality endpoint
app.post('/api/test/rag', async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query parameter is required'
      });
    }

    // Step 1: Retrieve relevant content
    const retrievalResult = await new Promise((resolve) => {
      const mockReq = { body: { query, sources: [], limit: 10, filters: {} } };
      const mockRes = {
        json: (data) => resolve(data),
        status: () => ({ json: (data) => resolve(data) })
      };
      
      // Call the retrieve endpoint logic directly
      const retrieveHandler = app._router.stack
        .find(layer => layer.route && layer.route.path === '/api/retrieve')
        ?.route?.stack?.find(s => s.method === 'post')?.handle;
      
      if (retrieveHandler) {
        retrieveHandler(mockReq, mockRes);
      } else {
        resolve({ success: false, error: 'Retrieve handler not found' });
      }
    });

    if (!retrievalResult.success) {
      return res.status(500).json(retrievalResult);
    }

    // Step 2: Process with RAG
    const ragResult = await new Promise((resolve) => {
      const mockReq = { body: { query, context: retrievalResult.results, sources: [] } };
      const mockRes = {
        json: (data) => resolve(data),
        status: () => ({ json: (data) => resolve(data) })
      };
      
      // Call the RAG endpoint logic directly
      const ragHandler = app._router.stack
        .find(layer => layer.route && layer.route.path === '/api/rag/process')
        ?.route?.stack?.find(s => s.method === 'post')?.handle;
      
      if (ragHandler) {
        ragHandler(mockReq, mockRes);
      } else {
        resolve({ success: false, error: 'RAG handler not found' });
      }
    });

    res.json({
      success: true,
      query,
      retrieval: retrievalResult,
      rag: ragResult,
      testCompleted: true
    });

  } catch (error) {
    console.error('RAG test error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to test RAG functionality'
    });
  }
});

// Helper: Index chunks in Pinecone
async function indexChunksWithPinecone(chunks, metadata) {
  for (const chunk of chunks) {
    // Generate embedding using OpenAI
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: chunk.content,
    });
    const embedding = embeddingResponse.data[0].embedding;
    await index.upsert([
      {
        id: chunk.id,
        values: embedding,
        metadata: {
          ...metadata,
          text: chunk.content,
          chunk_id: chunk.id,
        },
      },
    ]);
  }
}

// Helper: Retrieve relevant chunks from Pinecone
async function retrieveRelevantChunksFromPinecone(query, topK = 5) {
  // Embed the query
  const embeddingResponse = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: query,
  });
  const queryEmbedding = embeddingResponse.data[0].embedding;
  // Query Pinecone
  const results = await index.query({
    vector: queryEmbedding,
    topK,
    includeMetadata: true,
  });
  return results.matches.map(match => ({
    id: match.id,
    score: match.score,
    content: match.metadata.text,
    metadata: match.metadata,
  }));
}

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔗 API base: http://localhost:${PORT}/api`);
}); 