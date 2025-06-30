import React, { useState } from 'react';
import { Check, ExternalLink, FileText, MessageSquare, Database, Globe } from 'lucide-react';

const TYPE_ICONS = {
  email: <MessageSquare className="h-4 w-4" />,
  teams: <MessageSquare className="h-4 w-4" />,
  internal_db: <Database className="h-4 w-4" />,
  web: <Globe className="h-4 w-4" />,
};

export default function SourcePanel({ type, sources, onToggleUsed }) {
  const [expandedSource, setExpandedSource] = useState(null);

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="text-gray-400">{TYPE_ICONS[type]}</div>
        <div className="font-semibold text-gray-800 capitalize tracking-tight">{type.replace('_', ' ')}</div>
        <div className="text-xs text-gray-400">({sources.length})</div>
      </div>
      <div className="space-y-2">
        {sources.map((src, idx) => (
          <div
            key={idx}
            className={`group rounded-xl border p-3 shadow-sm flex flex-col gap-2 bg-white/90 transition-all duration-200 cursor-pointer
              ${src.used 
                ? 'ring-2 ring-blue-400 border-blue-200 bg-blue-50/50' 
                : 'border-gray-200 hover:border-gray-300 hover:shadow-md hover:bg-white'
              }
              ${expandedSource === idx ? 'ring-2 ring-gray-300' : ''}
            `}
            onClick={() => setExpandedSource(expandedSource === idx ? null : idx)}
          >
            {/* Email */}
            {type === 'email' && (
              <>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 line-clamp-1">{src.subject}</div>
                    <div className="text-sm text-gray-600 mt-1">From: {src.from}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{src.date}</span>
                    {src.used && <Check className="h-4 w-4 text-blue-500" />}
                  </div>
                </div>
                {expandedSource === idx && (
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <div className="text-sm text-gray-700">{src.subject}</div>
                    {src.attachments && src.attachments.length > 0 && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                        <FileText className="h-3 w-3" />
                        {src.attachments.length} attachment(s)
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
            
            {/* Teams/Slack */}
            {type === 'teams' && (
              <>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{src.user}</div>
                    <div className="text-sm text-gray-600 mt-1 line-clamp-2">{src.msg}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{src.timestamp}</span>
                    {src.used && <Check className="h-4 w-4 text-blue-500" />}
                  </div>
                </div>
                {expandedSource === idx && (
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <div className="text-sm text-gray-700">{src.msg}</div>
                    <div className="text-xs text-gray-500 mt-1">Channel: {src.channel}</div>
                  </div>
                )}
              </>
            )}
            
            {/* Internal DB */}
            {type === 'internal_db' && (
              <>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{src.title}</div>
                    <div className="text-sm text-gray-600 mt-1">{src.author || src.type_detail}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{src.file || src.updated}</span>
                    {src.used && <Check className="h-4 w-4 text-blue-500" />}
                  </div>
                </div>
                {expandedSource === idx && (
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <div className="text-sm text-gray-700">{src.title}</div>
                    <div className="text-xs text-gray-500 mt-1">File: {src.file}</div>
                  </div>
                )}
              </>
            )}
            
            {/* Web */}
            {type === 'web' && (
              <>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{src.source}</div>
                    <div className="text-sm text-gray-600 mt-1 line-clamp-2">{src.title}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a 
                      href={src.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-500 hover:text-blue-600 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                    {src.used && <Check className="h-4 w-4 text-blue-500" />}
                  </div>
                </div>
                {expandedSource === idx && (
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <div className="text-sm text-gray-700">{src.title}</div>
                    <a 
                      href={src.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-xs text-blue-500 hover:text-blue-600 mt-1 inline-block"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {src.url}
                    </a>
                  </div>
                )}
              </>
            )}
            
            {/* Tags */}
            {src.tags && src.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {src.tags.map((tag, i) => (
                  <span key={i} className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            )}
            
            {/* USED toggle */}
            <button
              className={`mt-2 text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-200
                ${src.used 
                  ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-sm' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-800'
                }
              `}
              onClick={(e) => {
                e.stopPropagation();
                onToggleUsed(idx);
              }}
            >
              {src.used ? 'Selected' : 'Select Source'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
} 