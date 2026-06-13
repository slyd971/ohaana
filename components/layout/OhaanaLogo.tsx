'use client'

import { useId } from 'react'
import { cn } from '@/lib/utils'

interface OhaanaLogoProps {
  variant?: 'dark' | 'light'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function OhaanaLogo({ variant = 'dark', size = 'md', className }: OhaanaLogoProps) {
  const id = useId()
  const markSize = { sm: 26, md: 32, lg: 40 }[size]
  const textSize = { sm: 'text-lg', md: 'text-2xl', lg: 'text-3xl' }[size]

  const isDark = variant === 'dark'
  const wordColor = isDark ? '#1A3D2B' : '#FDFAF4'

  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <svg
        width={markSize}
        height={markSize}
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id={`bg-${id}`} cx="45%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#2A5C41" />
            <stop offset="100%" stopColor="#0F2A1C" />
          </radialGradient>
          <radialGradient id={`sun-${id}`} cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#F5896E" />
            <stop offset="100%" stopColor="#E8604A" />
          </radialGradient>
          <radialGradient id={`glow-${id}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#E8604A" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#E8604A" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Background circle */}
        <circle cx="16" cy="16" r="16" fill={`url(#bg-${id})`} />

        {/* Sun glow halo */}
        <circle cx="16" cy="11" r="7" fill={`url(#glow-${id})`} />

        {/* Sun */}
        <circle cx="16" cy="11" r="4" fill={`url(#sun-${id})`} />

        {/* Sun rays — 8 directions, cardinal stronger */}
        <line x1="16" y1="5.5"  x2="16" y2="4"    stroke="#FDFAF4" strokeWidth="1.5" strokeLinecap="round" opacity="0.85" />
        <line x1="23"  y1="11"  x2="24.5" y2="11"  stroke="#FDFAF4" strokeWidth="1.5" strokeLinecap="round" opacity="0.85" />
        <line x1="16"  y1="17.5" x2="16" y2="18.5" stroke="#FDFAF4" strokeWidth="1.5" strokeLinecap="round" opacity="0.55" />
        <line x1="9"   y1="11"  x2="7.5"  y2="11"  stroke="#FDFAF4" strokeWidth="1.5" strokeLinecap="round" opacity="0.85" />
        <line x1="21.2" y1="7.2"  x2="22.3" y2="6.1"  stroke="#FDFAF4" strokeWidth="1.2" strokeLinecap="round" opacity="0.65" />
        <line x1="21.2" y1="14.8" x2="22.1" y2="15.7" stroke="#FDFAF4" strokeWidth="1.2" strokeLinecap="round" opacity="0.40" />
        <line x1="10.8" y1="7.2"  x2="9.7"  y2="6.1"  stroke="#FDFAF4" strokeWidth="1.2" strokeLinecap="round" opacity="0.65" />
        <line x1="10.8" y1="14.8" x2="9.9"  y2="15.7" stroke="#FDFAF4" strokeWidth="1.2" strokeLinecap="round" opacity="0.40" />

        {/* Back wave — subtle white */}
        <path
          d="M2 20.5 C5 18.5 8 22 12 20 C16 18 19.5 22 23 20 C26.5 18.5 29 20.5 30 20.5"
          stroke="#FDFAF4"
          strokeWidth="1"
          strokeLinecap="round"
          fill="none"
          opacity="0.2"
        />

        {/* Main wave — turquoise */}
        <path
          d="M1 24 C4 21.5 7.5 25.5 12 23 C16 21 20 25.5 24 23.5 C27 22 29.5 24 31 24"
          stroke="#2ABFB8"
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
        />

        {/* Water sparkles */}
        <line x1="9"    y1="27.5" x2="11.5" y2="27.5" stroke="#FDFAF4" strokeWidth="0.9" strokeLinecap="round" opacity="0.25" />
        <line x1="20.5" y1="28.5" x2="23"   y2="28.5" stroke="#FDFAF4" strokeWidth="0.9" strokeLinecap="round" opacity="0.20" />
      </svg>

      {/* Wordmark */}
      <span
        className={cn('font-display leading-none tracking-[0.06em]', textSize)}
        style={{ color: wordColor }}
      >
        ohaana
      </span>
    </div>
  )
}
