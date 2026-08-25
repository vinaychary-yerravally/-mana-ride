import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';

interface RideCompletedProps {
  totalFare?: number;
  distanceKm?: number;
  durationMins?: number;
  driverName?: string;
  vehicleDetails?: string;
  onSubmitRating: (rating: number, feedback: string) => void;
  onDone: () => void;
}

export const RideCompleted: React.FC<RideCompletedProps> = ({
  totalFare = 1010.62,
  distanceKm = 14.2,
  durationMins = 42,
  driverName = 'Rajesh Kumar',
  vehicleDetails = 'Toyota Innova • MH 01 AB 1234',
  onSubmitRating,
  onDone
}) => {
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.4 },
        colors: ['#4648d4', '#6063ee', '#c0c1ff', '#b55d00']
      });
    } catch (e) {
      // safe fallback
    }
  }, []);

  const handleSubmit = () => {
    onSubmitRating(rating, feedback);
  };

  return (
    <div className="w-full h-full bg-white flex flex-col justify-between overflow-y-auto p-4 select-none">
      <div className="flex flex-col items-center max-w-md mx-auto w-full">
        {/* Celebration Header */}
        <div className="flex flex-col items-center text-center pt-2 pb-3">
          <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center mb-2 shadow-xs">
            <span className="material-symbols-outlined text-3xl text-emerald-600 fill-1">
              check_circle
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Ride Completed!
          </h1>
          <p className="text-xs text-slate-500">
            Thank you for riding with MANA RIDE
          </p>
        </div>

        {/* Final Fare Card */}
        <div className="w-full bg-slate-50 rounded-2xl p-3.5 border border-slate-200 shadow-xs flex flex-col gap-2.5 mb-2.5">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-white border border-slate-200 flex items-center justify-center rounded-xl text-indigo-600">
                <span className="material-symbols-outlined text-lg">receipt_long</span>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-medium">Total Fare</p>
                <p className="text-lg font-extrabold text-slate-900">₹{totalFare.toFixed(2)}</p>
              </div>
            </div>
            <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase">
              Paid
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center pt-0.5">
            <div className="flex flex-col items-center">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Distance</span>
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                <span className="material-symbols-outlined text-[12px] text-slate-400">route</span>
                {distanceKm} km
              </span>
            </div>

            <div className="flex flex-col items-center border-x border-slate-200">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Time</span>
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                <span className="material-symbols-outlined text-[12px] text-slate-400">schedule</span>
                {durationMins} min
              </span>
            </div>

            <div className="flex flex-col items-center">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Date</span>
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                <span className="material-symbols-outlined text-[12px] text-slate-400">calendar_today</span>
                Today
              </span>
            </div>
          </div>
        </div>

        {/* Driver Info Brief */}
        <div className="w-full bg-white rounded-xl p-3 border border-slate-200 shadow-xs flex items-center gap-2.5 mb-2.5">
          <img
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
            alt="Driver"
            className="w-10 h-10 rounded-full object-cover border border-slate-200"
          />
          <div className="flex-1">
            <p className="font-bold text-xs text-slate-900">{driverName}</p>
            <p className="text-[11px] text-slate-500">{vehicleDetails}</p>
          </div>
        </div>

        {/* Rating Section */}
        <div className="w-full bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs flex flex-col items-center gap-2 mb-3">
          <h2 className="text-xs font-bold text-slate-900 text-center">
            How was your ride?
          </h2>

          {/* Interactive Stars */}
          <div className="flex gap-2 justify-center py-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="transition-transform active:scale-125 focus:outline-none"
              >
                <span
                  className={`material-symbols-outlined text-2xl transition-colors ${
                    star <= rating ? 'text-amber-500 fill-1' : 'text-slate-200'
                  }`}
                >
                  star
                </span>
              </button>
            ))}
          </div>

          {/* Optional Feedback */}
          <div className="w-full mt-1">
            <textarea
              rows={2}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Leave a note for the driver (optional)"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-indigo-600 focus:outline-none resize-none transition-shadow"
            />
          </div>
        </div>
      </div>

      {/* Bottom Action Area */}
      <div className="w-full max-w-md mx-auto flex flex-col gap-2 pt-1">
        <button
          onClick={handleSubmit}
          className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white rounded-xl font-bold text-xs tracking-wider uppercase flex items-center justify-center transition-all shadow-md shadow-indigo-100 cursor-pointer"
        >
          <span>SUBMIT RATING</span>
        </button>
        <button
          onClick={onDone}
          className="w-full h-10 bg-slate-100 hover:bg-slate-200 active:scale-[0.98] text-slate-700 rounded-xl font-bold text-xs tracking-wider uppercase flex items-center justify-center border border-slate-200 transition-all cursor-pointer"
        >
          <span>DONE</span>
        </button>
      </div>
    </div>
  );
};
