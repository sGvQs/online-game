'use client'

import { useEffect, useId, useRef, useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { BULLET_COLOR, DialogueLine } from '@/hooks/useStarShield'

const CUTE_FONT = 'var(--font-cherry-bomb-one)'

/** 恐竜の口（右端）から左へ発射する赤球 */
function TypistBullet({
    bulletColor,
    onComplete,
}: {
    bulletColor: string
    onComplete: () => void
}) {
    return (
        <motion.div
            className="absolute pointer-events-none z-20 rounded-full"
            style={{
                left: '100%',
                top: '50%',
                width: 12,
                height: 12,
                backgroundColor: bulletColor,
                boxShadow: `0 0 8px ${bulletColor}cc`,
            }}
            initial={{ x: -6, y: '-50%' }}
            animate={{
                x: '100vw',
                y: '-50%',
            }}
            transition={{
                duration: 0.4,
                ease: 'linear',
            }}
            onAnimationComplete={onComplete}
        />
    )
}

/** TypistView 用の星ビジュアル（中央下5%、表示のみ） */
function TypistStar() {
    const id = useId()
    const glowId = `typistStarGlow-${id}`
    return (
        <div
            className="absolute pointer-events-none z-0 overflow-visible"
            style={{
                left: '50%',
                bottom: '-25%',
                transform: 'translate(-50%, 50%)',
                width: '40vmax',
                height: '40vmax',
            }}
        >
            <svg
                viewBox="0 0 100 100"
                className="w-full h-full overflow-visible"
                fill="none"
                style={{ overflow: 'visible' }}
            >
                <defs>
                    <radialGradient id={glowId} cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="rgb(102,51,0)" />
                        <stop offset="50%" stopColor="rgb(153,76,0)" />
                        <stop offset="85%" stopColor="rgb(255,153,51)" />
                        <stop offset="100%" stopColor="rgb(255,204,153)" />
                    </radialGradient>
                </defs>
                <circle
                    cx="50"
                    cy="50"
                    r="48"
                    fill={`url(#${glowId})`}
                    style={{ filter: 'drop-shadow(0 0 50px rgba(180,150,90,0.5))' }}
                />
            </svg>
        </div>
    )
}

interface TypistViewProps {
    dialogue: {
        line: DialogueLine
        charIndex: number
    }
    score: { spawned: number; destroyed: number }
    starHp: number
    maxStarHp: number
    typistFireCount: number
}

function TypingDisplay({ line, charIndex }: { line: DialogueLine; charIndex: number }) {
    const done = line.romaji.slice(0, charIndex)
    const current = line.romaji[charIndex] ?? ''
    const rest = line.romaji.slice(charIndex + 1)

    return (
        <div className="flex flex-col items-center gap-6">
            {/* セリフウィンドウ */}
            <motion.div
                key={line.text}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="rounded-xl px-8 py-4 max-w-lg w-full text-center"
                style={{
                    background: 'rgba(30,41,59,0.4)',
                    border: '1px solid rgba(129,140,248,0.2)',
                }}
            >
                <div className="text-brand-500/60 text-xs tracking-widest mb-2">DIALOGUE</div>
                <div className="text-white text-2xl font-bold tracking-wider">{line.text}</div>
            </motion.div>

            {/* ローマ字入力欄 */}
            <div className="font-mono text-3xl tracking-[0.25em] select-none">
                <span className="text-white/20">{done}</span>
                <span className="text-brand-500 drop-shadow-[0_0_8px_rgba(129,140,248,0.9)] animate-pulse">
                    {current}
                </span>
                <span className="text-white/50">{rest}</span>
            </div>

            {/* 進捗バー */}
            <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                    className="h-full bg-brand-500/60 rounded-full"
                    animate={{
                        width: `${line.romaji.length > 0 ? (charIndex / line.romaji.length) * 100 : 0}%`
                    }}
                    transition={{ duration: 0.1 }}
                />
            </div>
        </div>
    )
}

export function TypistView({ dialogue, score, starHp, maxStarHp, typistFireCount }: TypistViewProps) {
    const inputRef = useRef<HTMLInputElement>(null)
    const prevStarHpRef = useRef(maxStarHp)
    const prevTypistFireCountRef = useRef(typistFireCount)
    const [damageWidth, setDamageWidth] = useState(0)
    const [bullets, setBullets] = useState<{ id: string }[]>([])

    useEffect(() => {
        inputRef.current?.focus()
    }, [])

    // ダメージ検知: starHp が減少したら赤バー幅をセット、0 へアニメーション
    useEffect(() => {
        const prev = prevStarHpRef.current
        if (starHp < prev && maxStarHp > 0) {
            const lost = (prev - starHp) / maxStarHp * 100
            setDamageWidth((w) => w + lost)
        }
        prevStarHpRef.current = starHp
    }, [starHp, maxStarHp])

    // タイピング成功時: 恐竜の口から赤球を左へ発射（typistFireCount の増加で検知、最後の1文字も含む）
    useEffect(() => {
        if (typistFireCount > prevTypistFireCountRef.current) {
            setBullets((b) => [...b, { id: crypto.randomUUID() }])
        }
        prevTypistFireCountRef.current = typistFireCount
    }, [typistFireCount])

    return (
        <div
            className="absolute inset-0 overflow-hidden flex flex-col items-center justify-start pt-16"
            onClick={() => inputRef.current?.focus()}
        >
            {/* フォーカス用隠しinput（モバイル対応） */}
            <input
                ref={inputRef}
                className="absolute opacity-0 w-0 h-0 pointer-events-none"
                readOnly
                aria-hidden="true"
            />

            {/* グロー装飾 */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div
                    className="w-[500px] h-[300px] rounded-full opacity-20 blur-3xl"
                    style={{
                        background: 'radial-gradient(ellipse at 50% 60%, rgba(168,85,247,0.6) 0%, rgba(99,102,241,0.4) 40%, transparent 70%)',
                    }}
                />
            </div>

            {/* 4. 星（中央下5%） */}
            <TypistStar />

            {/* 1. 隕石の破壊したカズゾーン（上部） */}
            <div className="w-full shrink-0 flex flex-col items-center gap-2 py-4 z-20 mt-10">
                <span
                    className="text-base text-brand-500/80"
                    style={{ fontFamily: CUTE_FONT }}
                >
                    いんせきをかはいしたかず
                </span>
                <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10">
                        <Image
                            src="/svg/object/metor.svg"
                            alt=""
                            fill
                            className="object-contain"
                        />
                    </div>
                    <span className="text-white/60 text-2xl">×</span>
                    <span
                        className="text-brand-500 font-bold text-3xl tabular-nums"
                        style={{ fontFamily: CUTE_FONT }}
                    >
                        {score.destroyed}
                    </span>
                </div>
            </div>

            {/* 2. タイピングゾーン（中央・恐竜+入力） */}
            <div className="flex-1 min-h-0 w-full flex flex-col items-center justify-center px-6 z-10">
                {/* 恐竜 + 発射エフェクト（口から左へ赤球） */}
                <div className="relative w-16 h-16 md:w-20 md:h-20 shrink-0 mb-4">
                    <motion.div
                        className="absolute inset-0 select-none"
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                    >
                        <Image
                            src="/svg/charactor/annoying-dinosaur.svg"
                            alt=""
                            fill
                            className="object-contain"
                        />
                    </motion.div>
                    {/* タイピング成功ごとに口（右端）から赤球を左へ発射 */}
                    <AnimatePresence>
                        {bullets.map(({ id }) => (
                            <TypistBullet
                                key={id}
                                bulletColor={BULLET_COLOR}
                                onComplete={() =>
                                    setBullets((b) => b.filter((x) => x.id !== id))
                                }
                            />
                        ))}
                    </AnimatePresence>
                </div>
                <div className="w-full max-w-xl">
                    <TypingDisplay line={dialogue.line} charIndex={dialogue.charIndex} />
                </div>
            </div>

            {/* 3. 星の体力ゾーン（中央下） */}
            <div className="w-full shrink-0 flex flex-col items-center gap-2 py-4 z-20">
                <span
                    className="text-md text-white"
                    style={{ fontFamily: CUTE_FONT }}
                >
                    ほしのたいりょく
                </span>
                <div className="relative w-64 md:w-80 h-3 rounded-full bg-stone-600/80 overflow-hidden">
                    {/* 緑: 現在HP（即時更新） */}
                    <div
                        className="absolute left-0 top-0 h-full bg-green-500 transition-all duration-150"
                        style={{ width: `${Math.max(0, (starHp / maxStarHp) * 100)}%` }}
                    />
                    {/* 赤: 損傷部分（スーッと消える） */}
                    {damageWidth > 0 && (
                        <motion.div
                            key={`dmg-${damageWidth}`}
                            className="absolute top-0 h-full bg-red-500 z-10 origin-left"
                            style={{
                                left: `${Math.max(0, (starHp / maxStarHp) * 100)}%`,
                            }}
                            initial={{ width: `${damageWidth}%` }}
                            animate={{ width: '0%' }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                            onAnimationComplete={() => setDamageWidth(0)}
                        />
                    )}
                </div>
            </div>

            {/* ロール表示 */}
            <div className="shrink-0 pb-8 text-brand-500/50 text-xs tracking-widest">
                TYPIST MODE — type the romaji to fire
            </div>
        </div>
    )
}
