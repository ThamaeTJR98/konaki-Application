
import React, { useRef, useEffect, useState } from 'react';
import { ChatMessage, UserRole } from '../types';
import { transcribeAudio, generateSpeech } from '../services/geminiService';
import { playPcmAudio } from '../services/audioService';
import Logo from './Logo';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (text: string, attachment?: string) => void;
  onFinalizeAgreement?: () => void;
  onClose?: () => void;
  isLoading: boolean;
  activeRole: UserRole;
  counterpartyName: string;
  suggestions?: string[];
}

const INITIAL_SUGGESTIONS = [
    "Ke kopa ho bona mobu (Request Site Visit)",
    "Na metsi a teng? (Is water available?)",
    "Re ka arolelana kotulo? (Sharecropping proposal)",
    "Ke batla ho hira (Proposal to lease)"
];

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  messages, 
  onSendMessage, 
  onFinalizeAgreement, 
  onClose, 
  isLoading, 
  activeRole, 
  counterpartyName,
  suggestions
}) => {
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [attachment, setAttachment] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, isTranscribing]);

  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [inputText]);

  const handleSend = () => {
    if (inputText.trim() || attachment) {
      onSendMessage(inputText, attachment || undefined);
      setInputText('');
      setAttachment(null);
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    }
  };

  const handleQuickAction = (action: string) => {
      onSendMessage(action);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onloadend = () => {
          setAttachment(reader.result as string);
      };
      reader.readAsDataURL(file);
      // Reset input
      if(fileInputRef.current) fileInputRef.current.value = '';
  };

  // --- Voice Input Logic ---
  const toggleRecording = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());
        await processAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Ka kopo, lumella microphone ho bua.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processAudio = async (blob: Blob) => {
    setIsTranscribing(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64data = (reader.result as string).split(',')[1];
        const transcription = await transcribeAudio(base64data, blob.type || 'audio/webm');
        if (transcription) {
            setInputText(prev => prev + (prev ? ' ' : '') + transcription);
        }
        setIsTranscribing(false);
      };
    } catch (e) {
      console.error(e);
      setIsTranscribing(false);
    }
  };

  const playMessageAudio = async (text: string, id: string) => {
    if (playingMessageId) return;
    setPlayingMessageId(id);
    const audioBase64 = await generateSpeech(text);
    if (audioBase64) {
      await playPcmAudio(audioBase64);
    }
    setPlayingMessageId(null);
  };

  // Determine suggestions to show
  const activeSuggestions = (suggestions && suggestions.length > 0) ? suggestions : (messages.length === 0 ? INITIAL_SUGGESTIONS : []);

  return (
    <div className="flex flex-col h-full bg-stone-50 relative border-l border-stone-200">
      {/* Chat Header */}
      <div className="hidden md:flex bg-white/90 backdrop-blur p-3 px-4 border-b border-stone-200 items-center justify-between shadow-sm z-10 sticky top-0 shrink-0 h-16">
        <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-stone-200 to-stone-300 rounded-full flex items-center justify-center text-xl mr-3 border border-stone-300 shadow-inner">
                👤
            </div>
            <div>
                <h2 className="font-bold text-stone-800 text-sm leading-tight">{counterpartyName}</h2>
                <p className="text-[10px] text-green-700 font-bold uppercase tracking-wide">
                    {activeRole === UserRole.FARMER ? "Mong'a Mobu" : "Sehoai"}
                </p>
            </div>
        </div>
        
        <div className="flex items-center gap-2">
            {onFinalizeAgreement && messages.length > 2 && (
                <button 
                    onClick={onFinalizeAgreement}
                    className="bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors animate-fade-in flex items-center gap-1"
                >
                    <span>✅</span> Qetela
                </button>
            )}
            {onClose && (
                <button 
                    onClick={onClose}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                    title="Koala Puisano (Close Chat)"
                >
                    ✕
                </button>
            )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 sm:space-y-6 scrollbar-hide bg-stone-50">
        {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-stone-400 opacity-60">
                <div className="w-24 h-24 mb-6 opacity-80">
                    <Logo />
                </div>
                <p className="text-sm font-medium">Qala puisano le {counterpartyName} mona.</p>
                
                <div className="mt-8 flex flex-col gap-2 w-full max-w-xs">
                    <p className="text-xs text-center uppercase tracking-wide text-stone-300 font-bold">Leka ho botsa (Try asking):</p>
                    {INITIAL_SUGGESTIONS.slice(0, 2).map((action, idx) => (
                        <button 
                            key={idx}
                            onClick={() => handleQuickAction(action)}
                            className="bg-white border border-stone-200 p-3 rounded-xl text-xs text-stone-600 hover:bg-green-50 hover:text-green-800 hover:border-green-200 transition-all shadow-sm font-medium"
                        >
                            {action}
                        </button>
                    ))}
                </div>
            </div>
        )}

        {messages.map((msg) => {
          const isPlaying = playingMessageId === msg.id;

          if (msg.sender === 'user') {
            return (
              <div key={msg.id} className="flex justify-end animate-fade-in-up">
                <div className="max-w-[85%] sm:max-w-[75%] flex flex-col items-end">
                    {msg.attachment && (
                        <div className="mb-1 rounded-xl overflow-hidden shadow-sm border border-stone-200">
                             <img src={msg.attachment} alt="Attachment" className="max-h-48 object-cover" />
                        </div>
                    )}
                    <div className="bg-gradient-to-br from-green-700 to-green-800 text-white p-3.5 rounded-2xl rounded-tr-sm shadow-md text-sm sm:text-base">
                        <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                        <span className="text-[10px] opacity-70 block text-right mt-1 font-medium">Uena</span>
                    </div>
                </div>
              </div>
            );
          } else if (msg.sender === 'konaki') {
            return (
              <div key={msg.id} className="flex justify-center my-2 sm:my-4 animate-fade-in">
                <div className="max-w-[95%] sm:max-w-[90%] bg-orange-50/80 backdrop-blur-sm border border-orange-100 p-3 sm:p-4 rounded-xl shadow-sm flex gap-3">
                   <div className="w-10 h-10 shrink-0">
                       <Logo isSpeaking={isPlaying} />
                   </div>
                   <div className="flex-1">
                       <h4 className="font-bold text-amber-900 text-xs sm:text-sm mb-1 uppercase tracking-wide">Keletso ea Konaki</h4>
                       <p className="text-amber-950 text-xs sm:text-sm leading-relaxed italic">"{msg.text}"</p>
                   </div>
                   <button 
                      onClick={() => playMessageAudio(msg.text, msg.id)}
                      disabled={!!playingMessageId}
                      className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors ${isPlaying ? 'bg-orange-200 text-orange-900' : 'text-orange-400 hover:bg-orange-100'}`}
                   >
                     {isPlaying ? '🔊' : '🔈'}
                   </button>
                </div>
              </div>
            );
          } else {
            return (
              <div key={msg.id} className="flex justify-start animate-fade-in-up">
                 <div className="max-w-[85%] sm:max-w-[75%] bg-white border border-stone-200 text-stone-800 p-3.5 rounded-2xl rounded-tl-sm shadow-sm text-sm sm:text-base relative group">
                  <p className="whitespace-pre-wrap pr-6 leading-relaxed">{msg.text}</p>
                  <div className="flex justify-between items-center mt-1 pt-1 border-t border-stone-50">
                    <span className="text-[10px] text-stone-400 font-medium">{counterpartyName}</span>
                    <button 
                      onClick={() => playMessageAudio(msg.text, msg.id)}
                      disabled={!!playingMessageId}
                      className={`h-6 w-6 rounded-full flex items-center justify-center transition-colors ${isPlaying ? 'text-green-600' : 'text-stone-300 hover:text-green-600'}`}
                    >
                      {isPlaying ? '🔊' : '🔈'}
                    </button>
                  </div>
                </div>
              </div>
            );
          }
        })}
        
        {isLoading && (
            <div className="flex justify-start">
                <div className="bg-white border border-stone-100 p-4 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-3">
                    <div className="w-8 h-8">
                        <Logo isThinking={true} />
                    </div>
                    <div className="text-xs text-stone-400 italic font-medium animate-pulse">Konaki ea nahana...</div>
                </div>
            </div>
        )}
        
        {isTranscribing && (
           <div className="flex justify-end">
              <div className="bg-stone-100 text-stone-500 p-2 px-4 rounded-full text-xs animate-pulse border border-stone-200">
                Oa mamela... (Transcribing...)
              </div>
           </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Actions (Chips) - Only show if not loading */}
      {!isLoading && activeSuggestions.length > 0 && !attachment && (
          <div className="bg-stone-50 p-3 overflow-x-auto whitespace-nowrap scrollbar-hide flex gap-2 border-t border-stone-100 px-4 items-center">
              <span className="text-[10px] font-bold text-stone-400 uppercase mr-1">Karabo:</span>
              {activeSuggestions.map((action, idx) => (
                  <button 
                    key={idx}
                    onClick={() => handleQuickAction(action)}
                    className="inline-block bg-white border border-stone-200 px-4 py-2 rounded-full text-xs text-stone-700 hover:bg-green-600 hover:text-white hover:border-green-600 transition-all shadow-sm font-medium"
                  >
                      {action}
                  </button>
              ))}
          </div>
      )}

      {/* Input Area */}
      <div className="p-3 bg-white border-t border-stone-200 shrink-0 pb-safe z-10 shadow-[0_-4px_10px_-4px_rgba(0,0,0,0.05)]">
        {onFinalizeAgreement && messages.length > 2 && (
             <div className="md:hidden flex justify-center mb-2">
                 <button 
                    onClick={onFinalizeAgreement}
                    className="bg-green-50 text-green-700 border border-green-200 px-4 py-1.5 rounded-full text-xs font-bold shadow-sm"
                >
                    ✅ Qetela Tumellano
                </button>
             </div>
        )}

        {attachment && (
            <div className="mx-auto max-w-4xl mb-2 flex items-start gap-2 bg-stone-50 p-2 rounded-xl border border-stone-200">
                 <img src={attachment} alt="Preview" className="h-16 w-16 object-cover rounded-lg" />
                 <div className="flex-1">
                     <p className="text-xs text-stone-500 font-bold mb-1">Image Attached</p>
                     <button onClick={() => setAttachment(null)} className="text-xs text-red-500 hover:text-red-700 font-medium">Remove</button>
                 </div>
            </div>
        )}

        <div className="flex items-end gap-2 max-w-4xl mx-auto">
            {/* Image Upload Button */}
            <label className="p-3 rounded-full bg-stone-50 border border-stone-200 text-stone-400 hover:bg-stone-100 hover:text-stone-600 cursor-pointer transition-colors flex-shrink-0">
                <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                />
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </label>

            <button 
                onClick={toggleRecording}
                disabled={isTranscribing || isLoading}
                className={`p-3 rounded-full transition-all duration-200 flex items-center justify-center shadow-sm border ${
                    isRecording 
                    ? 'bg-red-500 border-red-600 text-white animate-pulse shadow-lg scale-105' 
                    : 'bg-stone-50 border-stone-200 text-stone-500 hover:bg-stone-100 hover:text-stone-700'
                }`} 
                title={isRecording ? "Emisa (Stop)" : "Bua (Voice)"}
            >
                {isRecording ? (
                    <span className="w-5 h-5 sm:w-6 sm:h-6 block bg-white rounded-sm transform scale-50" />
                ) : (
                    <span className="text-xl">🎤</span>
                )}
            </button>
            
            <textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isRecording ? "Kea mamela..." : "Ngola mona..."}
                disabled={isRecording}
                className={`flex-1 bg-stone-50 border-stone-200 focus:bg-white border focus:border-green-500 rounded-2xl px-4 py-3 focus:outline-none focus:ring-0 resize-none max-h-32 text-stone-800 text-sm sm:text-base transition-all ${isRecording ? 'placeholder-red-400 bg-red-50' : ''}`}
                rows={1}
                style={{ minHeight: '48px' }}
            />
            
            <button 
                onClick={handleSend}
                disabled={(!inputText.trim() && !attachment) || isLoading || isRecording}
                className={`p-3 rounded-full transition-all flex-shrink-0 shadow-sm ${
                    (!inputText.trim() && !attachment) || isLoading || isRecording
                    ? 'bg-stone-100 text-stone-300' 
                    : 'bg-green-600 text-white hover:bg-green-700 hover:scale-105 shadow-md'
                }`}
            >
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
               </svg>
            </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
