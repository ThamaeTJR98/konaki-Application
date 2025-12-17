
import React from 'react';
import { ChatMessage, Listing, Language } from '../types';
import { translations } from '../translations';
import Logo from './Logo';

interface MessagesViewProps {
  chatSessions: Record<string, ChatMessage[]>;
  listings: Listing[];
  onOpenChat: (listingId: string) => void;
  language: Language;
}

const MessagesView: React.FC<MessagesViewProps> = ({ chatSessions, listings, onOpenChat, language }) => {
  const t = (key: string) => translations[key]?.[language] || key;

  // Convert sessions object to array and sort by last message time
  const sessions = Object.entries(chatSessions)
    .map(([key, value]) => {
      const messages = value as ChatMessage[];
      const isAdvisor = key === 'konaki_advisor_global';
      const listing = listings.find(l => l.id === key);
      const lastMessage = messages[messages.length - 1];
      
      return {
        key,
        messages,
        lastMessage,
        title: isAdvisor ? t('advisor_name') : (listing?.holderName || 'Unknown'),
        subtitle: isAdvisor ? 'AI Assistant' : (listing?.type || 'Listing'),
        image: isAdvisor ? null : listing?.imageUrl,
        timestamp: lastMessage?.timestamp || 0
      };
    })
    .sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="h-full overflow-y-auto bg-stone-50 p-4 sm:p-6">
      <div className="max-w-3xl mx-auto mb-6">
        <h2 className="text-2xl font-bold text-stone-900">{t('inbox_title')}</h2>
      </div>

      <div className="max-w-3xl mx-auto space-y-3">
        {sessions.length > 0 ? (
          sessions.map(session => (
            <div 
              key={session.key}
              onClick={() => onOpenChat(session.key)}
              className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm hover:shadow-md hover:border-green-300 transition-all cursor-pointer flex gap-4 items-center animate-fade-in"
            >
              <div className="w-14 h-14 rounded-full bg-stone-100 flex-shrink-0 overflow-hidden border border-stone-100 flex items-center justify-center">
                {session.image ? (
                  <img src={session.image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-8 h-8 text-green-900"><Logo /></div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-stone-900 truncate">{session.title}</h3>
                  <span className="text-[10px] text-stone-400 whitespace-nowrap">
                    {new Date(session.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-green-700 font-bold uppercase tracking-wide mb-1">{session.subtitle}</p>
                <p className="text-sm text-stone-500 truncate">{session.lastMessage?.text || '...'}</p>
              </div>
              
              <div className="text-stone-300">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 text-stone-400">
            <div className="text-6xl mb-4 opacity-20">📭</div>
            <p>{t('inbox_empty')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesView;
