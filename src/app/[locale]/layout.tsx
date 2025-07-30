import { ReactNode } from 'react';
import { I18nProvider, getLocaleFromPath, isRTL } from '@/lib/i18n';
import { usePathname } from 'next/navigation';
import zhMessages from '@/messages/zh.json';
import enMessages from '@/messages/en.json';
import jaMessages from '@/messages/ja.json';
import koMessages from '@/messages/ko.json';
import esMessages from '@/messages/es.json';
import frMessages from '@/messages/fr.json';
import deMessages from '@/messages/de.json';
import itMessages from '@/messages/it.json';
import ptMessages from '@/messages/pt.json';
import ruMessages from '@/messages/ru.json';
import arMessages from '@/messages/ar.json';
import hiMessages from '@/messages/hi.json';
import thMessages from '@/messages/th.json';
import viMessages from '@/messages/vi.json';

// 消息映射
const messagesMap = {
  zh: zhMessages,
  en: enMessages,
  ja: jaMessages,
  ko: koMessages,
  es: esMessages,
  fr: frMessages,
  de: deMessages,
  it: itMessages,
  pt: ptMessages,
  ru: ruMessages,
  ar: arMessages,
  hi: hiMessages,
  th: thMessages,
  vi: viMessages,
};

export default function LocaleLayout({
  children,
  params: { locale },
}: {
  children: ReactNode;
  params: { locale: string };
}) {
  const messages = messagesMap[locale as keyof typeof messagesMap] || messagesMap.zh;
  const rtl = isRTL(locale as any);

  return (
    <html lang={locale} dir={rtl ? 'rtl' : 'ltr'}>
      <body>
        <I18nProvider locale={locale as any} messages={messages}>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}