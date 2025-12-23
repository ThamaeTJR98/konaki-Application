
import React, { useState, useEffect } from 'react';
import { UserRole, ViewState, ChatMessage, Listing, Agreement, Dispute, Language, DiaryEntry, FarmerProfile, CashBookEntry } from './types';
import { sendMessageToGemini, generateAgreementSummary } from './services/geminiService';
import { dataStore } from './services/dataStore';
import { translations } from './translations';
import RoleSelector from './components/RoleSelector';
import Dashboard from './components/Dashboard';
import ChatInterface from './components/ChatInterface';
import ListingDetails from './components/ListingDetails';
import AgreementsView from './components/AgreementsView';
import DisputesView from './components/DisputesView';
import MessagesView from './components/MessagesView';
import DiaryView from './components/DiaryView';
import CashBookView from './components/CashBookView';
import LiveVoiceOverlay from './components/LiveVoiceOverlay';
import Logo from './components/Logo';
import { MOCK_AGREEMENTS, MOCK_DISPUTES, MOCK_LISTINGS, MOCK_CHAT_SESSIONS, MOCK_DIARY_ENTRIES, DISTRICTS } from './constants';

const App: React.FC = () => {
  const [role, setRole] = useState<UserRole>(UserRole.NONE);
  const [viewState, setViewState] = useState<ViewState>(ViewState.ONBOARDING);
  const [activeListing, setActiveListing] = useState<Listing | null>(null);
  const [isGlobalAdvisorChat, setIsGlobalAdvisorChat] = useState(false); 
  const [language, setLanguage] = useState<Language>('st');
  const [profile, setProfile] = useState<FarmerProfile | null>(null);
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatSessions, setChatSessions] = useState<Record<string, ChatMessage[]>>({});
  const [currentSuggestions, setCurrentSuggestions] = useState<string[]>([]);
  const [groundingSources, setGroundingSources] = useState<{ title: string; uri: string }[]>([]);
  
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isLiveCallActive, setIsLiveCallActive] = useState(false);
  const [liveCallContext, setLiveCallContext] = useState<{ context: string, title: string } | undefined>(undefined);
  
  const [listings, setListings] = useState<Listing[]>([]);
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
  const [cashBookEntries, setCashBookEntries] = useState<CashBookEntry[]>([]);

  const t = (key: string) => translations[key]?.[language] || key;

  useEffect(() => {
    const loadData = async () => {
        const savedRole = dataStore.getRole();
        if (savedRole && savedRole !== 'NONE') {
            setRole(savedRole);
            setViewState(ViewState.DASHBOARD);
        }
        const savedProfile = dataStore.getFarmerProfile();
        if (savedProfile) setProfile(savedProfile);
        
        setListings(await dataStore.getListings(MOCK_LISTINGS));
        setAgreements(await dataStore.getAgreements(MOCK_AGREEMENTS));
        setDisputes(await dataStore.getDisputes(MOCK_DISPUTES));
        setDiaryEntries(await dataStore.getDiary(MOCK_DIARY_ENTRIES));

        const savedCash = localStorage.getItem('konaki_cashbook');
        if (savedCash) setCashBookEntries(JSON.parse(savedCash));

        const savedChatSessions = localStorage.getItem('konaki_chat_sessions');
        if (savedChatSessions) setChatSessions(JSON.parse(savedChatSessions));
        else setChatSessions(MOCK_CHAT_SESSIONS);
    };
    loadData();
  }, []);

  const handleRoleSelect = (selectedRole: UserRole) => {
    setRole(selectedRole);
    dataStore.setRole(selectedRole);
    setViewState(ViewState.DASHBOARD);
  };

  const handleSendMessage = async (text: string, attachment?: string) => {
    const sessionId = isGlobalAdvisorChat ? 'konaki_advisor_global' : (activeListing?.id || '');
    if (!sessionId) return;

    const newUserMsg: ChatMessage = { id: Date.now().toString(), sender: 'user', text, timestamp: Date.now(), attachment };
    const currentSessionMsgs = chatSessions[sessionId] || [];
    const updatedHistory = [...currentSessionMsgs, newUserMsg];
    updateChatSession(sessionId, updatedHistory);
    
    setIsAiLoading(true);
    setGroundingSources([]);
    const counterparty = isGlobalAdvisorChat ? "Konaki Advisor" : (activeListing?.holderName || "Molekane");
    const response = await sendMessageToGemini(updatedHistory, role, counterparty, listings);
    setIsAiLoading(false);

    const newMessages: ChatMessage[] = [];
    if (response.counterpartyReply) {
        newMessages.push({ id: (Date.now() + 1).toString(), sender: isGlobalAdvisorChat ? 'konaki' : 'counterparty', text: response.counterpartyReply, timestamp: Date.now() });
    }
    if (response.konakiGuidance) {
        newMessages.push({ id: (Date.now() + 2).toString(), sender: 'konaki', text: response.konakiGuidance, timestamp: Date.now(), isIntervention: true });
    }
    if (response.suggestedActions) setCurrentSuggestions(response.suggestedActions);
    updateChatSession(sessionId, [...updatedHistory, ...newMessages]);
  };

  const updateChatSession = (id: string, newMessages: ChatMessage[]) => {
      setMessages(newMessages);
      const updatedSessions = { ...chatSessions, [id]: newMessages };
      setChatSessions(updatedSessions);
      localStorage.setItem('konaki_chat_sessions', JSON.stringify(updatedSessions));
  };

  const addDiaryEntry = (e: DiaryEntry) => {
    const updated = [e, ...diaryEntries];
    setDiaryEntries(updated);
    dataStore.saveDiary(updated);
  };

  if (viewState === ViewState.ONBOARDING || role === UserRole.NONE) {
    return (
        <RoleSelector onSelectRole={handleRoleSelect} />
    );
  }

  let MainComponent;
  switch (viewState) {
      case ViewState.DASHBOARD:
          MainComponent = <Dashboard role={role} listings={listings} onSelectListing={(l) => { setActiveListing(l); setViewState(ViewState.LISTING_DETAILS); }} onAddListing={(l) => setListings([l, ...listings])} onUpdateListing={(l) => setListings(listings.map(item => item.id === l.id ? l : item))} onDeleteListing={(id) => setListings(listings.filter(l => l.id !== id))} onStartLiveCall={() => { setLiveCallContext(undefined); setIsLiveCallActive(true); }} onOpenAdvisor={() => { setIsGlobalAdvisorChat(true); setMessages(chatSessions['konaki_advisor_global'] || []); setViewState(ViewState.CHAT); }} language={language} onOpenDisputes={() => setViewState(ViewState.DISPUTES)} />;
          break;
      case ViewState.LISTING_DETAILS:
          if (!activeListing) {
              setViewState(ViewState.DASHBOARD);
              return null;
          }
          MainComponent = <ListingDetails 
            listing={activeListing} 
            onBack={() => setViewState(ViewState.DASHBOARD)} 
            onStartChat={() => {
                setIsGlobalAdvisorChat(false);
                setMessages(chatSessions[activeListing.id] || []);
                setViewState(ViewState.CHAT);
            }}
            onStartNegotiation={() => {
                setIsGlobalAdvisorChat(false);
                setMessages(chatSessions[activeListing.id] || []);
                setViewState(ViewState.CHAT);
            }}
          />;
          break;
      case ViewState.MESSAGES:
          MainComponent = <MessagesView 
            chatSessions={chatSessions} 
            listings={listings} 
            onOpenChat={(id) => {
                if (id === 'konaki_advisor_global') {
                    setIsGlobalAdvisorChat(true);
                } else {
                    setIsGlobalAdvisorChat(false);
                    const l = listings.find(item => item.id === id);
                    if (l) setActiveListing(l);
                }
                setMessages(chatSessions[id] || []);
                setViewState(ViewState.CHAT);
            }} 
            language={language} 
          />;
          break;
      case ViewState.AGREEMENTS:
          MainComponent = <AgreementsView 
            agreements={agreements} 
            onUpdateAgreement={(a) => {
              const updated = agreements.map(item => item.id === a.id ? a : item);
              setAgreements(updated);
              dataStore.saveAgreements(updated);
            }} 
            onStartLiveReview={(a) => {
                setLiveCallContext({ context: `REVIEWING AGREEMENT: ${JSON.stringify(a)}`, title: 'Agreement Review' });
                setIsLiveCallActive(true);
            }}
            language={language} 
          />;
          break;
      case ViewState.DIARY:
          MainComponent = <DiaryView entries={diaryEntries} onAddEntry={addDiaryEntry} agreements={agreements} language={language} />;
          break;
      case ViewState.CASHBOOK:
          MainComponent = <CashBookView initialEntries={cashBookEntries} onUpdate={(entries) => {
            setCashBookEntries(entries);
            localStorage.setItem('konaki_cashbook', JSON.stringify(entries));
          }} onAddDiaryEntry={addDiaryEntry} />;
          break;
      case ViewState.DISPUTES:
          MainComponent = <DisputesView 
            disputes={disputes} 
            onAddDispute={(d) => {
              const updated = [d, ...disputes];
              setDisputes(updated);
              dataStore.saveDisputes(updated);
            }} 
            onStartLiveMediation={(d) => {
                setLiveCallContext({ context: `MEDIATING DISPUTE: ${d.title}. Details: ${d.description}`, title: 'Live Mediation' });
                setIsLiveCallActive(true);
            }}
            agreements={agreements} 
            diaryEntries={diaryEntries} 
            language={language} 
          />;
          break;
      default:
          MainComponent = <div className="p-10">{t('loading')}</div>;
  }

  const NavButton = ({ targetView, icon, labelKey }: { targetView: ViewState, icon: string, labelKey: string }) => {
    const isActive = viewState === targetView;
    return (
      <button 
        onClick={() => {
            setActiveListing(null);
            setIsGlobalAdvisorChat(false);
            setViewState(targetView);
        }}
        className={`w-full text-left p-4 rounded-xl transition-all flex items-center gap-4 ${
            isActive 
            ? 'bg-white/20' 
            : 'hover:bg-white/10'
        }`}
      >
        <span className="text-xl">{icon}</span>
        <span className="font-bold text-sm tracking-wide">{t(labelKey)}</span>
      </button>
    );
  };

  const MobileNavButton = ({ targetView, icon, labelKey }: { targetView: ViewState, icon: string, labelKey: string }) => {
    const isActive = viewState === targetView;
    return (
        <button 
            onClick={() => {
                setActiveListing(null);
                setIsGlobalAdvisorChat(false);
                setViewState(targetView);
            }}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                isActive 
                ? 'text-green-700 bg-green-50' 
                : 'text-stone-400 hover:text-stone-600'
            }`}
        >
            <span className={`text-2xl ${isActive ? 'scale-110' : ''} transition-transform`}>{icon}</span>
            <span className="text-[10px] font-bold tracking-wide">{t(labelKey)}</span>
        </button>
    );
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-stone-100 flex flex-col md:flex-row overflow-hidden font-sans">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')] z-0"></div>
      
      {isLiveCallActive && <LiveVoiceOverlay onClose={() => setIsLiveCallActive(false)} context={liveCallContext?.context} title={liveCallContext?.title} />}
      
      {/* Sidebar */}
      <div className="hidden md:flex w-72 bg-green-900 text-white flex-col justify-between p-6 shadow-2xl z-30 shrink-0 no-print">
        <div>
            <div className="mb-8 flex items-center gap-3 px-2">
                <div className="w-12 h-12 bg-white rounded-full p-1.5 flex items-center justify-center text-green-900 shadow-lg">
                    <Logo />
                </div>
                <h1 className="text-xl font-bold tracking-tight">KONAKI AI</h1>
            </div>

            <div className="mb-8 px-2">
                <div className="bg-green-800/50 p-1 rounded-xl flex gap-1 border border-white/10">
                    <button onClick={() => setLanguage('st')} className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${language === 'st' ? 'bg-white text-green-900 shadow-lg' : 'text-green-300'}`}>Sesotho</button>
                    <button onClick={() => setLanguage('en')} className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${language === 'en' ? 'bg-white text-green-900 shadow-lg' : 'text-green-300'}`}>English</button>
                </div>
            </div>

            <nav className="space-y-1">
                <NavButton targetView={ViewState.DASHBOARD} icon="🏠" labelKey="home" />
                <NavButton targetView={ViewState.MESSAGES} icon="💬" labelKey="messages" />
                <NavButton targetView={ViewState.DIARY} icon="📖" labelKey="diary" />
                <NavButton targetView={ViewState.CASHBOOK} icon="💰" labelKey="cashbook" />
                <NavButton targetView={ViewState.AGREEMENTS} icon="📄" labelKey="agreements" />
                <NavButton targetView={ViewState.DISPUTES} icon="⚖️" labelKey="disputes" />
            </nav>
        </div>
        <div>
            <button onClick={() => { setRole(UserRole.NONE); setViewState(ViewState.ONBOARDING); }} className="w-full text-left text-xs text-green-400 hover:text-white px-3 py-2 flex items-center gap-2 font-bold uppercase tracking-widest">
                <span>🚪</span> {t('logout')}
            </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative z-10">
        <div className={`flex-1 relative overflow-hidden flex flex-col transition-all duration-300 ${viewState === ViewState.CHAT ? 'hidden' : 'flex'}`}>
            <div className={`w-full h-full mx-auto max-w-full`}>
                {MainComponent}
            </div>
        </div>
        
        {viewState === ViewState.CHAT && (
            <div className="flex-1 w-full h-full bg-white shadow-none z-40 animate-fade-in border-l border-stone-200">
                <ChatInterface 
                    messages={messages} 
                    onSendMessage={handleSendMessage} 
                    onClose={() => { setViewState(ViewState.DASHBOARD); setIsGlobalAdvisorChat(false); }} 
                    onTranslateMessage={() => {}} 
                    isLoading={isAiLoading} 
                    activeRole={role} 
                    counterpartyName={isGlobalAdvisorChat ? "Konaki Advisor" : (activeListing?.holderName || "Molekane")} 
                    suggestions={currentSuggestions} 
                    currentLanguage={language}
                    groundingSources={groundingSources}
                />
            </div>
        )}

        {/* Mobile Nav */}
        {!isLiveCallActive && viewState !== ViewState.CHAT && viewState !== ViewState.LISTING_DETAILS && (
            <div className="md:hidden bg-white border-t border-stone-200 flex justify-around items-center h-16 shrink-0 pb-safe z-30 shadow-[0_-8px_20px_-10px_rgba(0,0,0,0.1)] no-print">
                <MobileNavButton targetView={ViewState.DASHBOARD} icon="🏠" labelKey="home" />
                <MobileNavButton targetView={ViewState.MESSAGES} icon="💬" labelKey="messages" />
                <MobileNavButton targetView={ViewState.DIARY} icon="📖" labelKey="diary" />
                <MobileNavButton targetView={ViewState.CASHBOOK} icon="💰" labelKey="cashbook" />
                <MobileNavButton targetView={ViewState.AGREEMENTS} icon="📄" labelKey="agreements" />
                <MobileNavButton targetView={ViewState.DISPUTES} icon="⚖️" labelKey="disputes" />
            </div>
        )}
      </div>
    </div>
  );
};

export default App;
