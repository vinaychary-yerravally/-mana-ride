import React from 'react';
import { DriverStats } from '../../types';

interface DriverEarningsProps {
  stats: DriverStats;
  onBack: () => void;
  onCashOut?: () => void;
}

export const DriverEarnings: React.FC<DriverEarningsProps> = ({
  stats,
  onBack,
  onCashOut
}) => {
  const maxBar = Math.max(...stats.weeklyTrend.map((d) => d.amount), 150);

  return (
    <div className="w-full h-full bg-slate-950 text-slate-100 flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-slate-800 bg-slate-900/90 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300 hover:bg-slate-800 active:scale-95 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">arrow_back</span>
          </button>
          <h1 className="text-base font-bold text-white tracking-tight">Earnings</h1>
        </div>

        <div className="bg-slate-900 text-xs font-semibold px-2.5 py-1 rounded-full text-slate-300 flex items-center gap-1 border border-slate-800">
          <span>Oct 18 - Oct 24</span>
          <span className="material-symbols-outlined text-xs">expand_more</span>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-3.5">
        {/* Main Earnings Card */}
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-sm flex flex-col gap-3.5">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Today's Earnings
              </span>
              <div className="text-2xl font-extrabold text-white mt-0.5">
                ₹{(stats.todayEarnings * 25).toFixed(2)}
              </div>
              <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold mt-1">
                <span className="material-symbols-outlined text-[13px]">trending_up</span>
                <span>+{stats.yesterdayChangePct}% vs yesterday</span>
              </div>
            </div>

            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-xl">account_balance_wallet</span>
            </div>
          </div>

          <div className="h-px bg-slate-800 w-full" />

          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400">This Week</span>
              <p className="text-sm font-bold text-white mt-0.5">
                ₹{(stats.weeklyEarnings * 25).toFixed(2)}
              </p>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400">Total Rides</span>
              <p className="text-sm font-bold text-white mt-0.5">{stats.totalRidesCount}</p>
            </div>
          </div>
        </div>

        {/* Weekly Trend Bar Chart */}
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-xs flex flex-col gap-2.5">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-white">Weekly Activity</h3>
            <span className="text-[10px] text-slate-400">₹/day</span>
          </div>

          <div className="flex items-end justify-between gap-1.5 h-28 pt-2 px-1">
            {stats.weeklyTrend.map((day, idx) => {
              const heightPct = (day.amount / maxBar) * 100;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                  <span className="text-[9px] text-slate-400 font-medium">
                    ₹{(day.amount * 25).toFixed(0)}
                  </span>
                  <div className="w-full max-w-[20px] bg-slate-950 rounded-full h-full flex items-end p-0.5">
                    <div
                      className={`w-full rounded-full transition-all duration-700 ${
                        day.isHighlight
                          ? 'bg-indigo-500 shadow-xs'
                          : 'bg-slate-700'
                      }`}
                      style={{ height: `${Math.max(12, heightPct)}%` }}
                    />
                  </div>
                  <span
                    className={`text-[10px] font-bold ${
                      day.isHighlight ? 'text-indigo-400' : 'text-slate-400'
                    }`}
                  >
                    {day.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Rides */}
        <div className="flex flex-col gap-2">
          <h3 className="text-xs font-bold text-white px-1">Recent Completed Rides</h3>
          {stats.recentRides.map((ride) => (
            <div
              key={ride.id}
              className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center justify-between shadow-xs"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-950 text-indigo-400 flex items-center justify-center">
                  <span className="material-symbols-outlined text-base">directions_car</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-white">{ride.title}</p>
                  <p className="text-[10px] text-slate-400">{ride.subtext}</p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-xs font-extrabold text-white">
                  ₹{(ride.amount * 25).toFixed(2)}
                </p>
                <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950 px-1.5 py-0.2 rounded">
                  {ride.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Transfer Button */}
        <button
          onClick={onCashOut || (() => alert('Earnings transferred to linked bank account!'))}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white font-bold text-xs tracking-wider uppercase rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer mt-1"
        >
          <span className="material-symbols-outlined text-base">payments</span>
          <span>TRANSFER EARNINGS TO BANK</span>
        </button>
      </div>
    </div>
  );
};
