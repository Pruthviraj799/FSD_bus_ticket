import React, { useState } from 'react';
import {
  Headphones,
  Phone,
  Mail,
  MessageSquare,
  HelpCircle,
  ChevronDown,
  AlertOctagon,
  Send,
  CheckCircle2
} from 'lucide-react';

export const HelpSupportPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [issueType, setIssueType] = useState('ticket');
  const [issueDesc, setIssueDesc] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const faqs = [
    {
      q: 'How do I board using my digital QR ticket or digital pass?',
      a: 'Simply open "My Tickets" or the "Upcoming Journey" card on your dashboard. When boarding, show your dynamic QR code to the bus conductor who will scan it using their handheld SmartMove validator terminal.',
    },
    {
      q: 'How does cancellation and instant refund work?',
      a: 'You can cancel any confirmed ticket up to 15 minutes prior to scheduled departure from "My Tickets". 100% of the fare is instantly credited to your SmartMove Wallet with zero cancellation deduction.',
    },
    {
      q: 'Can I use one monthly pass for multiple passengers?',
      a: 'Digital passes are non-transferable and assigned to the registered account holder (with photo ID verification). Each passenger requires their own active pass or separate ticket.',
    },
    {
      q: 'What should I do if I left an item behind on the bus?',
      a: 'Please fill out the Lost & Found form below with your Bus Number and trip details, or call our 24/7 Central Dispatch Helpline at 1800-180-2026 immediately.',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueDesc.trim()) return;
    setIsSubmitted(true);
    setTimeout(() => {
      setIssueDesc('');
    }, 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Help & Passenger Support
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            24/7 commuter assistance, transit FAQs, emergency helplines, and lost & found.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-slate-700">Support Desk Online</span>
        </div>
      </div>

      {/* Emergency & Helpline Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-6 space-y-3 hover:shadow-card-hover transition">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-extrabold text-slate-900">Transit Helpline</h4>
            <p className="text-xs text-slate-500 mt-0.5">Toll-free daily 6:00 AM - 11:00 PM</p>
            <p className="text-sm font-extrabold text-blue-600 font-mono mt-2">1800-180-2026</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-6 space-y-3 hover:shadow-card-hover transition">
          <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-extrabold text-slate-900">Emergency SOS Hotline</h4>
            <p className="text-xs text-slate-500 mt-0.5">24/7 Police & Medical Transit Assistance</p>
            <p className="text-sm font-extrabold text-rose-600 font-mono mt-2">112 / +91 172 2700010</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-6 space-y-3 hover:shadow-card-hover transition">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-extrabold text-slate-900">Email Grievance Desk</h4>
            <p className="text-xs text-slate-500 mt-0.5">Fast 2-hour response window</p>
            <p className="text-sm font-extrabold text-slate-900 mt-2">support@smartmove.in</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* FAQs Accordion (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-100 shadow-card p-6 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <HelpCircle className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-extrabold text-slate-900">
              Frequently Asked Questions
            </h3>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-100 overflow-hidden transition"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full flex items-center justify-between p-4 text-left font-bold text-xs sm:text-sm text-slate-800 hover:bg-slate-50 transition"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform ${
                        isOpen ? 'rotate-180 text-blue-600' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs text-slate-600 leading-relaxed bg-slate-50/50">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Report / Lost & Found Form (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-100 shadow-card p-6 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-extrabold text-slate-900">
              Report an Issue / Lost & Found
            </h3>
          </div>

          {isSubmitted ? (
            <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <h4 className="text-sm font-bold text-slate-900">Grievance Ticket Raised</h4>
              <p className="text-xs text-slate-600">
                Ticket reference #SM-SUP-{Math.floor(1000 + Math.random() * 9000)} has been sent to Chandigarh Dispatch.
              </p>
              <button
                onClick={() => setIsSubmitted(false)}
                className="mt-2 text-xs font-bold text-blue-600 hover:underline"
              >
                Submit another query
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Issue Category</label>
                <select
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="ticket">Ticketing & QR Code Problem</option>
                  <option value="lost">Lost & Found Property on Bus</option>
                  <option value="pass">Digital Pass Subscription</option>
                  <option value="delay">Bus Delay / Route Feedback</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Trip / Bus Reference</label>
                <input
                  type="text"
                  placeholder="e.g. Route 1A or CTU-BUS-101"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={4}
                  required
                  value={issueDesc}
                  onChange={(e) => setIssueDesc(e.target.value)}
                  placeholder="Describe your issue or lost item details..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Submit Grievance
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
