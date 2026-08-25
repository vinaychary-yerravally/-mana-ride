import React from 'react';
import { VehicleType, VEHICLE_PRICING } from '../../types';
import { InteractiveMap } from '../common/InteractiveMap';

interface VehicleSelectionProps {
  selectedVehicle: VehicleType;
  onSelectVehicle: (vehicle: VehicleType) => void;
  onConfirm: () => void;
  onBack: () => void;
}

export const VehicleSelection: React.FC<VehicleSelectionProps> = ({
  selectedVehicle,
  onSelectVehicle,
  onConfirm,
  onBack
}) => {
  const vehicles: { id: VehicleType; name: string; rate: number; eta: number; icon: string }[] = [
    {
      id: 'bike',
      name: VEHICLE_PRICING.bike.name,
      rate: VEHICLE_PRICING.bike.ratePerKm,
      eta: VEHICLE_PRICING.bike.eta,
      icon: VEHICLE_PRICING.bike.icon
    },
    {
      id: 'scooty',
      name: VEHICLE_PRICING.scooty.name,
      rate: VEHICLE_PRICING.scooty.ratePerKm,
      eta: VEHICLE_PRICING.scooty.eta,
      icon: VEHICLE_PRICING.scooty.icon
    },
    {
      id: 'auto',
      name: VEHICLE_PRICING.auto.name,
      rate: VEHICLE_PRICING.auto.ratePerKm,
      eta: VEHICLE_PRICING.auto.eta,
      icon: VEHICLE_PRICING.auto.icon
    },
    {
      id: 'car',
      name: VEHICLE_PRICING.car.name,
      rate: VEHICLE_PRICING.car.ratePerKm,
      eta: VEHICLE_PRICING.car.eta,
      icon: VEHICLE_PRICING.car.icon
    }
  ];

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden bg-white">
      {/* Top Map Segment */}
      <div className="h-2/5 w-full relative z-0 flex-shrink-0">
        <InteractiveMap mode="customer" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white" />
      </div>

      {/* Vehicle Selection Bottom Sheet */}
      <div className="flex-1 z-10 bg-white rounded-t-3xl shadow-xl flex flex-col px-5 pt-3 pb-4 overflow-hidden -mt-6 border-t border-slate-200">
        {/* Handle Bar */}
        <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mb-3" />

        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Step 2 of 3</span>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Select Vehicle</h2>
          </div>
          <div className="inline-block bg-emerald-50 border border-emerald-100 rounded-full px-2.5 py-0.5">
            <span className="text-[10px] font-bold text-emerald-700 tracking-wider uppercase">
              NO BASE FARE
            </span>
          </div>
        </div>

        {/* Vehicle Options List */}
        <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-2.5 pb-2">
          {vehicles.map((v) => {
            const isSelected = selectedVehicle === v.id;
            return (
              <div
                key={v.id}
                onClick={() => onSelectVehicle(v.id)}
                className={`flex items-center p-3 rounded-2xl border transition-all cursor-pointer select-none active:scale-[0.99] ${
                  isSelected
                    ? 'border-2 border-indigo-600 bg-indigo-50/70 shadow-sm'
                    : 'border border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                {/* Vehicle Icon Card */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-3 flex-shrink-0 ${
                  isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                }`}>
                  <span className="material-symbols-outlined text-2xl">{v.icon}</span>
                </div>

                {/* Details */}
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-0.5">
                    <h3 className="font-bold text-sm text-slate-900">{v.name}</h3>
                    <span className="font-bold text-sm text-indigo-950">
                      ₹{v.rate}
                      <span className="text-[11px] font-normal text-slate-500">/km</span>
                    </span>
                  </div>
                  <div className="flex items-center text-[11px] text-slate-500 gap-1">
                    <span className="material-symbols-outlined text-[13px] text-slate-400">schedule</span>
                    <span>{v.eta} min away</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        <button
          onClick={onConfirm}
          className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-bold text-xs tracking-wider uppercase py-3.5 rounded-xl transition-all shadow-md shadow-indigo-100 flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>CONFIRM RIDE</span>
          <span className="material-symbols-outlined text-base">arrow_forward</span>
        </button>
      </div>
    </div>
  );
};
