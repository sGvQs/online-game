'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { useSE } from '@/hooks/useSE'

const ENTER_DURATION = 3
const IDLE_DURATION = 8
const EXIT_DURATION = 3

/**
 * ダッシュボード用：ルーム削除の文句を言いにくるAnnoyingDinosaur
 * 下から出てきて1つの文句を言い、退場する
 * position: 'bottom' = 画面下中央, 'center' = 画面中央
 */
export function AnnoyingDinosaurComplaint({
    message,
    onComplete,
    position = 'bottom',
}: {
    message: string
    onComplete: () => void
    position?: 'bottom' | 'center'
}) {
    const { play } = useSE()
    const [phase, setPhase] = useState<'entering' | 'idle' | 'exiting'>('entering')
    const [displayedText, setDisplayedText] = useState('')

    useEffect(() => {
        if (phase !== 'idle') return

        /** 音を出さない文字（句読点・記号など） */
        const isSilentChar = (c: string) => /^[。、．，….\s「」『』（）]$/.test(c)

        let charIndex = 0
        const typeInterval = setInterval(() => {
            if (charIndex < message.length) {
                const nextChar = message[charIndex]
                if (nextChar && !isSilentChar(nextChar)) {
                    play('dinosaur')
                }
                setDisplayedText(message.slice(0, charIndex + 1))
                charIndex++
            } else {
                clearInterval(typeInterval)
            }
        }, 150)
        return () => clearInterval(typeInterval)
    }, [phase, message, play])

    useEffect(() => {
        if (phase !== 'entering') return
        const t = setTimeout(() => setPhase('idle'), ENTER_DURATION * 1000)
        return () => clearTimeout(t)
    }, [phase])

    useEffect(() => {
        if (phase !== 'idle') return
        const t = setTimeout(() => setPhase('exiting'), IDLE_DURATION * 1000)
        return () => clearTimeout(t)
    }, [phase])

    useEffect(() => {
        if (phase !== 'exiting') return
        const t = setTimeout(() => {
            onComplete()
        }, EXIT_DURATION * 1000)
        return () => clearTimeout(t)
    }, [phase, onComplete])

    const isCenter = position === 'center'
    const initialY = '100%'
    const idleY = isCenter ? '-50%' : 0
    const exitY = '100%'

    return (
        <motion.div
            className={`fixed left-1/2 z-0 flex items-end pointer-events-none ${isCenter ? 'top-1/2' : 'bottom-0'}`}
            style={{ width: 'min(460px, 90vw)' }}
            initial={{ x: '-50%', y: initialY }}
            animate={
                phase === 'entering'
                    ? { x: '-50%', y: idleY }
                    : phase === 'exiting'
                      ? { x: '-50%', y: exitY }
                      : { x: '-50%', y: idleY }
            }
            transition={{
                duration: phase === 'exiting' ? EXIT_DURATION : ENTER_DURATION,
                ease: phase === 'exiting' ? 'easeIn' : 'easeOut',
            }}
        >
            <div className="flex items-start gap-2 w-full">
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 shrink-0">
                    <Image
                        src="/svg/charactor/annoying-dinosaur.svg"
                        alt="Annoying Dinosaur"
                        fill
                        sizes="64px"
                        className="object-contain"
                    />
                </div>
                {phase !== 'entering' && (
                    <motion.div
                        className="shrink-0 mt-2 w-full max-w-[400px]"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                    >
                        <div className="relative px-2.5 py-1.5 rounded-xl border border-brand-200/20 bg-brand-300 text-white text-[10px] font-medium shadow-sm">
                            <span className="font-(--font-dot-gothic-16) tracking-wide">{displayedText}</span>
                            <div
                                className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-r-[6px] border-r-brand-300"
                                aria-hidden
                            />
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.div>
    )
}
