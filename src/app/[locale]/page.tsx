import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles, Zap, Palette, Download, ArrowRight, Star, Users, Image } from 'lucide-react'
import { useI18n } from '@/hooks/use-i18n'

export default function HomePage({ params }: { params: { locale: string } }) {
  const { t, nav } = useI18n()
  const locale = params.locale;
  
  // 多语言内容
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
        ],
        stats: {
          images: '生成图片',
          users: '活跃用户',
          rating: '用户评分',
          service: '在线服务'
        },
        featured: {
          title: '✨ 精选作品',
          description: '看看其他用户创作的精彩作品',
          artwork: '吉卜力风格艺术作品'
        },
        cta: {
          title: '🎨 开始您的创作之旅',
          description: '加入数千名创作者，用AI创造属于您的吉卜力风格艺术作品',
          button: '立即开始创作'
        }
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
        ],
        stats: {
          images: 'Generated Images',
          users: 'Active Users',
          rating: 'User Rating',
          service: 'Online Service'
        },
        featured: {
          title: '✨ Featured Artwork',
          description: 'Check out amazing artwork created by our community',
          artwork: 'Ghibli Style Artwork'
        },
        cta: {
          title: '🎨 Start Your Creative Journey',
          description: 'Join thousands of creators and make your own Ghibli-style artwork with AI',
          button: 'Start Creating Now'
        }
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
        ],
        stats: {
          images: '生成画像',
          users: 'アクティブユーザー',
          rating: 'ユーザー評価',
          service: 'オンラインサービス'
        },
        featured: {
          title: '✨ 注目作品',
          description: '他のユーザーが作成した素晴らしい作品をご覧ください',
          artwork: 'ジブリスタイルアート'
        },
        cta: {
          title: '🎨 創作の旅を始めよう',
          description: '数千人のクリエイターと一緒に、AIでジブリスタイルのアート作品を作成しましょう',
          button: '今すぐ作成開始'
        }
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
        ],
        stats: {
          images: '생성된 이미지',
          users: '활성 사용자',
          rating: '사용자 평점',
          service: '온라인 서비스'
        },
        featured: {
          title: '✨ 주요 작품',
          description: '다른 사용자들이 만든 멋진 작품들을 확인해보세요',
          artwork: '지브리 스타일 아트'
        },
        cta: {
          title: '🎨 창작 여행을 시작하세요',
          description: '수천 명의 창작자들과 함께 AI로 지브리 스타일 예술 작품을 만들어보세요',
          button: '지금 시작하기'
        }
      },
      es: {
        title: 'Generador de Imágenes AI Ghibli',
        subtitle: 'Crea hermosas imágenes estilo Ghibli usando tecnología AI y da vida a tu creatividad',
        badge: 'Creación de Arte con IA',
        buttons: { generate: 'Comenzar a Crear', gallery: 'Ver Galería' },
        features: [
          { icon: Zap, title: 'Generación Rápida', description: 'Genera imágenes de alta calidad estilo Ghibli en segundos' },
          { icon: Palette, title: 'Múltiples Estilos', description: 'Admite varios estilos Ghibli para diferentes necesidades creativas' },
          { icon: Download, title: 'Alta Calidad', description: 'Genera imágenes de alta resolución con descarga gratuita' }
        ],
        stats: {
          images: 'Imágenes Generadas',
          users: 'Usuarios Activos',
          rating: 'Calificación de Usuario',
          service: 'Servicio en Línea'
        },
        featured: {
          title: '✨ Arte Destacado',
          description: 'Descubre increíbles obras de arte creadas por nuestra comunidad',
          artwork: 'Arte Estilo Ghibli'
        },
        cta: {
          title: '🎨 Comienza tu Viaje Creativo',
          description: 'Únete a miles de creadores y haz tu propio arte estilo Ghibli con IA',
          button: 'Comenzar a Crear Ahora'
        }
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
        ],
        stats: {
          images: 'Images Générées',
          users: 'Utilisateurs Actifs',
          rating: 'Évaluation Utilisateur',
          service: 'Service en Ligne'
        },
        featured: {
          title: '✨ Œuvres en Vedette',
          description: 'Découvrez des œuvres d\'art incroyables créées par notre communauté',
          artwork: 'Art Style Ghibli'
        },
        cta: {
          title: '🎨 Commencez votre Voyage Créatif',
          description: 'Rejoignez des milliers de créateurs et créez votre propre art style Ghibli avec IA',
          button: 'Commencer à Créer Maintenant'
        }
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
        ],
        stats: {
          images: 'Generierte Bilder',
          users: 'Aktive Benutzer',
          rating: 'Benutzerbewertung',
          service: 'Online-Service'
        },
        featured: {
          title: '✨ Ausgewählte Kunstwerke',
          description: 'Entdecken Sie erstaunliche Kunstwerke, die von unserer Gemeinschaft erstellt wurden',
          artwork: 'Ghibli-Stil Kunst'
        },
        cta: {
          title: '🎨 Beginnen Sie Ihre Kreative Reise',
          description: 'Schließen Sie sich Tausenden von Creatoren an und erstellen Sie Ihre eigene Ghibli-Stil Kunst mit KI',
          button: 'Jetzt Erstellen Beginnen'
        }
      },
      ru: {
        title: 'Генератор изображений Ghibli AI',
        subtitle: 'Создавайте красивые изображения в стиле Ghibli с помощью технологии ИИ',
        badge: 'Создание искусства с помощью ИИ',
        buttons: { generate: 'Начать создание', gallery: 'Просмотреть галерею' },
        features: [
          { icon: Zap, title: 'Быстрое создание', description: 'Генерируйте высококачественные изображения в стиле Ghibli за секунды' },
          { icon: Palette, title: 'Множество стилей', description: 'Поддержка различных стилей Ghibli для разных творческих потребностей' },
          { icon: Download, title: 'Высокое качество', description: 'Генерируйте изображения высокого разрешения с бесплатной загрузкой' }
        ],
        stats: {
          images: 'Сгенерированные изображения',
          users: 'Активные пользователи',
          rating: 'Рейтинг пользователей',
          service: 'Онлайн-сервис'
        },
        featured: {
          title: '✨ Избранные произведения',
          description: 'Посмотрите удивительные произведения искусства, созданные нашим сообществом',
          artwork: 'Искусство в стиле Ghibli'
        },
        cta: {
          title: '🎨 Начните свое творческое путешествие',
          description: 'Присоединяйтесь к тысячам создателей и создавайте свои произведения в стиле Ghibli с помощью ИИ',
          button: 'Начать создание сейчас'
        }
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
        ],
        stats: {
          images: 'Immagini Generate',
          users: 'Utenti Attivi',
          rating: 'Valutazione Utente',
          service: 'Servizio Online'
        },
        featured: {
          title: '✨ Opere in Evidenza',
          description: 'Scopri opere d\'arte incredibili create dalla nostra comunità',
          artwork: 'Arte in Stile Ghibli'
        },
        cta: {
          title: '🎨 Inizia il Tuo Viaggio Creativo',
          description: 'Unisciti a migliaia di creatori e crea la tua arte in stile Ghibli con IA',
          button: 'Inizia a Creare Ora'
        }
      },
      pt: {
        title: 'Gerador de Imagens AI Ghibli',
        subtitle: 'Crie imagens bonitas no estilo Ghibli usando tecnologia AI',
        badge: 'Criação de Arte com IA',
        buttons: { generate: 'Começar a Criar', gallery: 'Ver Galeria' },
        features: [
          { icon: Zap, title: 'Geração Rápida', description: 'Gere imagens de alta qualidade no estilo Ghibli em segundos' },
          { icon: Palette, title: 'Múltiplos Estilos', description: 'Suporte para vários estilos Ghibli' },
          { icon: Download, title: 'Alta Qualidade', description: 'Gere imagens de alta resolução com download gratuito' }
        ],
        stats: {
          images: 'Imagens Geradas',
          users: 'Usuários Ativos',
          rating: 'Avaliação do Usuário',
          service: 'Serviço Online'
        },
        featured: {
          title: '✨ Obras em Destaque',
          description: 'Confira obras de arte incríveis criadas por nossa comunidade',
          artwork: 'Arte em Estilo Ghibli'
        },
        cta: {
          title: '🎨 Comece sua Jornada Criativa',
          description: 'Junte-se a milhares de criadores e faça sua própria arte no estilo Ghibli com IA',
          button: 'Começar a Criar Agora'
        }
      },
      ar: {
        title: 'مولد صور Ghibli AI',
        subtitle: 'أنشئ صورًا جميلة بأسلوب Ghibli باستخدام تقنية AI',
        badge: 'إنشاء الفن بالذكاء الاصطناعي',
        buttons: { generate: 'ابدأ الإنشاء', gallery: 'تصفح المعرض' },
        features: [
          { icon: Zap, title: 'إنشاء سريع', description: 'أنشئ صورًا عالية الجودة بأسلوب Ghibli في ثوانٍ' },
          { icon: Palette, title: 'أنماط متعددة', description: 'دعم أنماط Ghibli المختلفة للاحتياجات الإبداعية المختلفة' },
          { icon: Download, title: 'جودة عالية', description: 'أنشئ صورًا عالية الدقة مع تنزيل مجاني' }
        ],
        stats: {
          images: 'الصور المُنشأة',
          users: 'المستخدمون النشطون',
          rating: 'تقييم المستخدم',
          service: 'الخدمة عبر الإنترنت'
        },
        featured: {
          title: '✨ أعمال فنية مميزة',
          description: 'تحقق من الأعمال الفنية الرائعة التي أنشأتها مجتمعنا',
          artwork: 'فن بأسلوب Ghibli'
        },
        cta: {
          title: '🎨 ابدأ رحلتك الإبداعية',
          description: 'انضم إلى آلاف المبدعين واصنع فنك الخاص بأسلوب Ghibli باستخدام الذكاء الاصطناعي',
          button: 'ابدأ الإنشاء الآن'
        }
      },
      hi: {
        title: 'घिबली AI इमेज जनरेटर',
        subtitle: 'AI तकनीक का उपयोग करके सुंदर घिबली स्टाइल इमेज बनाएं',
        badge: 'AI द्वारा संचालित कला निर्माण',
        buttons: { generate: 'निर्माण शुरू करें', gallery: 'गैलरी देखें' },
        features: [
          { icon: Zap, title: 'तेज निर्माण', description: 'सेकंड में उच्च गुणवत्ता वाली घिबली स्टाइल इमेज बनाएं' },
          { icon: Palette, title: 'कई शैलियां', description: 'विभिन्न रचनात्मक आवश्यकताओं के लिए विभिन्न घिबली शैलियों का समर्थन' },
          { icon: Download, title: 'उच्च गुणवत्ता', description: 'मुफ्त डाउनलोड के साथ उच्च रिज़ॉल्यूशन इमेज बनाएं' }
        ],
        stats: {
          images: 'जनरेट की गई इमेज',
          users: 'सक्रिय उपयोगकर्ता',
          rating: 'उपयोगकर्ता रेटिंग',
          service: 'ऑनलाइन सेवा'
        },
        featured: {
          title: '✨ विशेष कलाकृतियां',
          description: 'हमारे समुदाय द्वारा बनाई गई अद्भुत कलाकृतियां देखें',
          artwork: 'घिबली स्टाइल कला'
        },
        cta: {
          title: '🎨 अपनी रचनात्मक यात्रा शुरू करें',
          description: 'हजारों निर्माताओं में शामिल हों और AI के साथ अपनी खुद की घिबली स्टाइल कला बनाएं',
          button: 'अभी निर्माण शुरू करें'
        }
      },
      th: {
        title: 'เครื่องสร้างภาพ AI สไตล์ Ghibli',
        subtitle: 'สร้างภาพสวยงามสไตล์ Ghibli โดยใช้เทคโนโลยี AI',
        badge: 'การสร้างศิลปะโดย AI',
        buttons: { generate: 'เริ่มสร้าง', gallery: 'ดูแกลเลอรี่' },
        features: [
          { icon: Zap, title: 'การสร้างอย่างรวดเร็ว', description: 'สร้างภาพคุณภาพสูงสไตล์ Ghibli ในไม่กี่วินาที' },
          { icon: Palette, title: 'หลายสไตล์', description: 'รองรับสไตล์ Ghibli หลากหลายสำหรับความต้องการสร้างสรรค์' },
          { icon: Download, title: 'คุณภาพสูง', description: 'สร้างภาพความละเอียดสูงพร้อมดาวน์โหลดฟรี' }
        ],
        stats: {
          images: 'ภาพที่สร้าง',
          users: 'ผู้ใช้งานที่ใช้งานอยู่',
          rating: 'คะแนนจากผู้ใช้',
          service: 'บริการออนไลน์'
        },
        featured: {
          title: '✨ ผลงานที่โดดเด่น',
          description: 'ดูผลงานศิลปะที่น่าทึ่งที่สร้างโดยชุมชนของเรา',
          artwork: 'ศิลปะสไตล์ Ghibli'
        },
        cta: {
          title: '🎨 เริ่มต้นการเดินทางสร้างสรรค์ของคุณ',
          description: 'เข้าร่วมกับผู้สร้างสรรค์หลายพันคนและสร้างผลงานศิลปะสไตล์ Ghibli ของคุณเองด้วย AI',
          button: 'เริ่มสร้างตอนนี้'
        }
      },
      vi: {
        title: 'Trình Tạo Ảnh AI Ghibli',
        subtitle: 'Tạo những bức ảnh đẹp theo phong cách Ghibli bằng công nghệ AI',
        badge: 'Sáng tạo nghệ thuật bằng AI',
        buttons: { generate: 'Bắt đầu Tạo', gallery: 'Xem Thư viện' },
        features: [
          { icon: Zap, title: 'Tạo Nhanh', description: 'Tạo ảnh chất lượng cao phong cách Ghibli trong vài giây' },
          { icon: Palette, title: 'Nhiều Phong cách', description: 'Hỗ trợ nhiều phong cách Ghibli cho các nhu cầu sáng tạo khác nhau' },
          { icon: Download, title: 'Chất lượng Cao', description: 'Tạo ảnh độ phân giải cao với tải xuống miễn phí' }
        ],
        stats: {
          images: 'Ảnh đã Tạo',
          users: 'Người dùng Hoạt động',
          rating: 'Đánh giá Người dùng',
          service: 'Dịch vụ Trực tuyến'
        },
        featured: {
          title: '✨ Tác phẩm Nổi bật',
          description: 'Xem các tác phẩm nghệ thuật tuyệt vời được tạo bởi cộng đồng của chúng tôi',
          artwork: 'Nghệ thuật Phong cách Ghibli'
        },
        cta: {
          title: '🎨 Bắt đầu Hành trình Sáng tạo của Bạn',
          description: 'Tham gia cùng hàng nghìn người sáng tạo và tạo ra tác phẩm phong cách Ghibli của riêng bạn với AI',
          button: 'Bắt đầu Tạo Ngay'
        }
      }
    };
    
    return contentMap[locale] || contentMap.en;
  };

  const content = getContent(locale);

  return (
    <div className="min-h-screen bg-gradient-to-br from-ghibli-cream-50 via-ghibli-green-50 to-ghibli-blue-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-ghibli-green-100 rounded-full text-ghibli-green-700 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4 mr-2" />
            {content.badge}
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            🎨 {content.title}
          </h1>
          
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            {content.subtitle}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button asChild size="lg" variant="ghibli" className="text-lg px-8 py-6">
              <Link href={`/${params.locale}/generate`}>
                <Sparkles className="w-5 h-5 mr-2" />
                {content.buttons.generate}
              </Link>
            </Button>
            
            <Button asChild size="lg" variant="outline" className="text-lg px-8 py-6">
              <Link href={`/${params.locale}/gallery`}>
                <Palette className="w-5 h-5 mr-2" />
                {content.buttons.gallery}
              </Link>
            </Button>
          </div>
        </div>

        {/* 特色功能 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {content.features.map((feature: any, index: number) => (
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
                {content.stats.images}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-ghibli-blue-600">5K+</div>
              <div className="text-gray-600 font-medium">
                {content.stats.users}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-ghibli-green-600">4.9</div>
              <div className="text-gray-600 font-medium flex items-center justify-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                {content.stats.rating}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-ghibli-blue-600">24/7</div>
              <div className="text-gray-600 font-medium">
                {content.stats.service}
              </div>
            </div>
          </div>
        </div>

        {/* 示例作品展示 */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {content.featured.title}
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            {content.featured.description}
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
                    {content.featured.artwork}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 行动号召 */}
        <div className="text-center bg-gradient-to-r from-ghibli-green-500 to-ghibli-blue-500 rounded-3xl p-12 text-white shadow-2xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {content.cta.title}
          </h2>
          <p className="text-xl mb-8 opacity-90">
            {content.cta.description}
          </p>
          <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-6 bg-white text-ghibli-green-600 hover:bg-gray-50">
            <Link href={`/${params.locale}/generate`}>
              {content.cta.button}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
        </div>

      </div>
    </div>
  );
}
