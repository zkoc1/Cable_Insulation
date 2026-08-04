import { create } from 'zustand';
import type { IOperatorSession, CableTypeCategory, IMeasurementResult } from '../core/interfaces/cable';
import { CableTypeCategoryEnum } from '../core/interfaces/cable';

interface AppState {
  session: IOperatorSession;
  lang: 'tr' | 'en';
  selectedCable: CableTypeCategory;
  orderNumber: string;
  notes: string;
  measurementCount: number;
  activeScreen: 'login' | 'measurement' | 'result' | 'admin';
  currentResult: IMeasurementResult | null;

  setSession: (session: IOperatorSession) => void;
  logout: () => void;
  setLang: (lang: 'tr' | 'en') => void;
  setSelectedCable: (cable: CableTypeCategory) => void;
  setOrderNumber: (num: string) => void;
  setNotes: (notes: string) => void;
  setMeasurementCount: (n: number) => void;
  setActiveScreen: (screen: 'login' | 'measurement' | 'result' | 'admin') => void;
  setCurrentResult: (res: IMeasurementResult | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  session: { username: '', role: 'OPERATOR', isLoggedIn: false },
  lang: 'tr',
  selectedCable: CableTypeCategoryEnum.XLPE_HV,
  orderNumber: 'LOT-2026-001',
  notes: '',
  measurementCount: 1,
  activeScreen: 'login',
  currentResult: null,

  setSession:          (session)          => set({ session }),
  logout:              ()                 => set({ session: { username: '', role: 'OPERATOR', isLoggedIn: false }, activeScreen: 'login' }),
  setLang:             (lang)             => set({ lang }),
  setSelectedCable:    (selectedCable)    => set({ selectedCable }),
  setOrderNumber:      (orderNumber)      => set({ orderNumber }),
  setNotes:            (notes)            => set({ notes }),
  setMeasurementCount: (measurementCount) => set({ measurementCount }),
  setActiveScreen:     (activeScreen)     => set({ activeScreen }),
  setCurrentResult:    (currentResult)    => set({ currentResult }),
}));
