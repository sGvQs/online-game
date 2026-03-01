'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { DialogueLine } from '@/hooks/useStarShield'

const CUTE_FONT = 'var(--font-yusei-magic)'

interface TypistViewProps {
    dialogue: {
        line: DialogueLine
        charIndex: number
    }
    score: { spawned: number; destroyed: number }
    starHp: number
    maxStarHp: number
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

export function TypistView({ dialogue, score, starHp, maxStarHp }: TypistViewProps) {
    const inputRef = useRef<HTMLInputElement>(null)
    const prevStarHpRef = useRef(maxStarHp)
    const [damageWidth, setDamageWidth] = useState(0)

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

    return (
        <div
            className="absolute inset-0 overflow-hidden flex flex-col items-center justify-center gap-10"
            onClick={() => inputRef.current?.focus()}
        >
            {/* ほしのたいりょく（中央上・リッチHPバー） */}
            <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2">
                <span
                    className="text-sm text-brand-500/80"
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

            {/* 恐竜キャラクター */}
            <motion.div
                className="relative z-10 w-16 h-16 md:w-20 md:h-20 select-none"
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

            {/* タイピング表示 */}
            <div className="relative z-10 w-full max-w-xl px-6">
                <TypingDisplay line={dialogue.line} charIndex={dialogue.charIndex} />
            </div>

            {/* ロール表示 */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-brand-500/50 text-xs tracking-widest">
                TYPIST MODE — type the romaji to fire
            </div>
        </div>
    )
}
