import React, { useState } from 'react';
import { FileText, Eye, Printer, Download, CreditCard, CheckCircle2, ArrowDownUp } from 'lucide-react';
import { useTransit } from '../context/TransitContext';

export const ReceiptsPage: React.FC = () => {
  const { receipts, setSelectedReceiptForModal, user } = useTransit();
  const [filterMode, setFilterMode] = useState<'all' | 'tickets' | 'passes'>('all');

  const filteredReceipts = receipts.filter((r) => {
    if (filterMode === 'tickets') return r.ticketOrPassId.startsWith('CTU-TKT');
    if (filterMode === 'passes') return r.ticketOrPassId.startsWith('PASS');
    return true;
  });

  const totalSpent = receipts
    .filter((r) => r.status === 'Paid')
    .reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Billing & Payment Receipts
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Download GST tax invoices, review transaction records, and fare receipts.
          </p>
        </div>

        {/* Quick summary metric */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 px-4 py-2.5 rounded-2xl">
          <CreditCard className="w-4 h-4 text-blue-600" />
          <div className="text-xs">
            <span className="text-slate-400 block font-medium">Total Commute Spend</span>
            <span className="text-sm font-extrabold text-slate-900">₹{totalSpent.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex gap-2">
        {[
          { id: 'all', label: `All Invoices (${receipts.length})` },
          { id: 'tickets', label: 'Bus Tickets' },
          { id: 'passes', label: 'Pass Subscriptions' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterMode(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              filterMode === tab.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Receipts Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-6">Receipt ID</th>
                <th className="py-4 px-6">Transaction Description</th>
                <th className="py-4 px-6">Date & Time</th>
                <th className="py-4 px-6">Payment Method</th>
                <th className="py-4 px-6 text-right">Amount</th>
                <th className="py-4 px-6 text-center">Status</th>
                <th className="py-4 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReceipts.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-4 px-6 font-mono font-bold text-slate-900">
                    {rec.receiptNumber}
                  </td>
                  <td className="py-4 px-6">
                    <p className="font-bold text-slate-800">{rec.description}</p>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Ref: {rec.ticketOrPassId}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-slate-500 whitespace-nowrap">
                    {rec.date} • {rec.time}
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px]">
                      {rec.paymentMethod}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right font-extrabold text-slate-900 text-sm">
                    ₹{rec.amount.toFixed(2)}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        rec.status === 'Paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      <CheckCircle2 className="w-3 h-3" /> {rec.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right whitespace-nowrap">
                    <button
                      onClick={() => setSelectedReceiptForModal(rec)}
                      className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 font-bold text-xs transition inline-flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Invoice</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
