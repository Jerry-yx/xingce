import { useState, useCallback } from 'react';
import type { DayData } from '../types';
import { loadOrCreateToday, saveDayData, getAllSavedDates, loadDayData, getTodayStr } from '../utils/storage';

export function useAppData() {
  const [todayData, setTodayData] = useState<DayData>(loadOrCreateToday);
  const [activeTab, setActiveTab] = useState<string>('input');

  const updateTodayData = useCallback((updater: (prev: DayData) => DayData) => {
    setTodayData(prev => {
      const next = updater(prev);
      saveDayData(next);
      return next;
    });
  }, []);

  const saveToday = useCallback(() => {
    saveDayData(todayData);
  }, [todayData]);

  const loadHistoryDate = useCallback((dateStr: string): DayData | null => {
    return loadDayData(dateStr);
  }, []);

  const getAllDates = useCallback((): string[] => {
    return getAllSavedDates();
  }, []);

  const refreshToday = useCallback(() => {
    setTodayData(loadOrCreateToday());
  }, []);

  return {
    todayData,
    updateTodayData,
    saveToday,
    loadHistoryDate,
    getAllDates,
    refreshToday,
    activeTab,
    setActiveTab,
    todayStr: getTodayStr(),
  };
}