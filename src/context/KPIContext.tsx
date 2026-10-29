import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, KPIItem, ActivityNotification, KPICategory, ExecutiveReportNarrative } from '../types/kpi';
import { INITIAL_USERS, INITIAL_KPIS, CURRENT_PERIOD, INITIAL_NOTIFICATIONS, INITIAL_NARRATIVE } from '../data/initialData';
import { getPreviousPeriod } from '../utils/kpiCalculator';

interface KPIContextType {
  users: UserProfile[];
  currentUser: UserProfile;
  selectedUser: UserProfile; // used by admin to inspect a specific employee
  setSelectedUser: (user: UserProfile) => void;
  kpis: KPIItem[];
  selectedPeriod: string;
  setSelectedPeriod: (period: string) => void;
  narratives: Record<string, ExecutiveReportNarrative>;
  updateNarrative: (userId: string, period: string, updates: Partial<ExecutiveReportNarrative>) => void;
  notifications: ActivityNotification[];
  isAuthenticated: boolean;
  login: (usernameOrEmail: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  loginAs: (userId: string) => void;
  autoBalanceUnplanned: (userId: string, period: string) => void;
  updateKPIActual: (kpiId: string, newActual: number, note?: string, link?: string) => void;
  updateKPIEvaluation: (
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
  addKPIItem: (item: {
    userId: string;
    orderNo?: string;
    parentGroup?: string;
    title: string;
    description?: string;
    category: KPICategory;
    target: number;
    actual: number;
    unit: string;
    weight: number;
    direction: 'higher_better' | 'lower_better';
    period: string;
    targetDescription?: string;
    completedWorkList?: string;
    employeeRating?: number;
    employeeNote?: string;
    managerRating?: number;
    managerNote?: string;
  }) => void;
  editKPIItem: (kpiId: string, updates: Partial<KPIItem>) => void;
  deleteKPIItem: (kpiId: string) => void;
  approveKPI: (kpiId: string, comment?: string) => void;
  rejectKPI: (kpiId: string, comment?: string) => void;
  rebalanceWeights: (userId: string, period: string, updates: { id: string; weight: number }[]) => void;
  copyTasksFromPreviousMonth: (userId: string, targetPeriod: string) => number;
  resetToDefaults: () => void;
  markNotificationsAsRead: () => void;
  exportDataToJSON: () => void;
  importDataFromJSON: (jsonStr: string) => boolean;
}

const KPIContext = createContext<KPIContextType | undefined>(undefined);

const STORAGE_KEY_KPIS = 'mktg_kpis_v4_ubgroup_clean';
const STORAGE_KEY_NOTIFS = 'mktg_notifs_v4_ubgroup';
const STORAGE_KEY_NARRATIVES = 'mktg_narratives_v4_ubgroup';
const STORAGE_KEY_USER_ID = 'mktg_current_user_id_v4';
const STORAGE_KEY_AUTH = 'mktg_is_authenticated_v4';

export const KPIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users] = useState<UserProfile[]>(INITIAL_USERS);
  
  // Auth state: check localStorage
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const savedAuth = localStorage.getItem(STORAGE_KEY_AUTH);
    if (savedAuth !== null) {
      return savedAuth === 'true';
    }
    return true; // Default logged in as admin for first preview
  });

  // Current logged in user (defaults to admin or saved user)
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const savedId = localStorage.getItem(STORAGE_KEY_USER_ID);
    if (savedId) {
      const found = INITIAL_USERS.find(u => u.id === savedId);
      if (found) return found;
    }
    return INITIAL_USERS[0]; // Admin by default (Н.Гомбосүрэн)
  });

  // Selected user for inspection in dashboard
  const [selectedUser, setSelectedUser] = useState<UserProfile>(INITIAL_USERS[1]); // Default to Bold-Erdene

  const [selectedPeriod, setSelectedPeriod] = useState<string>(CURRENT_PERIOD);

  // KPIs state
  const [kpis, setKpis] = useState<KPIItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_KPIS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return INITIAL_KPIS;
  });

  // Narratives state (Current status & improvement plans from PDF)
  const [narratives, setNarratives] = useState<Record<string, ExecutiveReportNarrative>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_NARRATIVES);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return {
      [`${INITIAL_NARRATIVE.userId}_${INITIAL_NARRATIVE.period}`]: INITIAL_NARRATIVE,
    };
  });

  // Notifications state
  const [notifications, setNotifications] = useState<ActivityNotification[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_NOTIFS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return INITIAL_NOTIFICATIONS;
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_KPIS, JSON.stringify(kpis));
  }, [kpis]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_NARRATIVES, JSON.stringify(narratives));
  }, [narratives]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_USER_ID, currentUser.id);
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_AUTH, String(isAuthenticated));
  }, [isAuthenticated]);

  // Login with username or email + password
  const login = (usernameOrEmail: string, password: string): { success: boolean; error?: string } => {
    const trimmedInput = usernameOrEmail.trim().toLowerCase();
    const user = INITIAL_USERS.find(
      u => u.username.toLowerCase() === trimmedInput || u.email.toLowerCase() === trimmedInput
    );

    if (!user) {
      return { success: false, error: 'Нэвтрэх нэр эсвэл и-мэйл бүртгэлгүй байна.' };
    }

    if (user.password !== password.trim()) {
      return { success: false, error: 'Нууц үг буруу байна. Дахин оролдоно уу.' };
    }

    setCurrentUser(user);
    if (user.role === 'employee') {
      setSelectedUser(user);
    }
    setIsAuthenticated(true);
    return { success: true };
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  const loginAs = (userId: string) => {
    const user = INITIAL_USERS.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      if (user.role === 'employee') {
        setSelectedUser(user);
      }
      setIsAuthenticated(true);
    }
  };

  // Helper to auto-balance 30% unplanned tasks equally among all unplanned items
  const autoBalanceUnplanned = (userId: string, period: string) => {
    setKpis(prev => {
      const unplanned = prev.filter(k => k.userId === userId && k.period === period && k.category === 'UNPLANNED_30');
      if (unplanned.length === 0) return prev;

      const eachWeight = Number((30 / unplanned.length).toFixed(2));
      return prev.map(k => {
        if (k.userId === userId && k.period === period && k.category === 'UNPLANNED_30') {
          return { ...k, weight: eachWeight };
        }
        return k;
      });
    });
  };

  const updateNarrative = (userId: string, period: string, updates: Partial<ExecutiveReportNarrative>) => {
    const key = `${userId}_${period}`;
    setNarratives(prev => {
      const existing = prev[key] || {
        userId,
        period,
        currentStatusNotes: '',
        improvementPlanNotes: '',
        generalNotes: '',
        approvedBy: 'Борлуулалт, Маркетингийн газрын захирал Н.Гомбосүрэн',
        agreedBy: currentUser.name,
      };
      return {
        ...prev,
        [key]: {
          ...existing,
          ...updates,
        },
      };
    });
  };

  const updateKPIActual = (kpiId: string, newActual: number, note?: string) => {
    const now = new Date().toISOString().split('T')[0];
    const timeStr = new Date().toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' });

    setKpis(prev =>
      prev.map(item => {
        if (item.id !== kpiId) return item;

        // Auto calculate rating
        let autoRating = item.employeeRating;
        if (item.target > 0) {
          autoRating = Number(Math.min(item.weight * 1.2, (newActual / item.target) * item.weight).toFixed(2));
        }

        const newHistory = [
          {
            id: 'h-' + Date.now(),
            date: now,
            valueAdded: newActual - item.actual,
            newActual,
            note: note || `Гүйцэтгэл: ${newActual} ${item.unit}`,
            loggedBy: currentUser.name,
          },
          ...(item.history || []),
        ];

        return {
          ...item,
          actual: newActual,
          employeeRating: autoRating,
          lastUpdated: now,
          status: currentUser.role === 'admin' ? 'approved' : 'pending_approval',
          history: newHistory,
        };
      })
    );
  };

  const updateKPIEvaluation = (
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
  ) => {
    const now = new Date().toISOString().split('T')[0];

    setKpis(prev =>
      prev.map(item => {
        if (item.id !== kpiId) return item;

        const updated: KPIItem = {
          ...item,
          lastUpdated: now,
        };

        if (data.title !== undefined) updated.title = data.title;
        if (data.targetDescription !== undefined) updated.targetDescription = data.targetDescription;
        if (data.target !== undefined) updated.target = data.target;
        if (data.actual !== undefined) updated.actual = data.actual;
        if (data.unit !== undefined) updated.unit = data.unit;
        if (data.weight !== undefined) updated.weight = data.weight;
        if (data.completedWorkList !== undefined) updated.completedWorkList = data.completedWorkList;
        if (data.employeeRating !== undefined) updated.employeeRating = data.employeeRating;
        if (data.employeeNote !== undefined) updated.employeeNote = data.employeeNote;
        if (data.managerRating !== undefined) updated.managerRating = data.managerRating;
        if (data.managerNote !== undefined) updated.managerNote = data.managerNote;

        if (currentUser.role === 'admin' && data.managerRating !== undefined) {
          updated.status = 'approved';
        }

        return updated;
      })
    );
  };

  const addKPIItem = (itemData: {
    userId: string;
    orderNo?: string;
    parentGroup?: string;
    title: string;
    description?: string;
    category: KPICategory;
    target: number;
    actual: number;
    unit: string;
    weight: number;
    direction: 'higher_better' | 'lower_better';
    period: string;
    targetDescription?: string;
    completedWorkList?: string;
    employeeRating?: number;
    employeeNote?: string;
    managerRating?: number;
    managerNote?: string;
  }) => {
    const now = new Date().toISOString().split('T')[0];
    const newItem: KPIItem = {
      ...itemData,
      id: 'kpi-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      description: itemData.description || '',
      targetDescription: itemData.targetDescription || '',
      completedWorkList: itemData.completedWorkList || '',
      employeeRating: itemData.employeeRating ?? 0,
      employeeNote: itemData.employeeNote || '',
      managerRating: itemData.managerRating ?? 0,
      managerNote: itemData.managerNote || '',
      status: currentUser.role === 'admin' ? 'approved' : 'pending_approval',
      lastUpdated: now,
      history: [],
    };

    setKpis(prev => {
      // If unplanned, auto-distribute 30% equally among all unplanned items including this new one!
      if (itemData.category === 'UNPLANNED_30') {
        const existingUnplanned = prev.filter(
          k => k.userId === itemData.userId && k.period === itemData.period && k.category === 'UNPLANNED_30'
        );
        const totalCount = existingUnplanned.length + 1;
        const eachWeight = Number((30 / totalCount).toFixed(2));
        newItem.weight = eachWeight;

        const updatedPrev = prev.map(k => {
          if (k.userId === itemData.userId && k.period === itemData.period && k.category === 'UNPLANNED_30') {
            return { ...k, weight: eachWeight };
          }
          return k;
        });

        return [...updatedPrev, newItem];
      }

      return [...prev, newItem];
    });
  };

  const editKPIItem = (kpiId: string, updates: Partial<KPIItem>) => {
    const now = new Date().toISOString().split('T')[0];
    setKpis(prev =>
      prev.map(item => {
        if (item.id === kpiId) {
          return {
            ...item,
            ...updates,
            lastUpdated: now,
          };
        }
        return item;
      })
    );
  };

  const deleteKPIItem = (kpiId: string) => {
    setKpis(prev => {
      const itemToDelete = prev.find(k => k.id === kpiId);
      const remaining = prev.filter(k => k.id !== kpiId);

      // If deleted item was unplanned, rebalance remaining unplanned items to 30%
      if (itemToDelete && itemToDelete.category === 'UNPLANNED_30') {
        const remainingUnplanned = remaining.filter(
          k => k.userId === itemToDelete.userId && k.period === itemToDelete.period && k.category === 'UNPLANNED_30'
        );
        if (remainingUnplanned.length > 0) {
          const eachWeight = Number((30 / remainingUnplanned.length).toFixed(2));
          return remaining.map(k => {
            if (k.userId === itemToDelete.userId && k.period === itemToDelete.period && k.category === 'UNPLANNED_30') {
              return { ...k, weight: eachWeight };
            }
            return k;
          });
        }
      }

      return remaining;
    });
  };

  const approveKPI = (kpiId: string, comment?: string) => {
    const now = new Date().toISOString().split('T')[0];
    setKpis(prev =>
      prev.map(item => {
        if (item.id === kpiId) {
          return {
            ...item,
            status: 'approved',
            managerNote: comment || item.managerNote || 'Удирдлагаас баталгаажуулав.',
            managerRating: item.managerRating > 0 ? item.managerRating : item.employeeRating,
            lastUpdated: now,
          };
        }
        return item;
      })
    );
  };

  const rejectKPI = (kpiId: string, comment?: string) => {
    const now = new Date().toISOString().split('T')[0];
    setKpis(prev =>
      prev.map(item => {
        if (item.id === kpiId) {
          return {
            ...item,
            status: 'rejected',
            managerNote: comment || 'Нэмэлт тайлбар, баримт шаардлагатай тул буцаав.',
            lastUpdated: now,
          };
        }
        return item;
      })
    );
  };

  const rebalanceWeights = (userId: string, period: string, updates: { id: string; weight: number }[]) => {
    setKpis(prev =>
      prev.map(item => {
        if (item.userId === userId && item.period === period) {
          const match = updates.find(u => u.id === item.id);
          if (match) {
            return { ...item, weight: match.weight };
          }
        }
        return item;
      })
    );
  };

  const copyTasksFromPreviousMonth = (userId: string, targetPeriod: string): number => {
    const prevPeriod = getPreviousPeriod(targetPeriod);
    const prevItems = kpis.filter(k => k.userId === userId && k.period === prevPeriod);
    if (prevItems.length === 0) return 0;

    const now = new Date().toISOString().split('T')[0];
    const newItems: KPIItem[] = prevItems.map(it => ({
      ...it,
      id: 'kpi-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6),
      period: targetPeriod,
      actual: 0,
      completedWorkList: '',
      employeeRating: 0,
      employeeNote: '',
      managerRating: 0,
      managerNote: '',
      status: 'in_progress',
      lastUpdated: now,
      history: [],
    }));

    setKpis(prev => [...prev, ...newItems]);
    return newItems.length;
  };

  const resetToDefaults = () => {
    localStorage.removeItem(STORAGE_KEY_KPIS);
    localStorage.removeItem(STORAGE_KEY_NARRATIVES);
    localStorage.removeItem(STORAGE_KEY_NOTIFS);
    setKpis(INITIAL_KPIS);
    setNarratives({
      [`${INITIAL_NARRATIVE.userId}_${INITIAL_NARRATIVE.period}`]: INITIAL_NARRATIVE,
    });
    setNotifications(INITIAL_NOTIFICATIONS);
  };

  const markNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const exportDataToJSON = () => {
    const data = {
      kpis,
      narratives,
      notifications,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kpi_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importDataFromJSON = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed.kpis)) {
        setKpis(parsed.kpis);
        if (parsed.narratives) {
          setNarratives(parsed.narratives);
        }
        if (Array.isArray(parsed.notifications)) {
          setNotifications(parsed.notifications);
        }
        return true;
      }
    } catch (err) {
      console.error(err);
    }
    return false;
  };

  return (
    <KPIContext.Provider
      value={{
        users,
        currentUser,
        selectedUser,
        setSelectedUser,
        kpis,
        selectedPeriod,
        setSelectedPeriod,
        narratives,
        updateNarrative,
        notifications,
        isAuthenticated,
        login,
        logout,
        loginAs,
        autoBalanceUnplanned,
        updateKPIActual,
        updateKPIEvaluation,
        addKPIItem,
        editKPIItem,
        deleteKPIItem,
        approveKPI,
        rejectKPI,
        rebalanceWeights,
        copyTasksFromPreviousMonth,
        resetToDefaults,
        markNotificationsAsRead,
        exportDataToJSON,
        importDataFromJSON,
      }}
    >
      {children}
    </KPIContext.Provider>
  );
};

export const useKPI = () => {
  const context = useContext(KPIContext);
  if (!context) {
    throw new Error('useKPI must be used within a KPIProvider');
  }
  return context;
};
