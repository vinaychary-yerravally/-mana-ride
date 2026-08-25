import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    const timer1 = setTimeout(() => setProgress(60), 600);
    const timer2 = setTimeout(() => setProgress(100), 1400);
    const timer3 = setTimeout(() => onFinish(), 2000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onFinish]);

  return (
    <div className="relative w-full h-full bg-indigo-600 text-white flex flex-col items-center justify-between p-8 overflow-hidden select-none">
      <div className="w-full flex justify-end">
        <button
          onClick={onFinish}
          className="text-xs font-semibold uppercase tracking-wider text-indigo-100 hover:text-white px-3 py-1 bg-white/10 rounded-full transition-colors cursor-pointer"
        >
          Skip
        </button>
      </div>

      {/* Main Logo & Typography */}
      <div className="flex flex-col items-center text-center -mt-8">
        <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mb-5 shadow-xl">
          <span className="material-symbols-outlined text-indigo-600 text-4xl fill-1">
            directions_car
          </span>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-white mb-1.5">
          MANA RIDE
        </h1>
        <p className="text-indigo-100 text-sm font-normal tracking-wide opacity-90 max-w-xs">
          Your Ride, Your Way
        </p>
      </div>

      {/* Bottom Progress Bar */}
      <div className="w-full max-w-xs flex flex-col items-center gap-2">
        <div className="w-full h-1 bg-indigo-800/60 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-200">
          Loading platform...
        </span>
      </div>
    </div>
  );
};
