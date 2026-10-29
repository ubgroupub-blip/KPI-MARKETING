export type UserRole = 'admin' | 'employee';

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  password: string;
  email: string;
  role: UserRole;
  title: string;
  department: string;
  avatar: string;
  phone?: string;
  color: string;
  pin?: string;
}

export type KPICategory = 'CORE_70' | 'UNPLANNED_30';

export type KPIDirection = 'higher_better' | 'lower_better';

export type KPIStatus = 'in_progress' | 'pending_approval' | 'approved' | 'rejected';

export interface ProgressEntry {
  id: string;
  date: string;
  valueAdded: number;
  newActual: number;
  note: string;
  attachmentUrl?: string;
  loggedBy: string;
}

export interface KPIItem {
  id: string;
  userId: string;
  orderNo?: string;
  parentGroup?: string; // e.g., "ITC Tower Маркетинг", "Борлуулалтын алба", "PROTEAM FITNESS"
  title: string;        // Хийгдэх ажлын жагсаалт
  description?: string;
  category: KPICategory;
  
  // Төлөвлөгөөний баганууд (Plan columns)
  targetDescription?: string; // Хүрэх үр дүнгийн тайлбар/хэмжээ
  target: number;             // Хүрэх тоон зорилт
  unit: string;               // Хэмжих үзүүлэлт (Хийгдсэн ажил тус бүр, ₮, %, пост, видео...)
  weight: number;             // Гүйцэтгэлийн үнэлгээний хувь (Жин %)
  direction: KPIDirection;

  // Биелэлтийн баганууд (Execution / Evaluation columns)
  completedWorkList: string;  // Хийгдсэн ажлын жагсаалт
  actual: number;             // Бодит тоон биелэлт
  employeeRating: number;     // Биелэлтийн үнэлгээ (Ажилтны үнэлгээ %)
  employeeNote: string;       // Тайлбар (Ажилтны тайлбар)
  managerRating: number;      // Шууд удирдлагын үнэлгээ (Удирдлагын үнэлгээ %)
  managerNote: string;        // Шууд удирдлагын тайлбар
  adminComment?: string;      // Backward compatible note

  status: KPIStatus;
  lastUpdated: string;
  period: string; // e.g., "2026-10"
  history: ProgressEntry[];
}

export interface ExecutiveReportNarrative {
  userId: string;
  period: string;
  currentStatusNotes: string;      // Гүйцэтгэлийн одоогийн түвшин, нөхцөл байдал
  improvementPlanNotes: string;    // Гүйцэтгэлийг сайжруулах ажлууд
  generalNotes?: string;           // Нэмэлт тайлбар
  approvedBy: string;              // Үнэлсэн: Гүйцэтгэх захирал Д.Түвшинбат
  agreedBy: string;                // Зөвшөөрсөн: Ажилтан
}

export interface PeriodSummary {
  period: string;
  coreWeightTotal: number;
  unplannedWeightTotal: number;
  coreScore: number;               // out of 70 (based on manager verified score or employee score)
  unplannedScore: number;          // out of 30
  totalScore: number;              // coreScore + unplannedScore (out of 100)
  employeeTotalRating: number;     // Ажилтны өөрийн нийт үнэлгээний нийлбэр
  managerTotalRating: number;      // Шууд удирдлагын нийт үнэлгээний нийлбэр
  grade: 'A+' | 'A' | 'B' | 'C' | 'D';
  gradeTitle: string;
  bonusPercentage: number;
  isWeightsValid: boolean;         // core == 70 && unplanned == 30
}

export interface ActivityNotification {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  detail: string;
  type: 'update' | 'approval' | 'alert' | 'comment';
  read: boolean;
}
