import { createContext, useContext, ReactNode } from 'react';

// 支持的语言列表
export const locales = ['zh', 'en', 'ja', 'ko', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ar', 'hi', 'th', 'vi'] as const;
export type Locale = typeof locales[number];

// 翻译消息类型
export type Messages = {
  [key: string]: string | Messages;
};

// 国际化上下文
interface I18nContextType {
  locale: Locale;
  t: (key: string, params?: Record<string, string | number>) => string;
  messages: Messages;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

// 国际化提供者
export function I18nProvider({
  children,
  locale,
  messages,
}: {
  children: ReactNode;
  locale: Locale;
  messages: Messages;
}) {
  const t = (key: string, params?: Record<string, string | number>) => {
    const keys = key.split('.');
    let value: any = messages;
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    if (typeof value !== 'string') {
      return key; // 如果找不到翻译，返回key
    }
    
    // 替换参数
    if (params) {
      return value.replace(/\{(\w+)\}/g, (match, param) => {
        return params[param]?.toString() || match;
      });
    }
    
    return value;
  };

  return (
    <I18nContext.Provider value={{ locale, t, messages }}>
      {children}
    </I18nContext.Provider>
  );
}

// 使用国际化的hook
export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

// 从URL中获取语言
export function getLocaleFromPath(path: string): Locale {
  const segments = path.split('/');
  const localeSegment = segments.find(segment => locales.includes(segment as Locale));
  return (localeSegment as Locale) || 'zh';
}

// 检查是否为RTL语言
export function isRTL(locale: Locale): boolean {
  return ['ar'].includes(locale);
}