import React, { useState } from 'react';
import { useKPI } from '../context/KPIContext';
import { 
  ShieldCheck, 
  UserCheck, 
  Users, 
  Calendar, 
  Bell, 
  RotateCcw, 
  Download, 
  Printer, 
  Sparkles, 
  ChevronDown,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';
import { getPeriodLabel, AVAILABLE_PERIODS } from '../utils/kpiCalculator';

interface NavbarProps {
  onOpenAccountSwitcher: () => void;
  onOpenReport: () => void;
  onOpenWeightManager: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAccountSwitcher,
  onOpenReport,
  onOpenWeightManager,
}) => {
  const { 
    currentUser, 
    selectedPeriod, 
    setSelectedPeriod, 
    notifications, 
    markNotificationsAsRead,
    resetToDefaults,
    exportDataToJSON
  } = useKPI();

  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const periods = AVAILABLE_PERIODS;

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 p-0.5 shadow-lg shadow-indigo-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-300 bg-clip-text text-transparent">
                  МАРКЕТИНГ KPI СИСТЕМ
                </h1>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Бодит цагийн хяналт
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Үндсэн ажил (70%) • Төлөвлөгөөнөөс гадуурх (30%)
              </p>
            </div>
          </div>

          {/* Center: Period Selector & Quick Badges */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="flex items-center bg-slate-950/80 border border-slate-800 rounded-lg p-1">
              <Calendar className="w-4 h-4 text-indigo-400 ml-2 mr-1.5" />
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-200 py-1.5 pr-3 pl-1 focus:outline-none cursor-pointer"
              >
                {periods.map(p => (
                  <option key={p} value={p} className="bg-slate-900 text-white">
                    {getPeriodLabel(p)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-800/60 border border-slate-700/50 rounded-lg px-2.5 py-1 text-xs">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              <span className="text-slate-300 font-medium">Үндсэн: <strong className="text-indigo-300">70%</strong></span>
              <span className="text-slate-600">|</span>
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span className="text-slate-300 font-medium">Гадуурх: <strong className="text-amber-300">30%</strong></span>
            </div>
          </div>

          {/* Right: Actions, Notifications & Account Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Report & Print button */}
            <button
              onClick={onOpenReport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors shadow-sm"
              title="Тайлан харах, экспортлох"
            >
              <Printer className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Тайлан</span>
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications) markNotificationsAsRead();
                }}
                className="relative p-2 rounded-lg bg-slate-800/70 hover:bg-slate-700 border border-slate-700/60 text-slate-300 hover:text-white transition-colors"
                title="Мэдэгдлүүд"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl z-50 p-3 overflow-hidden">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Системийн мэдээлэл & Ажиллагаа
                    </span>
                    <button
                      onClick={markNotificationsAsRead}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300"
                    >
                      Бүгдийг уншсан
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/60 mt-1">
                    {notifications.length === 0 ? (
                      <p className="py-6 text-center text-xs text-slate-400">Мэдэгдэл байхгүй байна.</p>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className="py-2.5 px-1 hover:bg-slate-800/40 rounded transition-colors">
                          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                            <span className="font-semibold text-slate-200">{n.userName}</span>
                            <span>{n.timestamp}</span>
                          </div>
                          <p className="text-xs font-medium text-indigo-300">{n.action}</p>
                          <p className="text-xs text-slate-300 mt-0.5">{n.detail}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Current Account Card / Switcher Button */}
            <button
              onClick={onOpenAccountSwitcher}
              className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700/80 transition-all text-left shadow-md group"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-lg object-cover ring-2 ring-indigo-500/40"
              />
              <div className="hidden sm:block">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {currentUser.name}
                  </span>
                  {currentUser.role === 'admin' ? (
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Админ
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      Ажилтан
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 truncate max-w-[130px]">
                  {currentUser.title}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors ml-1" />
            </button>

          </div>
        </div>
      </div>
    </header>
  );
};
