import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useTransit } from '../../context/TransitContext';

export const HeroBanner: React.FC = () => {
  const { user, setActiveTab } = useTransit();
  const firstName = user.name.split(' ')[0] || 'Pruthviraj';

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#EFF6FF] via-[#F8FAFC] to-[#F1F5F9] border border-blue-100/60 shadow-card">
      <div className="flex flex-col md:flex-row items-center justify-between min-h-[220px] lg:min-h-[240px]">
        {/* Left Content */}
        <div className="p-7 lg:p-9 z-10 max-w-lg space-y-3">
          <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold text-slate-900 tracking-tight leading-[1.2]">
            Welcome Back, <br />
            <span className="text-slate-900">{firstName}!</span>{' '}
            <span className="inline-block animate-bounce">👋</span>
          </h2>
          <p className="text-sm lg:text-[15px] font-medium text-slate-600 leading-relaxed max-w-md">
            Book tickets, track your bus in real time, and travel hassle-free.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setActiveTab('book')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/35 transition-all duration-200 group"
            >
              <span>Book a Ride</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Right Illustration matching screenshot */}
        <div className="relative w-full md:w-[48%] h-48 md:h-[240px] overflow-hidden flex items-center justify-end">
          <img
            src="/assets/hero-bus.jpg"
            alt="SmartMove modern transit bus on sunny road"
            className="w-full h-full object-cover object-center md:object-right scale-100 md:mask-gradient"
            style={{
              maskImage: 'linear-gradient(to right, transparent, black 18%)',
              WebkitMaskImage: 'linear-gradient(to right, transparent, black 18%)',
            }}
          />
        </div>
      </div>
    </div>
  );
};
