
import React, { useState, useEffect } from 'react';
import { UserRole, ViewState, ChatMessage, LandListing, Agreement, Dispute, CashBookEntry } from './types';
import { sendMessageToGemini, generateAgreementSummary } from './services/geminiService';
import { dataStore } from './services/dataStore';
import RoleSelector from './components/RoleSelector';
import Dashboard from './components/Dashboard';
import ChatInterface from './components/ChatInterface';
import ListingDetails from './components/ListingDetails';
import AgreementsView from './components/AgreementsView';
import DisputesView from './components/DisputesView';
import CashBookView from './components/CashBookView';
import LiveVoiceOverlay from './components/LiveVoiceOverlay';
import Logo from './components/Logo';
import { MOCK_AGREEMENTS, MOCK_DISPUTES, MOCK_LISTINGS } from './constants';

const App: React.FC = () => {
  // --- State Management ---
  const [role, setRole] = useState<UserRole>(UserRole.NONE);
  const [viewState, setViewState] = useState<ViewState>(ViewState.ONBOARDING);
  const [activeListing, setActiveListing] = useState<LandListing | null>(null);
  const [isGlobalAdvisorChat, setIsGlobalAdvisorChat] = useState(false); 
  
  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatSessions, setChatSessions] = useState<Record<string, ChatMessage[]>>({});
  const [currentSuggestions, setCurrentSuggestions] = useState<string[]>([]);
  
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [isLiveCallActive, setIsLiveCallActive] = useState(false);
  
  // Data State with defaults
  const [listings, setListings] = useState<LandListing[]>([]);
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [cashBookEntries, setCashBookEntries] = useState<CashBookEntry[]>([]); 

  // --- Persistence (Load) ---
  useEffect(() => {
    const loadData = async () => {
        // Load Role
        const savedRole = dataStore.getRole();
        if (savedRole && savedRole !== 'NONE') {
            setRole(savedRole);
            setViewState(ViewState.DASHBOARD);
        }

        // Load Tables (Try Supabase -> Fallback Local)
        const l = await dataStore.getListings(MOCK_LISTINGS);
        setListings(l);

        const a = await dataStore.getAgreements(MOCK_AGREEMENTS);
        setAgreements(a);

        const d = await dataStore.getDisputes(MOCK_DISPUTES);
        setDisputes(d);

        // Load Cashbook
        const c = await dataStore.getCashBook([]);
        setCashBookEntries(c);

        // Chat sessions still local
        const savedChatSessions = localStorage.getItem('konaki_chat_sessions');
        if (savedChatSessions) setChatSessions(JSON.parse(savedChatSessions));
    };

    loadData();
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
    const sessionMessages = chatSessions[activeListing.id] || [];
    setMessages(sessionMessages);
    setCurrentSuggestions([]);
    setViewState(ViewState.CHAT);
  };

  const handleStartNegotiation = () => {
    if (!activeListing) return;
    setIsGlobalAdvisorChat(false);
    setViewState(ViewState.CHAT);
    const sessionMessages = chatSessions[activeListing.id] || [];
    setMessages(sessionMessages);
    setCurrentSuggestions([]);
    
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
  };

  const handleAddDispute = async (newDispute: Dispute) => {
    const updated = [newDispute, ...disputes];
    setDisputes(updated);
    await dataStore.saveDisputes(updated);
  };

  const handleUpdateCashBook = async (updatedEntries: CashBookEntry[]) => {
      setCashBookEntries(updatedEntries);
      await dataStore.saveCashBook(updatedEntries);
  }

  const handleUpdateAgreement = async (updatedAgreement: Agreement) => {
      const updated = agreements.map(a => a.id === updatedAgreement.id ? updatedAgreement : a);
      setAgreements(updated);
      await dataStore.saveAgreements(updated);
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
      alert("Tumellano e entsoe! (Agreement generated!)");
  };

  const goBack = () => {
    if (viewState === ViewState.CHAT) {
        if(isGlobalAdvisorChat) {
            setViewState(ViewState.DASHBOARD);
        } else {
            setViewState(ViewState.LISTING_DETAILS);
        }
    } else if (viewState === ViewState.LISTING_DETAILS) {
        setActiveListing(null);
        setViewState(ViewState.DASHBOARD);
    } else {
        setRole(UserRole.NONE);
        setViewState(ViewState.ONBOARDING);
    }
  };

  const handleLogout = () => {
    // Add a small timeout to ensure the UI registers the tap before blocking with confirm
    setTimeout(() => {
        if (window.confirm("U batla ho tsoa? (Log out?)")) {
            setRole(UserRole.NONE);
            dataStore.setRole(UserRole.NONE);
            setViewState(ViewState.ONBOARDING);
            setActiveListing(null);
            setChatSessions({});
            localStorage.removeItem('konaki_chat_sessions');
        }
    }, 50);
  };

  const NavButton = ({ targetView, icon, label }: { targetView: ViewState, icon: string, label: string }) => {
    const isActive = viewState === targetView || (targetView === ViewState.DASHBOARD && (viewState === ViewState.CHAT || viewState === ViewState.LISTING_DETAILS));
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
        <span className="text-xl">{icon}</span> {label}
      </button>
    );
  };

  const MobileNavButton = ({ targetView, icon, label }: { targetView: ViewState, icon: string, label: string }) => {
    const isActive = viewState === targetView || (targetView === ViewState.DASHBOARD && (viewState === ViewState.CHAT || viewState === ViewState.LISTING_DETAILS));
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
            <span className="text-[10px] font-bold tracking-wide">{label}</span>
        </button>
    );
  };

  if (viewState === ViewState.ONBOARDING || role === UserRole.NONE) {
    return <RoleSelector onSelectRole={handleRoleSelect} />;
  }

  let MainContent;
  if (viewState === ViewState.DASHBOARD) {
      MainContent = <Dashboard 
        role={role} 
        listings={listings}
        onSelectListing={handleListingSelect} 
        onAddListing={handleAddListing}
        onOpenAdvisor={handleOpenAdvisor}
        onStartLiveCall={() => setIsLiveCallActive(true)}
      />;
  } else if (viewState === ViewState.LISTING_DETAILS && activeListing) {
      MainContent = <ListingDetails 
        listing={activeListing} 
        onStartChat={handleStartChat}
        onStartNegotiation={handleStartNegotiation}
        onBack={handleBackToDashboard}
      />;
  } else if (viewState === ViewState.AGREEMENTS) {
      MainContent = <AgreementsView agreements={agreements} onUpdateAgreement={handleUpdateAgreement} />;
  } else if (viewState === ViewState.DISPUTES) {
      MainContent = <DisputesView disputes={disputes} onAddDispute={handleAddDispute} />;
  } else if (viewState === ViewState.CASHBOOK) {
      MainContent = <CashBookView initialEntries={cashBookEntries} onUpdate={handleUpdateCashBook} />;
  } else {
      MainContent = <Dashboard role={role} listings={listings} onSelectListing={handleListingSelect} onAddListing={handleAddListing} onOpenAdvisor={handleOpenAdvisor} onStartLiveCall={() => setIsLiveCallActive(true)} />; 
  }

  const isDesktopChatVisible = window.innerWidth >= 768 && viewState === ViewState.CHAT;
  const isMobileChatActive = viewState === ViewState.CHAT;
  
  const chatName = isGlobalAdvisorChat ? "Konaki Advisor" : (activeListing?.holderName || 'Motho');
  const chatRole = isGlobalAdvisorChat ? UserRole.NONE : role; 

  return (
    <div className="fixed inset-0 w-full h-full bg-stone-50 flex flex-col md:flex-row overflow-hidden font-sans">
      
      {/* Live Voice Overlay */}
      {isLiveCallActive && <LiveVoiceOverlay onClose={() => setIsLiveCallActive(false)} />}
      
      <div className="hidden md:flex w-72 bg-green-900 text-white flex-col justify-between p-6 shadow-2xl z-30 shrink-0 no-print">
        <div>
            <div className="mb-10 flex items-center gap-3 px-2">
                <div className="w-12 h-12 bg-white rounded-full p-1.5 flex items-center justify-center overflow-hidden shadow-lg">
                    <Logo />
                </div>
                <div>
                    <h1 className="text-xl font-bold tracking-tight">KONAKI AI</h1>
                    <p className="text-xs text-green-300 font-medium">Partnerships</p>
                </div>
            </div>
            
            <nav className="space-y-1">
                <NavButton targetView={ViewState.DASHBOARD} icon="🏠" label="Lehae" />
                <NavButton targetView={ViewState.AGREEMENTS} icon="📄" label="Litumellano" />
                <NavButton targetView={ViewState.CASHBOOK} icon="💰" label="Buka ea Lichelete" />
                <NavButton targetView={ViewState.DISPUTES} icon="⚖️" label="Likhohlano" />
            </nav>
        </div>
        
        <div className="border-t border-green-800/50 pt-6">
             <div className="flex items-center gap-3 mb-4 p-2 rounded-lg bg-green-800/30">
                <div className="w-10 h-10 bg-green-700 rounded-full flex items-center justify-center text-lg border-2 border-green-600">
                    {role === UserRole.FARMER ? '👨🏽‍🌾' : role === UserRole.PROVIDER ? '🚜' : '🏡'}
                </div>
                <div className="overflow-hidden">
                    <p className="font-bold text-sm truncate text-green-50">Mosebelisi</p>
                    <p className="text-xs text-green-300 truncate font-medium">{role}</p>
                </div>
             </div>
             <button 
                onClick={handleLogout} 
                className="text-xs text-green-400 hover:text-white flex items-center gap-2 w-full px-3 py-2 rounded-lg hover:bg-green-800/50 transition-colors"
             >
                <span>🚪</span> Tsoa (Log out)
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
                        
                        {/* Logo added here for sub-pages */}
                        <div className="w-8 h-8 mr-2 bg-white rounded-full p-1 shadow-sm shrink-0 flex items-center justify-center">
                            <Logo />
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
                            <span className="font-bold">Lintlha (Details)</span>
                        )}
                    </div>
                 </>
             ) : (
                 <>
                    <div className="flex items-center gap-2">
                        <div className="w-9 h-9 bg-white rounded-full p-1.5 overflow-hidden flex items-center justify-center shadow-sm">
                            <Logo />
                        </div>
                        <span className="font-bold text-lg tracking-wide">KONAKI AI</span>
                    </div>
                    {/* Logout Button */}
                    <button 
                        type="button"
                        onClick={handleLogout}
                        className="w-10 h-10 bg-green-800 rounded-full flex items-center justify-center text-base border border-green-700 shadow-sm active:bg-green-700 transition-colors cursor-pointer hover:bg-green-700 z-50 pointer-events-auto"
                        title="Tsoa (Log out)"
                    >
                        {role === UserRole.FARMER ? '👨🏽‍🌾' : role === UserRole.PROVIDER ? '🚜' : '🏡'}
                    </button>
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
                        isLoading={isAiLoading}
                        activeRole={chatRole}
                        counterpartyName={chatName}
                        suggestions={currentSuggestions}
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

        {!isMobileChatActive && viewState !== ViewState.LISTING_DETAILS && (
            <div className="md:hidden bg-white border-t border-stone-200 flex justify-around items-center h-16 shrink-0 pb-safe z-30 shadow-[0_-8px_20px_-10px_rgba(0,0,0,0.1)] no-print">
                <MobileNavButton targetView={ViewState.DASHBOARD} icon="🏠" label="Lehae" />
                <MobileNavButton targetView={ViewState.AGREEMENTS} icon="📄" label="Litumellano" />
                <MobileNavButton targetView={ViewState.CASHBOOK} icon="💰" label="Buka" />
                <MobileNavButton targetView={ViewState.DISPUTES} icon="⚖️" label="Likhohlano" />
            </div>
        )}

      </div>
    </div>
  );
};

export default App;
