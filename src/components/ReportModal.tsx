import React from 'react';
import { UserProfile, KPIItem } from '../types/kpi';
import { calculatePeriodSummary, getPeriodLabel } from '../utils/kpiCalculator';
import { X, Printer, Download, FileSpreadsheet, Sparkles, CheckCircle2, Shield } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  users: UserProfile[];
  currentUser: UserProfile;
  targetUser: UserProfile;
  kpis: KPIItem[];
  selectedPeriod: string;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  users,
  currentUser,
  targetUser,
  kpis,
  selectedPeriod,
  onClose,
}) => {
  if (!isOpen) return null;

  const isAdmin = currentUser.role === 'admin';
  // If employee, privacy rule: only show their own report!
  const targetEmployees = isAdmin ? users.filter(u => u.role === 'employee') : [currentUser];

  const reportDate = new Date().toLocaleDateString('mn-MN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const memberReports = targetEmployees.map(emp => {
    const userKpis = kpis.filter(k => k.userId === emp.id && k.period === selectedPeriod);
    const summary = calculatePeriodSummary(userKpis, selectedPeriod);
    return {
      user: emp,
      summary,
      kpis: userKpis,
    };
  });

  const avgScore = memberReports.length > 0
    ? (memberReports.reduce((s, r) => s + r.summary.totalScore, 0) / memberReports.length).toFixed(1)
    : '0';

  // Export to CSV function
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // BOM for UTF-8 Mongolian characters
    csvContent += "БАТАЛСАН: Борлуулалт Маркетингийн газрын захирал Н.Гомбосүрэн\n\n";
    csvContent += "Ажилтан,Албан тушаал,Үндсэн ажил (70%),Гадуурх ажил (30%),Нийт KPI Оноо,Үнэлгээ,Урамшуулал %,Жин тохироо\n";

    memberReports.forEach(r => {
      csvContent += `"${r.user.name}","${r.user.title}",${r.summary.coreScore},${r.summary.unplannedScore},${r.summary.totalScore},"${r.summary.grade}","${r.summary.bonusPercentage}%","${r.summary.isWeightsValid ? 'Тийм' : 'Үгүй'}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `UB_Group_KPI_Report_${selectedPeriod}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-800/80 border-b border-slate-700/80 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {isAdmin ? 'Борлуулалт Маркетингийн Багийн Нэгдсэн KPI Тайлан' : `${currentUser.name} — Хувийн KPI Тайлан`}
              </h3>
              <p className="text-xs text-slate-400">
                {getPeriodLabel(selectedPeriod)} • БАТАЛСАН: Борлуулалт, Маркетингийн газрын захирал Н.Гомбосүрэн
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV / Excel татах</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Хэвлэх / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 bg-slate-950 text-slate-100 print:bg-white print:text-black">
          
          {/* Document Header */}
          <div className="border-b border-slate-800 print:border-gray-300 pb-5 mb-6">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-400 print:text-indigo-600 block mb-1">
                  БАТАЛСАН: Борлуулалт, Маркетингийн газрын захирал .............................Н.Гомбосүрэн
                </span>
                <h1 className="text-2xl font-black text-white print:text-black mt-2">
                  {isAdmin ? 'БОРЛУУЛАЛТ, МАРКЕТИНГИЙН ГАЗРЫН KPI НЭГДСЭН ДҮН' : `KPI ГҮЙЦЭТГЭЛИЙН ТАЙЛАН — ${currentUser.name}`}
                </h1>
                <p className="text-xs text-slate-400 print:text-gray-600 mt-1">
                  Тайлант хугацаа: <strong>{getPeriodLabel(selectedPeriod)}</strong> | Тайлан бэлтгэсэн огноо: {reportDate}
                </p>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-400 print:text-gray-600">
                  {isAdmin ? 'Багийн дундаж гүйцэтгэл' : 'Таны эцсийн оноо'}
                </div>
                <div className="text-3xl font-extrabold text-emerald-400 print:text-emerald-700">
                  {isAdmin ? `${avgScore}%` : `${memberReports[0]?.summary.totalScore || 0}%`}
                </div>
              </div>
            </div>

            {/* Framework rules notice in report */}
            <div className="mt-4 p-3 bg-slate-900 print:bg-gray-100 rounded-xl border border-slate-800 print:border-gray-200 text-xs">
              <strong className="text-indigo-300 print:text-indigo-800">Үнэлгээний стандарт дүрэм: </strong>
              <span className="text-slate-300 print:text-gray-700">
                Нийт үнэлгээний <strong>70%-ийг Үндсэн ажил</strong>, <strong>30%-ийг Төлөвлөгөөнөөс гадуурх</strong> шуурхай ажлууд бүрдүүлсэн. 
                Үзүүлэлтүүд тоон зорилтоор хэмжигдэж, бодит цагт автомат томъёогоор бодогдсон болно.
              </span>
            </div>
          </div>

          {/* Members Table */}
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-700 print:border-gray-300 bg-slate-900/60 print:bg-gray-100 text-slate-400 print:text-gray-600 uppercase text-[11px]">
                  <th className="py-2.5 px-3 font-bold">№</th>
                  <th className="py-2.5 px-3 font-bold">Ажилтан</th>
                  <th className="py-2.5 px-3 font-bold">Албан тушаал</th>
                  <th className="py-2.5 px-3 font-bold text-center">Үндсэн (70%)</th>
                  <th className="py-2.5 px-3 font-bold text-center">Гадуурх (30%)</th>
                  <th className="py-2.5 px-3 font-bold text-center">Нийт оноо</th>
                  <th className="py-2.5 px-3 font-bold text-center">Үнэлгээ</th>
                  <th className="py-2.5 px-3 font-bold text-right">Урамшуулал %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 print:divide-gray-200">
                {memberReports.map(({ user, summary }, idx) => (
                  <tr key={user.id} className="hover:bg-slate-900/40 print:hover:bg-transparent">
                    <td className="py-3 px-3 text-slate-500 font-semibold">{idx + 1}</td>
                    <td className="py-3 px-3 font-bold text-white print:text-black">
                      {user.name}
                    </td>
                    <td className="py-3 px-3 text-slate-300 print:text-gray-700 font-medium">
                      {user.title}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-indigo-300 print:text-indigo-700">
                      {summary.coreScore} <span className="text-[10px] text-slate-500 print:text-gray-400 font-normal">/ 70</span>
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-amber-300 print:text-amber-700">
                      {summary.unplannedScore} <span className="text-[10px] text-slate-500 print:text-gray-400 font-normal">/ 30</span>
                    </td>
                    <td className="py-3 px-3 text-center text-sm font-black text-white print:text-black">
                      {summary.totalScore}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded font-black text-xs bg-slate-800 print:bg-gray-200 text-white print:text-black border border-slate-700 print:border-gray-300">
                        {summary.grade}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-extrabold text-emerald-400 print:text-emerald-700">
                      {summary.bonusPercentage}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Signatures for approval */}
          <div className="pt-8 border-t border-slate-800 print:border-gray-300 grid grid-cols-2 gap-8 text-xs text-slate-400 print:text-gray-600">
            <div>
              <p className="font-semibold text-slate-300 print:text-black">Тайлан гаргасан:</p>
              <p className="mt-1">{isAdmin ? 'Маркетингийн Ахлах Менежер / Болд-Эрдэнэ' : `${currentUser.title} / ${currentUser.name}`}</p>
              <div className="mt-8 border-b border-dashed border-slate-700 print:border-gray-400 w-48"></div>
              <p className="text-[10px] mt-1 text-slate-500">Гарын үсэг, огноо</p>
            </div>
            <div>
              <p className="font-semibold text-slate-300 print:text-black">Хянаж баталгаажуулсан:</p>
              <p className="mt-1">Борлуулалт, Маркетингийн газрын захирал Н.Гомбосүрэн</p>
              <div className="mt-8 border-b border-dashed border-slate-700 print:border-gray-400 w-48"></div>
              <p className="text-[10px] mt-1 text-slate-500">Гарын үсэг, огноо</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
