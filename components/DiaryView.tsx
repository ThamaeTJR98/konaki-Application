
import React, { useState, useRef } from 'react';
import { DiaryEntry, DiaryEntryType, Agreement } from '../types';

interface DiaryViewProps {
  entries: DiaryEntry[];
  onAddEntry: (entry: DiaryEntry) => void;
  agreements?: Agreement[]; // Support linking to workspace agreements
}

const entryTypes: { type: DiaryEntryType; label: string; icon: string; }[] = [
    { type: 'PLANTING', label: 'Jala (Planting)', icon: '🌱' },
    { type: 'INPUT_PURCHASE', label: 'Theko (Input Purchase)', icon: '🛒' },
    { type: 'HARVEST', label: 'Kotulo (Harvest)', icon: '🌾' },
    { type: 'SALE', label: 'Thekiso (Sale)', icon: '💰' },
    { type: 'OBSERVATION', label: 'Tlhokomelo (Observation)', icon: '👀' },
];

const DiaryView: React.FC<DiaryViewProps> = ({ entries, onAddEntry, agreements = [] }) => {
    const [showModal, setShowModal] = useState(false);
    
    // Form State
    const [newType, setNewType] = useState<DiaryEntryType>('PLANTING');
    const [newTitle, setNewTitle] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [newPhoto, setNewPhoto] = useState<string | null>(null);
    const [relatedAgreementId, setRelatedAgreementId] = useState('');
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const sortedEntries = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            setNewPhoto(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const selectedType = entryTypes.find(t => t.type === newType);
        if (!newTitle || !selectedType) return;

        const entry: DiaryEntry = {
            id: `diary_${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            type: newType,
            title: newTitle,
            description: newDesc,
            icon: selectedType.icon,
            photoUrl: newPhoto || undefined,
            relatedId: relatedAgreementId || undefined
        };

        onAddEntry(entry);
        setShowModal(false);
        setNewTitle('');
        setNewDesc('');
        setNewPhoto(null);
        setRelatedAgreementId('');
    };

  return (
    <div className="h-full overflow-y-auto bg-stone-100 p-4 sm:p-6 pb-24">
       <div className="mb-6 max-w-4xl mx-auto flex justify-between items-center">
        <div>
            <h2 className="text-2xl font-bold text-stone-900">Workspace & Diary</h2>
            <p className="text-stone-500 text-sm">Tlaleha mesebetsi ho boloka bopaki ba tšebelisano. (Track partnership activities).</p>
        </div>
        <button 
            onClick={() => setShowModal(true)}
            className="bg-green-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-green-800 transition-colors shadow-md flex items-center gap-2"
        >
            <span>+</span> Kenya Tlaleho
        </button>
      </div>

      <div className="max-w-4xl mx-auto">
        {sortedEntries.length > 0 ? (
          <div className="relative pl-8 border-l-2 border-stone-200">
            {sortedEntries.map((entry, index) => {
              // Find related agreement if any
              const relatedAgreement = agreements.find(a => a.id === entry.relatedId);

              return (
                <div key={entry.id} className="mb-8 relative animate-fade-in-up">
                    <div className="absolute -left-[2.1rem] top-0 w-16 h-16 bg-white rounded-full flex items-center justify-center border-4 border-stone-100 shadow-sm text-3xl z-10">
                    {entry.icon}
                    </div>
                    <div className="ml-8 pt-1">
                        <div className="flex items-center gap-2 mb-2">
                             <p className="text-xs text-stone-500 font-bold uppercase tracking-wider">{new Date(entry.date).toDateString()}</p>
                             {relatedAgreement && (
                                 <span className="text-[10px] bg-green-100 text-green-800 px-2 py-0.5 rounded-full border border-green-200 truncate max-w-[150px]">
                                     📎 {relatedAgreement.title}
                                 </span>
                             )}
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
                            <h3 className="font-bold text-stone-900 text-lg mb-2">{entry.title}</h3>
                            {entry.description && <p className="text-stone-600 mb-4 whitespace-pre-wrap">{entry.description}</p>}
                            {entry.photoUrl && (
                                <div className="mt-4">
                                    <img src={entry.photoUrl} alt="Diary entry" className="max-h-64 rounded-lg border border-stone-200" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-24 text-stone-400 bg-white rounded-xl border-2 border-dashed border-stone-200">
            <div className="text-5xl mb-4 opacity-30">📖</div>
            <p className="text-lg">Buka ea hau ha e na letho.</p>
            <p className="text-sm">Qala ka ho kenya tlaleho ea pele ho sireletsa tšebelisano ea hau.</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-fade-in-up max-h-[90vh] overflow-y-auto">
                 <h3 className="text-xl font-bold text-stone-800 mb-6">Kenya Tlaleho (Add to Workspace)</h3>
                 <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-stone-700 mb-2">Mofuta oa Ketsahalo (Event Type)</label>
                        <div className="grid grid-cols-3 gap-2">
                           {entryTypes.map(t => (
                             <button type="button" key={t.type} onClick={() => setNewType(t.type)} className={`p-3 rounded-lg border-2 text-center transition-all ${newType === t.type ? 'bg-green-600 border-green-700 text-white' : 'bg-stone-50 border-stone-200 hover:border-green-400'}`}>
                                 <span className="text-2xl">{t.icon}</span>
                                 <span className="block text-xs font-bold mt-1">{t.label}</span>
                             </button>
                           ))}
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-bold text-stone-700 mb-1">Sehlooho (Title)</label>
                        <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} required className="w-full border border-stone-300 rounded-lg p-2.5" placeholder="e.g. Ke lemile poone hekthara e le 1" />
                    </div>
                    
                    {/* Agreement Linker */}
                    <div>
                        <label className="block text-sm font-bold text-stone-700 mb-1">E amana le Tumellano? (Link to Agreement)</label>
                        <select 
                            value={relatedAgreementId} 
                            onChange={e => setRelatedAgreementId(e.target.value)}
                            className="w-full border border-stone-300 rounded-lg p-2.5 bg-stone-50"
                        >
                            <option value="">-- Ha e amane (None) --</option>
                            {agreements.map(a => (
                                <option key={a.id} value={a.id}>{a.title} ({a.status})</option>
                            ))}
                        </select>
                        <p className="text-xs text-stone-400 mt-1">Linking entries to agreements helps dissolve disputes later.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-stone-700 mb-1">Lintlha (Notes)</label>
                        <textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} rows={3} className="w-full border border-stone-300 rounded-lg p-2.5" placeholder="Lintlha tse ling..."></textarea>
                    </div>
                     <div>
                        <label className="block text-sm font-bold text-stone-700 mb-1">Kenya Setšoantšo (Add Photo)</label>
                        <div className="mt-1 flex items-center gap-4">
                            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handlePhotoUpload} />
                            <button type="button" onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-stone-100 rounded-lg text-sm font-medium">Choose File</button>
                            {newPhoto && <img src={newPhoto} alt="Preview" className="h-12 w-12 rounded-md object-cover border" />}
                        </div>
                    </div>
                    <div className="flex gap-3 pt-4 border-t border-stone-100">
                        <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 bg-stone-100 rounded-lg font-bold">Cancel</button>
                        <button type="submit" className="flex-1 py-3 bg-green-700 text-white rounded-lg font-bold">Save Entry</button>
                    </div>
                 </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default DiaryView;
