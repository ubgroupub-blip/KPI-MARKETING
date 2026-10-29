import React from 'react';
import { UserProfile, KPIItem } from '../types/kpi';
import { calculatePeriodSummary } from '../utils/kpiCalculator';
import { 
  Users, 
  TrendingUp, 
  Award, 
  AlertCircle, 
  CheckCircle, 
  ChevronRight, 
  Clock, 
  Sparkles,
  BarChart3,
  Layers,
  ArrowUpRight
} from 'lucide-react';

interface AdminTeamOverviewProps {
  users: UserProfile[];
  kpis: KPIItem[];
  selectedPeriod: string;
  onSelectUser: (user: UserProfile) => void;
  selectedUserId: string;
}

export const AdminTeamOverview: React.FC<AdminTeamOverviewProps> = ({
  users,
  kpis,
  selectedPeriod,
  onSelectUser,
  selectedUserId,
}) => {
  const employees = users.filter(u => u.role === 'employee');

  // Compute stats across all 5 employees
  const employeeSummaries = employees.map(emp => {
    const userKpis = kpis.filter(k => k.userId === emp.id && k.period === selectedPeriod);
    const summary = calculatePeriodSummary(userKpis, selectedPeriod);
    const pendingCount = userKpis.filter(k => k.status === 'pending_approval').length;
    return {
      user: emp,
      summary,
      kpis: userKpis,
      pendingCount,
    };
  });

  const teamAverageScore = employeeSummaries.length > 0
    ? Number((employeeSummaries.reduce((sum, item) => sum + item.summary.totalScore, 0) / employeeSummaries.length).toFixed(1))
    : 0;

  const totalPendingApprovals = employeeSummaries.reduce((sum, item) => sum + item.pendingCount, 0);

  // Quick department metrics calculation
  const totalLeads = kpis
    .filter(k => k.title.includes('сэжим') && k.period === selectedPeriod)
    .reduce((sum, k) => sum + k.actual, 0);

  const totalRevenue = kpis
    .filter(k => k.unit === '₮' && k.period === selectedPeriod)
    .reduce((sum, k) => sum + k.actual, 0);

  const totalDesigns = kpis
    .filter(k => (k.unit === 'эх загвар' || k.unit === 'эх' || k.unit === 'видео') && k.period === selectedPeriod)
    .reduce((sum, k) => sum + k.actual, 0);

  return (
    <div className="mb-8">
      {/* Top Department Overview Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        
        {/* Team Average Score */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Багийн дундаж KPI</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">{teamAverageScore}%</span>
            <span className="text-xs text-emerald-400 font-semibold">+3.4% өмнөх сараас</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-emerald-500 to-indigo-500 h-1.5 rounded-full" 
              style={{ width: `${Math.min(100, teamAverageScore)}%` }}
            />
          </div>
        </div>

        {/* Marketing Revenue */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Маркетингийн орлого</span>
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-extrabold text-indigo-300">
              {new Intl.NumberFormat('mn-MN').format(totalRevenue)} ₮
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Кампанит ажлын шууд борлуулалт</p>
        </div>

        {/* Leads & Content Created */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Нийт сэжим / Leads</span>
            <BarChart3 className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-cyan-300">{totalLeads}</span>
            <span className="text-xs text-slate-400">сэжим</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Бүтээлч контент: {totalDesigns} эх/видео</p>
        </div>

        {/* Pending Approvals */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Хүлээгдэж буй баталгаажуулалт</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-300">{totalPendingApprovals}</span>
            <span className="text-xs text-slate-400">хүсэлт</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {totalPendingApprovals > 0 ? 'Удирдлагаас шалгах шаардлагатай' : 'Бүх KPI баталгаажсан байна'}
          </p>
        </div>

      </div>

      {/* Team Member Cards Grid */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-400" />
            Маркетингийн багийн 5 гишүүн
          </h3>
          <p className="text-xs text-slate-400">
            Гишүүн бүрийн 70/30 жингийн гүйцэтгэл болон бодит үр дүнг шалгах
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {employeeSummaries.map(({ user, summary, pendingCount }) => {
          const isSelected = selectedUserId === user.id;

          return (
            <div
              key={user.id}
              onClick={() => onSelectUser(user)}
              className={`cursor-pointer rounded-xl p-4 border transition-all relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-800/95 border-indigo-500 ring-2 ring-indigo-500/30 shadow-xl'
                  : 'bg-slate-900/80 hover:bg-slate-800/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Header: Avatar, Name, Title */}
                <div className="flex items-start gap-3 mb-3">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-700"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-sm text-white truncate">
                      {user.name}
                    </h4>
                    <p className="text-[11px] text-indigo-300 truncate font-medium">
                      {user.title}
                    </p>
                  </div>
                </div>

                {/* Score & Grade */}
                <div className="bg-slate-950/70 rounded-lg p-2.5 border border-slate-800/80 mb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">
                        Нийт оноо
                      </div>
                      <div className="text-xl font-black text-white">
                        {summary.totalScore}
                        <span className="text-xs font-semibold text-slate-500"> /100</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-xs font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {summary.grade}
                    </span>
                  </div>

                  {/* 70 / 30 mini progress indicator */}
                  <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
                    <div>
                      Үндсэн: <strong className="text-indigo-300">{summary.coreScore}</strong>/70
                    </div>
                    <div>
                      Гадуурх: <strong className="text-amber-300">{summary.unplannedScore}</strong>/30
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer: Validation & Pending badge */}
              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                {pendingCount > 0 ? (
                  <span className="inline-flex items-center gap-1 text-amber-400 font-semibold">
                    <Clock className="w-3 h-3" />
                    {pendingCount} хүлээгдэж буй
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                    <CheckCircle className="w-3 h-3" />
                    Баталгаажсан
                  </span>
                )}

                <div className="text-slate-400 flex items-center gap-0.5 font-medium hover:text-white">
                  <span>Харах</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};
