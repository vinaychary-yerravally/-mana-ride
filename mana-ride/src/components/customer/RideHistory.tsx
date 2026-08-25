import React, { useState } from 'react';
import { RideHistoryItem } from '../../types';

interface RideHistoryProps {
  history: RideHistoryItem[];
  onSelectRide?: (ride: RideHistoryItem) => void;
}

export const RideHistory: React.FC<RideHistoryProps> = ({
  history,
  onSelectRide
}) => {
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'COMPLETED' | 'CANCELLED'>('ALL');

  const filteredList = history.filter((item) => {
    if (activeFilter === 'COMPLETED') return item.status === 'Completed';
    if (activeFilter === 'CANCELLED') return item.status === 'Cancelled';
    return true;
  });

  return (
    <div className="w-full h-full bg-white flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="px-5 py-4 bg-white border-b border-slate-100">
        <h1 className="text-xl font-bold text-slate-900 mb-0.5 tracking-tight">Ride History</h1>
        <p className="text-xs text-slate-500">Review your past trips and receipts.</p>
      </div>

      {/* Filter Tabs */}
      <div className="px-4 py-2.5 flex gap-2 overflow-x-auto no-scrollbar border-b border-slate-100 bg-white">
        <button
          onClick={() => setActiveFilter('ALL')}
          className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
            activeFilter === 'ALL'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 border border-slate-200'
          }`}
        >
          All Rides
        </button>

        <button
          onClick={() => setActiveFilter('COMPLETED')}
          className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
            activeFilter === 'COMPLETED'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 border border-slate-200'
          }`}
        >
          Completed
        </button>

        <button
          onClick={() => setActiveFilter('CANCELLED')}
          className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
            activeFilter === 'CANCELLED'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 border border-slate-200'
          }`}
        >
          Cancelled
        </button>
      </div>

      {/* Ride List */}
      <div className="flex-1 p-4 flex flex-col gap-3">
        {filteredList.map((ride) => {
          const isCompleted = ride.status === 'Completed';

          return (
            <div
              key={ride.id}
              onClick={() => onSelectRide?.(ride)}
              className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs active:scale-[0.99] transition-transform cursor-pointer relative hover:border-slate-300"
            >
              {/* Status Badge */}
              <div
                className={`absolute top-3.5 right-3.5 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                  isCompleted
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                <span className="material-symbols-outlined text-[11px]">
                  {isCompleted ? 'check_circle' : 'cancel'}
                </span>
                <span>{ride.status}</span>
              </div>

              <div className="flex flex-col gap-1.5 pr-20">
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    {ride.date}, {ride.time}
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                    <span className="material-symbols-outlined text-[13px]">directions_car</span>
                    <span>
                      {ride.vehicleName} • {ride.vehicleCategory}
                    </span>
                  </div>
                </div>
              </div>

              {/* Timeline route */}
              <div className="relative pl-5 py-2 my-1">
                <div className="absolute left-2 top-3 bottom-3 w-0.5 bg-slate-200" />

                <div className="flex items-start gap-2 mb-2.5 relative">
                  <div
                    className={`absolute -left-5 top-1 w-2 h-2 rounded-full ${
                      isCompleted ? 'bg-indigo-600' : 'bg-slate-400'
                    } ring-4 ring-white z-10`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-900 truncate">
                      {ride.pickupAddress}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">{ride.pickupSubtext}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2 relative">
                  <div
                    className={`absolute -left-5 top-1 w-2 h-2 rounded-sm ${
                      isCompleted ? 'bg-red-500' : 'bg-slate-400'
                    } ring-4 ring-white z-10`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-900 truncate">
                      {ride.dropoffAddress}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">{ride.dropoffSubtext}</p>
                  </div>
                </div>
              </div>

              <div className="h-px bg-slate-100 w-full my-1" />

              {/* Driver & Price Footer */}
              <div className="flex justify-between items-center pt-1">
                <div className="flex items-center gap-2">
                  {ride.driverName ? (
                    <>
                      <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-100 border border-slate-200">
                        <img
                          src={ride.driverAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'}
                          alt={ride.driverName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-xs font-medium text-slate-800">
                        {ride.driverName}{' '}
                        <span className="text-slate-400 font-normal">({ride.driverRating}★)</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-xs text-slate-400 italic">No Driver Assigned</div>
                  )}
                </div>

                <div className="text-right">
                  <div className="text-sm font-extrabold text-slate-900">
                    ₹{ride.amount > 0 ? (ride.amount * 22).toFixed(2) : '0.00'}
                  </div>
                  {isCompleted && (
                    <span className="text-[10px] text-indigo-600 font-semibold hover:underline">
                      View Receipt
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        <button
          onClick={() => alert('All recent trips loaded')}
          className="w-full py-2.5 text-xs font-bold text-indigo-600 hover:bg-slate-50 rounded-xl transition-colors text-center"
        >
          Load More History
        </button>
      </div>
    </div>
  );
};
