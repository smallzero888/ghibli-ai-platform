import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold text-ghibli-green mb-4">
              吉卜力AI
            </h3>
            <p className="text-gray-300 mb-4">
              使用最先进的AI技术，轻松生成具有吉卜力工作室风格的精美图片。
              让你的创意想象变成现实，创作属于你的艺术作品。
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">功能</h4>
            <ul className="space-y-2 text-gray-300">
              <li>
                <Link href="/generate" className="hover:text-ghibli-green">
                  图片生成
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-ghibli-green">
                  作品画廊
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-ghibli-green">
                  个人中心
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">支持</h4>
            <ul className="space-y-2 text-gray-300">
              <li>
                <Link href="/help" className="hover:text-ghibli-green">
                  使用帮助
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-ghibli-green">
                  联系我们
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-ghibli-green">
                  隐私政策
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 吉卜力AI图片生成平台. 保留所有权利.</p>
        </div>
      </div>
    </footer>
  )
}