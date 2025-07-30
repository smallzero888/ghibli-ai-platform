import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles, Zap, Palette, Download, ArrowRight, Star, Users, Image } from 'lucide-react'

export default function HomePage({ params }: { params: { locale: string } }) {
  const locale = params.locale;
  
  // Multi-language content
  const getContent = (locale: string) => {
    const contentMap: Record<string, any> = {
      zh: {
        title: '吉卜力AI图片生成器',
        subtitle: '使用AI技术生成精美的吉卜力风格图片，让您的创意变成现实',
        badge: 'AI 驱动的艺术创作',
        buttons: { generate: '开始创作', gallery: '浏览画廊' },
        features: [
          { icon: Zap, title: '快速生成', description: '几秒钟内生成高质量的吉卜力风格图片' },
          { icon: Palette, title: '多种风格', description: '支持多种吉卜力风格，满足不同创作需求' },
          { icon: Download, title: '高质量输出', description: '生成高分辨率图片，支持免费下载' }
        ]
      },
      en: {
        title: 'Ghibli AI Image Generator',
        subtitle: 'Create beautiful Ghibli-style images using AI technology and bring your creativity to life',
        badge: 'AI-Powered Art Creation',
        buttons: { generate: 'Start Creating', gallery: 'Browse Gallery' },
        features: [
          { icon: Zap, title: 'Fast Generation', description: 'Generate high-quality Ghibli-style images in seconds' },
          { icon: Palette, title: 'Multiple Styles', description: 'Support various Ghibli styles for different creative needs' },
          { icon: Download, title: 'High Quality', description: 'Generate high-resolution images with free download' }
        ]
      },
      ja: {
        title: 'ジブリAI画像生成器',
        subtitle: 'AI技術を使用して美しいジブリスタイルの画像を作成し、あなたの創造性を実現します',
        badge: 'AI駆動のアート創作',
        buttons: { generate: '作成開始', gallery: 'ギャラリーを見る' },
        features: [
          { icon: Zap, title: '高速生成', description: '数秒で高品質なジブリスタイルの画像を生成' },
          { icon: Palette, title: '多様なスタイル', description: '様々なジブリスタイルをサポート' },
          { icon: Download, title: '高品質出力', description: '高解像度画像を無料でダウンロード' }
        ]
      },
      ko: {
        title: '지브리 AI 이미지 생성기',
        subtitle: 'AI 기술을 사용하여 아름다운 지브리 스타일 이미지를 만들고 창의성을 실현하세요',
        badge: 'AI 기반 아트 창작',
        buttons: { generate: '생성 시작', gallery: '갤러리 보기' },
        features: [
          { icon: Zap, title: '빠른 생성', description: '몇 초 만에 고품질 지브리 스타일 이미지 생성' },
          { icon: Palette, title: '다양한 스타일', description: '다양한 지브리 스타일 지원' },
          { icon: Download, title: '고품질 출력', description: '고해상도 이미지 무료 다운로드' }
        ]
      },
      es: {
        title: 'Generador de Imágenes AI Ghibli',
        subtitle: 'Crea hermosas imágenes estilo Ghibli usando tecnología AI y da vida a tu creatividad',
        badge: 'Creación de Arte con IA',
        buttons: { generate: 'Comenzar a Crear', gallery: 'Ver Galería' },
        features: [
          { icon: Zap, title: 'Generación Rápida', description: 'Genera imágenes estilo Ghibli de alta calidad en segundos' },
          { icon: Palette, title: 'Múltiples Estilos', description: 'Soporte para varios estilos Ghibli' },
          { icon: Download, title: 'Alta Calidad', description: 'Genera imágenes de alta resolución con descarga gratuita' }
        ]
      },
      fr: {
        title: 'Générateur d\'Images IA Ghibli',
        subtitle: 'Créez de belles images de style Ghibli en utilisant la technologie IA et donnez vie à votre créativité',
        badge: 'Création d\'Art par IA',
        buttons: { generate: 'Commencer à Créer', gallery: 'Voir la Galerie' },
        features: [
          { icon: Zap, title: 'Génération Rapide', description: 'Générez des images de style Ghibli de haute qualité en quelques secondes' },
          { icon: Palette, title: 'Styles Multiples', description: 'Support de divers styles Ghibli' },
          { icon: Download, title: 'Haute Qualité', description: 'Générez des images haute résolution avec téléchargement gratuit' }
        ]
      },
      de: {
        title: 'Ghibli AI Bildgenerator',
        subtitle: 'Erstellen Sie wunderschöne Bilder im Ghibli-Stil mit KI-Technologie',
        badge: 'KI-gesteuerte Kunstschöpfung',
        buttons: { generate: 'Erstellen Beginnen', gallery: 'Galerie Ansehen' },
        features: [
          { icon: Zap, title: 'Schnelle Generierung', description: 'Erstellen Sie hochwertige Ghibli-Stil Bilder in Sekunden' },
          { icon: Palette, title: 'Mehrere Stile', description: 'Unterstützung verschiedener Ghibli-Stile' },
          { icon: Download, title: 'Hohe Qualität', description: 'Erstellen Sie hochauflösende Bilder mit kostenlosem Download' }
        ]
      },
      it: {
        title: 'Generatore di Immagini AI Ghibli',
        subtitle: 'Crea bellissime immagini in stile Ghibli usando la tecnologia AI',
        badge: 'Creazione Artistica con IA',
        buttons: { generate: 'Inizia a Creare', gallery: 'Vedi Galleria' },
        features: [
          { icon: Zap, title: 'Generazione Veloce', description: 'Genera immagini in stile Ghibli di alta qualità in secondi' },
          { icon: Palette, title: 'Stili Multipli', description: 'Supporto per vari stili Ghibli' },
          { icon: Download, title: 'Alta Qualità', description: 'Genera immagini ad alta risoluzione con download gratuito' }
        ]
      }
    };
    
    return contentMap[locale] || contentMap.en;
  };

  const t = getContent(locale);

  return (
    <div className="min-h-screen bg-gradient-to-br from-ghibli-cream-50 via-ghibli-green-50 to-ghibli-blue-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-ghibli-green-100 rounded-full text-ghibli-green-700 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4 mr-2" />
            {t.badge}
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            🎨 {t.title}
          </h1>
          
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            {t.subtitle}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button asChild size="lg" variant="ghibli" className="text-lg px-8 py-6">
              <Link href={`/${params.locale}/generate`}>
                <Sparkles className="w-5 h-5 mr-2" />
                {t.buttons.generate}
              </Link>
            </Button>
            
            <Button asChild size="lg" variant="outline" className="text-lg px-8 py-6">
              <Link href={`/${params.locale}/gallery`}>
                <Palette className="w-5 h-5 mr-2" />
                {t.buttons.gallery}
              </Link>
            </Button>
          </div>
        </div>

        {/* 特色功能 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {t.features.map((feature: any, index: number) => (
            <Card key={index} className="text-center hover:shadow-xl hover:scale-105 transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="w-20 h-20 bg-gradient-to-br from-ghibli-green-100 to-ghibli-blue-100 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg">
                  <feature.icon className="w-10 h-10 text-ghibli-green-600" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-800">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-lg text-gray-600 leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 统计数据 */}
        <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 mb-20 border border-white/20 shadow-xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-ghibli-green-600">10K+</div>
              <div className="text-gray-600 font-medium">
                {locale === 'zh' ? '生成图片' : locale === 'ja' ? '生成画像' : locale === 'ko' ? '생성된 이미지' : 'Generated Images'}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-ghibli-blue-600">5K+</div>
              <div className="text-gray-600 font-medium">
                {locale === 'zh' ? '活跃用户' : locale === 'ja' ? 'アクティブユーザー' : locale === 'ko' ? '활성 사용자' : 'Active Users'}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-ghibli-green-600">4.9</div>
              <div className="text-gray-600 font-medium flex items-center justify-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                {locale === 'zh' ? '用户评分' : locale === 'ja' ? 'ユーザー評価' : locale === 'ko' ? '사용자 평점' : 'User Rating'}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-ghibli-blue-600">24/7</div>
              <div className="text-gray-600 font-medium">
                {locale === 'zh' ? '在线服务' : locale === 'ja' ? 'オンラインサービス' : locale === 'ko' ? '온라인 서비스' : 'Online Service'}
              </div>
            </div>
          </div>
        </div>

        {/* 示例作品展示 */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {locale === 'zh' ? '✨ 精选作品' : locale === 'ja' ? '✨ 注目作品' : locale === 'ko' ? '✨ 주요 작품' : '✨ Featured Artwork'}
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            {locale === 'zh' ? '看看其他用户创作的精彩作品' : locale === 'ja' ? '他のユーザーが作成した素晴らしい作品をご覧ください' : locale === 'ko' ? '다른 사용자들이 만든 멋진 작품들을 확인해보세요' : 'Check out amazing artwork created by our community'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="group relative aspect-square rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <img
                src={`https://picsum.photos/400/400?random=${i + 10}`}
                alt={`Sample artwork ${i}`}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <p className="text-sm font-medium">
                    {locale === 'zh' ? '吉卜力风格艺术作品' : locale === 'ja' ? 'ジブリスタイルアート' : locale === 'ko' ? '지브리 스타일 아트' : 'Ghibli Style Artwork'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 行动号召 */}
        <div className="text-center bg-gradient-to-r from-ghibli-green-500 to-ghibli-blue-500 rounded-3xl p-12 text-white shadow-2xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {locale === 'zh' ? '🎨 开始您的创作之旅' : locale === 'ja' ? '🎨 創作の旅を始めよう' : locale === 'ko' ? '🎨 창작 여행을 시작하세요' : '🎨 Start Your Creative Journey'}
          </h2>
          <p className="text-xl mb-8 opacity-90">
            {locale === 'zh' ? '加入数千名创作者，用AI创造属于您的吉卜力风格艺术作品' : locale === 'ja' ? '数千人のクリエイターと一緒に、AIでジブリスタイルのアート作品を作成しましょう' : locale === 'ko' ? '수천 명의 창작자들과 함께 AI로 지브리 스타일 예술 작품을 만들어보세요' : 'Join thousands of creators and make your own Ghibli-style artwork with AI'}
          </p>
          <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-6 bg-white text-ghibli-green-600 hover:bg-gray-50">
            <Link href={`/${params.locale}/generate`}>
              {locale === 'zh' ? '立即开始创作' : locale === 'ja' ? '今すぐ作成開始' : locale === 'ko' ? '지금 시작하기' : 'Start Creating Now'}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
        </div>


      </div>
    </div>
  );
}
