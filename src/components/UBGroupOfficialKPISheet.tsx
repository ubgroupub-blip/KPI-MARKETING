import React, { useState } from 'react';
import { KPIItem, UserProfile, ExecutiveReportNarrative, KPICategory } from '../types/kpi';
import { calculatePeriodSummary, formatKPIValue, getPeriodLabel } from '../utils/kpiCalculator';
import { 
  Printer, 
  Download, 
  Edit3, 
  Check, 
  Plus, 
  Save, 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  HelpCircle,
  TrendingUp,
  MessageSquare,
  Calculator,
  Sliders,
  Trash2,
  Copy
} from 'lucide-react';

interface UBGroupOfficialKPISheetProps {
  user: UserProfile;
  period: string;
  items: KPIItem[];
  narrative?: ExecutiveReportNarrative;
  isAdmin: boolean;
  onUpdateEvaluation: (
    kpiId: string, 
    data: { 
      title?: string;
      targetDescription?: string;
      target?: number;
      actual?: number;
      unit?: string;
      weight?: number;
      completedWorkList?: string; 
      employeeRating?: number; 
      employeeNote?: string; 
      managerRating?: number; 
      managerNote?: string; 
    }
  ) => void;
  onUpdateNarrative: (updates: Partial<ExecutiveReportNarrative>) => void;
  onAddNewKPI: (category: KPICategory, parentGroup?: string) => void;
  onAutoBalanceUnplanned?: () => void;
  onDeleteKPI?: (kpiId: string) => void;
  onCopyPreviousMonth?: () => void;
  onPrint: () => void;
  onExportCSV: () => void;
}

export const UBGroupOfficialKPISheet: React.FC<UBGroupOfficialKPISheetProps> = ({
  user,
  period,
  items,
  narrative,
  isAdmin,
  onUpdateEvaluation,
  onUpdateNarrative,
  onAddNewKPI,
  onAutoBalanceUnplanned,
  onDeleteKPI,
  onCopyPreviousMonth,
  onPrint,
  onExportCSV,
}) => {
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<{
    title: string;
    targetDescription: string;
    target: number;
    actual: number;
    unit: string;
    weight: number;
    completedWorkList: string;
    employeeRating: number;
    employeeNote: string;
    managerRating: number;
    managerNote: string;
  }>({
    title: '',
    targetDescription: '',
    target: 0,
    actual: 0,
    unit: '',
    weight: 0,
    completedWorkList: '',
    employeeRating: 0,
    employeeNote: '',
    managerRating: 0,
    managerNote: '',
  });

  const [narrativeEditing, setNarrativeEditing] = useState(false);
  const [currentStatusNotes, setCurrentStatusNotes] = useState(narrative?.currentStatusNotes || '');
  const [improvementPlanNotes, setImprovementPlanNotes] = useState(narrative?.improvementPlanNotes || '');

  const summary = calculatePeriodSummary(items, period);

  const coreItems = items.filter(it => it.category === 'CORE_70');
  const unplannedItems = items.filter(it => it.category === 'UNPLANNED_30');

  const startEditRow = (item: KPIItem) => {
    setEditingRowId(item.id);
    setEditFormData({
      title: item.title,
      targetDescription: item.targetDescription || '',
      target: item.target,
      actual: item.actual,
      unit: item.unit,
      weight: item.weight,
      completedWorkList: item.completedWorkList || '',
      employeeRating: item.employeeRating ?? 0,
      employeeNote: item.employeeNote || '',
      managerRating: item.managerRating ?? 0,
      managerNote: item.managerNote || '',
    });
  };

  // Automated calculation when weight, target, or actual changes
  const handlePlanChange = (field: 'weight' | 'target' | 'actual', val: number) => {
    const updated = {
      ...editFormData,
      [field]: val,
    };

    const targetVal = field === 'target' ? val : updated.target;
    const actualVal = field === 'actual' ? val : updated.actual;
    const weightVal = field === 'weight' ? val : updated.weight;

    // Automatic calculation of employee rating %:
    // Rate = (actual / target) * weight
    if (targetVal > 0) {
      const autoCalculatedRating = Number(Math.min(weightVal * 1.2, (actualVal / targetVal) * weightVal).toFixed(2));
      updated.employeeRating = autoCalculatedRating;
      if (isAdmin && (updated.managerRating === 0 || updated.managerRating === editFormData.employeeRating)) {
        updated.managerRating = autoCalculatedRating;
      }
    }

    setEditFormData(updated);
  };

  const saveEditRow = (id: string) => {
    onUpdateEvaluation(id, editFormData);
    setEditingRowId(null);
  };

  const handleSaveNarrative = () => {
    onUpdateNarrative({
      currentStatusNotes,
      improvementPlanNotes,
    });
    setNarrativeEditing(false);
  };

  // Group items by parentGroup for structured official presentation
  const renderRows = (rowItems: KPIItem[], categoryWeight: number) => {
    const groups: { [key: string]: KPIItem[] } = {};
    rowItems.forEach(it => {
      const g = it.parentGroup || 'Ерөнхий даалгавар';
      if (!groups[g]) groups[g] = [];
      groups[g].push(it);
    });

    return Object.entries(groups).map(([groupName, groupItems], gIdx) => {
      const groupPlannedWeight = groupItems.reduce((acc, curr) => acc + curr.weight, 0);
      const groupEmployeeRating = groupItems.reduce((acc, curr) => acc + (curr.employeeRating || 0), 0);
      const groupManagerRating = groupItems.reduce((acc, curr) => acc + (curr.managerRating || 0), 0);

      return (
        <React.Fragment key={groupName}>
          {/* Project / Parent Group Header Bar */}
          <tr className="bg-slate-900/90 font-bold text-white border-y border-slate-700/80 text-[11px]">
            <td className="py-2 px-2 text-center text-slate-400 font-mono">
              {gIdx + 1}
            </td>
            <td className="py-2 px-3 text-indigo-300 font-bold" colSpan={3}>
              <div className="flex items-center justify-between">
                <span>{groupName}</span>
                <button
                  type="button"
                  onClick={() => onAddNewKPI(categoryWeight === 70 ? 'CORE_70' : 'UNPLANNED_30', groupName)}
                  className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-200 border border-indigo-500/30 transition-all flex items-center gap-1"
                  title={`${groupName}-д шинэ ажил гараар нэмэх`}
                >
                  <Plus className="w-3 h-3" />
                  <span>+ Ажил нэмэх</span>
                </button>
              </div>
            </td>
            <td className="py-2 px-2 text-center text-indigo-300 font-bold bg-slate-950/60 border-l border-slate-700">
              {groupPlannedWeight.toFixed(1)}%
            </td>
            <td className="py-2 px-3 text-slate-300 font-medium border-l border-slate-700" colSpan={1}>
              {groupName} гүйцэтгэл
            </td>
            <td className="py-2 px-2 text-center text-indigo-300 font-bold bg-slate-950/60 border-l border-slate-700">
              {groupEmployeeRating.toFixed(1)}%
            </td>
            <td className="py-2 px-2 border-l border-slate-700"></td>
            <td className="py-2 px-2 text-center text-emerald-400 font-bold bg-slate-950/60 border-l border-slate-700">
              {groupManagerRating.toFixed(1)}%
            </td>
            <td className="py-2 px-2 border-l border-slate-700"></td>
          </tr>

          {/* Child task rows */}
          {groupItems.map((item, idx) => {
            const isEditing = editingRowId === item.id;

            return (
              <tr 
                key={item.id} 
                className={`border-b border-slate-800 text-xs transition-colors ${
                  isEditing ? 'bg-indigo-950/30 ring-1 ring-indigo-500/50' : 'hover:bg-slate-800/40'
                }`}
              >
                {/* 1. Д/д */}
                <td className="py-2.5 px-2 text-center text-slate-400 font-mono text-[11px]">
                  {item.orderNo || `${gIdx + 1}.${idx + 1}`}
                </td>

                {/* 2. Хийгдэх ажлын жагсаалт (Төлөвлөгөөт ажил - Гараар засах боломжтой) */}
                <td className="py-2.5 px-3 font-semibold text-slate-100 max-w-xs">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editFormData.title}
                      onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                      placeholder="Төлөвлөгөөт ажлын нэр..."
                      className="w-full bg-slate-900 border border-indigo-500 rounded p-1 text-xs text-white focus:outline-none"
                    />
                  ) : (
                    <>
                      {item.title ? (
                        <div className="leading-tight font-medium text-white">{item.title}</div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => startEditRow(item)}
                          className="text-left text-indigo-400 hover:text-indigo-300 font-semibold italic flex items-center gap-1.5 py-1 px-2 rounded bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 transition-all w-full"
                        >
                          <Edit3 className="w-3 h-3 text-indigo-400 shrink-0" />
                          <span>+ Ажлын нэр гараар бичих</span>
                        </button>
                      )}
                      {item.description && (
                        <div className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                          {item.description}
                        </div>
                      )}
                    </>
                  )}
                </td>

                {/* 3. Хүрэх үр дүн (Зорилтот тоо / тайлбар) */}
                <td className="py-2.5 px-3 text-right text-slate-300 font-medium">
                  {isEditing ? (
                    <div className="flex flex-col gap-1 items-end">
                      <input
                        type="number"
                        step="any"
                        value={editFormData.target}
                        onChange={(e) => handlePlanChange('target', parseFloat(e.target.value) || 0)}
                        placeholder="Зорилтот тоо"
                        className="w-24 bg-slate-900 border border-indigo-500 rounded p-1 text-right text-xs text-white"
                      />
                      <input
                        type="text"
                        value={editFormData.targetDescription}
                        onChange={(e) => setEditFormData({ ...editFormData, targetDescription: e.target.value })}
                        placeholder="Тайлбар үр дүн..."
                        className="w-32 bg-slate-900 border border-slate-700 rounded p-0.5 text-right text-[10px] text-slate-300"
                      />
                    </div>
                  ) : (
                    item.targetDescription || formatKPIValue(item.target, item.unit)
                  )}
                </td>

                {/* 4. Хэмжих үзүүлэлт (Unit) */}
                <td className="py-2.5 px-2 text-center text-slate-400 text-[11px]">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editFormData.unit}
                      onChange={(e) => setEditFormData({ ...editFormData, unit: e.target.value })}
                      className="w-20 bg-slate-900 border border-slate-700 rounded p-1 text-center text-[10px] text-white"
                    />
                  ) : (
                    item.unit
                  )}
                </td>

                {/* 5. Гүйцэтгэлийн үнэлгээний хувь (Жин %) */}
                <td className="py-2.5 px-2 text-center font-bold text-indigo-300 bg-slate-950/40 border-l border-slate-800">
                  {isEditing ? (
                    <div className="flex items-center justify-center gap-1">
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max="70"
                        value={editFormData.weight}
                        onChange={(e) => handlePlanChange('weight', parseFloat(e.target.value) || 0)}
                        className="w-14 bg-slate-900 border border-indigo-500 rounded p-1 text-center text-xs text-indigo-300 font-bold"
                      />
                      <span className="text-[10px] text-slate-400">%</span>
                    </div>
                  ) : (
                    `${item.weight.toFixed(1)}%`
                  )}
                </td>

                {/* 6. Хийгдсэн ажлын жагсаалт (Биелэлт) */}
                <td className="py-2.5 px-3 max-w-sm text-slate-200 border-l border-slate-800">
                  {isEditing ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-[10px] text-slate-400">
                        <span>Бодит тоо:</span>
                        <input
                          type="number"
                          step="any"
                          value={editFormData.actual}
                          onChange={(e) => handlePlanChange('actual', parseFloat(e.target.value) || 0)}
                          className="w-20 bg-slate-900 border border-indigo-500 rounded p-0.5 text-xs text-white font-bold text-right"
                        />
                        <span>{editFormData.unit}</span>
                      </div>
                      <textarea
                        rows={2}
                        value={editFormData.completedWorkList}
                        onChange={(e) => setEditFormData({ ...editFormData, completedWorkList: e.target.value })}
                        placeholder="Хийгдсэн ажлын үр дүн, тоо, жагсаалтыг бичнэ үү..."
                        className="w-full bg-slate-900 border border-indigo-500 rounded p-1.5 text-xs text-white focus:outline-none"
                      />
                    </div>
                  ) : (
                    <div className="text-[11px] leading-relaxed text-slate-200">
                      {item.completedWorkList ? (
                        item.completedWorkList
                      ) : (
                        <button
                          type="button"
                          onClick={() => startEditRow(item)}
                          className="text-slate-400 hover:text-indigo-300 italic text-[11px] text-left flex items-center gap-1.5 py-1 px-2 rounded bg-slate-800/40 hover:bg-slate-800 border border-slate-700/60 transition-all w-full"
                        >
                          <Edit3 className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                          <span>+ Биелэлтийн ажлуудыг гараар бичих...</span>
                        </button>
                      )}
                    </div>
                  )}
                </td>

                {/* 7. Биелэлтийн үнэлгээ (Ажилтны өөрийн үнэлгээ % - Автомат бодогдоно) */}
                <td className="py-2.5 px-2 text-center bg-slate-950/40 border-l border-slate-800">
                  {isEditing ? (
                    <div className="flex flex-col items-center">
                      <div className="flex items-center gap-0.5 text-[9px] text-emerald-400 mb-0.5">
                        <Calculator className="w-2.5 h-2.5" />
                        <span>Автомат</span>
                      </div>
                      <input
                        type="number"
                        step="0.1"
                        max={editFormData.weight * 1.2}
                        value={editFormData.employeeRating}
                        onChange={(e) => setEditFormData({ ...editFormData, employeeRating: parseFloat(e.target.value) || 0 })}
                        className="w-14 bg-slate-900 border border-indigo-500 rounded px-1 py-0.5 text-center font-bold text-xs text-indigo-300"
                      />
                      <span className="text-[10px] text-slate-400 mt-0.5">/ {editFormData.weight}%</span>
                    </div>
                  ) : (
                    <span className={`font-bold text-xs ${item.employeeRating > 0 ? 'text-indigo-300' : 'text-slate-500'}`}>
                      {item.employeeRating !== undefined ? `${item.employeeRating.toFixed(1)}%` : '0.0%'}
                    </span>
                  )}
                </td>

                {/* 8. Ажилтны тайлбар */}
                <td className="py-2.5 px-3 text-slate-300 border-l border-slate-800 max-w-xs">
                  {isEditing ? (
                    <textarea
                      rows={2}
                      value={editFormData.employeeNote}
                      onChange={(e) => setEditFormData({ ...editFormData, employeeNote: e.target.value })}
                      placeholder="Ажилтны тайлбар..."
                      className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-slate-200 focus:outline-none"
                    />
                  ) : (
                    <div className="text-[11px] text-slate-300 leading-snug">
                      {item.employeeNote || '-'}
                    </div>
                  )}
                </td>

                {/* 9. Шууд удирдлагын үнэлгээ (Захирал Н.Гомбосүрэн үнэлнэ) */}
                <td className="py-2.5 px-2 text-center bg-slate-950/40 border-l border-slate-800">
                  {isEditing && isAdmin ? (
                    <div className="flex flex-col items-center">
                      <input
                        type="number"
                        step="0.1"
                        max={editFormData.weight * 1.2}
                        value={editFormData.managerRating}
                        onChange={(e) => setEditFormData({ ...editFormData, managerRating: parseFloat(e.target.value) || 0 })}
                        className="w-14 bg-slate-900 border border-emerald-500 rounded px-1 py-0.5 text-center font-bold text-xs text-emerald-300"
                      />
                      <span className="text-[10px] text-slate-400 mt-0.5">/ {editFormData.weight}%</span>
                    </div>
                  ) : (
                    <span className={`font-black text-xs ${item.managerRating > 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {item.managerRating !== undefined ? `${item.managerRating.toFixed(1)}%` : '0.0%'}
                    </span>
                  )}
                </td>

                {/* 10. Шууд удирдлагын тайлбар & Edit action */}
                <td className="py-2.5 px-3 text-slate-300 border-l border-slate-800 max-w-xs">
                  {isEditing ? (
                    <div>
                      {isAdmin && (
                        <textarea
                          rows={2}
                          value={editFormData.managerNote}
                          onChange={(e) => setEditFormData({ ...editFormData, managerNote: e.target.value })}
                          placeholder="Удирдлагын дүгнэлт / зөвлөмж..."
                          className="w-full bg-slate-900 border border-emerald-600 rounded p-1.5 text-xs text-emerald-200 mb-1.5 focus:outline-none"
                        />
                      )}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          type="button"
                          onClick={() => saveEditRow(item.id)}
                          className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] flex items-center gap-1 shadow"
                        >
                          <Save className="w-3 h-3" /> Хадгалах
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingRowId(null)}
                          className="px-2 py-1 rounded bg-slate-800 text-slate-400 hover:text-white text-[10px]"
                        >
                          Болих
                        </button>
                        {onDeleteKPI && (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`"${item.title}" төлөвлөгөөт ажлыг устгах уу?`)) {
                                onDeleteKPI(item.id);
                                setEditingRowId(null);
                              }
                            }}
                            className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors ml-auto"
                            title="Устгах"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-1 group">
                      <span className="text-[11px] text-emerald-300/90 leading-snug">
                        {item.managerNote || '-'}
                      </span>
                      <button
                        onClick={() => startEditRow(item)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white transition-all no-print flex items-center gap-1 text-[10px] font-semibold shadow border border-slate-700 hover:border-indigo-500 shrink-0"
                        title="Төлөвлөгөө, нэр, дүн, тайлбар засах"
                      >
                        <Edit3 className="w-3 h-3 text-indigo-400 group-hover:text-white" />
                        <span>Засах</span>
                      </button>
                    </div>
                  )}
                </td>

              </tr>
            );
          })}
        </React.Fragment>
      );
    });
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-4 sm:p-6 mb-8 text-slate-100">
      
      {/* Top Controls & Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800 no-print">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-emerald-400 p-0.5 flex items-center justify-center shadow-lg">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center font-black text-indigo-400 text-xs">
              UB
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
                UB GROUP АЛБАН ЁСНЫ ФОРМАТ
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Томъёо автомат
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white">
              Борлуулалт, Маркетингийн газрын KPI үнэлгээ — {user.name}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onCopyPreviousMonth && (
            <button
              onClick={onCopyPreviousMonth}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors shadow-sm"
              title="Өмнөх сарын давтагдах ажлуудыг энэ сар руу хуулах"
            >
              <Copy className="w-3.5 h-3.5 text-cyan-400" />
              <span>Өмнөх сараас хуулах</span>
            </button>
          )}
          <button
            onClick={() => onAddNewKPI('CORE_70')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Үндсэн ажил нэмэх (70%)</span>
          </button>
          <button
            onClick={() => onAddNewKPI('UNPLANNED_30')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Төлөвлөгөөнөөс гадуур ажил (30%)</span>
          </button>
          <button
            onClick={onExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Excel / CSV</span>
          </button>
          <button
            onClick={onPrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
          >
            <Printer className="w-3.5 h-3.5 text-indigo-400" />
            <span>Хэвлэх / PDF</span>
          </button>
        </div>
      </div>

      {/* Official Form Header as in User Request: Director N. Gombosuren */}
      <div className="my-6 border-b border-slate-800 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs font-extrabold tracking-wider text-slate-300 uppercase bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800 inline-block">
              БАТАЛСАН: Борлуулалт, Маркетингийн газрын захирал .............................Н.Гомбосүрэн
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white mt-3 tracking-tight">
              Борлуулалт, Маркетингийн газрын {getPeriodLabel(period)} KPI үнэлгээ {user.name}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Албан тушаал: <strong className="text-indigo-300">{user.title}</strong>
            </p>
          </div>
          <div className="text-right bg-slate-900 border border-slate-800 rounded-xl p-3">
            <div className="text-[11px] text-slate-400 uppercase font-semibold">
              Шууд удирдлагын баталсан үнэлгээ
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400">
              {summary.managerTotalRating}%
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Ажилтны өөрийн үнэлгээ: <strong className="text-indigo-300">{summary.employeeTotalRating}%</strong>
            </div>
          </div>
        </div>
      </div>

      {/* The Master Official KPI Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-700 shadow-xl mb-6">
        <table className="w-full text-left text-xs border-collapse">
          
          {/* Main Table Column Headers (2 big sections: Plan & Execution) */}
          <thead>
            {/* Super Header Row */}
            <tr className="border-b border-slate-700 bg-slate-900 text-center font-bold text-xs uppercase tracking-wider text-slate-300">
              <th colSpan={5} className="py-2.5 px-3 border-r border-slate-700 bg-indigo-950/40 text-indigo-200">
                {getPeriodLabel(period)} АЖЛЫН ТӨЛӨВЛӨГӨӨ
              </th>
              <th colSpan={5} className="py-2.5 px-3 bg-emerald-950/30 text-emerald-200">
                {getPeriodLabel(period)} ТӨЛӨВЛӨГӨӨНИЙ БИЕЛЭЛТ
              </th>
            </tr>
            
            {/* Secondary Header Row */}
            <tr className="bg-slate-950 text-slate-300 border-b border-slate-700 text-[11px] uppercase font-bold">
              <th className="py-3 px-2 text-center w-10">Д/д</th>
              <th className="py-3 px-3 min-w-[220px]">Хийгдэх ажлын жагсаалт</th>
              <th className="py-3 px-3 text-right min-w-[130px]">Хүрэх үр дүн</th>
              <th className="py-3 px-2 text-center min-w-[100px]">Хэмжих үзүүлэлт</th>
              <th className="py-3 px-2 text-center min-w-[90px] border-r border-slate-700 bg-indigo-950/20 text-indigo-300">
                Гүйцэтгэлийн үнэлгээний хувь
              </th>

              <th className="py-3 px-3 min-w-[240px]">Хийгдсэн ажлын жагсаалт</th>
              <th className="py-3 px-2 text-center min-w-[90px] bg-indigo-950/20 text-indigo-300">
                Биелэлтийн үнэлгээ
              </th>
              <th className="py-3 px-3 min-w-[150px]">Тайлбар (Ажилтан)</th>
              <th className="py-3 px-2 text-center min-w-[90px] bg-emerald-950/20 text-emerald-300">
                Шууд удирдлагын үнэлгээ
              </th>
              <th className="py-3 px-3 min-w-[160px]">Тайлбар (Удирдлага)</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-800">
            
            {items.length === 0 && (
              <tr>
                <td colSpan={10} className="py-12 px-4 text-center bg-slate-900/40">
                  <div className="max-w-md mx-auto space-y-3">
                    <p className="text-sm font-bold text-white">
                      {getPeriodLabel(period)} -д төлөвлөгөөт ажил одоогоор бүртгэгдээгүй байна.
                    </p>
                    <p className="text-xs text-slate-400">
                      Та өмнөх сарын давтагдах төлөвлөгөөт ажлуудыг шууд хуулбарлах эсвэл шинээр гараар нэмж эхлүүлнэ үү.
                    </p>
                    <div className="flex items-center justify-center gap-3 pt-2">
                      {onCopyPreviousMonth && (
                        <button
                          onClick={onCopyPreviousMonth}
                          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow"
                        >
                          <Copy className="w-4 h-4" />
                          <span>Өмнөх сарын төлөвлөгөөг хуулах</span>
                        </button>
                      )}
                      <button
                        onClick={() => onAddNewKPI('CORE_70')}
                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 border border-slate-700"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Шинэ ажил гараар нэмэх</span>
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            )}

            {/* Section A: ҮНДСЭН АЖИЛ (Нийт 70%) */}
            <tr className="bg-indigo-900/40 font-extrabold text-white text-xs border-y border-indigo-700/60">
              <td className="py-2.5 px-2 text-center font-black text-indigo-300">I</td>
              <td colSpan={3} className="py-2.5 px-3 uppercase tracking-wider text-indigo-200">
                ҮНДСЭН АЖИЛ (Борлуулалт, Маркетингийн үндсэн төлөвлөгөө)
              </td>
              <td className="py-2.5 px-2 text-center font-black text-indigo-300 border-l border-indigo-700/60 bg-indigo-950/70">
                {summary.coreWeightTotal}% / 70%
              </td>
              <td colSpan={1} className="py-2.5 px-3 text-slate-300 text-[11px] font-normal border-l border-indigo-700/60">
                Үндсэн төлөвлөгөөт ажлын биелэлтийн нэгтгэл
              </td>
              <td className="py-2.5 px-2 text-center font-black text-indigo-300 border-l border-indigo-700/60 bg-indigo-950/70">
                {coreItems.reduce((acc, c) => acc + (c.employeeRating || 0), 0).toFixed(1)}%
              </td>
              <td className="py-2.5 px-3 border-l border-indigo-700/60"></td>
              <td className="py-2.5 px-2 text-center font-black text-emerald-400 border-l border-indigo-700/60 bg-emerald-950/70">
                {summary.coreScore}%
              </td>
              <td className="py-2.5 px-3 border-l border-indigo-700/60"></td>
            </tr>

            {renderRows(coreItems, 70)}

            {/* Section B: ТӨЛӨВЛӨГӨӨНӨӨС ГАДУУРХ АЖИЛ (Нийт 30%) */}
            <tr className="bg-amber-900/40 font-extrabold text-white text-xs border-y border-amber-700/60">
              <td className="py-2.5 px-2 text-center font-black text-amber-300">II</td>
              <td colSpan={3} className="py-2.5 px-3 uppercase tracking-wider text-amber-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span>ТӨЛӨВЛӨГӨӨНӨӨС ГАДУУР ХИЙГДСЭН АЖИЛ (Шуурхай, Гэнэтийн төслүүд)</span>
                    <span className="text-[10px] font-bold normal-case px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {unplannedItems.length} ажил тус бүр {unplannedItems.length > 0 ? (30 / unplannedItems.length).toFixed(1) : 30}% (Нийт 30%)
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {onAutoBalanceUnplanned && unplannedItems.length > 0 && (
                      <button
                        type="button"
                        onClick={onAutoBalanceUnplanned}
                        className="text-[10px] font-semibold px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 transition-all flex items-center gap-1 normal-case"
                        title="30% жинг автоматаар тэгш хуваарилах (Жишээ нь 2 ажил бол тус бүр 15%)"
                      >
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        <span>30% тэгш хуваарилах</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onAddNewKPI('UNPLANNED_30', 'Төлөвлөгөөнөөс гадуур хийгдсэн ажил')}
                      className="text-[10px] font-semibold px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white shadow transition-all flex items-center gap-1 normal-case"
                    >
                      <Plus className="w-3 h-3" />
                      <span>+ Шуурхай ажил нэмэх</span>
                    </button>
                  </div>
                </div>
              </td>
              <td className="py-2.5 px-2 text-center font-black text-amber-300 border-l border-amber-700/60 bg-amber-950/70">
                {summary.unplannedWeightTotal}% / 30%
              </td>
              <td colSpan={1} className="py-2.5 px-3 text-slate-300 text-[11px] font-normal border-l border-amber-700/60">
                Төлөвлөгөөнөөс гадуурх ажлуудын нэгтгэл
              </td>
              <td className="py-2.5 px-2 text-center font-black text-amber-300 border-l border-amber-700/60 bg-amber-950/70">
                {unplannedItems.reduce((acc, c) => acc + (c.employeeRating || 0), 0).toFixed(1)}%
              </td>
              <td className="py-2.5 px-3 border-l border-amber-700/60"></td>
              <td className="py-2.5 px-2 text-center font-black text-emerald-400 border-l border-amber-700/60 bg-emerald-950/70">
                {summary.unplannedScore}%
              </td>
              <td className="py-2.5 px-3 border-l border-amber-700/60"></td>
            </tr>

            {renderRows(unplannedItems, 30)}

          </tbody>

          {/* Master Table Footer as in PDF Page 2 */}
          <tfoot className="bg-slate-900 border-t-2 border-slate-600 font-extrabold text-xs">
            <tr>
              <td colSpan={4} className="py-3.5 px-4 text-white uppercase text-right">
                Нийт эзлэх хувь (100% байна):
              </td>
              <td className="py-3.5 px-2 text-center text-sm font-black text-white bg-slate-950 border-x border-slate-700">
                {summary.coreWeightTotal + summary.unplannedWeightTotal}%
              </td>
              <td className="py-3.5 px-3 text-right uppercase text-slate-300 border-r border-slate-700">
                ЭЦСИЙН ҮНЭЛГЭЭ:
              </td>
              <td className="py-3.5 px-2 text-center text-sm font-black text-indigo-300 bg-slate-950 border-r border-slate-700">
                {summary.employeeTotalRating}%
              </td>
              <td className="py-3.5 px-3 text-slate-400 text-[11px] font-normal">
                Ажилтны дүн
              </td>
              <td className="py-3.5 px-2 text-center text-base font-black text-emerald-400 bg-slate-950 border-x border-slate-700">
                {summary.managerTotalRating}%
              </td>
              <td className="py-3.5 px-3 text-emerald-300 text-[11px] font-bold">
                Баталгаажсан эцсийн дүн
              </td>
            </tr>
          </tfoot>

        </table>
      </div>

      {/* Bottom Narrative Blocks from PDF Page 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
        
        {/* Block 1: Гүйцэтгэлийн одоогийн түвшин, нөхцөл байдал */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-indigo-400" />
              Гүйцэтгэлийн одоогийн түвшин, нөхцөл байдал:
            </h4>
            {!narrativeEditing && (
              <button
                onClick={() => setNarrativeEditing(true)}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold no-print"
              >
                Засах
              </button>
            )}
          </div>

          {narrativeEditing ? (
            <textarea
              rows={6}
              value={currentStatusNotes}
              onChange={(e) => setCurrentStatusNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
            />
          ) : (
            <div className="text-xs text-slate-300 whitespace-pre-line leading-relaxed font-sans bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
              {narrative?.currentStatusNotes || currentStatusNotes || 'Одоогоор тэмдэглэл оруулаагүй байна.'}
            </div>
          )}
        </div>

        {/* Block 2: Гүйцэтгэлийг сайжруулах ажлууд */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Гүйцэтгэлийг сайжруулах ажлууд / төлөвлөгөө:
            </h4>
            {narrativeEditing && (
              <button
                onClick={handleSaveNarrative}
                className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold shadow no-print"
              >
                Хадгалах
              </button>
            )}
          </div>

          {narrativeEditing ? (
            <textarea
              rows={6}
              value={improvementPlanNotes}
              onChange={(e) => setImprovementPlanNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
            />
          ) : (
            <div className="text-xs text-slate-300 whitespace-pre-line leading-relaxed font-sans bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
              {narrative?.improvementPlanNotes || improvementPlanNotes || 'Одоогоор төлөвлөгөө оруулаагүй байна.'}
            </div>
          )}
        </div>

      </div>

      {/* Signature Block as in User Request: Director N. Gombosuren */}
      <div className="mt-8 pt-6 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs text-slate-400">
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
          <div className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
            Үнэлсэн: Борлуулалт, Маркетингийн газрын захирал Н.Гомбосүрэн
          </div>
          <p className="text-[11px] text-slate-400 mt-1">UB GROUP Борлуулалт, Маркетингийн газар</p>
          <div className="mt-6 border-b border-dashed border-slate-600 w-48"></div>
          <div className="text-[10px] text-slate-500 mt-1">Гарын үсэг, огноо</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
          <div className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
            Зөвшөөрсөн: {user.name}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">{user.title}</p>
          <div className="mt-6 border-b border-dashed border-slate-600 w-48"></div>
          <div className="text-[10px] text-slate-500 mt-1">Гарын үсэг, огноо</div>
        </div>
      </div>

    </div>
  );
};
