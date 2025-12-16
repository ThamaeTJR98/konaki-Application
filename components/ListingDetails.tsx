import React from 'react';
import { LandListing } from '../types';

interface ListingDetailsProps {
  listing: LandListing;
  onStartChat: () => void;
  onStartNegotiation: () => void;
  onBack: () => void;
}

const ListingDetails: React.FC<ListingDetailsProps> = ({ listing, onStartChat, onStartNegotiation, onBack }) => {
  
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
    <div className="h-full bg-stone-50 overflow-y-auto">
      {/* Hero Image */}
      <div className="relative h-64 md:h-80 w-full group">
        <img 
          src={listing.imageUrl || "https://placehold.co/800x600"} 
          alt={listing.type} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        <button 
          onClick={onBack}
          className="absolute top-4 left-4 bg-white/20 backdrop-blur-md text-white p-2 rounded-full hover:bg-white/40 transition-colors z-20"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </button>

        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-wrap gap-2 mb-3">
                <span className={`text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider ${listing.category === 'EQUIPMENT' ? 'bg-orange-500 text-white' : 'bg-green-600 text-white'}`}>
                    {listing.category === 'EQUIPMENT' ? '🚜 Thepa' : '🌱 Mobu'}
                </span>
                <span className="bg-white/20 backdrop-blur-md text-white text-[10px] px-3 py-1 rounded-full font-bold flex items-center gap-1 uppercase tracking-wider">
                📍 {listing.district}
                </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-md">{listing.type}</h1>
            <p className="text-green-100 font-medium text-lg flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm">👤</span>
                {listing.holderName}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8 pb-32">
        
        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-stone-100 flex flex-col items-center text-center">
            <span className="text-3xl mb-2">📐</span>
            <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">Boholo (Size)</span>
            <span className="font-bold text-stone-800 text-sm">{listing.area || listing.equipmentType}</span>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-stone-100 flex flex-col items-center text-center">
            <span className="text-3xl mb-2">💧</span>
            <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">Metsi (Water)</span>
            <span className="font-bold text-stone-800 text-sm">{listing.waterSource || 'N/A'}</span>
          </div>
           <div className="bg-white p-4 rounded-2xl shadow-sm border border-stone-100 flex flex-col items-center text-center">
            <span className="text-3xl mb-2">💰</span>
            <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">Tefo (Price)</span>
            <span className="font-bold text-stone-800 text-sm">{listing.price || listing.dailyRate || 'Negotiable'}</span>
          </div>
           <div className="bg-white p-4 rounded-2xl shadow-sm border border-stone-100 flex flex-col items-center text-center">
            <span className="text-3xl mb-2">🗺️</span>
            <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">Coordinates</span>
            <span className="font-bold text-stone-800 text-xs mt-1 truncate w-full px-2">
                {listing.coordinates ? `${listing.coordinates.lat.toFixed(3)}, ${listing.coordinates.lng.toFixed(3)}` : 'N/A'}
            </span>
          </div>
        </div>

        {/* Negotiation Wizard Call-to-Action */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-100 border border-green-200 rounded-3xl p-8 relative overflow-hidden shadow-sm">
             <div className="absolute -top-10 -right-10 opacity-10">
                 <svg className="w-48 h-48 text-green-900" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
             </div>
             <div className="relative z-10">
                 <h2 className="text-2xl font-bold text-green-900 mb-2">U batla ho etsa Tumellano?</h2>
                 <p className="text-green-800 text-sm mb-6 max-w-lg leading-relaxed">
                     Konaki e ka u thusa ho buisana ka lipehelo tsa bohlokoa joalo ka <strong>Nako (Duration)</strong>, <strong>Tefo (Payment)</strong>, le <strong>Tšebeliso (Usage)</strong>.
                 </p>
                 <button 
                    onClick={onStartNegotiation}
                    className="bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg hover:shadow-green-900/20 transition-all flex items-center gap-2 transform hover:-translate-y-0.5"
                 >
                     <span className="text-lg">🤝</span> Qala Therisano (Start Negotiation)
                 </button>
             </div>
        </div>

        {/* Description */}
        <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm">
          <h2 className="text-lg font-bold text-stone-800 mb-4 uppercase tracking-wide border-b border-stone-100 pb-2">Tlhaloso (Description)</h2>
          <p className="text-stone-600 leading-relaxed text-lg">
            {listing.description}
          </p>
        </div>

        {/* Features List */}
        {listing.features && listing.features.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-stone-800 mb-4 uppercase tracking-wide">Lintlha (Features)</h2>
            <div className="flex flex-wrap gap-3">
              {listing.features.map((feature, idx) => (
                <div key={idx} className="bg-white border border-stone-200 text-stone-700 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-3 shadow-sm">
                  <span className="text-xl">{getFeatureIcon(feature)}</span>
                  {feature}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Map Preview Placeholder */}
        <div className="rounded-3xl overflow-hidden border border-stone-200 h-64 bg-stone-200 relative shadow-inner">
             <iframe 
                width="100%" 
                height="100%" 
                frameBorder="0" 
                scrolling="no" 
                marginHeight={0} 
                marginWidth={0} 
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${(listing.coordinates?.lng || 28.2)-0.1}%2C${(listing.coordinates?.lat || -29.6)-0.1}%2C${(listing.coordinates?.lng || 28.2)+0.1}%2C${(listing.coordinates?.lat || -29.6)+0.1}&amp;layer=mapnik&amp;marker=${listing.coordinates?.lat || -29.6}%2C${listing.coordinates?.lng || 28.2}`} 
                className="w-full h-full opacity-80 hover:opacity-100 transition-opacity"
                title="Mini Map"
            ></iframe>
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm border border-stone-200">
                🗺️ Location View
            </div>
        </div>

      </div>

      {/* Floating Action Button (Mobile) or Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 md:absolute md:bottom-0 p-4 bg-white/90 backdrop-blur-md border-t border-stone-200 z-10">
        <div className="max-w-4xl mx-auto flex gap-4">
             <button 
                onClick={onBack}
                className="hidden md:block px-8 py-3 rounded-xl border-2 border-stone-200 text-stone-500 font-bold hover:bg-stone-50 hover:text-stone-700 transition-colors"
             >
                Khutla
             </button>
             <button 
                onClick={onStartChat}
                className="flex-1 bg-green-900 text-white px-6 py-3 rounded-xl font-bold text-lg shadow-lg hover:bg-green-800 transition-transform active:scale-95 flex items-center justify-center gap-2"
             >
                <span>💬</span> Bua le {listing.holderName.split(' ')[0]}
             </button>
        </div>
      </div>
    </div>
  );
};

export default ListingDetails;