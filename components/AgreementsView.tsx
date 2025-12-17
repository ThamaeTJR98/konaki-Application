
import React, { useState, useRef } from 'react';
import { Agreement } from '../types';

interface AgreementsViewProps {
  agreements: Agreement[];
  onUpdateAgreement?: (agreement: Agreement) => void;
}

const AgreementsView: React.FC<AgreementsViewProps> = ({ agreements, onUpdateAgreement }) => {
  const [signingId, setSigningId] = useState<string | null>(null);
  const [signingRole, setSigningRole] = useState<'tenant' | 'landholder'>('tenant');
  const [expandedId, setExpandedId] = useState<string | null>(agreements.length > 0 ? agreements[0].id : null);
  
  // Signature Pad State
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  const toggleExpand = (id: string) => {
    setExpandedId(currentId => (currentId === id ? null : id));
  };
  
  const handleRetract = (agreement: Agreement) => {
      if (!onUpdateAgreement) return;
      if (window.confirm("Are you sure you want to retract this agreement? This action marks it as void and cannot be undone.")) {
          onUpdateAgreement({ ...agreement, status: 'Retracted' });
      }
  };

  const handleDownload = (agreementId: string) => {
    // Ensure the card to be printed is expanded
    setExpandedId(agreementId);
    
    // A short delay allows the expand animation to complete before printing
    setTimeout(() => {
        const allCards = document.querySelectorAll('.agreement-card');
        allCards.forEach(card => {
            if (card.id !== `agreement-${agreementId}`) {
                card.classList.remove('print-content'); // Hide other cards from print view
            }
        });
        
        window.print();
        
        // Restore classes after print dialog is closed
        allCards.forEach(card => {
            card.classList.add('print-content');
        });

    }, 500);
  };

  const startSigning = (id: string, role: 'tenant' | 'landholder') => {
    setSigningId(id);
    setSigningRole(role);
    setHasSignature(false);
    // Short delay to allow modal to render before accessing canvas context
    setTimeout(() => {
        if(canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            if(ctx) {
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = 2;
                ctx.lineCap = 'round';
            }
        }
    }, 100);
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
      setIsDrawing(true);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const rect = canvas.getBoundingClientRect();
      const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left;
      const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top;
      
      ctx.beginPath();
      ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDrawing) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const rect = canvas.getBoundingClientRect();
      const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left;
      const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top;
      
      ctx.lineTo(x, y);
      ctx.stroke();
      setHasSignature(true);
  };

  const stopDrawing = () => {
      setIsDrawing(false);
  };

  const clearCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasSignature(false);
  };

  const saveSignature = () => {
      if(!hasSignature || !signingId || !onUpdateAgreement) return;
      const canvas = canvasRef.current;
      const dataUrl = canvas?.toDataURL();
      
      // Find agreement
      const agreementToUpdate = agreements.find(a => a.id === signingId);
      if (agreementToUpdate && dataUrl) {
          const updated: Agreement = {
              ...agreementToUpdate,
              signatures: {
                  ...agreementToUpdate.signatures,
                  [signingRole]: dataUrl
              }
          };
          
          // Check if both signed, then mark active
          const tenantSigned = signingRole === 'tenant' ? true : !!updated.signatures?.tenant;
          const holderSigned = signingRole === 'landholder' ? true : !!updated.signatures?.landholder;
          
          if (tenantSigned && holderSigned) {
              updated.status = 'Signed';
          }

          onUpdateAgreement(updated);
      }
      
      setSigningId(null);
  };

  return (
    <div className="h-full overflow-y-auto bg-stone-100 p-4 sm:p-8">
       <div className="mb-8 max-w-4xl mx-auto no-print">
        <h2 className="text-3xl font-bold text-stone-900">Litumellano (Agreements)</h2>
        <p className="text-stone-600 mt-1">Laola litumellano tsa hau tsa molao.</p>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {agreements.length > 0 ? (
          agreements.map(agreement => {
            const isExpanded = expandedId === agreement.id;
            
            const statusTextClass = {
                'Draft': 'text-amber-600', 'Active': 'text-blue-600', 'Signed': 'text-green-600',
                'Expired': 'text-stone-500', 'Retracted': 'text-red-600 line-through'
            }[agreement.status];
            
            const statusBadgeClass = {
                'Draft': 'bg-amber-100 text-amber-700', 'Active': 'bg-blue-100 text-blue-700', 'Signed': 'bg-green-100 text-green-700',
                'Expired': 'bg-stone-100 text-stone-500', 'Retracted': 'bg-red-100 text-red-700'
            }[agreement.status];

            return (
                <div id={`agreement-${agreement.id}`} key={agreement.id} className="agreement-card print-content bg-white rounded-xl shadow-lg border border-stone-200 relative overflow-hidden print:shadow-none animate-fade-in break-after-page">
                    {/* Clickable Header */}
                    <div 
                        className="p-6 cursor-pointer hover:bg-stone-50/50 transition-colors flex justify-between items-start gap-4 no-print"
                        onClick={() => toggleExpand(agreement.id)}
                    >
                        <div className="flex-1">
                            <h3 className="font-bold text-stone-900 text-lg leading-tight">{agreement.title}</h3>
                            <p className="text-sm text-stone-500 mt-1">
                                With: {agreement.parties.landholder} • Status: 
                                <span className={`font-bold ml-1 ${statusTextClass}`}>
                                    {agreement.status}
                                </span>
                            </p>
                        </div>
                        <div className="flex items-center gap-4 pt-1">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase hidden sm:block ${statusBadgeClass}`}>
                                {agreement.status}
                            </span>
                            <svg xmlns="http://www.w3.org/2000/svg" className={`w-6 h-6 text-stone-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>

                    {/* Collapsible Content */}
                    <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[3000px]' : 'max-h-0'}`}>
                        <div className="border-t border-stone-200">
                            {/* Paper Texture Header */}
                            <div className={`h-3 w-full border-b-2 border-stone-200 ${agreement.listingCategory === 'EQUIPMENT' ? 'bg-orange-800' : 'bg-green-900'}`}></div>
                            <div className="p-8 sm:p-12">
                                {/* Legal Preamble */}
                                <div className="text-center mb-8 pb-4 border-b-2 border-stone-900">
                                    <div className="text-sm font-bold uppercase tracking-widest text-stone-500 mb-2">The Kingdom of Lesotho</div>
                                    <h3 className="font-serif text-3xl font-black text-stone-900 uppercase mb-1">{agreement.title}</h3>
                                    <p className="text-xs text-stone-500 font-medium">Made in accordance with the <strong>Land Act 2010</strong></p>
                                </div>
                                {/* Meta Data */}
                                <div className="flex justify-between items-center mb-8 text-xs font-mono text-stone-500">
                                    <span>REF: {agreement.id.toUpperCase()}</span>
                                    <span>DATE: {agreement.dateCreated}</span>
                                    <span className={`px-2 py-0.5 border ${statusBadgeClass} rounded font-bold`}>
                                        STATUS: {agreement.status.toUpperCase()}
                                    </span>
                                </div>
                                {/* Parties Section */}
                                <div className="mb-8 bg-stone-50 p-6 border border-stone-200">
                                    <h4 className="font-bold text-stone-900 uppercase text-xs tracking-wider mb-4 border-b border-stone-200 pb-2">Parties to the Agreement</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                        <div>
                                            <p className="text-xs text-stone-500 uppercase font-bold mb-1">Provider / Landholder (Mofani)</p>
                                            <p className="font-serif text-xl font-bold text-stone-900">{agreement.parties.landholder}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-stone-500 uppercase font-bold mb-1">Tenant / Client (Moamoheli)</p>
                                            <p className="font-serif text-xl font-bold text-stone-900">{agreement.parties.tenant}</p>
                                        </div>
                                    </div>
                                </div>
                                {/* Terms / Clauses */}
                                <div className="space-y-6 mb-10">
                                    <h4 className="font-bold text-stone-900 uppercase text-xs tracking-wider border-b border-stone-200 pb-2 mb-4">Terms & Conditions</h4>
                                    <div className="grid grid-cols-1 gap-4">
                                        <ClauseItem number="1" label="Nako (Duration)" value={agreement.clauses.duration} />
                                        <ClauseItem number="2" label="Tefo (Payment Terms)" value={agreement.clauses.paymentTerms} />
                                        {agreement.clauses.landUse && <ClauseItem number="3" label="Tšebeliso (Permitted Land Use)" value={agreement.clauses.landUse} />}
                                        {agreement.clauses.fuelPolicy && <ClauseItem number="3" label="Mafura (Fuel Policy)" value={agreement.clauses.fuelPolicy} />}
                                        {agreement.clauses.operatorIncluded && <ClauseItem number="4" label="Mokhanni (Operator)" value={agreement.clauses.operatorIncluded} />}
                                        {agreement.clauses.damageLiability && <ClauseItem number="5" label="Tšenyo (Damage Liability)" value={agreement.clauses.damageLiability} />}
                                        <ClauseItem number="6" label="Qetello (Termination)" value={agreement.clauses.termination} />
                                        <div className="mt-4 pt-4 text-xs text-stone-500 italic">
                                            * This agreement is binding upon the parties and their successors in title. Disputes shall be referred to the Local Council.
                                        </div>
                                    </div>
                                </div>
                                {/* Signatures */}
                                <div className="mt-12 pt-8 border-t-2 border-stone-900 break-inside-avoid">
                                    <h4 className="font-bold text-stone-900 uppercase text-center text-xs tracking-wider mb-8">Signatures of Parties</h4>
                                    <div className="grid grid-cols-2 gap-12 mb-12">
                                        <div className="relative group cursor-pointer" onClick={() => !agreement.signatures?.landholder && startSigning(agreement.id, 'landholder')}>
                                            <div className="h-24 border-b border-stone-900 mb-2 flex items-end justify-center relative bg-stone-50/50">{agreement.signatures?.landholder ? <img src={agreement.signatures.landholder} alt="Signed" className="max-h-20 mix-blend-multiply" /> : <span className="text-stone-300 text-sm font-serif italic opacity-50 px-2 py-4">Signature</span>}</div>
                                            <p className="text-xs text-stone-900 uppercase font-bold">Provider / Landholder</p>
                                            <p className="text-[10px] text-stone-500">Date: .......................................</p>
                                        </div>
                                        <div className="relative group cursor-pointer" onClick={() => !agreement.signatures?.tenant && startSigning(agreement.id, 'tenant')}>
                                            <div className="h-24 border-b border-stone-900 mb-2 flex items-end justify-center relative bg-stone-50/50">{agreement.signatures?.tenant ? <img src={agreement.signatures.tenant} alt="Signed" className="max-h-20 mix-blend-multiply" /> : <span className="text-stone-300 text-sm font-serif italic opacity-50 px-2 py-4">Signature</span>}</div>
                                            <p className="text-xs text-stone-900 uppercase font-bold">Tenant / Client</p>
                                            <p className="text-[10px] text-stone-500">Date: .......................................</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-12 opacity-70">
                                        <div><div className="h-12 border-b border-stone-400 mb-1"></div><p className="text-[10px] text-stone-500 uppercase">Witness 1 (Name & Sign)</p></div>
                                        <div><div className="h-12 border-b border-stone-400 mb-1"></div><p className="text-[10px] text-stone-500 uppercase">Witness 2 (Name & Sign)</p></div>
                                    </div>
                                </div>
                                
                                <div className="text-center text-xs text-stone-500 mt-12 italic no-print px-8">
                                    <strong>Disclaimer:</strong> Tumellano ena ke mohlala feela. It is advisable to have it reviewed by the Local Council before it is considered legally binding.
                                </div>
                            </div>

                            <div className="bg-stone-50 p-4 px-8 border-t border-stone-200 flex justify-end items-center gap-3 no-print">
                                {(agreement.status === 'Signed' || agreement.status === 'Active') && onUpdateAgreement && (
                                    <button onClick={() => handleRetract(agreement)} className="px-4 py-2 bg-red-50 text-red-700 rounded text-sm font-bold hover:bg-red-100 border border-red-200 transition-colors">
                                        Retract Agreement
                                    </button>
                                )}
                                <button onClick={() => handleDownload(agreement.id)} className="px-4 py-2 bg-white border border-stone-300 rounded text-sm font-medium hover:bg-stone-100 transition-colors flex items-center gap-2">
                                    <span>🖨️</span> Print / Save PDF
                                </button>
                                {agreement.status !== 'Signed' && agreement.status !== 'Retracted' && onUpdateAgreement && (
                                    <div className="flex gap-2">
                                        {!agreement.signatures?.landholder && <button onClick={() => startSigning(agreement.id, 'landholder')} className="px-4 py-2 bg-stone-200 text-stone-700 rounded text-sm font-bold hover:bg-stone-300 transition-colors">Sign (Provider)</button>}
                                        {!agreement.signatures?.tenant && <button onClick={() => startSigning(agreement.id, 'tenant')} className="px-4 py-2 bg-green-700 text-white rounded text-sm font-bold hover:bg-green-800 transition-colors shadow-sm">Sign (Tenant)</button>}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )
        })
        ) : (
            <div className="flex flex-col items-center justify-center py-20 text-stone-400 bg-white border-2 border-dashed border-stone-200 rounded-xl">
                <span className="text-5xl mb-4 text-stone-200">⚖️</span>
                <p className="text-lg font-medium">Ha ho litumellano hajoale.</p>
                <p className="text-sm">Qala puisano le mong'a mobu ho theha tumellano.</p>
            </div>
        )}
      </div>

      {/* Signing Modal */}
      {signingId && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl w-full max-w-lg p-6 animate-fade-in-up">
                <h3 className="text-xl font-bold text-stone-900 mb-2">
                    {signingRole === 'tenant' ? 'Menoana ea Hiriso (Tenant Sign)' : "Menoana ea Mong'a Mobu (Provider Sign)"}
                </h3>
                <p className="text-stone-500 text-sm mb-4">Please draw your signature below using your finger or mouse.</p>
                <div className="border-2 border-dashed border-stone-300 rounded-lg mb-4 bg-stone-50 touch-none">
                    <canvas 
                        ref={canvasRef}
                        width={400}
                        height={200}
                        className="w-full h-48 cursor-crosshair touch-none"
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                    />
                </div>
                <div className="flex justify-between items-center">
                    <button onClick={clearCanvas} className="text-sm text-red-500 hover:text-red-700 font-medium">Clear</button>
                    <div className="flex gap-3">
                         <button onClick={() => setSigningId(null)} className="px-4 py-2 bg-stone-100 text-stone-600 rounded-lg font-medium hover:bg-stone-200">Cancel</button>
                        <button onClick={saveSignature} disabled={!hasSignature} className={`px-4 py-2 rounded-lg font-bold text-white transition-colors ${hasSignature ? 'bg-green-700 hover:bg-green-800' : 'bg-stone-300'}`}>
                            Save Signature
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

const ClauseItem = ({ number, label, value }: { number: string, label: string, value: string }) => (
    <div className="flex gap-4 items-start">
        <span className="font-mono text-stone-400 font-bold pt-1">{number}.</span>
        <div className="flex-1">
            <span className="block text-xs font-bold text-stone-600 uppercase mb-1">{label}</span>
            <span className="block font-serif text-stone-900 leading-relaxed text-lg bg-stone-50 p-2 rounded border border-stone-100">{value}</span>
        </div>
    </div>
);

export default AgreementsView;
