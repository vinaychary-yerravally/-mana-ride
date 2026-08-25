import React, { useState } from 'react';
import { Coordinates, LocationPreset } from '../../types';
import { InteractiveMap } from '../common/InteractiveMap';

interface CustomerHomeProps {
  userName?: string;
  pickupAddress: string;
  destinationAddress: string;
  canProceed?: boolean;
  onSelectPickup: (address: string, coords?: Coordinates) => void;
  onSelectDestination: (address: string, coords?: Coordinates) => void;
  onBookRideClick: () => void;
}

const pickupPresets: LocationPreset[] = [
  { label: 'Current', address: '1st Block Koramangala', coords: { lat: 12.9352, lng: 77.6245 } },
  { label: 'Home', address: '1st Block Koramangala', coords: { lat: 12.9352, lng: 77.6245 } },
  { label: 'Indiranagar', address: 'Indiranagar, Bengaluru', coords: { lat: 12.9719, lng: 77.6412 } },
  { label: 'Airport', address: 'Kempegowda International Airport', coords: { lat: 13.1986, lng: 77.7066 } }
];

const destinationPresets: LocationPreset[] = [
  { label: 'Airport', address: "Kempegowda Int'l Airport", coords: { lat: 13.1986, lng: 77.7066 } },
  { label: 'Office', address: 'Manyata Tech Park, Bengaluru', coords: { lat: 13.0469, lng: 77.5984 } },
  { label: 'MG Road', address: 'MG Road, Bengaluru', coords: { lat: 12.9757, lng: 77.6068 } },
  { label: 'Whitefield', address: 'Whitefield, Bengaluru', coords: { lat: 12.9698, lng: 77.7499 } }
];

export const CustomerHome: React.FC<CustomerHomeProps> = ({
  userName = 'Vinay',
  pickupAddress = '1st Block Koramangala',
  destinationAddress = "Kempegowda Int'l Airport",
  canProceed = true,
  onSelectPickup,
  onSelectDestination,
  onBookRideClick
}) => {
  const [pickupInput, setPickupInput] = useState(pickupAddress || '');
  const [destinationInput, setDestinationInput] = useState(destinationAddress || '');

  const hasPickup = pickupInput.trim().length > 0;
  const hasDestination = destinationInput.trim().length > 0;
  const isBookingDisabled = !(hasPickup && hasDestination && canProceed);

  const handlePickupChipClick = (preset: LocationPreset) => {
    setPickupInput(preset.address);
    onSelectPickup(preset.address, preset.coords);
  };

  const handleDestinationChipClick = (preset: LocationPreset) => {
    setDestinationInput(preset.address);
    onSelectDestination(preset.address, preset.coords);
  };

  const handleMapAreaClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const isPickupSide = clickX < rect.width / 2;

    if (isPickupSide) {
      const preset = pickupPresets[0];
      setPickupInput(preset.address);
      onSelectPickup(preset.address, preset.coords);
    } else {
      const preset = destinationPresets[0];
      setDestinationInput(preset.address);
      onSelectDestination(preset.address, preset.coords);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPickup = pickupInput.trim();
    const cleanDestination = destinationInput.trim();

    if (!cleanPickup) {
      const fallbackPickup = '1st Block Koramangala';
      onSelectPickup(fallbackPickup, { lat: 12.9352, lng: 77.6245 });
      setPickupInput(fallbackPickup);
    }

    if (!cleanDestination) {
      const fallbackDestination = "Kempegowda Int'l Airport";
      onSelectDestination(fallbackDestination, { lat: 13.1986, lng: 77.7066 });
      setDestinationInput(fallbackDestination);
    }

    const nextPickup = (cleanPickup || '1st Block Koramangala').trim();
    const nextDestination = (cleanDestination || "Kempegowda Int'l Airport").trim();

    if (!nextPickup || !nextDestination) {
      return;
    }

    onBookRideClick();
  };

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden bg-white">
      <div className="absolute inset-0 z-0" onClick={handleMapAreaClick}>
        <InteractiveMap mode="customer" pickupLabel={pickupInput || pickupAddress} destinationLabel={destinationInput || destinationAddress} />
      </div>

      <div className="mt-auto z-10 w-full p-4">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-5">
          <div className="mb-3">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Welcome Back</span>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Good evening, {userName}
            </h2>
          </div>

          <form onSubmit={handleFormSubmit} className="relative bg-slate-50 rounded-2xl p-2 border border-slate-200">
            <div className="absolute left-6 top-5 bottom-5 w-0.5 bg-slate-300 flex flex-col justify-between items-center pointer-events-none">
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 -mt-1 ring-4 ring-slate-100" />
              <div className="w-2.5 h-2.5 rounded-sm bg-slate-800 -mb-1 ring-4 ring-slate-100" />
            </div>

            <div className="flex items-center pl-10 pr-3 py-2.5 mb-1 rounded-xl">
              <input
                type="text"
                value={pickupInput}
                onChange={(e) => {
                  setPickupInput(e.target.value);
                  onSelectPickup(e.target.value, { lat: 12.9352, lng: 77.6245 });
                }}
                placeholder="Enter pickup location"
                className="w-full bg-transparent border-none p-0 text-xs font-bold text-indigo-700 placeholder:text-slate-400 focus:outline-none"
              />
            </div>

            <div className="h-px bg-slate-200 ml-10 mr-3" />

            <div className="flex items-center pl-10 pr-3 py-2.5 mt-1 bg-white rounded-xl border border-slate-200 focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
              <input
                type="text"
                value={destinationInput}
                onChange={(e) => {
                  setDestinationInput(e.target.value);
                  onSelectDestination(e.target.value, { lat: 13.1986, lng: 77.7066 });
                }}
                placeholder="Where are you going?"
                className="w-full bg-transparent border-none p-0 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
          </form>

          <div className="mt-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Quick pickup</p>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {pickupPresets.map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => handlePickupChipClick(chip)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-full whitespace-nowrap active:scale-95 transition-all hover:bg-slate-50 text-xs font-medium text-slate-700"
                >
                  <span className="material-symbols-outlined text-[15px] text-slate-400">location_on</span>
                  <span>{chip.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Quick destination</p>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {destinationPresets.map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => handleDestinationChipClick(chip)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-full whitespace-nowrap active:scale-95 transition-all hover:bg-slate-50 text-xs font-medium text-slate-700"
                >
                  <span className="material-symbols-outlined text-[15px] text-slate-400">flag</span>
                  <span>{chip.label}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleFormSubmit as any}
            disabled={isBookingDisabled}
            className={`w-full mt-3.5 font-bold text-xs tracking-wider uppercase py-3.5 px-6 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 ${
              isBookingDisabled
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                : 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white shadow-indigo-100 cursor-pointer'
            }`}
          >
            <span>BOOK A RIDE</span>
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
};
