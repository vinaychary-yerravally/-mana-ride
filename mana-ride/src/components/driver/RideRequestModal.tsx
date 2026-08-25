import React, { useState, useEffect } from 'react';
import { RideRequest } from '../../types';

interface RideRequestModalProps {
  request: RideRequest;
  onAccept: (rideId: string) => void;
  onDecline: (rideId: string) => void;
}

export const RideRequestModal: React.FC<RideRequestModalProps> = ({
  request,
  onAccept,
  onDecline
}) => {
  const [secondsLeft, setSecondsLeft] = useState(15);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onDecline(request.id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [request.id, onDecline]);

  // Circumference for 44px radius: 2 * PI * 20 = ~125.6
  const strokeDashoffset = 125.6 - (125.6 * secondsLeft) / 15;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-sm bg-slate-900 text-white rounded-3xl p-4 sm:p-5 border border-slate-800 shadow-2xl flex flex-col gap-3.5 animate-scale-up">
        {/* Header with Circular Countdown */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div>
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
              New Ride Request
            </span>
            <h3 className="text-lg font-bold text-white">
              MANA {request.vehicleType.toUpperCase()}
            </h3>
          </div>

          {/* SVG Circular Countdown Timer */}
          <div className="relative w-10 h-10 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="20"
                cy="20"
                r="16"
                stroke="#334155"
                strokeWidth="3"
                fill="none"
              />
              <circle
                cx="20"
                cy="20"
                r="16"
                stroke="#6366f1"
                strokeWidth="3"
                fill="none"
                strokeDasharray="100.5"
                strokeDashoffset={100.5 - (100.5 * secondsLeft) / 15}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <span className="absolute text-xs font-bold text-white">
              {secondsLeft}s
            </span>
          </div>
        </div>

        {/* Fare & Distance Highlight */}
        <div className="bg-slate-950 rounded-2xl p-3 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-medium">Driver Earnings</span>
            <div className="text-xl font-extrabold text-indigo-400">
              ₹{(request.totalFare * 0.85).toFixed(2)}
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 font-medium">Trip Distance</span>
            <div className="text-xs font-bold text-white">
              {request.distanceKm} km ({request.travelTimeMins} mins)
            </div>
          </div>
        </div>

        {/* Route Details */}
        <div className="bg-slate-950 rounded-2xl p-3 border border-slate-800 flex flex-col gap-2.5">
          <div className="flex items-start gap-2.5">
            <div className="w-4 h-4 rounded-full border-2 border-indigo-500 bg-slate-950 flex items-center justify-center mt-0.5 flex-shrink-0">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">
                Pickup • 1.2 km away
              </span>
              <p className="text-xs font-semibold text-white truncate">
                {request.pickupAddress}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <div className="w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center mt-0.5 flex-shrink-0">
              <span className="material-symbols-outlined text-[10px]">location_on</span>
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">
                Destination
              </span>
              <p className="text-xs font-semibold text-white truncate">
                {request.destinationAddress}
              </p>
            </div>
          </div>
        </div>

        {/* Customer Mini Card */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
              {request.customerName.charAt(0)}
            </div>
            <div>
              <p className="text-xs font-bold text-white">{request.customerName}</p>
              <div className="flex items-center gap-1 text-[10px] text-slate-400">
                <span className="material-symbols-outlined text-[11px] text-amber-400 fill-1">star</span>
                <span>{request.customerRating}</span>
              </div>
            </div>
          </div>
          <span className="text-[11px] text-slate-400">Cash / Online</span>
        </div>

        {/* Actions (Decline / Accept) */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button
            onClick={() => onDecline(request.id)}
            className="py-3 bg-slate-950 hover:bg-slate-800 active:scale-95 text-slate-300 font-bold text-xs tracking-wider uppercase rounded-xl border border-slate-800 transition-all cursor-pointer"
          >
            Decline
          </button>

          <button
            onClick={() => onAccept(request.id)}
            className="py-3 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-extrabold text-xs tracking-wider uppercase rounded-xl shadow-md shadow-indigo-900/50 transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>Accept Ride</span>
            <span className="text-[10px] opacity-80">({secondsLeft}s)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
