import { KPIItem, PeriodSummary } from '../types/kpi';

/**
 * Calculates fulfillment rate % based on quantitative target vs actual
 */
export function calculateFulfillmentRate(item: KPIItem): number {
  if (item.target <= 0) {
    return item.actual > 0 ? 100 : (item.employeeRating > 0 ? (item.employeeRating / (item.weight || 1)) * 100 : 0);
  }

  if (item.direction === 'lower_better') {
    if (item.actual <= 0) return 100;
    const rate = (item.target / item.actual) * 100;
    return Math.min(Math.max(rate, 0), 120);
  }

  const rate = (item.actual / item.target) * 100;
  return Math.min(Math.max(rate, 0), 120);
}

/**
 * Calculates item score in percentage points based on formula:
 * (FulfillmentRate% * Weight%) / 100
 */
export function calculateAutomatedItemScore(item: KPIItem): number {
  if (item.target > 0) {
    const fulfillment = calculateFulfillmentRate(item);
    const score = (fulfillment * item.weight) / 100;
    return Number(Math.min(score, item.weight * 1.2).toFixed(2));
  }
  return item.managerRating > 0 ? item.managerRating : item.employeeRating;
}

export const calculateItemScore = calculateAutomatedItemScore;

/**
 * Computes official period summary following UB Group format
 */
export function calculatePeriodSummary(items: KPIItem[], period: string): PeriodSummary {
  const periodItems = items.filter(it => it.period === period);
  
  const coreItems = periodItems.filter(it => it.category === 'CORE_70');
  const unplannedItems = periodItems.filter(it => it.category === 'UNPLANNED_30');

  const coreWeightTotal = coreItems.reduce((acc, curr) => acc + curr.weight, 0);
  const unplannedWeightTotal = unplannedItems.reduce((acc, curr) => acc + curr.weight, 0);

  // Employee ratings total
  const employeeTotalRating = Number(
    periodItems.reduce((acc, curr) => acc + (curr.employeeRating ?? calculateAutomatedItemScore(curr)), 0).toFixed(2)
  );

  // Manager verified ratings total
  const managerTotalRating = Number(
    periodItems.reduce((acc, curr) => acc + (curr.managerRating ?? curr.employeeRating ?? calculateAutomatedItemScore(curr)), 0).toFixed(2)
  );

  // Core & unplanned verified scores
  const coreScore = Number(
    coreItems.reduce((acc, curr) => acc + (curr.managerRating !== undefined && curr.managerRating > 0 ? curr.managerRating : (curr.employeeRating ?? calculateAutomatedItemScore(curr))), 0).toFixed(2)
  );

  const unplannedScore = Number(
    unplannedItems.reduce((acc, curr) => acc + (curr.managerRating !== undefined && curr.managerRating > 0 ? curr.managerRating : (curr.employeeRating ?? calculateAutomatedItemScore(curr))), 0).toFixed(2)
  );

  const totalScore = Number((coreScore + unplannedScore).toFixed(2));

  // Determine grade & bonus
  let grade: 'A+' | 'A' | 'B' | 'C' | 'D' = 'D';
  let gradeTitle = 'Хангалтгүй (Сайжруулах шаардлагатай)';
  let bonusPercentage = 0;

  if (totalScore >= 95) {
    grade = 'A+';
    gradeTitle = 'Онцгой сайн (Зорилтоос давсан)';
    bonusPercentage = Math.min(120, Math.round(totalScore));
  } else if (totalScore >= 85) {
    grade = 'A';
    gradeTitle = 'Маш сайн (Бүрэн хангасан)';
    bonusPercentage = 100;
  } else if (totalScore >= 75) {
    grade = 'B';
    gradeTitle = 'Хангалттай (Зорилтод хүрсэн)';
    bonusPercentage = 80;
  } else if (totalScore >= 60) {
    grade = 'C';
    gradeTitle = 'Дундаж (Анхаарах шаардлагатай)';
    bonusPercentage = 50;
  } else {
    grade = 'D';
    gradeTitle = 'Хангалтгүй';
    bonusPercentage = 0;
  }

  // Weight validity: core == 70% and unplanned == 30%
  const isWeightsValid = Math.abs(coreWeightTotal - 70) < 0.2 && Math.abs(unplannedWeightTotal - 30) < 0.2;

  return {
    period,
    coreWeightTotal: Number(coreWeightTotal.toFixed(1)),
    unplannedWeightTotal: Number(unplannedWeightTotal.toFixed(1)),
    coreScore,
    unplannedScore,
    totalScore,
    employeeTotalRating,
    managerTotalRating,
    grade,
    gradeTitle,
    bonusPercentage,
    isWeightsValid,
  };
}

/**
 * Format numbers with Mongolian currency or decimals
 */
export function formatKPIValue(val: number | undefined | null, unit: string): string {
  if (val === undefined || val === null || isNaN(val)) return '-';
  if (unit === '₮') {
    return new Intl.NumberFormat('mn-MN').format(val) + ' ₮';
  }
  if (unit === '%') {
    return val.toLocaleString('mn-MN', { maximumFractionDigits: 1 }) + '%';
  }
  return new Intl.NumberFormat('mn-MN').format(val) + ' ' + unit;
}

export const MONTH_NAMES_MN = [
  '1-р сар', '2-р сар', '3-р сар', '4-р сар',
  '5-р сар', '6-р сар', '7-р сар', '8-р сар',
  '9-р сар', '10-р сар', '11-р сар', '12-р сар'
];

export function getPeriodLabel(periodStr: string): string {
  const [year, month] = periodStr.split('-');
  const monthIdx = parseInt(month, 10) - 1;
  const monthName = MONTH_NAMES_MN[monthIdx] || `${month}-р сар`;
  return `${year} оны ${monthName}`;
}

/**
 * Standard list of periods starting from 2026-10 and continuing into 2026, 2027 and beyond
 */
export const AVAILABLE_PERIODS = [
  '2026-10',
  '2026-11',
  '2026-12',
  '2027-01',
  '2027-02',
  '2027-03',
  '2027-04',
  '2027-05',
  '2027-06',
  '2027-07',
  '2027-08',
  '2027-09',
  '2027-10',
  '2027-11',
  '2027-12',
  '2026-09',
  '2026-08',
];

/**
 * Find the preceding period (e.g., '2026-11' -> '2026-10')
 */
export function getPreviousPeriod(periodStr: string): string {
  const [yearStr, monthStr] = periodStr.split('-');
  let y = parseInt(yearStr, 10);
  let m = parseInt(monthStr, 10);
  
  m -= 1;
  if (m < 1) {
    m = 12;
    y -= 1;
  }
  return `${y}-${m.toString().padStart(2, '0')}`;
}
