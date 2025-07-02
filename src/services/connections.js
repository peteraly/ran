// Connection service for handling real OAuth flows and file processing

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://ran-backend-pp3x.onrender.com';

// OAuth Configuration
const OAUTH_CONFIG = {
  slack: {
    clientId: process.env.REACT_APP_SLACK_CLIENT_ID,
    redirectUri: `${window.location.origin}/auth/slack/callback`,
    scope: 'channels:read,files:read,users:read',
    authUrl: 'https://slack.com/oauth/v2/authorize'
  },
  google: {
    clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID,
    redirectUri: `${window.location.origin}/auth/google/callback`,
    scope: 'https://www.googleapis.com/auth/drive.readonly',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth'
  },
  microsoft: {
    clientId: process.env.REACT_APP_MICROSOFT_CLIENT_ID,
    redirectUri: `${window.location.origin}/auth/microsoft/callback`,
    scope: 'Mail.Read Files.Read Calendars.Read',
    authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize'
  },
  notion: {
    clientId: process.env.REACT_APP_NOTION_CLIENT_ID,
    redirectUri: `${window.location.origin}/auth/notion/callback`,
    scope: 'read',
    authUrl: 'https://api.notion.com/v1/oauth/authorize'
  }
};

// OAuth Flow Handlers
export const initiateOAuth = (provider) => {
  const config = OAUTH_CONFIG[provider];
  if (!config) {
    throw new Error(`Unsupported provider: ${provider}`);
  }

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope: config.scope,
    response_type: 'code',
    state: generateState()
  });

  // Store state for verification
  localStorage.setItem('oauth_state', params.get('state'));
  localStorage.setItem('oauth_provider', provider);

  // Redirect to OAuth provider
  window.location.href = `${config.authUrl}?${params.toString()}`;
};

export const handleOAuthCallback = async (provider, code, state) => {
  const storedState = localStorage.getItem('oauth_state');
  const storedProvider = localStorage.getItem('oauth_provider');

  if (state !== storedState || provider !== storedProvider) {
    throw new Error('OAuth state mismatch');
  }

  // Exchange code for access token
  const tokenResponse = await exchangeCodeForToken(provider, code);
  
  // Store tokens securely
  await storeTokens(provider, tokenResponse);
  
  // Clear OAuth state
  localStorage.removeItem('oauth_state');
  localStorage.removeItem('oauth_provider');

  return tokenResponse;
};

// File Processing
export const processUploadedFiles = async (files) => {
  try {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    const response = await fetch(`${API_BASE_URL}/api/upload`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Upload failed');
    }

    return result.files;
  } catch (error) {
    console.error('Error uploading files:', error);
    throw new Error(`Failed to upload files: ${error.message}`);
  }
};

// Web Content Processing
export const processWebContent = async (url) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/scrape?url=${encodeURIComponent(url)}`);
    
    if (!response.ok) {
      throw new Error(`Web scraping failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Web scraping failed');
    }
    
    return {
      id: generateFileId(),
      url,
      title: data.title,
      content: data.content,
      processedAt: new Date().toISOString()
    };
  } catch (error) {
    throw new Error(`Failed to process web content: ${error.message}`);
  }
};

// Content Indexing
export const indexContent = async (content, metadata) => {
  try {
    // TODO: Implement vector embedding and storage
    // This would integrate with a vector database like Pinecone, Weaviate, or Chroma
    
    const response = await fetch(`${API_BASE_URL}/api/index`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content,
        metadata,
        timestamp: new Date().toISOString()
      })
    });

    return await response.json();
  } catch (error) {
    throw new Error(`Failed to index content: ${error.message}`);
  }
};

// Content Retrieval
export const retrieveRelevantContent = async (query, sources = []) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/retrieve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        sources,
        limit: 10
      })
    });

    const result = await response.json();
    
    // If no chunks found and web search is enabled, try real-time web search
    if (result.success && result.chunks.length === 0 && sources.includes('web') && result.needsWebSearch) {
      console.log('No indexed web content found, attempting real-time web search...');
      
      const webSearchResponse = await fetch(`${API_BASE_URL}/api/web/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          limit: 10
        })
      });
      
      const webResult = await webSearchResponse.json();
      
      if (webResult.success) {
        return {
          success: true,
          chunks: webResult.chunks,
          message: webResult.message,
          source: 'web_search'
        };
      }
    }
    
    return result;
  } catch (error) {
    throw new Error(`Failed to retrieve content: ${error.message}`);
  }
};

// RAG Processing
export const processRagQuery = async (query, context, sources = []) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/rag/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        context,
        sources
      })
    });

    return await response.json();
  } catch (error) {
    throw new Error(`Failed to process RAG query: ${error.message}`);
  }
};

// Fallback RAG processing for when the backend RAG endpoint is not available
export const processRagQueryFallback = async (query, chunks, sources) => {
  try {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate response based on actual retrieved content instead of hardcoded mock data
    let response = {
      success: true,
      summary: [],
      insights: [],
      recommendations: [],
      confidence: 0.8,
      sourcesUsed: sources.length,
      processingTime: 2000
    };

    if (chunks && chunks.length > 0) {
      // Use actual retrieved content
      const sourcesList = [...new Set(chunks.map(chunk => chunk.metadata?.filename || chunk.metadata?.source || 'Unknown'))];
      const avgScore = chunks.reduce((sum, chunk) => sum + (chunk.score || 0), 0) / chunks.length;
      
      response.summary = [
        `Based on analysis of ${chunks.length} relevant content chunks from ${sourcesList.length} source(s):`,
        '',
        '**Key Findings from Retrieved Content:**',
        ...chunks.slice(0, 3).map((chunk, index) => 
          `• ${chunk.content.substring(0, 150)}${chunk.content.length > 150 ? '...' : ''}`
        ),
        '',
        `**Source Analysis:**`,
        `• Content relevance: ${Math.round(avgScore * 100)}%`,
        `• Sources consulted: ${sourcesList.join(', ')}`,
        `• Total chunks analyzed: ${chunks.length}`
      ];
      
      response.insights = [
        `Analysis completed using ${chunks.length} content chunks`,
        `Content relevance score: ${Math.round(avgScore * 100)}%`,
        `Sources analyzed: ${sourcesList.join(', ')}`
      ];
      
      if (chunks.length > 0) {
        const firstChunk = chunks[0];
        if (firstChunk.content) {
          response.insights.push(`Primary content focus: ${firstChunk.content.substring(0, 100)}...`);
        }
      }
      
      response.recommendations = [
        'Review the retrieved content for accuracy and completeness',
        'Consider adding additional sources for broader perspective',
        'Verify key findings against primary source documents'
      ];
      
      // Add specific recommendations based on content
      if (sourcesList.length === 1) {
        response.recommendations.unshift('Consider adding diverse sources for balanced analysis');
      }
      
      if (avgScore < 0.7) {
        response.recommendations.unshift('Content relevance is moderate - consider refining your query');
      }
      
      response.confidence = Math.min(avgScore * 0.8, 0.85); // Cap confidence for fallback
    } else {
      // No content available
      response.summary = [
        'No relevant content found to analyze.',
        'Please ensure you have uploaded documents or enabled appropriate data sources.',
        'Try rephrasing your query or adding more source documents.'
      ];
      
      response.insights = ['No content available for analysis'];
      response.recommendations = ['Add more source documents for comprehensive analysis'];
      response.confidence = 0.1;
    }
    
    return response;
  } catch (error) {
    console.error('Fallback RAG processing error:', error);
    return {
      success: false,
      error: 'Failed to process RAG query',
      summary: ['Unable to process query at this time. Please try again.']
    };
  }
};

// Utility Functions
const generateState = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

const generateFileId = () => {
  return `file_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

const exchangeCodeForToken = async (provider, code) => {
  // TODO: Implement server-side token exchange
  // This should be done server-side for security
  const response = await fetch(`${API_BASE_URL}/api/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      provider,
      code
    })
  });

  return await response.json();
};

const storeTokens = async (provider, tokenResponse) => {
  // TODO: Implement secure token storage
  // Consider using httpOnly cookies or encrypted localStorage
  localStorage.setItem(`${provider}_tokens`, JSON.stringify(tokenResponse));
};

const extractFileContent = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        let content = '';
        
        if (file.type === 'application/pdf') {
          // TODO: Implement PDF parsing with pdf-parse or similar
          content = 'PDF content extraction not yet implemented';
        } else if (file.type.includes('word') || file.name.endsWith('.docx')) {
          // TODO: Implement DOCX parsing
          content = 'Word document parsing not yet implemented';
        } else {
          content = e.target.result;
        }
        
        resolve(content);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = reject;
    reader.readAsText(file);
  });
};

const chunkContent = async (content, filename) => {
  // Simple chunking by paragraphs/sentences
  // TODO: Implement more sophisticated chunking with overlap
  const chunks = content
    .split(/\n\n+/)
    .filter(chunk => chunk.trim().length > 50)
    .map((chunk, index) => ({
      id: `${filename}_chunk_${index}`,
      content: chunk.trim(),
      metadata: {
        filename,
        chunkIndex: index,
        chunkType: 'paragraph'
      }
    }));

  return chunks;
};

// Source Management
export const getConnectedSources = () => {
  const sources = [];
  
  Object.keys(OAUTH_CONFIG).forEach(provider => {
    const tokens = localStorage.getItem(`${provider}_tokens`);
    if (tokens) {
      sources.push({
        provider,
        connected: true,
        lastSync: localStorage.getItem(`${provider}_last_sync`) || null
      });
    }
  });

  return sources;
};

export const disconnectSource = (provider) => {
  localStorage.removeItem(`${provider}_tokens`);
  localStorage.removeItem(`${provider}_last_sync`);
};

export const syncSource = async (provider) => {
  try {
    const tokens = localStorage.getItem(`${provider}_tokens`);
    if (!tokens) {
      throw new Error('No tokens found for this provider');
    }

    // TODO: Implement source-specific sync logic
    const response = await fetch(`${API_BASE_URL}/api/sync/${provider}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tokens: JSON.parse(tokens)
      })
    });

    const result = await response.json();
    
    // Update last sync time
    localStorage.setItem(`${provider}_last_sync`, new Date().toISOString());
    
    return result;
  } catch (error) {
    throw new Error(`Failed to sync ${provider}: ${error.message}`);
  }
};

// Database Connection Management
export const testDatabaseConnection = async (type, config) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/database/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type,
        config
      })
    });

    return await response.json();
  } catch (error) {
    throw new Error(`Failed to test database connection: ${error.message}`);
  }
};

export const syncDatabaseContent = async (type, config) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/sync/database/${type}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        config
      })
    });

    return await response.json();
  } catch (error) {
    throw new Error(`Failed to sync database content: ${error.message}`);
  }
};

// External API Connection Management
export const testApiConnection = async (type, config) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/external/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type,
        config
      })
    });

    return await response.json();
  } catch (error) {
    throw new Error(`Failed to test API connection: ${error.message}`);
  }
};

export const syncApiContent = async (type, config) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/sync/external/${type}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        config
      })
    });

    return await response.json();
  } catch (error) {
    throw new Error(`Failed to sync external API content: ${error.message}`);
  }
};