import React, { useState } from 'react';
import { UserRole, Listing } from '../types';
import { DISTRICTS } from '../constants';
import LandCard from './LandCard';

interface DashboardProps {
  role: UserRole;
  listings: Listing[];
  onSelectListing: (listing: Listing) => void;
  onAddListing: (listing: Listing) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ role, listings, onSelectListing, onAddListing }) => {
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Bohle');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // Form State
  const [newType, setNewType] = useState('Masimo');
  const [newEquipmentType, setNewEquipmentType] = useState('Terekere'); // For Providers
  const [newDistrict, setNewDistrict] = useState(DISTRICTS[0]);
  const [newArea, setNewArea] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [coordinates, setCoordinates] = useState<{lat: number, lng: number} | null>(null);

  // Filter listings based on role interest
  // Farmers see Land. Providers see Farmers (not impl in this mock, so Providers see their own list or requests).
  // Landholders see other listings? For simplicity, everyone sees everything filtered by district.
  const filteredListings = listings.filter(l => {
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
        holderName: role === UserRole.PROVIDER ? "Uena (Mofani)" : "Uena (Mong'a Mobu)",
        imageUrl: isProvider 
            ? "https://images.unsplash.com/photo-1592869675276-2f0851509923?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
            : "https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        coordinates: coordinates || { lat: -29.31, lng: 27.48 },
        price: newPrice || (isProvider ? "M2000 / day" : "Negotiable")
    };
    onAddListing(listing);
    setShowAddModal(false);
    
    // Reset form
    setNewDesc('');
    setNewArea('');
    setCoordinates(null);
    setNewPrice('');
  };

  const getWelcomeTitle = () => {
      switch(role) {
          case UserRole.FARMER: return "Fumana Mobu & Lisebelisoa";
          case UserRole.PROVIDER: return "Laola Lisebelisoa Tsa Hau";
          default: return "Laola Mobu oa Hau";
      }
  };

  const getWelcomeDesc = () => {
      switch(role) {
          case UserRole.FARMER: return "Batla mobu kapa lisebelisoa tsa temo.";
          case UserRole.PROVIDER: return "Kenya lisebelisoa tsa hau hore lihoai li li hire.";
          default: return "Kenya mobu oa hau hore o fumane bahirisi.";
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
            <div className="flex bg-stone-100 p-1 rounded-lg shrink-0">
                <button 
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'list' ? 'bg-white shadow text-green-700' : 'text-stone-500 hover:text-stone-700'}`}
                >
                    Lenane
                </button>
                <button 
                    onClick={() => setViewMode('map')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'map' ? 'bg-white shadow text-green-700' : 'text-stone-500 hover:text-stone-700'}`}
                >
                    'Mapa
                </button>
            </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            <button 
                onClick={() => setSelectedDistrict('Bohle')}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedDistrict === 'Bohle' ? 'bg-green-700 text-white shadow-md' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
            >
                Litereke Tsohle
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
                        <p>Ha ho letho le fumanehang seterekeng sena hajoale.</p>
                    </div>
                )}
            </div>
        ) : (
            <div className="h-full w-full rounded-2xl overflow-hidden border border-stone-200 shadow-inner relative bg-stone-200">
                {/* Embed OpenStreetMap centered on Lesotho (Lat -29.6, Lng 28.2) */}
                <iframe 
                    width="100%" 
                    height="100%" 
                    frameBorder="0" 
                    scrolling="no" 
                    marginHeight={0} 
                    marginWidth={0} 
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=27.0%2C-30.7%2C29.5%2C-28.5&amp;layer=mapnik&amp;marker=-29.60%2C28.20`} 
                    className="w-full h-full"
                    title="Lesotho Map"
                ></iframe>
                
                {/* Overlay Cards for Listings (Simulated pins) */}
                <div className="absolute bottom-4 left-4 right-4 flex gap-4 overflow-x-auto pb-2 snap-x z-10">
                    {filteredListings.map(listing => (
                         <div 
                            key={listing.id} 
                            onClick={() => onSelectListing(listing)}
                            className="bg-white p-3 rounded-lg shadow-lg min-w-[200px] w-[200px] cursor-pointer snap-center border border-stone-100 hover:bg-stone-50"
                        >
                            <div className="font-bold text-sm text-stone-800 truncate">{listing.type}</div>
                            <div className="text-xs text-stone-500 mb-1">{listing.district}</div>
                            <div className="text-xs font-semibold text-green-700">Sheba (View)</div>
                        </div>
                    ))}
                </div>
            </div>
        )}
      </div>

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
                    {role === UserRole.PROVIDER ? 'Kenya Lisebelisoa (Add Equipment)' : 'Kenya Mobu (Add Land)'}
                </h3>
                
                <form onSubmit={handleCreateListing} className="space-y-4">
                    
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
                            Kenya
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;