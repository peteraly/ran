const { OpenAI } = require('openai');
const { index } = require('./pinecone');

class EnhancedRAG {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    this.documentStore = new Map(); // In-memory document store
  }

  // Generate document summary for better retrieval
  async generateDocumentSummary(documentText, filename) {
    try {
      const prompt = `Create a comprehensive summary of this document that captures the key topics, concepts, and information. 
      This summary will be used for semantic search to find relevant documents.
      
      Document: ${documentText.substring(0, 8000)} // Limit for API
      
      Summary:`;
      
      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 500,
        temperature: 0.3
      });
      
      return response.choices[0].message.content;
    } catch (error) {
      console.error('Error generating summary:', error);
      // Fallback to first 500 characters
      return documentText.substring(0, 500);
    }
  }

  // Store document with both summary and full content
  async storeDocument(documentText, filename, chunks = []) {
    try {
      // Generate summary for retrieval
      const summary = await this.generateDocumentSummary(documentText, filename);
      
      // Store full document
      const documentId = `doc_${Date.now()}_${filename}`;
      this.documentStore.set(documentId, {
        id: documentId,
        filename,
        fullContent: documentText,
        summary,
        chunks,
        createdAt: new Date().toISOString()
      });

      // Embed and store summary for retrieval
      const summaryEmbedding = await this.embedText(summary);
      await index.upsert([{
        id: documentId,
        values: summaryEmbedding,
        metadata: {
          filename,
          type: 'summary',
          documentId,
          content: summary.substring(0, 1000) // Store truncated summary in metadata
        }
      }]);

      console.log(`✅ Enhanced RAG: Stored document "${filename}" with summary`);
      return documentId;
    } catch (error) {
      console.error('Error in enhanced RAG storage:', error);
      throw error;
    }
  }

  // Enhanced retrieval using summaries
  async retrieveDocuments(query, k = 5) {
    try {
      // Query using summary embeddings
      const queryEmbedding = await this.embedText(query);
      const results = await index.query({
        vector: queryEmbedding,
        topK: k,
        includeMetadata: true
      });

      // Retrieve full documents using document IDs
      const documents = [];
      for (const match of results.matches) {
        const documentId = match.id;
        const fullDocument = this.documentStore.get(documentId);
        
        if (fullDocument) {
          documents.push({
            ...fullDocument,
            score: match.score,
            summary: match.metadata.content
          });
        }
      }

      return documents;
    } catch (error) {
      console.error('Error in enhanced retrieval:', error);
      return [];
    }
  }

  // Embed text using OpenAI
  async embedText(text) {
    try {
      const response = await this.openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text
      });
      return response.data[0].embedding;
    } catch (error) {
      console.error('Error embedding text:', error);
      throw error;
    }
  }

  // Grade document relevance
  async gradeDocumentRelevance(query, document) {
    try {
      const prompt = `Rate the relevance of this document to the user's question.
      
      Question: ${query}
      Document Summary: ${document.summary}
      
      Rate from 1-10 where:
      1 = Not relevant at all
      10 = Highly relevant and directly answers the question
      
      Provide only the number:`;
      
      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 5,
        temperature: 0.1
      });
      
      const score = parseInt(response.choices[0].message.content) || 5;
      return score;
    } catch (error) {
      console.error('Error grading relevance:', error);
      return 5; // Default neutral score
    }
  }

  // Check for hallucinations in generated answers
  async checkHallucinations(answer, sourceDocuments) {
    try {
      const sourceContent = sourceDocuments.map(doc => doc.summary).join('\n');
      
      const prompt = `Check if this answer contains information that is NOT supported by the provided source documents.
      
      Answer: ${answer}
      Source Documents: ${sourceContent}
      
      Respond with only "HALLUCINATION" if the answer contains unsupported information, or "GROUNDED" if all information is supported.`;
      
      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 20,
        temperature: 0.1
      });
      
      const result = response.choices[0].message.content.trim();
      return result === "GROUNDED";
    } catch (error) {
      console.error('Error checking hallucinations:', error);
      return true; // Default to assuming it's grounded
    }
  }

  // Get all stored documents (for dashboard)
  getAllDocuments() {
    return Array.from(this.documentStore.values()).map(doc => ({
      id: doc.id,
      filename: doc.filename,
      summary: doc.summary,
      chunkCount: doc.chunks.length,
      createdAt: doc.createdAt
    }));
  }
}

module.exports = { EnhancedRAG }; 