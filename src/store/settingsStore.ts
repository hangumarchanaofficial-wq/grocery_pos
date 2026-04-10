// src/store/settingsStore.ts
// ============================================================
// Settings Store (Zustand + localStorage persistence)
// Manages language, store info, receipt config
// ============================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AppLanguage = 'en' | 'si'; // English | Sinhala

export interface StoreSettings {
  storeName: string;
  storeNameSi: string;       // Sinhala store name
  address: string;
  addressSi: string;
  phone: string;
  receiptFooter: string;
  receiptFooterSi: string;
  taxRate: number;
  language: AppLanguage;
  terminalId: number;
  showSavingsOnReceipt: boolean;
  receiptCopies: number;
}

interface SettingsStore {
  settings: StoreSettings;
  updateSettings: (patch: Partial<StoreSettings>) => void;
  setLanguage: (lang: AppLanguage) => void;
  resetSettings: () => void;
}

const DEFAULT_SETTINGS: StoreSettings = {
  storeName: 'SAMARANAYAKE\nTHE DISCOUNT STORE',
  storeNameSi: 'සමරනායක\nThe Discount Store',
  address: 'No 99, Rathnapura Rd, Panadura',
  addressSi: 'අංක 99, රත්නපුර පාර, පානදුර',
  phone: '0777436289',
  receiptFooter: 'Thank you Please Come again.',
  receiptFooterSi: 'සංදර්ශනී කරළිය ළඟා වෙන්න.',
  taxRate: 0,
  language: 'en',
  terminalId: 1,
  showSavingsOnReceipt: true,
  receiptCopies: 1,
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS,
      updateSettings: (patch) =>
        set((state) => ({ settings: { ...state.settings, ...patch } })),
      setLanguage: (lang) =>
        set((state) => ({ settings: { ...state.settings, language: lang } })),
      resetSettings: () => set({ settings: DEFAULT_SETTINGS }),
    }),
    { name: 'grocery-pos-settings' }
  )
);
