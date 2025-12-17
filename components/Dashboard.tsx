
import React, { useState, useRef, useEffect } from 'react';
import { UserRole, Listing, FarmerProfile, Language, ViewState } from '../types';
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
  onUpdateListing: (listing: Listing) => void;
  onDeleteListing: (listingId: string) => void;
  onOpenAdvisor?: () => void;
  onStartLiveCall?: () => void;
  onStartMatching?: (profile: FarmerProfile) => void;
  onOpenDisputes?: () => void;
  language: Language;
}

const FabButton = ({ label, icon, onClick }: { label: string, icon: string, onClick?: () => void }) => (
    <button 
        onClick={onClick} 
        title={label} // Keep for accessibility
        aria-label={label}
        className="w-14 h-14 rounded-full bg-white text-3xl shadow-lg flex items-center justify-center hover:bg-stone-100 transition-transform active:scale-95 animate-fade-in-up"
    >
        {icon}
    </button>
);

const Dashboard: React.FC<DashboardProps> = ({ role, listings, onSelectListing, onAddListing, onUpdateListing, onDeleteListing, onOpenAdvisor, onStartLiveCall, onStartMatching, onOpenDisputes, language }) => {
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Bohle');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showMyListingsOnly, setShowMyListingsOnly] = useState(false);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [isFabMenuOpen, setIsFabMenuOpen] = useState(false);
  
  const t = (key: string) => translations[key]?.[language] || key;
  const contentRef = useRef<HTMLDivElement>(null);

  // Effect to close FAB menu on scroll
  useEffect(() => {
    const contentEl = contentRef.current;
    const handleScroll = () => {
        if (isFabMenuOpen) {
            setIsFabMenuOpen(false);
        }
    };
    contentEl?.addEventListener('scroll', handleScroll);
    return () => {
        contentEl?.removeEventListener('scroll', handleScroll);
    };
  }, [isFabMenuOpen]);

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
  
  const resetForm = () => {
      setNewType('Masimo');
      setNewEquipmentType('Terekere');
      setNewDistrict(DISTRICTS[0]);
      setNewArea('');
      setNewPrice('');
      setNewDesc('');
      setNewFeatures([]);
      setCoordinates(null);
      setIsFormCVerified(false);
      setPreviewImage(null);
  };

  useEffect(() => {
    if (showAddModal && editingListing) {
      const isProvider = editingListing.category === 'EQUIPMENT';
      if (isProvider) {
        setNewEquipmentType(editingListing.equipmentType || 'Terekere');
      } else {
        setNewType(editingListing.type || 'Masimo');
        setNewArea(editingListing.area?.replace(' Hectares', '') || '');
        setIsFormCVerified(editingListing.isVerified || false);
      }
      setNewDistrict(editingListing.district);
      setNewDesc(editingListing.description);
      setNewPrice(editingListing.price || editingListing.dailyRate || '');
      setNewFeatures(editingListing.features || []);
      setPreviewImage(editingListing.imageUrl || null);
      setCoordinates(editingListing.coordinates || null);
    }
  }, [showAddModal, editingListing]);

  // Filter Logic Updated
  const filteredListings = listings.filter(l => {
      // 1. Filter by ownership if toggle is on
      if (showMyListingsOnly) {
          // This is a simple check based on name. A real app would use a user ID.
          return l.holderName.toLowerCase().includes("uena");
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

  const handleSubmitListing = (e: React.FormEvent) => {
    e.preventDefault();
    const isProvider = role === UserRole.PROVIDER;

    const listingData = {
        category: (isProvider ? 'EQUIPMENT' : 'LAND') as 'LAND' | 'EQUIPMENT',
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

    if (editingListing) {
        onUpdateListing({ ...editingListing, ...listingData });
    } else {
        onAddListing({ ...listingData, id: `listing_${Date.now()}` });
    }

    handleCloseModal();
    const canAddListing = role === UserRole.LANDHOLDER || role === UserRole.PROVIDER;
    if (canAddListing) setShowMyListingsOnly(true);
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

  const handleOpenAddModal = () => {
    setEditingListing(null);
    resetForm();
    setShowAddModal(true);
  };

  const handleOpenEditModal = (listing: Listing) => {
    setEditingListing(listing);
    setShowAddModal(true);
  };

  const handleDelete = (listing: Listing) => {
    if (window.confirm(`Are you sure you want to delete "${listing.type}"? This cannot be undone.`)) {
        onDeleteListing(listing.id);
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingListing(null);
    resetForm();
  };

  const getWelcomeTitle = () => {
      switch(role) {
          case UserRole.FARMER: return t("find_assets");
          case UserRole.PROVIDER: return t("manage_equipment");
          default: return t("manage_land");
      }
  };

  const getWelcomeDesc = () => {
      switch(role) {
          case UserRole.FARMER: return language === 'st' ? "Batla mobu kapa lisebelisoa tse fumanehang literekeng tsohle tsa Lesotho." : "Browse available land and equipment across all districts of Lesotho.";
          case UserRole.PROVIDER: return language === 'st' ? "Kenya lisebelisoa tsa hau hore li fumanehe ho lihoai." : "List your equipment to make it available for farmers.";
          default: return language === 'st' ? "Kenya mobu oa hau hore lihoai li o fumane." : "List your land to connect with farmers.";
      }
  };

  const canAddListing = role === UserRole.LANDHOLDER || role === UserRole.PROVIDER;

  return (
    <div className="h-full flex flex-col bg-stone-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-stone-200 p-4 sm:p-6 z-10 shrink-0">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-stone-900">{getWelcomeTitle()}</h1>
          <p className="text-stone-500 text-sm">{getWelcomeDesc()}</p>
        </div>
      </header>

      {/* Filters & Controls */}
      <div className="p-4 sm:px-6 bg-stone-100 z-10 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex-1">
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full sm:w-64 p-2 border border-stone-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500"
            >
              <option value="Bohle">{t('all_districts')}</option>
              {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="flex gap-2 items-center">
            {canAddListing && (
              <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-stone-200">
                <button onClick={() => setShowMyListingsOnly(false)} className={`px-3 py-1 text-sm rounded-md ${!showMyListingsOnly ? 'bg-green-600 text-white shadow' : 'text-stone-600'}`}>
                  {t('all')}
                </button>
                <button onClick={() => setShowMyListingsOnly(true)} className={`px-3 py-1 text-sm rounded-md ${showMyListingsOnly ? 'bg-green-600 text-white shadow' : 'text-stone-600'}`}>
                  {t('mine')}
                </button>
              </div>
            )}
            <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-stone-200">
              <button onClick={() => setViewMode('list')} className={`px-3 py-1 text-sm rounded-md ${viewMode === 'list' ? 'bg-green-600 text-white shadow' : 'text-stone-600'}`}>
                {t('list')}
              </button>
              <button onClick={() => setViewMode('map')} className={`px-3 py-1 text-sm rounded-md ${viewMode === 'map' ? 'bg-green-600 text-white shadow' : 'text-stone-600'}`}>
                {t('map')}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <main ref={contentRef} className={`flex-1 overflow-y-auto relative ${viewMode === 'list' ? 'p-4 sm:p-6' : ''}`}>
        {viewMode === 'list' ? (
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredListings.map(listing => (
              <LandCard 
                key={listing.id} 
                listing={listing} 
                onClick={onSelectListing} 
                isOwner={listing.holderName.includes("Uena")}
                onEdit={handleOpenEditModal}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <MapComponent listings={filteredListings} onSelectListing={onSelectListing} />
        )}
        {filteredListings.length === 0 && viewMode === 'list' && (
          <div className="text-center py-20 text-stone-400">
            <span className="text-5xl">🤷‍♀️</span>
            <p className="mt-4 font-medium">No listings found for this district.</p>
          </div>
        )}
      </main>

      {/* FAB Menu */}
      <div className="absolute bottom-6 right-6 z-20">
        {isFabMenuOpen && (
          <div className="flex flex-col items-end gap-4 mb-4">
            {role === UserRole.FARMER && (
              <FabButton label="AI Match" icon="🔥" onClick={handleStartProfile} />
            )}
            {canAddListing && (
              <FabButton label="Add New" icon="➕" onClick={handleOpenAddModal} />
            )}
            {onOpenAdvisor && <FabButton label="Advisor" icon="💬" onClick={onOpenAdvisor} />}
            {onOpenDisputes && <FabButton label="Report Dispute" icon="🚨" onClick={() => { onOpenDisputes?.(); setIsFabMenuOpen(false); }} />}
            {onStartLiveCall && <FabButton label="Live Call" icon="🎙️" onClick={onStartLiveCall} />}
          </div>
        )}
        <button 
          onClick={() => setIsFabMenuOpen(!isFabMenuOpen)}
          className={`w-16 h-16 rounded-full bg-green-700 text-white shadow-lg flex items-center justify-center text-3xl transition-transform duration-300 hover:bg-green-800 ${isFabMenuOpen ? 'rotate-[-135deg]' : ''}`}
        >
          ＋
        </button>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={handleCloseModal}>
          <form onSubmit={handleSubmitListing} className="bg-white rounded-xl w-full max-w-lg shadow-xl animate-fade-in-up p-6 space-y-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold">{editingListing ? "Edit Listing" : "Add New Listing"}</h2>
            {/* Form content here */}
            { role === UserRole.PROVIDER ? (
                <div><label>Equipment Type</label><input value={newEquipmentType} onChange={e => setNewEquipmentType(e.target.value)} className="w-full border p-2 rounded" /></div>
            ) : (
                <>
                <div><label>Land Type</label><input value={newType} onChange={e => setNewType(e.target.value)} className="w-full border p-2 rounded" /></div>
                <div><label>Area (Hectares)</label><input type="number" value={newArea} onChange={e => setNewArea(e.target.value)} className="w-full border p-2 rounded" /></div>
                </>
            )}
            <div><label>District</label><select value={newDistrict} onChange={e => setNewDistrict(e.target.value)} className="w-full border p-2 rounded">{DISTRICTS.map(d=><option key={d}>{d}</option>)}</select></div>
            <div><label>Price / Terms</label><input value={newPrice} onChange={e => setNewPrice(e.target.value)} className="w-full border p-2 rounded" /></div>
            <div><label>Description</label><textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} className="w-full border p-2 rounded" /></div>
            {/* ... other inputs like features, image upload etc. */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button type="button" onClick={handleCloseModal} className="px-4 py-2 bg-stone-100 rounded-lg">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg">Save</button>
            </div>
          </form>
        </div>
      )}

       {/* Profile Modal for Matching */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowProfileModal(false)}>
            <form onSubmit={handleSubmitProfile} className="bg-white rounded-xl w-full max-w-md shadow-xl p-6" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold">Find Your Match</h2>
                <p className="text-sm text-stone-500 mb-4">Tell us what you need.</p>
                <div className="space-y-4">
                  <div><label>Crops you want to plant</label><input value={profileCrops} onChange={e => setProfileCrops(e.target.value)} className="w-full border p-2 rounded" placeholder="e.g. Poone, Linaoa" /></div>
                  <div><label>Your budget/capacity</label><input value={profileBudget} onChange={e => setProfileBudget(e.target.value)} className="w-full border p-2 rounded" placeholder="e.g. M5000" /></div>
                  <div><label>Preferred District</label><select value={profileDistrict} onChange={e => setProfileDistrict(e.target.value)} className="w-full border p-2 rounded">{DISTRICTS.map(d=><option key={d}>{d}</option>)}</select></div>
                </div>
                 <div className="flex justify-end gap-3 pt-4 mt-4 border-t">
                    <button type="button" onClick={() => setShowProfileModal(false)} className="px-4 py-2 bg-stone-100 rounded-lg">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg">Find Matches</button>
                </div>
            </form>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
