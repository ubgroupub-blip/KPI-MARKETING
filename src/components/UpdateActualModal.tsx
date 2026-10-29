import React, { useState, useEffect } from 'react';
import { KPIItem } from '../types/kpi';
import { calculateFulfillmentRate, formatKPIValue } from '../utils/kpiCalculator';
import { X, Check, TrendingUp, Link as LinkIcon, FileText } from 'lucide-react';
import confetti from 'canvas-confetti';

interface UpdateActualModalProps {
  isOpen: boolean;
  item: KPIItem | null;
  onClose: () => void;
  onSave: (kpiId: string, newActual: number, note?: string, link?: string) => void;
}

export const UpdateActualModal: React.FC<UpdateActualModalProps> = ({
  isOpen,
  item,
  onClose,
  onSave,
}) => {
  const [actualValue, setActualValue] = useState<number>(0);
  const [note, setNote] = useState<string>('');
  const [link, setLink] = useState<string>('');

  useEffect(() => {
    if (item) {
      setActualValue(item.actual);
      setNote('');
      setLink('');
    }
  }, [item]);

  if (!isOpen || !item) return null;

  // Calculate live preview
  const previewItem: KPIItem = {
    ...item,
    actual: actualValue,
  };
  const previewFulfillment = calculateFulfillmentRate(previewItem);
  const previewScore = Number(((previewFulfillment * item.weight) / 100).toFixed(2));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(item.id, actualValue, note, link);
    
    // If target achieved or exceeded, trigger confetti!
    if (previewFulfillment >= 100) {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 },
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-800/80 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Бодит гүйцэтгэл шинэчлэх</h3>
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Target & Current Values Card */}
          <div className="grid grid-cols-2 gap-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            <div>
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Төлөвлөсөн зорилт</span>
              <p className="text-sm font-bold text-slate-200 mt-0.5">
                {formatKPIValue(item.target, item.unit)}
              </p>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Эзлэх жин</span>
              <p className="text-sm font-bold text-indigo-300 mt-0.5">
                {item.weight}% {item.category === 'CORE_70' ? '(Үндсэн 70%)' : '(Гадуурх 30%)'}
              </p>
            </div>
          </div>

          {/* Actual Value Input */}
          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1.5">
              Шинэчилсэн бодит гүйцэтгэлийн тоо ({item.unit}):
            </label>
            <div className="relative">
              <input
                type="number"
                step="any"
                value={actualValue}
                onChange={(e) => setActualValue(parseFloat(e.target.value) || 0)}
                required
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-2.5 text-base font-bold text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                placeholder="0"
              />
              <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-semibold">
                {item.unit}
              </span>
            </div>
          </div>

          {/* Live Preview Box */}
          <div className="bg-gradient-to-r from-indigo-950/40 to-slate-900 border border-indigo-900/60 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400">Шинэчлэгдсэн биелэлт:</span>
              <div className="text-lg font-black text-white flex items-center gap-1.5 mt-0.5">
                <span className={previewFulfillment >= 100 ? 'text-emerald-400' : 'text-indigo-300'}>
                  {previewFulfillment.toFixed(1)}%
                </span>
                {previewFulfillment >= 100 && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                    Зорилтод хүрсэн!
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400">Тооцогдох оноо:</span>
              <div className="text-lg font-black text-indigo-300 mt-0.5">
                {previewScore} <span className="text-xs text-slate-400 font-medium">/ {item.weight} оноо</span>
              </div>
            </div>
          </div>

          {/* Note Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Явцын тэмдэглэл / Хийсэн ажлын тайлбар:
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Жишээ: 4-р долоо хоногийн борлуулалтын сэжим нэмж орууллаа..."
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Attachment / Link Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
              <LinkIcon className="w-3.5 h-3.5 text-slate-400" />
              Баталгаажуулах холбоос (Google Drive / Figma / Сошиал линк):
            </label>
            <input
              type="text"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://drive.google.com/..."
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Цуцлах
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              Гүйцэтгэл хадгалах
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
