'use client'

import Image from 'next/image'

const RUBIK_PUDDLES_FONT = 'var(--font-rubik-puddles)'

export function DashboardHeaderTitle() {
  return (
    <h1
      className="font-black tracking-tight text-brand-900 flex items-center gap-4 text-2xl"
      style={{ fontFamily: RUBIK_PUDDLES_FONT }}
    >
      <Image
        src="/icon.svg"
        alt=""
        width={40}
        height={40}
        className="shrink-0"
      />
      <span>Pukapuka</span>
      <span>Space</span>
    </h1>
  )
}
