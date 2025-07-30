import { Navigation } from '@/components/layout/navigation'
import { Providers } from '@/components/providers'

export const metadata = {
  title: '吉卜力AI图片生成器 - 免费在线AI艺术创作平台',
  description: '使用AI技术生成精美的吉卜力风格图片，支持多种AI模型，免费在线创作属于你的艺术作品',
  keywords: 'AI图片生成,吉卜力风格,人工智能艺术,免费AI工具,图片创作',
};

export default function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  return (
    <html lang={locale}>
      <body className="font-sans antialiased">
        <Providers>
          <Navigation locale={locale} />
          <main className="min-h-screen">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
