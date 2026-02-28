'use client'

import { useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { StarfieldBackground } from '@/components/StarfieldBackground'
import { Asteroid, getAsteroidX } from '@/hooks/useStarShield'

const SCREEN_WIDTH = 1200

interface ShooterViewProps {
    asteroids: Asteroid[]
    aimRef: React.RefObject<{ x: number; y: number }>
    onMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void
}

function AsteroidCircle({ asteroid }: { asteroid: Asteroid }) {
    const divRef = useRef<HTMLDivElement>(null)

    const update = useCallback(() => {
        if (!divRef.current) return
        const x = getAsteroidX(asteroid, Date.now())
        const pct = (x / SCREEN_WIDTH) * 100
        divRef.current.style.left = `${pct}%`
    }, [asteroid])

    useEffect(() => {
        let rafId: number
        const loop = () => {
            update()
            rafId = requestAnimationFrame(loop)
        }
        rafId = requestAnimationFrame(loop)
        return () => cancelAnimationFrame(rafId)
    }, [update])

    const destroyed = !!asteroid.destroyedAt

    return (
        <motion.div
            ref={divRef}
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{ top: `${asteroid.y}%` }}
            animate={destroyed ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
            initial={{ scale: 0.5, opacity: 0 }}
            transition={
                destroyed
                    ? { duration: 0.25, ease: 'easeOut' }
                    : { duration: 0.3, ease: 'easeOut' }
            }
        >
            {/* 外側グロー */}
            <div className="absolute inset-0 rounded-full bg-orange-400/30 blur-md scale-150" />
            {/* 本体 */}
            <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-stone-400 via-stone-500 to-stone-700 border border-stone-300/40 shadow-[0_0_12px_rgba(251,146,60,0.6)]">
                {/* クレーター */}
                <div className="absolute top-2 left-3 w-2 h-2 rounded-full bg-stone-600/60" />
                <div className="absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full bg-stone-600/50" />
            </div>
        </motion.div>
    )
}

// 破壊エフェクト（パーティクル）
function ExplosionEffect({ asteroid }: { asteroid: Asteroid }) {
    if (!asteroid.destroyedAt) return null
    return (
        <motion.div
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{ top: `${asteroid.y}%`, left: `${(getAsteroidX(asteroid, asteroid.destroyedAt) / SCREEN_WIDTH) * 100}%` }}
            initial={{ opacity: 1, scale: 0.5 }}
            animate={{ opacity: 0, scale: 3 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
        >
            <div className="w-10 h-10 rounded-full border-2 border-orange-400/80" />
        </motion.div>
    )
}

// 照準カーソル
function Crosshair({ aimRef }: { aimRef: React.RefObject<{ x: number; y: number }> }) {
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        let rafId: number
        const loop = () => {
            if (ref.current) {
                const pct = (aimRef.current.x / SCREEN_WIDTH) * 100
                ref.current.style.left = `${pct}%`
                ref.current.style.top = `${aimRef.current.y}px`
            }
            rafId = requestAnimationFrame(loop)
        }
        rafId = requestAnimationFrame(loop)
        return () => cancelAnimationFrame(rafId)
    }, [aimRef])

    return (
        <div
            ref={ref}
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20"
        >
            {/* 外周リング */}
            <div className="absolute inset-0 w-12 h-12 -translate-x-1/2 -translate-y-1/2 rounded-full border border-brand-500/50" />
            {/* 十字線 */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-px w-12 h-px bg-brand-500/70" />
            <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-px w-px h-12 bg-brand-500/70" />
            {/* 中心点 */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-brand-500" />
        </div>
    )
}

export function ShooterView({ asteroids, aimRef, onMouseMove }: ShooterViewProps) {
    const activeAsteroids = asteroids.filter((a) => !a.destroyedAt)
    const destroyedAsteroids = asteroids.filter((a) => !!a.destroyedAt)

    return (
        <div
            className="absolute inset-0 cursor-none overflow-hidden"
            onMouseMove={onMouseMove}
        >
            <StarfieldBackground />

            {/* 左端ライン（ゲームオーバーライン） */}
            <div className="absolute left-0 top-0 bottom-0 w-px bg-red-500/30 z-10" />
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-red-900/20 to-transparent z-10 pointer-events-none" />

            {/* 隕石 */}
            <AnimatePresence>
                {activeAsteroids.map((a) => (
                    <AsteroidCircle key={a.id} asteroid={a} />
                ))}
            </AnimatePresence>

            {/* 破壊エフェクト */}
            <AnimatePresence>
                {destroyedAsteroids.map((a) => (
                    <ExplosionEffect key={`exp-${a.id}`} asteroid={a} />
                ))}
            </AnimatePresence>

            {/* 照準 */}
            <Crosshair aimRef={aimRef} />

            {/* ロール表示 */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-brand-500/50 text-xs tracking-widest">
                SHOOTER MODE — aim with mouse, fire when typist types
            </div>
        </div>
    )
}
