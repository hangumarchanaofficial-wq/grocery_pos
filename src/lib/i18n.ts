// src/lib/i18n.ts
// ============================================================
// Bilingual translations: English & Sinhala
// Used across receipt, UI, settings
// ============================================================

import type { AppLanguage } from '@/store/settingsStore';

export const translations = {
  en: {
    // Receipt
    invoice: 'INVOICE',
    invNo: 'Inv No',
    date: 'Date',
    terminal: 'Terminal',
    cashier: 'Cashier',
    customer: 'Customer',
    posCustomer: 'POS CUSTOMER',
    description: 'Description',
    unitPrice: 'Unit Price',
    netPrice: 'Net Price',
    amount: 'Amount',
    totalAmount: '****TOTAL AMOUNT****',
    balance: 'BALANCE',
    itemCount: 'Item Count',
    endTime: 'End Time',
    youSaved: 'You Saved',
    thankYou: 'Thank you Please Come again.',
    cash: 'CASH',
    card: 'CARD',
    qr: 'QR',
    visa: 'VISA',
    change: 'Change',
    discount: 'Discount',
    tax: 'Tax',
    subtotal: 'Subtotal',
    qty: 'Qty',
    // UI
    settings: 'Settings',
    storeInfo: 'Store Information',
    language: 'Language',
    english: 'English',
    sinhala: 'සිංහල',
    saveChanges: 'Save Changes',
    storeName: 'Store Name',
    storeNameSi: 'Store Name (Sinhala)',
    address: 'Address',
    addressSi: 'Address (Sinhala)',
    phone: 'Phone',
    receiptFooter: 'Receipt Footer',
    receiptFooterSi: 'Receipt Footer (Sinhala)',
    taxRate: 'Tax Rate (%)',
    terminalId: 'Terminal ID',
    receiptSettings: 'Receipt Settings',
    showSavings: 'Show Savings on Receipt',
    addUser: 'Add User',
    userManagement: 'User Management',
    taxConfig: 'Tax Configuration',
    languageSettings: 'Language & Display',
    selectLanguage: 'Select Language',
    appLanguage: 'Application Language',
    languageHint: 'This will change the entire POS interface and receipt language.',
  },
  si: {
    // Receipt
    invoice: 'ඉන්වොයිසිය',
    invNo: 'ඉන්වො අංකය',
    date: 'දිනය',
    terminal: 'ටර්මිනල්',
    cashier: 'අය කරන්නා',
    customer: 'ගනුදෙනුකරු',
    posCustomer: 'POS ගනුදෙනුකරු',
    description: 'විස්තරය',
    unitPrice: 'සාදන මිල',
    netPrice: 'ශුද්ධ මිල',
    amount: 'ඔට්ටු නාකම',
    totalAmount: '****මුළු මුදල****',
    balance: 'ශේෂය',
    itemCount: 'භාණ්ඩ ගණන',
    endTime: 'අවසන් වේලාව',
    youSaved: 'ඔබ ඉතිරි කළා',
    thankYou: 'ස්තූතියි. නැවත වැඩම කරන්න.',
    cash: 'මුදල්',
    card: 'කාඩ්',
    qr: 'QR',
    visa: 'VISA',
    change: 'ශේෂය',
    discount: 'වට්ටම',
    tax: 'බදු',
    subtotal: 'උප එකතුව',
    qty: 'ප්‍රමාණය',
    // UI
    settings: 'සැකසුම්',
    storeInfo: 'ගබඩා තොරතුරු',
    language: 'භාෂාව',
    english: 'English',
    sinhala: 'සිංහල',
    saveChanges: 'වෙනස්කම් සුරකින්න',
    storeName: 'ගබඩා නාමය',
    storeNameSi: 'ගබඩා නාමය (සිංහල)',
    address: 'ලිපිනය',
    addressSi: 'ලිපිනය (සිංහල)',
    phone: 'දුරකථන',
    receiptFooter: 'රිසිට් පාදය',
    receiptFooterSi: 'රිසිට් පාදය (සිංහල)',
    taxRate: 'බදු අනුපාතය (%)',
    terminalId: 'ටර්මිනල් ID',
    receiptSettings: 'රිසිට් සැකසුම්',
    showSavings: 'රිසිට් හි ඉතිරිකිරීම් දර්ශනය කරන්න',
    addUser: 'පරිශීලකයෙකු එකතු කරන්න',
    userManagement: 'පරිශීලක කළමනාකරණය',
    taxConfig: 'බදු වින්‍යාසය',
    languageSettings: 'භාෂාව සහ දිස්වීම',
    selectLanguage: 'භාෂාව තෝරන්න',
    appLanguage: 'යෙදුම් භාෂාව',
    languageHint: 'මෙය සම්පූර්ණ POS අතුරු මුහුණත සහ රිසිට් භාෂාව වෙනස් කරනු ඇත.',
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

export function t(lang: AppLanguage, key: TranslationKey): string {
  return translations[lang][key] ?? translations.en[key] ?? key;
}

// Hook for easy use in components
export function useT(lang: AppLanguage) {
  return (key: TranslationKey) => t(lang, key);
}
