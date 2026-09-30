import React from 'react';
import { Home, Layers, ScanLine, CreditCard, User as UserIcon } from 'lucide-react';

export type TabType = 'home' | 'requests' | 'subscription' | 'profile';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onScanClick: () => void;
  activeRequestsCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  onScanClick,
  activeRequestsCount = 0
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-xl border-t border-slate-800/80 px-2 py-2 max-w-lg mx-auto">
      <div className="flex items-center justify-around relative">
        {/* Home */}
        <button
          onClick={() => onTabChange('home')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition ${
            activeTab === 'home'
              ? 'text-indigo-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Home</span>
        </button>

        {/* Requests */}
        <button
          onClick={() => onTabChange('requests')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl relative transition ${
            activeTab === 'requests'
              ? 'text-indigo-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Requests</span>
          {activeRequestsCount > 0 && (
            <span className="absolute 1 top-0 right-2 w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
          )}
        </button>

        {/* Center SCAN FAB Button */}
        <div className="relative -top-5">
          <button
            onClick={onScanClick}
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 text-white flex items-center justify-center shadow-xl shadow-indigo-600/40 border-4 border-slate-950 active:scale-95 transition transform hover:scale-105"
            aria-label="Scan Number Plate"
          >
            <ScanLine className="w-7 h-7" />
          </button>
        </div>

        {/* Subscription */}
        <button
          onClick={() => onTabChange('subscription')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition ${
            activeTab === 'subscription'
              ? 'text-indigo-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <CreditCard className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Subscription</span>
        </button>

        {/* Profile */}
        <button
          onClick={() => onTabChange('profile')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition ${
            activeTab === 'profile'
              ? 'text-indigo-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <UserIcon className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Profile</span>
        </button>
      </div>
    </nav>
  );
};
