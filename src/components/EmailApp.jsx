import React from 'react';
import { Mail } from 'lucide-react';

// TODO: Replace sampleEmails with real API call to fetch emails when integrating with Gmail, Outlook, or Microsoft Graph API.
const sampleEmails = [
  {
    from: 'sarah.chen@company.com',
    subject: 'URGENT: Q4 Competitive Analysis Needed',
    preview: "Hi team, the board meeting is tomorrow and we need a comprehensive analysis of Stripe's recent moves...",
    time: '2:34 PM',
    attachments: ['Q4_Market_Data.xlsx'],
    priority: 'high',
  },
  {
    from: 'mike.rodriguez@company.com',
    subject: 'Re: PayPal vs Stripe - Strategic Review',
    preview: "Thanks for the initial thoughts. Can you also include Square's crypto initiatives?",
    time: '1:15 PM',
    attachments: [],
    priority: 'medium',
  },
  {
    from: 'lisa.thompson@company.com',
    subject: 'Weekly Market Summary - Fintech Sector',
    preview: "Here's this week's summary of key developments in the payment processing space...",
    time: '11:42 AM',
    attachments: ['Market_Summary_Week_12.pdf'],
    priority: 'low',
  },
  {
    from: 'david.kim@company.com',
    subject: 'Risk Assessment: Stripe Banking License',
    preview: "Legal team flagged some concerns about Stripe's banking license application...",
    time: '10:30 AM',
    attachments: ['Legal_Risk_Assessment.docx'],
    priority: 'high',
  },
];

export default function EmailApp({ onClose }) {
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
          <Mail className="h-5 w-5 text-blue-500" />
          <span className="font-semibold text-gray-800 text-base">Mail</span>
        </div>
      </div>
      {/* Email list */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {sampleEmails.map((email, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 flex flex-col gap-1 hover:bg-blue-50 transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-800 text-sm">{email.from.split('@')[0]}</span>
              <span className="text-xs text-gray-400">{email.time}</span>
            </div>
            <div className="font-semibold text-gray-900 text-sm truncate">{email.subject}</div>
            <div className="text-xs text-gray-500 truncate">{email.preview}</div>
            <div className="flex items-center gap-2 mt-1">
              {email.attachments.length > 0 && (
                <span className="text-xs text-gray-400">📎 {email.attachments.length} attachment(s)</span>
              )}
              {email.priority === 'high' && (
                <span className="text-xs text-red-500 font-semibold">High Priority</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 