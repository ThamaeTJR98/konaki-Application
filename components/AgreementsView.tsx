import React, { useState, useRef } from 'react';
import { Agreement } from '../types';

interface AgreementsViewProps {
  agreements: Agreement[];
}

const AgreementsView: React.FC<AgreementsViewProps> = ({ agreements }) => {
  const [signingId, setSigningId] = useState<string | null>(null);
  
  // Signature Pad State
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  const handleDownload = () => {
    window.print();
  };

  const startSigning = (id: string) => {
    setSigningId(id);
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
      if(!hasSignature || !signingId) return;
      const canvas = canvasRef.current;
      const dataUrl = canvas?.toDataURL();
      
      // In a real app, we would update state here.
      // For this mock, we force a re-render or alert success.
      // We will just alert for now as we don't have a global setAgreements here easily without prop drilling.
      alert("Signature Saved! (Functionality mocked for this demo)");
      setSigningId(null);
  };

  return (
    <div className="h-full overflow-y-auto bg-stone-100 p-4 sm:p-8">
       <div className="mb-8 max-w-4xl mx-auto no-print">
        <h2 className="text-3xl font-bold text-stone-900">Litumellano (Agreements)</h2>
        <p className="text-stone-600 mt-1">Laola litumellano tsa hau tsa molao.</p>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        {agreements.length > 0 ? (
          agreements.map(agreement => (
            <div key={agreement.id} className="print-content bg-white rounded-none shadow-lg border border-stone-200 relative overflow-hidden print:shadow-none animate-fade-in break-after-page mb-8">
                {/* Paper Texture Header */}
                <div className="h-2 bg-green-700 w-full"></div>
                <div className="p-8 sm:p-12">
                    
                    {/* Header */}
                    <div className="flex justify-between items-start mb-8 border-b-2 border-stone-100 pb-6">
                        <div>
                            <div className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">State of Lesotho</div>
                            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">{agreement.title}</h3>
                            <p className="text-stone-500 text-sm mt-1">Ref: {agreement.id} | Date: {agreement.dateCreated}</p>
                        </div>
                        <div className={`px-4 py-2 border-2 text-sm font-bold uppercase tracking-wider transform -rotate-2 ${
                            agreement.status === 'Active' ? 'border-green-600 text-green-700' : 
                            agreement.status === 'Draft' ? 'border-amber-400 text-amber-500' : 'border-stone-300 text-stone-400'
                        }`}>
                            {agreement.status}
                        </div>
                    </div>

                    {/* Parties */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
                        <div className="bg-stone-50 p-4 border border-stone-100 print:bg-transparent print:border-black">
                            <h4 className="text-xs font-bold text-stone-400 uppercase mb-2">Landholder (Mong'a Mobu)</h4>
                            <p className="font-serif text-lg text-stone-900">{agreement.parties.landholder}</p>
                        </div>
                        <div className="bg-stone-50 p-4 border border-stone-100 print:bg-transparent print:border-black">
                            <h4 className="text-xs font-bold text-stone-400 uppercase mb-2">Tenant (Hiriso)</h4>
                            <p className="font-serif text-lg text-stone-900">{agreement.parties.tenant}</p>
                        </div>
                    </div>

                    {/* Terms / Clauses */}
                    <div className="space-y-6">
                        <h4 className="font-bold text-stone-900 border-b border-stone-200 pb-2 mb-4">Terms of Agreement</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <ClauseItem label="Nako (Duration)" value={agreement.clauses.duration} />
                            <ClauseItem label="Tefo / Karolo (Payment)" value={agreement.clauses.paymentTerms} />
                            <ClauseItem label="Tšebeliso (Permitted Use)" value={agreement.clauses.landUse} />
                            <ClauseItem label="Qetello (Termination)" value={agreement.clauses.termination} />
                        </div>
                    </div>

                    {/* Signatures */}
                    <div className="mt-12 pt-8 border-t border-stone-200 grid grid-cols-2 gap-12 break-inside-avoid">
                         <div className="relative">
                            <div className="h-20 border-b border-stone-400 mb-2 flex items-end">
                                {/* If we had a saved signature, we would display image here */}
                                <span className="text-stone-300 text-4xl font-serif italic opacity-30 px-2">Sign Here</span>
                            </div>
                            <p className="text-xs text-stone-500 uppercase">Signature of Landholder</p>
                         </div>
                         <div>
                            <div className="h-20 border-b border-stone-400 mb-2 flex items-end">
                                <span className="text-stone-300 text-4xl font-serif italic opacity-30 px-2">Sign Here</span>
                            </div>
                            <p className="text-xs text-stone-500 uppercase">Signature of Tenant</p>
                         </div>
                    </div>

                </div>
                
                {/* Actions Footer */}
                <div className="bg-stone-50 p-4 px-8 border-t border-stone-200 flex justify-end gap-3 no-print">
                    <button 
                        onClick={handleDownload}
                        className="px-4 py-2 bg-white border border-stone-300 rounded text-sm font-medium hover:bg-stone-100 transition-colors"
                    >
                        🖨️ Print / Save as PDF
                    </button>
                    {agreement.status !== 'Signed' && (
                        <button 
                            onClick={() => startSigning(agreement.id)}
                            className="px-4 py-2 bg-green-700 text-white rounded text-sm font-bold hover:bg-green-800 transition-colors shadow-sm"
                        >
                            🖋️ Sign Digitally
                        </button>
                    )}
                </div>
            </div>
          ))
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
                <h3 className="text-xl font-bold text-stone-900 mb-2">Beha Menoana (Sign Here)</h3>
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
                         <button 
                            onClick={() => setSigningId(null)}
                            className="px-4 py-2 bg-stone-100 text-stone-600 rounded-lg font-medium hover:bg-stone-200"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={saveSignature}
                            disabled={!hasSignature}
                            className={`px-4 py-2 rounded-lg font-bold text-white transition-colors ${hasSignature ? 'bg-green-700 hover:bg-green-800' : 'bg-stone-300'}`}
                        >
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

const ClauseItem = ({ label, value }: { label: string, value: string }) => (
    <div className="mb-2">
        <span className="block text-xs font-bold text-stone-500 uppercase mb-1">{label}</span>
        <span className="block font-serif text-stone-900 leading-relaxed border-l-2 border-green-500 pl-3">{value}</span>
    </div>
);

export default AgreementsView;