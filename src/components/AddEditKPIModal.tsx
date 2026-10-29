import React, { useState, useEffect } from 'react';
import { KPIItem, KPICategory, KPIDirection } from '../types/kpi';
import { X, Check, Target, Layers } from 'lucide-react';

interface AddEditKPIModalProps {
  isOpen: boolean;
  itemToEdit: KPIItem | null;
  defaultCategory: KPICategory;
  defaultParentGroup?: string;
  userId: string;
  period: string;
  onClose: () => void;
  onSaveNew: (data: {
    userId: string;
    orderNo?: string;
    parentGroup?: string;
    title: string;
    description: string;
    category: KPICategory;
    target: number;
    actual: number;
    unit: string;
    weight: number;
    direction: KPIDirection;
    period: string;
    completedWorkList?: string;
    employeeRating?: number;
    employeeNote?: string;
    managerRating?: number;
    managerNote?: string;
  }) => void;
  onSaveEdit: (kpiId: string, updates: Partial<KPIItem>) => void;
}

export const AddEditKPIModal: React.FC<AddEditKPIModalProps> = ({
  isOpen,
  itemToEdit,
  defaultCategory,
  defaultParentGroup,
  userId,
  period,
  onClose,
  onSaveNew,
  onSaveEdit,
}) => {
  const [parentGroup, setParentGroup] = useState('');
  const [orderNo, setOrderNo] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<KPICategory>(defaultCategory);
  const [target, setTarget] = useState<number>(10);
  const [actual, setActual] = useState<number>(0);
  const [unit, setUnit] = useState<string>('Хийгдсэн ажил тус бүр');
  const [weight, setWeight] = useState<number>(1.0);
  const [direction, setDirection] = useState<KPIDirection>('higher_better');

  // Execution & evaluation fields
  const [completedWorkList, setCompletedWorkList] = useState('');
  const [employeeRating, setEmployeeRating] = useState<number>(0);
  const [employeeNote, setEmployeeNote] = useState('');
  const [managerRating, setManagerRating] = useState<number>(0);
  const [managerNote, setManagerNote] = useState('');

  useEffect(() => {
    if (itemToEdit) {
      setParentGroup(itemToEdit.parentGroup || '');
      setOrderNo(itemToEdit.orderNo || '');
      setTitle(itemToEdit.title);
      setDescription(itemToEdit.description || '');
      setCategory(itemToEdit.category);
      setTarget(itemToEdit.target);
      setActual(itemToEdit.actual);
      setUnit(itemToEdit.unit);
      setWeight(itemToEdit.weight);
      setDirection(itemToEdit.direction);
      setCompletedWorkList(itemToEdit.completedWorkList || '');
      setEmployeeRating(itemToEdit.employeeRating || 0);
      setEmployeeNote(itemToEdit.employeeNote || '');
      setManagerRating(itemToEdit.managerRating || 0);
      setManagerNote(itemToEdit.managerNote || '');
    } else {
      setParentGroup(
        defaultParentGroup ||
        (defaultCategory === 'CORE_70' ? 'ITC Tower Маркетинг' : 'Төлөвлөгөөнөөс гадуур хийгдсэн ажил')
      );
      setOrderNo('');
      setTitle('');
      setDescription('');
      setCategory(defaultCategory);
      setTarget(1);
      setActual(0);
      setUnit('Хийгдсэн ажил тус бүр');
      setWeight(1.0);
      setDirection('higher_better');
      setCompletedWorkList('');
      setEmployeeRating(0);
      setEmployeeNote('');
      setManagerRating(0);
      setManagerNote('');
    }
  }, [itemToEdit, defaultCategory, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (itemToEdit) {
      onSaveEdit(itemToEdit.id, {
        parentGroup,
        orderNo,
        title,
        description,
        category,
        target,
        actual,
        unit,
        weight,
        direction,
        completedWorkList,
        employeeRating,
        employeeNote,
        managerRating,
        managerNote,
      });
    } else {
      onSaveNew({
        userId,
        parentGroup,
        orderNo,
        title,
        description,
        category,
        target,
        actual,
        unit,
        weight,
        direction,
        period,
        completedWorkList,
        employeeRating,
        employeeNote,
        managerRating,
        managerNote,
      });
    }
    onClose();
  };

  const commonGroups = [
    'Борлуулалтын албаны төлөвлөгөө',
    'ITC Tower Маркетинг төлөвлөгөө',
    'Vision Business Tower Маркетинг',
    'Seoul garden төсөл Маркетингийн төлөвлөгөө',
    'PROTEAM FITNESS Маркетингийн төлөвлөгөө',
    'HI UB CONCRETE Маркетингийн төлөвлөгөө',
    'UB AUTOCOM Маркетингийн төлөвлөгөө',
    'Төлөвлөгөөнөөс гадуур хийгдсэн ажил',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-800/80 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {itemToEdit ? 'KPI Үзүүлэлт засах' : 'Шинэ KPI Даалгавар нэмэх'}
              </h3>
              <p className="text-xs text-slate-400">
                UB Group формат: Төлөвлөгөө (70%/30%) ба Биелэлтийн дүгнэлт
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          
          {/* Category Selection (70% vs 30%) */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setCategory('CORE_70');
                if (parentGroup === 'Төлөвлөгөөнөөс гадуур хийгдсэн ажил') {
                  setParentGroup('ITC Tower Маркетинг төлөвлөгөө');
                }
              }}
              className={`p-3 rounded-xl border text-left transition-all ${
                category === 'CORE_70'
                  ? 'bg-indigo-600/20 border-indigo-500 ring-2 ring-indigo-500/20 text-white'
                  : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="font-bold text-xs text-indigo-300">Үндсэн ажил</div>
              <div className="text-[11px] text-slate-300 mt-0.5">Нийт 70% жинд багтана</div>
            </button>

            <button
              type="button"
              onClick={() => {
                setCategory('UNPLANNED_30');
                setParentGroup('Төлөвлөгөөнөөс гадуур хийгдсэн ажил');
              }}
              className={`p-3 rounded-xl border text-left transition-all ${
                category === 'UNPLANNED_30'
                  ? 'bg-amber-600/20 border-amber-500 ring-2 ring-amber-500/20 text-white'
                  : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="font-bold text-xs text-amber-300">Төлөвлөгөөнөөс гадуурх</div>
              <div className="text-[11px] text-slate-300 mt-0.5">Нийт 30% жинд багтана</div>
            </button>
          </div>

          {/* Project / Parent Group & Order */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-200 mb-1">
                Төсөл / Бүлэг (Parent Group):
              </label>
              <input
                type="text"
                list="parent-group-list"
                value={parentGroup}
                onChange={(e) => setParentGroup(e.target.value)}
                placeholder="Жишээ: ITC Tower Маркетинг төлөвлөгөө..."
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <datalist id="parent-group-list">
                {commonGroups.map(g => (
                  <option key={g} value={g} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">
                Д/д (Дугаар):
              </label>
              <input
                type="text"
                value={orderNo}
                onChange={(e) => setOrderNo(e.target.value)}
                placeholder="1.1, 2.1..."
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-center font-bold text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Title (Хийгдэх ажлын жагсаалт) */}
          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1">
              Хийгдэх ажлын нэр (Даалгавар):
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Жишээ: LEAD татах контент, Сошиал маркетинг..."
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Дэлгэрэнгүй тодорхойлолт / Хүрэх үр дүнгийн тайлбар:
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Хүрэх үр дүнгийн агуулга, дэлгэрэнгүй..."
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Target, Unit, Weight */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">
                Зорилтот тоо:
              </label>
              <input
                type="number"
                step="any"
                required
                value={target}
                onChange={(e) => setTarget(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">
                Хэмжих үзүүлэлт:
              </label>
              <input
                type="text"
                required
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="Хийгдсэн ажил тус бүр, ₮, %..."
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">
                Жин (%):
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  min="0.1"
                  max="70"
                  required
                  value={weight}
                  onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <span className="absolute right-3 top-2 text-xs text-slate-400 font-bold">%</span>
              </div>
            </div>
          </div>

          {/* Execution details: Completed work list */}
          <div className="pt-2 border-t border-slate-800">
            <div className="text-xs font-bold text-indigo-300 mb-2">
              Биелэлтийн хэсэг (Гүйцэтгэл ба үнэлгээ):
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Хийгдсэн ажлын жагсаалт (Биелэлт):
              </label>
              <textarea
                rows={2}
                value={completedWorkList}
                onChange={(e) => setCompletedWorkList(e.target.value)}
                placeholder="Жишээ: Нийт 163 lead холбогдсон, 4 рийлс бэлтгэсэн..."
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Биелэлтийн үнэлгээ (Ажилтны %):
                </label>
                <input
                  type="number"
                  step="0.1"
                  max={weight * 1.2}
                  value={employeeRating}
                  onChange={(e) => setEmployeeRating(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white"
                  placeholder="0.0%"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Шууд удирдлагын үнэлгээ (%):
                </label>
                <input
                  type="number"
                  step="0.1"
                  max={weight * 1.2}
                  value={managerRating}
                  onChange={(e) => setManagerRating(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-emerald-400"
                  placeholder="0.0%"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Ажилтны тайлбар:
                </label>
                <input
                  type="text"
                  value={employeeNote}
                  onChange={(e) => setEmployeeNote(e.target.value)}
                  placeholder="Гүйцэтгэлийн тайлбар..."
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Шууд удирдлагын тайлбар:
                </label>
                <input
                  type="text"
                  value={managerNote}
                  onChange={(e) => setManagerNote(e.target.value)}
                  placeholder="Удирдлагын зөвлөмж..."
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-emerald-300"
                />
              </div>
            </div>

          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2.5">
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
              {itemToEdit ? 'Өөрчлөлтийг хадгалах' : 'KPI бүртгэх'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
