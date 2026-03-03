'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import {
    BALL_ANGLE,
    BALL_DISTANCE,
    BALL_SPAWN_DELAY_MIN,
    BALL_SPAWN_DELAY_MAX,
    BALL_SIZE,
    DINO_SPAWN,
    BULLET_COLOR,
    ICONS,
} from '../constants'

interface DinosaurWithBallsProps {
    ballColor?: string
    angle?: number
    distance?: number
    size?: string
    rotate?: string
    className?: string
}

export function DinosaurWithBalls({
    ballColor = BULLET_COLOR,
    angle = BALL_ANGLE,
    distance = BALL_DISTANCE,
    size = 'w-28 h-28',
    rotate = '-0.5rad',
    className = '',
}: DinosaurWithBallsProps) {
    const [balls, setBalls] = useState<{ id: number }[]>([])

    useEffect(() => {
        const spawn = () => {
            setBalls((b) => [...b.slice(-3), { id: Date.now() + Math.random() }])
        }
        const schedule = () => {
            spawn()
            const delay = BALL_SPAWN_DELAY_MIN + Math.random() * (BALL_SPAWN_DELAY_MAX - BALL_SPAWN_DELAY_MIN)
            return setTimeout(schedule, delay)
        }
        const t = schedule()
        return () => clearTimeout(t)
    }, [])

    return (
        <>
            {/* 恐竜 */}
            <div
                className={`absolute z-10 pointer-events-none ${size} ${className}`}
                style={{
                    left: `${DINO_SPAWN.left}%`,
                    bottom: `${DINO_SPAWN.bottom}%`,
                    transform: `translate(-50%, 50%) rotate(${rotate})`,
                }}
            >
                <div className="relative w-full h-full">
                    <Image
                        src={ICONS.DINO}
                        alt="恐竜"
                        fill
                        className="object-contain drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]"
                    />
                </div>
            </div>

            {/* 恐竜が吐く赤い球（口から画面外まで） */}
            <div
                className="absolute z-[9] pointer-events-none"
                style={{
                    left: `${DINO_SPAWN.left}%`,
                    bottom: `${DINO_SPAWN.bottom}%`,
                    transform: 'translate(-50%, 50%)',
                }}
            >
                <AnimatePresence>
                    {balls.map((b) => (
                        <motion.div
                            key={b.id}
                            className="absolute rounded-full"
                            style={{
                                width: BALL_SIZE,
                                height: BALL_SIZE,
                                left: 0,
                                top: 0,
                                backgroundColor: ballColor,
                                boxShadow: `0 0 8px ${ballColor}99`,
                            }}
                            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                            animate={{
                                x: Math.cos(angle) * distance,
                                y: -Math.sin(angle) * distance,
                                opacity: 0.4,
                                scale: 0.8,
                            }}
                            transition={{ duration: 1.8, ease: 'linear' }}
                            onAnimationComplete={() => {
                                setBalls((prev) => prev.filter((x) => x.id !== b.id))
                            }}
                        />
                    ))}
                </AnimatePresence>
            </div>
        </>
    )
}
