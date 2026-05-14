import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type TempUnit = 'C' | 'F';

const TEMP_KEY = '@outfit_oracle_temp_unit';

interface TemperatureContextValue {
  unit: TempUnit;
  setUnit: (u: TempUnit) => void;
  /** Format a raw Celsius value into a display string (no unit suffix). */
  formatTemp: (celsius: number) => string;
  /** Display unit label: "°C" or "°F" */
  unitLabel: string;
}

const TemperatureContext = createContext<TemperatureContextValue | null>(null);

export function TemperatureProvider({ children }: { children: React.ReactNode }) {
  const [unit, setUnitState] = useState<TempUnit>('C');

  useEffect(() => {
    AsyncStorage.getItem(TEMP_KEY).then(v => {
      if (v === 'F') setUnitState('F');
    });
  }, []);

  const setUnit = useCallback((u: TempUnit) => {
    setUnitState(u);
    AsyncStorage.setItem(TEMP_KEY, u).catch(() => {});
  }, []);

  const formatTemp = useCallback((celsius: number) => {
    if (unit === 'F') return String(Math.round(celsius * 9 / 5 + 32));
    return String(Math.round(celsius));
  }, [unit]);

  const unitLabel = unit === 'F' ? '°F' : '°C';

  const value = useMemo(
    () => ({ unit, setUnit, formatTemp, unitLabel }),
    [unit, setUnit, formatTemp, unitLabel],
  );

  return (
    <TemperatureContext.Provider value={value}>
      {children}
    </TemperatureContext.Provider>
  );
}

export function useTempUnit(): TemperatureContextValue {
  const ctx = useContext(TemperatureContext);
  if (!ctx) throw new Error('useTempUnit must be used inside TemperatureProvider');
  return ctx;
}
