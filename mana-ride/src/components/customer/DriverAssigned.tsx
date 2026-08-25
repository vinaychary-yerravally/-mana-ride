import React from 'react';
import { DriverInfo } from '../../types';
import { InteractiveMap } from '../common/InteractiveMap';

interface DriverAssignedProps {
  driver: DriverInfo;
  pin?: string;
  onStartRide: () => void;
  onCancelRide: () => void;
}

export const DriverAssigned: React.FC<DriverAssignedProps> = ({
  driver = {
    id: 'drv-101',
    name: 'Rajesh K.',
    rating: 4.9,
    totalRides: 4281,
    vehicleModel: 'Swift Dzire',
    vehiclePlate: 'MH 12 AB 1234',
    vehicleColor: 'White',
    vehicleType: 'car',
    phone: '+91 98765 43210',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    currentCoords: { lat: 12.9352, lng: 77.6245 }
  },
  pin = '8291',
  onStartRide,
  onCancelRide
}) => {
  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden bg-white">
      {/* Interactive Map Canvas */}
      <div className="absolute inset-0 z-0">
        <InteractiveMap mode="pickup" />
      </div>

      {/* Driver Info Bottom Sheet */}
      <div className="mt-auto z-10 w-full p-4">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-5">
          {/* Handle */}
          <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mb-3" />

          {/* Status Banner */}
          <div className="flex items-center justify-between bg-indigo-600 text-white px-3.5 py-2.5 rounded-xl mb-3 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] fill-1">schedule</span>
              <span className="font-bold text-xs tracking-tight">Arriving in 3 mins</span>
            </div>
            <span className="text-[11px] text-indigo-100 font-medium">1.2 km away</span>
          </div>

          {/* Driver & Vehicle Details Card */}
          <div className="flex items-center justify-between border border-slate-200 rounded-2xl p-3 bg-slate-50 mb-3">
            {/* Driver Profile */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={driver.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'}
                  alt={driver.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-indigo-600"
                />
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-white border border-slate-200 rounded-full px-1.5 py-0.2 flex items-center gap-0.5 shadow-xs">
                  <span className="text-[10px] font-bold text-slate-900">{driver.rating}</span>
                  <span className="material-symbols-outlined text-[10px] text-amber-500 fill-1">star</span>
                </div>
              </div>

              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-900">{driver.name}</span>
                <span className="text-[11px] text-slate-500">{driver.totalRides.toLocaleString()} rides</span>
              </div>
            </div>

            {/* Vehicle Details */}
            <div className="flex flex-col items-end border-l border-slate-200 pl-3">
              <span className="font-bold text-xs text-slate-900">{driver.vehiclePlate}</span>
              <span className="text-[11px] text-slate-500">{driver.vehicleModel}</span>
              <div className="w-8 h-5 mt-1 bg-indigo-50 border border-indigo-100 rounded flex items-center justify-center">
                <span className="material-symbols-outlined text-indigo-600 text-[14px]">directions_car</span>
              </div>
            </div>
          </div>

          {/* Safety PIN */}
          <div className="flex items-center justify-center gap-2 bg-indigo-50/70 py-2 px-3 rounded-xl border border-indigo-100 mb-3">
            <span className="text-[11px] text-slate-600 font-medium">Provide PIN to driver:</span>
            <span className="text-base font-extrabold tracking-widest text-indigo-700">{pin}</span>
          </div>

          {/* Contact Action Buttons */}
          <div className="grid grid-cols-2 gap-2.5 mb-3">
            <button
              onClick={() => alert(`Calling driver at ${driver.phone}`)}
              className="flex items-center justify-center gap-2 py-2.5 bg-slate-100 text-slate-800 rounded-xl hover:bg-slate-200 active:scale-95 transition-all text-xs font-semibold border border-slate-200"
            >
              <span className="material-symbols-outlined text-base fill-1 text-slate-600">call</span>
              <span>Call</span>
            </button>

            <button
              onClick={() => alert(`Opening chat with ${driver.name}`)}
              className="flex items-center justify-center gap-2 py-2.5 bg-slate-100 text-slate-800 rounded-xl hover:bg-slate-200 active:scale-95 transition-all text-xs font-semibold border border-slate-200"
            >
              <span className="material-symbols-outlined text-base fill-1 text-slate-600">chat</span>
              <span>Message</span>
            </button>
          </div>

          {/* Simulate Ride Start Button (for previewing ride flow) */}
          <button
            onClick={onStartRide}
            className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-bold text-xs tracking-wider uppercase py-3 rounded-xl transition-all shadow-md shadow-indigo-100 flex items-center justify-center gap-1.5 cursor-pointer mb-2"
          >
            <span>SIMULATE DRIVER ARRIVAL & START TRIP</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>

          {/* Cancel Option */}
          <button
            onClick={onCancelRide}
            className="w-full py-1 text-slate-500 hover:text-red-600 font-medium text-xs rounded-lg transition-colors cursor-pointer"
          >
            Cancel Ride
          </button>
        </div>
      </div>
    </div>
  );
};
