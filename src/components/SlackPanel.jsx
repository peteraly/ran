import React from 'react';

export default function SlackPanel({ sources, onToggleUsed }) {
  return (
    <div className="mb-4">
      <div className="font-bold text-lg mb-2">Slack</div>
      <div className="space-y-2">
        {sources.map((src, idx) => (
          <div
            key={idx}
            className={`rounded-lg border p-3 shadow-sm flex flex-col gap-1 bg-white/90 ${src.used ? 'ring-2 ring-blue-400' : ''}`}
          >
            <div className="flex justify-between items-center">
              <span className="font-semibold">{src.user}</span>
              <span className="text-xs text-gray-500">{src.timestamp}</span>
            </div>
            <div className="text-xs text-gray-600">{src.msg}</div>
            <div className="text-xs text-gray-400">Channel: #{src.channel}</div>
            <div className="flex flex-wrap gap-1 mt-1">
              {src.tags && src.tags.map((tag, i) => (
                <span key={i} className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded">{tag}</span>
              ))}
            </div>
            <button
              className={`mt-2 text-xs px-2 py-1 rounded ${src.used ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
              onClick={() => onToggleUsed(idx)}
            >
              {src.used ? '[USED]' : 'Mark as Used'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
} 