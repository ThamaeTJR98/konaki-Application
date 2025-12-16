
import React, { useState, useRef, useEffect } from 'react';
import { Listing, FarmerProfile, MatchInsight } from '../types';
import { calculateMatchScores } from '../services/geminiService';
import Logo from './Logo';

interface MatchingViewProps {
  listings: Listing[];
  userProfile: FarmerProfile;
  onLike: (listing: Listing) => void;
  onClose: () => void;
}

const MatchingView: React.FC<MatchingViewProps> = ({ listings, userProfile, onLike, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  
  // AI State
  const [insights, setInsights] = useState<Record<string, MatchInsight>>({});
  const [isCalculating, setIsCalculating] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartX = useRef<number>(0);
  
  // Filter listings based on profile district initially (simple heuristic)
  // then pass to AI for deeper ranking
  const candidateListings = useRef<Listing[]>(listings).current; 
  
  useEffect(() => {
      const fetchScores = async () => {
          setIsCalculating(true);
          // Only rank the first 5-10 to save tokens and time
          const batch = candidateListings.slice(0, 8);
          const results = await calculateMatchScores(userProfile, batch);
          
          const map: Record<string, MatchInsight> = {};
          results.forEach(r => map[r.listingId] = r);
          setInsights(map);
          setIsCalculating(false);
      };
      fetchScores();
  }, [userProfile]); // Run once on mount or profile change

  const currentListing = candidateListings[currentIndex];
  const nextListing = candidateListings[currentIndex + 1];
  const currentInsight = currentListing ? insights[currentListing.id] : null;

  const handleDragStart = (e: React.TouchEvent | React.MouseEvent) => {
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    dragStartX.current = clientX;
  };

  const handleDragMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setDragX(clientX - dragStartX.current);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    if (Math.abs(dragX) > 100) {
      if (dragX > 0) handleLike();
      else handlePass();
    } else {
      setDragX(0); 
    }
  };

  const handleLike = () => {
    setDragX(window.innerWidth); 
    setTimeout(() => {
        onLike(currentListing);
    }, 200);
  };

  const handlePass = () => {
    setDragX(-window.innerWidth);
    setTimeout(() => {
        if (currentIndex < candidateListings.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setDragX(0);
        } else {
            alert("No more matches for now!");
            onClose();
        }
    }, 200);
  };

  if (!currentListing) return null;

  const rotate = dragX * 0.05;
  const likeOpacity = Math.min(Math.max(dragX / 100, 0), 1);
  const nopeOpacity = Math.min(Math.max(-dragX / 100, 0), 1);

  return (
    <div className="fixed inset-0 z-50 bg-stone-900 flex flex-col font-sans overflow-hidden">
      
      {/* Header with Top-Left Logo */}
      <div className="h-20 flex items-center justify-between px-6 z-20 pt-safe">
         <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-white rounded-full p-2 shadow-lg flex items-center justify-center ring-2 ring-stone-800">
                 <Logo isSpeaking={isCalculating} />
             </div>
             <div>
                <span className="text-white font-bold text-xl tracking-tight leading-none block">Konaki</span>
                <span className="text-stone-400 text-xs font-bold uppercase tracking-wider block">Smart Match</span>
             </div>
         </div>
         
         <button 
            onClick={onClose} 
            className="w-10 h-10 rounded-full bg-stone-800 text-stone-300 border border-stone-700 hover:bg-stone-700 flex items-center justify-center transition-colors"
         >
            ✕
         </button>
      </div>

      <div className="flex-1 relative flex items-center justify-center p-4">
          
          {/* Background Card (Next) */}
          {nextListing && (
              <div className="absolute inset-4 top-4 bottom-24 bg-stone-800 rounded-3xl transform scale-95 translate-y-4 opacity-60">
                  <img src={nextListing.imageUrl} alt="" className="w-full h-full object-cover rounded-3xl opacity-50" />
              </div>
          )}

          {/* Active Card */}
          <div 
            ref={containerRef}
            className="absolute inset-4 top-0 bottom-24 bg-white rounded-3xl shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing touch-none select-none will-change-transform"
            style={{ 
                transform: `translateX(${dragX}px) rotate(${rotate}deg)`,
                transition: isDragging ? 'none' : 'transform 0.3s ease-out'
            }}
            onMouseDown={handleDragStart}
            onMouseMove={handleDragMove}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            onTouchStart={handleDragStart}
            onTouchMove={handleDragMove}
            onTouchEnd={handleDragEnd}
          >
              <div className="relative h-full w-full">
                  <img src={currentListing.imageUrl} alt={currentListing.type} className="w-full h-full object-cover pointer-events-none" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/20 pointer-events-none"></div>
                  
                  {/* AI Match Score Badge */}
                  {currentInsight ? (
                       <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2 pointer-events-none animate-fade-in-up">
                          <span className={`font-bold text-sm ${currentInsight.score > 80 ? 'text-green-600' : 'text-orange-500'}`}>
                              {currentInsight.score}% Match
                          </span>
                          <div className="w-4 h-4"><Logo /></div>
                      </div>
                  ) : isCalculating ? (
                      <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2 pointer-events-none">
                          <span className="text-white text-xs font-bold animate-pulse">Konaki thinking...</span>
                      </div>
                  ) : null}

                  {/* Swipe Indicators */}
                  <div className="absolute top-12 left-8 border-4 border-green-500 text-green-500 rounded-lg px-4 py-2 text-4xl font-black uppercase transform -rotate-12 pointer-events-none" style={{ opacity: likeOpacity }}>
                      E-E!
                  </div>
                  <div className="absolute top-12 right-8 border-4 border-red-500 text-red-500 rounded-lg px-4 py-2 text-4xl font-black uppercase transform rotate-12 pointer-events-none" style={{ opacity: nopeOpacity }}>
                      CHE
                  </div>

                  {/* Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white pointer-events-none select-none">
                      <h2 className="text-3xl font-bold mb-1 drop-shadow-md leading-tight">{currentListing.type}</h2>
                      <p className="text-lg font-medium text-green-300 mb-3 flex items-center gap-2">
                        <span>📍 {currentListing.district}</span>
                        <span>•</span>
                        <span>{currentListing.price || currentListing.dailyRate}</span>
                      </p>
                      
                      {/* Konaki Reason */}
                      <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 mb-4 border border-white/20 min-h-[80px] flex flex-col justify-center">
                          {currentInsight ? (
                              <>
                                <p className="text-[10px] text-stone-300 uppercase font-bold mb-1 flex items-center gap-1">
                                    ✨ Konaki AI Insight
                                </p>
                                <p className="text-sm italic text-stone-100 leading-tight">
                                    "{currentInsight.reason}"
                                </p>
                              </>
                          ) : (
                               <div className="flex items-center gap-2 text-stone-300 opacity-70">
                                   <div className="w-4 h-4 rounded-full border-2 border-t-transparent border-white animate-spin"></div>
                                   <span className="text-xs">Analyzing compatibility...</span>
                               </div>
                          )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                          {currentListing.features?.slice(0,3).map((f, i) => (
                              <span key={i} className="text-xs bg-black/40 px-3 py-1 rounded-full border border-white/10">
                                  {f}
                              </span>
                          ))}
                      </div>
                  </div>
              </div>
          </div>
      </div>

      {/* Controls */}
      <div className="h-24 pb-safe bg-stone-900 flex items-center justify-center gap-8 z-20">
          <button 
            onClick={handlePass}
            className="w-16 h-16 rounded-full bg-stone-800 text-red-500 text-2xl shadow-lg border border-stone-700 hover:bg-stone-700 transition-transform active:scale-95 flex items-center justify-center"
          >
              ✕
          </button>
          <button 
            onClick={handleLike}
            className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-rose-600 text-white text-3xl shadow-lg shadow-pink-900/50 hover:scale-105 transition-transform active:scale-95 flex items-center justify-center"
          >
              ♥
          </button>
      </div>

    </div>
  );
};

export default MatchingView;
