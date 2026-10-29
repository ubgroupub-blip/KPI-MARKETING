import React from 'react';
import { KPIItem } from '../types/kpi';
import { X, Calendar, User, FileText, ExternalLink, History } from 'lucide-react';
import { formatKPIValue } from '../utils/kpiCalculator';

interface HistoryModalProps {
  isOpen: boolean;
  item: KPIItem | null;
  onClose: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  item,
  onClose,
}) => {
  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-800/80 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Явцын бүртгэлийн түүх</h3>
              <p className="text-xs text-slate-400 truncate max-w-xs">{item.title}</p>
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
        <div className="p-6 overflow-y-auto flex-1">
          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 mb-4 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400">Зорилт: </span>
              <strong className="text-white">{formatKPIValue(item.target, item.unit)}</strong>
            </div>
            <div>
              <span className="text-slate-400">Одоогийн бодит: </span>
              <strong className="text-indigo-300">{formatKPIValue(item.actual, item.unit)}</strong>
            </div>
            <div>
              <span className="text-slate-400">Жин: </span>
              <strong className="text-amber-300">{item.weight}%</strong>
            </div>
          </div>

          <div className="space-y-3">
            {(!item.history || item.history.length === 0) ? (
              <p className="text-xs text-slate-400 text-center py-6">
                Одоогоор бүртгэгдсэн явцын түүх байхгүй байна.
              </p>
            ) : (
              item.history.map((entry) => (
                <div key={entry.id} className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 text-xs">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
                    <div className="flex items-center gap-1.5 font-medium text-slate-300">
                      <User className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{entry.loggedBy}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{entry.date}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between font-bold text-slate-200 my-1">
                    <span>Хүрсэн дүн: {formatKPIValue(entry.newActual, item.unit)}</span>
                    <span className="text-emerald-400 font-semibold text-[11px]">
                      {entry.valueAdded >= 0 ? `+${entry.valueAdded}` : entry.valueAdded} {item.unit}
                    </span>
                  </div>

                  {entry.note && (
                    <p className="text-slate-300 text-[11px] mt-1 bg-slate-900/60 p-2 rounded border border-slate-800">
                      {entry.note}
                    </p>
                  )}

                  {entry.attachmentUrl && (
                    <a
                      href={entry.attachmentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 mt-2 font-medium"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Хавсаргасан холбоос нээх</span>
                    </a>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-800/40 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition-colors"
          >
            Хаах
          </button>
        </div>

      </div>
    </div>
  );
};
