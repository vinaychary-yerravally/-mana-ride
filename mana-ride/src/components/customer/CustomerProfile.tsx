import React from 'react';
import { CustomerProfile as CustomerProfileType } from '../../types';

interface CustomerProfileProps {
  profile: CustomerProfileType;
  onLogout: () => void;
  onSwitchToDriver?: () => void;
}

export const CustomerProfile: React.FC<CustomerProfileProps> = ({
  profile,
  onLogout,
  onSwitchToDriver
}) => {
  const menuItems = [
    { icon: 'person', title: 'Personal Information', sub: 'Edit name, phone & email' },
    { icon: 'bookmark', title: 'Saved Places', sub: 'Home, Work, Airport' },
    { icon: 'account_balance_wallet', title: 'Payment Methods', sub: 'UPI, Credit Cards, MANA Wallet' },
    { icon: 'shield', title: 'Safety & Emergency Contacts', sub: 'Trusted contacts, SOS setup' },
    { icon: 'tune', title: 'Preferences', sub: 'Language, Dark Mode, Notifications' },
    { icon: 'help', title: 'Help & Support', sub: '24/7 Support, FAQs, Complaints' }
  ];

  return (
    <div className="w-full h-full bg-white flex flex-col overflow-y-auto">
      {/* Header Profile Section */}
      <div className="p-6 bg-slate-50 flex flex-col items-center text-center border-b border-slate-200">
        <div className="relative mb-3">
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white shadow-md bg-indigo-600 flex items-center justify-center text-white">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
            ) : (
              <span className="material-symbols-outlined text-4xl">person</span>
            )}
          </div>
          <div className="absolute bottom-0 right-0 bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-xs cursor-pointer">
            <span className="material-symbols-outlined text-xs">edit</span>
          </div>
        </div>

        <h2 className="text-lg font-bold text-slate-900 tracking-tight">{profile.name}</h2>
        <p className="text-xs text-slate-500 mt-0.5">{profile.phone}</p>
        <p className="text-xs text-slate-400">{profile.email}</p>

        {/* Stats Row */}
        <div className="w-full max-w-sm grid grid-cols-4 gap-1 mt-4 bg-white rounded-2xl p-3 border border-slate-200 shadow-xs">
          <div className="flex flex-col items-center">
            <div className="flex items-center text-amber-500 gap-0.5">
              <span className="text-xs font-bold text-slate-900">{profile.rating}</span>
              <span className="material-symbols-outlined text-[13px] fill-1">star</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5">Rating</span>
          </div>

          <div className="flex flex-col items-center border-l border-slate-200">
            <span className="text-xs font-bold text-slate-900">{profile.totalRides}</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Rides</span>
          </div>

          <div className="flex flex-col items-center border-l border-slate-200">
            <span className="text-xs font-bold text-slate-900">{profile.membershipYears} yrs</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Member</span>
          </div>

          <div className="flex flex-col items-center border-l border-slate-200">
            <span className="text-[11px] font-bold text-indigo-600">Gold</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Tier</span>
          </div>
        </div>
      </div>

      {/* Role Switcher Promo Banner */}
      {onSwitchToDriver && (
        <div className="p-4 pb-0">
          <div
            onClick={onSwitchToDriver}
            className="bg-slate-900 text-white p-3.5 rounded-2xl flex items-center justify-between shadow-xs cursor-pointer hover:bg-slate-800 active:scale-[0.99] transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center text-indigo-300">
                <span className="material-symbols-outlined text-xl">drive_eta</span>
              </div>
              <div>
                <p className="font-bold text-xs">Switch to Driver Mode</p>
                <p className="text-[11px] text-slate-300">View dashboard & accept rides</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-slate-400 text-lg">chevron_right</span>
          </div>
        </div>
      )}

      {/* Profile Menu List */}
      <div className="p-4 flex flex-col gap-2">
        {menuItems.map((item) => (
          <div
            key={item.title}
            onClick={() => alert(`Opening ${item.title}`)}
            className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between hover:bg-slate-50 active:scale-[0.99] transition-all cursor-pointer shadow-xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">{item.title}</p>
                <p className="text-[11px] text-slate-500">{item.sub}</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-slate-400 text-lg">chevron_right</span>
          </div>
        ))}

        {/* Logout */}
        <button
          onClick={onLogout}
          className="mt-3 w-full py-2.5 bg-rose-50 border border-rose-200 text-rose-700 font-bold text-xs tracking-wider uppercase rounded-xl hover:bg-rose-100 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span className="material-symbols-outlined text-base">logout</span>
          <span>LOG OUT</span>
        </button>
      </div>
    </div>
  );
};
