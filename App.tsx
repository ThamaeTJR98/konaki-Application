
import React, { useState, useEffect } from 'react';
import { UserRole, ViewState, ChatMessage, LandListing, Agreement, Dispute, FarmerProfile, Language, DiaryEntry } from './types';
import { sendMessageToGemini, generateAgreementSummary, translateText } from './services/geminiService';
import { dataStore } from './services/dataStore';
import { isOnline } from './services/supabaseClient';
import { translations } from './translations';
import RoleSelector from './components/RoleSelector';
import Dashboard from './components/Dashboard';
import ChatInterface from './components/ChatInterface';
import ListingDetails from './components/ListingDetails';
import AgreementsView from './components/AgreementsView';
import DisputesView from './components/DisputesView';
import MatchingView from './components/MatchingView';
import MessagesView from './components/MessagesView';
import DiaryView from './components/DiaryView';
import LiveVoiceOverlay from './components/LiveVoiceOverlay';
import Logo from './components/Logo';
import { MOCK_AGREEMENTS, MOCK_DISPUTES, MOCK_LISTINGS, MOCK_CHAT_SESSIONS, MOCK_DIARY_ENTRIES } from './constants';

const App: React.FC = () => {
  // --- State Management ---
  const [role, setRole] = useState<UserRole>(UserRole.NONE);
  const [viewState, setViewState] = useState<ViewState>(ViewState.ONBOARDING);
  const [activeListing, setActiveListing] = useState<LandListing | null>(null);
  const [isGlobalAdvisorChat, setIsGlobalAdvisorChat] = useState(false); 
  const [language, setLanguage] = useState<Language>('st'); // Default Sesotho
  const [appIsOnline, setAppIsOnline] = useState(true);
  
  // Profile State
  const [farmerProfile, setFarmerProfile] = useState<FarmerProfile | null>(null);

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatSessions, setChatSessions] = useState<Record<string, ChatMessage[]>>({});
  const [currentSuggestions, setCurrentSuggestions] = useState<string[]>([]);
  
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [isLiveCallActive, setIsLiveCallActive] = useState(false);
  
  // UI State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Data State with defaults
  const [listings, setListings] = useState<LandListing[]>([]);
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);

  // Helper for Translation
  const t = (key: string) => translations[key]?.[language] || key;

  // --- Toast Handler ---
  useEffect(() => {
    if (toastMessage) {
        const timer = setTimeout(() => {
            setToastMessage(null);
        }, 3000);
        return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // --- Persistence (Load) ---
  useEffect(() => {
    const loadData = async () => {
        // Load Role
        const savedRole = dataStore.getRole();
        if (savedRole && savedRole !== 'NONE') {
            setRole(savedRole);
            setViewState(ViewState.DASHBOARD);
        }

        // Load Farmer Profile
        const savedProfile = dataStore.getFarmerProfile();
        if (savedProfile) {
            setFarmerProfile(savedProfile);
        }

        // Load Tables (Try Supabase -> Fallback Local with Mocks)
        setListings(await dataStore.getListings(MOCK_LISTINGS));
        setAgreements(await dataStore.getAgreements(MOCK_AGREEMENTS));
        setDisputes(await dataStore.getDisputes(MOCK_DISPUTES));
        setDiaryEntries(await dataStore.getDiary(MOCK_DIARY_ENTRIES));

        // Load Chat sessions with Mock fallback
        const savedChatSessions = localStorage.getItem('konaki_chat_sessions');
        if (savedChatSessions) {
            setChatSessions(JSON.parse(savedChatSessions));
        } else {
            setChatSessions(MOCK_CHAT_SESSIONS);
        }
    };

    loadData();
    
    // Check online status periodically
    const checkOnline = () => setAppIsOnline(navigator.onLine);
    window.addEventListener('online', checkOnline);
    window.addEventListener('offline', checkOnline);
    return () => {
        window.removeEventListener('online', checkOnline);
        window.removeEventListener('offline', checkOnline);
    };
  }, []);

  // --- Handlers ---

  const handleRoleSelect = (selectedRole: UserRole) => {
    setRole(selectedRole);
    dataStore.setRole(selectedRole);
    setViewState(ViewState.DASHBOARD);
  };

  const handleListingSelect = (listing: LandListing) => {
    setActiveListing(listing);
    setIsGlobalAdvisorChat(false);
    setViewState(ViewState.LISTING_DETAILS);
  };

  const handleStartChat = () => {
    if (!activeListing) return;
    setIsGlobalAdvisorChat(false);
    const sessionKey = activeListing.id;
    let sessionMessages = chatSessions[sessionKey] || [];
    
    // Add disclaimer only if it's a completely new chat session
    if (sessionMessages.length === 0) {
        const disclaimer: ChatMessage = {
            id: `disclaimer_${Date.now()}`,
            sender: 'konaki',
            text: `Kea leboha! Please note: For this negotiation, I will be roleplaying as '${activeListing.holderName}' to help guide the conversation. My advice will appear separately.`,
            timestamp: Date.now(),
            isIntervention: true
        };
        sessionMessages = [disclaimer];
    }
    
    setMessages(sessionMessages);
    setCurrentSuggestions([]);
    setViewState(ViewState.CHAT);
  };
  
  // Open chat from Inbox
  const handleOpenChatFromInbox = (listingId: string) => {
      if (listingId === 'konaki_advisor_global') {
          handleOpenAdvisor();
      } else {
          const listing = listings.find(l => l.id === listingId);
          if (listing) {
              setActiveListing(listing);
              setIsGlobalAdvisorChat(false);
              const msgs = chatSessions[listingId] || [];
              setMessages(msgs);
              setViewState(ViewState.CHAT);
          }
      }
  };

  const handleStartNegotiation = () => {
    if (!activeListing) return;
    setIsGlobalAdvisorChat(false);
    const sessionKey = activeListing.id;
    let sessionMessages = chatSessions[sessionKey] || [];
    
    if (sessionMessages.length === 0) {
        const disclaimer: ChatMessage = {
            id: `disclaimer_${Date.now()}`,
            sender: 'konaki',
            text: `Kea leboha! Please note: For this negotiation, I will be roleplaying as '${activeListing.holderName}' to help guide the conversation. My advice will appear separately.`,
            timestamp: Date.now(),
            isIntervention: true
        };
        sessionMessages = [disclaimer];
    }

    setMessages(sessionMessages);
    setCurrentSuggestions([]);
    setViewState(ViewState.CHAT);
    
    // Customize prompt based on category
    const isEquipment = activeListing.category === 'EQUIPMENT';
    const negotiationPrompt = isEquipment 
        ? "Ke kopa ho qala therisano ea ho hira thepa. Re ka bua ka: Nako (Duration), Tefo (Rate), le Mafura (Fuel)?"
        : "Ke kopa ho qala therisano ea tumellano ea khirisano. Re ka bua ka lintlha tsena: Nako (Duration), Tefo (Payment), le Tšebeliso (Land Use)?";
        
    setTimeout(() => {
        handleSendMessage(negotiationPrompt);
    }, 100);
  };

  // Open the Global Intelligent Matching Advisor
  const handleOpenAdvisor = () => {
      setIsGlobalAdvisorChat(true);
      setActiveListing(null);
      
      const sessionKey = 'konaki_advisor_global';
      const sessionMessages = chatSessions[sessionKey] || [];
      setMessages(sessionMessages);
      setCurrentSuggestions(["Ke batla mobu oa poone Leribe", "Ke hloka Terekere Maseru"]);
      setViewState(ViewState.CHAT);
      
      if (sessionMessages.length === 0) {
          // Initial greeting
           setTimeout(() => {
                const welcomeMsg: ChatMessage = {
                    id: 'welcome',
                    sender: 'konaki',
                    text: "Lumela! Ke 'na Konaki Advisor. Nka u thusa ho fumana eng kajeno? (Hello! I can help you match with land or equipment.)",
                    timestamp: Date.now()
                };
                setMessages([welcomeMsg]);
                updateChatSession(sessionKey, [welcomeMsg]);
           }, 500);
      }
  };

  const handleStartMatching = (profile: FarmerProfile) => {
      setFarmerProfile(profile);
      dataStore.setFarmerProfile(profile); // Persist
      setViewState(ViewState.MATCHING);
  };

  const handleMatchLike = (listing: LandListing) => {
      // It's a match! Open chat immediately
      setActiveListing(listing);
      setIsGlobalAdvisorChat(false);
      setViewState(ViewState.CHAT);
      
      const sessionMessages = chatSessions[listing.id] || [];
      setMessages(sessionMessages);
      
      // If new chat, auto send a contextual "Hello" message
      if (sessionMessages.length === 0) {
          setTimeout(() => {
             const greeting = `Lumela! Ke bone 'match' ea rona ho Konaki bakeng sa ${listing.type} e ${listing.district}. Ke kopa ho bua ka monyetla ona.`;
             handleSendMessage(greeting);
          }, 500);
      }
  };

  const handleBackToDashboard = () => {
    setActiveListing(null);
    setIsGlobalAdvisorChat(false);
    setViewState(ViewState.DASHBOARD);
  };

  const handleCloseChat = () => {
    setActiveListing(null);
    setIsGlobalAdvisorChat(false);
    setViewState(ViewState.DASHBOARD);
  };

  const handleAddListing = async (newListing: LandListing) => {
    const updated = [newListing, ...listings];
    setListings(updated);
    await dataStore.saveListings(updated);
    setToastMessage("Listing added successfully!");
  };

  const handleUpdateListing = async (updatedListing: LandListing) => {
    const updated = listings.map(l => l.id === updatedListing.id ? updatedListing : l);
    setListings(updated);
    await dataStore.saveListings(updated);
    setToastMessage("Listing updated successfully!");
  };

  const handleDeleteListing = async (listingId: string) => {
    const updated = listings.filter(l => l.id !== listingId);
    setListings(updated);
    await dataStore.saveListings(updated);
    setToastMessage("Listing deleted.");
  };

  const handleAddDispute = async (newDispute: Dispute) => {
    const updated = [newDispute, ...disputes];
    setDisputes(updated);
    await dataStore.saveDisputes(updated);
  };
  
  const handleAddDiaryEntry = async (newEntry: DiaryEntry) => {
    const updated = [newEntry, ...diaryEntries];
    setDiaryEntries(updated);
    await dataStore.saveDiary(updated);
  };

  const handleUpdateAgreement = async (updatedAgreement: Agreement) => {
      const oldAgreement = agreements.find(a => a.id === updatedAgreement.id);
      const updated = agreements.map(a => a.id === updatedAgreement.id ? updatedAgreement : a);
      setAgreements(updated);
      await dataStore.saveAgreements(updated);

      // --- AUTOMATION HOOK: AGREEMENT SIGNED ---
      if (oldAgreement?.status !== 'Signed' && updatedAgreement.status === 'Signed') {
          const diaryEntry: DiaryEntry = {
              id: `diary_${Date.now()}`,
              date: new Date().toISOString().split('T')[0],
              type: 'AGREEMENT_SIGNED',
              title: `Tumellano e saennoe: ${updatedAgreement.title}`,
              description: `Mahlakore: Uena le ${updatedAgreement.parties.landholder}`,
              icon: '✍️',
              relatedId: updatedAgreement.id
          };
          handleAddDiaryEntry(diaryEntry);
      }
  }

  const updateChatSession = (id: string, newMessages: ChatMessage[]) => {
      setMessages(newMessages);
      const updatedSessions = { ...chatSessions, [id]: newMessages };
      setChatSessions(updatedSessions);
      localStorage.setItem('konaki_chat_sessions', JSON.stringify(updatedSessions));
  };

  const handleSendMessage = async (text: string, attachment?: string) => {
    const sessionId = isGlobalAdvisorChat ? 'konaki_advisor_global' : (activeListing?.id || '');
    if (!sessionId) return;

    setCurrentSuggestions([]);

    const newUserMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: Date.now(),
      attachment,
      attachmentType: attachment ? 'image' : undefined
    };
    
    const currentSessionMsgs = chatSessions[sessionId] || [];
    const updatedHistory = [...currentSessionMsgs, newUserMsg];
    
    updateChatSession(sessionId, updatedHistory);
    
    setIsAiLoading(true);

    const counterparty = isGlobalAdvisorChat ? "Konaki Advisor" : (activeListing?.holderName || "Motho");
    const contextListings = isGlobalAdvisorChat ? listings : [];

    const response = await sendMessageToGemini(updatedHistory, role, counterparty, contextListings);

    setIsAiLoading(false);

    const newMessages: ChatMessage[] = [];

    if (response.counterpartyReply) {
        newMessages.push({
            id: (Date.now() + 1).toString(),
            sender: isGlobalAdvisorChat ? 'konaki' : 'counterparty', 
            text: response.counterpartyReply,
            timestamp: Date.now()
        });
    }

    if (response.konakiGuidance) {
        newMessages.push({
            id: (Date.now() + 2).toString(),
            sender: 'konaki',
            text: response.konakiGuidance,
            timestamp: Date.now(),
            isIntervention: true
        });
        setShowAiPanel(true);
    }
    
    if (response.suggestedActions) {
        setCurrentSuggestions(response.suggestedActions);
    }

    updateChatSession(sessionId, [...updatedHistory, ...newMessages]);
  };

  const handleTranslateMessage = async (sessionId: string, messageId: string) => {
      const sessionMsgs = chatSessions[sessionId];
      if (!sessionMsgs) return;

      const msgIndex = sessionMsgs.findIndex(m => m.id === messageId);
      if (msgIndex === -1) return;
      
      const msg = sessionMsgs[msgIndex];
      const newMsgs = [...sessionMsgs];

      if (msg.isTranslated && msg.originalText) {
          // Revert to original
          newMsgs[msgIndex] = { 
              ...msg, 
              text: msg.originalText, 
              isTranslated: false, 
              originalText: undefined 
          };
      } else {
          // Translate
          // If app language is English, translate to English. If Sesotho, translate to Sesotho.
          // This allows users to understand incoming text in their preferred language.
          setIsAiLoading(true);
          const translated = await translateText(msg.text, language);
          setIsAiLoading(false);
          
          newMsgs[msgIndex] = { 
              ...msg, 
              text: translated, 
              originalText: msg.text, 
              isTranslated: true 
          };
      }
      
      updateChatSession(sessionId, newMsgs);
  };

  const handleFinalizeAgreement = async () => {
      if (!activeListing) return;
      setIsAiLoading(true);
      const newAgreement = await generateAgreementSummary(
          messages, 
          activeListing.holderName, 
          activeListing.id,
          activeListing.category
      );
      
      const updated = [newAgreement, ...agreements];
      setAgreements(updated);
      await dataStore.saveAgreements(updated);
      setIsAiLoading(false);
      setViewState(ViewState.AGREEMENTS);
      setToastMessage("Tumellano e entsoe! (Agreement generated!)");
  };

  const goBack = () => {
    if (viewState === ViewState.CHAT) {
        setViewState(ViewState.MESSAGES);
    } else if (viewState === ViewState.LISTING_DETAILS) {
        setActiveListing(null);
        setViewState(ViewState.DASHBOARD);
    } else if (viewState === ViewState.MATCHING) {
        setViewState(ViewState.DASHBOARD);
    } else {
        setRole(UserRole.NONE);
        setViewState(ViewState.ONBOARDING);
    }
  };

  const handleLogout = () => {
    setTimeout(() => {
        if (window.confirm(t('logout') + "?")) {
            setRole(UserRole.NONE);
            dataStore.setRole(UserRole.NONE);
            setViewState(ViewState.ONBOARDING);
            setActiveListing(null);
            setChatSessions({});
            localStorage.removeItem('konaki_chat_sessions');
        }
    }, 50);
  };

  const NavButton = ({ targetView, icon, labelKey }: { targetView: ViewState, icon: string, labelKey: string }) => {
    const isActive = viewState === targetView;
    return (
      <button 
        onClick={() => {
            setActiveListing(null);
            setIsGlobalAdvisorChat(false);
            setViewState(targetView);
        }}
        className={`w-full text-left p-3 px-4 rounded-xl transition-all flex items-center gap-3 mb-1 no-print ${
            isActive 
            ? 'bg-white/10 text-white shadow-sm font-semibold' 
            : 'text-green-100 hover:bg-white/5 hover:text-white'
        }`}
      >
        <span className="text-xl">{icon}</span> {t(labelKey)}
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
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors no-print ${
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

  if (viewState === ViewState.ONBOARDING || role === UserRole.NONE) {
    return <RoleSelector onSelectRole={handleRoleSelect} />;
  }
  
  // -- MATCHING VIEW --
  if (viewState === ViewState.MATCHING && farmerProfile) {
      return <MatchingView listings={listings} userProfile={farmerProfile} onLike={handleMatchLike} onClose={handleBackToDashboard} />;
  }

  let MainContent;
  switch (viewState) {
      case ViewState.DASHBOARD:
          MainContent = <Dashboard 
              role={role} 
              listings={listings} 
              onSelectListing={handleListingSelect} 
              onAddListing={handleAddListing} 
              onUpdateListing={handleUpdateListing}
              onDeleteListing={handleDeleteListing}
              onOpenAdvisor={handleOpenAdvisor} 
              onStartLiveCall={() => setIsLiveCallActive(true)} 
              onStartMatching={handleStartMatching}
              onOpenDisputes={() => setViewState(ViewState.DISPUTES)} 
              language={language} 
          />;
          break;
      case ViewState.LISTING_DETAILS:
          if (activeListing) MainContent = <ListingDetails listing={activeListing} onStartChat={handleStartChat} onStartNegotiation={handleStartNegotiation} onBack={handleBackToDashboard} />;
          break;
      case ViewState.AGREEMENTS:
          MainContent = <AgreementsView agreements={agreements} onUpdateAgreement={handleUpdateAgreement} />;
          break;
      case ViewState.DISPUTES:
          MainContent = <DisputesView 
            disputes={disputes} 
            onAddDispute={handleAddDispute} 
            agreements={agreements} 
            diaryEntries={diaryEntries} 
          />;
          break;
      case ViewState.MESSAGES:
          MainContent = <MessagesView chatSessions={chatSessions} listings={listings} onOpenChat={handleOpenChatFromInbox} language={language} />;
          break;
      case ViewState.DIARY:
          MainContent = <DiaryView entries={diaryEntries} onAddEntry={handleAddDiaryEntry} agreements={agreements} />;
          break;
      default:
          MainContent = <Dashboard 
              role={role} 
              listings={listings} 
              onSelectListing={handleListingSelect} 
              onAddListing={handleAddListing} 
              onUpdateListing={handleUpdateListing}
              onDeleteListing={handleDeleteListing}
              onOpenAdvisor={handleOpenAdvisor} 
              onStartLiveCall={() => setIsLiveCallActive(true)} 
              onStartMatching={handleStartMatching} 
              onOpenDisputes={() => setViewState(ViewState.DISPUTES)}
              language={language} 
          />;
  }

  const isDesktopChatVisible = window.innerWidth >= 768 && viewState === ViewState.CHAT;
  const isMobileChatActive = viewState === ViewState.CHAT;
  
  const chatName = isGlobalAdvisorChat ? "Konaki Advisor" : (activeListing?.holderName || 'Motho');
  const chatRole = isGlobalAdvisorChat ? UserRole.NONE : role; 
  const currentSessionId = isGlobalAdvisorChat ? 'konaki_advisor_global' : (activeListing?.id || '');

  return (
    <div className="fixed inset-0 w-full h-full bg-stone-50 flex flex-col md:flex-row overflow-hidden font-sans">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-5 right-5 bg-green-800 text-white px-6 py-3 rounded-lg shadow-2xl z-[9999] animate-fade-in-up flex items-center gap-3">
            <span>✅</span>
            <span className="font-bold text-sm">{toastMessage}</span>
        </div>
      )}

      {/* Live Voice Overlay */}
      {isLiveCallActive && <LiveVoiceOverlay onClose={() => setIsLiveCallActive(false)} />}
      
      {/* Sidebar (Desktop) */}
      <div className="hidden md:flex w-72 bg-green-900 text-white flex-col justify-between p-6 shadow-2xl z-30 shrink-0 no-print">
        <div>
            <div className="mb-8 flex items-center gap-3 px-2">
                <div className="w-12 h-12 bg-white rounded-full p-1.5 flex items-center justify-center overflow-hidden shadow-lg text-green-900">
                    <Logo />
                </div>
                <div>
                    <h1 className="text-xl font-bold tracking-tight">KONAKI AI</h1>
                    {/* Offline Indicator */}
                    {!appIsOnline && (
                        <p className="text-[10px] bg-red-500/20 text-red-200 px-2 py-0.5 rounded-full inline-block border border-red-500/50">Offline Mode</p>
                    )}
                </div>
            </div>
            
            <nav className="space-y-1 mb-8">
                <NavButton targetView={ViewState.DASHBOARD} icon="🏠" labelKey="home" />
                <NavButton targetView={ViewState.MESSAGES} icon="💬" labelKey="messages" />
                <NavButton targetView={ViewState.MATCHING} icon="🔥" labelKey="match" />
                <NavButton targetView={ViewState.DIARY} icon="📖" labelKey="diary" />
                <NavButton targetView={ViewState.AGREEMENTS} icon="📄" labelKey="agreements" />
                <NavButton targetView={ViewState.DISPUTES} icon="⚖️" labelKey="disputes" />
            </nav>

            {/* Language Toggle */}
            <div className="bg-green-800/50 p-1 rounded-lg flex mb-4">
                <button 
                    onClick={() => setLanguage('st')}
                    className={`flex-1 text-xs font-bold py-1.5 rounded-md transition-all ${language === 'st' ? 'bg-white text-green-900 shadow' : 'text-green-300 hover:text-white'}`}
                >
                    Sesotho
                </button>
                <button 
                    onClick={() => setLanguage('en')}
                    className={`flex-1 text-xs font-bold py-1.5 rounded-md transition-all ${language === 'en' ? 'bg-white text-green-900 shadow' : 'text-green-300 hover:text-white'}`}
                >
                    English
                </button>
            </div>
        </div>
        
        <div className="border-t border-green-800/50 pt-6">
             <div className="flex items-center gap-3 mb-4 p-2 rounded-lg bg-green-800/30">
                <div className="w-10 h-10 bg-green-700 rounded-full flex items-center justify-center text-lg border-2 border-green-600">
                    {role === UserRole.FARMER ? '👨🏽‍🌾' : role === UserRole.PROVIDER ? '🚜' : '🏡'}
                </div>
                <div className="overflow-hidden">
                    <p className="font-bold text-sm truncate text-green-50">Mosebelisi</p>
                    <p className="text-xs text-green-300 truncate font-medium">{t(role === UserRole.FARMER ? 'farmer' : role === UserRole.PROVIDER ? 'provider' : 'landholder')}</p>
                </div>
             </div>
             <button 
                onClick={handleLogout} 
                className="text-xs text-green-400 hover:text-white flex items-center gap-2 w-full px-3 py-2 rounded-lg hover:bg-green-800/50 transition-colors"
             >
                <span>🚪</span> {t('logout')}
             </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col relative h-full overflow-hidden">
        
        {/* Mobile Header: High Z-Index to stay above Maps/overlays */}
        <div className="md:hidden bg-green-900 text-white px-4 h-16 shrink-0 z-[2000] flex items-center justify-between shadow-md no-print relative">
             {isMobileChatActive || viewState === ViewState.LISTING_DETAILS ? (
                 <>
                    <div className="flex items-center flex-1 overflow-hidden">
                        <button onClick={goBack} className="p-2 -ml-2 text-2xl active:opacity-70 mr-2 rounded-full hover:bg-white/10 shrink-0">
                            ←
                        </button>
                        
                        <div className="w-9 h-9 rounded-full bg-stone-100 text-stone-300 flex-shrink-0 overflow-hidden border border-stone-200 flex items-center justify-center mr-2 p-1">
                            {isGlobalAdvisorChat ? (
                                <div className="w-5 h-5 text-green-900"><Logo /></div>
                            ) : activeListing ? (
                                <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                                </svg>
                            ) : (
                                '📝'
                            )}
                        </div>

                        {isGlobalAdvisorChat ? (
                            <div className="font-bold truncate">Konaki Advisor</div>
                        ) : activeListing ? (
                            <div className="flex-1 overflow-hidden">
                                <h2 className="font-bold text-sm truncate leading-tight">{activeListing.holderName}</h2>
                                <p className="text-[10px] text-green-300 truncate uppercase">
                                    {activeListing.type}
                                </p>
                            </div>
                        ) : (
                            <span className="font-bold">{t('details')}</span>
                        )}
                    </div>
                 </>
             ) : (
                 <>
                    <div className="flex items-center gap-2">
                        <div className="w-9 h-9 bg-white rounded-full p-1.5 overflow-hidden flex items-center justify-center shadow-sm text-green-900">
                            <Logo />
                        </div>
                        <span className="font-bold text-lg tracking-wide">KONAKI AI</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        {/* Mobile Lang Toggle */}
                        <button 
                            onClick={() => setLanguage(l => l === 'st' ? 'en' : 'st')}
                            className="text-xs font-bold bg-green-800 px-2 py-1 rounded border border-green-700 uppercase"
                        >
                            {language}
                        </button>

                        <button 
                            type="button"
                            onClick={handleLogout}
                            className="w-8 h-8 bg-green-800 rounded-full flex items-center justify-center text-sm border border-green-700"
                        >
                            {role === UserRole.FARMER ? '👨🏽‍🌾' : role === UserRole.PROVIDER ? '🚜' : '🏡'}
                        </button>
                    </div>
                 </>
             )}
        </div>

        <div className="flex-1 flex overflow-hidden relative w-full bg-stone-50">
            
            <div className={`flex flex-col h-full transition-all duration-300 ease-in-out ${
                isMobileChatActive ? 'hidden' : 'flex-1 w-full'
            } ${
                isDesktopChatVisible ? 'md:w-1/2 lg:w-3/5 xl:w-2/3 border-r border-stone-200' : 'md:w-full'
            }`}>
                 {MainContent}
            </div>

            {(isMobileChatActive || isDesktopChatVisible) && (
                <div className={`bg-white h-full flex flex-col shadow-xl z-10 no-print ${
                    isMobileChatActive ? 'absolute inset-0 w-full' : ''
                } ${
                    !isMobileChatActive ? 'hidden md:flex md:w-1/2 lg:w-2/5 xl:w-1/3' : ''
                }`}>
                    <ChatInterface 
                        messages={messages}
                        onSendMessage={handleSendMessage}
                        onFinalizeAgreement={!isGlobalAdvisorChat ? handleFinalizeAgreement : undefined}
                        onClose={handleCloseChat}
                        onTranslateMessage={(msgId) => handleTranslateMessage(currentSessionId, msgId)}
                        isLoading={isAiLoading}
                        activeRole={chatRole}
                        counterpartyName={chatName}
                        suggestions={currentSuggestions}
                        currentLanguage={language}
                    />
                </div>
            )}

            <div className={`hidden 2xl:flex w-80 bg-amber-50/50 border-l border-amber-100 flex-col p-6 backdrop-blur-sm no-print ${showAiPanel ? 'block' : 'hidden'}`}>
                <h3 className="text-amber-900 font-bold mb-6 flex items-center gap-2 uppercase text-xs tracking-wider">
                    <span className="text-lg">🤖</span> Konaki Insights
                </h3>
                <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-hide">
                    {messages.filter(m => m.sender === 'konaki' && m.isIntervention).map(m => (
                        <div key={m.id} className="bg-white p-4 rounded-xl shadow-sm border border-amber-200 text-sm text-amber-900 leading-relaxed">
                            {m.text}
                        </div>
                    ))}
                </div>
            </div>

        </div>

        {!isMobileChatActive && viewState !== ViewState.LISTING_DETAILS && viewState !== ViewState.MATCHING && (
            <div className="md:hidden bg-white border-t border-stone-200 flex justify-around items-center h-16 shrink-0 pb-safe z-30 shadow-[0_-8px_20px_-10px_rgba(0,0,0,0.1)] no-print">
                <MobileNavButton targetView={ViewState.DASHBOARD} icon="🏠" labelKey="home" />
                <MobileNavButton targetView={ViewState.MESSAGES} icon="💬" labelKey="messages" />
                <MobileNavButton targetView={ViewState.DIARY} icon="📖" labelKey="diary" />
                <MobileNavButton targetView={ViewState.AGREEMENTS} icon="📄" labelKey="agreements" />
                <MobileNavButton targetView={ViewState.DISPUTES} icon="⚖️" labelKey="disputes" />
            </div>
        )}

      </div>
    </div>
  );
};

export default App;
