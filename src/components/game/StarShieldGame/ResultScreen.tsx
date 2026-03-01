'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { GameResult, GameStats } from '@/hooks/useStarShield'

interface ResultScreenProps {
    result: GameResult
    stats: GameStats
    onBackToTitle: () => void
}

const RESULT_CONFIG: Record<GameResult, {
    title: string
    subtitle: string
    color: string
    message: string
}> = {
    CLEARED: {
        title: 'CLEARED',
        subtitle: 'Mission Complete',
        color: '#818cf8',
        message: 'これで大丈夫。きみのおかげだ。へへ。',
    },
    FAILED_CONTACT: {
        title: 'FAILED',
        subtitle: 'Asteroid Contact',
        color: '#FF6666',
        message: 'まあ、こういう日もあるよ。でも、きみがいなかったらもっと大変だった。',
    },
    FAILED_TIMEOUT: {
        title: 'FAILED',
        subtitle: 'Time\'s Up',
        color: '#FF9944',
        message: 'まあ、こういう日もあるよ。でも、きみがいなかったらもっと大変だった。',
    },
}

export function ResultScreen({ result, stats, onBackToTitle }: ResultScreenProps) {
    const config = RESULT_CONFIG[result]
    const accuracy = stats.spawnedCount > 0
        ? Math.round((stats.destroyedCount / stats.spawnedCount) * 100)
        : 0
    const minutes = Math.floor(stats.durationSeconds / 60)
    const seconds = stats.durationSeconds % 60

    return (
        <div className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center">
            {/* グロー */}
            <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] rounded-full blur-3xl pointer-events-none"
                style={{ backgroundColor: `${config.color}10` }}
            />

            <motion.div
                className="relative z-10 flex flex-col items-center gap-8 px-6 text-center"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
            >
                {/* 結果タイトル */}
                <div className="flex flex-col items-center gap-3">
                    {result === 'FAILED_CONTACT' && (
                        <div className="relative w-20 h-20 shrink-0">
                            <Image
                                src="/svg/object/fire.svg"
                                alt=""
                                fill
                                className="object-contain drop-shadow-[0_0_25px_rgba(255,100,50,0.6)]"
                            />
                        </div>
                    )}
                    <div>
                        <div
                            className="text-7xl font-black tracking-[0.15em] uppercase"
                            style={{
                                color: config.color,
                                textShadow: `0 0 40px ${config.color}80`,
                            }}
                        >
                            {config.title}
                        </div>
                        <div className="text-white/40 font-mono text-sm tracking-[0.4em] uppercase mt-1">
                            {config.subtitle}
                        </div>
                    </div>
                </div>

                {/* 恐竜メッセージ */}
                <motion.div
                    className="rounded-xl px-8 py-5 max-w-md"
                    style={{
                        background: 'rgba(30,41,59,0.4)',
                        border: '1px solid rgba(129,140,248,0.2)',
                    }}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                >
                    <div className="relative w-14 h-14 mb-3 mx-auto">
                        <Image
                            src="/svg/charactor/annoying-dinosaur.svg"
                            alt=""
                            fill
                            className="object-contain"
                        />
                    </div>
                    <div className="text-white/80 text-sm leading-relaxed">
                        {config.message}
                    </div>
                </motion.div>

                {/* 統計 */}
                <motion.div
                    className="grid grid-cols-3 gap-6 w-full max-w-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                >
                    <div className="text-center">
                        <div className="text-2xl font-bold font-mono" style={{ color: config.color }}>
                            {stats.destroyedCount}/{stats.spawnedCount}
                        </div>
                        <div className="text-white/30 text-xs font-mono tracking-widest mt-1">DESTROYED</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold font-mono" style={{ color: config.color }}>
                            {accuracy}%
                        </div>
                        <div className="text-white/30 text-xs font-mono tracking-widest mt-1">ACCURACY</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold font-mono" style={{ color: config.color }}>
                            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                        </div>
                        <div className="text-white/30 text-xs font-mono tracking-widest mt-1">TIME</div>
                    </div>
                </motion.div>

                {/* タイトルに戻るボタン */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 0.5 }}
                >
                    <div
                        className="text-2xl font-black font-mono tracking-[0.2em] uppercase cursor-pointer text-white/60 hover:text-white transition-colors duration-200"
                        onClick={onBackToTitle}
                    >
                        ▶ BACK TO TITLE
                    </div>
                </motion.div>
            </motion.div>
        </div>
    )
}
