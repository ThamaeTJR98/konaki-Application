import React, { useState, useEffect } from 'react';
import { UserRole, ViewState, ChatMessage, LandListing, Agreement, Dispute } from './types';
import { sendMessageToGemini, generateAgreementSummary } from './services/geminiService';
import RoleSelector from './components/RoleSelector';
import Dashboard from './components/Dashboard';
import ChatInterface from './components/ChatInterface';
import ListingDetails from './components/ListingDetails';
import AgreementsView from './components/AgreementsView';
import DisputesView from './components/DisputesView';
import Logo from './components/Logo';
import { MOCK_AGREEMENTS, MOCK_DISPUTES, MOCK_LISTINGS } from './constants';

const App: React.FC = () => {
  // --- State Management ---
  const [role, setRole] = useState<UserRole>(UserRole.NONE);
  const [viewState, setViewState] = useState<ViewState>(ViewState.ONBOARDING);
  const [activeListing, setActiveListing] = useState<LandListing | null>(null);
  
  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  // Store chat history by listing ID: { "listing_1": [messages...], "listing_2": [...] }
  const [chatSessions, setChatSessions] = useState<Record<string, ChatMessage[]>>({});
  
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showAiPanel, setShowAiPanel] = useState(false);
  
  // Data State with defaults
  const [listings, setListings] = useState<LandListing[]>(MOCK_LISTINGS);
  const [agreements, setAgreements] = useState<Agreement[]>(MOCK_AGREEMENTS);
  const [disputes, setDisputes] = useState<Dispute[]>(MOCK_DISPUTES);

  // --- Persistence (Load) ---
  useEffect(() => {
    try {
        const savedRole = localStorage.getItem('konaki_role');
        const savedListings = localStorage.getItem('konaki_listings');
        const savedAgreements = localStorage.getItem('konaki_agreements');
        const savedDisputes = localStorage.getItem('konaki_disputes');
        const savedChatSessions = localStorage.getItem('konaki_chat_sessions');

        if (savedRole && savedRole !== 'NONE') {
            setRole(savedRole as UserRole);
            setViewState(ViewState.DASHBOARD);
        }
        if (savedListings) setListings(JSON.parse(savedListings));
        if (savedAgreements) setAgreements(JSON.parse(savedAgreements));
        if (savedDisputes) setDisputes(JSON.parse(savedDisputes));
        if (savedChatSessions) setChatSessions(JSON.parse(savedChatSessions));

    } catch (e) {
        console.error("Failed to load state", e);
    }
  }, []);

  // --- Persistence (Save) ---
  useEffect(() => {
    if (role !== UserRole.NONE) localStorage.setItem('konaki_role', role);
    localStorage.setItem('konaki_listings', JSON.stringify(listings));
    localStorage.setItem('konaki_agreements', JSON.stringify(agreements));
    localStorage.setItem('konaki_disputes', JSON.stringify(disputes));
    localStorage.setItem('konaki_chat_sessions', JSON.stringify(chatSessions));
  }, [role, listings, agreements, disputes, chatSessions]);

  // --- Handlers ---

  const handleRoleSelect = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setViewState(ViewState.DASHBOARD);
  };

  const handleListingSelect = (listing: LandListing) => {
    setActiveListing(listing);
    setViewState(ViewState.LISTING_DETAILS);
  };

  const handleStartChat = () => {
    if (!activeListing) return;
    // Load existing chat session for this listing or start empty
    const sessionMessages = chatSessions[activeListing.id] || [];
    setMessages(sessionMessages);
    setViewState(ViewState.CHAT);
  };

  const handleStartNegotiation = () => {
    if (!activeListing) return;
    
    // Switch to chat view
    setViewState(ViewState.CHAT);
    
    // Load existing messages first
    const sessionMessages = chatSessions[activeListing.id] || [];
    setMessages(sessionMessages);

    // If it's a new conversation or doesn't look like a negotiation started recently, 
    // inject the structured prompt.
    // We send a specific message that asks for a structured conversation.
    const negotiationPrompt = "Ke kopa ho qala therisano ea tumellano ea khirisano. Re ka bua ka lintlha tsena: Nako (Duration), Tefo (Payment), le Tšebeliso (Land Use/Responsibilities)?";
    
    // We call the send handler which updates state and calls API
    // We wrap in timeout to ensure state transitions settle if needed (optional but safer for view switches)
    setTimeout(() => {
        handleSendMessage(negotiationPrompt);
    }, 100);
  };

  const handleBackToDashboard = () => {
    setActiveListing(null);
    setViewState(ViewState.DASHBOARD);
  };

  const handleCloseChat = () => {
    setActiveListing(null);
    setViewState(ViewState.DASHBOARD);
  };

  const handleAddListing = (newListing: LandListing) => {
    setListings(prev => [newListing, ...prev]);
  };

  const handleAddDispute = (newDispute: Dispute) => {
    setDisputes(prev => [newDispute, ...prev]);
  };

  const updateChatSession = (listingId: string, newMessages: ChatMessage[]) => {
      setMessages(newMessages);
      setChatSessions(prev => ({
          ...prev,
          [listingId]: newMessages
      }));
  };

  const handleSendMessage = async (text: string) => {
    if (!activeListing) return;

    const newUserMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: Date.now()
    };
    
    // Update UI immediately
    // Note: We use the callback form of setMessages inside the update logic if possible, 
    // but here we rely on the current 'messages' state which might be stale if called immediately after handleStartChat.
    // However, since we setMessages in handleStartChat/Negotiation, we should be careful.
    // Better practice: read from chatSessions directly or functional update.
    
    // Let's rely on the passed history + new message for the API call to ensure consistency
    // We need to access the LATEST messages.
    const currentSessionMsgs = chatSessions[activeListing.id] || [];
    const updatedHistory = [...currentSessionMsgs, newUserMsg];
    
    updateChatSession(activeListing.id, updatedHistory);
    
    setIsAiLoading(true);

    // Call API
    const counterparty = activeListing.holderName || "Motho";
    const response = await sendMessageToGemini(updatedHistory, role, counterparty);

    setIsAiLoading(false);

    const newMessages: ChatMessage[] = [];

    // Add Counterparty response
    if (response.counterpartyReply) {
        newMessages.push({
            id: (Date.now() + 1).toString(),
            sender: 'counterparty',
            text: response.counterpartyReply,
            timestamp: Date.now()
        });
    }

    // Add Konaki guidance if present
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

    // Update with AI responses
    updateChatSession(activeListing.id, [...updatedHistory, ...newMessages]);
  };

  const handleFinalizeAgreement = async () => {
      if (!activeListing) return;
      setIsAiLoading(true);
      const newAgreement = await generateAgreementSummary(messages, activeListing.holderName, activeListing.id);
      setAgreements(prev => [newAgreement, ...prev]);
      setIsAiLoading(false);
      setViewState(ViewState.AGREEMENTS);
      alert("Tumellano e entsoe! (Agreement generated!)");
  };

  const goBack = () => {
    if (viewState === ViewState.CHAT) {
        // Back from Chat goes to Details
        setViewState(ViewState.LISTING_DETAILS);
    } else if (viewState === ViewState.LISTING_DETAILS) {
        // Back from Details goes to Dashboard
        setActiveListing(null);
        setViewState(ViewState.DASHBOARD);
    } else {
        setRole(UserRole.NONE);
        setViewState(ViewState.ONBOARDING);
    }
  };

  const handleLogout = () => {
    if (window.confirm("U batla ho tsoa? (Log out?)")) {
        setRole(UserRole.NONE);
        localStorage.removeItem('konaki_role');
        setViewState(ViewState.ONBOARDING);
        setActiveListing(null);
        setChatSessions({}); // Optional: clear chat on logout
    }
  };

  // Navigation Components
  const NavButton = ({ targetView, icon, label }: { targetView: ViewState, icon: string, label: string }) => {
    const isActive = viewState === targetView || (targetView === ViewState.DASHBOARD && (viewState === ViewState.CHAT || viewState === ViewState.LISTING_DETAILS));
    
    return (
      <button 
        onClick={() => {
            setActiveListing(null);
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

  // --- Layout Rendering ---

  if (viewState === ViewState.ONBOARDING || role === UserRole.NONE) {
    return <RoleSelector onSelectRole={handleRoleSelect} />;
  }

  // Define Main Content Logic
  let MainContent;
  if (viewState === ViewState.DASHBOARD) {
      MainContent = <Dashboard 
        role={role} 
        listings={listings}
        onSelectListing={handleListingSelect} 
        onAddListing={handleAddListing}
      />;
  } else if (viewState === ViewState.LISTING_DETAILS && activeListing) {
      MainContent = <ListingDetails 
        listing={activeListing} 
        onStartChat={handleStartChat}
        onStartNegotiation={handleStartNegotiation}
        onBack={handleBackToDashboard}
      />;
  } else if (viewState === ViewState.AGREEMENTS) {
      MainContent = <AgreementsView agreements={agreements} />;
  } else if (viewState === ViewState.DISPUTES) {
      MainContent = <DisputesView disputes={disputes} onAddDispute={handleAddDispute} />;
  } else {
      MainContent = <Dashboard role={role} listings={listings} onSelectListing={handleListingSelect} onAddListing={handleAddListing} />; 
  }

  // Desktop: Show chat in side panel
  const isDesktopChatVisible = window.innerWidth >= 768 && viewState === ViewState.CHAT && activeListing !== null;
  // Mobile: Chat is full screen
  const isMobileChatActive = viewState === ViewState.CHAT;

  return (
    <div className="fixed inset-0 w-full h-full bg-stone-50 flex flex-col md:flex-row overflow-hidden font-sans">
      
      {/* Sidebar / Navigation for Desktop */}
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

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col relative h-full overflow-hidden">
        
        {/* Mobile Header */}
        <div className="md:hidden bg-green-900 text-white px-4 h-16 shrink-0 z-20 flex items-center justify-between shadow-md no-print">
             {isMobileChatActive || viewState === ViewState.LISTING_DETAILS ? (
                 <>
                    <button onClick={goBack} className="p-2 -ml-2 text-2xl active:opacity-70 mr-2 rounded-full hover:bg-white/10">
                        ←
                    </button>
                    {activeListing ? (
                        <div className="flex items-center flex-1 overflow-hidden">
                            <div className="flex-1 overflow-hidden">
                                <h2 className="font-bold text-sm truncate leading-tight">{activeListing.holderName}</h2>
                                <p className="text-[10px] text-green-300 truncate uppercase">
                                    {activeListing.type}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <span className="font-bold">Lintlha (Details)</span>
                    )}
                 </>
             ) : (
                 <>
                    <div className="flex items-center gap-2">
                        <div className="w-9 h-9 bg-white rounded-full p-1.5 overflow-hidden flex items-center justify-center shadow-sm">
                            <Logo />
                        </div>
                        <span className="font-bold text-lg tracking-wide">KONAKI AI</span>
                    </div>
                    <div className="w-8 h-8 bg-green-800 rounded-full flex items-center justify-center text-sm border border-green-700">
                        {role === UserRole.FARMER ? '👨🏽‍🌾' : role === UserRole.PROVIDER ? '🚜' : '🏡'}
                    </div>
                 </>
             )}
        </div>

        {/* Workspace (Desktop Split View Logic) */}
        <div className="flex-1 flex overflow-hidden relative w-full bg-stone-50">
            
            {/* Primary View (Dashboard/Agreements/Disputes/Details) */}
            <div className={`flex flex-col h-full transition-all duration-300 ease-in-out ${
                isMobileChatActive ? 'hidden' : 'flex-1 w-full'
            } ${
                isDesktopChatVisible ? 'md:w-1/2 lg:w-3/5 xl:w-2/3 border-r border-stone-200' : 'md:w-full'
            }`}>
                 {MainContent}
            </div>

            {/* Secondary View (Chat) */}
            {(isMobileChatActive || isDesktopChatVisible) && (
                <div className={`bg-white h-full flex flex-col shadow-xl z-10 no-print ${
                    isMobileChatActive ? 'absolute inset-0 w-full' : ''
                } ${
                    !isMobileChatActive ? 'hidden md:flex md:w-1/2 lg:w-2/5 xl:w-1/3' : ''
                }`}>
                    <ChatInterface 
                        messages={messages}
                        onSendMessage={handleSendMessage}
                        onFinalizeAgreement={handleFinalizeAgreement}
                        onClose={handleCloseChat}
                        isLoading={isAiLoading}
                        activeRole={role}
                        counterpartyName={activeListing?.holderName || 'Motho'}
                    />
                </div>
            )}

            {/* AI Guidance Panel (Extra Context on large screens) */}
            <div className={`hidden 2xl:flex w-80 bg-amber-50/50 border-l border-amber-100 flex-col p-6 backdrop-blur-sm no-print ${showAiPanel ? 'block' : 'hidden'}`}>
                <h3 className="text-amber-900 font-bold mb-6 flex items-center gap-2 uppercase text-xs tracking-wider">
                    <span className="text-lg">🤖</span> Konaki Insights
                </h3>
                <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-hide">
                    {messages.filter(m => m.sender === 'konaki').map(m => (
                        <div key={m.id} className="bg-white p-4 rounded-xl shadow-sm border border-amber-200 text-sm text-amber-900 leading-relaxed">
                            {m.text}
                        </div>
                    ))}
                    {messages.filter(m => m.sender === 'konaki').length === 0 && (
                        <div className="text-center text-amber-400 text-sm mt-10 px-4">
                            Konaki e tla fana ka likeletso mona ha li hlokahala.
                        </div>
                    )}
                </div>
            </div>

        </div>

        {/* Mobile Bottom Navigation */}
        {!isMobileChatActive && viewState !== ViewState.LISTING_DETAILS && (
            <div className="md:hidden bg-white border-t border-stone-200 flex justify-around items-center h-16 shrink-0 pb-safe z-30 shadow-[0_-8px_20px_-10px_rgba(0,0,0,0.1)] no-print">
                <MobileNavButton targetView={ViewState.DASHBOARD} icon="🏠" label="Lehae" />
                <MobileNavButton targetView={ViewState.AGREEMENTS} icon="📄" label="Litumellano" />
                <MobileNavButton targetView={ViewState.DISPUTES} icon="⚖️" label="Likhohlano" />
            </div>
        )}

      </div>
    </div>
  );
};

export default App;