import { User } from '@supabase/auth-helpers-nextjs'
import Image from 'next/image'

interface AvatarProps {
  user: User
  size?: 'sm' | 'md' | 'lg'
}

export function Avatar({ user, size = 'md' }: AvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  }

  const initial = user.email?.[0]?.toUpperCase() || '?'

  return (
    <div className={`${sizeClasses[size]} rounded-full bg-ghibli-green flex items-center justify-center text-white font-medium overflow-hidden`}>
      {user.user_metadata?.avatar_url ? (
        <Image
          src={user.user_metadata.avatar_url}
          alt={user.email || 'User'}
          width={size === 'lg' ? 64 : size === 'md' ? 40 : 32}
          height={size === 'lg' ? 64 : size === 'md' ? 40 : 32}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className={size === 'lg' ? 'text-xl' : 'text-sm'}>{initial}</span>
      )}
    </div>
  )
}