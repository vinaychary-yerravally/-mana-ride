import React, { useEffect } from 'react';
import { VehicleType, VEHICLE_PRICING } from '../../types';
import { InteractiveMap } from '../common/InteractiveMap';

interface SearchingDriverProps {
  vehicleType: VehicleType;
  pickupAddress: string;
  destinationAddress: string;
  totalFare: number;
  onDriverFound: () => void;
  onCancel: () => void;
}

export const SearchingDriver: React.FC<SearchingDriverProps> = ({
  vehicleType = 'car',
  pickupAddress = '123 Market Street, San Francisco',
  destinationAddress = 'SFO International Airport',
  totalFare = 1010.62,
  onDriverFound,
  onCancel
}) => {
  const pricing = VEHICLE_PRICING[vehicleType] || VEHICLE_PRICING.car;

  useEffect(() => {
    // Automatically transition to driver found after 3 seconds for smooth flow testing
    const timer = setTimeout(() => {
      onDriverFound();
    }, 3200);

    return () => clearTimeout(timer);
  }, [onDriverFound]);

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden bg-white">
      {/* Interactive Map with Radar Animation */}
      <div className="absolute inset-0 z-0">
        <InteractiveMap mode="searching" />
      </div>

      {/* Floating Bottom Card */}
      <div className="mt-auto z-10 w-full p-4">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-5">
          {/* Drag handle */}
          <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mb-3" />

          {/* Status Header */}
          <div className="flex items-center gap-2.5 pb-2">
            <span className="w-2.5 h-2.5 bg-indigo-600 rounded-full animate-ping" />
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Finding a nearby driver...
            </h2>
          </div>

          {/* Shimmer Progress Line */}
          <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden mb-3.5 relative">
            <div className="h-full bg-indigo-600 w-1/3 rounded-full animate-[shimmer_1.5s_infinite_linear]" />
          </div>

          {/* Ride Summary Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 mb-3.5 flex flex-col gap-2.5">
            {/* Vehicle & Fare */}
            <div className="flex justify-between items-center pb-2.5 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                  <span className="material-symbols-outlined text-2xl">{pricing.icon}</span>
                </div>
                <div>
                  <p className="font-bold text-xs text-slate-900">MANA {pricing.name}</p>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">person</span> {pricing.capacity} seats
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-base font-extrabold text-slate-900">₹{totalFare.toFixed(2)}</p>
                <p className="text-[10px] text-slate-400">Est. Fare</p>
              </div>
            </div>

            {/* Route */}
            <div className="flex flex-col gap-2 relative pl-1">
              <div className="flex items-start gap-2.5">
                <div className="w-4 h-4 rounded-full border-2 border-indigo-600 bg-white flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pickup</p>
                  <p className="text-xs font-semibold text-slate-800 truncate">{pickupAddress}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-[10px]">location_on</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Destination</p>
                  <p className="text-xs font-semibold text-slate-800 truncate">{destinationAddress}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Cancel Button */}
          <button
            onClick={onCancel}
            className="w-full py-3 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer border border-slate-200"
          >
            <span>CANCEL RIDE</span>
          </button>
        </div>
      </div>
    </div>
  );
};
