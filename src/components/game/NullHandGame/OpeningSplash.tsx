import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HandType } from '@/shared/types'
import { Hand3D } from './Hand3D'
import { nullHandGame } from './styles'
import { NullHandLogo } from './NullHandLogo'

interface OpeningSplashProps {
    onComplete: () => void
    phase: string
    titleHand: HandType
}

export function OpeningSplash({ onComplete, phase, titleHand }: OpeningSplashProps) {
    const [progress, setProgress] = useState(0)
    const [isTransitioning, setIsTransitioning] = useState(false)
    const styles = nullHandGame()

    useEffect(() => {
        const duration = 10000 // 10秒
        const interval = 100 // 更新間隔
        const steps = duration / interval
        const increment = 100 / steps

        const timer = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(timer)
                    setIsTransitioning(true)
                    return 100
                }
                return prev + increment
            })
        }, interval)

        return () => clearInterval(timer)
    }, [])

    useEffect(() => {
        if (isTransitioning) {
            // トランジション完了後の処理
            const timer = setTimeout(() => {
                onComplete()
            }, 500) // プログレスバー完了後、少し待って遷移 (0.5s)
            return () => clearTimeout(timer)
        }
    }, [isTransitioning, onComplete])

    return (
        <AnimatePresence>
            {!isTransitioning && (
                <motion.div
                    className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center font-sans"
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                >
                    {/* 中央のロゴと手 */}
                    <div className="relative flex flex-col items-center w-full max-w-[564px]">
                        <motion.div
                            className={styles.visualBox()}
                            layoutId="hero-logo-container"
                            transition={{ duration: 0.8, ease: "easeInOut" }}
                        >
                            <NullHandLogo titleHand={titleHand} />
                        </motion.div>

                        {/* プログレスバー */}
                        <div className="w-64 space-y-2 mt-10">
                            <div className="flex justify-between text-xs font-bold tracking-widest text-[#44FFFF]">
                                <span>LOADING SYSTEM...</span>
                                <span>{Math.round(progress)}%</span>
                            </div>
                            <div className="h-1 bg-gray-900 w-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-[#44FFFF] shadow-[0_0_10px_#44FFFF]"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Manual animation removed in favor of layoutId transition */}
        </AnimatePresence>
    )
}
