import React, { useState } from 'react';
import { KPIItem, KPICategory } from '../types/kpi';
import { calculateFulfillmentRate, calculateItemScore, formatKPIValue } from '../utils/kpiCalculator';
import { 
  Check, 
  Clock, 
  AlertCircle, 
  Edit3, 
  History, 
  Trash2, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  ArrowUpRight,
  Sparkles,
  ExternalLink,
  MessageSquare,
  SlidersHorizontal
} from 'lucide-react';

interface KPITableProps {
  items: KPIItem[];
  isAdmin: boolean;
  onUpdateActual: (item: KPIItem) => void;
  onViewHistory: (item: KPIItem) => void;
  onEditKPI: (item: KPIItem) => void;
  onDeleteKPI: (kpiId: string) => void;
  onApproveKPI: (kpiId: string) => void;
  onRejectKPI: (kpiId: string) => void;
  onAddNewKPI: (category: KPICategory) => void;
}

export const KPITable: React.FC<KPITableProps> = ({
  items,
  isAdmin,
  onUpdateActual,
  onViewHistory,
  onEditKPI,
  onDeleteKPI,
  onApproveKPI,
  onRejectKPI,
  onAddNewKPI,
}) => {
  const coreItems = items.filter(i => i.category === 'CORE_70');
  const unplannedItems = items.filter(i => i.category === 'UNPLANNED_30');

  const renderSection = (
    title: string,
    subtitle: string,
    category: KPICategory,
    sectionItems: KPIItem[],
    targetWeight: number,
    colorScheme: 'indigo' | 'amber'
  ) => {
    const totalWeight = sectionItems.reduce((acc, curr) => acc + curr.weight, 0);
    const totalScore = sectionItems.reduce((acc, curr) => acc + calculateItemScore(curr), 0);
    const isWeightMatching = Math.abs(totalWeight - targetWeight) < 0.1;

    return (
      <div className="mb-8 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {/* Section Header */}
        <div className={`px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b ${
          colorScheme === 'indigo' ? 'bg-indigo-950/40 border-indigo-900/60' : 'bg-amber-950/40 border-amber-900/60'
        }`}>
          <div className="flex items-center gap-3">
            <span className={`px-2.5 py-1 rounded-lg text-xs font-black tracking-wider uppercase ${
              colorScheme === 'indigo' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}>
              {targetWeight}% Жин
            </span>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                {title}
              </h3>
              <p className="text-xs text-slate-400">{subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-slate-400">
                Нийт оноо: <strong className={colorScheme === 'indigo' ? 'text-indigo-300' : 'text-amber-300'}>
                  {totalScore.toFixed(2)}
                </strong> / {targetWeight}.0
              </div>
              <div className="text-[11px] font-medium">
                Жин: <span className={isWeightMatching ? 'text-emerald-400' : 'text-rose-400'}>
                  {totalWeight.toFixed(1)}% / {targetWeight}%
                </span>
              </div>
            </div>

            <button
              onClick={() => onAddNewKPI(category)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all shadow-sm ${
                colorScheme === 'indigo' 
                  ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30' 
                  : 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/30'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Шинэ үзүүлэлт нэмэх</span>
            </button>
          </div>
        </div>

        {/* Table container */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold">Үзүүлэлт / Даалгавар</th>
                <th className="py-3 px-3 font-semibold text-center">Эзлэх жин</th>
                <th className="py-3 px-3 font-semibold text-right">Зорилт</th>
                <th className="py-3 px-3 font-semibold text-right">Бодит гүйцэтгэл</th>
                <th className="py-3 px-3 font-semibold text-center">Биелэлт %</th>
                <th className="py-3 px-3 font-semibold text-right">Авсан оноо</th>
                <th className="py-3 px-3 font-semibold text-center">Төлөв</th>
                <th className="py-3 px-4 font-semibold text-right">Үйлдэл</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {sectionItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    Энэ ангилалд бүртгэгдсэн KPI үзүүлэлт одоогоор байхгүй байна.
                  </td>
                </tr>
              ) : (
                sectionItems.map((item) => {
                  const fulfillment = calculateFulfillmentRate(item);
                  const score = calculateItemScore(item);

                  const getStatusBadge = () => {
                    switch (item.status) {
                      case 'approved':
                        return (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" /> Баталсан
                          </span>
                        );
                      case 'pending_approval':
                        return (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                            <Clock className="w-3 h-3" /> Хүлээгдэж буй
                          </span>
                        );
                      case 'rejected':
                        return (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            <XCircle className="w-3 h-3" /> Буцаасан
                          </span>
                        );
                      default:
                        return (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-500/10 text-slate-300 border border-slate-500/20">
                            <Clock className="w-3 h-3" /> Явц дунд
                          </span>
                        );
                    }
                  };

                  return (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition-colors group">
                      
                      {/* Title & Description */}
                      <td className="py-3.5 px-4 max-w-xs sm:max-w-md">
                        <div className="font-bold text-slate-100 group-hover:text-white flex items-center gap-1.5">
                          {item.title}
                          {item.direction === 'lower_better' && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] bg-sky-500/10 text-sky-400 border border-sky-500/20">
                              Багасах тусам сайн
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                          {item.description}
                        </div>
                        {item.managerNote && (
                          <div className="mt-1.5 text-[11px] text-emerald-300 bg-emerald-950/40 border border-emerald-900/40 rounded px-2 py-1 flex items-center gap-1.5">
                            <MessageSquare className="w-3 h-3 shrink-0" />
                            <span>Удирдлагын тэмдэглэл: {item.managerNote}</span>
                          </div>
                        )}
                      </td>

                      {/* Weight */}
                      <td className="py-3.5 px-3 text-center">
                        <span className="inline-block px-2 py-1 rounded bg-slate-800 text-slate-200 font-bold border border-slate-700">
                          {item.weight}%
                        </span>
                      </td>

                      {/* Target */}
                      <td className="py-3.5 px-3 text-right font-medium text-slate-300">
                        {formatKPIValue(item.target, item.unit)}
                      </td>

                      {/* Actual */}
                      <td className="py-3.5 px-3 text-right">
                        <button
                          onClick={() => onUpdateActual(item)}
                          className="group/btn inline-flex items-center gap-1 font-bold text-indigo-300 hover:text-indigo-200 bg-indigo-950/30 hover:bg-indigo-900/40 px-2 py-1 rounded border border-indigo-800/50 transition-all"
                          title="Гүйцэтгэл шинэчлэх"
                        >
                          <span>{formatKPIValue(item.actual, item.unit)}</span>
                          <Edit3 className="w-3 h-3 opacity-60 group-hover/btn:opacity-100" />
                        </button>
                      </td>

                      {/* Fulfillment rate % */}
                      <td className="py-3.5 px-3 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className={`px-2 py-0.5 rounded font-black text-xs ${
                            fulfillment >= 100 
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                              : fulfillment >= 80 
                                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                : fulfillment >= 60
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}>
                            {fulfillment.toFixed(1)}%
                          </span>
                          <div className="w-14 bg-slate-800 h-1 rounded-full overflow-hidden mt-1">
                            <div 
                              className={`h-full rounded-full ${
                                fulfillment >= 100 ? 'bg-emerald-400' : 'bg-indigo-500'
                              }`} 
                              style={{ width: `${Math.min(100, fulfillment)}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Weighted Score */}
                      <td className="py-3.5 px-3 text-right font-extrabold text-sm text-white">
                        {score}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3 text-center">
                        {getStatusBadge()}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          
                          {/* Log / History button */}
                          <button
                            onClick={() => onViewHistory(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            title="Явцын түүх & тайлбар харах"
                          >
                            <History className="w-4 h-4" />
                          </button>

                          {/* Quick update actual button */}
                          <button
                            onClick={() => onUpdateActual(item)}
                            className="p-1.5 rounded-lg text-indigo-400 hover:text-indigo-300 hover:bg-indigo-950/60 transition-colors"
                            title="Гүйцэтгэл бүртгэх"
                          >
                            <ArrowUpRight className="w-4 h-4" />
                          </button>

                          {/* Admin approvals & controls */}
                          {isAdmin && (
                            <>
                              {item.status !== 'approved' && (
                                <button
                                  onClick={() => onApproveKPI(item.id)}
                                  className="p-1.5 rounded-lg text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/60 transition-colors"
                                  title="Баталгаажуулах"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                              )}
                              {item.status !== 'rejected' && (
                                <button
                                  onClick={() => onRejectKPI(item.id)}
                                  className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/60 transition-colors"
                                  title="Буцаах / Засвар шаардах"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              )}
                            </>
                          )}

                          {/* Edit KPI Plan Button (Available to Employee & Admin) */}
                          <button
                            onClick={() => onEditKPI(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition-colors"
                            title="Төлөвлөгөөт ажил, нэр, дүн, жин засах"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Delete KPI Button (Available to Employee & Admin) */}
                          <button
                            onClick={() => {
                              if (confirm(`"${item.title}" KPI-г устгах уу?`)) {
                                onDeleteKPI(item.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                            title="Устгах"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
            {/* Table Footer with Subtotals */}
            <tfoot className="bg-slate-950/90 font-bold border-t border-slate-800 text-slate-300">
              <tr>
                <td className="py-3 px-4">
                  {title} - Нийлбэр дүн
                </td>
                <td className="py-3 px-3 text-center text-indigo-400">
                  {totalWeight}%
                </td>
                <td colSpan={3} className="py-3 px-3 text-right text-slate-400 font-normal">
                  Ангиллын авсан оноо:
                </td>
                <td className="py-3 px-3 text-right text-base text-white">
                  {totalScore.toFixed(2)} / {targetWeight}.0
                </td>
                <td colSpan={2} className="py-3 px-4 text-right">
                  {isWeightMatching ? (
                    <span className="text-[11px] text-emerald-400 font-semibold">Жин 100% тохирсон</span>
                  ) : (
                    <span className="text-[11px] text-rose-400 font-semibold">Жин зөрүүтэй ({totalWeight}% / {targetWeight}%)</span>
                  )}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* 1. Core Section (Үндсэн ажил 70%) */}
      {renderSection(
        'Үндсэн ажил (Үндсэн KPI)',
        'Төлөвлөгөөт стратегийн гол ажлууд • Нийт жин: 70%',
        'CORE_70',
        coreItems,
        70,
        'indigo'
      )}

      {/* 2. Unplanned Section (Төлөвлөгөөнөөс гадуурх ажил 30%) */}
      {renderSection(
        'Төлөвлөгөөнөөс гадуурх ажил',
        'Шуурхай, гэнэтийн болон цаг үеийн тусгай даалгаврууд • Нийт жин: 30%',
        'UNPLANNED_30',
        unplannedItems,
        30,
        'amber'
      )}
    </div>
  );
};
