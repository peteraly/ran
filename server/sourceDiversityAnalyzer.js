// Source Diversity Analyzer
// Enhanced confidence scoring with source diversity analysis

class SourceDiversityAnalyzer {
  constructor() {
    this.sourceTypes = {
      primary: ['local', 'official', 'direct'],
      secondary: ['web', 'news', 'blog', 'article'],
      regulatory: ['government', 'regulatory', 'legal', 'compliance'],
      competitive: ['competitor', 'market', 'industry'],
      technical: ['technical', 'implementation', 'api', 'documentation'],
      academic: ['research', 'academic', 'paper', 'study'],
      social: ['social', 'community', 'forum', 'discussion']
    };
    
    this.recommendedSourceCounts = {
      low: 2,
      medium: 4,
      high: 6,
      comprehensive: 8
    };
  }

  // Analyze source diversity and calculate enhanced confidence
  analyzeSourceDiversity(sources, query) {
    if (!sources || sources.length === 0) {
      return {
        confidence: 0.1,
        diversity: 0,
        sourceBreakdown: {},
        recommendations: ['Add at least 2 sources for basic confidence'],
        warnings: ['No sources available']
      };
    }

    const sourceBreakdown = this.categorizeSources(sources);
    const diversityScore = this.calculateDiversityScore(sourceBreakdown);
    const baseConfidence = this.calculateBaseConfidence(sources);
    const diversityPenalty = this.calculateDiversityPenalty(sourceBreakdown);
    const finalConfidence = this.applyConfidencePenalties(baseConfidence, diversityPenalty);
    
    const recommendations = this.generateRecommendations(sourceBreakdown, query);
    const warnings = this.generateWarnings(sourceBreakdown, finalConfidence);

    return {
      confidence: Math.min(finalConfidence, 0.85), // Cap at 85% for any single query
      diversity: diversityScore,
      sourceBreakdown,
      recommendations,
      warnings,
      metrics: {
        totalSources: sources.length,
        sourceTypes: Object.keys(sourceBreakdown).length,
        primarySources: sourceBreakdown.primary?.length || 0,
        secondarySources: sourceBreakdown.secondary?.length || 0,
        regulatorySources: sourceBreakdown.regulatory?.length || 0,
        competitiveSources: sourceBreakdown.competitive?.length || 0,
        technicalSources: sourceBreakdown.technical?.length || 0
      }
    };
  }

  // Categorize sources by type
  categorizeSources(sources) {
    const breakdown = {};
    
    sources.forEach(source => {
      const sourceType = this.determineSourceType(source);
      if (!breakdown[sourceType]) {
        breakdown[sourceType] = [];
      }
      breakdown[sourceType].push(source);
    });

    return breakdown;
  }

  // Determine source type based on metadata and content
  determineSourceType(source) {
    const filename = source.filename || source.name || '';
    const content = source.content || source.summary || '';
    const type = source.type || '';
    const url = source.url || '';

    // Check for regulatory/government sources
    if (this.matchesPattern(filename, content, url, ['government', 'regulatory', 'legal', 'compliance', 'sec', 'fed'])) {
      return 'regulatory';
    }

    // Check for primary/official sources
    if (this.matchesPattern(filename, content, url, ['official', 'direct', 'primary', 'corporate'])) {
      return 'primary';
    }

    // Check for competitive/market sources
    if (this.matchesPattern(filename, content, url, ['competitor', 'market', 'industry', 'analysis', 'report'])) {
      return 'competitive';
    }

    // Check for technical sources
    if (this.matchesPattern(filename, content, url, ['technical', 'implementation', 'api', 'documentation', 'code'])) {
      return 'technical';
    }

    // Check for academic sources
    if (this.matchesPattern(filename, content, url, ['research', 'academic', 'paper', 'study', 'journal'])) {
      return 'academic';
    }

    // Check for social/community sources
    if (this.matchesPattern(filename, content, url, ['social', 'community', 'forum', 'discussion', 'reddit'])) {
      return 'social';
    }

    // Default to secondary for web sources, primary for local files
    return type === 'local' ? 'primary' : 'secondary';
  }

  // Check if source matches any patterns
  matchesPattern(filename, content, url, patterns) {
    const text = `${filename} ${content} ${url}`.toLowerCase();
    return patterns.some(pattern => text.includes(pattern));
  }

  // Calculate diversity score (0-1)
  calculateDiversityScore(sourceBreakdown) {
    const sourceTypes = Object.keys(sourceBreakdown).length;
    const totalSources = Object.values(sourceBreakdown).reduce((sum, sources) => sum + sources.length, 0);
    
    // Diversity increases with more source types and balanced distribution
    const typeDiversity = Math.min(sourceTypes / 5, 1); // Max 5 source types
    const distributionBalance = this.calculateDistributionBalance(sourceBreakdown);
    
    return (typeDiversity * 0.6) + (distributionBalance * 0.4);
  }

  // Calculate how evenly distributed sources are across types
  calculateDistributionBalance(sourceBreakdown) {
    const totalSources = Object.values(sourceBreakdown).reduce((sum, sources) => sum + sources.length, 0);
    if (totalSources === 0) return 0;

    const expectedPerType = totalSources / Object.keys(sourceBreakdown).length;
    const variance = Object.values(sourceBreakdown).reduce((sum, sources) => {
      return sum + Math.pow(sources.length - expectedPerType, 2);
    }, 0) / Object.keys(sourceBreakdown).length;

    // Lower variance = more balanced distribution
    return Math.max(0, 1 - (variance / Math.pow(expectedPerType, 2)));
  }

  // Calculate base confidence from source relevance scores
  calculateBaseConfidence(sources) {
    if (sources.length === 0) return 0.1;
    
    const avgScore = sources.reduce((sum, source) => sum + (source.score || 0.5), 0) / sources.length;
    const recency = this.calculateRecencyScore(sources);
    
    return (avgScore * 0.7) + (recency * 0.3);
  }

  // Calculate recency score based on source timestamps
  calculateRecencyScore(sources) {
    const now = Date.now();
    const recentSources = sources.filter(source => {
      const timestamp = source.timestamp || source.date || now;
      const daysSince = (now - new Date(timestamp).getTime()) / (1000 * 60 * 60 * 24);
      return daysSince < 30; // Consider sources from last 30 days as recent
    });
    
    return recentSources.length / sources.length;
  }

  // Calculate diversity penalty
  calculateDiversityPenalty(sourceBreakdown) {
    const totalSources = Object.values(sourceBreakdown).reduce((sum, sources) => sum + sources.length, 0);
    const sourceTypes = Object.keys(sourceBreakdown).length;
    
    // Penalty for too few sources
    const sourceCountPenalty = Math.max(0, (3 - totalSources) * 0.15);
    
    // Penalty for too few source types
    const typeDiversityPenalty = Math.max(0, (3 - sourceTypes) * 0.1);
    
    // Penalty for over-reliance on single source type
    const singleTypePenalty = this.calculateSingleTypePenalty(sourceBreakdown);
    
    return sourceCountPenalty + typeDiversityPenalty + singleTypePenalty;
  }

  // Calculate penalty for over-reliance on single source type
  calculateSingleTypePenalty(sourceBreakdown) {
    const totalSources = Object.values(sourceBreakdown).reduce((sum, sources) => sum + sources.length, 0);
    if (totalSources === 0) return 0;

    const maxSourcesInType = Math.max(...Object.values(sourceBreakdown).map(sources => sources.length));
    const singleTypeRatio = maxSourcesInType / totalSources;
    
    // Penalty increases as single type dominates
    return singleTypeRatio > 0.7 ? (singleTypeRatio - 0.7) * 0.3 : 0;
  }

  // Apply confidence penalties
  applyConfidencePenalties(baseConfidence, diversityPenalty) {
    return Math.max(0.1, baseConfidence - diversityPenalty);
  }

  // Generate recommendations for improving source diversity
  generateRecommendations(sourceBreakdown, query) {
    const recommendations = [];
    const totalSources = Object.values(sourceBreakdown).reduce((sum, sources) => sum + sources.length, 0);
    
    // Check for missing source types
    const missingTypes = this.identifyMissingSourceTypes(sourceBreakdown, query);
    missingTypes.forEach(type => {
      recommendations.push(`Add ${type} sources for comprehensive coverage`);
    });
    
    // Check for insufficient sources
    if (totalSources < 3) {
      recommendations.push('Add at least 2-3 more sources for higher confidence');
    }
    
    // Check for over-reliance on single source type
    const dominantType = this.findDominantSourceType(sourceBreakdown);
    if (dominantType) {
      recommendations.push(`Consider adding sources from other perspectives beyond ${dominantType}`);
    }
    
    return recommendations;
  }

  // Identify missing source types based on query
  identifyMissingSourceTypes(sourceBreakdown, query) {
    const queryLower = query.toLowerCase();
    const missingTypes = [];
    
    // Check for regulatory sources for compliance-related queries
    if (this.matchesQuery(queryLower, ['regulation', 'compliance', 'legal', 'policy'])) {
      if (!sourceBreakdown.regulatory) {
        missingTypes.push('regulatory');
      }
    }
    
    // Check for competitive sources for market-related queries
    if (this.matchesQuery(queryLower, ['competitor', 'market', 'industry', 'strategy'])) {
      if (!sourceBreakdown.competitive) {
        missingTypes.push('competitive');
      }
    }
    
    // Check for technical sources for implementation queries
    if (this.matchesQuery(queryLower, ['implementation', 'technical', 'api', 'integration'])) {
      if (!sourceBreakdown.technical) {
        missingTypes.push('technical');
      }
    }
    
    // Always recommend multiple source types
    if (Object.keys(sourceBreakdown).length < 2) {
      missingTypes.push('secondary');
    }
    
    return [...new Set(missingTypes)];
  }

  // Check if query matches patterns
  matchesQuery(query, patterns) {
    return patterns.some(pattern => query.includes(pattern));
  }

  // Find dominant source type
  findDominantSourceType(sourceBreakdown) {
    const totalSources = Object.values(sourceBreakdown).reduce((sum, sources) => sum + sources.length, 0);
    if (totalSources === 0) return null;

    for (const [type, sources] of Object.entries(sourceBreakdown)) {
      if (sources.length / totalSources > 0.7) {
        return type;
      }
    }
    
    return null;
  }

  // Generate warnings for low confidence or poor diversity
  generateWarnings(sourceBreakdown, confidence) {
    const warnings = [];
    const totalSources = Object.values(sourceBreakdown).reduce((sum, sources) => sum + sources.length, 0);
    
    if (confidence < 0.3) {
      warnings.push('Low confidence - consider adding more diverse sources');
    }
    
    if (totalSources === 1) {
      warnings.push('Single source response - limited perspective');
    }
    
    if (totalSources < 3) {
      warnings.push('Limited source diversity may affect comprehensiveness');
    }
    
    return warnings;
  }

  // Get source diversity summary for UI
  getSourceDiversitySummary(analysis) {
    const { sourceBreakdown, metrics, confidence } = analysis;
    
    return {
      confidence: Math.round(confidence * 100),
      confidenceLabel: this.getConfidenceLabel(confidence),
      confidenceColor: this.getConfidenceColor(confidence),
      sourceCount: metrics.totalSources,
      sourceTypes: metrics.sourceTypes,
      diversityIndicator: this.getDiversityIndicator(metrics.sourceTypes),
      sourceBreakdown: Object.entries(sourceBreakdown).map(([type, sources]) => ({
        type,
        count: sources.length,
        percentage: Math.round((sources.length / metrics.totalSources) * 100)
      }))
    };
  }

  // Get confidence label
  getConfidenceLabel(confidence) {
    if (confidence >= 0.8) return 'High Confidence';
    if (confidence >= 0.6) return 'Medium Confidence';
    if (confidence >= 0.4) return 'Low Confidence';
    return 'Very Low Confidence';
  }

  // Get confidence color
  getConfidenceColor(confidence) {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-100';
    if (confidence >= 0.4) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  }

  // Get diversity indicator
  getDiversityIndicator(sourceTypes) {
    if (sourceTypes >= 5) return { label: 'Excellent Diversity', color: 'text-green-600', icon: '🟢' };
    if (sourceTypes >= 3) return { label: 'Good Diversity', color: 'text-yellow-600', icon: '🟡' };
    if (sourceTypes >= 2) return { label: 'Limited Diversity', color: 'text-orange-600', icon: '🟠' };
    return { label: 'Poor Diversity', color: 'text-red-600', icon: '🔴' };
  }
}

module.exports = SourceDiversityAnalyzer; 