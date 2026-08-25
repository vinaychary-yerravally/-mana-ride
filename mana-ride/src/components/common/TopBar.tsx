import React from 'react';

interface TopBarProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  onMenu?: () => void;
  onProfileClick?: () => void;
  avatarUrl?: string;
  hasNotification?: boolean;
  onNotificationClick?: () => void;
  dark?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  title = 'MANA RIDE',
  showBack = false,
  onBack,
  onMenu,
  onProfileClick,
  avatarUrl,
  hasNotification = true,
  onNotificationClick,
  dark = false
}) => {
  return (
    <header
      className={`w-full top-0 sticky z-40 transition-colors h-16 flex items-center justify-between px-4 ${
        dark ? 'bg-[#0F172A] text-white border-b border-slate-800' : 'bg-white text-slate-900 border-b border-slate-100'
      }`}
    >
      <div className="flex items-center gap-3">
        {showBack ? (
          <button
            onClick={onBack}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-95 ${
              dark ? 'bg-slate-800 text-indigo-400 hover:bg-slate-700' : 'bg-slate-100 text-indigo-600 hover:bg-slate-200'
            }`}
            aria-label="Back"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
        ) : (
          <button
            onClick={onMenu}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-95 ${
              dark ? 'bg-slate-800 text-indigo-400 hover:bg-slate-700' : 'bg-slate-100 text-indigo-600 hover:bg-slate-200'
            }`}
            aria-label="Menu"
          >
            <span className="material-symbols-outlined text-[20px]">menu</span>
          </button>
        )}

        <div>
          <span className={`text-[10px] font-bold uppercase tracking-widest block leading-none mb-0.5 ${
            dark ? 'text-slate-400' : 'text-slate-400'
          }`}>
            MANA RIDE
          </span>
          <h1 className={`text-base font-extrabold tracking-tight leading-tight select-none ${
            dark ? 'text-white' : 'text-indigo-950'
          }`}>
            {title}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onNotificationClick}
          className={`relative w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-95 ${
            dark ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
          }`}
          aria-label="Notifications"
        >
          <span className="material-symbols-outlined text-[20px]">notifications</span>
          {hasNotification && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#0F172A]" />
          )}
        </button>

        <button
          onClick={onProfileClick}
          className={`w-8 h-8 rounded-full overflow-hidden border transition-all flex items-center justify-center active:scale-95 ${
            dark ? 'border-slate-700 bg-slate-800 text-indigo-400' : 'border-slate-200 bg-indigo-50 text-indigo-600'
          }`}
          aria-label="Profile"
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt="User Avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="material-symbols-outlined text-[18px]">person</span>
          )}
        </button>
      </div>
    </header>
  );
};
