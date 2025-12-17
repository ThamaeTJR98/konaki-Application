
import React from 'react';
import { CashBookEntry } from '../types';

interface CashBookReportProps {
  entries: CashBookEntry[];
  onClose: () => void;
}

const CashBookReport: React.FC<CashBookReportProps> = ({ entries, onClose }) => {

  const sortedEntries = [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const incomeEntries = sortedEntries.filter(e => e.type === 'INCOME');
  const expenseEntries = sortedEntries.filter(e => e.type === 'EXPENSE');

  const totalIncome = incomeEntries.reduce((sum, e) => sum + e.amount, 0);
  const totalExpense = expenseEntries.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalIncome - totalExpense;
  
  const handlePrint = () => {
      window.print();
  };

  return (
    <div className="absolute inset-0 bg-stone-100 z-40 p-4 sm:p-8 overflow-y-auto">
        {/* Report Controls */}
        <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center no-print">
            <h2 className="text-xl font-bold text-stone-800">Financial Report</h2>
            <div className="flex gap-3">
                <button onClick={onClose} className="px-4 py-2 bg-white border border-stone-300 rounded-lg text-sm font-medium hover:bg-stone-50">Close</button>
                <button onClick={handlePrint} className="px-4 py-2 bg-green-700 text-white rounded-lg text-sm font-bold hover:bg-green-800 flex items-center gap-2">
                    <span>🖨️</span> Print / Save PDF
                </button>
            </div>
        </div>

        {/* Printable Report Content */}
        <div className="max-w-4xl mx-auto bg-white p-8 sm:p-12 shadow-lg print:shadow-none font-serif text-stone-800" id="report-content">
            <header className="text-center mb-12 pb-6 border-b-2 border-stone-800">
                <h1 className="text-4xl font-bold mb-1">Financial Summary</h1>
                <p className="text-stone-500">KONAKI AI Cash Book Report</p>
                <p className="text-xs mt-2">Generated on: {new Date().toDateString()}</p>
            </header>

            {/* Summary Section */}
            <section className="mb-12 grid grid-cols-3 gap-6">
                <div className="text-center p-4 bg-green-50/50 border-t-4 border-green-500">
                    <p className="text-sm font-bold uppercase tracking-wider text-green-700">Total Income</p>
                    <p className="text-3xl font-bold mt-2">M {totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                 <div className="text-center p-4 bg-red-50/50 border-t-4 border-red-500">
                    <p className="text-sm font-bold uppercase tracking-wider text-red-700">Total Expenses</p>
                    <p className="text-3xl font-bold mt-2">M {totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                <div className={`text-center p-4 border-t-4 ${netProfit >= 0 ? 'bg-stone-800 text-white border-stone-500' : 'bg-red-700 text-white border-red-900'}`}>
                    <p className="text-sm font-bold uppercase tracking-wider opacity-80">Net Profit / Loss</p>
                    <p className="text-3xl font-bold mt-2">M {netProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
            </section>

            {/* Transaction Tables */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8 break-before-page">
                {/* Income Table */}
                <div>
                    <h2 className="text-xl font-bold mb-4 border-b border-stone-200 pb-2">Income Transactions</h2>
                    <table className="w-full text-sm">
                        <thead className="text-left text-xs uppercase text-stone-500 bg-stone-50">
                            <tr>
                                <th className="p-2">Date</th>
                                <th className="p-2">Description</th>
                                <th className="p-2 text-right">Amount (M)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {incomeEntries.map(e => (
                                <tr key={e.id} className="border-b border-stone-100">
                                    <td className="p-2 whitespace-nowrap">{e.date}</td>
                                    <td className="p-2">{e.description}</td>
                                    <td className="p-2 text-right font-mono text-green-600">{e.amount.toFixed(2)}</td>
                                </tr>
                            ))}
                            {incomeEntries.length === 0 && <tr><td colSpan={3} className="p-4 text-center text-stone-400 italic">No income recorded.</td></tr>}
                        </tbody>
                    </table>
                </div>

                 {/* Expense Table */}
                 <div>
                    <h2 className="text-xl font-bold mb-4 border-b border-stone-200 pb-2">Expense Transactions</h2>
                    <table className="w-full text-sm">
                        <thead className="text-left text-xs uppercase text-stone-500 bg-stone-50">
                            <tr>
                                <th className="p-2">Date</th>
                                <th className="p-2">Description</th>
                                <th className="p-2 text-right">Amount (M)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {expenseEntries.map(e => (
                                <tr key={e.id} className="border-b border-stone-100">
                                    <td className="p-2 whitespace-nowrap">{e.date}</td>
                                    <td className="p-2">{e.description}</td>
                                    <td className="p-2 text-right font-mono text-red-600">({e.amount.toFixed(2)})</td>
                                </tr>
                            ))}
                             {expenseEntries.length === 0 && <tr><td colSpan={3} className="p-4 text-center text-stone-400 italic">No expenses recorded.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </section>
            
            <footer className="mt-16 pt-6 border-t border-stone-200 text-center text-xs text-stone-400">
                This is a computer-generated report from KONAKI AI. It should be used for informational purposes.
            </footer>
        </div>
    </div>
  );
};

export default CashBookReport;
