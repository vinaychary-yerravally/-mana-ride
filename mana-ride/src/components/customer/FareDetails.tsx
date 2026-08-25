import React from 'react';
import { VehicleType, VEHICLE_PRICING } from '../../types';
import { InteractiveMap } from '../common/InteractiveMap';

interface FareEstimate {
  distanceKm: number;
  travelTimeMins: number;
  ratePerKm: number;
  baseFare: number;
  distanceFare: number;
  taxesAndFees: number;
  totalFare: number;
}

interface FareDetailsProps {
  pickupAddress: string;
  destinationAddress: string;
  vehicleType: VehicleType;
  fareEstimate?: FareEstimate | null;
  onConfirmRide: () => void;
  onBack: () => void;
}

export const FareDetails: React.FC<FareDetailsProps> = ({
  pickupAddress = '1st Block Koramangala',
  destinationAddress = "Kempegowda Int'l Airport",
  vehicleType = 'car',
  fareEstimate,
  onConfirmRide,
  onBack
}) => {
  const pricing = VEHICLE_PRICING[vehicleType] || VEHICLE_PRICING.car;
  const rate = fareEstimate?.ratePerKm ?? pricing.ratePerKm;
  const distanceKm = fareEstimate?.distanceKm ?? 12;
  const travelTimeMins = fareEstimate?.travelTimeMins ?? Math.round(distanceKm * 1.68);
  const distanceFare = fareEstimate?.distanceFare ?? distanceKm * rate;
  const taxesAndFees = fareEstimate?.taxesAndFees ?? Number((distanceFare * 0.05).toFixed(2));
  const totalFare = fareEstimate?.totalFare ?? Number((distanceFare + taxesAndFees).toFixed(2));

  return (
    <div className="relative w-full h-full flex flex-col overflow-y-auto bg-white">
      <div className="h-36 w-full relative z-0 flex-shrink-0">
        <InteractiveMap mode="pickup" pickupLabel={pickupAddress} destinationLabel={destinationAddress} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white" />
      </div>

      <div className="flex-1 -mt-6 z-10 bg-white rounded-t-3xl p-4 pt-3 flex flex-col shadow-xl border-t border-slate-200">
        <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mb-3" />
        <div className="mb-3">
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Step 3 of 3</span>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Fare Details</h2>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 mb-3">
          <div className="flex items-stretch">
            <div className="flex flex-col items-center mr-3 w-5 py-0.5">
              <span className="material-symbols-outlined text-indigo-600 text-[18px] fill-1">trip_origin</span>
              <div className="w-0.5 flex-1 border-l border-dashed border-slate-300 my-1" />
              <span className="material-symbols-outlined text-red-500 text-[18px] fill-1">location_on</span>
            </div>

            <div className="flex flex-col flex-1 justify-between gap-2.5">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pickup</p>
                <p className="text-xs font-bold text-slate-800 truncate">{pickupAddress}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Destination</p>
                <p className="text-xs font-bold text-slate-800 truncate">{destinationAddress}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 mb-3">
          <div className="bg-white border border-slate-200 rounded-xl p-2.5 flex flex-col items-center justify-center">
            <span className="material-symbols-outlined text-slate-400 text-base mb-0.5">route</span>
            <p className="text-[10px] text-slate-500 font-medium">Distance</p>
            <p className="text-sm font-bold text-slate-900">{distanceKm.toFixed(1)} km</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-2.5 flex flex-col items-center justify-center">
            <span className="material-symbols-outlined text-slate-400 text-base mb-0.5">schedule</span>
            <p className="text-[10px] text-slate-500 font-medium">Travel Time</p>
            <p className="text-sm font-bold text-slate-900">{travelTimeMins} mins</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 mb-3 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
              <span className="material-symbols-outlined text-xl">{pricing.icon}</span>
            </div>
            <div>
              <p className="font-bold text-xs text-slate-900">{pricing.name}</p>
              <p className="text-[11px] text-slate-500">₹{rate}/km</p>
            </div>
          </div>
          <div className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-1 rounded-full flex items-center gap-1">
            <span className="material-symbols-outlined text-[13px]">verified</span>
            <span className="text-[10px] font-bold">Selected</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 mb-3 shadow-xs">
          <div className="flex justify-between items-center mb-1.5 text-xs">
            <p className="text-slate-500">Base Fare</p>
            <p className="font-semibold text-slate-400 line-through">₹50.00</p>
          </div>

          <div className="bg-emerald-50 border border-emerald-100 rounded-lg py-1 px-2.5 mb-2.5 flex items-center justify-center">
            <span className="text-[10px] font-bold text-emerald-700 tracking-wider uppercase">NO BASE FARE APPLIED</span>
          </div>

          <div className="flex justify-between items-center mb-1.5 text-xs">
            <p className="text-slate-500">Distance ({distanceKm.toFixed(1)} km × ₹{rate})</p>
            <p className="font-semibold text-slate-800">₹{distanceFare.toFixed(2)}</p>
          </div>

          <div className="flex justify-between items-center mb-2 text-xs">
            <p className="text-slate-500">Taxes & Fees</p>
            <p className="font-semibold text-slate-800">₹{taxesAndFees.toFixed(2)}</p>
          </div>

          <div className="h-px bg-slate-200 w-full my-2" />

          <div className="flex justify-between items-end pt-0.5">
            <div>
              <p className="text-xs font-bold text-slate-900">Total Estimated Fare</p>
              <p className="text-[10px] text-slate-400">Inclusive of all taxes</p>
            </div>
            <p className="text-xl font-extrabold text-indigo-700">₹{totalFare.toFixed(2)}</p>
          </div>
        </div>

        <button
          onClick={onConfirmRide}
          className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-bold text-xs tracking-wider uppercase py-3.5 rounded-xl transition-all shadow-md shadow-indigo-100 flex items-center justify-center gap-2 cursor-pointer mt-auto"
        >
          <span>CONFIRM RIDE</span>
          <span className="material-symbols-outlined text-base">arrow_forward</span>
        </button>
      </div>
    </div>
  );
};
