import React, { useState } from 'react';
import { useKPI } from '../context/KPIContext';
import { UserProfile } from '../types/kpi';
import { 
  X, 
  ShieldCheck, 
  User, 
  Check, 
  KeyRound, 
  Lock, 
  LogIn, 
  Sparkles,
  Info
} from 'lucide-react';

interface AccountSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccountSwitcherModal: React.FC<AccountSwitcherModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { users, currentUser, loginAs, logout } = useKPI();
  const [selectedUserToAuth, setSelectedUserToAuth] = useState<UserProfile | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  if (!isOpen) return null;

  const handleSelectUser = (user: UserProfile) => {
    // Instant switch with smooth feedback
    loginAs(user.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-800/80 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20 text-indigo-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Аккаунт сонгож нэвтрэх
              </h3>
              <p className="text-xs text-slate-400">
                Маркетингийн багийн 5 гишүүн болон Админ хэрэглэгч
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4 bg-indigo-950/40 border border-indigo-800/50 rounded-xl p-3 flex items-start gap-3">
            <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div className="text-xs text-indigo-200">
              <span className="font-semibold text-white">Хандах эрхийн тохиргоо:</span>
              <ul className="list-disc list-inside mt-1 space-y-0.5 text-indigo-300">
                <li><strong className="text-emerald-300">Админ (Та өөрөө)</strong>: Бүх багийн гишүүдийг нэгдсэн самбараар хянах, 70/30 жин батлах, зорилт засах.</li>
                <li><strong className="text-indigo-300">Ажилтнууд</strong>: Өөрийн KPI-д бодит гүйцэтгэл оруулах, төлөвлөгөөнөөс гадуурх шинэ ажил нэмэх.</li>
              </ul>
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Боломжит 6 аккаунт (Шууд сонгож шилжих):
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {users.map(user => {
                const isCurrent = currentUser.id === user.id;
                const isAdmin = user.role === 'admin';

                return (
                  <button
                    key={user.id}
                    onClick={() => handleSelectUser(user)}
                    className={`flex items-center gap-3.5 p-3 rounded-xl border text-left transition-all ${
                      isCurrent
                        ? 'bg-indigo-600/20 border-indigo-500 ring-2 ring-indigo-500/20 text-white'
                        : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/70 hover:border-slate-600 text-slate-200'
                    }`}
                  >
                    <div className="relative">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-11 h-11 rounded-xl object-cover ring-2 ring-slate-700"
                      />
                      {isAdmin && (
                        <span className="absolute -bottom-1 -right-1 p-0.5 bg-emerald-500 rounded-full text-white" title="Админ">
                          <ShieldCheck className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm truncate text-white">
                          {user.name}
                        </span>
                        {isCurrent && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                            <Check className="w-3 h-3" /> Идэвхтэй
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-indigo-300/90 truncate font-medium">
                        {user.title}
                      </p>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-1.5">
                        <span>Нэр: <strong className="text-indigo-300">{user.username}</strong></span>
                        <span>•</span>
                        <span>Нууц үг: <strong className="text-slate-300">{user.password}</strong></span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-800/40 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Одоогийн нэвтэрсэн: <strong className="text-white">{currentUser.name}</strong> ({currentUser.role === 'admin' ? 'Админ' : 'Ажилтан'})</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-800/80 text-rose-300 text-xs font-semibold transition-colors flex items-center gap-1"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Гарах (Нэвтрэх хуудас)</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
            >
              Хаах
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
