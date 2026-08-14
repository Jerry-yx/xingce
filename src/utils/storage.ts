import type { DayData } from '../types';
import { STORAGE_PREFIX, DEFAULT_DAY_DATA } from './constants';

export function getTodayStr(): string {
  const now = new Date();
  return now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
}

export function formatDate(dateStr: string): string {
  const parts = dateStr.split('-');
  return parts[1] + '/' + parts[2];
}

export function getStorageKey(dateStr: string): string {
  return STORAGE_PREFIX + dateStr;
}

export function loadDayData(dateStr: string): DayData | null {
  const raw = localStorage.getItem(getStorageKey(dateStr));
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveDayData(data: DayData): void {
  localStorage.setItem(getStorageKey(data.date), JSON.stringify(data));
}

export function loadOrCreateToday(): DayData {
  const today = getTodayStr();
  return loadDayData(today) || DEFAULT_DAY_DATA(today);
}

export function getAllSavedDates(): string[] {
  const dates: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(STORAGE_PREFIX)) {
      dates.push(key.slice(STORAGE_PREFIX.length));
    }
  }
  return dates.sort((a, b) => b.localeCompare(a));
}

export function getAllDayData(): DayData[] {
  return getAllSavedDates()
    .map(d => loadDayData(d))
    .filter((d): d is DayData => d !== null);
}

export function getHistoricalValues(field: string): string[] {
  const seen = new Set<string>();
  getAllDayData().forEach(data => {
    const val = getNestedValue(data, field);
    if (val && typeof val === 'string' && val.trim()) {
      seen.add(val.trim());
    }
  });
  return Array.from(seen).sort();
}

/**
 * 获取数组字段的历史去重值
 * 支持格式：figure.newPatterns.value, figure.errorPatterns.value, number.errorTypes.type, calc.errorTypes.type, number.skills.description
 */
export function getHistoricalArrayValues(path: string): string[] {
  const seen = new Set<string>();
  const parts = path.split('.');
  const arrayField = parts.slice(0, -1).join('.');
  const valueField = parts[parts.length - 1];
  getAllDayData().forEach(data => {
    const arr = getNestedValue(data, arrayField);
    if (Array.isArray(arr)) {
      arr.forEach((item: unknown) => {
        if (item && typeof item === 'object') {
          const v = (item as Record<string, unknown>)[valueField];
          if (v && typeof v === 'string' && v.trim()) {
            seen.add(v.trim());
          }
        }
      });
    }
  });
  return Array.from(seen).sort();
}

/**
 * 获取图推新规律和错误规律的去重合集
 */
export function getAllFigurePatterns(): string[] {
  const seen = new Set<string>();
  getAllDayData().forEach(data => {
    [...(data.figure?.newPatterns || []), ...(data.figure?.errorPatterns || [])].forEach(p => {
      if (p.value?.trim()) seen.add(p.value.trim());
    });
  });
  return Array.from(seen);
}

function getNestedValue(obj: unknown, path: string): unknown {
  return path.split('.').reduce((current: unknown, key: string) => {
    if (current && typeof current === 'object') {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}
