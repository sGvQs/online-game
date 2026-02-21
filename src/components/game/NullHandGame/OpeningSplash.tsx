import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { HandType } from '@/shared/types'
import { Hand3D } from './Hand3D'
import { nullHandGame } from './styles'
import { NullHandLogo } from './NullHandLogo'

interface OpeningSplashProps {
    onComplete: () => void
    titleHand: HandType
    userColor: string
}

export function OpeningSplash({ onComplete, titleHand, userColor }: OpeningSplashProps) {
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
            }, 800) // プログレスバー完了後、少し待って遷移 (0.8s)
            return () => clearTimeout(timer)
        }
    }, [isTransitioning, onComplete])

    return (
        <motion.div
            className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center font-sans"
            transition={{ duration: 1 }}
        >
            {/* 中央のロゴと手 */}
            <div className="relative flex flex-col items-center w-full max-w-[564px]">
                <motion.div
                    className={styles.visualBox()}
                    layoutId="main-box"
                >
                    <NullHandLogo titleHand={titleHand} userColor={userColor} showChangeButton={false} />
                </motion.div>

                {/* プログレスバー */}
                <motion.div className="w-64 space-y-2"
                    style={{ color: userColor }}
                    exit={{ opacity: 0 }}
                    animate={{ opacity: isTransitioning ? 0 : 1 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}>
                    <div className="flex justify-between text-xs font-bold tracking-widest">
                        <span>LOADING SYSTEM...</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="h-1 bg-gray-900 w-full overflow-hidden">
                        <motion.div
                            className="h-full bg-white shadow-[0_0_10px_#44FFFF]"
                            style={{ width: `${progress}%`, backgroundColor: userColor }}
                        />
                    </div>
                </motion.div>
            </div>
        </motion.div>



    )
}
