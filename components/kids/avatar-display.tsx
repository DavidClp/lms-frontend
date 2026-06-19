'use client'

import type { AvatarConfig } from '@/types'
import { AVATAR_COLORS } from '@/lib/kids-messages'
import { cn } from '@/lib/utils'

interface AvatarDisplayProps {
  config?: AvatarConfig | null
  size?: 'sm' | 'lg'
  className?: string
}

export function AvatarDisplay({ config, size = 'lg', className }: AvatarDisplayProps) {
  const c = config ?? { skin: 'peach', hair: 'brown', accessory: 'none', background: 'sky' }
  const dim = size === 'lg' ? 'h-28 w-28' : 'h-16 w-16'

  return (
    <div
      className={cn('relative rounded-full border-4 border-white shadow-lg overflow-hidden', dim, className)}
      style={{ backgroundColor: AVATAR_COLORS[c.background] ?? '#BAE6FD' }}
    >
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full"
        style={{
          width: '70%',
          height: '55%',
          backgroundColor: AVATAR_COLORS[c.skin] ?? '#FFDAB9',
        }}
      />
      <div
        className="absolute top-[18%] left-1/2 -translate-x-1/2 rounded-full"
        style={{
          width: '55%',
          height: '45%',
          backgroundColor: AVATAR_COLORS[c.hair] ?? '#8B5A2B',
        }}
      />
      {c.accessory === 'star' && (
        <span className="absolute -top-1 right-1 text-xl">⭐</span>
      )}
      {c.accessory === 'glasses' && (
        <span className="absolute top-[38%] left-1/2 -translate-x-1/2 text-lg">👓</span>
      )}
      {c.accessory === 'crown' && (
        <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-xl">👑</span>
      )}
    </div>
  )
}
