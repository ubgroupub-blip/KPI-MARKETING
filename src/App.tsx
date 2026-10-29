/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { KPIProvider, useKPI } from './context/KPIContext';
import { Navbar } from './components/Navbar';
import { KPIScoreCard } from './components/KPIScoreCard';
import { KPITable } from './components/KPITable';
import { AdminTeamOverview } from './components/AdminTeamOverview';
import { AccountSwitcherModal } from './components/AccountSwitcherModal';
import { UpdateActualModal } from './components/UpdateActualModal';
import { AddEditKPIModal } from './components/AddEditKPIModal';
import { HistoryModal } from './components/HistoryModal';
import { WeightRebalanceModal } from './components/WeightRebalanceModal';
import { ReportModal } from './components/ReportModal';
import { UBGroupOfficialKPISheet } from './components/UBGroupOfficialKPISheet';
import { LoginPage } from './components/LoginPage';
import { calculatePeriodSummary, getPeriodLabel } from './utils/kpiCalculator';
import { KPIItem, KPICategory, UserProfile } from './types/kpi';
import { 
  ShieldCheck, 
  User, 
  Sparkles, 
  Plus, 
  Sliders, 
  HelpCircle, 
  CheckCircle2, 
  Layers, 
  ArrowRight,
  TrendingUp,
  FileSpreadsheet,
  LayoutDashboard,
  Printer,
  Download,
  Lock,
  LogOut,
  Copy,
  X
} from 'lucide-react';

const MainApp: React.FC = () => {
  const {
    users,
    currentUser,
    selectedUser,
    setSelectedUser,
    kpis,
    selectedPeriod,
    narratives,
    updateNarrative,
    updateKPIActual,
    updateKPIEvaluation,
    addKPIItem,
    editKPIItem,
    deleteKPIItem,
    approveKPI,
    rejectKPI,
    rebalanceWeights,
    copyTasksFromPreviousMonth,
    autoBalanceUnplanned,
    isAuthenticated,
    logout,
    loginAs,
  } = useKPI();

  // Toast feedback message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => prev === msg ? null : prev);
    }, 4500);
  };

  // View mode: 'official_sheet' (UB Group format as in PDF) vs 'dashboard' (visual cards)
  const [viewMode, setViewMode] = useState<'official_sheet' | 'dashboard'>('official_sheet');

  // Modals state
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const [isUpdateActualModalOpen, setIsUpdateActualModalOpen] = useState(false);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // Selected item for modals
  const [activeItem, setActiveItem] = useState<KPIItem | null>(null);
  const [addCategory, setAddCategory] = useState<KPICategory>('CORE_70');
  const [addParentGroup, setAddParentGroup] = useState<string | undefined>(undefined);

  // If not authenticated, display full LoginPage
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const isAdmin = currentUser.role === 'admin';
  
  // Privacy Rule: An employee ONLY ever sees their OWN data. Admin can inspect selectedUser.
  const targetUser: UserProfile = isAdmin ? selectedUser : currentUser;

  // Filter KPIs strictly for the target user and active period
  const userKpis = kpis.filter(
    k => k.userId === targetUser.id && k.period === selectedPeriod
  );

  const narrativeKey = `${targetUser.id}_${selectedPeriod}`;
  const currentNarrative = narratives[narrativeKey];

  const summary = calculatePeriodSummary(userKpis, selectedPeriod);

  // Handlers for modal workflows
  const handleOpenUpdateActual = (item: KPIItem) => {
    setActiveItem(item);
    setIsUpdateActualModalOpen(true);
  };

  const handleOpenHistory = (item: KPIItem) => {
    setActiveItem(item);
    setIsHistoryModalOpen(true);
  };

  const handleOpenEditKPI = (item: KPIItem) => {
    setActiveItem(item);
    setIsAddEditModalOpen(true);
  };

  const handleOpenAddNewKPI = (category: KPICategory, parentGroup?: string) => {
    setActiveItem(null);
    setAddCategory(category);
    setAddParentGroup(parentGroup);
    setIsAddEditModalOpen(true);
  };

  const handleCopyFromPreviousMonth = () => {
    const count = copyTasksFromPreviousMonth(targetUser.id, selectedPeriod);
    if (count > 0) {
      showToast(`${getPeriodLabel(selectedPeriod)} сар руу өмнөх сарын ${count} төлөвлөгөөт ажлыг амжилттай хууллаа!`);
    } else {
      showToast(`Өмнөх сард хуулах ажил олдсонгүй эсвэл одоогийн сард аль хэдийн бүртгэгдсэн байна.`);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // BOM for UTF-8
    csvContent += `Борлуулалт, Маркетингийн газрын ${selectedPeriod} KPI үнэлгээ - ${targetUser.name}\n\n`;
    csvContent += "Д/д,Төсөл / Бүлэг,Хийгдэх ажлын жагсаалт,Хүрэх үр дүн,Хэмжих үзүүлэлт,Жин %,Хийгдсэн ажлын жагсаалт,Биелэлтийн үнэлгээ (Ажилтан),Ажилтны тайлбар,Шууд удирдлагын үнэлгээ,Удирдлагын тайлбар\n";

    userKpis.forEach((it, idx) => {
      csvContent += `"${it.orderNo || idx + 1}","${it.parentGroup || ''}","${it.title.replace(/"/g, '""')}","${it.targetDescription || it.target}","${it.unit}","${it.weight}%","${(it.completedWorkList || '').replace(/"/g, '""')}","${it.employeeRating || 0}%","${(it.employeeNote || '').replace(/"/g, '""')}","${it.managerRating || 0}%","${(it.managerNote || '').replace(/"/g, '""')}"\n`;
    });

    csvContent += `\nНийт жин: 100%,Үндсэн ажил: ${summary.coreWeightTotal}%,Гадуурх ажил: ${summary.unplannedWeightTotal}%\n`;
    csvContent += `Эцсийн үнэлгээ: Ажилтны дүн=${summary.employeeTotalRating}%,Удирдлагын баталсан=${summary.managerTotalRating}%\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `UB_Group_KPI_${targetUser.name}_${selectedPeriod}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* 1. Navigation Bar */}
      <Navbar
        onOpenAccountSwitcher={() => setIsAccountModalOpen(true)}
        onOpenReport={() => setIsReportModalOpen(true)}
        onOpenWeightManager={() => setIsWeightModalOpen(true)}
      />

      {/* 2. Top Account Strip (Strict Role-Based Privacy) */}
      <section className="bg-slate-900/60 border-b border-slate-800/80 px-4 py-2.5 no-print">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          
          {isAdmin ? (
            /* ADMIN VIEW: Full team switcher for Manager */
            <>
              <div className="flex items-center gap-2 text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-white">Админ горим (Н.Гомбосүрэн):</span>
                <span className="text-[11px] text-slate-400">Бүх 5 ажилтны KPI-г нэгдсэн самбараар хянах</span>
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                {users.map(u => {
                  const isCurrent = currentUser.id === u.id;
                  return (
                    <button
                      key={u.id}
                      onClick={() => loginAs(u.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                        isCurrent
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/20'
                          : 'bg-slate-800/80 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${u.role === 'admin' ? 'bg-emerald-400' : 'bg-cyan-400'}`} />
                      <span>{u.name}</span>
                      {u.role === 'admin' && (
                        <span className="text-[9px] bg-slate-900/80 px-1 py-0.2 rounded text-emerald-300">Захирал</span>
                      )}
                    </button>
                  );
                })}

                <button
                  onClick={logout}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-rose-950/60 border border-slate-700 hover:border-rose-800 text-slate-300 hover:text-rose-300 text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1 ml-1"
                  title="Гарах (Нэвтрэх хуудас)"
                >
                  <LogOut className="w-3 h-3 text-slate-400" />
                  <span>Гарах</span>
                </button>
              </div>
            </>
          ) : (
            /* EMPLOYEE VIEW: Strict privacy - ONLY sees their own profile! */
            <>
              <div className="flex items-center gap-2 text-slate-400">
                <Lock className="w-3.5 h-3.5 text-indigo-400" />
                <span className="font-semibold text-slate-300">Хувийн аккаунт:</span>
                <span className="font-bold text-white">{currentUser.name}</span>
                <span className="text-[11px] text-indigo-300 font-medium">({currentUser.title})</span>
                <span className="text-[10px] text-slate-500 ml-2 hidden sm:inline">
                  • Нууцлалын дүрэм: Бусад ажилтны мэдээлэл харагдахгүй
                </span>
              </div>

              <button
                onClick={() => setIsAccountModalOpen(true)}
                className="self-start sm:self-auto flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 transition-colors"
              >
                <LogOut className="w-3 h-3 text-slate-400" />
                <span>Аккаунт солих / Гарах</span>
              </button>
            </>
          )}

        </div>
      </section>

      {/* 3. View Mode Switcher Banner (UB Group Format vs Interactive Dashboard) */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-5 no-print">
        <div className="bg-slate-900/90 border border-slate-800 p-2 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-1 p-1 bg-slate-950/80 border border-slate-800 rounded-xl">
            <button
              onClick={() => setViewMode('official_sheet')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'official_sheet'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>UB Group Албан ёсны хүснэгт (PDF Формат)</span>
            </button>
            <button
              onClick={() => setViewMode('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'dashboard'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-indigo-400" />
              <span>Гүйцэтгэлийн хяналтын самбар</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Форматын дүрэм:</span>
            <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
              Үндсэн 70%
            </span>
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
              Гадуурх 30%
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
              Нийт 100%
            </span>
          </div>
        </div>
      </div>

      {/* 4. Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* PRIVACY ENFORCEMENT: AdminTeamOverview is ONLY rendered when logged in as ADMIN! */}
        {isAdmin && (
          <div className="no-print">
            <AdminTeamOverview
              users={users}
              kpis={kpis}
              selectedPeriod={selectedPeriod}
              selectedUserId={targetUser.id}
              onSelectUser={(u) => setSelectedUser(u)}
            />
          </div>
        )}

        {/* View Mode 1: UB Group Official PDF Sheet Format */}
        {viewMode === 'official_sheet' ? (
          <div>
            <UBGroupOfficialKPISheet
              user={targetUser}
              period={selectedPeriod}
              items={userKpis}
              narrative={currentNarrative}
              isAdmin={isAdmin}
              onUpdateEvaluation={updateKPIEvaluation}
              onUpdateNarrative={(updates) => updateNarrative(targetUser.id, selectedPeriod, updates)}
              onAddNewKPI={handleOpenAddNewKPI}
              onAutoBalanceUnplanned={() => {
                autoBalanceUnplanned(targetUser.id, selectedPeriod);
                showToast('Төлөвлөгөөнөөс гадуурх ажлуудын 30% жинг автоматаар тэгш хуваариллаа (15% + 15%...).');
              }}
              onDeleteKPI={deleteKPIItem}
              onCopyPreviousMonth={handleCopyFromPreviousMonth}
              onPrint={handlePrint}
              onExportCSV={handleExportCSV}
            />
          </div>
        ) : (
          /* View Mode 2: Interactive Cards Dashboard */
          <div>
            {/* Target Member Header */}
            <div className="mb-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={targetUser.avatar}
                  alt={targetUser.name}
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-indigo-500"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-white">
                      {targetUser.name}
                    </h2>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {targetUser.title}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {getPeriodLabel(selectedPeriod)} • Үндсэн ажил 70% | Төлөвлөгөөнөөс гадуурх ажил 30%
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setIsWeightModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors flex items-center gap-1.5"
                >
                  <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Жин тохируулах (70/30)</span>
                </button>
                <button
                  onClick={() => handleOpenAddNewKPI('UNPLANNED_30')}
                  className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg shadow-amber-600/20 transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Төлөвлөгөөнөөс гадуурх ажил</span>
                </button>
              </div>
            </div>

            {/* Score Card (Shows 70% Core + 30% Unplanned = Total) */}
            <KPIScoreCard
              summary={summary}
              userName={targetUser.name}
              userTitle={targetUser.title}
              isAdmin={isAdmin}
              onOpenWeightManager={() => setIsWeightModalOpen(true)}
            />

            {/* Empty state for dashboard view */}
            {userKpis.length === 0 && (
              <div className="mb-8 bg-slate-900 border border-dashed border-slate-700 rounded-2xl p-8 text-center">
                <div className="max-w-md mx-auto space-y-3">
                  <p className="text-base font-bold text-white">
                    {getPeriodLabel(selectedPeriod)} -д төлөвлөгөөт ажил одоогоор бүртгэгдээгүй байна
                  </p>
                  <p className="text-xs text-slate-400">
                    Та өмнөх сарын давтагдах төлөвлөгөөт ажлуудыг шууд хуулж авах эсвэл шинээр төлөвлөгөөт үзүүлэлт нэмж эхлүүлнэ үү.
                  </p>
                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      onClick={handleCopyFromPreviousMonth}
                      className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition-all"
                    >
                      <Copy className="w-4 h-4" />
                      <span>Өмнөх сарын ажлуудыг хуулах</span>
                    </button>
                    <button
                      onClick={() => handleOpenAddNewKPI('CORE_70')}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Үндсэн ажил нэмэх</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Detailed KPI Tables */}
            <KPITable
              items={userKpis}
              isAdmin={isAdmin}
              onUpdateActual={handleOpenUpdateActual}
              onViewHistory={handleOpenHistory}
              onEditKPI={handleOpenEditKPI}
              onDeleteKPI={deleteKPIItem}
              onApproveKPI={approveKPI}
              onRejectKPI={rejectKPI}
              onAddNewKPI={handleOpenAddNewKPI}
            />
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-800/80 bg-slate-950/90 py-5 text-center text-xs text-slate-500 no-print">
        <p>UB GROUP • Борлуулалт Маркетингийн Газрын KPI Цахим Систем • {new Date().getFullYear()}</p>
        <p className="mt-0.5 text-slate-400">
          БАТАЛСАН: Борлуулалт, Маркетингийн газрын захирал Н.Гомбосүрэн | Админ: ubgroupub@gmail.com
        </p>
      </footer>

      {/* Modals */}
      <AccountSwitcherModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
      />

      <ReportModal
        isOpen={isReportModalOpen}
        users={users}
        currentUser={currentUser}
        targetUser={targetUser}
        kpis={kpis}
        selectedPeriod={selectedPeriod}
        onClose={() => setIsReportModalOpen(false)}
      />

      <WeightRebalanceModal
        isOpen={isWeightModalOpen}
        user={targetUser}
        period={selectedPeriod}
        items={userKpis}
        onClose={() => setIsWeightModalOpen(false)}
        onSave={rebalanceWeights}
      />

      <UpdateActualModal
        isOpen={isUpdateActualModalOpen}
        item={activeItem}
        onClose={() => setIsUpdateActualModalOpen(false)}
        onSave={updateKPIActual}
      />

      <AddEditKPIModal
        isOpen={isAddEditModalOpen}
        itemToEdit={activeItem}
        defaultCategory={addCategory}
        defaultParentGroup={addParentGroup}
        userId={targetUser.id}
        period={selectedPeriod}
        onClose={() => setIsAddEditModalOpen(false)}
        onSaveNew={addKPIItem}
        onSaveEdit={editKPIItem}
      />

      <HistoryModal
        isOpen={isHistoryModalOpen}
        item={activeItem}
        onClose={() => setIsHistoryModalOpen(false)}
      />

      {/* In-App Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-slate-900 border border-indigo-500/60 text-white p-4 rounded-2xl shadow-2xl shadow-black/80 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shrink-0">
            <Sparkles className="w-5 h-5 text-indigo-400" />
          </div>
          <p className="text-xs font-semibold text-slate-100 flex-1 leading-snug">
            {toastMessage}
          </p>
          <button
            onClick={() => setToastMessage(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
};

export default function App() {
  return (
    <KPIProvider>
      <MainApp />
    </KPIProvider>
  );
}
