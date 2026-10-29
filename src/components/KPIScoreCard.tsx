import React from 'react';
import { PeriodSummary } from '../types/kpi';
import { 
  Award, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Zap, 
  Sliders, 
  Target,
  Sparkles
} from 'lucide-react';

interface KPIScoreCardProps {
  summary: PeriodSummary;
  userName: string;
  userTitle: string;
  onOpenWeightManager: () => void;
  isAdmin: boolean;
}

export const KPIScoreCard: React.FC<KPIScoreCardProps> = ({
  summary,
  userName,
  userTitle,
  onOpenWeightManager,
  isAdmin,
}) => {
  const {
    coreScore,
    unplannedScore,
    totalScore,
    coreWeightTotal,
    unplannedWeightTotal,
    grade,
    gradeTitle,
    bonusPercentage,
    isWeightsValid,
  } = summary;

  // Grade color theme
  const getGradeTheme = () => {
    switch (grade) {
      case 'A+':
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
          badge: 'bg-emerald-500 text-slate-950 font-black',
          glow: 'from-emerald-500/20 via-teal-500/10 to-transparent',
        };
      case 'A':
        return {
          bg: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400',
          badge: 'bg-indigo-500 text-white font-black',
          glow: 'from-indigo-500/20 via-blue-500/10 to-transparent',
        };
      case 'B':
        return {
          bg: 'bg-sky-500/10 border-sky-500/30 text-sky-400',
          badge: 'bg-sky-500 text-white font-black',
          glow: 'from-sky-500/20 via-cyan-500/10 to-transparent',
        };
      case 'C':
        return {
          bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
          badge: 'bg-amber-500 text-white font-black',
          glow: 'from-amber-500/20 via-yellow-500/10 to-transparent',
        };
      default:
        return {
          bg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
          badge: 'bg-rose-500 text-white font-black',
          glow: 'from-rose-500/20 via-red-500/10 to-transparent',
        };
    }
  };

  const theme = getGradeTheme();

  return (
    <div className="relative overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 shadow-xl p-5 sm:p-6 mb-6">
      {/* Background ambient glow */}
      <div className={`absolute -right-20 -top-20 w-80 h-80 rounded-full bg-gradient-to-br ${theme.glow} blur-3xl pointer-events-none`} />

      {/* Top Banner: Member Info & Total Score */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Гүйцэтгэлийн нэгдсэн үнэлгээ
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
            <span className="text-xs font-semibold text-indigo-300">
              {userName} ({userTitle})
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1.5">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              {totalScore} <span className="text-lg text-slate-400 font-semibold">/ 100 оноо</span>
            </h2>
            <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border ${theme.bg}`}>
              <span className={`px-1.5 py-0.5 rounded text-[11px] ${theme.badge}`}>{grade}</span>
              <span>{gradeTitle}</span>
            </div>
          </div>
        </div>

        {/* Bonus / Incentive estimation card */}
        <div className="flex items-center gap-3 self-start lg:self-auto bg-slate-800/80 border border-slate-700/60 rounded-xl px-4 py-2.5">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Тооцоолсон урамшуулал</div>
            <div className="text-base sm:text-lg font-bold text-emerald-300">
              {bonusPercentage}% олголт
            </div>
          </div>
        </div>
      </div>

      {/* Core (70%) vs Unplanned (30%) breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5 relative z-10">
        
        {/* Core Task (Үндсэн ажил 70%) */}
        <div className="bg-slate-950/60 border border-indigo-950/80 rounded-xl p-4 transition-all hover:border-indigo-800/60">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-xs">
                70%
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  Үндсэн ажил
                  <span className="text-xs font-normal text-indigo-300">(Төлөвлөгөөт KPI)</span>
                </h4>
                <p className="text-[11px] text-slate-400">Нийт жингийн 70%-ийг бүрдүүлнэ</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xl font-extrabold text-indigo-300">{coreScore}</span>
              <span className="text-xs text-slate-400 font-semibold"> / 70.0</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-800/80 rounded-full h-2.5 overflow-hidden my-2">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (coreScore / 70) * 100)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 mt-2">
            <span>Биелэлт: <strong className="text-slate-200">{((coreScore / 70) * 100).toFixed(1)}%</strong></span>
            <span>Идэвхтэй жин: <strong className="text-indigo-300">{coreWeightTotal}% / 70%</strong></span>
          </div>
        </div>

        {/* Unplanned Task (Төлөвлөгөөнөөс гадуурх ажил 30%) */}
        <div className="bg-slate-950/60 border border-amber-950/80 rounded-xl p-4 transition-all hover:border-amber-800/60">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xs">
                30%
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  Төлөвлөгөөнөөс гадуурх ажил
                  <span className="text-xs font-normal text-amber-300">(Шуурхай & Гэнэтийн)</span>
                </h4>
                <p className="text-[11px] text-slate-400">Нийт жингийн 30%-ийг бүрдүүлнэ</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xl font-extrabold text-amber-300">{unplannedScore}</span>
              <span className="text-xs text-slate-400 font-semibold"> / 30.0</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-800/80 rounded-full h-2.5 overflow-hidden my-2">
            <div 
              className="bg-gradient-to-r from-amber-500 to-orange-400 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (unplannedScore / 30) * 100)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 mt-2">
            <span>Биелэлт: <strong className="text-slate-200">{((unplannedScore / 30) * 100).toFixed(1)}%</strong></span>
            <span>Идэвхтэй жин: <strong className="text-amber-300">{unplannedWeightTotal}% / 30%</strong></span>
          </div>
        </div>

      </div>

      {/* Weight compliance bar */}
      <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          {isWeightsValid ? (
            <span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold">
              <CheckCircle className="w-4 h-4" />
              Жингийн хуваарилалт зөв баталгаажсан: Үндсэн 70% | Гадуурх 30% (Нийт 100%)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-rose-400 font-semibold">
              <AlertTriangle className="w-4 h-4 animate-pulse" />
              Анхаар: Жингийн баланс зөрүүтэй! (Үндсэн: {coreWeightTotal}%/70%, Гадуурх: {unplannedWeightTotal}%/30%)
            </span>
          )}
        </div>

        {isAdmin && (
          <button
            onClick={onOpenWeightManager}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium transition-colors"
          >
            <Sliders className="w-3.5 h-3.5 text-indigo-400" />
            <span>Жин тохируулах (70/30)</span>
          </button>
        )}
      </div>

    </div>
  );
};
