/**
 * 🚀 DELIVERABLE GENERATION DASHBOARD
 * 
 * This is a mock prototype simulating a real deliverable generation system.
 * All data is static and hardcoded for demonstration purposes.
 * 
 * Features:
 * - Realistic email inbox simulation
 * - Microsoft Teams chat interface
 * - Internal database file browser
 * - External web sources panel
 * - Central prompt dashboard with deliverable generation
 * 
 * Future Integration Points:
 * - Real email API (Gmail, Outlook)
 * - Microsoft Graph API for Teams
 * - Internal document management system
 * - Web scraping and news APIs
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { 
  Mail, 
  MessageSquare, 
  FileText, 
  Clock, 
  User, 
  Search,
  Download,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

export default function DeliverableDashboard() {
  const [prompt, setPrompt] = useState('');
  const [deliverableType, setDeliverableType] = useState('2-page report');
  const [output, setOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Realistic mock data for each source
  const mockData = {
    email: [
      {
        id: 1,
        from: "sarah.chen@company.com",
        subject: "URGENT: Q4 Competitive Analysis Needed",
        preview: "Hi team, the board meeting is tomorrow and we need a comprehensive analysis of Stripe's recent moves...",
        time: "2:34 PM",
        priority: "high",
        attachments: ["Q4_Market_Data.xlsx"],
        used: true
      },
      {
        id: 2,
        from: "mike.rodriguez@company.com",
        subject: "Re: PayPal vs Stripe - Strategic Review",
        preview: "Thanks for the initial thoughts. Can you also include Square's crypto initiatives?",
        time: "1:15 PM",
        priority: "medium",
        attachments: [],
        used: true
      },
      {
        id: 3,
        from: "lisa.thompson@company.com",
        subject: "Weekly Market Summary - Fintech Sector",
        preview: "Here's this week's summary of key developments in the payment processing space...",
        time: "11:42 AM",
        priority: "low",
        attachments: ["Market_Summary_Week_12.pdf"],
        used: false
      },
      {
        id: 4,
        from: "david.kim@company.com",
        subject: "Risk Assessment: Stripe Banking License",
        preview: "Legal team flagged some concerns about Stripe's banking license application...",
        time: "10:30 AM",
        priority: "high",
        attachments: ["Legal_Risk_Assessment.docx"],
        used: true
      }
    ],
    teams: [
      {
        id: 1,
        user: "Alex Johnson",
        role: "PMO Lead",
        message: "Need a comprehensive deck comparing PayPal, Stripe, and Square for the board meeting tomorrow. Focus on market positioning and competitive advantages.",
        time: "2:45 PM",
        used: true
      },
      {
        id: 2,
        user: "Maria Garcia",
        role: "Legal Counsel",
        message: "Please include context about PayPal's Honey acquisition and any antitrust implications. Also, add Stripe's recent banking license application.",
        time: "2:30 PM",
        used: true
      },
      {
        id: 3,
        user: "Tom Wilson",
        role: "VP Finance",
        message: "Interested in the crypto exposure of each company. How much of their revenue comes from crypto-related services?",
        time: "2:15 PM",
        used: false
      },
      {
        id: 4,
        user: "Rachel Green",
        role: "Product Manager",
        message: "Can we get some insights on their developer experience and API capabilities? That's becoming a key differentiator.",
        time: "1:55 PM",
        used: false
      }
    ],
    internalDB: [
      {
        id: 1,
        name: "Q4_2024_Competitive_Landscape_Analysis.pdf",
        type: "PDF",
        size: "2.4 MB",
        lastModified: "2024-03-15",
        author: "Strategy Team",
        tags: ["competitive", "analysis", "Q4"],
        used: true
      },
      {
        id: 2,
        name: "Crypto_Product_Risk_Assessment_2024.pptx",
        type: "PowerPoint",
        size: "5.1 MB",
        lastModified: "2024-03-14",
        author: "Risk Management",
        tags: ["crypto", "risk", "assessment"],
        used: true
      },
      {
        id: 3,
        name: "PayPal_Honey_Integration_Study.docx",
        type: "Word",
        size: "1.8 MB",
        lastModified: "2024-03-13",
        author: "M&A Team",
        tags: ["paypal", "honey", "acquisition"],
        used: true
      },
      {
        id: 4,
        name: "Stripe_Banking_License_Timeline.xlsx",
        type: "Excel",
        size: "890 KB",
        lastModified: "2024-03-12",
        author: "Legal Team",
        tags: ["stripe", "banking", "license"],
        used: true
      },
      {
        id: 5,
        name: "Square_Crypto_Revenue_Analysis.pdf",
        type: "PDF",
        size: "3.2 MB",
        lastModified: "2024-03-11",
        author: "Finance Team",
        tags: ["square", "crypto", "revenue"],
        used: false
      }
    ],
    externalSources: [
      {
        id: 1,
        title: "TechCrunch: Stripe Eyes Banking Supremacy with New License Application",
        url: "https://techcrunch.com/2024/03/15/stripe-banking-license",
        source: "TechCrunch",
        date: "2024-03-15",
        summary: "Stripe has filed for a banking license that could transform the fintech landscape...",
        used: true
      },
      {
        id: 2,
        title: "Bloomberg: PayPal's Honey Acquisition Shows Revenue Synergies",
        url: "https://bloomberg.com/news/articles/2024-03-14/paypal-honey-synergies",
        source: "Bloomberg",
        date: "2024-03-14",
        summary: "PayPal's $4 billion acquisition of Honey is showing stronger than expected revenue synergies...",
        used: true
      },
      {
        id: 3,
        title: "PitchBook: Square's Crypto Strategy Drives 40% Revenue Growth",
        url: "https://pitchbook.com/news/square-crypto-strategy-2024",
        source: "PitchBook",
        date: "2024-03-13",
        summary: "Square's focus on cryptocurrency services has resulted in significant revenue growth...",
        used: false
      },
      {
        id: 4,
        title: "Reuters: Fintech Regulation Changes Impact Payment Processors",
        url: "https://reuters.com/technology/fintech-regulation-2024",
        source: "Reuters",
        date: "2024-03-12",
        summary: "New regulatory changes in the fintech sector are forcing payment processors to adapt...",
        used: false
      }
    ]
  };

  const generateDeliverable = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const usedSources = {
      email: mockData.email.filter(item => item.used),
      teams: mockData.teams.filter(item => item.used),
      internalDB: mockData.internalDB.filter(item => item.used),
      externalSources: mockData.externalSources.filter(item => item.used)
    };

    const compiled = `📄 **DELIVERABLE GENERATED**
Type: ${deliverableType}
Generated: ${new Date().toLocaleString()}

🎯 **PROMPT**
${prompt}

📚 **SOURCES UTILIZED**

📧 **EMAIL SOURCES:**
${usedSources.email.map(email => `• ${email.subject} (${email.from})`).join('\n')}

💬 **TEAMS MESSAGES:**
${usedSources.teams.map(msg => `• ${msg.user} (${msg.role}): ${msg.message.substring(0, 60)}...`).join('\n')}

📁 **INTERNAL DATABASE:**
${usedSources.internalDB.map(doc => `• ${doc.name} (${doc.author})`).join('\n')}

🌐 **EXTERNAL SOURCES:**
${usedSources.externalSources.map(source => `• ${source.title} (${source.source})`).join('\n')}

✅ **AUTO-GENERATED SUMMARY**

Based on the comprehensive analysis of PayPal, Stripe, and Square, here are the key competitive insights:

**Market Positioning:**
• PayPal leads in consumer payments with 426M+ active accounts
• Stripe dominates developer-focused B2B payments
• Square excels in small business and crypto services

**Recent Strategic Moves:**
• Stripe's banking license application could disrupt traditional banking
• PayPal's Honey acquisition shows strong revenue synergies
• Square's crypto focus drives 40% revenue growth

**Risk Factors:**
• Regulatory changes impacting all three companies
• Crypto market volatility affecting Square's revenue
• Antitrust concerns around PayPal's market position

**Recommendations:**
• Monitor Stripe's banking license progress closely
• Assess PayPal's antitrust exposure
• Evaluate Square's crypto strategy sustainability

---
*This deliverable was automatically generated using AI synthesis of the above data sources.*`;

    setOutput(compiled);
    setIsGenerating(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-10 px-2 md:px-8 transition-colors duration-500">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-2">
          <div>
            <h1 className="text-4xl font-semibold text-gray-900 tracking-tight mb-1">🚀 Deliverable Generation Dashboard</h1>
            <p className="text-gray-500 text-lg">AI-powered deliverable generation from multiple data sources</p>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Email Panel */}
          <div>
            <Card className="bg-white rounded-2xl shadow-lg border-0 h-full transition-all duration-300 hover:shadow-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-xl font-semibold text-gray-800">
                  <Mail className="h-5 w-5 text-blue-500" />
                  Email Inbox
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 overflow-y-auto max-h-[60vh] px-0">
                {mockData.email.map((email) => (
                  <div 
                    key={email.id} 
                    className={`px-4 py-3 rounded-xl border transition-all duration-200 group ${
                      email.used 
                        ? 'bg-blue-50 border-blue-200 shadow-sm' 
                        : 'bg-white border-gray-100 hover:bg-gray-100 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-800">
                          {email.from.split('@')[0]}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-gray-300" />
                        <span className="text-xs text-gray-400">{email.time}</span>
                        {email.priority === 'high' && (
                          <AlertCircle className="h-3 w-3 text-red-400" />
                        )}
                        {email.used && (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        )}
                      </div>
                    </div>
                    <h4 className="font-semibold text-sm text-gray-900 mb-0.5 truncate">{email.subject}</h4>
                    <p className="text-xs text-gray-500 mb-1 truncate">{email.preview}</p>
                    {email.attachments.length > 0 && (
                      <div className="flex items-center gap-1">
                        <FileText className="h-3 w-3 text-gray-300" />
                        <span className="text-xs text-gray-400">
                          {email.attachments.length} attachment(s)
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Teams Panel */}
          <div>
            <Card className="bg-white rounded-2xl shadow-lg border-0 h-full transition-all duration-300 hover:shadow-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-xl font-semibold text-gray-800">
                  <MessageSquare className="h-5 w-5 text-purple-500" />
                  Teams Chat
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 overflow-y-auto max-h-[60vh] px-0">
                {mockData.teams.map((message) => (
                  <div 
                    key={message.id} 
                    className={`px-4 py-3 rounded-xl border transition-all duration-200 group ${
                      message.used 
                        ? 'bg-purple-50 border-purple-200 shadow-sm' 
                        : 'bg-white border-gray-100 hover:bg-gray-100 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-800">
                          {message.user}
                        </span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          {message.role}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-gray-300" />
                        <span className="text-xs text-gray-400">{message.time}</span>
                        {message.used && (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{message.message}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Central Dashboard with glassmorphism */}
          <div className="md:col-span-2 flex flex-col gap-8">
            <Card className="bg-white/70 backdrop-blur-md rounded-2xl shadow-2xl border-0 h-full flex flex-col transition-all duration-500 hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.15)]">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-xl font-semibold text-gray-800">
                  <Search className="h-5 w-5 text-green-500" />
                  Generate Deliverable
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-6 flex-1">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Task Prompt
                  </label>
                  <Textarea
                    placeholder="Describe the deliverable you need... (e.g., 'Create a competitive analysis of PayPal, Stripe, and Square for the board meeting')"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[100px] resize-none text-base bg-gray-50/80 border-0 focus:ring-2 focus:ring-blue-200 rounded-xl shadow-inner"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deliverable Type
                  </label>
                  <select
                    className="w-full border-0 rounded-md px-3 py-2 text-base bg-gray-50/80 focus:outline-none focus:ring-2 focus:ring-blue-200 shadow-sm"
                    value={deliverableType}
                    onChange={(e) => setDeliverableType(e.target.value)}
                  >
                    <option value="2-page report">2-page Executive Report</option>
                    <option value="Slide deck (5 slides)">Slide Deck (5 slides)</option>
                    <option value="Email summary">Email Summary</option>
                    <option value="1-pager + chart">1-pager + Chart</option>
                    <option value="Detailed analysis">Detailed Analysis</option>
                  </select>
                </div>
                <Button 
                  onClick={generateDeliverable}
                  disabled={!prompt.trim() || isGenerating}
                  className="w-full h-12 text-base font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 transition-all duration-200 shadow-lg active:scale-95 focus:ring-2 focus:ring-blue-300"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    'Generate Deliverable'
                  )}
                </Button>
                {output && (
                  <div className="mt-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Generated Output
                    </label>
                    <div className="bg-gray-50/80 border rounded-lg p-4 max-h-[250px] overflow-y-auto shadow-inner">
                      <pre className="text-xs text-gray-800 whitespace-pre-wrap font-sans">
                        {output}
                      </pre>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2 w-full"
                      onClick={() => navigator.clipboard.writeText(output)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Copy to Clipboard
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 