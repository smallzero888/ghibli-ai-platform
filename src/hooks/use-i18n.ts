'use client'

import { usePathname } from 'next/navigation'
import { useMemo } from 'react'

// Import translation files
import enMessages from '../../messages/en.json'
import zhMessages from '../../messages/zh.json'

// Type for translation messages
type Messages = typeof enMessages

// Supported locales
export const supportedLocales = ['zh', 'en', 'ja', 'ko', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ar', 'hi', 'th', 'vi'] as const
export type Locale = typeof supportedLocales[number]

// Extended messages for all locales (we'll add more as needed)
const messages: Record<Locale, Messages> = {
  zh: zhMessages,
  en: enMessages,
  // For now, fallback to English for other locales
  // TODO: Add proper translations for these locales
  ja: enMessages,
  ko: enMessages,
  es: enMessages,
  fr: enMessages,
  de: enMessages,
  it: enMessages,
  pt: enMessages,
  ru: enMessages,
  ar: enMessages,
  hi: enMessages,
  th: enMessages,
  vi: enMessages,
}

// Navigation-specific translations for all locales
const navigationTranslations: Record<Locale, {
  home: string
  generate: string
  gallery: string
  dashboard: string
  explore: string
  pricing: string
  help: string
  faq: string
  login: string
  logout: string
  register: string
  profile: string
  settings: string
  about: string
  contact: string
  support: string
}> = {
  zh: {
    home: '首页',
    generate: '生成',
    gallery: '画廊',
    dashboard: '个人中心',
    explore: '探索发现',
    pricing: '定价方案',
    help: '帮助中心',
    faq: '常见问题',
    login: '登录',
    logout: '退出',
    register: '注册',
    profile: '个人资料',
    settings: '设置',
    about: '关于我们',
    contact: '联系我们',
    support: '支持'
  },
  en: {
    home: 'Home',
    generate: 'Generate',
    gallery: 'Gallery',
    dashboard: 'Dashboard',
    explore: 'Explore',
    pricing: 'Pricing',
    help: 'Help Center',
    faq: 'FAQ',
    login: 'Login',
    logout: 'Logout',
    register: 'Register',
    profile: 'Profile',
    settings: 'Settings',
    about: 'About',
    contact: 'Contact',
    support: 'Support'
  },
  ja: {
    home: 'ホーム',
    generate: '生成',
    gallery: 'ギャラリー',
    dashboard: 'ダッシュボード',
    explore: '探索',
    pricing: '料金',
    help: 'ヘルプセンター',
    faq: 'よくある質問',
    login: 'ログイン',
    logout: 'ログアウト',
    register: '登録',
    profile: 'プロフィール',
    settings: '設定',
    about: '私たちについて',
    contact: 'お問い合わせ',
    support: 'サポート'
  },
  ko: {
    home: '홈',
    generate: '생성',
    gallery: '갤러리',
    dashboard: '대시보드',
    explore: '탐색',
    pricing: '가격',
    help: '도움말 센터',
    faq: '자주 묻는 질문',
    login: '로그인',
    logout: '로그아웃',
    register: '회원가입',
    profile: '프로필',
    settings: '설정',
    about: '소개',
    contact: '연락처',
    support: '지원'
  },
  es: {
    home: 'Inicio',
    generate: 'Generar',
    gallery: 'Galería',
    dashboard: 'Panel',
    explore: 'Explorar',
    pricing: 'Precios',
    help: 'Centro de Ayuda',
    faq: 'Preguntas Frecuentes',
    login: 'Iniciar Sesión',
    logout: 'Cerrar Sesión',
    register: 'Registrarse',
    profile: 'Perfil',
    settings: 'Configuración',
    about: 'Acerca de',
    contact: 'Contacto',
    support: 'Soporte'
  },
  fr: {
    home: 'Accueil',
    generate: 'Générer',
    gallery: 'Galerie',
    dashboard: 'Tableau de Bord',
    explore: 'Explorer',
    pricing: 'Tarifs',
    help: 'Centre d\'Aide',
    faq: 'FAQ',
    login: 'Connexion',
    logout: 'Déconnexion',
    register: 'S\'inscrire',
    profile: 'Profil',
    settings: 'Paramètres',
    about: 'À Propos',
    contact: 'Contact',
    support: 'Support'
  },
  de: {
    home: 'Startseite',
    generate: 'Generieren',
    gallery: 'Galerie',
    dashboard: 'Dashboard',
    explore: 'Erkunden',
    pricing: 'Preise',
    help: 'Hilfezentrum',
    faq: 'FAQ',
    login: 'Anmelden',
    logout: 'Abmelden',
    register: 'Registrieren',
    profile: 'Profil',
    settings: 'Einstellungen',
    about: 'Über uns',
    contact: 'Kontakt',
    support: 'Support'
  },
  it: {
    home: 'Home',
    generate: 'Genera',
    gallery: 'Galleria',
    dashboard: 'Dashboard',
    explore: 'Esplora',
    pricing: 'Prezzi',
    help: 'Centro Aiuto',
    faq: 'FAQ',
    login: 'Accedi',
    logout: 'Esci',
    register: 'Registrati',
    profile: 'Profilo',
    settings: 'Impostazioni',
    about: 'Chi Siamo',
    contact: 'Contatto',
    support: 'Supporto'
  },
  pt: {
    home: 'Início',
    generate: 'Gerar',
    gallery: 'Galeria',
    dashboard: 'Painel',
    explore: 'Explorar',
    pricing: 'Preços',
    help: 'Centro de Ajuda',
    faq: 'FAQ',
    login: 'Entrar',
    logout: 'Sair',
    register: 'Registrar',
    profile: 'Perfil',
    settings: 'Configurações',
    about: 'Sobre',
    contact: 'Contato',
    support: 'Suporte'
  },
  ru: {
    home: 'Главная',
    generate: 'Генерировать',
    gallery: 'Галерея',
    dashboard: 'Панель',
    explore: 'Исследовать',
    pricing: 'Цены',
    help: 'Центр Помощи',
    faq: 'Часто задаваемые вопросы',
    login: 'Войти',
    logout: 'Выйти',
    register: 'Регистрация',
    profile: 'Профиль',
    settings: 'Настройки',
    about: 'О нас',
    contact: 'Контакты',
    support: 'Поддержка'
  },
  ar: {
    home: 'الرئيسية',
    generate: 'توليد',
    gallery: 'المعرض',
    dashboard: 'لوحة التحكم',
    explore: 'استكشاف',
    pricing: 'التسعير',
    help: 'مركز المساعدة',
    faq: 'الأسئلة الشائعة',
    login: 'تسجيل الدخول',
    logout: 'تسجيل الخروج',
    register: 'التسجيل',
    profile: 'الملف الشخصي',
    settings: 'الإعدادات',
    about: 'حول',
    contact: 'اتصل بنا',
    support: 'الدعم'
  },
  hi: {
    home: 'होम',
    generate: 'जेनरेट',
    gallery: 'गैलरी',
    dashboard: 'डैशबोर्ड',
    explore: 'एक्सप्लोर',
    pricing: 'प्राइसिंग',
    help: 'हेल्प सेंटर',
    faq: 'अक्सर पूछे जाने वाले प्रश्न',
    login: 'लॉगिन',
    logout: 'लॉगआउट',
    register: 'रजिस्टर',
    profile: 'प्रोफाइल',
    settings: 'सेटिंग्स',
    about: 'के बारे में',
    contact: 'संपर्क',
    support: 'सपोर्ट'
  },
  th: {
    home: 'หน้าแรก',
    generate: 'สร้าง',
    gallery: 'แกลเลอรี่',
    dashboard: 'แดชบอร์ด',
    explore: 'สำรวจ',
    pricing: 'ราคา',
    help: 'ศูนย์ช่วยเหลือ',
    faq: 'คำถามที่พบบ่อย',
    login: 'เข้าสู่ระบบ',
    logout: 'ออกจากระบบ',
    register: 'สมัครสมาชิก',
    profile: 'โปรไฟล์',
    settings: 'การตั้งค่า',
    about: 'เกี่ยวกับ',
    contact: 'ติดต่อ',
    support: 'สนับสนุน'
  },
  vi: {
    home: 'Trang chủ',
    generate: 'Tạo',
    gallery: 'Thư viện',
    dashboard: 'Bảng điều khiển',
    explore: 'Khám phá',
    pricing: 'Giá cả',
    help: 'Trung tâm Trợ giúp',
    faq: 'Câu hỏi thường gặp',
    login: 'Đăng nhập',
    logout: 'Đăng xuất',
    register: 'Đăng ký',
    profile: 'Hồ sơ',
    settings: 'Cài đặt',
    about: 'Giới thiệu',
    contact: 'Liên hệ',
    support: 'Hỗ trợ'
  }
}

/**
 * Custom hook for internationalization
 */
export function useI18n() {
  const pathname = usePathname()
  
  // Extract locale from pathname
  const locale = useMemo(() => {
    const segments = pathname.split('/').filter(Boolean)
    const firstSegment = segments[0] as Locale
    return supportedLocales.includes(firstSegment) ? firstSegment : 'zh'
  }, [pathname])

  // Get messages for current locale
  const currentMessages = useMemo(() => {
    return messages[locale] || messages.en
  }, [locale])

  // Get navigation translations for current locale
  const nav = useMemo(() => {
    return navigationTranslations[locale] || navigationTranslations.en
  }, [locale])

  /**
   * Get translation by key path (e.g., 'common.loading', 'hero.title')
   */
  const t = useMemo(() => {
    return (key: string, params?: Record<string, string | number>): string => {
      const keys = key.split('.')
      let value: any = currentMessages
      
      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k]
        } else {
          // Fallback to key if translation not found
          return key
        }
      }
      
      if (typeof value !== 'string') {
        return key
      }
      
      // Replace parameters if provided
      if (params) {
        return Object.entries(params).reduce((str, [param, val]) => {
          return str.replace(new RegExp(`{${param}}`, 'g'), String(val))
        }, value)
      }
      
      return value
    }
  }, [currentMessages])

  return {
    locale,
    t,
    nav,
    messages: currentMessages,
    isRTL: locale === 'ar' // Right-to-left languages
  }
}