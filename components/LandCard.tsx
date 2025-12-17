
import React, { useState } from 'react';
import { Listing } from '../types';

interface LandCardProps {
  listing: Listing;
  onClick: (listing: Listing) => void;
  isOwner?: boolean;
  onEdit?: (listing: Listing) => void;
  onDelete?: (listing: Listing) => void;
}

const LandCard: React.FC<LandCardProps> = ({ listing, onClick, isOwner, onEdit, onDelete }) => {
  const isEquipment = listing.category === 'EQUIPMENT';
  const [imgError, setImgError] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const renderFeatureIcon = (feature: string, className: string = "w-3 h-3") => {
    const lower = feature.toLowerCase();
    
    if (lower.match(/metsi|noka|seliba|water/)) { return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`${className} text-blue-500`}><path fillRule="evenodd" d="M19.902 4.098a3.75 3.75 0 00-5.304 0l-4.5 4.5a3.75 3.75 0 001.035 6.037.75.75 0 01-.646 1.353 5.25 5.25 0 01-1.449-8.45l4.5-4.5a5.25 5.25 0 117.424 7.424l-1.757 1.757a.75.75 0 11-1.06-1.06l1.757-1.757a3.75 3.75 0 000-5.304z" clipRule="evenodd" /></svg>; }
    if (lower.match(/mobu|soil|lefatse/)) { return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`${className} text-amber-700`}><path fillRule="evenodd" d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 00.374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.352-.272-2.636-.759-3.807a.75.75 0 00-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08l-.475-.41z" clipRule="evenodd" /></svg>; }
    if (lower.match(/tsela|road|access/)) { return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`${className} text-stone-500`}><path d="M4.5 4.5a3 3 0 00-3 3v9a3 3 0 003 3h8.25a3 3 0 003-3v-9a3 3 0 00-3-3H4.5zM19.94 18.75l-2.69-2.69V7.94l2.69-2.69c.944-.945 2.56-.276 2.56 1.06v11.38c0 1.336-1.616 2.005-2.56 1.06z" /></svg>; }
    if (lower.match(/motlakase|power|electricity/)) { return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`${className} text-yellow-500`}><path fillRule="evenodd" d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.75a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z" clipRule="evenodd" /></svg>; }
    if (lower.match(/terata|fenced/)) { return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`${className} text-stone-600`}><path fillRule="evenodd" d="M2.25 6a3 3 0 013-3h13.5a3 3 0 013 3v12a3 3 0 01-3 3H5.25a3 3 0 01-3-3V6zm3.97.97a.75.75 0 011.06 0l2.25 2.25a.75.75 0 01-1.06 1.06l-2.25-2.25a.75.75 0 010-1.06zm0 5.25a.75.75 0 011.06 0l2.25 2.25a.75.75 0 01-1.06 1.06l-2.25-2.25a.75.75 0 010-1.06zM10.5 6.75a.75.75 0 01.75-.75h6a.75.75 0 010 1.5h-6a.75.75 0 01-.75-.75zm0 5.25a.75.75 0 01.75-.75h6a.75.75 0 010 1.5h-6a.75.75 0 01-.75-.75zm0 5.25a.75.75 0 01.75-.75h6a.75.75 0 010 1.5h-6a.75.75 0 01-.75-.75z" clipRule="evenodd" /></svg>; }
    if (lower.match(/4x4|plough|tractor|terekere/)) { return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`${className} text-orange-600`}><path d="M3.375 3C2.339 3 1.5 3.84 1.5 4.875v.75c0 1.036.84 1.875 1.875 1.875h17.25c1.035 0 1.875-.84 1.875-1.875v-.75C22.5 3.839 21.66 3 20.625 3H3.375z" /><path fillRule="evenodd" d="M3.087 9l.54 9.176A3 3 0 006.62 21h10.757a3 3 0 002.995-2.824L20.913 9H3.087zm6.163 3.75A.75.75 0 0110 12h4a.75.75 0 010 1.5h-4a.75.75 0 01-.75-.75z" clipRule="evenodd" /></svg>; }
    return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`${className} text-green-500`}><path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" /></svg>;
  };

  return (
    <div 
      onClick={() => onClick(listing)}
      className="group bg-white rounded-3xl shadow-sm border border-stone-100 cursor-pointer hover:shadow-xl hover:-translate-y-1 hover:border-green-500/30 transition-all duration-300 overflow-hidden flex flex-col h-full relative"
    >
      {isOwner && (
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm text-stone-600 flex items-center justify-center hover:bg-white shadow"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M10 3a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM10 8.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM11.5 15.5a1.5 1.5 0 10-3 0 1.5 1.5 0 003 0z" /></svg>
          </button>
          {showMenu && (
            <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-stone-200 py-1">
              <button onClick={(e) => { e.stopPropagation(); onEdit?.(listing); setShowMenu(false); }} className="w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-stone-100 flex items-center gap-2"><span>✏️</span> Edit</button>
              <button onClick={(e) => { e.stopPropagation(); onDelete?.(listing); setShowMenu(false); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"><span>🗑️</span> Delete</button>
            </div>
          )}
        </div>
      )}

      <div className="relative h-52 overflow-hidden bg-stone-100" onMouseLeave={() => setShowMenu(false)}>
        {!imgError ? (
            <img src={listing.imageUrl || "https://placehold.co/600x400?text=Konaki"} alt={listing.type} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out" onError={() => setImgError(true)} />
        ) : (
            <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${isEquipment ? 'from-orange-100 to-amber-200' : 'from-green-100 to-emerald-200'}`}>
                 <div className="text-6xl opacity-20">{isEquipment ? '🚜' : '🌱'}</div>
            </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-transparent to-transparent opacity-90" />
        <div className="absolute top-3 left-3 flex gap-2">
             <div className={`backdrop-blur-md px-3 py-1 rounded-full shadow-sm border border-white/10 flex items-center gap-1 ${isEquipment ? 'bg-orange-500/90 text-white' : 'bg-green-600/90 text-white'}`}>
                {isEquipment ? <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M19 8h-1V5h-2v3h-2V5h-2v3h-2V5H8v3H7c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM8 12h2v2H8v-2zm0 4h2v2H8v-2zm4 4h-2v-2h2v2zm0-4h-2v-2h2v2zm4 4h-2v-2h2v2zm0-4h-2v-2h2v2z"/></svg> : <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>}
                <span className="text-[10px] font-bold uppercase tracking-wider">{isEquipment ? 'Thepa' : 'Mobu'}</span>
             </div>
        </div>

        {listing.isVerified && (
            <div className="absolute top-3 right-1/2 translate-x-1/2">
                <div className="bg-blue-600/90 backdrop-blur-md text-white px-2 py-1 rounded-full shadow-sm flex items-center gap-1 border border-white/20">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                    <span className="text-[10px] font-bold uppercase tracking-wide">Verified</span>
                </div>
            </div>
        )}

        <div className="absolute bottom-4 left-4 right-4 text-white">
            <p className="text-[10px] font-bold opacity-90 uppercase tracking-widest mb-1 text-green-300 flex items-center gap-1">
                {isEquipment ? (
                    <><span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>{listing.equipmentType}</>
                ) : (
                    <><span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>{listing.area}</>
                )}
            </p>
            <h3 className="font-bold text-xl leading-tight drop-shadow-md">
                {listing.type}
            </h3>
        </div>
      </div>
      
      <div className="p-5 flex flex-col flex-1 relative bg-white">
        
        <div className="flex flex-wrap gap-2 mb-4 min-h-[32px]">
            {listing.features?.slice(0, 3).map((f, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold text-stone-600 bg-stone-50 px-2.5 py-1.5 rounded-lg border border-stone-100">
                    {renderFeatureIcon(f)}
                    <span className="truncate max-w-[80px]">{f.split(' ')[0]}</span>
                </span>
            ))}
            {(!listing.features || listing.features.length === 0) && (
                <span className="text-xs text-stone-400 italic">No specific features</span>
            )}
        </div>
        
        <p className="text-stone-500 text-sm mb-6 line-clamp-2 leading-relaxed font-medium">
            {listing.description}
        </p>
        
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
                  <path fillRule="evenodd" d="M4.804 21.644A6.707 6.707 0 006 21.75a6.721 6.721 0 003.583-1.029c.774.182 1.584.272 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 01-.814 1.686.75.75 0 00.44 1.223zM8.25 10.875a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25zM10.875 12a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875-1.125a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25z" clipRule="evenodd" />
                </svg>
             </button>
        </div>
      </div>
    </div>
  );
};

export default LandCard;
