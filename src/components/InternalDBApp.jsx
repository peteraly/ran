import React from 'react';
import { Database, FileText, Tag } from 'lucide-react';

// TODO: Replace sampleFiles with real API call to fetch files from your internal database or document management system.
const sampleFiles = [
  {
    id: 'file-001',
    name: 'Q4_2024_Competitive_Landscape_Analysis.pdf',
    type: 'PDF',
    size: '2.4 MB',
    lastModified: '2024-03-15',
    author: 'Strategy Team',
    tags: ['competitive', 'analysis', 'Q4'],
  },
  {
    id: 'file-002',
    name: 'Crypto_Product_Risk_Assessment_2024.pptx',
    type: 'PowerPoint',
    size: '5.1 MB',
    lastModified: '2024-03-14',
    author: 'Risk Management',
    tags: ['crypto', 'risk', 'assessment'],
  },
  {
    id: 'file-003',
    name: 'PayPal_Honey_Integration_Study.docx',
    type: 'Word',
    size: '1.8 MB',
    lastModified: '2024-03-13',
    author: 'M&A Team',
    tags: ['paypal', 'honey', 'acquisition'],
  },
  {
    id: 'file-004',
    name: 'Stripe_Banking_License_Timeline.xlsx',
    type: 'Excel',
    size: '890 KB',
    lastModified: '2024-03-12',
    author: 'Legal Team',
    tags: ['stripe', 'banking', 'license'],
  },
];

export default function InternalDBApp({ onClose }) {
  return (
    <div className="flex flex-col w-full h-full bg-white/90 rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
      {/* Title bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-100 border-b border-gray-200 rounded-t-2xl" data-drag-handle>
        <div className="flex items-center gap-2">
          {/* Apple-style window controls */}
          <div className="flex gap-1 mr-2">
            <button onClick={onClose} className="w-3 h-3 rounded-full bg-red-500 border border-red-300 hover:scale-110 transition-transform" title="Close" />
            <span className="w-3 h-3 rounded-full bg-yellow-400 border border-yellow-200" />
            <span className="w-3 h-3 rounded-full bg-green-500 border border-green-300" />
          </div>
          <Database className="h-5 w-5 text-orange-500" />
          <span className="font-semibold text-gray-800 text-base">Internal DB</span>
        </div>
      </div>
      {/* File list */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {sampleFiles.map((file) => (
          <div key={file.id} className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 flex flex-col gap-1 hover:bg-orange-50 transition-colors">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="h-4 w-4 text-gray-400" />
              <span className="font-medium text-gray-800 text-sm truncate">{file.name}</span>
              <span className="text-xs text-gray-500 ml-auto">{file.size}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>{file.author}</span>
              <span>{file.lastModified}</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {file.tags.map((tag, idx) => (
                <span key={idx} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                  <Tag className="h-2 w-2 mr-1" />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 