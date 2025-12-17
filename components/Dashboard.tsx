
import React, { useState, useRef } from 'react';
import { UserRole, Listing, FarmerProfile, Language } from '../types';
import { DISTRICTS } from '../constants';
import { translations } from '../translations';
import LandCard from './LandCard';
import MapComponent from './MapComponent';
import { generateListingFromImage } from '../services/geminiService';
import Logo from './Logo';

interface DashboardProps {
  role: UserRole;
  listings: Listing[];
  onSelectListing: (listing: Listing) => void;
  onAddListing: (listing: Listing) => void;
  onOpenAdvisor?: () => void;
  onStartLiveCall?: () => void;
  onStartMatching?: (profile: FarmerProfile) => void;
  language: Language;
}

const Dashboard: React.FC<DashboardProps> = ({ role, listings, onSelectListing, onAddListing, onOpenAdvisor, onStartLiveCall, onStartMatching, language }) => {
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Bohle');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showMyListingsOnly, setShowMyListingsOnly] = useState(false);
  
  const t = (key: string) => translations[key]?.[language] || key;

  // Profile State
  const [profileCrops, setProfileCrops] = useState('');
  const [profileBudget, setProfileBudget] = useState('');
  const [profileDistrict, setProfileDistrict] = useState(DISTRICTS[0]);

  const [isLocating, setIsLocating] = useState(false);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);

  // Form State
  const [newType, setNewType] = useState('Masimo');
  const [newEquipmentType, setNewEquipmentType] = useState('Terekere'); 
  const [newDistrict, setNewDistrict] = useState(DISTRICTS[0]);
  const [newArea, setNewArea] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newFeatures, setNewFeatures] = useState<string[]>([]);
  const [coordinates, setCoordinates] = useState<{lat: number, lng: number} | null>(null);
  const [isFormCVerified, setIsFormCVerified] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Filter Logic Updated
  const filteredListings = listings.filter(l => {
      // 1. Filter by ownership if toggle is on
      if (showMyListingsOnly) {
          return l.holderName.includes("Uena");
      }
      // 2. Filter by District
      const matchDistrict = selectedDistrict === 'Bohle' || l.district === selectedDistrict;
      return matchDistrict;
  });

  const handleGetLocation = () => {
      if (!navigator.geolocation) {
          alert("Geolocation is not supported by your browser");
          return;
      }
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
          (position) => {
              setCoordinates({
                  lat: position.coords.latitude,
                  lng: position.coords.longitude
              });
              setIsLocating(false);
          },
          () => {
              alert("Unable to retrieve your location. Using default Maseru coordinates.");
              setCoordinates({ lat: -29.31, lng: 27.48 }); // Fallback
              setIsLocating(false);
          }
      );
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onloadend = async () => {
          const base64String = reader.result as string;
          setPreviewImage(base64String);
          
          // Trigger AI Analysis
          setIsAnalyzingImage(true);
          const category = role === UserRole.PROVIDER ? 'EQUIPMENT' : 'LAND';
          const base64Data = base64String.split(',')[1];
          
          const result = await generateListingFromImage(base64Data, category);
          
          if (result.description) {
              setNewDesc(result.description);
              setNewFeatures(result.features);
          }
          setIsAnalyzingImage(false);
      };
      reader.readAsDataURL(file);
  };

  const handleCreateListing = (e: React.FormEvent) => {
    e.preventDefault();
    
    const isProvider = role === UserRole.PROVIDER;

    const listing: Listing = {
        id: Date.now().toString(),
        category: isProvider ? 'EQUIPMENT' : 'LAND',
        type: isProvider ? newEquipmentType : newType,
        district: newDistrict,
        area: isProvider ? undefined : newArea + " Hectares",
        equipmentType: isProvider ? newEquipmentType : undefined,
        description: newDesc,
        features: newFeatures,
        holderName: role === UserRole.PROVIDER ? "Uena (Mofani)" : "Uena (Mong'a Mobu)",
        imageUrl: previewImage || (isProvider 
            ? "https://images.unsplash.com/photo-1592869675276-2f0851509923?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
            : "https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"),
        coordinates: coordinates || { lat: -29.31, lng: 27.48 },
        price: newPrice || (isProvider ? "M2000 / day" : "Negotiable"),
        isVerified: isFormCVerified
    };
    onAddListing(listing);
    setShowAddModal(false);
    
    // Reset form
    setNewDesc('');
    setNewArea('');
    setCoordinates(null);
    setNewPrice('');
    setNewFeatures([]);
    setPreviewImage(null);
    setIsFormCVerified(false);
    
    // Auto-switch to "My Listings" view so user sees what they added
    if (canAddListing) {
        setShowMyListingsOnly(true);
    }
  };
  
  const handleStartProfile = () => {
      setShowProfileModal(true);
  }
  
  const handleSubmitProfile = (e: React.FormEvent) => {
      e.preventDefault();
      if (!onStartMatching) return;
      
      const profile: FarmerProfile = {
          crops: profileCrops,
          budget: profileBudget,
          preferredDistricts: [profileDistrict]
      };
      
      setShowProfileModal(false);
      onStartMatching(profile);
  }

  const getWelcomeTitle = () => {
      switch(role) {
          case UserRole.FARMER: return t("find_assets");
          case UserRole.PROVIDER: return t("manage_equipment");
          default: return t("manage_land");
      }
  };

  const getWelcomeDesc = () => {
      switch(role) {
          case UserRole.FARMER: return language === 'st' ? "Batla mobu kapa lisebelisoa tsa temo." : "Find land or farming equipment.";
          case UserRole.PROVIDER: return language === 'st' ? "Kenya lisebelisoa tsa hau hore lihoai li li hire." : "List your equipment for farmers to rent.";
          default: return language === 'st' ? "Kenya mobu oa hau hore o fumane bahirisi." : "List your land to find tenants.";
      }
  };

  const canAddListing = role === UserRole.LANDHOLDER || role === UserRole.PROVIDER;

  return (
    <div className="h-full flex flex-col bg-stone-50 relative">
      {/* Dashboard Header & Filters */}
      <div className="p-4 sm:p-6 bg-white border-b border-stone-200 sticky top-0 z-10 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
            <div>
                <h2 className="text-2xl font-bold text-stone-800">{getWelcomeTitle()}</h2>
                <p className="text-stone-500 text-sm">{getWelcomeDesc()}</p>
            </div>
            
            <div className="flex gap-2 shrink-0">
                {/* My Listings Toggle for Owners */}
                {canAddListing && (
                    <div className="flex bg-stone-100 p-1 rounded-lg">
                        <button 
                            onClick={() => setShowMyListingsOnly(false)}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase transition-all ${!showMyListingsOnly ? 'bg-white shadow text-stone-800' : 'text-stone-400 hover:text-stone-600'}`}
                        >
                            {t('all')}
                        </button>
                        <button 
                            onClick={() => setShowMyListingsOnly(true)}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase transition-all ${showMyListingsOnly ? 'bg-white shadow text-green-700' : 'text-stone-400 hover:text-stone-600'}`}
                        >
                            {t('mine')}
                        </button>
                    </div>
                )}

                <div className="flex bg-stone-100 p-1 rounded-lg">
                    <button 
                        onClick={() => setViewMode('list')}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'list' ? 'bg-white shadow text-green-700' : 'text-stone-500 hover:text-stone-700'}`}
                    >
                        {t('list')}
                    </button>
                    <button 
                        onClick={() => setViewMode('map')}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'map' ? 'bg-white shadow text-green-700' : 'text-stone-500 hover:text-stone-700'}`}
                    >
                        {t('map')}
                    </button>
                </div>
            </div>
        </div>

        {/* Filters - Hide District Filter if viewing "My Listings" only */}
        {!showMyListingsOnly && (
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                <button 
                    onClick={() => setSelectedDistrict('Bohle')}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                        selectedDistrict === 'Bohle' ? 'bg-green-700 text-white shadow-md' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                >
                    {t('all_districts')}
                </button>
                {DISTRICTS.map(d => (
                    <button 
                    key={d}
                    onClick={() => setSelectedDistrict(d)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                        selectedDistrict === d ? 'bg-green-700 text-white shadow-md' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                >
                    {d}
                </button>
                ))}
            </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {viewMode === 'list' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
                {filteredListings.length > 0 ? (
                    filteredListings.map(listing => (
                    <LandCard 
                        key={listing.id} 
                        listing={listing} 
                        onClick={onSelectListing} 
                    />
                    ))
                ) : (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-stone-400">
                        <span className="text-4xl mb-2">🚜</span>
                        {showMyListingsOnly ? (
                            <p>Ha u so kenye letho. Tobetsa "+" ho qala.</p>
                        ) : (
                            <p>Ha ho letho le fumanehang seterekeng sena hajoale.</p>
                        )}
                    </div>
                )}
            </div>
        ) : (
            <div className="h-full w-full rounded-2xl overflow-hidden border border-stone-200 shadow-inner relative bg-stone-200">
                <MapComponent 
                    listings={filteredListings} 
                    onSelectListing={onSelectListing}
                />
            </div>
        )}
      </div>

      {/* Global Actions (Advisor & Call & Match) */}
      {role === UserRole.FARMER && (
          <div className="fixed bottom-20 md:bottom-8 right-6 flex flex-col gap-4 z-20">
              
              {/* Call Konaki (Live) */}
              {onStartLiveCall && (
                  <button 
                    onClick={onStartLiveCall}
                    className="bg-green-600 text-white p-4 rounded-full shadow-lg border-2 border-green-500 hover:bg-green-700 hover:scale-110 transition-all flex items-center justify-center w-14 h-14"
                    title="Bua le Konaki (Live Call)"
                  >
                     <svg className="w-6 h-6 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  </button>
              )}

              {/* Chat Advisor */}
              {onOpenAdvisor && (
                  <button 
                    onClick={onOpenAdvisor}
                    className="bg-white text-green-800 p-4 rounded-full shadow-lg border border-green-200 hover:scale-105 transition-all flex items-center justify-center w-14 h-14"
                    title="Botsa Konaki Advisor (Chat)"
                  >
                     <div className="w-8 h-8 text-green-900">
                         <Logo isSpeaking={true} />
                     </div>
                  </button>
              )}
              
              {/* SMART MATCH (Tinder Style) */}
              {onStartMatching && (
                   <button 
                    onClick={handleStartProfile}
                    className="bg-gradient-to-r from-pink-500 to-orange-500 text-white p-4 rounded-full shadow-lg hover:scale-110 transition-all flex items-center justify-center w-14 h-14 animate-fade-in-up"
                    title="Smart Match"
                  >
                     <span className="text-2xl">🔥</span>
                  </button>
              )}
          </div>
      )}

      {/* Add Listing FAB */}
      {canAddListing && (
        <button 
            onClick={() => setShowAddModal(true)}
            className="fixed bottom-20 md:bottom-8 right-6 bg-green-700 text-white p-4 rounded-full shadow-lg hover:bg-green-800 hover:scale-105 transition-all z-20 flex items-center justify-center w-14 h-14"
        >
          <span className="text-3xl pb-1">+</span>
        </button>
      )}

      {/* Add Listing Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
                <h3 className="text-xl font-bold text-stone-800 mb-4">
                    {role === UserRole.PROVIDER ? (language === 'st' ? 'Kenya Lisebelisoa' : 'Add Equipment') : (language === 'st' ? 'Kenya Mobu' : 'Add Land')}
                </h3>
                
                <form onSubmit={handleCreateListing} className="space-y-4">
                    
                    {/* Image Upload for AI Analysis */}
                    <div className="bg-stone-50 border-2 border-dashed border-stone-300 rounded-lg p-4 text-center relative hover:bg-stone-100 transition-colors">
                        <input 
                            type="file" 
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        {isAnalyzingImage ? (
                            <div className="flex flex-col items-center text-green-600 animate-pulse">
                                <span className="text-xl">✨</span>
                                <span className="text-xs font-bold">Konaki ea hlahloba...</span>
                            </div>
                        ) : previewImage ? (
                            <div className="relative h-32 w-full">
                                <img src={previewImage} alt="Preview" className="h-full w-full object-cover rounded-md" />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-xs font-bold opacity-0 hover:opacity-100 transition-opacity">Change Image</div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center text-stone-500">
                                <span className="text-2xl mb-1">📸</span>
                                <span className="text-sm font-bold">Nka Setšoantšo (Upload Photo)</span>
                                <span className="text-[10px] text-green-600 mt-1">Konaki will auto-fill description!</span>
                            </div>
                        )}
                    </div>

                    {role === UserRole.PROVIDER ? (
                        <div>
                            <label className="block text-sm font-medium text-stone-600 mb-1">Mofuta oa Thepa (Equipment Type)</label>
                            <select 
                                value={newEquipmentType} 
                                onChange={(e) => setNewEquipmentType(e.target.value)}
                                className="w-full border border-stone-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none"
                            >
                                <option value="Terekere">Terekere (Tractor)</option>
                                <option value="Kotulo">Mochini oa Kotulo (Harvester)</option>
                                <option value="Jala">Mochini oa ho Jala (Planter)</option>
                                <option value="Lipalangoang">Lipalangoang (Transport)</option>
                            </select>
                        </div>
                    ) : (
                        <div>
                            <label className="block text-sm font-medium text-stone-600 mb-1">Mofuta oa Mobu (Land Type)</label>
                            <select 
                                value={newType} 
                                onChange={(e) => setNewType(e.target.value)}
                                className="w-full border border-stone-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none"
                            >
                                <option value="Masimo">Masimo (Fields)</option>
                                <option value="Serapa">Serapa (Orchard)</option>
                                <option value="Setsha">Setsha (Site)</option>
                                <option value="Lakhula">Lakhula (Fallow)</option>
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-stone-600 mb-1">Setereke (District)</label>
                        <select 
                             value={newDistrict} 
                             onChange={(e) => setNewDistrict(e.target.value)}
                             className="w-full border border-stone-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none"
                        >
                            {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>

                    {role !== UserRole.PROVIDER && (
                        <div>
                            <label className="block text-sm font-medium text-stone-600 mb-1">Boholo (Size in Hectares)</label>
                            <input 
                                type="number" 
                                value={newArea}
                                onChange={(e) => setNewArea(e.target.value)}
                                className="w-full border border-stone-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none"
                                placeholder="e.g. 5"
                                required
                            />
                        </div>
                    )}

                     <div>
                        <label className="block text-sm font-medium text-stone-600 mb-1">
                            {role === UserRole.PROVIDER ? "Theko (Rate)" : "Tefo (Terms)"}
                        </label>
                        <input 
                            type="text" 
                            value={newPrice}
                            onChange={(e) => setNewPrice(e.target.value)}
                            className="w-full border border-stone-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none"
                            placeholder={role === UserRole.PROVIDER ? "e.g. M800/Hectare" : "e.g. Seahlolo 50/50"}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-stone-600 mb-1">Sebaka (Location)</label>
                        <button 
                            type="button"
                            onClick={handleGetLocation}
                            disabled={isLocating}
                            className={`w-full py-2.5 rounded-lg border flex items-center justify-center gap-2 transition-colors ${
                                coordinates 
                                ? 'border-green-500 text-green-700 bg-green-50' 
                                : 'border-stone-300 text-stone-600 hover:bg-stone-50'
                            }`}
                        >
                            {isLocating ? 'Ea batla...' : coordinates ? '📍 Location Saved' : '📍 Use GPS Location'}
                        </button>
                    </div>
                    
                    {role !== UserRole.PROVIDER && (
                        <div className="flex items-center gap-3 bg-blue-50 p-3 rounded-lg border border-blue-100">
                             <input 
                                type="checkbox" 
                                id="formC"
                                checked={isFormCVerified}
                                onChange={(e) => setIsFormCVerified(e.target.checked)}
                                className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                             />
                             <label htmlFor="formC" className="text-sm text-stone-700">
                                 Ke na le <strong>Form C</strong> kapa Lease.
                                 <span className="block text-xs text-stone-500">I have valid proof of allocation.</span>
                             </label>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-stone-600 mb-1">Tlhaloso (Description)</label>
                        <textarea 
                            value={newDesc}
                            onChange={(e) => setNewDesc(e.target.value)}
                            className="w-full border border-stone-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none"
                            rows={3}
                            placeholder={role === UserRole.PROVIDER ? "Hlalosa boemo ba terekere..." : "Hlalosa mobu oa hau..."}
                            required
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button 
                            type="button" 
                            onClick={() => setShowAddModal(false)}
                            className="flex-1 py-2 bg-stone-100 text-stone-600 rounded-lg font-medium hover:bg-stone-200"
                        >
                            Hlakola
                        </button>
                        <button 
                            type="submit" 
                            className="flex-1 py-2 bg-green-700 text-white rounded-lg font-bold hover:bg-green-800"
                        >
                            {t('add_listing')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* Profile Setup Modal for Matching */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-stone-900/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-fade-in-up relative overflow-hidden">
                
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pink-500 to-orange-500"></div>
                
                <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center text-3xl shadow-inner">
                        🕵🏽
                    </div>
                </div>

                <h3 className="text-xl font-bold text-center text-stone-900 mb-1">Smart Match Setup</h3>
                <p className="text-center text-stone-500 text-sm mb-6">Konaki needs to know what you are looking for.</p>
                
                <form onSubmit={handleSubmitProfile} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-stone-500 mb-1 uppercase tracking-wide">U batla ho lema eng? (Crops)</label>
                        <input 
                            type="text" 
                            value={profileCrops}
                            onChange={(e) => setProfileCrops(e.target.value)}
                            className="w-full border border-stone-300 rounded-xl p-3 focus:ring-2 focus:ring-pink-500 outline-none bg-stone-50"
                            placeholder="e.g. Poone, Linaoa, Koro"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-stone-500 mb-1 uppercase tracking-wide">Budget ea hau? (Budget)</label>
                        <input 
                            type="text" 
                            value={profileBudget}
                            onChange={(e) => setProfileBudget(e.target.value)}
                            className="w-full border border-stone-300 rounded-xl p-3 focus:ring-2 focus:ring-pink-500 outline-none bg-stone-50"
                            placeholder="e.g. M5000 / Seahlolo"
                            required
                        />
                    </div>
                    
                    <div>
                        <label className="block text-xs font-bold text-stone-500 mb-1 uppercase tracking-wide">Setereke (Preferred District)</label>
                        <select 
                             value={profileDistrict} 
                             onChange={(e) => setProfileDistrict(e.target.value)}
                             className="w-full border border-stone-300 rounded-xl p-3 focus:ring-2 focus:ring-pink-500 outline-none bg-stone-50"
                        >
                            {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>

                    <button 
                        type="submit" 
                        className="w-full py-3 mt-2 bg-gradient-to-r from-pink-600 to-orange-500 text-white rounded-xl font-bold hover:opacity-90 transition-opacity shadow-lg flex items-center justify-center gap-2"
                    >
                        <span>🚀</span> Fumana Matches
                    </button>
                    
                     <button 
                        type="button"
                        onClick={() => setShowProfileModal(false)}
                        className="w-full py-2 text-sm text-stone-400 font-medium hover:text-stone-600"
                    >
                        Cancel
                    </button>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
