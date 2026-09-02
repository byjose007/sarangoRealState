import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Language, TranslationDictionary } from '@/i18n/types';
import { es } from '@/i18n/translations/es';
import { en } from '@/i18n/translations/en';

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: TranslationDictionary;
}

const dictionaries: Record<Language, TranslationDictionary> = {
  es,
  en,
};

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: 'es',
      t: es,
      setLanguage: (lang: Language) => {
        if (typeof document !== 'undefined') {
          document.documentElement.lang = lang;
        }
        set({ language: lang, t: dictionaries[lang] || es });
      },
      toggleLanguage: () => {
        const nextLang: Language = get().language === 'es' ? 'en' : 'es';
        if (typeof document !== 'undefined') {
          document.documentElement.lang = nextLang;
        }
        set({ language: nextLang, t: dictionaries[nextLang] || es });
      },
    }),
    {
      name: 'vestra_language_store',
      partialize: (state) => ({ language: state.language }),
      onRehydrateStorage: () => (state) => {
        if (state && typeof document !== 'undefined') {
          document.documentElement.lang = state.language;
          state.t = dictionaries[state.language] || es;
        }
      },
    },
  ),
);
