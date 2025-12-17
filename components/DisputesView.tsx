
import React, { useState } from 'react';
import { Dispute, DisputeType, Agreement, DiaryEntry } from '../types';
import { generateDisputeAdvice } from '../services/geminiService';

interface DisputesViewProps {
  disputes: Dispute[];
  agreements?: Agreement[]; // New Prop: context for dispute
  diaryEntries?: DiaryEntry[]; // New Prop: evidence for dispute
  onAddDispute: (dispute: Dispute) => void;
}

const DisputesView: React.FC<DisputesViewProps> = ({ disputes, onAddDispute, agreements = [], diaryEntries = [] }) => {
  const [showModal, setShowModal] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(disputes.length > 0 ? disputes[0].id : null);
  
  // Form State
  const [type, setType] = useState<DisputeType>(DisputeType.DAMAGE);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [relatedAgreementId, setRelatedAgreementId] = useState('');
  const [isGettingAdvice, setIsGettingAdvice] = useState(false);

  const toggleExpand = (id: string) => {
    setExpandedId(currentId => (currentId === id ? null : id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGettingAdvice(true);
    
    // Gather Context
    const selectedAgreement = agreements.find(a => a.id === relatedAgreementId);
    // Filter diary entries related to this agreement for "Detailed Dispute Dissolution"
    const relevantHistory = selectedAgreement 
        ? diaryEntries.filter(d => d.relatedId === selectedAgreement.id) 
        : [];

    const advice = await generateDisputeAdvice(type, desc, {
        agreement: selectedAgreement,
        history: relevantHistory
    });
    
    const newDispute: Dispute = {
        id: Date.now().toString(),
        type,
        title,
        description: desc,
        status: 'Open',
        dateReported: new Date().toISOString().split('T')[0],
        aiAdvice: advice
    };
    
    onAddDispute(newDispute);
    setIsGettingAdvice(false);
    setShowModal(false);
    
    // Expand the new dispute
    setExpandedId(newDispute.id);
    
    setTitle('');
    setDesc('');
    setRelatedAgreementId('');
    setType(DisputeType.DAMAGE);
  };

  const handlePrintReport = (dispute: Dispute) => {
      // This function generates a formal report for the user to take to their local chief/authority.
      const printWindow = window.open('', '', 'width=800,height=600');
      if (printWindow) {
          printWindow.document.write(`
            <html>
                <head>
                    <title>Tlaleho ea Khohlano - ${dispute.id}</title>
                    <style>
                        body { font-family: 'Lora', serif; padding: 40px; color: #333; }
                        h1 { text-align: center; border-bottom: 2px solid black; padding-bottom: 10px; margin-bottom: 10px; font-size: 24px; }
                        .subtitle { text-align: center; font-size: 14px; color: #666; margin-bottom: 30px; }
                        .section { margin-bottom: 25px; }
                        .section h2 { font-size: 16px; font-weight: bold; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1px;}
                        p { line-height: 1.6; margin: 0 0 10px 0;}
                        strong { color: #000; }
                        .advice { background-color: #f3f4f6; border-left: 4px solid #4ade80; padding: 15px; margin-top: 10px; }
                        .footer { margin-top: 60px; padding-top: 20px; border-top: 1px solid #ccc; font-size: 12px; color: #666; }
                        .signature { margin-top: 40px; }
                    </style>
                </head>
                <body>
                    <h1>TLALEHO EA KHOHLANO</h1>
                    <div class="subtitle">E lokiselitsoe Morena oa Sebaka / Lekhotla la Puso</div>
                    
                    <div class="section">
                        <h2>Lintlha tsa Taba</h2>
                        <p><strong>Letsatsi la Tlaleho:</strong> ${new Date(dispute.dateReported).toDateString()}</p>
                        <p><strong>Mofuta oa Taba:</strong> ${dispute.type}</p>
                        <p><strong>Sehlooho:</strong> ${dispute.title}</p>
                    </div>

                    <div class="section">
                        <h2>Tlhaloso ea Bothata</h2>
                        <p>${dispute.description.replace(/\n/g, '<br>')}</p>
                    </div>
                    
                    <div class="section">
                        <h2>Keletso ea Konaki AI (e ipapisitse le molao)</h2>
                        <div class="advice">
                            <p><em>${dispute.aiAdvice}</em></p>
                        </div>
                    </div>

                    <div class="signature">
                        <p>Boitsebiso bona bo fanoe ke 'na,</p>
                        <br/><br/>
                        <p>__________________________</p>
                        <p>Moinahani (Signature)</p>
                    </div>

                    <div class="footer">
                        Tlaleho ena e entsoe ke KONAKI AI ho thusa ka tharollo ea likhohlano tsa temo Lesotho.
                    </div>
                </body>
            </html>
          `);
          printWindow.document.close();
          printWindow.print();
      }
  };

  return (
    <div className="h-full overflow-y-auto bg-stone-50 p-4 sm:p-6 relative">
       <div className="mb-8 flex justify-between items-center max-w-4xl mx-auto">
        <div>
            <h2 className="text-2xl font-bold text-stone-800">Likhohlano (Disputes)</h2>
            <p className="text-stone-500 text-sm">Tlaleha mathata ho fumana likeletso tsa molao (Report issues for legal advice).</p>
        </div>
        <button 
            onClick={() => setShowModal(true)}
            className="bg-red-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-red-700 transition-colors shadow-md flex items-center gap-2"
        >
            <span>🚨</span> Tlaleha Bothata
        </button>
      </div>

      <div className="space-y-4 max-w-4xl mx-auto">
        {disputes.length > 0 ? (
          disputes.map(dispute => {
            const isExpanded = expandedId === dispute.id;

            return (
              <div key={dispute.id} className="bg-white rounded-xl border border-stone-200 shadow-sm animate-fade-in group hover:shadow-md transition-all duration-300 overflow-hidden">
                {/* Clickable Header */}
                <div 
                    className="p-4 sm:p-6 cursor-pointer hover:bg-stone-50/50 transition-colors flex justify-between items-start gap-4"
                    onClick={() => toggleExpand(dispute.id)}
                >
                    <div className="flex items-start gap-4">
                         <span className="mt-1 bg-red-50 text-red-600 p-3 rounded-lg text-2xl border border-red-100">
                            {dispute.type === DisputeType.DAMAGE ? '🐄' : 
                             dispute.type === DisputeType.BOUNDARY ? '🚧' : 
                             dispute.type === DisputeType.INHERITANCE ? '📜' : '⚠️'}
                         </span>
                         <div>
                            <h3 className="font-bold text-stone-900 text-lg">{dispute.title}</h3>
                            <p className="text-xs text-stone-500 font-medium">{dispute.type} • {dispute.dateReported}</p>
                         </div>
                    </div>
                    <div className="flex items-center gap-4 pt-1">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase hidden sm:block ${dispute.status === 'Open' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                            {dispute.status}
                        </span>
                        <svg xmlns="http://www.w3.org/2000/svg" className={`w-6 h-6 text-stone-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>

                {/* Collapsible Content */}
                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[1000px]' : 'max-h-0'}`}>
                    <div className="px-6 pb-6 pt-2">
                        <div className="pl-16">
                            <p className="text-stone-700 mb-4 leading-relaxed">{dispute.description}</p>
                            
                            {dispute.aiAdvice && (
                                <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg flex gap-3">
                                    <div className="text-2xl mt-1">⚖️</div>
                                    <div>
                                        <h4 className="font-bold text-amber-900 text-sm uppercase mb-1">Keletso ea Konaki (Legal Context)</h4>
                                        <p className="text-amber-800 text-sm italic">{dispute.aiAdvice}</p>
                                    </div>
                                </div>
                            )}
                            
                            <div className="text-xs text-stone-500 mt-3 italic no-print">
                                <strong>Please Note:</strong> This is automated advice based on the Land Act 2010 and is not a legal judgment. Please consult with your Morena or Local Council.
                            </div>
                            
                            <div className="mt-4 pt-4 border-t border-stone-100 flex justify-end gap-3">
                                <button className="text-stone-500 text-sm hover:text-stone-800 font-medium">Koala (Resolve)</button>
                                <button 
                                    onClick={() => handlePrintReport(dispute)}
                                    className="bg-stone-100 text-stone-700 px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-stone-200 flex items-center gap-2"
                                >
                                    🖨️ Hlahisa Tlaleho ea Morena
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="text-center py-24 text-stone-400">
                <div className="text-5xl mb-4 grayscale opacity-30">☮️</div>
                <p className="text-lg">Ha ho likhohlano tse tlalehiloeng.</p>
                <p className="text-sm">Khotso e 'ne e atle.</p>
            </div>
        )}
      </div>

       {/* Report Modal */}
       {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-fade-in-up max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-stone-800">Tlaleha Khohlano</h3>
                    <button onClick={() => setShowModal(false)} className="text-stone-400 hover:text-stone-600">✕</button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-stone-700 mb-1">Mofuta (Type of Dispute)</label>
                        <select 
                            value={type}
                            onChange={(e) => setType(e.target.value as DisputeType)}
                            className="w-full border border-stone-300 rounded-lg p-2.5 focus:ring-2 focus:ring-red-500 outline-none bg-stone-50"
                        >
                            {Object.values(DisputeType).map(t => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>
                    
                    {/* Agreement Selector */}
                    <div>
                        <label className="block text-sm font-bold text-stone-700 mb-1">Tumellano e Ametsoeng (Related Agreement)</label>
                        <select 
                            value={relatedAgreementId}
                            onChange={(e) => setRelatedAgreementId(e.target.value)}
                            className="w-full border border-stone-300 rounded-lg p-2.5 focus:ring-2 focus:ring-red-500 outline-none bg-stone-50"
                        >
                            <option value="">-- Ha e amane le Tumellano e Ngotsoeng --</option>
                            {agreements.map(a => (
                                <option key={a.id} value={a.id}>{a.title} ({a.status})</option>
                            ))}
                        </select>
                        <p className="text-xs text-stone-400 mt-1">Konaki will analyze the agreement terms to help solve this.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-stone-700 mb-1">Sehlooho (Subject)</label>
                        <input 
                            type="text"
                            value={title} 
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full border border-stone-300 rounded-lg p-2.5 focus:ring-2 focus:ring-red-500 outline-none"
                            placeholder="Mohlala: Meli e suthisitsoe"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-stone-700 mb-1">Tlhaloso (Description)</label>
                        <textarea 
                            value={desc}
                            onChange={(e) => setDesc(e.target.value)}
                            className="w-full border border-stone-300 rounded-lg p-2.5 focus:ring-2 focus:ring-red-500 outline-none"
                            rows={4}
                            placeholder="Hlalosa bothata ka botlalo. E etsahetse neng? Ke mang ea amehang?"
                            required
                        />
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-stone-100">
                        <button 
                            type="button" 
                            onClick={() => setShowModal(false)}
                            className="flex-1 py-3 bg-stone-100 text-stone-600 rounded-lg font-bold hover:bg-stone-200 transition-colors"
                        >
                            Hlakola
                        </button>
                        <button 
                            type="submit" 
                            disabled={isGettingAdvice}
                            className="flex-1 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors shadow-lg flex justify-center items-center"
                        >
                            {isGettingAdvice ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            ) : (
                                "Tlaleha & Fumana Keletso"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default DisputesView;
