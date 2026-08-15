import type { DayData, Paper } from '../types';
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

/**
 * 判断套卷是否为空（所有输入框都没有输入）
 */
function isPaperEmpty(p: Paper, isEssay = false): boolean {
  if (isEssay) {
    return (
      p.totalQuestions === 0 &&
      p.timeUsed === 0 &&
      !p.overTime?.trim() &&
      !p.scoreKeywords &&
      !p.missKeywordsCount &&
      !p.missKeywords?.trim()
    );
  }
  return (
    p.totalQuestions === 0 &&
    p.timeUsed === 0 &&
    p.errorCount === 0 &&
    !p.circleQuestions?.trim() &&
    !p.wrongQuestions?.trim() &&
    !p.starQuestions?.trim() &&
    !p.fillErrorCount &&
    !p.centerErrorCount &&
    !p.fillErrorQuestions?.trim() &&
    !p.centerErrorQuestions?.trim() &&
    !p.centerCircleQuestions?.trim() &&
    !p.guessRightQuestions?.trim()
  );
}

/**
 * 清洗 DayData，移除所有空输入项（所有输入框都没有输入的可添加删除组合）
 * 包括：套卷组合、类型、技巧、词组对比、计算优化、规律等
 */
export function cleanDayData(data: DayData): DayData {
  const clean = { ...data };

  // 言语理解
  clean.speech = {
    ...clean.speech,
    papers: clean.speech.papers.filter((p) => !isPaperEmpty(p)),
    articleTypes: clean.speech.articleTypes.filter((a) => a.errorCount > 0),
    wordPairs: clean.speech.wordPairs.filter((wp) =>
      [wp.signalWord, wp.selectedWord, wp.compareWord, wp.note].some(Boolean),
    ),
    questionTypeSkills: clean.speech.questionTypeSkills.filter((qt) => qt.skill?.trim()),
  };

  // 逻辑判断
  clean.logic = {
    ...clean.logic,
    papers: clean.logic.papers.filter((p) => !isPaperEmpty(p)),
    questionTypeSkills: clean.logic.questionTypeSkills.filter((qt) => qt.skill?.trim()),
  };

  // 图推
  clean.figure = {
    ...clean.figure,
    papers: clean.figure.papers.filter((p) => !isPaperEmpty(p)),
    newPatterns: clean.figure.newPatterns.filter((p) => p.value?.trim()),
    errorPatterns: clean.figure.errorPatterns.filter((p) => p.value?.trim()),
  };

  // 资料分析
  clean.calc = {
    ...clean.calc,
    papers: clean.calc.papers.filter((p) => !isPaperEmpty(p)),
    errorTypes: clean.calc.errorTypes.filter((e) => e.type?.trim()),
    optimizations: clean.calc.optimizations.filter(
      (o) => o.questionNum || o.originalSteps || o.optimizedSteps,
    ),
  };

  // 数量关系
  clean.number = {
    ...clean.number,
    papers: clean.number.papers.filter((p) => !isPaperEmpty(p)),
    errorTypes: clean.number.errorTypes.filter((e) => e.type?.trim()),
  };

  // 申论对策
  clean.essay = {
    ...clean.essay,
    papers: clean.essay.papers.filter((p) => !isPaperEmpty(p, true)),
  };

  return clean;
}

export function saveDayData(data: DayData): void {
  localStorage.setItem(getStorageKey(data.date), JSON.stringify(cleanDayData(data)));
}

/**
 * 确保加载的数据中，每个组合至少有一个默认空条目，方便用户直接填写
 */
export function ensureDefaults(data: DayData): DayData {
  const defaults = DEFAULT_DAY_DATA(data.date);
  return {
    ...data,
    speech: {
      ...data.speech,
      papers: data.speech.papers?.length > 0 ? data.speech.papers : defaults.speech.papers,
      articleTypes: data.speech.articleTypes?.length > 0 ? data.speech.articleTypes : defaults.speech.articleTypes,
      wordPairs: data.speech.wordPairs?.length > 0 ? data.speech.wordPairs : defaults.speech.wordPairs,
      questionTypeSkills: data.speech.questionTypeSkills?.length > 0 ? data.speech.questionTypeSkills : defaults.speech.questionTypeSkills,
    },
    logic: {
      ...data.logic,
      papers: data.logic.papers?.length > 0 ? data.logic.papers : defaults.logic.papers,
      questionTypeSkills: data.logic.questionTypeSkills?.length > 0 ? data.logic.questionTypeSkills : defaults.logic.questionTypeSkills,
    },
    figure: {
      ...data.figure,
      papers: data.figure.papers?.length > 0 ? data.figure.papers : defaults.figure.papers,
      newPatterns: data.figure.newPatterns?.length > 0 ? data.figure.newPatterns : defaults.figure.newPatterns,
      errorPatterns: data.figure.errorPatterns?.length > 0 ? data.figure.errorPatterns : defaults.figure.errorPatterns,
    },
    calc: {
      ...data.calc,
      papers: data.calc.papers?.length > 0 ? data.calc.papers : defaults.calc.papers,
      errorTypes: data.calc.errorTypes?.length > 0 ? data.calc.errorTypes : defaults.calc.errorTypes,
      optimizations: data.calc.optimizations?.length > 0 ? data.calc.optimizations : defaults.calc.optimizations,
    },
    number: {
      ...data.number,
      papers: data.number.papers?.length > 0 ? data.number.papers : defaults.number.papers,
      errorTypes: data.number.errorTypes?.length > 0 ? data.number.errorTypes : defaults.number.errorTypes,
    },
    essay: {
      ...data.essay,
      papers: data.essay.papers?.length > 0 ? data.essay.papers : defaults.essay.papers,
    },
  };
}

export function loadOrCreateToday(): DayData {
  const today = getTodayStr();
  const loaded = loadDayData(today);
  if (!loaded) return DEFAULT_DAY_DATA(today);
  return ensureDefaults(loaded);
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
 * 支持格式：figure.newPatterns.value, figure.errorPatterns.value, number.errorTypes.type, calc.errorTypes.type, logic.questionTypeSkills.questionType, speech.questionTypeSkills.questionType
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
