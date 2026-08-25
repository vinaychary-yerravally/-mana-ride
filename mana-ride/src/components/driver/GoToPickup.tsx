import React, { useState } from 'react';
import { RideRequest } from '../../types';
import { InteractiveMap } from '../common/InteractiveMap';

interface GoToPickupProps {
  ride: RideRequest;
  onArrived: () => void;
  onStartRide: (pin: string) => void;
  onCancel: () => void;
}

export const GoToPickup: React.FC<GoToPickupProps> = ({
  ride,
  onArrived,
  onStartRide,
  onCancel
}) => {
  const [hasArrived, setHasArrived] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const handleArrivedClick = () => {
    setHasArrived(true);
    onArrived();
  };

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === ride.pin || pinInput.trim() === '8291') {
      onStartRide(pinInput.trim());
    } else {
      setPinError(true);
    }
  };

  return (
    <div className="relative w-full h-full bg-slate-950 text-slate-100 flex flex-col justify-between overflow-hidden">
      {/* Live Driver Map */}
      <div className="absolute inset-0 z-0 opacity-80">
        <InteractiveMap mode="pickup" darkMode={true} />
      </div>

      {/* Top Banner Header */}
      <div className="w-full p-3 z-10">
        <div className="w-full bg-slate-900/95 backdrop-blur-md rounded-2xl p-3 border border-slate-800 shadow-md flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">navigation</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                {hasArrived ? 'Waiting for Customer' : 'Navigation to Pickup'}
              </span>
              <p className="text-xs font-bold text-white">
                {hasArrived ? 'Arrived at pickup point' : '1.2 km away • 4 min'}
              </p>
            </div>
          </div>

          <button
            onClick={onCancel}
            className="text-xs text-slate-400 hover:text-rose-400 font-semibold cursor-pointer px-2 py-1"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Floating Bottom Card */}
      <div className="w-full p-3 z-10">
        <div className="bg-slate-900/95 backdrop-blur-md rounded-3xl p-4 border border-slate-800 shadow-2xl flex flex-col gap-3">
          {/* Customer Profile Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                {ride.customerName.charAt(0)}
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">{ride.customerName}</h4>
                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <span className="material-symbols-outlined text-[13px] text-amber-400 fill-1">star</span>
                  <span>{ride.customerRating}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => alert(`Calling customer ${ride.customerPhone}`)}
                className="w-8 h-8 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-indigo-400 hover:bg-slate-800 active:scale-95 transition-all shadow-xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-base fill-1">call</span>
              </button>
              <button
                onClick={() => alert(`Opening chat with ${ride.customerName}`)}
                className="w-8 h-8 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-indigo-400 hover:bg-slate-800 active:scale-95 transition-all shadow-xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-base fill-1">chat</span>
              </button>
            </div>
          </div>

          {/* Pickup Address Box */}
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-start gap-2">
            <span className="material-symbols-outlined text-indigo-500 text-base mt-0.5">
              pin_drop
            </span>
            <div className="min-w-0 flex-1">
              <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">
                Pickup Address
              </span>
              <p className="text-xs font-semibold text-white truncate">
                {ride.pickupAddress}
              </p>
            </div>
          </div>

          {/* If arrived, ask for PIN */}
          {hasArrived ? (
            <form onSubmit={handleVerifyPin} className="flex flex-col gap-2">
              <div className="text-center">
                <span className="text-xs text-slate-400">
                  Ask passenger for 4-digit PIN to start trip:
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  maxLength={4}
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError(false);
                  }}
                  placeholder="PIN (e.g. 8291)"
                  className="flex-1 h-11 bg-slate-950 rounded-xl border border-slate-700 px-3 text-center font-bold tracking-widest text-base text-white focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  className="h-11 px-5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold text-xs tracking-wider uppercase rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  START TRIP
                </button>
              </div>
              {pinError && (
                <p className="text-[11px] text-rose-400 text-center">
                  Invalid PIN. Default demo PIN is {ride.pin || '8291'}.
                </p>
              )}
            </form>
          ) : (
            /* Arrived Button */
            <button
              onClick={handleArrivedClick}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white font-bold text-xs tracking-wider uppercase rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">check_circle</span>
              <span>ARRIVED AT PICKUP</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
