'use client'

import { useEffect, useLayoutEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { detectIncognito } from 'detectincognitojs'
import { SESSION_KEY_HAS_LOGGED_IN, SESSION_KEY_LOGIN_VISIT_COUNT, LOCAL_KEY_HAS_VISITED } from '@/shared/constants/storage'

/** キャッシュリセットしてきた人（初心者のフリ） */
const DIALOGUE_MESSAGES_CACHE_RESET = [
    '初心者のフリしてるの？顔変えられないんだからバレバレだよ',
]

/** シークレットモードで来た人 */
const DIALOGUE_MESSAGES_INCOGNITO = [
    'シークレットモードでくるなんて、僕に知られたくないことでもあるのかな？',
]

/** 初めて来た人（訪問0回） */
const DIALOGUE_MESSAGES_VISIT_0 = [
    'やぁ',
    'みない顔だね',
    'ゆっくりしていきなよ',
]

/** 2回目以降・まだログインしてない人（訪問1回以上） */
const DIALOGUE_MESSAGES_VISIT_1_PLUS = [
    'どこかでみたことある顔だね、前世は恐竜だった？',
    'ログイン怖いわかるよ。僕だって知らない恐竜に話しかけられたら逃げるし。',
    'まだログインしてないだね？君、慎重派だね。そんな奴も嫌いじゃないぜ',
]

/** ログイン済み・おかえり向け */
const DIALOGUE_MESSAGES_RETURNING = [
    'おかえり',
    'ちーっす',
    '最近どう？',
]

const ENTER_DURATION = 3
const IDLE_DURATION = 20
const EXIT_DURATION = 3
/** 2回目以降向け：退場後、再登場までの待機時間（秒） */
const VISIT_1_PLUS_REAPPEAR_DELAY_SEC = 30
/** 一文字表示の間隔（ms）喋るスピード感 */
const CHAR_INTERVAL_MS = 150
/** 吸い込まれるアニメーションの発生確率（0-1） */
const SUCKED_IN_PROBABILITY =  1
/** 吸い込まれるアニメーションの所要時間（秒） */
const SUCKED_IN_DURATION = 15

function getDialogueMessages(): string[] {
    if (typeof window === 'undefined') return DIALOGUE_MESSAGES_VISIT_0
    if (sessionStorage.getItem(SESSION_KEY_HAS_LOGGED_IN) === 'true') {
        return DIALOGUE_MESSAGES_RETURNING
    }
    const count = parseInt(sessionStorage.getItem(SESSION_KEY_LOGIN_VISIT_COUNT) ?? '0', 10)
    // キャッシュリセット検出：sessionStorageは0だがlocalStorageに訪問履歴あり
    if (count === 0 && localStorage.getItem(LOCAL_KEY_HAS_VISITED) === 'true') {
        return DIALOGUE_MESSAGES_CACHE_RESET
    }
    return count === 0 ? DIALOGUE_MESSAGES_VISIT_0 : DIALOGUE_MESSAGES_VISIT_1_PLUS
}

function markAsVisited(): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(LOCAL_KEY_HAS_VISITED, 'true')
}

function incrementVisitCount(): void {
    if (typeof window === 'undefined') return
    const count = parseInt(sessionStorage.getItem(SESSION_KEY_LOGIN_VISIT_COUNT) ?? '0', 10)
    sessionStorage.setItem(SESSION_KEY_LOGIN_VISIT_COUNT, String(count + 1))
}

/** 吸い込まれるアニメーション：画面外右上→中央下へ回転しながら流れる */
function SuckedInAnimation({ onComplete }: { onComplete: () => void }) {
    const SUCKED_IN_MESSAGE = 'うぁー、吸い込まれるー'

    useEffect(() => {
        const timer = setTimeout(onComplete, SUCKED_IN_DURATION * 1000)
        return () => clearTimeout(timer)
    }, [onComplete])

    return (
        <motion.div
            className="fixed left-1/2 top-0 z-40 pointer-events-none"
            initial={{ x: '100vw', y: '-110vh' }}
            animate={{ x: '-50%', y: '110vh' }}
            transition={{
                duration: SUCKED_IN_DURATION,
                ease: 'easeIn',
            }}
        >
            {/* SVGとチャットをくっつけて回転 */}
            <motion.div
                className="flex items-end gap-2"
                initial={{ rotate: 0 }}
                animate={{ rotate: 720 }}
                transition={{
                    duration: SUCKED_IN_DURATION,
                    ease: 'linear',
                }}
                style={{ transformOrigin: 'center center' }}
            >
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 shrink-0">
                    <Image
                        src="/svg/charactor/susum.svg"
                        alt="Susum"
                        fill
                        sizes="64px"
                        className="object-contain"
                    />
                </div>
                <div className="shrink-0 mb-1 px-2.5 py-1.5 rounded-xl border border-brand-200/20 bg-brand-300 text-white text-[10px] font-medium shadow-sm">
                    <span className="font-mono">{SUCKED_IN_MESSAGE}</span>
                </div>
            </motion.div>
        </motion.div>
    )
}

export function LoginSusumCharacter() {
    const [phase, setPhase] = useState<'entering' | 'idle' | 'exiting'>('entering')
    const [dialogueIndex, setDialogueIndex] = useState(0)
    const [dialogueMessages, setDialogueMessages] = useState<string[]>(DIALOGUE_MESSAGES_VISIT_0)
    const [displayedText, setDisplayedText] = useState('')
    const [isVisible, setIsVisible] = useState(true)
    const [repeatMessageSource, setRepeatMessageSource] = useState<'visit1plus' | 'returning' | null>(null)
    const [enterDirection, setEnterDirection] = useState<'left' | 'bottom' | null>(null)
    const [isSuckedInMode, setIsSuckedInMode] = useState<boolean | null>(null)

    // 描画前に方向を決定。低確率で吸い込まれるアニメーションに
    useLayoutEffect(() => {
        if (Math.random() < SUCKED_IN_PROBABILITY) {
            setIsSuckedInMode(true)
        } else {
            setEnterDirection(Math.random() < 0.5 ? 'left' : 'bottom')
        }
    }, [])

    useEffect(() => {
        if (isSuckedInMode) return
        const initMessages = async () => {
            const { isPrivate } = await detectIncognito()
            if (isPrivate) {
                setDialogueMessages(DIALOGUE_MESSAGES_INCOGNITO)
            } else {
                const messages = getDialogueMessages()
                markAsVisited()
                incrementVisitCount()
                // 2回目以降向け・ログイン済み向けは配列をそのまま使い、10秒ごとにランダム切り替え＋再登場ループ
                if (messages === DIALOGUE_MESSAGES_VISIT_1_PLUS) {
                    setDialogueMessages(messages)
                    setDialogueIndex(Math.floor(Math.random() * messages.length))
                    setRepeatMessageSource('visit1plus')
                } else if (messages === DIALOGUE_MESSAGES_RETURNING) {
                    setDialogueMessages(messages)
                    setDialogueIndex(Math.floor(Math.random() * messages.length))
                    setRepeatMessageSource('returning')
                } else {
                    setDialogueMessages(messages)
                }
            }
        }
        initMessages()
    }, [isSuckedInMode])


    useEffect(() => {
        if (isSuckedInMode || phase !== 'entering') return
        // 入場完了 → 待機
        const enterTimer = setTimeout(() => {
            setPhase('idle')
        }, ENTER_DURATION * 1000)

        return () => clearTimeout(enterTimer)
    }, [phase, isSuckedInMode])

    useEffect(() => {
        if (isSuckedInMode || phase !== 'idle') return

        // 待機中にセリフを切り替え（10秒ごと・ランダムで100種類以上対応）
        const dialogueInterval = setInterval(() => {
            setDialogueIndex(Math.floor(Math.random() * dialogueMessages.length))
        }, 10000)

        return () => clearInterval(dialogueInterval)
    }, [phase, dialogueMessages.length, isSuckedInMode])

    // 一文字ずつ表示（喋るスピード感）
    useEffect(() => {
        if (isSuckedInMode || phase !== 'idle') return

        const fullText = dialogueMessages[Math.min(dialogueIndex, dialogueMessages.length - 1)] ?? ''
        setDisplayedText('')

        let charIndex = 0
        const typeInterval = setInterval(() => {
            if (charIndex < fullText.length) {
                setDisplayedText(fullText.slice(0, charIndex + 1))
                charIndex++
            } else {
                clearInterval(typeInterval)
            }
        }, CHAR_INTERVAL_MS)

        return () => clearInterval(typeInterval)
    }, [phase, dialogueIndex, dialogueMessages, isSuckedInMode])

    useEffect(() => {
        if (isSuckedInMode || phase !== 'idle') return

        // 退場開始
        const exitTimer = setTimeout(() => {
            setPhase('exiting')
        }, IDLE_DURATION * 1000)

        return () => clearTimeout(exitTimer)
    }, [phase, isSuckedInMode])

    useEffect(() => {
        if (isSuckedInMode || phase !== 'exiting') return

        let reappearTimer: ReturnType<typeof setTimeout> | null = null

        // 退場アニメーション完了後に非表示
        const hideTimer = setTimeout(() => {
            setIsVisible(false)
            if (repeatMessageSource) {
                const source = repeatMessageSource === 'visit1plus' ? DIALOGUE_MESSAGES_VISIT_1_PLUS : DIALOGUE_MESSAGES_RETURNING
                // 50秒後に再登場
                reappearTimer = setTimeout(() => {
                    setDialogueMessages(source)
                    setDialogueIndex(Math.floor(Math.random() * source.length))
                    setDisplayedText('')
                    setEnterDirection(Math.random() < 0.5 ? 'left' : 'bottom') // 再登場時もランダム
                    setPhase('entering')
                    setIsVisible(true)
                }, VISIT_1_PLUS_REAPPEAR_DELAY_SEC * 1000)
            }
        }, EXIT_DURATION * 1000)

        return () => {
            clearTimeout(hideTimer)
            if (reappearTimer) clearTimeout(reappearTimer)
        }
    }, [phase, repeatMessageSource, isSuckedInMode])

    // 吸い込まれるアニメーション（低確率・無条件）
    if (isSuckedInMode) {
        return (
            <SuckedInAnimation
                onComplete={() => setIsSuckedInMode(false)}
            />
        )
    }

    if (!isVisible || enterDirection === null) return null

    const isFromBottom = enterDirection === 'bottom'
    const initialPos = isFromBottom
        ? { x: '-50%', y: '100%' }
        : { x: '-100%', y: 0 }
    const exitPos = isFromBottom
        ? { x: '-50%', y: '100%' }
        : { x: '-100%', y: 0 }
    const idlePos = isFromBottom ? { x: '-50%', y: 0 } : { x: 0, y: 0 }

    return (
        <motion.div
            className={`fixed bottom-0 z-40 flex items-end pointer-events-none ${isFromBottom ? 'left-1/2' : 'left-0'}`}
            initial={initialPos}
            animate={
                phase === 'entering'
                    ? idlePos
                    : phase === 'exiting'
                      ? exitPos
                      : idlePos
            }
            transition={{
                duration: phase === 'exiting' ? EXIT_DURATION : ENTER_DURATION,
                ease: phase === 'exiting' ? 'easeIn' : 'easeOut',
            }}
        >
            {/* キャラクターと吹き出しを横並び（絶対に被らない） */}
            <div className={`flex items-start gap-2 ${isFromBottom ? 'min-w-[280px]' : ''}`}>
                {/* キャラクター */}
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 shrink-0">
                    <Image
                        src="/svg/charactor/susum.svg"
                        alt="Susum"
                        fill
                        sizes="64px"
                        className="object-contain"
                        priority
                    />
                </div>

                {/* 中央から登場時：吹き出しスペースを事前に確保してレイアウトシフトを防ぐ */}
                {isFromBottom && phase !== 'idle' && <div className="min-w-[400px] shrink-0" aria-hidden />}

                {/* チャット風吹き出し：SVGと被らないよう右側に配置、しっぽは口方向へ */}
                {phase === 'idle' && (
                    <motion.div
                        className={`shrink-0 mt-2 ${isFromBottom ? 'w-[400px] min-w-[400px]' : 'min-w-[80px] max-w-[400px]'}`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                    >
                        <div className="relative px-2.5 py-1.5 rounded-xl border border-brand-200/20 bg-brand-300 text-white text-[10px] font-medium shadow-sm">
                            <span className="font-mono tracking-wide">
                                {displayedText}
                                {displayedText.length < (dialogueMessages[Math.min(dialogueIndex, dialogueMessages.length - 1)] ?? '').length && (
                                    <span className="inline-block w-0.5 h-3 ml-0.5 bg-current animate-pulse" aria-hidden />
                                )}
                            </span>
                            {/* 口方向へのしっぽ（吹き出しの左からキャラへ向かう） */}
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
