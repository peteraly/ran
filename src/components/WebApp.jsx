import React from 'react';
import { Globe } from 'lucide-react';

// TODO: Replace sampleArticles with real API call to fetch news or web data when integrating with a news API or web scraper.
const sampleArticles = [
  {
    title: 'OpenAI launches GPT-5: What it means for enterprise AI',
    source: 'TechCrunch',
    time: '1h ago',
    summary: 'OpenAI has announced the release of GPT-5, promising major improvements in reasoning, speed, and security...'
  },
];

export default function WebApp({ onClose }) {
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
          <Globe className="h-5 w-5 text-blue-500" />
          <span className="font-semibold text-gray-800 text-base">Web</span>
        </div>
      </div>
      {/* Article list */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {sampleArticles.map((article, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 flex flex-col gap-1 hover:bg-blue-50 transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-800 text-sm">{article.source}</span>
              <span className="text-xs text-gray-400">{article.time}</span>
            </div>
            <div className="font-semibold text-gray-900 text-sm truncate">{article.title}</div>
            <div className="text-xs text-gray-500 truncate">{article.summary}</div>
          </div>
        ))}
      </div>
    </div>
  );
} 