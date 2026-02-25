'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

const SIXTYFOUR_FONT = 'var(--font-sixtyfour-convergence)'

const TITLE_FONTS = [
  'var(--font-honk)',
  'var(--font-coral-pixels)',
  SIXTYFOUR_FONT,
  'var(--font-bitcount-grid-double-ink)',
] as const

export function DashboardHeaderTitle() {
  const [fontFamily, setFontFamily] = useState<string | null>(null)

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * TITLE_FONTS.length)
    setFontFamily(TITLE_FONTS[randomIndex])
  }, [])

  const isSixtyfour = fontFamily === SIXTYFOUR_FONT

  return (
    <h1
      className={`font-black tracking-tight text-brand-900 flex items-center gap-4 ${isSixtyfour ? 'text-2xl' : 'text-4xl'}`}
      style={fontFamily ? { fontFamily } : undefined}
    >
      <Image
        src="/icon.svg"
        alt=""
        width={40}
        height={40}
        className="shrink-0"
      />
      ZERO G GAMES
    </h1>
  )
}
