import { KPIItem, UserProfile, ActivityNotification, ExecutiveReportNarrative } from '../types/kpi';

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'admin-1',
    name: 'Н.Гомбосүрэн',
    username: 'admin',
    password: 'ub2026',
    email: 'ubgroupub@gmail.com',
    role: 'admin',
    title: 'Борлуулалт, Маркетингийн газрын захирал',
    department: 'Борлуулалт, Маркетингийн газар',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    color: 'from-emerald-500 to-teal-600',
    phone: '9911-0000',
    pin: '1234',
  },
  {
    id: 'user-bold',
    name: 'Болд-Эрдэнэ',
    username: 'bold',
    password: 'bold2026',
    email: 'bold.erdene@company.mn',
    role: 'employee',
    title: 'Маркетингийн ахлах менежер',
    department: 'Борлуулалт, Маркетингийн газар',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    color: 'from-blue-600 to-indigo-600',
    phone: '9901-1122',
    pin: '1111',
  },
  {
    id: 'user-gan',
    name: 'Ган-Эрдэнэ',
    username: 'gan',
    password: 'gan2026',
    email: 'gan.erdene@company.mn',
    role: 'employee',
    title: 'Маркетингийн менежер (Дижитал & Сошиал)',
    department: 'Борлуулалт, Маркетингийн газар',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80',
    color: 'from-sky-500 to-blue-600',
    phone: '9902-3344',
    pin: '2222',
  },
  {
    id: 'user-michid',
    name: 'Мичидмаа',
    username: 'michid',
    password: 'michid2026',
    email: 'michidmaa@company.mn',
    role: 'employee',
    title: 'Маркетингийн менежер (Брэнд & Контент)',
    department: 'Борлуулалт, Маркетингийн газар',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    color: 'from-purple-500 to-violet-600',
    phone: '9903-5566',
    pin: '3333',
  },
  {
    id: 'user-dash',
    name: 'Дашдорж',
    username: 'dash',
    password: 'dash2026',
    email: 'dashdorj@company.mn',
    role: 'employee',
    title: 'График дизайнер',
    department: 'Бүтээлч Баг (Creative)',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80',
    color: 'from-amber-500 to-orange-600',
    phone: '9904-7788',
    pin: '4444',
  },
  {
    id: 'user-baya',
    name: 'Баярмандал',
    username: 'baya',
    password: 'baya2026',
    email: 'bayarmandal@company.mn',
    role: 'employee',
    title: 'Видео дизайнер',
    department: 'Бүтээлч Баг (Creative)',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    color: 'from-rose-500 to-red-600',
    phone: '9905-9900',
    pin: '5555',
  },
];

export const CURRENT_PERIOD = '2026-10';

// Official Core Project Titles (ҮНДСЭН АЖЛЫН ГАРЧИГУУД - нийт 70%)
export const CORE_PROJECT_GROUPS = [
  'Борлуулалтын албаны төлөвлөгөө',
  'ITC Tower Маркетинг',
  'Vision Business Tower Маркетинг',
  'Seoul Garden Маркетинг',
  'PROTEAM FITNESS Маркетинг',
  'HI UB CONCRETE Маркетинг',
  'UB AUTOCOM Маркетинг',
];

// Helper to generate a clean empty template for an employee
export const createEmptyUserTemplate = (userId: string, period = CURRENT_PERIOD): KPIItem[] => {
  const items: KPIItem[] = [];

  // I. ҮНДСЭН АЖИЛ: 7 төслийн гарчиг, доторх ажлууд хоосон гараар бичихэд бэлэн (7 x 10% = 70%)
  CORE_PROJECT_GROUPS.forEach((groupName, gIdx) => {
    items.push({
      id: `core-${userId}-${gIdx + 1}-${period}`,
      userId,
      orderNo: `${gIdx + 1}.1`,
      parentGroup: groupName,
      title: '', // Төлөвлөгөөт ажлыг гараар оруулах
      category: 'CORE_70',
      targetDescription: '', // Хүрэх үр дүн хоосон
      target: 0,
      unit: 'Ажил',
      weight: 10, // 7 гарчиг тус бүр 10% = 70%
      direction: 'higher_better',
      completedWorkList: '', // Биелэлт хоосон гараар бичнэ
      actual: 0,
      employeeRating: 0,
      employeeNote: '',
      managerRating: 0,
      managerNote: '',
      status: 'in_progress',
      lastUpdated: '2026-10-28',
      period,
      history: [],
    });
  });

  // II. ТӨЛӨВЛӨГӨӨНӨӨС ГАДУУРХ АЖИЛ: 2 ажил, автоматаар тус бүр 15% (нийлбэр 30%)
  items.push({
    id: `unplanned-${userId}-1-${period}`,
    userId,
    orderNo: 'II.1',
    parentGroup: 'Төлөвлөгөөнөөс гадуур хийгдсэн ажил',
    title: '', // Хоосон гараар бичнэ
    category: 'UNPLANNED_30',
    targetDescription: '',
    target: 0,
    unit: 'Ажил',
    weight: 15, // 2 ажил тус бүр 15%
    direction: 'higher_better',
    completedWorkList: '', // Биелэлт хоосон
    actual: 0,
    employeeRating: 0,
    employeeNote: '',
    managerRating: 0,
    managerNote: '',
    status: 'in_progress',
    lastUpdated: '2026-10-28',
    period,
    history: [],
  });

  items.push({
    id: `unplanned-${userId}-2-${period}`,
    userId,
    orderNo: 'II.2',
    parentGroup: 'Төлөвлөгөөнөөс гадуур хийгдсэн ажил',
    title: '', // Хоосон гараар бичнэ
    category: 'UNPLANNED_30',
    targetDescription: '',
    target: 0,
    unit: 'Ажил',
    weight: 15, // 2 ажил тус бүр 15% (Нийт 30%)
    direction: 'higher_better',
    completedWorkList: '', // Биелэлт хоосон
    actual: 0,
    employeeRating: 0,
    employeeNote: '',
    managerRating: 0,
    managerNote: '',
    status: 'in_progress',
    lastUpdated: '2026-10-28',
    period,
    history: [],
  });

  return items;
};

// Generate initial template for all 5 employees
export const INITIAL_KPIS: KPIItem[] = [
  ...createEmptyUserTemplate('user-bold', CURRENT_PERIOD),
  ...createEmptyUserTemplate('user-gan', CURRENT_PERIOD),
  ...createEmptyUserTemplate('user-michid', CURRENT_PERIOD),
  ...createEmptyUserTemplate('user-dash', CURRENT_PERIOD),
  ...createEmptyUserTemplate('user-baya', CURRENT_PERIOD),
];

export const INITIAL_NARRATIVE: ExecutiveReportNarrative = {
  userId: 'user-bold',
  period: CURRENT_PERIOD,
  currentStatusNotes: '',
  improvementPlanNotes: '',
  generalNotes: '',
  approvedBy: 'Борлуулалт, Маркетингийн газрын захирал Н.Гомбосүрэн',
  agreedBy: 'Болд-Эрдэнэ',
};

export const INITIAL_NOTIFICATIONS: ActivityNotification[] = [
  {
    id: 'notif-system-welcome',
    timestamp: '2026-10-28 09:00',
    userId: 'admin-1',
    userName: 'Систем',
    action: 'Шинэ сар эхэллээ',
    detail: '2026 оны 10-р сарын KPI үнэлгээний хуудас нээгдэж, төлөвлөгөө болон биелэлтийг гараар бичихэд бэлэн боллоо.',
    type: 'alert',
    read: false,
  },
];
