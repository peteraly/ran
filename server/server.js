const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'https://ran-et6u26nn3-peteralys-projects.vercel.app',
    'https://ran-eight.vercel.app',
    'https://*.vercel.app'
  ],
  credentials: true
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

// Enhanced content retrieval with source filtering
app.post('/api/retrieve', async (req, res) => {
  try {
    const { query, sources = [], limit = 10, filters = {} } = req.body;
    
    // Enhanced search with source filtering and relevance scoring
    let results = contentIndex
      .filter(item => {
        // Filter by sources if specified
        if (sources.length > 0) {
          const itemSource = item.metadata.source;
          if (!sources.some(source => itemSource.includes(source))) {
            return false;
          }
        }
        
        // Apply additional filters
        if (filters.dateFrom && new Date(item.metadata.indexedAt) < new Date(filters.dateFrom)) {
          return false;
        }
        if (filters.dateTo && new Date(item.metadata.indexedAt) > new Date(filters.dateTo)) {
          return false;
        }
        if (filters.type && item.metadata.type !== filters.type) {
          return false;
        }
        
        return true;
      })
      .map(item => {
        // Calculate relevance score based on query matching
        const content = Array.isArray(item.content) 
          ? item.content.map(chunk => chunk.content).join(' ')
          : item.content;
        
        const queryLower = query.toLowerCase();
        const contentLower = content.toLowerCase();
        
        // Simple relevance scoring (can be enhanced with embeddings)
        let score = 0;
        const queryWords = queryLower.split(' ');
        queryWords.forEach(word => {
          if (contentLower.includes(word)) {
            score += 0.2;
          }
        });
        
        // Boost score for exact matches
        if (contentLower.includes(queryLower)) {
          score += 0.5;
        }
        
        // Boost score for recent content
        const daysSinceIndexed = (Date.now() - new Date(item.metadata.indexedAt).getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceIndexed < 1) score += 0.3;
        else if (daysSinceIndexed < 7) score += 0.1;
        
        return {
          id: item.id,
          title: item.metadata.filename || item.metadata.title || item.metadata.subject || 'Untitled',
          content: content.substring(0, 500) + (content.length > 500 ? '...' : ''),
          source: item.metadata.source,
          type: item.metadata.type,
          timestamp: item.metadata.indexedAt,
          score: Math.min(score, 1.0),
          metadata: item.metadata
        };
      })
      .filter(item => item.score > 0) // Only return relevant results
      .sort((a, b) => b.score - a.score) // Sort by relevance
      .slice(0, limit);
    
    res.json({
      success: true,
      results,
      total: results.length,
      query,
      sources,
      filters
    });
  } catch (error) {
    console.error('Content retrieval error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve content'
    });
  }
});

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
    
    // TODO: Implement proper web scraping with cheerio
    // For now, return mock data
    const mockData = {
      title: `Content from ${new URL(url).hostname}`,
      content: `This is mock content scraped from ${url}. In a real implementation, this would contain the actual content from the webpage.`,
      url: url
    };
    
    res.json({
      success: true,
      ...mockData
    });
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
          // TODO: Implement PDF parsing with pdf-parse
          content = `PDF content from ${file.originalname} (parsing not yet implemented)`;
        } else if (file.mimetype.includes('word') || file.originalname.endsWith('.docx')) {
          // TODO: Implement DOCX parsing with mammoth
          content = `Word document content from ${file.originalname} (parsing not yet implemented)`;
        } else {
          content = file.buffer.toString('utf8');
        }
        
        const processedFile = {
          id: `file_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          name: file.originalname,
          size: file.size,
          type: file.mimetype,
          content: content,
          uploadedAt: new Date().toISOString()
        };
        
        processedFiles.push(processedFile);
        
        // Index the content
        contentIndex.push({
          id: processedFile.id,
          content: content,
          metadata: {
            source: 'local',
            filename: file.originalname,
            fileType: file.mimetype,
            uploadedAt: processedFile.uploadedAt,
            indexedAt: new Date().toISOString()
          }
        });
        
      } catch (error) {
        console.error(`Error processing file ${file.originalname}:`, error);
      }
    }
    
    res.json({
      success: true,
      files: processedFiles,
      message: `Successfully processed ${processedFiles.length} file(s)`
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process uploaded files'
    });
  }
});

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