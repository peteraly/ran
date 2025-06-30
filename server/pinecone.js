const { Pinecone } = require('@pinecone-database/pinecone');

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
  environment: process.env.PINECONE_ENVIRONMENT || 'gcp-starter'
});

const index = pinecone.Index(process.env.PINECONE_INDEX || 'rag-index');

module.exports = { pinecone, index }; 