import * as SecureStore from "expo-secure-store";
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";

import {
  defaultLanguage,
  LanguageCode,
  languages,
  TranslationKey,
  translations,
} from "@/i18n/translations";

type TranslationValues = Record<string, number | string>;

interface I18nContextValue {
  language: LanguageCode;
  languages: typeof languages;
  setLanguage: (language: LanguageCode) => void;
  t: (key: TranslationKey, values?: TranslationValues) => string;
}

const LANGUAGE_STORAGE_KEY = "language";
const I18nContext = createContext<I18nContextValue | undefined>(undefined);

function isLanguageCode(value: string | null): value is LanguageCode {
  return languages.some((language) => language.code === value);
}

function interpolate(template: string, values?: TranslationValues) {
  if (!values) {
    return template;
  }

  return Object.entries(values).reduce(
    (text, [key, value]) => text.split(`{{${key}}}`).join(String(value)),
    template
  );
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(defaultLanguage);

  useEffect(() => {
    async function loadStoredLanguage() {
      const storedLanguage = await SecureStore.getItemAsync(LANGUAGE_STORAGE_KEY);

      if (isLanguageCode(storedLanguage)) {
        setLanguageState(storedLanguage);
      }
    }

    loadStoredLanguage();
  }, []);

  const setLanguage = useCallback((nextLanguage: LanguageCode) => {
    setLanguageState((currentLanguage) => {
      if (currentLanguage === nextLanguage) {
        return currentLanguage;
      }

      void SecureStore.setItemAsync(LANGUAGE_STORAGE_KEY, nextLanguage).catch(() => undefined);

      return nextLanguage;
    });
  }, []);

  const t = useCallback(
    (key: TranslationKey, values?: TranslationValues) => {
      return interpolate(translations[language][key], values);
    },
    [language]
  );

  const value = useMemo<I18nContextValue>(
    () => ({
      language,
      languages,
      setLanguage,
      t,
    }),
    [language, setLanguage, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error("useTranslation must be used within I18nProvider");
  }

  return context;
}
