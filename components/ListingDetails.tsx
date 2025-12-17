
import React, { useState } from 'react';
import { LandListing } from '../types';

interface ListingDetailsProps {
  listing: LandListing;
  onStartChat: () => void;
  onStartNegotiation: () => void;
  onBack: () => void;
}

const ListingDetails: React.FC<ListingDetailsProps> = ({ listing, onStartChat, onStartNegotiation, onBack }) => {
  const [imgError, setImgError] = useState(false);
  const isEquipment = listing.category === 'EQUIPMENT';

  const renderFeatureIcon = (feature: string, className: string = "w-5 h-5") => {
    const lower = feature.toLowerCase();
    
    if (lower.match(/metsi|noka|seliba|water/)) {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`${className} text-blue-500`}>
                <path fillRule="evenodd" d="M19.902 4.098a3.75 3.75 0 00-5.304 0l-4.5 4.5a3.75 3.75 0 001.035 6.037.75.75 0 01-.646 1.353 5.25 5.25 0 01-1.449-8.45l4.5-4.5a5.25 5.25 0 117.424 7.424l-1.757 1.757a.75.75 0 11-1.06-1.06l1.757-1.757a3.75 3.75 0 000-5.304z" clipRule="evenodd" />
            </svg>
        );
    }
    if (lower.match(/mobu|soil|lefatse/)) {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`${className} text-amber-700`}>
                <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 00.374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.352-.272-2.636-.759-3.807a.75.75 0 00-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08l-.475-.41z" clipRule="evenodd" />
            </svg>
        );
    }
    if (lower.match(/tsela|road|access/)) {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`${className} text-stone-500`}>
                <path d="M4.5 4.5a3 3 0 00-3 3v9a3 3 0 003 3h8.25a3 3 0 003-3v-9a3 3 0 00-3-3H4.5zM19.94 18.75l-2.69-2.69V7.94l2.69-2.69c.944-.945 2.56-.276 2.56 1.06v11.38c0 1.336-1.616 2.005-2.56 1.06z" />
            </svg>
        );
    }
    if (lower.match(/motlakase|power|electricity/)) {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`${className} text-yellow-500`}>
                <path fillRule="evenodd" d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.75a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z" clipRule="evenodd" />
            </svg>
        );
    }
    if (lower.match(/terata|fenced/)) {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`${className} text-stone-600`}>
                <path fillRule="evenodd" d="M2.25 6a3 3 0 013-3h13.5a3 3 0 013 3v12a3 3 0 01-3 3H5.25a3 3 0 01-3-3V6zm3.97.97a.75.75 0 011.06 0l2.25 2.25a.75.75 0 01-1.06 1.06l-2.25-2.25a.75.75 0 010-1.06zm0 5.25a.75.75 0 011.06 0l2.25 2.25a.75.75 0 01-1.06 1.06l-2.25-2.25a.75.75 0 010-1.06zM10.5 6.75a.75.75 0 01.75-.75h6a.75.75 0 010 1.5h-6a.75.75 0 01-.75-.75zm0 5.25a.75.75 0 01.75-.75h6a.75.75 0 010 1.5h-6a.75.75 0 01-.75-.75zm0 5.25a.75.75 0 01.75-.75h6a.75.75 0 010 1.5h-6a.75.75 0 01-.75-.75z" clipRule="evenodd" />
            </svg>
        );
    }
    if (lower.match(/4x4|plough|tractor|terekere/)) {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`${className} text-orange-600`}>
                <path d="M3.375 3C2.339 3 1.5 3.84 1.5 4.875v.75c0 1.036.84 1.875 1.875 1.875h17.25c1.035 0 1.875-.84 1.875-1.875v-.75C22.5 3.839 21.66 3 20.625 3H3.375z" />
                <path fillRule="evenodd" d="M3.087 9l.54 9.176A3 3 0 006.62 21h10.757a3 3 0 002.995-2.824L20.913 9H3.087zm6.163 3.75A.75.75 0 0110 12h4a.75.75 0 010 1.5h-4a.75.75 0 01-.75-.75z" clipRule="evenodd" />
            </svg>
        );
    }
    
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`${className} text-green-500`}>
            <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
        </svg>
    );
  };

  return (
    <div className="h-full bg-stone-50 overflow-y-auto">
      {/* Hero Image */}
      <div className="relative h-64 md:h-80 w-full group">
        {!imgError ? (
            <img 
            src={listing.imageUrl || "https://placehold.co/800x600"} 
            alt={listing.type} 
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
            />
        ) : (
            <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${isEquipment ? 'from-orange-100 to-amber-200' : 'from-green-100 to-emerald-200'}`}>
                <div className="text-8xl opacity-20 animate-pulse">
                {isEquipment ? '🚜' : '🌱'}
                </div>
            </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/40 to-transparent opacity-90" />
        
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
                <span className={`text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider flex items-center gap-1 ${listing.category === 'EQUIPMENT' ? 'bg-orange-500 text-white' : 'bg-green-600 text-white'}`}>
                    {listing.category === 'EQUIPMENT' ? (
                       <><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M19 8h-1V5h-2v3h-2V5h-2v3h-2V5H8v3H7c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM8 12h2v2H8v-2zm0 4h2v2H8v-2zm4 4h-2v-2h2v2zm0-4h-2v-2h2v2zm4 4h-2v-2h2v2zm0-4h-2v-2h2v2z"/></svg> Thepa</>
                    ) : (
                       <><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg> Mobu</>
                    )}
                </span>
                <span className="bg-white/20 backdrop-blur-md text-white text-[10px] px-3 py-1 rounded-full font-bold flex items-center gap-1 uppercase tracking-wider">
                📍 {listing.district}
                </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-md">{listing.type}</h1>
            <p className="text-green-100 font-medium text-lg flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm border border-white/30">👤</span>
                {listing.holderName}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8 pb-32">
        
        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-stone-100 flex flex-col items-center text-center">
            <span className="text-stone-300 mb-2">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/></svg>
            </span>
            <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">Boholo (Size)</span>
            <span className="font-bold text-stone-800 text-sm mt-1">{listing.area || listing.equipmentType}</span>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-stone-100 flex flex-col items-center text-center">
            <span className="text-blue-300 mb-2">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M19.902 4.098a3.75 3.75 0 00-5.304 0l-4.5 4.5a3.75 3.75 0 001.035 6.037.75.75 0 01-.646 1.353 5.25 5.25 0 01-1.449-8.45l4.5-4.5a5.25 5.25 0 117.424 7.424l-1.757 1.757a.75.75 0 11-1.06-1.06l1.757-1.757a3.75 3.75 0 000-5.304z" clipRule="evenodd" /></svg>
            </span>
            <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">Metsi (Water)</span>
            <span className="font-bold text-stone-800 text-sm mt-1">{listing.waterSource || 'N/A'}</span>
          </div>
           <div className="bg-white p-4 rounded-2xl shadow-sm border border-stone-100 flex flex-col items-center text-center">
            <span className="text-green-600 mb-2">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </span>
            <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">Tefo (Price)</span>
            <span className="font-bold text-stone-800 text-sm mt-1">{listing.price || listing.dailyRate || 'Negotiable'}</span>
          </div>
           <div className="bg-white p-4 rounded-2xl shadow-sm border border-stone-100 flex flex-col items-center text-center">
            <span className="text-stone-300 mb-2">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
            </span>
            <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">Coordinates</span>
            <span className="font-bold text-stone-800 text-xs mt-2 truncate w-full px-2 bg-stone-50 py-1 rounded">
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
                  {renderFeatureIcon(feature)}
                  {feature}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Map Preview Placeholder */}
        <div className="rounded-3xl overflow-hidden border border-stone-200 h-80 md:h-96 bg-stone-200 relative shadow-inner">
             <iframe 
                width="100%" 
                height="100%" 
                frameBorder="0" 
                scrolling="no" 
                marginHeight={0} 
                marginWidth={0} 
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${(listing.coordinates?.lng || 28.2)-0.05}%2C${(listing.coordinates?.lat || -29.6)-0.05}%2C${(listing.coordinates?.lng || 28.2)+0.05}%2C${(listing.coordinates?.lat || -29.6)+0.05}&amp;layer=mapnik&amp;marker=${listing.coordinates?.lat || -29.6}%2C${listing.coordinates?.lng || 28.2}`} 
                className="w-full h-full opacity-100"
                title="Mini Map"
            ></iframe>
            
            <a 
                href={`https://www.openstreetmap.org/?mlat=${listing.coordinates?.lat}&mlon=${listing.coordinates?.lng}#map=15/${listing.coordinates?.lat}/${listing.coordinates?.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute top-4 right-4 bg-white/90 backdrop-blur px-4 py-2 rounded-xl text-xs font-bold shadow-sm border border-stone-200 flex items-center gap-2 hover:bg-white transition-colors text-stone-800"
            >
                <span>🗺️</span> View Larger Map
            </a>
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
