import React, { useState, useEffect } from 'react';
import { KPIItem, UserProfile } from '../types/kpi';
import { X, Check, Sliders, AlertTriangle, CheckCircle, Wand2, Info } from 'lucide-react';

interface WeightRebalanceModalProps {
  isOpen: boolean;
  user: UserProfile;
  period: string;
  items: KPIItem[];
  onClose: () => void;
  onSave: (userId: string, period: string, updates: { id: string; weight: number }[]) => void;
}

export const WeightRebalanceModal: React.FC<WeightRebalanceModalProps> = ({
  isOpen,
  user,
  period,
  items,
  onClose,
  onSave,
}) => {
  const [weights, setWeights] = useState<Record<string, number>>({});

  useEffect(() => {
    if (items.length > 0) {
      const initial: Record<string, number> = {};
      items.forEach(it => {
        initial[it.id] = it.weight;
      });
      setWeights(initial);
    }
  }, [items, isOpen]);

  if (!isOpen) return null;

  const coreItems = items.filter(it => it.category === 'CORE_70');
  const unplannedItems = items.filter(it => it.category === 'UNPLANNED_30');

  const coreTotal = coreItems.reduce((acc, curr) => acc + (weights[curr.id] ?? curr.weight), 0);
  const unplannedTotal = unplannedItems.reduce((acc, curr) => acc + (weights[curr.id] ?? curr.weight), 0);

  const isCoreValid = Math.abs(coreTotal - 70) < 0.1;
  const isUnplannedValid = Math.abs(unplannedTotal - 30) < 0.1;

  const handleWeightChange = (id: string, val: number) => {
    setWeights(prev => ({
      ...prev,
      [id]: Math.max(0, val),
    }));
  };

  // Auto-balance weights to equal 70 and 30 respectively
  const autoBalanceWeights = () => {
    const updated: Record<string, number> = { ...weights };

    // Balance core to 70
    if (coreItems.length > 0) {
      const share = Math.floor(70 / coreItems.length);
      const remainder = 70 - share * coreItems.length;
      coreItems.forEach((it, idx) => {
        updated[it.id] = share + (idx === 0 ? remainder : 0);
      });
    }

    // Balance unplanned to 30
    if (unplannedItems.length > 0) {
      const share = Math.floor(30 / unplannedItems.length);
      const remainder = 30 - share * unplannedItems.length;
      unplannedItems.forEach((it, idx) => {
        updated[it.id] = share + (idx === 0 ? remainder : 0);
      });
    }

    setWeights(updated);
  };

  const handleSave = () => {
    const updates = Object.entries(weights).map(([id, weight]) => ({
      id,
      weight,
    }));
    onSave(user.id, period, updates);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-800/80 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                KPI Жингийн тохиргоо (70% ба 30%)
              </h3>
              <p className="text-xs text-slate-400">
                {user.name} ({user.title}) • {period}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* Quick Notice & Auto-balance button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-indigo-950/30 border border-indigo-900/40 rounded-xl p-3.5">
            <div className="flex items-start gap-2.5">
              <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <p className="text-xs text-indigo-200">
                Дүрмийн дагуу: <strong>Үндсэн ажил яг 70%</strong>, <strong>Төлөвлөгөөнөөс гадуурх ажил яг 30%</strong> байх ёстой.
              </p>
            </div>
            <button
              onClick={autoBalanceWeights}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shrink-0 self-start sm:self-auto"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Автоматаар тэнцвэржүүлэх</span>
            </button>
          </div>

          {/* Section 1: Core Items (70%) */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
              <div>
                <h4 className="font-bold text-sm text-indigo-300">
                  Үндсэн ажил (Зорилтот нийлбэр: 70%)
                </h4>
                <p className="text-[11px] text-slate-400">Төлөвлөгөөт стратегийн үзүүлэлтүүд</p>
              </div>
              <div className="text-right">
                <span className={`text-sm font-extrabold ${isCoreValid ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {coreTotal}% / 70%
                </span>
                {isCoreValid ? (
                  <div className="text-[10px] text-emerald-400 flex items-center justify-end gap-1">
                    <CheckCircle className="w-3 h-3" /> Зөв
                  </div>
                ) : (
                  <div className="text-[10px] text-rose-400 flex items-center justify-end gap-1">
                    <AlertTriangle className="w-3 h-3" /> {70 - coreTotal > 0 ? `+${70 - coreTotal}% дутуу` : `${Math.abs(70 - coreTotal)}% илүү`}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              {coreItems.map(item => (
                <div key={item.id} className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex-1 truncate">
                    <span className="font-semibold text-slate-200 block truncate">{item.title}</span>
                    <span className="text-[11px] text-slate-400">{item.description}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="70"
                      value={weights[item.id] ?? item.weight}
                      onChange={(e) => handleWeightChange(item.id, parseFloat(e.target.value) || 0)}
                      className="w-16 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-center font-bold text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <span className="text-slate-400 font-semibold">%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Unplanned Items (30%) */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
              <div>
                <h4 className="font-bold text-sm text-amber-300">
                  Төлөвлөгөөнөөс гадуурх ажил (Зорилтот нийлбэр: 30%)
                </h4>
                <p className="text-[11px] text-slate-400">Шуурхай, гэнэтийн ажлууд</p>
              </div>
              <div className="text-right">
                <span className={`text-sm font-extrabold ${isUnplannedValid ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {unplannedTotal}% / 30%
                </span>
                {isUnplannedValid ? (
                  <div className="text-[10px] text-emerald-400 flex items-center justify-end gap-1">
                    <CheckCircle className="w-3 h-3" /> Зөв
                  </div>
                ) : (
                  <div className="text-[10px] text-rose-400 flex items-center justify-end gap-1">
                    <AlertTriangle className="w-3 h-3" /> {30 - unplannedTotal > 0 ? `+${30 - unplannedTotal}% дутуу` : `${Math.abs(30 - unplannedTotal)}% илүү`}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              {unplannedItems.map(item => (
                <div key={item.id} className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex-1 truncate">
                    <span className="font-semibold text-slate-200 block truncate">{item.title}</span>
                    <span className="text-[11px] text-slate-400">{item.description}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="30"
                      value={weights[item.id] ?? item.weight}
                      onChange={(e) => handleWeightChange(item.id, parseFloat(e.target.value) || 0)}
                      className="w-16 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-center font-bold text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <span className="text-slate-400 font-semibold">%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-800/60 border-t border-slate-800 flex items-center justify-between text-xs">
          <div className="text-slate-400">
            Нийт жин: <strong className={isCoreValid && isUnplannedValid ? 'text-emerald-400' : 'text-rose-400'}>{coreTotal + unplannedTotal}%</strong> / 100%
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-colors"
            >
              Цуцлах
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-md flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              Жинг хадгалах
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
