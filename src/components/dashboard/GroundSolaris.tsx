'use client'

import { useEffect, useState } from 'react'
import { motion, useAnimation } from 'framer-motion'

/** 地点 A〜F、それぞれに上下のバリエーション（x, y） */
const POSITIONS: { x: string; y: string }[] = [
    { x: '-18vw', y: '-1.5vh' },
    { x: '-18vw', y: '0vh' },
    { x: '-18vw', y: '1.5vh' },
    { x: '-8vw', y: '-1.2vh' },
    { x: '-8vw', y: '0vh' },
    { x: '-8vw', y: '1.2vh' },
    { x: '0vw', y: '-1.5vh' },
    { x: '0vw', y: '0vh' },
    { x: '0vw', y: '1.5vh' },
    { x: '8vw', y: '-1.2vh' },
    { x: '8vw', y: '0vh' },
    { x: '8vw', y: '1.2vh' },
    { x: '16vw', y: '-1.5vh' },
    { x: '16vw', y: '0vh' },
    { x: '16vw', y: '1.5vh' },
    { x: '24vw', y: '-1.2vh' },
    { x: '24vw', y: '0vh' },
    { x: '24vw', y: '1.2vh' },
]

/** ランダムな範囲の数値を返す */
function randomBetween(min: number, max: number) {
    return min + Math.random() * (max - min)
}

/** 確率で長い停止時間を返す（たまに長く停止） */
function randomStopDuration(): number {
    if (Math.random() < 0.25) {
        return randomBetween(3, 8)
    }
    return randomBetween(0.3, 1.5)
}

/** ランダムな移動時間 */
function randomMoveDuration(): number {
    return randomBetween(2.5, 10)
}

/** 現在地以外のランダムな地点を返す */
function pickRandomDestination(currentIndex: number): number {
    const others = POSITIONS.map((_, i) => i).filter((i) => i !== currentIndex)
    return others[Math.floor(Math.random() * others.length)]
}

export function GroundSolaris() {
    const controls = useAnimation()
    const [isMoving, setIsMoving] = useState(false)

    useEffect(() => {
        let isMounted = true

        const runSequence = async () => {
            await new Promise((r) => setTimeout(r, 2000))
            let currentIndex = 0
            while (isMounted) {
                const destinationIndex = pickRandomDestination(currentIndex)
                const dest = POSITIONS[destinationIndex]
                setIsMoving(true)
                await controls.start({
                    x: dest.x,
                    y: dest.y,
                    transition: {
                        duration: randomMoveDuration(),
                        ease: 'easeInOut',
                    },
                })
                if (!isMounted) return
                setIsMoving(false)
                currentIndex = destinationIndex
                await new Promise((r) => setTimeout(r, randomStopDuration() * 1000))
            }
        }

        runSequence()
        return () => {
            isMounted = false
        }
    }, [controls])

    return (
        <div
            className="fixed left-0 right-0 bottom-0 pointer-events-none overflow-visible"
            style={{ zIndex: 10, height: '30vh' }}
        >
            <div
                className="absolute"
                style={{
                    left: '50%',
                    bottom: '10vh',
                    transform: 'translateX(-50%)',
                }}
            >
                <motion.div
                    className="absolute"
                    style={{
                        left: 0,
                        width: 56,
                        height: 56,
                    }}
                    initial={{ x: POSITIONS[0].x, y: POSITIONS[0].y }}
                    animate={controls}
                >
                    <motion.div
                        className="w-full h-full"
                        animate={
                            isMoving
                                ? {
                                      y: [0, 0.6, -0.5, 0.5, 0],
                                      rotate: [0, 0.9, -0.8, 0.7, 0],
                                  }
                                : { y: 0, rotate: 0 }
                        }
                        transition={
                            isMoving
                                ? {
                                      duration: 0.3,
                                      repeat: Infinity,
                                      repeatDelay: 0,
                                      ease: 'linear',
                                  }
                                : { duration: 0.12 }
                        }
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src="/svg/solaris.svg"
                            alt=""
                            width={56}
                            height={56}
                            className="w-full h-full object-contain drop-shadow-lg"
                        />
                    </motion.div>
                </motion.div>
            </div>
        </div>
    )
}
