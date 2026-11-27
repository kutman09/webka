'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import en from '@/locales/en.json';
import ru from '@/locales/ru.json';
import ky from '@/locales/ky.json';

export const LOCALES = { en, ru, ky };
export const LOCALE_CODES = Object.keys(LOCALES);
const STORAGE_KEY = 'nk-locale';

const LanguageContext = createContext(null);

function resolve(dictionary, path) {
  return path.split('.').reduce((node, key) => (node == null ? node : node[key]), dictionary);
}

function initialLocale() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (LOCALE_CODES.includes(saved)) return saved;
  } catch {
    /* storage unavailable */
  }
  const browser = (navigator.language || 'en').slice(0, 2);
  return LOCALE_CODES.includes(browser) ? browser : 'en';
}

export function LanguageProvider({ children }) {
  const [locale, setLocaleState] = useState('en');

  useEffect(() => {
    const detected = initialLocale();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- locale is only known on the client
    if (detected !== 'en') setLocaleState(detected);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next) => {
    if (!LOCALE_CODES.includes(next)) return;
    setLocaleState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* storage unavailable */
    }
  }, []);

  const value = useMemo(() => {
    const dictionary = LOCALES[locale];
    /** t('hero.title') — falls back to English, then to the key itself */
    const t = (path) => resolve(dictionary, path) ?? resolve(en, path) ?? path;
    /** pick({ en, ru, ky }) — chooses the localized field of a data object */
    const pick = (field) => {
      if (field == null || typeof field !== 'object' || Array.isArray(field)) return field;
      return field[locale] ?? field.en;
    };
    return { locale, setLocale, t, pick };
  }, [locale, setLocale]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useI18n() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useI18n must be used inside <LanguageProvider>');
  return context;
}
