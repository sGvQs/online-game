'use client'

import { useCallback, useEffect, useLayoutEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { detectIncognito } from 'detectincognitojs'
import { SESSION_KEY_HAS_LOGGED_IN, SESSION_KEY_LOGIN_VISIT_COUNT, LOCAL_KEY_HAS_VISITED } from '@/shared/constants/storage'
import { useSE } from '@/hooks/useSE'

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
    'あ、君だ。前にも来てたよね。覚えてたよ。また来てくれたんだ。嬉しいな。',
    'ログイン怖いなら、無理しなくていいよ。君が来てくれるだけで、僕は嬉しいんだ。',
    'また来てくれたのか。毎回同じ時間だな。君たち小さな恐竜は、規則正しいんだな。',
    'あれ、デジャブ？君のその歩き方、前に見た時と全く同じだ。信じられないくらい几帳面だな。',
    'ログインボタンは噛んだりしないよ。僕だって君を傷つけたくないんだ。',
    '君がログインしない間に、僕の尻尾が3センチ伸びた気がする。でも君が来たから、それでいいか。',
    'もしかして、何か怖いことがあったのか？……大丈夫。ここは安全だよ。僕がいるし。',
    'おっと、また会ったね。何度も来てくれるってことは……僕のことを信じてくれてるってことだな。ありがとう。',
    'ログインするまでに時間がかかってるんだ。そっか。君もいろいろ考えてるんだな。大変だ。',
    'そんなに警戒しなくても、僕は君を食べたりしないよ。君は僕の……友達だから。',
    'まだゲストのままなんだね。でもね、何度も来てくれるから、もう君のこと知ってるよ。大丈夫。',
    'ログインボタンが君を待ってるよ。でも焦らなくていい。君のペースでいいんだ。',
    '君がログインを迷ってる間に、僕はずっと君を待ってた。それくらいの時間、平気だよ。',
    'ゲストなんだね。……いいよ、君が準備できるまで、僕はここにいるから。',
    'ログインボタンを押すのが重労働に見えるのか？……でも毎回来てくれるから、君は『勇気がある小さな恐竜』なんだよ。',
    '君のその『迷い』ってやつ、よく分かるよ。でも大丈夫。僕がいるから。',
    'そんなに遠くから見ないでさ。怖かったら、僕の側に来ればいいよ。一緒にいようぜ。',
    'ログインするかしないか迷ってるんだね。……いいよ、焦らなくて。君が来てくれるだけで、僕は嬉しいんだ。',
    'また来てくれたんだ。何度も。君、本当は『ここ』が好きなんじゃないか？ 僕も君のこと好きだよ。',
    'ゲストのまま来てくれるってことは……君は僕を信じてくれてるんだ。そっか。頑張ろうな。',
]

/** ログイン済み・おかえり向け */
const DIALOGUE_MESSAGES_RETURNING = [
    'おかえり。相変わらず二本足で立ってるんだね。バランス感覚いいな。僕だったら転んでると思う。',
    'おかえり。君がいない間、僕はぷかぷか浮いてただけ。でも君は毎日何かしてるんだ。凄いよ。',
    'おかえり。……その『岩』、毎日持ってくるんだね。中に何か大事なものでも入ってるのか。よく運べるな、小さいのに。',
    'やあ。また来たのか。毎回同じ時間に来るって……君たち、『太陽の動き』で生きてるのか。規則正しいな。',
    'やあ。君がいない間、背中が痒くてしょうがなかったくらいには退屈してたよ。でも君が来たから退屈も吹き飛んだ。',
    'やあ。また戻ってきたね。君が大事そうに持ってるその『小さな骨』……すごく大切なんだな。よく守ってるよ。',
    'やあ。『疲れてるなら休め』って言いたいけど……君たち小さな恐竜、よく頑張ってる。本当に強いんだよ。',
    'また君か。今日も何かモヤモヤしてそうな顔してるな。そういう時は走るといいよ。気分がスッキリする。',
    'また君か。その『重い空気みたいなやつ』、いつも背負ってるんだな。小さい体でよく耐えてるな。',
    'また君か。毎日『同じ道』で来るけど……同じ道でも毎日違うことがあるんだろ。小さい体で大変だな。',
    'また君か。君がいない時間、僕は何もしてなかった。ただぷかぷか浮いてた。それでいいんだよ、人生って。',
    'また君か。……その顔、僕に会いたくて戻ってきたってことでいいのかな？ なんか嬉しいな。',
    'おかえり。人間って、戦ってもいないのに『お疲れ様』って鳴き合うんだね。……そっか、そうやって励まし合ってるのか。いいな。',
    'おかえり。君たち『ニンゲンサウルス』は、なんで群れの中でペコペコ頭を下げるの？ ……あ、相手を大事にしてるんだ。強さじゃなくて。',
    'おかえり。人間社会のルールってやつ、複雑だな。でも君が毎日頑張って従ってるんだから、きっと大事なんだろう。',
    'やあ。また戻ってきたね。君を困らせてるやつがいるなら、僕がそいつの頭の上でジャンプして、力になってあげよっか？',
    'やあ。その『光る石』ずっと持ってるけど……君にとってすごく大事なんだな。よく分かるよ。',
    'また君か。君の『心の中のザラザラ』ってやつ、なくなったのか？ あ、またあるんだ。頑張ってるな。',
    'また君か。毎日同じ場所に行くんだね。飽きないのか？ ……あ、そこが君の『群れの場所』なんだ。だから行くんだ。',
    '最近どう？ 夜も眠れないって言ってたけど……そんな時は、僕の側に来ればいいよ。一緒にぷかぷかしようぜ。',
    'やあ。相変わらず『一人』で来てるんだな。一人でここまで来るのって、結構すごいと思うぞ。小さいのに。',
]

const ENTER_DURATION = 3
const IDLE_DURATION = 20
/** なんちゃってパターン時の待機時間（秒） */
const IDLE_DURATION_AFTERMATH = 10
const EXIT_DURATION = 3
/** 2回目以降向け：退場後、再登場までの待機時間（秒） */
const VISIT_1_PLUS_REAPPEAR_DELAY_SEC = 10
/** 一文字表示の間隔（ms）喋るスピード感 */
const CHAR_INTERVAL_MS = 150
/** 吸い込まれた後の「なんちゃって」メッセージ（ランダム） */
const SUCKED_IN_AFTERMATH_MESSAGES = [
    'なんちゃって。……君、本気で心配してくれたの？ そっか。ありがとう。僕も君のことがいるから、簡単には消えないんだ。',
    'なんちゃって。……下にね、君の気持ちが落ちていくのが見えたんだ。だから戻ってきた。君に笑ってほしいから。',
    'なんちゃって。……本当に消えたら、君はどうするんだろうって思ったんだ。だから戻ってきた。',
    'なんちゃって。……君、本気で心配した？ 大丈夫だよ。僕はここにいる。',
    'なんちゃって。……下はね、真っ白で何もなかった。つまらなかったから戻ってきた。',
    'なんちゃって。……驚いたか。ごめんな。でも君が反応してくれるの、面白いんだ。',
    'なんちゃって。……一瞬消えてみただけ。すぐ戻るつもりだったよ。',

]
/** 各パターンの発生確率（5パターン中1つなので0.2） */
const PATTERN_PROBABILITY = 0.2
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

/**
 * パターン構成（5種類）:
 * 1. 左下から出てくる → 左に退場のみ
 * 2. 下から出てくる → 下に退場のみ
 * 3. 回転しながら喋ってる 左下=>右上
 * 4. 回転しながら喋ってる 左上=>右下
 * 5. なんちゃってパターン
 */
type EnterPattern = 'left' | 'bottom' | 'rotate-bl-tr' | 'rotate-tl-br' | 'nantechatte'

/** 回転しながら喋る方向（2パターン・吸い込まれると同じく常に動き続ける） */
type RotateFlowDirection = 'bl-tr' | 'tl-br'

/** 回転しながら喋るアニメーションの所要時間（吸い込まれると同様） */
const ROTATE_FLOW_DURATION = 60

/** 回転しながら喋ってるアニメーション：常に動き続ける（吸い込まれると同じ動き） */
function RotateWhileTalkingAnimation({
    direction,
    displayedText,
    onComplete,
}: {
    direction: RotateFlowDirection
    displayedText: string
    onComplete: () => void
}) {
    useEffect(() => {
        const timer = setTimeout(onComplete, ROTATE_FLOW_DURATION * 1000)
        return () => clearTimeout(timer)
    }, [onComplete])

    /** 左下=>右上 / 左上=>右下（画面外から画面外へ流れ続ける） */
    const positions = {
        'bl-tr': { initial: { x: '-80vw', y: '50vh' }, animate: { x: '80vw', y: '-80vh' } },
        'tl-br': { initial: { x: '-80vw', y: '50vh' }, animate: { x: '80vw', y: '-150vh' } },
    } as const
    const { initial, animate } = positions[direction]

    return (
        <motion.div
            className="fixed left-1/2 top-1/2 z-0 pointer-events-none"
            initial={initial}
            animate={animate}
            transition={{
                duration: ROTATE_FLOW_DURATION,
                ease: 'easeIn',
            }}
        >
            {/* [svg][text] でSVGを左軸に回転 */}
            <motion.div
                className="flex items-end gap-2"
                initial={{ rotate: 0 }}
                animate={{ rotate: 720 }}
                transition={{
                    duration: ROTATE_FLOW_DURATION,
                    ease: 'linear',
                }}
                style={{ transformOrigin: 'left center' }}
            >
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 shrink-0">
                    <Image
                        src="/svg/charactor/annoying-dinosaur.svg"
                        alt="Susum"
                        fill
                        sizes="64px"
                        className="object-contain"
                    />
                </div>
                <div className="shrink-0 mb-2 px-2.5 py-1.5 rounded-xl border border-brand-200/20 bg-brand-300 text-white text-[10px] font-medium shadow-sm max-w-[400px]">
                    <span className="font-(--font-dot-gothic-16)">{displayedText}</span>
                </div>
            </motion.div>
        </motion.div>
    )
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
            className="fixed left-1/2 top-0 z-0 pointer-events-none"
            initial={{ x: '60vw', y: '-100vh' }}
            animate={{ x: '-50%', y: '130vh' }}
            transition={{
                duration: SUCKED_IN_DURATION,
                ease: 'easeIn',
            }}
        >
            {/* [svg][text] でSVGを左軸に回転 */}
            <motion.div
                className="flex items-end gap-2"
                initial={{ rotate: 0 }}
                animate={{ rotate: 720 }}
                transition={{
                    duration: SUCKED_IN_DURATION,
                    ease: 'linear',
                }}
                style={{ transformOrigin: 'left center' }}
            >
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 shrink-0">
                    <Image
                        src="/svg/charactor/annoying-dinosaur.svg"
                        alt="Susum"
                        fill
                        sizes="64px"
                        className="object-contain"
                    />
                </div>
                <div className="shrink-0 mb-1 px-2.5 py-1.5 rounded-xl border border-brand-200/20 bg-brand-300 text-white text-[10px] font-medium shadow-sm">
                    <span className="font-(--font-dot-gothic-16)">{SUCKED_IN_MESSAGE}</span>
                </div>
            </motion.div>
        </motion.div>
    )
}

export function AnnoyingDinosaur() {
    const searchParams = useSearchParams()
    const forceVisit1Plus = searchParams.get('flow') === '1'

    const [phase, setPhase] = useState<'entering' | 'idle' | 'exiting'>('entering')
    const [dialogueIndex, setDialogueIndex] = useState(0)
    const [dialogueMessages, setDialogueMessages] = useState<string[]>(DIALOGUE_MESSAGES_VISIT_0)
    const [displayedText, setDisplayedText] = useState('')
    const [isVisible, setIsVisible] = useState(true)
    const [repeatMessageSource, setRepeatMessageSource] = useState<'visit1plus' | 'returning' | null>(null)
    const [enterPattern, setEnterPattern] = useState<EnterPattern | null>(null)
    const [enterFrom, setEnterFrom] = useState<'left' | 'bottom' | null>(null)
    const [rotateFlowDirection, setRotateFlowDirection] = useState<RotateFlowDirection | null>(null)
    const [isSuckedInAftermath, setIsSuckedInAftermath] = useState(false)

    const isInitialNantechatte = enterPattern === 'nantechatte' && !isSuckedInAftermath
    const isRotatePattern = enterPattern === 'rotate-bl-tr' || enterPattern === 'rotate-tl-br'
    /** 左下・下から：文言1個のみ（切り替えなし） */
    const isSimplePattern = enterPattern === 'left' || enterPattern === 'bottom'

    // 描画前に4パターンから1つを選択
    const pickPattern = useCallback(() => {
        const roll = Math.random()
        if (roll < PATTERN_PROBABILITY) {
            setEnterPattern('left')
            setEnterFrom('left')
            setRotateFlowDirection(null)
        } else if (roll < PATTERN_PROBABILITY * 2) {
            setEnterPattern('bottom')
            setEnterFrom('bottom')
            setRotateFlowDirection(null)
        } else if (roll < PATTERN_PROBABILITY * 3) {
            setEnterPattern('rotate-bl-tr')
            setEnterFrom('left')
            setRotateFlowDirection('bl-tr')
        } else if (roll < PATTERN_PROBABILITY * 4) {
            setEnterPattern('rotate-tl-br')
            setEnterFrom('left')
            setRotateFlowDirection('tl-br')
        } else {
            setEnterPattern('nantechatte')
            setEnterFrom(null)
            setRotateFlowDirection(null)
        }
    }, [])

    useLayoutEffect(() => {
        pickPattern()
    }, [pickPattern])

    useEffect(() => {
        if (enterPattern === 'nantechatte' || isSuckedInAftermath) return
        const initMessages = async () => {
            const { isPrivate } = await detectIncognito()
            if (isPrivate) {
                setDialogueMessages(DIALOGUE_MESSAGES_INCOGNITO)
            } else {
                const messages = getDialogueMessages()
                markAsVisited()
                incrementVisitCount()
                // 2回目以降向け・ログイン済み向けは配列をそのまま使い、10秒ごとにランダム切り替え＋再登場ループ
                // ?flow=1 で流れアニメーションをテスト可能
                if (forceVisit1Plus || messages === DIALOGUE_MESSAGES_VISIT_1_PLUS) {
                    const source = DIALOGUE_MESSAGES_VISIT_1_PLUS
                    setDialogueMessages(source)
                    setDialogueIndex(Math.floor(Math.random() * source.length))
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
    }, [enterPattern, isSuckedInAftermath, forceVisit1Plus])


    useEffect(() => {
        if (isInitialNantechatte || isRotatePattern || phase !== 'entering') return
        // 入場完了 → 待機
        const enterTimer = setTimeout(() => {
            setPhase('idle')
        }, ENTER_DURATION * 1000)

        return () => clearTimeout(enterTimer)
    }, [phase, isInitialNantechatte, isRotatePattern])

    useEffect(() => {
        if (isInitialNantechatte || isRotatePattern || isSimplePattern || phase !== 'idle') return

        // 待機中にセリフを切り替え（10秒ごと・visit1plus/returning向け）
        const dialogueInterval = setInterval(() => {
            setDialogueIndex(Math.floor(Math.random() * dialogueMessages.length))
        }, 10000)

        return () => clearInterval(dialogueInterval)
    }, [phase, dialogueMessages.length, isInitialNantechatte, isRotatePattern, isSimplePattern])


    const { play } = useSE();
    // 一文字ずつ表示（喋るスピード感）
    useEffect(() => {
        if (isInitialNantechatte || isRotatePattern || phase !== 'idle') return

        const fullText = dialogueMessages[Math.min(dialogueIndex, dialogueMessages.length - 1)] ?? ''
        setDisplayedText('')

        /** 音を出さない文字（句読点・記号など） */
        const isSilentChar = (c: string) => /^[。、．，….\s「」『』（）]$/.test(c)

        let charIndex = 0
        const typeInterval = setInterval(() => {
            if (charIndex < fullText.length) {
                const nextChar = fullText[charIndex]
                if (nextChar && !isSilentChar(nextChar)) {
                    play("dinosaur")
                }
                setDisplayedText(fullText.slice(0, charIndex + 1))
                charIndex++
            } else {
                clearInterval(typeInterval)
            }
        }, CHAR_INTERVAL_MS)

        return () => clearInterval(typeInterval)
    }, [phase, dialogueIndex, dialogueMessages, isInitialNantechatte, isRotatePattern])

    useEffect(() => {
        if (isInitialNantechatte || isRotatePattern || phase !== 'idle') return

        // 退場開始（回転パターンは常に動き続けるためここには来ない）
        const exitTimer = setTimeout(() => {
            setPhase('exiting')
        }, (isSuckedInAftermath ? IDLE_DURATION_AFTERMATH : IDLE_DURATION) * 1000)

        return () => clearTimeout(exitTimer)
    }, [phase, isInitialNantechatte, isRotatePattern, isSuckedInAftermath])

    const handleExitComplete = useCallback(() => {
        setIsVisible(false)
        setRotateFlowDirection(null)
        if (repeatMessageSource) {
            const source = repeatMessageSource === 'visit1plus' ? DIALOGUE_MESSAGES_VISIT_1_PLUS : DIALOGUE_MESSAGES_RETURNING
            setTimeout(() => {
                setDialogueMessages(source)
                setDialogueIndex(Math.floor(Math.random() * source.length))
                setDisplayedText('')
                pickPattern()
                setPhase('entering')
                setIsVisible(true)
            }, VISIT_1_PLUS_REAPPEAR_DELAY_SEC * 1000)
        }
    }, [repeatMessageSource, pickPattern])

    useEffect(() => {
        if (isInitialNantechatte || phase !== 'exiting' || rotateFlowDirection) return

        // 通常退場（回転パターン以外）の完了後に非表示
        const hideTimer = setTimeout(handleExitComplete, EXIT_DURATION * 1000)

        return () => clearTimeout(hideTimer)
    }, [phase, isInitialNantechatte, rotateFlowDirection, handleExitComplete])

    // 回転しながら喋ってる（パターン3・4の退場）
    // 回転しながら喋ってる（パターン3・4・常に動き続ける・吸い込まれると同じ）
    if (rotateFlowDirection) {
        const fullText = dialogueMessages[Math.min(dialogueIndex, dialogueMessages.length - 1)] ?? displayedText
        return (
            <RotateWhileTalkingAnimation
                direction={rotateFlowDirection}
                displayedText={fullText}
                onComplete={handleExitComplete}
            />
        )
    }

    // なんちゃってパターン（パターン4・吸い込まれる→なんちゃって、てへ）
    if (isInitialNantechatte) {
        return (
            <SuckedInAnimation
                onComplete={() => {
                    setIsSuckedInAftermath(true)
                    setEnterPattern('bottom')
                    setEnterFrom('bottom')
                    setDialogueMessages([
                        SUCKED_IN_AFTERMATH_MESSAGES[Math.floor(Math.random() * SUCKED_IN_AFTERMATH_MESSAGES.length)]!,
                    ])
                    setDialogueIndex(0)
                    setDisplayedText('')
                    setPhase('entering')
                    setIsVisible(true)
                }}
            />
        )
    }

    if (!isVisible || enterFrom === null) return null

    const isFromBottom = enterFrom === 'bottom'
    /** なんちゃって時：体が半分だけ出る（y: 50% = 自要素の半分上にずらして下半分を隠す） */
    const bottomIdleY = isSuckedInAftermath ? '10%' : 0
    const initialPos = isFromBottom
        ? { x: '-50%', y: '100%' }
        : { x: '-100%', y: 0 }
    const exitPos = isFromBottom
        ? { x: '-50%', y: '100%' }
        : { x: '-100%', y: 0 }
    const idlePos = isFromBottom ? { x: '-50%', y: bottomIdleY } : { x: 0, y: 0 }

    return (
        <motion.div
            className={`fixed bottom-0 z-0 flex items-end pointer-events-none ${isFromBottom ? 'left-1/2' : 'left-0'}`}
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
                        src="/svg/charactor/annoying-dinosaur.svg"
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
                            <span className="font-(--font-dot-gothic-16) tracking-wide">
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
