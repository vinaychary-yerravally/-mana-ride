import React from 'react';
import { DriverStats } from '../../types';
import { InteractiveMap } from '../common/InteractiveMap';

interface DriverDashboardProps {
  isOnline: boolean;
  stats: DriverStats;
  onToggleOnline: () => void;
  onSimulateIncomingRequest: () => void;
  onViewEarnings: () => void;
  onSwitchToCustomer: () => void;
}

export const DriverDashboard: React.FC<DriverDashboardProps> = ({
  isOnline,
  stats,
  onToggleOnline,
  onSimulateIncomingRequest,
  onViewEarnings,
  onSwitchToCustomer
}) => {
  return (
    <div className="relative w-full h-full bg-slate-950 text-slate-100 flex flex-col justify-between overflow-y-auto select-none">
      {/* Background Map in Online Mode */}
      {isOnline && (
        <div className="absolute inset-0 z-0 opacity-30">
          <InteractiveMap mode="driver" darkMode={true} />
        </div>
      )}

      {/* Top Header */}
      <div className="relative z-10 p-4 flex items-center justify-between border-b border-slate-800 bg-slate-900/90 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
              alt="Driver"
              className="w-10 h-10 rounded-full object-cover border-2 border-indigo-500"
            />
            <span
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-900 ${
                isOnline ? 'bg-emerald-500' : 'bg-slate-500'
              }`}
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="font-bold text-sm text-white">Rajesh Kumar</h2>
              <span className="bg-indigo-600 text-[9px] font-bold px-1.5 py-0.2 rounded text-white tracking-wider uppercase">
                Driver
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Swift Dzire • MH 12 AB 1234</p>
          </div>
        </div>

        {/* Status Chip */}
        <div
          className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 ${
            isOnline
              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
              : 'bg-slate-800 text-slate-400 border border-slate-700'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
            }`}
          />
          <span>{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
        </div>
      </div>

      {/* Center Action (Online / Offline Toggle Button) */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 text-center">
        {/* Power Button */}
        <button
          onClick={onToggleOnline}
          className={`w-32 h-32 rounded-full flex flex-col items-center justify-center transition-all duration-300 transform active:scale-95 shadow-xl ${
            isOnline
              ? 'bg-rose-600 hover:bg-rose-700 ring-8 ring-rose-500/20'
              : 'bg-indigo-600 hover:bg-indigo-500 ring-8 ring-indigo-500/20 shadow-indigo-900/40 animate-pulse'
          }`}
        >
          <span className="material-symbols-outlined text-3xl text-white mb-0.5">
            power_settings_new
          </span>
          <span className="text-[11px] font-bold uppercase tracking-wider text-white">
            {isOnline ? 'GO OFFLINE' : 'GO ONLINE'}
          </span>
        </button>

        <p className="mt-5 text-xs text-slate-400 max-w-xs font-medium leading-relaxed">
          {isOnline
            ? 'You are online and visible to nearby riders. Waiting for dispatch requests...'
            : 'You are currently offline. Tap the button to start receiving ride requests.'}
        </p>

        {/* Demo trigger button for quick testing */}
        {isOnline && (
          <button
            onClick={onSimulateIncomingRequest}
            className="mt-4 px-3.5 py-1.5 bg-indigo-950 text-indigo-300 border border-indigo-700/60 rounded-xl text-xs font-semibold flex items-center gap-1.5 hover:bg-indigo-900 transition-all cursor-pointer shadow-xs"
          >
            <span className="material-symbols-outlined text-sm">notifications_active</span>
            <span>Simulate Incoming Customer Request</span>
          </button>
        )}
      </div>

      {/* Bottom Summary Stats Card */}
      <div className="relative z-10 p-4 bg-slate-900/90 border-t border-slate-800 rounded-t-3xl backdrop-blur-md">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-white tracking-tight">Today's Summary</h3>
          <button
            onClick={onViewEarnings}
            className="text-[11px] text-indigo-400 font-semibold hover:underline flex items-center gap-0.5"
          >
            <span>View Full Earnings</span>
            <span className="material-symbols-outlined text-xs">arrow_forward</span>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {/* Earnings */}
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex flex-col items-center">
            <span className="material-symbols-outlined text-indigo-400 text-lg mb-0.5">
              account_balance_wallet
            </span>
            <span className="text-[9px] text-slate-400 font-medium">Earnings</span>
            <span className="text-xs font-extrabold text-white mt-0.5">
              ₹{stats.todayEarnings > 0 ? (stats.todayEarnings * 25).toFixed(0) : '0'}
            </span>
          </div>

          {/* Completed Rides */}
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex flex-col items-center">
            <span className="material-symbols-outlined text-indigo-400 text-lg mb-0.5">
              directions_car
            </span>
            <span className="text-[9px] text-slate-400 font-medium">Rides</span>
            <span className="text-xs font-extrabold text-white mt-0.5">
              {stats.totalRidesCount}
            </span>
          </div>

          {/* Online Hours */}
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex flex-col items-center">
            <span className="material-symbols-outlined text-indigo-400 text-lg mb-0.5">
              schedule
            </span>
            <span className="text-[9px] text-slate-400 font-medium">Hours</span>
            <span className="text-xs font-extrabold text-white mt-0.5">
              {isOnline ? '0.4h' : '0.0h'}
            </span>
          </div>
        </div>

        {/* Switch Role Button */}
        <button
          onClick={onSwitchToCustomer}
          className="w-full mt-3 py-2 bg-slate-950 text-slate-300 hover:text-white border border-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-sm">swap_horiz</span>
          <span>Switch to Customer App</span>
        </button>
      </div>
    </div>
  );
};
