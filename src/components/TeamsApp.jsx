import React from 'react';
import { MessageSquare } from 'lucide-react';

// TODO: Replace sampleMessages with real API call to fetch Teams or Slack messages when integrating with Microsoft Graph API or Slack API.
const sampleMessages = [
  {
    user: 'Alex Johnson',
    role: 'PMO Lead',
    message: 'Need a comprehensive deck comparing PayPal, Stripe, and Square for the board meeting tomorrow. Focus on market positioning and competitive advantages.',
    time: '2:45 PM',
  },
  {
    user: 'Maria Garcia',
    role: 'Legal Counsel',
    message: "Please include context about PayPal's Honey acquisition and any antitrust implications. Also, add Stripe's recent banking license application.",
    time: '2:30 PM',
  },
  {
    user: 'Tom Wilson',
    role: 'VP Finance',
    message: 'Interested in the crypto exposure of each company. How much of their revenue comes from crypto-related services?',
    time: '2:15 PM',
  },
  {
    user: 'Rachel Green',
    role: 'Product Manager',
    message: 
      "Can we get some insights on their developer experience and API capabilities? That's becoming a key differentiator.",
    time: '1:55 PM',
  },
];

export default function TeamsApp({ onClose }) {
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
          <MessageSquare className="h-5 w-5 text-purple-500" />
          <span className="font-semibold text-gray-800 text-base">Teams</span>
        </div>
      </div>
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {sampleMessages.map((msg, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 flex flex-col gap-1 hover:bg-purple-50 transition-colors">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-gray-800 text-sm">{msg.user}</span>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{msg.role}</span>
              <span className="text-xs text-gray-400 ml-auto">{msg.time}</span>
            </div>
            <div className="text-sm text-gray-700">{msg.message}</div>
          </div>
        ))}
      </div>
    </div>
  );
} 