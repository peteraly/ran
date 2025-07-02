// Writing Style Guide System for Enhanced Deliverable Quality
// This system provides AI with specific guidelines, templates, and quality standards

class WritingStyleGuide {
  constructor() {
    this.guidelines = {
      executive_summary: {
        structure: [
          "Executive Summary Structure:",
          "1. Key Findings (2-3 bullet points)",
          "2. Strategic Implications (1-2 paragraphs)",
          "3. Recommendations (2-3 actionable items)",
          "4. Risk Assessment (if applicable)"
        ],
        tone: "Professional, concise, actionable",
        length: "200-400 words",
        formatting: "Use bullet points for key findings, bold for emphasis",
        quality_standards: [
          "Each claim must be supported by source evidence",
          "Avoid jargon - explain technical terms",
          "Lead with the most important information",
          "End with clear next steps"
        ]
      },
      detailed_report: {
        structure: [
          "Detailed Report Structure:",
          "1. Executive Summary (1 paragraph)",
          "2. Background & Context",
          "3. Methodology & Sources",
          "4. Key Findings (with data)",
          "5. Analysis & Implications",
          "6. Recommendations",
          "7. Risk Factors",
          "8. Appendices (if needed)"
        ],
        tone: "Analytical, thorough, evidence-based",
        length: "800-2000 words",
        formatting: "Use headings, subheadings, bullet points, and numbered lists",
        quality_standards: [
          "Every claim must be cited with source [1], [2], etc.",
          "Include specific data points and metrics",
          "Present multiple perspectives when available",
          "Acknowledge limitations and uncertainties"
        ]
      },
      faq: {
        structure: [
          "FAQ Structure:",
          "1. Most Important Questions First",
          "2. 2-3 sentence answers with evidence",
          "3. Group related questions together",
          "4. Include 'What if' scenarios"
        ],
        tone: "Clear, direct, helpful",
        length: "300-600 words",
        formatting: "Q: Question\nA: Answer with supporting evidence",
        quality_standards: [
          "Answer the question directly in the first sentence",
          "Provide supporting evidence from sources",
          "Use simple, clear language",
          "Address common concerns and misconceptions"
        ]
      },
      slide_deck: {
        structure: [
          "Slide Deck Structure:",
          "1. Title Slide with Key Message",
          "2. Agenda/Overview",
          "3. Key Findings (3-5 slides)",
          "4. Analysis & Implications",
          "5. Recommendations",
          "6. Next Steps"
        ],
        tone: "Visual, engaging, memorable",
        length: "5-10 slides worth of content",
        formatting: "Use bullet points, key metrics, and clear headings",
        quality_standards: [
          "Each slide should have one main message",
          "Use data and metrics to support points",
          "Make content visually scannable",
          "Include source citations for credibility"
        ]
      }
    };

    this.qualityStandards = {
      general: [
        "Always cite sources using [1], [2], etc. format",
        "Maintain source grounding - only use provided content",
        "Acknowledge limitations and uncertainties",
        "Use clear, professional language",
        "Structure information logically",
        "Provide actionable insights"
      ],
      evidence: [
        "Use direct quotes for key claims",
        "Include specific data points and metrics",
        "Reference multiple sources when possible",
        "Distinguish between facts and opinions",
        "Acknowledge conflicting information"
      ],
      reasoning: [
        "Explain the logic behind conclusions",
        "Show the connection between evidence and claims",
        "Consider alternative explanations",
        "Assess confidence levels for each claim",
        "Identify gaps in available information"
      ]
    };

    this.templates = {
      executive_summary: `# Executive Summary

## Key Findings
• [Key finding 1 with source citation]
• [Key finding 2 with source citation]
• [Key finding 3 with source citation]

## Strategic Implications
[2-3 sentences explaining the strategic significance of findings]

## Recommendations
1. [Specific, actionable recommendation]
2. [Specific, actionable recommendation]
3. [Specific, actionable recommendation]

## Risk Assessment
[If applicable, brief assessment of risks or limitations]`,

      detailed_report: `# [Report Title]

## Executive Summary
[1 paragraph overview of key findings and recommendations]

## Background & Context
[Provide necessary background information]

## Methodology & Sources
This analysis is based on [number] sources including [list sources]. The methodology involved [brief description of approach].

## Key Findings
### Finding 1: [Title]
[Detailed finding with supporting evidence and citations]

### Finding 2: [Title]
[Detailed finding with supporting evidence and citations]

## Analysis & Implications
[Analysis of findings and their implications]

## Recommendations
1. [Detailed recommendation with rationale]
2. [Detailed recommendation with rationale]
3. [Detailed recommendation with rationale]

## Risk Factors
[Assessment of risks, limitations, and uncertainties]`,

      faq: `# Frequently Asked Questions

**Q: [Most important question]**
A: [Direct answer with supporting evidence from sources]

**Q: [Second most important question]**
A: [Direct answer with supporting evidence from sources]

**Q: [Third most important question]**
A: [Direct answer with supporting evidence from sources]`,

      slide_deck: `# Slide Content Structure

## Slide 1: Title
**Key Message:** [Main takeaway]

## Slide 2: Agenda
• [Agenda item 1]
• [Agenda item 2]
• [Agenda item 3]

## Slide 3: Key Finding 1
**Headline:** [Finding]
• [Supporting point with data]
• [Supporting point with data]
• [Source: [1]]

## Slide 4: Key Finding 2
**Headline:** [Finding]
• [Supporting point with data]
• [Supporting point with data]
• [Source: [2]]

## Slide 5: Recommendations
• [Recommendation 1]
• [Recommendation 2]
• [Recommendation 3]

## Slide 6: Next Steps
• [Next step 1]
• [Next step 2]
• [Next step 3]`
    };
  }

  // Get guidelines for specific deliverable type
  getGuidelines(deliverableType) {
    return this.guidelines[deliverableType] || this.guidelines.executive_summary;
  }

  // Get quality standards
  getQualityStandards() {
    return this.qualityStandards;
  }

  // Get template for specific deliverable type
  getTemplate(deliverableType) {
    return this.templates[deliverableType] || this.templates.executive_summary;
  }

  // Generate enhanced prompt with style guide
  generateEnhancedPrompt(query, deliverableType, contextText) {
    const guidelines = this.getGuidelines(deliverableType);
    const qualityStandards = this.getQualityStandards();
    
    return `You are an expert business analyst creating a high-quality ${deliverableType} based on retrieved document content. Follow these specific guidelines:

QUERY: "${query}"

RETRIEVED CONTENT:
${contextText}

DELIVERABLE TYPE: ${deliverableType}

STRUCTURE REQUIREMENTS:
${guidelines.structure.join('\n')}

TONE & STYLE:
- Tone: ${guidelines.tone}
- Length: ${guidelines.length}
- Formatting: ${guidelines.formatting}

QUALITY STANDARDS:
${guidelines.quality_standards.map(standard => `• ${standard}`).join('\n')}

GENERAL QUALITY REQUIREMENTS:
${qualityStandards.general.map(standard => `• ${standard}`).join('\n')}

EVIDENCE REQUIREMENTS:
${qualityStandards.evidence.map(standard => `• ${standard}`).join('\n')}

REASONING REQUIREMENTS:
${qualityStandards.reasoning.map(standard => `• ${standard}`).join('\n')}

TEMPLATE STRUCTURE:
${this.getTemplate(deliverableType)}

INSTRUCTIONS:
1. Follow the exact structure and formatting guidelines above
2. Use the template as a starting point but adapt to your content
3. Ensure every claim is supported by source evidence
4. Include confidence levels for each major claim
5. Maintain professional, actionable tone throughout
6. Use citations [1], [2], etc. to reference specific sources
7. Acknowledge any limitations or gaps in the available information

IMPORTANT: Only use information from the provided content. Do not add external knowledge or assumptions.`;
  }

  // Validate deliverable quality
  validateQuality(content, deliverableType) {
    const guidelines = this.getGuidelines(deliverableType);
    const issues = [];
    
    // Check length
    const wordCount = content.split(' ').length;
    const lengthRange = guidelines.length.split('-').map(n => parseInt(n));
    if (wordCount < lengthRange[0] || wordCount > lengthRange[1]) {
      issues.push(`Length: ${wordCount} words (target: ${guidelines.length})`);
    }
    
    // Check for citations
    const citationCount = (content.match(/\[\d+\]/g) || []).length;
    if (citationCount < 2) {
      issues.push(`Insufficient citations: ${citationCount} found`);
    }
    
    // Check for bullet points (for executive summary and slide deck)
    if (deliverableType === 'executive_summary' || deliverableType === 'slide_deck') {
      const bulletCount = (content.match(/[•\-\*]/g) || []).length;
      if (bulletCount < 3) {
        issues.push(`Insufficient bullet points: ${bulletCount} found`);
      }
    }
    
    return {
      isValid: issues.length === 0,
      issues,
      wordCount,
      citationCount
    };
  }
}

module.exports = WritingStyleGuide; 