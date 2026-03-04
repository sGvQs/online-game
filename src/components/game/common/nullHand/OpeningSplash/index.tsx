import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { HandType } from '@/types'
import { nullHandGame } from '@/components/game/layout/nullHandGame/styles'
import { NullHandLogo } from '@/components/game/common/nullHand/NullHandLogo'
import { useSE } from '@/hooks/useSE'
import { NEON_PALETTE } from '@/constants/nullHandGame'

interface OpeningSplashProps {
    onComplete: () => void
    titleHand: HandType
    userColor: string
    onColorChange: (color: string) => void
}

export function OpeningSplash({ onComplete, titleHand, userColor, onColorChange }: OpeningSplashProps) {
    const [progress, setProgress] = useState(0)
    const [isTransitioning, setIsTransitioning] = useState(false)
    const styles = nullHandGame()
    const { play } = useSE()

    const handleColorCycle = () => {
        const nextIndex = (NEON_PALETTE.indexOf(userColor) + 1) % NEON_PALETTE.length
        onColorChange(NEON_PALETTE[nextIndex])
        play('submit')
    }

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
                    <NullHandLogo
                        titleHand={titleHand}
                        userColor={userColor}
                        onClick={handleColorCycle}
                        showChangeButton={true}
                    />
                </motion.div>

                {/* プログレスバーエリア（固定高さでガタつきを防止） */}
                <div className="h-16 flex flex-col justify-start">
                    <motion.div className="w-64 space-y-2"
                        style={{ color: userColor }}
                        exit={{ opacity: 0 }}
                        animate={{ opacity: isTransitioning ? 0 : 1 }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}>
                        <div className="flex justify-between text-[10px] font-black tracking-widest opacity-80">
                            <span>LOADING...</span>
                            <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="h-1 bg-gray-900 w-full overflow-hidden">
                            <motion.div
                                className="h-full shadow-[0_0_10px_currentColor]"
                                style={{ width: `${progress}%`, backgroundColor: userColor }}
                            />
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    )
}
