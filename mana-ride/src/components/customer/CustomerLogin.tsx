import React, { useState } from 'react';

interface CustomerLoginProps {
  onLoginSuccess: () => void;
}

export const CustomerLogin: React.FC<CustomerLoginProps> = ({ onLoginSuccess }) => {
  const [phoneNumber, setPhoneNumber] = useState('9876543210');
  const [countryCode, setCountryCode] = useState('+91');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 10) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess();
    }, 600);
  };

  return (
    <div className="w-full h-full bg-white flex flex-col md:flex-row overflow-y-auto">
      {/* Left Banner on Desktop */}
      <div className="hidden md:flex flex-1 bg-indigo-600 p-10 flex-col justify-between text-white relative overflow-hidden">
        <div className="flex items-center gap-3 z-10">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
            <span className="material-symbols-outlined text-2xl fill-1">directions_car</span>
          </div>
          <span className="text-xl font-bold tracking-tight">MANA RIDE</span>
        </div>

        <div className="max-w-md z-10 my-auto py-10">
          <h2 className="text-2xl font-bold tracking-tight mb-3">
            Fair, transparent rides with zero base fares.
          </h2>
          <p className="text-indigo-100 text-sm leading-relaxed">
            Direct kilometer-based pricing across Bike, Scooty, Auto, and Cars.
          </p>
        </div>

        <div className="text-xs text-indigo-200 z-10">
          MANA RIDE Mobility © 2026
        </div>
      </div>

      {/* Right Form Card */}
      <div className="flex-1 flex flex-col justify-between p-6 max-w-sm mx-auto w-full">
        {/* Mobile Header */}
        <div className="md:hidden flex flex-col items-center mt-6 mb-6">
          <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-md mb-2.5">
            <span className="material-symbols-outlined text-2xl fill-1">directions_car</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">MANA RIDE</h1>
        </div>

        <div className="my-auto">
          <h2 className="text-xl font-bold text-slate-900 mb-1 tracking-tight">
            Welcome
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            Enter your mobile number to sign in or get started.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Phone input with country code */}
            <div className="flex items-center h-12 w-full bg-slate-50 rounded-xl border border-slate-200 focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-600/20 transition-all">
              <div className="flex items-center h-full px-3.5 border-r border-slate-200 text-slate-900 font-medium text-xs gap-1 cursor-pointer">
                <span>{countryCode}</span>
                <span className="material-symbols-outlined text-base text-slate-400">arrow_drop_down</span>
              </div>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Mobile Number"
                className="flex-1 h-full bg-transparent px-3 text-slate-900 text-sm font-medium outline-none placeholder:text-slate-400"
                required
              />
            </div>

            {/* Continue Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-semibold text-xs rounded-xl transition-all shadow-md shadow-indigo-100 flex items-center justify-center gap-2 group cursor-pointer uppercase tracking-wider"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Continue</span>
                  <span className="material-symbols-outlined text-base group-hover:translate-x-0.5 transition-transform">
                    arrow_forward
                  </span>
                </>
              )}
            </button>
          </form>

          {/* Social Divider */}
          <div className="mt-6 relative flex items-center justify-center">
            <div className="absolute inset-x-0 h-px bg-slate-200" />
            <span className="relative bg-white px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              or continue with
            </span>
          </div>

          {/* Social Buttons */}
          <div className="flex gap-2.5 mt-4">
            <button
              type="button"
              onClick={onLoginSuccess}
              className="flex-1 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-xs font-semibold text-slate-700 hover:bg-slate-50 active:scale-95 transition-all shadow-xs"
            >
              Google
            </button>
            <button
              type="button"
              onClick={onLoginSuccess}
              className="flex-1 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-xs font-semibold text-slate-700 hover:bg-slate-50 active:scale-95 transition-all shadow-xs"
            >
              Apple
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-2 text-center">
          <p className="text-[11px] text-slate-400 leading-relaxed">
            By continuing, you agree to our{' '}
            <span className="text-indigo-600 font-medium cursor-pointer hover:underline">
              Terms
            </span>{' '}
            and{' '}
            <span className="text-indigo-600 font-medium cursor-pointer hover:underline">
              Privacy Policy
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};
