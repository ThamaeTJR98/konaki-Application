
import React, { useState } from 'react';
import { CashBookEntry } from '../types';

const CashBookView: React.FC = () => {
  const [entries, setEntries] = useState<CashBookEntry[]>([
    { id: '1', date: '2024-05-01', description: 'Thekiso ea Poone', amount: 2500, type: 'INCOME', category: 'Sales' },
    { id: '2', date: '2024-05-03', description: 'Reka Manyolo (Fertilizer)', amount: 800, type: 'EXPENSE', category: 'Inputs' },
    { id: '3', date: '2024-05-05', description: 'Tefo ea Terekere', amount: 500, type: 'EXPENSE', category: 'Labor' },
  ]);

  const [newDesc, setNewDesc] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newType, setNewType] = useState<'INCOME' | 'EXPENSE'>('INCOME');
  const [showAddModal, setShowAddModal] = useState(false);

  const totalIncome = entries.filter(e => e.type === 'INCOME').reduce((sum, e) => sum + e.amount, 0);
  const totalExpense = entries.filter(e => e.type === 'EXPENSE').reduce((sum, e) => sum + e.amount, 0);
  const profit = totalIncome - totalExpense;

  const handleAddEntry = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newDesc || !newAmount) return;

      const entry: CashBookEntry = {
          id: Date.now().toString(),
          date: new Date().toISOString().split('T')[0],
          description: newDesc,
          amount: parseFloat(newAmount),
          type: newType,
          category: 'General'
      };

      setEntries([entry, ...entries]);
      setNewDesc('');
      setNewAmount('');
      setShowAddModal(false);
  };

  return (
    <div className="h-full overflow-y-auto bg-stone-50 p-4 sm:p-6 pb-24">
       <div className="mb-6 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-stone-900">Buka ea Lichelete (Cash Book)</h2>
        <p className="text-stone-500 text-sm">Boloka litlaleho tsa khoebo ea hau. (Keep records to track profit).</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3 mb-8 max-w-4xl mx-auto">
          <div className="bg-green-50 p-4 rounded-xl border border-green-100">
              <p className="text-xs text-green-600 font-bold uppercase">Chelete e Keneng</p>
              <p className="text-lg font-bold text-green-800">M {totalIncome.toLocaleString()}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-xl border border-red-100">
              <p className="text-xs text-red-600 font-bold uppercase">Chelete e Tsoileng</p>
              <p className="text-lg font-bold text-red-800">M {totalExpense.toLocaleString()}</p>
          </div>
          <div className={`p-4 rounded-xl border ${profit >= 0 ? 'bg-stone-800 text-white border-stone-900' : 'bg-red-100 text-red-800 border-red-200'}`}>
              <p className="text-xs font-bold uppercase opacity-80">Phaello (Profit)</p>
              <p className="text-lg font-bold">M {profit.toLocaleString()}</p>
          </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-xl shadow-sm border border-stone-200 max-w-4xl mx-auto overflow-hidden">
          <div className="p-4 border-b border-stone-100 flex justify-between items-center bg-stone-50">
              <h3 className="font-bold text-stone-700">Litlaleho (Transactions)</h3>
              <button 
                onClick={() => setShowAddModal(true)}
                className="text-sm bg-stone-800 text-white px-3 py-1.5 rounded-lg hover:bg-stone-700 transition-colors"
              >
                  + Ncha
              </button>
          </div>
          <div className="divide-y divide-stone-100">
              {entries.map(entry => (
                  <div key={entry.id} className="p-4 flex justify-between items-center hover:bg-stone-50">
                      <div>
                          <p className="font-bold text-stone-800">{entry.description}</p>
                          <p className="text-xs text-stone-500">{entry.date} • {entry.category}</p>
                      </div>
                      <span className={`font-bold ${entry.type === 'INCOME' ? 'text-green-600' : 'text-red-500'}`}>
                          {entry.type === 'INCOME' ? '+' : '-'} M {entry.amount.toLocaleString()}
                      </span>
                  </div>
              ))}
              {entries.length === 0 && (
                  <div className="p-8 text-center text-stone-400">
                      Ha ho litlaleho hajoale.
                  </div>
              )}
          </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-fade-in-up">
                <h3 className="text-lg font-bold text-stone-900 mb-4">Kenya Tlaleho e Ncha</h3>
                <form onSubmit={handleAddEntry} className="space-y-4">
                    <div className="flex gap-2 p-1 bg-stone-100 rounded-lg">
                        <button
                            type="button"
                            onClick={() => setNewType('INCOME')}
                            className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${newType === 'INCOME' ? 'bg-green-600 text-white shadow' : 'text-stone-500'}`}
                        >
                            E Keneng (In)
                        </button>
                        <button
                            type="button"
                            onClick={() => setNewType('EXPENSE')}
                            className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${newType === 'EXPENSE' ? 'bg-red-500 text-white shadow' : 'text-stone-500'}`}
                        >
                            E Tsoileng (Out)
                        </button>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-stone-500 mb-1">Tlhaloso (Description)</label>
                        <input 
                            type="text" 
                            value={newDesc}
                            onChange={(e) => setNewDesc(e.target.value)}
                            className="w-full border border-stone-300 rounded-lg p-2 focus:ring-2 focus:ring-stone-500 outline-none"
                            placeholder="Mohlala: Thekiso ea Linaoa"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-stone-500 mb-1">Chelete (Amount in Maloti)</label>
                        <input 
                            type="number" 
                            value={newAmount}
                            onChange={(e) => setNewAmount(e.target.value)}
                            className="w-full border border-stone-300 rounded-lg p-2 focus:ring-2 focus:ring-stone-500 outline-none"
                            placeholder="0.00"
                            required
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-2 bg-stone-100 text-stone-600 rounded-lg font-bold">Hlakola</button>
                        <button type="submit" className="flex-1 py-2 bg-stone-900 text-white rounded-lg font-bold">Boloka</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default CashBookView;
