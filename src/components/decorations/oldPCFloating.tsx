'use client'

import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'

const DURATION = 100

const PATTERNS = [
    { initial: { left: '-10%', top: '20%' }, animate: { left: '110%', top: '20%' }, rotate: 360 },
    { initial: { left: '110%', top: '80%' }, animate: { left: '-10%', top: '80%' }, rotate: -360 },
    { initial: { left: '50%', top: '-20%' }, animate: { left: '50%', top: '120%' }, rotate: 360 },
    { initial: { left: '30%', top: '120%' }, animate: { left: '30%', top: '-20%' }, rotate: -360 },
    { initial: { left: '-10%', top: '-10%' }, animate: { left: '110%', top: '110%' }, rotate: 360 },
] as const

export function OldPCFloating() {
    const pathname = usePathname()
    const [mounted, setMounted] = useState(false)
    useEffect(() => setMounted(true), [])

    const pattern = useMemo(
        () => PATTERNS[Math.floor(Math.random() * PATTERNS.length)]!,
        [mounted]
    )

    if (pathname.startsWith('/game') || !mounted) return null

    return (
        <motion.div
            className="fixed z-0 pointer-events-none w-10 h-10"
            initial={{ ...pattern.initial, x: '-50%', y: '-50%', rotate: 0 }}
            animate={{
                ...pattern.animate,
                x: '-50%',
                y: '-50%',
                rotate: pattern.rotate,
            }}
            transition={{
                duration: DURATION,
                ease: 'easeInOut',
            }}
            style={{ transformOrigin: 'center center' }}
        >
            <div className="relative w-full h-full">
                <Image
                    src="/svg/object/old-pc.svg"
                    alt=""
                    fill
                    sizes="40px"
                    className="object-contain"
                />
            </div>
        </motion.div>
    )
}
