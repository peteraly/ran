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

// Content Retrieval
app.post('/api/retrieve', async (req, res) => {
  try {
    const { query, sources = [], limit = 10 } = req.body;
    
    // Simple text-based search (replace with vector similarity search)
    const results = contentIndex
      .filter(item => {
        if (sources.length > 0 && !sources.includes(item.metadata.source)) {
          return false;
        }
        return item.content.toLowerCase().includes(query.toLowerCase());
      })
      .slice(0, limit)
      .map(item => ({
        id: item.id,
        title: item.metadata.filename || item.metadata.title || 'Untitled',
        content: Array.isArray(item.content) 
          ? item.content.map(chunk => chunk.content).join(' ')
          : item.content,
        source: item.metadata.source,
        timestamp: item.metadata.indexedAt,
        score: 0.8 // Mock relevance score
      }));
    
    res.json({
      success: true,
      results,
      total: results.length
    });
  } catch (error) {
    console.error('Content retrieval error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve content'
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

// Source Sync Endpoints
app.post('/api/sync/:provider', async (req, res) => {
  try {
    const { provider } = req.params;
    const { tokens } = req.body;
    
    // TODO: Implement provider-specific sync logic
    // For now, return mock sync data
    const mockSyncData = {
      provider,
      syncedAt: new Date().toISOString(),
      itemsProcessed: Math.floor(Math.random() * 100) + 10,
      status: 'completed'
    };
    
    res.json({
      success: true,
      ...mockSyncData
    });
  } catch (error) {
    console.error('Source sync error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to sync source'
    });
  }
});

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