import React from 'react';
import { Listing } from '../types';

interface LandCardProps {
  listing: Listing;
  onClick: (listing: Listing) => void;
}

const LandCard: React.FC<LandCardProps> = ({ listing, onClick }) => {
  const isEquipment = listing.category === 'EQUIPMENT';

  // Helper to generate graphics (icons) based on text content
  const getFeatureIcon = (feature: string) => {
    const lower = feature.toLowerCase();
    if (lower.includes('metsi') || lower.includes('noka') || lower.includes('seliba') || lower.includes('water')) return '💧';
    if (lower.includes('mobu') || lower.includes('soil') || lower.includes('lefatse')) return '🌱';
    if (lower.includes('tsela') || lower.includes('road')) return '🛣️';
    if (lower.includes('motlakase') || lower.includes('power')) return '⚡';
    if (lower.includes('terata') || lower.includes('fenced')) return '🚧';
    if (lower.includes('lifate') || lower.includes('trees')) return '🌳';
    if (lower.includes('ntlo') || lower.includes('house')) return '🏠';
    if (lower.includes('4x4') || lower.includes('plough')) return '🚜';
    return '✨';
  };

  return (
    <div 
      onClick={() => onClick(listing)}
      className="group bg-white rounded-3xl shadow-sm border border-stone-100 cursor-pointer hover:shadow-xl hover:-translate-y-1 hover:border-green-500/30 transition-all duration-300 overflow-hidden flex flex-col h-full relative"
    >
      {/* Image Section */}
      <div className="relative h-52 overflow-hidden bg-stone-200">
        <img 
            src={listing.imageUrl || "https://placehold.co/600x400?text=Mobu+Lesotho"} 
            alt={listing.type}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-90" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
             <span className={`backdrop-blur-md text-[10px] px-3 py-1 rounded-full font-bold shadow-sm border border-white/10 flex items-center gap-1 uppercase tracking-wider ${isEquipment ? 'bg-orange-500/90 text-white' : 'bg-green-600/90 text-white'}`}>
                {isEquipment ? '🚜 Thepa' : '🌱 Mobu'}
             </span>
        </div>

        <div className="absolute top-3 right-3">
             <span className="bg-white/90 backdrop-blur-md text-stone-800 text-[10px] px-2.5 py-1 rounded-full font-bold shadow-sm flex items-center gap-1 uppercase tracking-wide">
               📍 {listing.district}
             </span>
        </div>

        {/* Bottom Image Text (Size/Type) */}
        <div className="absolute bottom-4 left-4 right-4 text-white">
            <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest mb-1 text-green-300">
                {isEquipment ? listing.equipmentType : listing.area}
            </p>
            <h3 className="font-bold text-xl leading-tight shadow-black/20 drop-shadow-md">
                {isEquipment ? listing.type : listing.type}
            </h3>
        </div>
      </div>
      
      {/* Content Section */}
      <div className="p-5 flex flex-col flex-1 relative bg-white">
        
        {/* Features as Graphics */}
        <div className="flex flex-wrap gap-2 mb-4">
            {listing.features?.slice(0, 3).map((f, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold text-stone-600 bg-stone-100 px-2.5 py-1.5 rounded-lg border border-stone-200">
                    <span className="text-sm">{getFeatureIcon(f)}</span> {f.split(' ')[0]}...
                </span>
            ))}
            {(!listing.features || listing.features.length === 0) && (
                <span className="text-xs text-stone-400 italic">No specific features listed</span>
            )}
        </div>
        
        <p className="text-stone-500 text-sm mb-6 line-clamp-2 leading-relaxed font-medium">
            {listing.description}
        </p>
        
        {/* Footer */}
        <div className="mt-auto pt-4 border-t border-dashed border-stone-200 flex items-center justify-between">
             <div>
                <p className="text-[10px] uppercase font-bold text-stone-400 mb-0.5">
                    {isEquipment ? 'Rate' : 'Terms'}
                </p>
                <p className="text-green-800 font-bold text-lg leading-none">
                    {listing.price || (isEquipment ? listing.dailyRate : "Negotiable")}
                </p>
             </div>

             <button className="w-10 h-10 rounded-full bg-stone-50 text-stone-400 border border-stone-200 flex items-center justify-center group-hover:bg-green-600 group-hover:border-green-600 group-hover:text-white transition-all shadow-sm transform group-hover:rotate-12">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M4.804 21.644A6.707 6.707 0 006 21.75a6.721 6.721 0 003.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 01-.814 1.686.75.75 0 00.44 1.223zM8.25 10.875a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25zM10.875 12a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875-1.125a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25z" clipRule="evenodd" />
                </svg>
             </button>
        </div>
      </div>
    </div>
  );
};

export default LandCard;