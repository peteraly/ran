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
const { EnhancedRAG } = require('./enhancedRAG');
const SourceDiversityAnalyzer = require('./sourceDiversityAnalyzer');

// Initialize source diversity analyzer
const sourceDiversityAnalyzer = new SourceDiversityAnalyzer();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow any Vercel domain or localhost
    if (origin.includes('vercel.app') || origin.includes('localhost')) {
      return callback(null, true);
    }
    
    // Allow specific domains if needed
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    
    // For development, allow all origins
    return callback(null, true);
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

// Activity logging function - FIXED: Added maximum size limit
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
  
  // Keep only last 100 activities to prevent memory leaks
  if (activityLog.length > 100) {
    activityLog = activityLog.slice(0, 100);
  }
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
    
    // Get all relevant chunks from Pinecone
    const allChunks = await retrieveRelevantChunksFromPinecone(query, topK * 2); // Get more to filter
    
    // Filter chunks based on requested sources
    let filteredChunks = allChunks;
    if (sources && sources.length > 0) {
      filteredChunks = allChunks.filter(chunk => {
        const chunkSource = chunk.metadata?.source;
        return sources.includes(chunkSource);
      });
    }
    
    // If no chunks found for requested sources, but we have web search enabled
    if (filteredChunks.length === 0 && sources && sources.includes('web')) {
      // For web search, we could implement real-time web scraping here
      // For now, return a message indicating web search is needed
      return res.json({
        success: true,
        chunks: [],
        message: 'Web search enabled but no indexed web content found. Consider adding web sources first.',
        needsWebSearch: true
      });
    }
    
    // Limit to requested number of chunks
    const finalChunks = filteredChunks.slice(0, topK);
    
    res.json({ 
      success: true, 
      chunks: finalChunks,
      totalFound: allChunks.length,
      filteredCount: filteredChunks.length,
      returnedCount: finalChunks.length
    });
  } catch (error) {
    console.error('Content retrieval error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Enhanced RAG processing endpoint
app.post('/api/rag/process', async (req, res) => {
  try {
    const { query, context, sources, deliverableType = 'executive_summary' } = req.body;
    
    console.log('🔄 RAG processing request:', { query, contextLength: context?.length, sources, deliverableType });
    
    if (!query || !context || !Array.isArray(context)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: query, context' 
      });
    }

    // Generate AI-synthesized deliverable
    const synthesisResult = await generateAISynthesizedDeliverable(query, context, sources, deliverableType);
    
    // Get source diversity analysis
    const diversityAnalysis = sourceDiversityAnalyzer.analyzeSources(context, sources);
    const diversitySummary = sourceDiversityAnalyzer.getSourceDiversitySummary(diversityAnalysis);
    
    // Prepare response
    const response = {
      success: true,
      summary: synthesisResult.content.split('\n').filter(line => line.trim()),
      insights: synthesisResult.insights,
      recommendations: diversitySummary.recommendations || [],
      confidence: synthesisResult.confidence,
      sourcesUsed: sources.length,
      processingTime: Date.now(),
      deliverableType: synthesisResult.deliverableType,
      wordCount: synthesisResult.wordCount,
      sourceMapping: synthesisResult.sourceMapping,
      diversityAnalysis: {
        confidence: diversitySummary.confidence,
        totalSources: diversitySummary.totalSources,
        sourceTypes: diversitySummary.sourceTypes,
        warnings: diversitySummary.warnings || [],
        recommendations: diversitySummary.recommendations || []
      }
    };

    console.log('✅ RAG processing completed successfully');
    res.json(response);
    
  } catch (error) {
    console.error('RAG processing error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'RAG processing failed',
      details: error.message 
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
  // Use actual retrieved content instead of hardcoded mock data
  if (context && context.length > 0) {
    // Extract key information from the actual retrieved chunks
    const sources = [...new Set(context.map(item => item.metadata?.filename || item.metadata?.source || 'Unknown'))];
    const avgScore = context.reduce((sum, item) => sum + (item.score || 0), 0) / context.length;
    
    // Create a summary based on the actual retrieved content
    const summary = [
      `Based on analysis of ${context.length} relevant content chunks from ${sources.length} source(s):`,
      '',
      '**Key Findings from Retrieved Content:**',
      ...context.slice(0, 3).map((chunk, index) => 
        `• ${chunk.content.substring(0, 150)}${chunk.content.length > 150 ? '...' : ''}`
      ),
      '',
      `**Source Analysis:**`,
      `• Content relevance: ${Math.round(avgScore * 100)}%`,
      `• Sources consulted: ${sources.join(', ')}`,
      `• Total chunks analyzed: ${context.length}`
    ];
    
    return summary;
  }
  
  // Fallback if no context provided
  return [
    'No relevant content found to analyze.',
    'Please ensure you have uploaded documents or enabled appropriate data sources.',
    'Try rephrasing your query or adding more source documents.'
  ];
}

function generateMockInsights(query, context) {
  if (!context || context.length === 0) {
    return ['No content available for analysis'];
  }
  
  // Generate insights based on actual retrieved content
  const insights = [
    `Analysis completed using ${context.length} content chunks`,
    `Content relevance score: ${Math.round(context.reduce((sum, item) => sum + (item.score || 0), 0) / context.length * 100)}%`,
    `Sources analyzed: ${[...new Set(context.map(item => item.metadata?.filename || item.metadata?.source || 'Unknown'))].join(', ')}`
  ];
  
  // Add content-specific insights if available
  if (context.length > 0) {
    const firstChunk = context[0];
    if (firstChunk.content) {
      insights.push(`Primary content focus: ${firstChunk.content.substring(0, 100)}...`);
    }
  }
  
  return insights;
}

function generateMockRecommendations(query, context) {
  if (!context || context.length === 0) {
    return ['Add more source documents for comprehensive analysis'];
  }
  
  // Generate recommendations based on actual content analysis
  const recommendations = [
    'Review the retrieved content for accuracy and completeness',
    'Consider adding additional sources for broader perspective',
    'Verify key findings against primary source documents'
  ];
  
  // Add specific recommendations based on content
  const sources = [...new Set(context.map(item => item.metadata?.filename || item.metadata?.source || 'Unknown'))];
  if (sources.length === 1) {
    recommendations.unshift('Consider adding diverse sources for balanced analysis');
  }
  
  const avgScore = context.reduce((sum, item) => sum + (item.score || 0), 0) / context.length;
  if (avgScore < 0.7) {
    recommendations.unshift('Content relevance is moderate - consider refining your query');
  }
  
  return recommendations;
}

// Legacy confidence calculation (kept for backward compatibility)
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

// Initialize Enhanced RAG system
const enhancedRAG = new EnhancedRAG();

// File Upload and Processing - FIXED: Added file size validation
app.post('/api/upload', upload.array('files'), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files uploaded'
      });
    }
    
    // Validate file sizes
    const maxFileSize = 10 * 1024 * 1024; // 10MB
    for (const file of req.files) {
      if (file.size > maxFileSize) {
        return res.status(400).json({
          success: false,
          error: `File ${file.originalname} exceeds maximum size of 10MB`
        });
      }
    }
    
    const processedFiles = [];
    for (const file of req.files) {
      try {
        // Fix filename encoding issues
        let safeFilename = file.originalname;
        console.log('Original filename:', file.originalname);
        try {
          safeFilename = Buffer.from(safeFilename, 'latin1').toString('utf8');
          console.log('Decoded filename:', safeFilename);
        } catch (e) {
          console.log('Decoding failed:', e.message);
        }
        safeFilename = safeFilename.normalize('NFC');
        console.log('Final safe filename:', safeFilename);
        
        // Sanitize filename for ASCII compatibility with Pinecone
        const sanitizedFilename = sanitizeFilename(safeFilename);
        console.log('Sanitized filename for Pinecone:', sanitizedFilename);
        
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

        // Chunk content (keep existing chunking for backward compatibility)
        const chunkSize = 1000;
        const overlap = 200;
        const chunks = [];
        let i = 0;
        while (i < content.length) {
          const chunkText = content.slice(i, i + chunkSize);
          chunks.push({
            id: `${sanitizedFilename}-chunk-${i}`,
            content: chunkText,
          });
          i += chunkSize - overlap;
        }

        // Enhanced RAG: Store document with summary and full content
        console.log(`🔄 Enhanced RAG: Processing document "${safeFilename}"`);
        let enhancedRAGSuccess = false;
        let documentId = null;
        try {
          documentId = await enhancedRAG.storeDocument(content, safeFilename, chunks);
          enhancedRAGSuccess = true;
          console.log(`✅ Enhanced RAG: Successfully stored document "${safeFilename}"`);
        } catch (enhancedRAGError) {
          console.error('Enhanced RAG storage failed:', enhancedRAGError);
          console.log('Continuing with legacy chunking...');
        }

        // Index chunks in Pinecone (optional - continue even if it fails)
        console.log(`Attempting to index ${chunks.length} chunks for file: ${safeFilename}`);
        let pineconeSuccess = false;
        try {
          await indexChunksWithPinecone(chunks, { source: 'local', filename: safeFilename });
          console.log(`Successfully indexed ${chunks.length} chunks in Pinecone`);
          pineconeSuccess = true;
        } catch (pineconeError) {
          console.error('Pinecone indexing failed:', pineconeError);
          console.log('Continuing without Pinecone indexing...');
        }
        
        // Add summary record to contentIndex for dashboard visibility (always do this)
        console.log('Adding file to contentIndex for dashboard visibility');
        const fileRecord = {
          id: documentId || `${safeFilename}-${Date.now()}`,
          content: content.slice(0, 5000), // Store up to 5000 chars as preview
          metadata: {
            source: 'local',
            filename: safeFilename,
            type: file.mimetype,
            size: file.size,
            uploadedAt: new Date().toISOString(),
            chunkCount: chunks.length,
            pineconeIndexed: pineconeSuccess,
            enhancedRAGIndexed: enhancedRAGSuccess
          }
        };
        contentIndex.push(fileRecord);
        console.log('File added to contentIndex successfully');
        
        // Log activity for frontend to detect
        logActivity('upload', 'local', `Processed ${safeFilename} into ${chunks.length} chunks`, 'success');
        
        processedFiles.push({
          name: safeFilename,
          size: file.size,
          content: chunks,
          type: file.mimetype,
          error: null,
          enhancedRAGId: documentId
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

// Helper function to sanitize filename for ASCII compatibility
function sanitizeFilename(filename) {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace non-ASCII chars with underscore
    .replace(/_+/g, '_') // Replace multiple underscores with single
    .replace(/^_|_$/g, ''); // Remove leading/trailing underscores
}

// Helper function to chunk content
function chunkContent(content, filename) {
  // Sanitize filename for ASCII compatibility
  const safeFilename = sanitizeFilename(filename);
  
  // Split content into paragraphs and filter out empty ones
  const paragraphs = content
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(p => p.length > 50); // Only keep paragraphs with substantial content
  
  // If we have paragraphs, use them as chunks
  if (paragraphs.length > 0) {
    return paragraphs.map((paragraph, index) => ({
      id: `${safeFilename}-chunk-${index}`,
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
    id: `${safeFilename}-chunk-${index}`,
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
  console.log('Starting Pinecone indexing with metadata:', metadata);
  console.log('Pinecone API Key available:', !!process.env.PINECONE_API_KEY);
  console.log('Pinecone Index name:', process.env.PINECONE_INDEX || 'rag-index');
  
  try {
    for (const chunk of chunks) {
      console.log(`Processing chunk: ${chunk.id}`);
      
      // Generate embedding using OpenAI
      console.log('Generating embedding for chunk...');
      const embeddingResponse = await openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: chunk.content,
      });
      const embedding = embeddingResponse.data[0].embedding;
      console.log('Embedding generated successfully, length:', embedding.length);
      
      // Upsert to Pinecone
      console.log('Upserting to Pinecone...');
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
      console.log(`Successfully upserted chunk: ${chunk.id}`);
    }
    console.log('All chunks indexed successfully in Pinecone');
  } catch (error) {
    console.error('Error in indexChunksWithPinecone:', error);
    throw error;
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

// Real-time web search endpoint for Internet Search mode
app.post('/api/web/search', async (req, res) => {
  try {
    const { query, limit = 5 } = req.body;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query parameter is required'
      });
    }
    
    // For now, we'll use a simple web scraping approach
    // In production, you'd want to integrate with a proper search API (Google, Bing, etc.)
    
    // Search for relevant URLs (this is a simplified approach)
    const searchUrls = [
      `https://www.google.com/search?q=${encodeURIComponent(query)}`,
      `https://en.wikipedia.org/wiki/${encodeURIComponent(query.replace(/\s+/g, '_'))}`,
      `https://www.investopedia.com/search?q=${encodeURIComponent(query)}`
    ];
    
    const webResults = [];
    
    for (const url of searchUrls.slice(0, 2)) { // Limit to 2 URLs for demo
      try {
        const response = await axios.get(url, {
          timeout: 5000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        const $ = cheerio.load(response.data);
        
        // Extract relevant content
        const title = $('title').text().trim() || $('h1').first().text().trim();
        let content = '';
        
        // Try to find main content
        const mainSelectors = ['main', 'article', '.content', '.main-content', '#content'];
        for (const selector of mainSelectors) {
          const element = $(selector);
          if (element.length > 0) {
            content = element.text().trim();
            break;
          }
        }
        
        if (!content) {
          content = $('body').text().trim();
        }
        
        // Clean and limit content
        content = content
          .replace(/\s+/g, ' ')
          .replace(/\n\s*\n/g, '\n\n')
          .trim()
          .substring(0, 2000);
        
        if (content.length > 100) {
          webResults.push({
            id: `web_search_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            content: content,
            metadata: {
              source: 'web',
              url: url,
              title: title,
              searchQuery: query,
              scrapedAt: new Date().toISOString(),
              indexedAt: new Date().toISOString()
            },
            score: 0.8 // Default relevance score for web search
          });
        }
      } catch (scrapeError) {
        console.log(`Failed to scrape ${url}:`, scrapeError.message);
        // Continue with other URLs
      }
    }
    
    // If no web results found, return a fallback response
    if (webResults.length === 0) {
      return res.json({
        success: true,
        chunks: [{
          id: `web_fallback_${Date.now()}`,
          content: `No real-time web results found for "${query}". Consider adding specific web sources or checking your search terms.`,
          metadata: {
            source: 'web',
            title: 'Web Search Fallback',
            searchQuery: query,
            scrapedAt: new Date().toISOString()
          },
          score: 0.5
        }],
        message: 'Web search completed with limited results'
      });
    }
    
    res.json({
      success: true,
      chunks: webResults.slice(0, limit),
      message: `Found ${webResults.length} web results for "${query}"`
    });
    
  } catch (error) {
    console.error('Web search error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to perform web search'
    });
  }
});

// Debug endpoint to check environment variables
app.get('/api/debug/env', (req, res) => {
  res.json({
    success: true,
    env: {
      PINECONE_API_KEY: process.env.PINECONE_API_KEY ? 'SET' : 'NOT SET',
      PINECONE_INDEX: process.env.PINECONE_INDEX || 'rag-index',
      OPENAI_API_KEY: process.env.OPENAI_API_KEY ? 'SET' : 'NOT SET',
      NODE_ENV: process.env.NODE_ENV
    }
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Get uploaded files endpoint
app.get('/api/uploaded-files', (req, res) => {
  try {
    // Return files from contentIndex (in-memory storage)
    const files = contentIndex
      .filter(item => item.metadata?.source === 'local')
      .map(item => ({
        id: item.id,
        filename: item.metadata?.filename || 'Unknown',
        size: item.metadata?.size || 0,
        chunks: item.metadata?.chunkCount || 0,
        uploadedAt: item.metadata?.uploadedAt || new Date().toISOString(),
        type: item.metadata?.type || 'document',
        source: 'local',
        enhancedRAGIndexed: item.metadata?.enhancedRAGIndexed || false,
        pineconeIndexed: item.metadata?.pineconeIndexed || false
      }));
    
    res.json({
      success: true,
      files,
      total: files.length
    });
  } catch (error) {
    console.error('Error getting uploaded files:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Enhanced RAG Documents Endpoint
app.get('/api/enhanced-documents', (req, res) => {
  try {
    const documents = enhancedRAG.getAllDocuments();
    res.json({
      success: true,
      documents,
      total: documents.length
    });
  } catch (error) {
    console.error('Error getting enhanced documents:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Enhanced RAG Query Endpoint with Active RAG features
app.post('/api/enhanced-query', async (req, res) => {
  try {
    const { query, useActiveRAG = true, maxDocuments = 5 } = req.body;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query is required'
      });
    }

    console.log(`🔍 Enhanced RAG Query: "${query}"`);

    // Step 1: Multi-query generation for better retrieval
    let queries = [query];
    if (useActiveRAG) {
      try {
        const multiQueries = await generateMultiQueries(query);
        queries = [query, ...multiQueries];
        console.log(`📝 Generated ${queries.length} queries for retrieval`);
      } catch (error) {
        console.error('Multi-query generation failed:', error);
      }
    }

    // Step 2: Retrieve documents using all queries
    const allDocuments = [];
    for (const q of queries) {
      try {
        const docs = await enhancedRAG.retrieveDocuments(q, maxDocuments);
        allDocuments.push(...docs);
      } catch (error) {
        console.error(`Error retrieving documents for query "${q}":`, error);
      }
    }

    // Step 3: Deduplicate and grade documents
    const uniqueDocuments = deduplicateDocuments(allDocuments);
    console.log(`📚 Retrieved ${uniqueDocuments.length} unique documents`);

    // Step 4: Grade document relevance (Active RAG)
    let gradedDocuments = uniqueDocuments;
    if (useActiveRAG && uniqueDocuments.length > 0) {
      console.log('🎯 Grading document relevance...');
      const gradingPromises = uniqueDocuments.map(async (doc) => {
        try {
          const relevanceScore = await enhancedRAG.gradeDocumentRelevance(query, doc);
          return { ...doc, relevanceScore };
        } catch (error) {
          console.error('Error grading document:', error);
          return { ...doc, relevanceScore: 5 }; // Default score
        }
      });
      
      gradedDocuments = await Promise.all(gradingPromises);
      gradedDocuments.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
      console.log(`📊 Document relevance scores: ${gradedDocuments.map(d => `${d.filename}: ${d.relevanceScore}`).join(', ')}`);
    }

    // Step 5: Generate answer using top documents
    const topDocuments = gradedDocuments.slice(0, 3); // Use top 3 most relevant
    let answer = '';
    let hallucinationCheck = true;

    if (topDocuments.length > 0) {
      try {
        answer = await generateAnswerWithSources(query, topDocuments);
        
        // Step 6: Check for hallucinations (Active RAG)
        if (useActiveRAG) {
          console.log('🔍 Checking for hallucinations...');
          hallucinationCheck = await enhancedRAG.checkHallucinations(answer, topDocuments);
          if (!hallucinationCheck) {
            console.log('⚠️ Potential hallucination detected, regenerating answer...');
            answer = await generateAnswerWithSources(query, topDocuments, true); // Force conservative mode
          }
        }
      } catch (error) {
        console.error('Error generating answer:', error);
        answer = 'Sorry, I encountered an error while generating the answer.';
      }
    } else {
      answer = 'I could not find any relevant documents to answer your question.';
    }

    // Step 7: Prepare response with source analysis and diversity metrics
    const sourceAnalysis = sourceDiversityAnalyzer.analyzeSourceDiversity(topDocuments, query);
    const diversitySummary = sourceDiversityAnalyzer.getSourceDiversitySummary(sourceAnalysis);
    
    const response = {
      success: true,
      answer,
      sources: topDocuments.map(doc => ({
        filename: doc.filename,
        summary: doc.summary,
        relevanceScore: doc.relevanceScore,
        score: doc.score,
        type: doc.type || 'local'
      })),
      confidence: sourceAnalysis.confidence,
      sourceDiversity: {
        analysis: sourceAnalysis,
        summary: diversitySummary,
        recommendations: sourceAnalysis.recommendations,
        warnings: sourceAnalysis.warnings
      },
      metadata: {
        totalDocumentsRetrieved: uniqueDocuments.length,
        queriesUsed: queries,
        hallucinationCheck: hallucinationCheck,
        enhancedRAGEnabled: useActiveRAG,
        sourceTypes: sourceAnalysis.metrics.sourceTypes,
        primarySources: sourceAnalysis.metrics.primarySources,
        secondarySources: sourceAnalysis.metrics.secondarySources,
        regulatorySources: sourceAnalysis.metrics.regulatorySources,
        competitiveSources: sourceAnalysis.metrics.competitiveSources,
        technicalSources: sourceAnalysis.metrics.technicalSources
      }
    };

    console.log(`✅ Enhanced RAG Query completed successfully`);
    res.json(response);

  } catch (error) {
    console.error('Enhanced RAG Query error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Helper function to generate multiple queries for better retrieval
async function generateMultiQueries(originalQuery) {
  try {
    const prompt = `Generate 3 different ways to search for information related to this query. 
    Each query should focus on different aspects or use different terminology.
    
    Original Query: ${originalQuery}
    
    Generate 3 alternative queries:
    1. 
    2. 
    3.`;
    
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 200,
      temperature: 0.7
    });
    
    const content = response.choices[0].message.content;
    const queries = content.split('\n')
      .filter(line => line.match(/^\d+\./))
      .map(line => line.replace(/^\d+\.\s*/, '').trim())
      .filter(q => q.length > 0);
    
    return queries.slice(0, 3); // Return max 3 queries
  } catch (error) {
    console.error('Error generating multi-queries:', error);
    return [];
  }
}

// Helper function to deduplicate documents
function deduplicateDocuments(documents) {
  const seen = new Set();
  return documents.filter(doc => {
    const key = doc.id || doc.filename;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

// Helper function to generate answer with sources
async function generateAnswerWithSources(query, documents, conservativeMode = false) {
  try {
    const context = documents.map(doc => 
      `Document: ${doc.filename}\nContent: ${doc.summary || doc.content}\n---`
    ).join('\n');
    
    const prompt = conservativeMode 
      ? `Answer the question based ONLY on the provided documents. If the documents don't contain enough information to answer the question, say "I don't have enough information to answer this question."
      
      Question: ${query}
      
      Documents:
      ${context}
      
      Answer (be conservative and only use information from the documents):`
      : `Answer the question based on the provided documents. Be helpful and comprehensive.
      
      Question: ${query}
      
      Documents:
      ${context}
      
      Answer:`;
    
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1000,
      temperature: 0.3
    });
    
    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error generating answer:', error);
    throw error;
  }
}

// AI-Powered Synthesis for high-quality deliverables
async function generateAISynthesizedDeliverable(query, retrievedChunks, sources, deliverableType = 'executive_summary') {
  try {
    console.log(`🤖 Generating AI-synthesized ${deliverableType} deliverable...`);
    
    // Prepare context from retrieved chunks
    const contextText = retrievedChunks.map((chunk, index) => 
      `[Source ${index + 1} - ${chunk.metadata?.filename || 'Unknown'}] ${chunk.content}`
    ).join('\n\n');
    
    // Create source mapping for citations
    const sourceMapping = retrievedChunks.map((chunk, index) => ({
      citation: `[${index + 1}]`,
      source: chunk.metadata?.filename || 'Unknown',
      score: chunk.score || 0
    }));
    
    // Define output format based on deliverable type
    const formatInstructions = {
      executive_summary: "Create a concise executive summary (2-3 paragraphs) that synthesizes the key findings into clear, actionable insights. Use bullet points for key takeaways.",
      detailed_report: "Create a comprehensive report with clear sections: Executive Summary, Key Findings, Analysis, and Recommendations. Include specific data points and examples.",
      faq: "Create a FAQ-style deliverable addressing the most important questions related to the query. Each answer should be 2-3 sentences with supporting evidence.",
      slide_deck: "Create content suitable for presentation slides with clear headings, bullet points, and key metrics. Focus on visual-friendly content structure."
    };
    
    const formatInstruction = formatInstructions[deliverableType] || formatInstructions.executive_summary;
    
    // Create the synthesis prompt
    const synthesisPrompt = `You are an expert analyst creating a high-quality deliverable based on retrieved document content.

QUERY: "${query}"

RETRIEVED CONTENT:
${contextText}

INSTRUCTIONS:
1. Create a ${deliverableType} that directly answers the query
2. Synthesize information from the retrieved content into a coherent, natural narrative
3. Maintain strict source grounding - only use information from the provided content
4. Include citations [1], [2], etc. to reference specific sources
5. If information is missing or unclear, acknowledge limitations
6. ${formatInstruction}
7. Ensure the tone is professional and actionable

IMPORTANT: Only use information from the provided content. Do not add external knowledge or assumptions.`;

    // Generate the synthesis using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert business analyst who creates clear, accurate, and actionable deliverables based on provided source material. Always maintain source grounding and cite your sources."
        },
        {
          role: "user",
          content: synthesisPrompt
        }
      ],
      temperature: 0.3, // Lower temperature for more consistent, grounded output
      max_tokens: 1500
    });

    const synthesizedContent = completion.choices[0].message.content;
    
    // Extract key insights and metrics
    const insights = await extractKeyInsights(synthesizedContent, retrievedChunks);
    
    console.log(`✅ AI synthesis completed for ${deliverableType}`);
    
    return {
      content: synthesizedContent,
      sourceMapping,
      insights,
      deliverableType,
      confidence: calculateSynthesisConfidence(retrievedChunks, sources),
      wordCount: synthesizedContent.split(' ').length,
      processingTime: Date.now()
    };
    
  } catch (error) {
    console.error('Error in AI synthesis:', error);
    // Fallback to chunk-based approach
    return generateChunkBasedDeliverable(query, retrievedChunks, sources);
  }
}

// Extract key insights from synthesized content
async function extractKeyInsights(content, chunks) {
  try {
    const insightPrompt = `Extract 3-5 key insights from this content. Focus on:
1. Strategic implications
2. Key data points or metrics
3. Important trends or patterns
4. Actionable recommendations

Content: ${content}

Format as a numbered list with brief explanations.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You extract key business insights from content." },
        { role: "user", content: insightPrompt }
      ],
      temperature: 0.2,
      max_tokens: 500
    });

    return completion.choices[0].message.content.split('\n').filter(line => line.trim());
  } catch (error) {
    console.error('Error extracting insights:', error);
    return ['Analysis completed successfully', 'Content synthesized from retrieved sources'];
  }
}

// Calculate confidence for AI synthesis
function calculateSynthesisConfidence(chunks, sources) {
  const avgScore = chunks.reduce((sum, chunk) => sum + (chunk.score || 0), 0) / chunks.length;
  const sourceDiversity = sources.length;
  const chunkCount = chunks.length;
  
  // Base confidence on relevance scores and source diversity
  let confidence = (avgScore * 0.6) + (Math.min(sourceDiversity / 3, 1) * 0.3) + (Math.min(chunkCount / 5, 1) * 0.1);
  
  return Math.round(confidence * 100);
}

// Fallback chunk-based deliverable generation
function generateChunkBasedDeliverable(query, chunks, sources) {
  const sourceMapping = chunks.map((chunk, index) => ({
    citation: `[${index + 1}]`,
    source: chunk.metadata?.filename || 'Unknown',
    score: chunk.score || 0
  }));
  
  const content = chunks.slice(0, 3).map((chunk, index) => 
    `[${index + 1}] ${chunk.content.substring(0, 200)}...`
  ).join('\n\n');
  
  return {
    content: `Based on analysis of ${chunks.length} relevant content chunks:\n\n${content}`,
    sourceMapping,
    insights: [`Analysis based on ${chunks.length} content chunks`, `Sources: ${sources.join(', ')}`],
    deliverableType: 'chunk_based',
    confidence: Math.round(chunks.reduce((sum, chunk) => sum + (chunk.score || 0), 0) / chunks.length * 100),
    wordCount: content.split(' ').length,
    processingTime: Date.now()
  };
}

// Multi-format deliverable generation endpoint
app.post('/api/rag/multi-format', async (req, res) => {
  try {
    const { query, context, sources } = req.body;
    
    console.log('🔄 Multi-format deliverable generation:', { query, contextLength: context?.length, sources });
    
    if (!query || !context || !Array.isArray(context)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: query, context' 
      });
    }

    const deliverableTypes = ['executive_summary', 'detailed_report', 'faq', 'slide_deck'];
    const results = {};

    // Generate all deliverable formats in parallel
    const promises = deliverableTypes.map(async (type) => {
      try {
        const result = await generateAISynthesizedDeliverable(query, context, sources, type);
        return { type, result };
      } catch (error) {
        console.error(`Error generating ${type}:`, error);
        return { type, error: error.message };
      }
    });

    const formatResults = await Promise.all(promises);
    
    // Organize results
    formatResults.forEach(({ type, result, error }) => {
      if (error) {
        results[type] = { error };
      } else {
        results[type] = result;
      }
    });

    // Get source diversity analysis
    const diversityAnalysis = sourceDiversityAnalyzer.analyzeSources(context, sources);
    const diversitySummary = sourceDiversityAnalyzer.getSourceDiversitySummary(diversityAnalysis);

    const response = {
      success: true,
      formats: results,
      metadata: {
        query,
        sourcesUsed: sources.length,
        processingTime: Date.now(),
        diversityAnalysis: {
          confidence: diversitySummary.confidence,
          totalSources: diversitySummary.totalSources,
          sourceTypes: diversitySummary.sourceTypes,
          warnings: diversitySummary.warnings || [],
          recommendations: diversitySummary.recommendations || []
        }
      }
    };

    console.log('✅ Multi-format generation completed');
    res.json(response);
    
  } catch (error) {
    console.error('Multi-format generation error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Multi-format generation failed',
      details: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔗 API base: http://localhost:${PORT}/api`);
}); 