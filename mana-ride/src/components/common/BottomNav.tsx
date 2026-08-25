import React from 'react';

export type NavTab = 'home' | 'rides' | 'payments' | 'profile';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  dark?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  dark = false
}) => {
  const tabs = [
    { id: 'home' as NavTab, label: 'Home', icon: 'home' },
    { id: 'rides' as NavTab, label: 'Rides', icon: 'directions_car' },
    { id: 'payments' as NavTab, label: 'Payments', icon: 'payments' },
    { id: 'profile' as NavTab, label: 'Profile', icon: 'person' }
  ];

  return (
    <nav
      className={`w-full z-30 flex justify-around items-center h-16 px-3 border-t transition-colors select-none ${
        dark ? 'bg-[#0F172A] text-white border-slate-800' : 'bg-white text-slate-800 border-slate-100'
      }`}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center justify-center py-1 px-3 transition-all duration-150 active:scale-95 ${
              isActive
                ? dark
                  ? 'text-indigo-400 font-bold'
                  : 'text-indigo-600 font-bold'
                : dark
                ? 'text-slate-400 hover:text-slate-200'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[22px] ${isActive ? 'fill-1' : ''}`}
            >
              {tab.icon}
            </span>
            <span className="text-[10px] tracking-tight mt-0.5 font-medium">
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
