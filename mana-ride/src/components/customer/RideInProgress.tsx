import React, { useEffect, useState } from 'react';
import { DriverInfo } from '../../types';
import { InteractiveMap } from '../common/InteractiveMap';

interface RideInProgressProps {
  driver: DriverInfo;
  totalFare: number;
  onCompleteRide: () => void;
}

export const RideInProgress: React.FC<RideInProgressProps> = ({
  driver = {
    id: 'drv-101',
    name: 'Rajesh K.',
    rating: 4.9,
    totalRides: 4281,
    vehicleModel: 'White Swift Dzire',
    vehiclePlate: 'MH 12 AB 1234',
    vehicleColor: 'White',
    vehicleType: 'car',
    phone: '+91 98765 43210',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    currentCoords: { lat: 12.9352, lng: 77.6245 }
  },
  totalFare = 1010.62,
  onCompleteRide
}) => {
  const [progress, setProgress] = useState(35);
  const [etaMins, setEtaMins] = useState(12);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return 95;
        return prev + 2;
      });
      setEtaMins((prev) => (prev > 1 ? prev - 1 : 1));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden bg-white">
      {/* Live Map Layer */}
      <div className="absolute inset-0 z-0">
        <InteractiveMap mode="in_progress" routeProgress={progress} />
      </div>

      {/* Top Status Pill Header */}
      <div className="w-full pt-3 px-4 z-20 pointer-events-none">
        <div className="pointer-events-auto flex items-center justify-between w-full h-12 bg-white rounded-full shadow-md px-3.5 border border-slate-200">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest leading-none">
                Live Trip
              </span>
              <span className="text-xs font-bold text-slate-900 leading-tight">
                {etaMins} mins away
              </span>
            </div>
          </div>

          <button
            onClick={() => alert('Emergency SOS & Safety features activated')}
            className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center border border-red-100 hover:bg-red-100 active:scale-95 transition-all"
            title="Safety Shield"
          >
            <span className="material-symbols-outlined text-[16px] fill-1">shield</span>
          </button>
        </div>
      </div>

      {/* Floating Bottom Card */}
      <div className="w-full p-4 z-20">
        <div className="bg-white rounded-3xl shadow-xl p-4 flex flex-col gap-3 border border-slate-200">
          {/* Driver & Vehicle Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative w-11 h-11 rounded-full overflow-hidden bg-slate-100 border border-slate-200">
                <img
                  src={driver.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'}
                  alt={driver.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xs text-slate-900">{driver.name}</span>
                <div className="flex items-center gap-1 text-slate-500">
                  <span className="material-symbols-outlined text-[12px] text-amber-500 fill-1">star</span>
                  <span className="text-[11px] font-semibold">{driver.rating}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end">
              <span className="text-xs font-bold text-slate-900">{driver.vehiclePlate}</span>
              <span className="text-[11px] text-slate-500">{driver.vehicleModel}</span>
            </div>
          </div>

          <div className="w-full h-px bg-slate-100" />

          {/* Trip Details Row */}
          <div className="flex items-center justify-between bg-slate-50 rounded-xl p-2.5 border border-slate-200">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-base">payments</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 font-medium">Est. Fare</span>
                <span className="text-xs font-bold text-slate-900">₹{totalFare.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-1.5">
              <button
                onClick={() => alert(`Calling driver at ${driver.phone}`)}
                className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 active:scale-95 transition-all shadow-xs"
              >
                <span className="material-symbols-outlined text-sm fill-1">call</span>
              </button>
              <button
                onClick={() => alert(`Opening chat with ${driver.name}`)}
                className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 active:scale-95 transition-all shadow-xs"
              >
                <span className="material-symbols-outlined text-sm fill-1">chat</span>
              </button>
            </div>
          </div>

          {/* Primary Action Button to Complete */}
          <button
            onClick={onCompleteRide}
            className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-bold text-xs tracking-wider uppercase py-3 rounded-xl transition-all shadow-md shadow-indigo-100 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>ARRIVE & COMPLETE TRIP</span>
            <span className="material-symbols-outlined text-base">flag</span>
          </button>
        </div>
      </div>
    </div>
  );
};
