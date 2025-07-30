import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Filter, Grid, Heart, Download, Eye, Calendar, User, Sparkles, TrendingUp } from 'lucide-react'

export default function GalleryPage({ params }: { params: { locale: string } }) {
  const isEnglish = params.locale === 'en'

  const content = {
    zh: {
      title: '作品画廊',
      subtitle: '探索社区用户创作的精彩吉卜力风格作品',
      searchPlaceholder: '搜索作品...',
      filterButton: '筛选',
      sortButton: '排序',
      loadMore: '加载更多'
    },
    en: {
      title: 'Gallery',
      subtitle: 'Explore amazing Ghibli-style artwork created by our community',
      searchPlaceholder: 'Search artwork...',
      filterButton: 'Filter',
      sortButton: 'Sort',
      loadMore: 'Load More'
    }
  }

  const t = content[isEnglish ? 'en' : 'zh']

  // 模拟画廊数据
  const galleryImages = [
    {
      id: '1',
      url: 'https://picsum.photos/400/400?random=1',
      prompt: '樱花盛开的山间宁静村庄',
      user: {
        username: '用户A',
        avatar_url: 'https://picsum.photos/32/32?random=1'
      },
      likes_count: 234,
      views_count: 1234,
      created_at: '2024-01-15',
      is_liked: false,
      is_favorited: false
    },
    {
      id: '2',
      url: 'https://picsum.photos/400/400?random=2',
      prompt: '有发光蘑菇和萤火虫的神奇森林',
      user: {
        username: '用户B',
        avatar_url: 'https://picsum.photos/32/32?random=2'
      },
      likes_count: 189,
      views_count: 987,
      created_at: '2024-01-14',
      is_liked: true,
      is_favorited: false
    },
    {
      id: '3',
      url: 'https://picsum.photos/400/400?random=3',
      prompt: '秋天树木环绕的湖边舒适小屋',
      user: {
        username: '用户C',
        avatar_url: 'https://picsum.photos/32/32?random=3'
      },
      likes_count: 156,
      views_count: 756,
      created_at: '2024-01-13',
      is_liked: false,
      is_favorited: true
    },
    {
      id: '4',
      url: 'https://picsum.photos/400/400?random=4',
      prompt: '夜晚在城市上空飞行的年轻女孩',
      user: {
        username: '用户D',
        avatar_url: 'https://picsum.photos/32/32?random=4'
      },
      likes_count: 298,
      views_count: 1567,
      created_at: '2024-01-12',
      is_liked: false,
      is_favorited: false
    },
    {
      id: '5',
      url: 'https://picsum.photos/400/400?random=5',
      prompt: '吉卜力风格的魔法城堡',
      user: {
        username: '用户E',
        avatar_url: 'https://picsum.photos/32/32?random=5'
      },
      likes_count: 412,
      views_count: 2345,
      created_at: '2024-01-11',
      is_liked: true,
      is_favorited: true
    },
    {
      id: '6',
      url: 'https://picsum.photos/400/400?random=6',
      prompt: '樱花树下的猫咪',
      user: {
        username: '用户F',
        avatar_url: 'https://picsum.photos/32/32?random=6'
      },
      likes_count: 567,
      views_count: 3456,
      created_at: '2024-01-10',
      is_liked: false,
      is_favorited: false
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-ghibli-cream-50 via-ghibli-green-50 to-ghibli-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-ghibli-green-100 to-ghibli-blue-100 rounded-full text-ghibli-green-700 text-base font-semibold mb-8 shadow-sm">
            <Sparkles className="w-5 h-5 mr-2" />
            {isEnglish ? 'Community Gallery' : '社区画廊'}
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            🖼️ {t.title}
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
            {t.subtitle}
          </p>

          {/* 统计信息 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-12">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
              <div className="text-2xl font-bold text-ghibli-green-600 mb-1">2,847</div>
              <div className="text-sm text-gray-600">{isEnglish ? 'Artworks' : '艺术作品'}</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
              <div className="text-2xl font-bold text-ghibli-blue-600 mb-1">1,234</div>
              <div className="text-sm text-gray-600">{isEnglish ? 'Artists' : '艺术家'}</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
              <div className="text-2xl font-bold text-ghibli-green-600 mb-1">45.6K</div>
              <div className="text-sm text-gray-600">{isEnglish ? 'Likes' : '点赞数'}</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
              <div className="text-2xl font-bold text-ghibli-blue-600 mb-1">128K</div>
              <div className="text-sm text-gray-600">{isEnglish ? 'Views' : '浏览量'}</div>
            </div>
          </div>

          {/* 搜索和筛选 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg max-w-4xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder={t.searchPlaceholder}
                  className="pl-12 h-12 text-base border-2 focus:border-ghibli-green-400 rounded-xl"
                />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex items-center gap-2 h-12 px-6">
                  <Filter className="w-4 h-4" />
                  {t.filterButton}
                </Button>
                <Button variant="outline" className="flex items-center gap-2 h-12 px-6">
                  <TrendingUp className="w-4 h-4" />
                  {isEnglish ? 'Trending' : '热门'}
                </Button>
                <Button variant="outline" size="icon" className="h-12 w-12">
                  <Grid className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* 图片网格 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {galleryImages.map((image) => (
            <Card key={image.id} className="group overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={image.url}
                  alt={image.prompt}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute top-4 right-4 flex gap-2">
                    <Button size="sm" variant="secondary" className="bg-white/90 hover:bg-white shadow-lg">
                      <Heart className={`w-4 h-4 ${image.is_liked ? 'fill-red-500 text-red-500' : ''}`} />
                    </Button>
                    <Button size="sm" variant="secondary" className="bg-white/90 hover:bg-white shadow-lg">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <p className="text-sm font-medium mb-2 line-clamp-2">
                      {image.prompt}
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <img
                          src={image.user.avatar_url}
                          alt={image.user.username}
                          className="w-6 h-6 rounded-full border-2 border-white"
                        />
                        <span className="font-medium">{image.user.username}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          <span>{image.likes_count}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          <span>{image.views_count}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <CardContent className="p-6">
                <p className="text-base text-gray-700 line-clamp-2 mb-4 font-medium">
                  {image.prompt}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={image.user.avatar_url}
                      alt={image.user.username}
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="text-sm">
                      <div className="font-medium text-gray-800">{image.user.username}</div>
                      <div className="text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {image.created_at}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Heart className={`w-4 h-4 ${image.is_liked ? 'fill-red-500 text-red-500' : ''}`} />
                      <span>{image.likes_count}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{image.views_count}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 加载更多 */}
        <div className="text-center mt-16">
          <Button size="lg" className="bg-gradient-to-r from-ghibli-green-500 to-ghibli-blue-500 hover:from-ghibli-green-600 hover:to-ghibli-blue-600 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
            {t.loadMore}
            <Sparkles className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}
