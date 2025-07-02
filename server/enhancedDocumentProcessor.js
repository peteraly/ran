// Enhanced Document Processor for Large Files and Complex Documents
// Handles books, large PDFs, and complex documents with intelligent chunking

const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const natural = require('natural');

class EnhancedDocumentProcessor {
  constructor() {
    this.maxFileSize = 50 * 1024 * 1024; // 50MB limit for large documents
    this.chunkingStrategies = {
      smart: {
        minChunkSize: 800,
        maxChunkSize: 2000,
        overlap: 200,
        preserveStructure: true
      },
      semantic: {
        minChunkSize: 1000,
        maxChunkSize: 3000,
        overlap: 300,
        preserveStructure: true
      },
      book: {
        minChunkSize: 1500,
        maxChunkSize: 4000,
        overlap: 400,
        preserveStructure: true,
        chapterAware: true
      }
    };
  }

  // Process large documents with intelligent chunking
  async processLargeDocument(fileBuffer, filename, fileType) {
    try {
      console.log(`📚 Processing large document: ${filename} (${(fileBuffer.length / 1024 / 1024).toFixed(2)}MB)`);
      
      // Extract content based on file type
      const content = await this.extractContent(fileBuffer, fileType);
      
      // Analyze document structure
      const structure = this.analyzeDocumentStructure(content, filename);
      
      // Choose appropriate chunking strategy
      const strategy = this.selectChunkingStrategy(structure, fileBuffer.length);
      
      // Create intelligent chunks
      const chunks = this.createIntelligentChunks(content, structure, strategy);
      
      // Generate document summary
      const summary = await this.generateDocumentSummary(content, structure);
      
      // Create metadata
      const metadata = {
        filename,
        fileType,
        fileSize: fileBuffer.length,
        structure,
        chunkCount: chunks.length,
        strategy: strategy.name,
        summary,
        processedAt: new Date().toISOString()
      };
      
      console.log(`✅ Processed ${filename}: ${chunks.length} chunks using ${strategy.name} strategy`);
      
      return {
        content,
        chunks,
        metadata,
        structure
      };
    } catch (error) {
      console.error(`❌ Error processing large document ${filename}:`, error);
      throw error;
    }
  }

  // Extract content from different file types
  async extractContent(fileBuffer, fileType) {
    switch (fileType) {
      case 'application/pdf':
        const pdfData = await pdfParse(fileBuffer);
        return pdfData.text;
      
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        const docxData = await mammoth.extractRawText({ buffer: fileBuffer });
        return docxData.value;
      
      case 'text/plain':
      case 'text/markdown':
        return fileBuffer.toString('utf-8');
      
      default:
        throw new Error(`Unsupported file type: ${fileType}`);
    }
  }

  // Analyze document structure
  analyzeDocumentStructure(content, filename) {
    const structure = {
      type: 'unknown',
      hasChapters: false,
      hasSections: false,
      hasHeaders: false,
      estimatedPages: 0,
      complexity: 'medium'
    };

    // Detect document type
    if (content.length > 50000) {
      structure.type = 'book';
      structure.hasChapters = this.detectChapters(content);
    } else if (content.length > 20000) {
      structure.type = 'report';
      structure.hasSections = this.detectSections(content);
    } else {
      structure.type = 'document';
    }

    // Detect headers and structure
    structure.hasHeaders = this.detectHeaders(content);
    
    // Estimate pages (rough calculation)
    structure.estimatedPages = Math.ceil(content.length / 3000);
    
    // Assess complexity
    structure.complexity = this.assessComplexity(content);
    
    return structure;
  }

  // Detect chapter structure
  detectChapters(content) {
    const chapterPatterns = [
      /^Chapter\s+\d+/im,
      /^CHAPTER\s+\d+/im,
      /^\d+\.\s+[A-Z]/gm,
      /^[A-Z][A-Z\s]{3,}$/gm
    ];
    
    return chapterPatterns.some(pattern => pattern.test(content));
  }

  // Detect section structure
  detectSections(content) {
    const sectionPatterns = [
      /^[A-Z][A-Z\s]{2,}$/gm,
      /^\d+\.\d+\s+[A-Z]/gm,
      /^[A-Z][a-z]+\s+[A-Z]/gm
    ];
    
    return sectionPatterns.some(pattern => pattern.test(content));
  }

  // Detect headers
  detectHeaders(content) {
    const headerPatterns = [
      /^[A-Z][A-Z\s]{3,}$/gm,
      /^[A-Z][a-z]+\s+[A-Z]/gm,
      /^\d+\.\s+[A-Z]/gm
    ];
    
    return headerPatterns.some(pattern => pattern.test(content));
  }

  // Assess content complexity
  assessComplexity(content) {
    const sentences = content.split(/[.!?]+/).length;
    const words = content.split(/\s+/).length;
    const avgWordsPerSentence = words / sentences;
    
    if (avgWordsPerSentence > 25) return 'high';
    if (avgWordsPerSentence > 15) return 'medium';
    return 'low';
  }

  // Select appropriate chunking strategy
  selectChunkingStrategy(structure, fileSize) {
    if (structure.type === 'book' || fileSize > 10 * 1024 * 1024) {
      return { ...this.chunkingStrategies.book, name: 'book' };
    } else if (structure.hasSections || structure.complexity === 'high') {
      return { ...this.chunkingStrategies.semantic, name: 'semantic' };
    } else {
      return { ...this.chunkingStrategies.smart, name: 'smart' };
    }
  }

  // Create intelligent chunks
  createIntelligentChunks(content, structure, strategy) {
    const chunks = [];
    
    if (strategy.chapterAware && structure.hasChapters) {
      return this.createChapterAwareChunks(content, strategy);
    } else if (structure.hasSections) {
      return this.createSectionAwareChunks(content, strategy);
    } else {
      return this.createSemanticChunks(content, strategy);
    }
  }

  // Create chapter-aware chunks
  createChapterAwareChunks(content, strategy) {
    const chunks = [];
    const chapters = this.splitIntoChapters(content);
    
    chapters.forEach((chapter, chapterIndex) => {
      const chapterChunks = this.createSemanticChunks(chapter.content, strategy);
      
      chapterChunks.forEach((chunk, chunkIndex) => {
        chunks.push({
          ...chunk,
          metadata: {
            ...chunk.metadata,
            chapter: chapter.title,
            chapterIndex,
            chunkIndex
          }
        });
      });
    });
    
    return chunks;
  }

  // Split content into chapters
  splitIntoChapters(content) {
    const chapterPatterns = [
      /^Chapter\s+(\d+)/im,
      /^CHAPTER\s+(\d+)/im,
      /^(\d+)\.\s+([A-Z][A-Z\s]+)/gm
    ];
    
    const chapters = [];
    let currentChapter = { title: 'Introduction', content: '' };
    
    const lines = content.split('\n');
    
    for (const line of lines) {
      const isChapterHeader = chapterPatterns.some(pattern => pattern.test(line));
      
      if (isChapterHeader) {
        if (currentChapter.content.trim()) {
          chapters.push(currentChapter);
        }
        currentChapter = { title: line.trim(), content: '' };
      } else {
        currentChapter.content += line + '\n';
      }
    }
    
    if (currentChapter.content.trim()) {
      chapters.push(currentChapter);
    }
    
    return chapters;
  }

  // Create section-aware chunks
  createSectionAwareChunks(content, strategy) {
    const chunks = [];
    const sections = this.splitIntoSections(content);
    
    sections.forEach((section, sectionIndex) => {
      const sectionChunks = this.createSemanticChunks(section.content, strategy);
      
      sectionChunks.forEach((chunk, chunkIndex) => {
        chunks.push({
          ...chunk,
          metadata: {
            ...chunk.metadata,
            section: section.title,
            sectionIndex,
            chunkIndex
          }
        });
      });
    });
    
    return chunks;
  }

  // Split content into sections
  splitIntoSections(content) {
    const sectionPatterns = [
      /^([A-Z][A-Z\s]{2,})$/gm,
      /^(\d+\.\d+\s+[A-Z][a-z]+)/gm
    ];
    
    const sections = [];
    let currentSection = { title: 'Introduction', content: '' };
    
    const lines = content.split('\n');
    
    for (const line of lines) {
      const isSectionHeader = sectionPatterns.some(pattern => pattern.test(line));
      
      if (isSectionHeader) {
        if (currentSection.content.trim()) {
          sections.push(currentSection);
        }
        currentSection = { title: line.trim(), content: '' };
      } else {
        currentSection.content += line + '\n';
      }
    }
    
    if (currentSection.content.trim()) {
      sections.push(currentSection);
    }
    
    return sections;
  }

  // Create semantic chunks with overlap
  createSemanticChunks(content, strategy) {
    const chunks = [];
    const sentences = this.splitIntoSentences(content);
    
    let currentChunk = '';
    let chunkIndex = 0;
    
    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i];
      const potentialChunk = currentChunk + sentence + ' ';
      
      if (potentialChunk.length > strategy.maxChunkSize && currentChunk.length >= strategy.minChunkSize) {
        // Create chunk
        chunks.push({
          id: `chunk-${chunkIndex}`,
          content: currentChunk.trim(),
          metadata: {
            chunkIndex,
            chunkType: 'semantic',
            wordCount: currentChunk.split(/\s+/).length,
            sentenceCount: currentChunk.split(/[.!?]+/).length - 1
          }
        });
        
        // Start new chunk with overlap
        const overlapSentences = this.getOverlapSentences(currentChunk, strategy.overlap);
        currentChunk = overlapSentences + sentence + ' ';
        chunkIndex++;
      } else {
        currentChunk = potentialChunk;
      }
    }
    
    // Add final chunk
    if (currentChunk.trim()) {
      chunks.push({
        id: `chunk-${chunkIndex}`,
        content: currentChunk.trim(),
        metadata: {
          chunkIndex,
          chunkType: 'semantic',
          wordCount: currentChunk.split(/\s+/).length,
          sentenceCount: currentChunk.split(/[.!?]+/).length - 1
        }
      });
    }
    
    return chunks;
  }

  // Split content into sentences
  splitIntoSentences(content) {
    return content
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 10);
  }

  // Get overlap sentences for continuity
  getOverlapSentences(chunk, overlapSize) {
    const sentences = chunk.split(/[.!?]+/).filter(s => s.trim());
    const overlapSentences = [];
    let currentLength = 0;
    
    for (let i = sentences.length - 1; i >= 0; i--) {
      const sentence = sentences[i];
      if (currentLength + sentence.length > overlapSize) {
        break;
      }
      overlapSentences.unshift(sentence);
      currentLength += sentence.length;
    }
    
    return overlapSentences.join('. ') + '. ';
  }

  // Generate document summary
  async generateDocumentSummary(content, structure) {
    try {
      // For large documents, use the first and last portions
      const summaryContent = content.length > 50000 
        ? content.substring(0, 10000) + '\n\n...\n\n' + content.substring(content.length - 10000)
        : content;
      
      const summary = {
        type: structure.type,
        estimatedPages: structure.estimatedPages,
        complexity: structure.complexity,
        hasChapters: structure.hasChapters,
        hasSections: structure.hasSections,
        keyTopics: this.extractKeyTopics(content),
        mainThemes: this.extractMainThemes(content)
      };
      
      return summary;
    } catch (error) {
      console.error('Error generating document summary:', error);
      return {
        type: structure.type,
        estimatedPages: structure.estimatedPages,
        complexity: structure.complexity
      };
    }
  }

  // Extract key topics from content
  extractKeyTopics(content) {
    const words = content.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3);
    
    const wordFreq = {};
    words.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });
    
    return Object.entries(wordFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  }

  // Extract main themes
  extractMainThemes(content) {
    // Simple theme extraction based on common business terms
    const themes = [];
    const themePatterns = {
      strategy: /strategy|strategic|planning|vision|mission/gi,
      financial: /financial|revenue|profit|cost|budget/gi,
      technology: /technology|digital|software|platform|system/gi,
      market: /market|customer|competition|industry|sector/gi
    };
    
    Object.entries(themePatterns).forEach(([theme, pattern]) => {
      const matches = content.match(pattern);
      if (matches && matches.length > 3) {
        themes.push(theme);
      }
    });
    
    return themes;
  }
}

module.exports = EnhancedDocumentProcessor; 