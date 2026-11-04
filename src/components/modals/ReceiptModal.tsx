import React from 'react';
import { X, Printer, FileText, CheckCircle2 } from 'lucide-react';
import { useTransit } from '../../context/TransitContext';

export const ReceiptModal: React.FC = () => {
  const { selectedReceiptForModal, setSelectedReceiptForModal, user } = useTransit();

  if (!selectedReceiptForModal) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 my-8">
        {/* Close Button */}
        <button
          onClick={() => setSelectedReceiptForModal(null)}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Printable Receipt Content */}
        <div id="printable-ticket" className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Payment Tax Receipt</h3>
                <p className="text-xs text-slate-400">SmartMove Transit Automated Fare Collection</p>
              </div>
            </div>

            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5" /> {selectedReceiptForModal.status}
            </span>
          </div>

          {/* Receipt Info */}
          <div className="bg-slate-50 rounded-2xl p-4 grid grid-cols-2 gap-3 text-xs border border-slate-100">
            <div>
              <span className="text-slate-400 block font-medium">Receipt No.</span>
              <span className="font-extrabold text-slate-900 font-mono text-sm">
                {selectedReceiptForModal.receiptNumber}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Date & Time</span>
              <span className="font-bold text-slate-800">
                {selectedReceiptForModal.date} | {selectedReceiptForModal.time}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Billed To</span>
              <span className="font-bold text-slate-800">{user.name}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Payment Mode</span>
              <span className="font-bold text-blue-600">{selectedReceiptForModal.paymentMethod}</span>
            </div>
            {selectedReceiptForModal.transactionId && (
              <div className="col-span-2 pt-1 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-medium">Banking Transaction Ref</span>
                <span className="font-mono font-bold text-slate-700">
                  {selectedReceiptForModal.transactionId}
                </span>
              </div>
            )}
          </div>

          {/* Line items */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Transaction Particulars & Fare Computation
            </h4>
            <div className="border border-slate-100 rounded-2xl p-4 space-y-2.5 text-xs">
              <div className="flex justify-between font-medium text-slate-800 pb-2 border-b border-slate-100">
                <span>{selectedReceiptForModal.description}</span>
                <span className="font-bold">₹{selectedReceiptForModal.baseAmount.toFixed(2)}</span>
              </div>
              {selectedReceiptForModal.fareBreakdown && (
                <>
                  <div className="flex justify-between text-slate-500">
                    <span>Base Service Fare ({selectedReceiptForModal.fareBreakdown.busTypeLabel})</span>
                    <span>₹{selectedReceiptForModal.fareBreakdown.baseRate}.00</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Distance Transit Charge ({selectedReceiptForModal.fareBreakdown.distanceKm} km)</span>
                    <span>₹{selectedReceiptForModal.fareBreakdown.baseDistanceFare}.00</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Passenger Safety & Clean Air Cess</span>
                    <span>₹{selectedReceiptForModal.fareBreakdown.safetyCess.toFixed(2)}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between text-slate-500">
                <span>Central GST (CGST @ 2.5%)</span>
                <span>₹{(selectedReceiptForModal.taxAmount / 2).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>State GST (SGST @ 2.5%)</span>
                <span>₹{(selectedReceiptForModal.taxAmount / 2).toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-slate-100 flex justify-between text-sm font-extrabold text-slate-900">
                <span>Total Amount Paid</span>
                <span className="text-blue-600">₹{selectedReceiptForModal.amount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-center text-slate-400">
            This is a computer-generated tax invoice and does not require a physical signature.
          </p>
        </div>

        {/* Buttons */}
        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            onClick={() => setSelectedReceiptForModal(null)}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};
