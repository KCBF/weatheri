import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import en from './en.json';
import vi from './vi.json';

type Lang = 'en' | 'vi';
const dicts: Record<Lang, any> = { en, vi };

function resolve(obj: any, path: string): string | undefined {
  return path.split('.').reduce((acc, k) => (acc && acc[k] !== undefined ? acc[k] : undefined), obj);
}

function interpolate(str: string, params?: Record<string, string | number>): string {
  if (!params) return str;
  return str.replace(/\{(\w+)\}/g, (_, k) => String(params[k] ?? `{${k}}`));
}

export function translate(lang: Lang, path: string, params?: Record<string, string | number>): string {
  const val = resolve(dicts[lang], path) ?? resolve(dicts.en, path) ?? path;
  return typeof val === 'string' ? interpolate(val, params) : path;
}

interface Ctx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (path: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<Ctx>({ lang: 'en', setLang: () => {}, t: (p) => p });

export function useLanguageState() {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === 'undefined') return 'en';
    return (localStorage.getItem('app_language') as Lang) || 'en';
  });
  useEffect(() => {
    if (typeof window !== 'undefined') localStorage.setItem('app_language', lang);
  }, [lang]);
  const t = useCallback((path: string, params?: Record<string, string | number>) => translate(lang, path, params), [lang]);
  return { lang, setLang: setLangState, t };
}

export function LanguageProvider({ children, value }: { children: ReactNode; value: Ctx }) {
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useT() {
  return useContext(LanguageContext);
}
