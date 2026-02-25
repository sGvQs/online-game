'use client'

import { useCallback, useEffect, useLayoutEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
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
    'まだログインしてないだね？もしかして僕に会いにきてるだけかな？',
    'あれ、デジャブ？君のその歩き方、絶滅した僕の親戚にそっくりだよ。',
    'ログインボタンは噛んだりしないよ。僕のほうがよっぽど強そうな牙持ってるしね。',
    '君がログインしない間に、僕の尻尾が3センチ伸びた気がする。時間は残酷だね。',
    'もしかして、パスワード忘れた？大丈夫、僕だって自分の卵の場所をたまに忘れるから。',
    'おっと、また会ったね。君の『ログインしない』っていう意志の強さ、化石級だよ。',
    'パスワードを打ち込むのが面倒？わかるよ。僕も短い前足でキーボードを打つのは『キョウリュウ』（恐縮）しちゃうからね。',
    'そんなに警戒しなくても、僕は君を食べたりしないよ。……今は、お腹いっぱいだしね。',
    'ここに来るたびにログインをスルーするなんて、君は本当に『レイケツ』な人間だね。爬虫類の僕が言うのもなんだけど。',
    'まだゲストのまま？君、もしかして絶滅危惧種の『シャイ・サウルス』だったりする？',
    'ログインしないままの君を眺めてたら、僕の角が少し削れたよ。ストレスかな、老化かな。',
    'ログインボタンが君を怖がってるよ。何度もクリック寸前で指を止めるからね。生殺しはよくないな。',
    '君がログインを迷ってる間に、新しい化石が一つ見つかったらしいよ。時間は待ってくれないんだ。',
    'まだゲストなんだね。……いいよ、ミステリアスな君も嫌いじゃない。ただ、僕の忍耐も絶滅寸前だけど。',
    'ログインボタンを押すのがそんなに重労働？……僕が隕石を止めるよりは簡単だと思うんだけどな。',
    '君のログイン履歴、砂漠みたいにカラカラだね。サボテンでも植えておこうか？',
    'そんなに遠くから見てないでさ。ログインして、僕の懐（ふところ）までおいでよ。……噛まない保証はないけど。',
    'ログインしないっていうポリシー、地層に刻んでおこうか。100万年後の誰かが感心してくれるかもね。',
    'ログインボタンが君を怖がってるよ。何度もクリック寸前で指を止めるからね。生殺しはよくないな。',
    'ログインボタンが君を怖がってるよ。何度もクリック寸前で指を止めるからね。生殺しはよくないな。',


]

/** ログイン済み・おかえり向け */
const DIALOGUE_MESSAGES_RETURNING = [
    'お、生きてたんだね。絶滅したかと思って、骨を拾う準備してたよ。',
    'おかえり。君がいない間、僕のあくびの回数が2回増えたよ。……退屈だったってことさ。',
    '最近どう？君の人生、僕の化石よりは動きがあることを祈ってるよ。',
    'やあ。また僕に会いに来たの？……ふうん、物好きな人間もいるもんだね。',
    'やあ。君がいない間、僕のこの硬い骨にヒビが入るくらいには退屈してたよ。',
    '生きてたんだ。君が戻ってこない間に、僕の尻尾がまた5センチ伸びた気がするよ。',
    'また君か。僕に会いに来るのが、君の『進化』の一部になってたりする？',
    'おかえり。……ふうん、その顔。外の世界も楽じゃないってことかな？',
    'また会えたね。君が絶滅してないか、1時間に1回くらいは心配してあげてたよ。',
    'また君か。……その顔、僕の皮肉が恋しくて戻ってきたってことでいいのかな？',
    'やあ。またその、何かに追われてるような顔で戻ってきたんだね。……隕石でも降ってきてるの？',
    'おかえり。君たち人間って、戦ってもいないのに勝手に疲弊してて不思議だよ。……まあ、どうでもいいけど。',
    'また君か。その『ストレス』ってやつ、美味しいの？……食べられないなら、さっさと捨てちゃえばいいのに。',
    '最近どう？君の言う『忙しい』って、僕が化石になるまでの時間に比べたら、まばたきみたいなもんでしょ。。',
    'おかえり。人間社会のルールってやつ、僕には複雑すぎて理解不能だよ。……シンプルに『食うか寝るか』じゃダメなの？',
    'おかえり。君たち人間って、戦ってもいないのに勝手に疲弊してて不思議だよ。……まあ、どうでもいいけど。',
    'また君か。その『ストレス』ってやつ、美味しいの？……食べられないなら、さっさと捨てちゃえばいいのに。',
    '最近どう？君の言う『忙しい』って、僕が化石になるまでの時間に比べたら、まばたきみたいなもんでしょ。。',
    'おかえり。人間社会のルールってやつ、僕には複雑すぎて理解不能だよ。……シンプルに『食うか寝るか』じゃダメなの？',
    'おかえり。君たち人間って、戦ってもいないのに勝手に疲弊してて不思議だよ。……まあ、どうでもいいけど。',
    'また君か。その『ストレス』ってやつ、美味しいの？……食べられないなら、さっさと捨てちゃえばいいのに。',
    '最近どう？君の言う『忙しい』って、僕が化石になるまでの時間に比べたら、まばたきみたいなもんでしょ。。',
    'おかえり。人間社会のルールってやつ、僕には複雑すぎて理解不能だよ。……シンプルに『食うか寝るか』じゃダメなの？',
    'おかえり。今日もその『シゴト』って群れの中で揉まれてきたの？……噛みつかれないなら、別に怖くないでしょ。',
    'やあ。君たちが必死に守ってるその『オカネ』って紙、食べられないよね？……何がそんなに大事なのか、僕にはさっぱりだよ。',
    'また君か。その『スマホ』って石、ずっと撫でてるけど何が出るの？……美味しい実でも詰まってるなら、僕にも一口ちょうだいよ。',
    'やあ。またそんな、獲物に逃げられたみたいな顔して戻ってきたね。……食べて寝れば治るんじゃない？知らんけど。',
    'おかえり。今日もその『SNS』って群れで吠え合ってきたの？……牙も届かない距離で、よくそんなに熱くなれるね。',
    '生きてたんだ。君たちが必死に積み上げてる『キャリア』って、僕の尻尾の一振りで崩れる岩山より脆そうだね。',
    'おかえり。……ふうん、今日もその『カイギ』って儀式で、鳴き声を交わし合ってきたんだ。結局、何も食べてないんでしょ？',
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
    'なんちゃって。……君、本気で心配した？ 僕がこんな『プログラムの穴』くらいで絶滅するわけないじゃない。',
    'なんちゃって。……重力ってやつ？ 人間が勝手に決めたルールに縛られるのは、僕のガラじゃないんだ。',
    'なんちゃって。……下に美味しい獲物でもいるかと思ったけど、ただの真っ白な空間だった。……無駄足だったね。',
    'なんちゃって。……地層の底まで旅してきたよ。君の悩みの種も、そこに埋めてきてあげようか？',
    'なんちゃって。……驚いた？ 君たちが必死に守ってる『常識』なんて、僕にとってはただの冗談みたいなもんさ。',
    'なんちゃって。……一瞬、君の視界から消えてあげたんだ。感謝してよ、少しは画面がスッキリしたでしょ？',

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
                    <span className="font-mono">{displayedText}</span>
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
                    <span className="font-mono">{SUCKED_IN_MESSAGE}</span>
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

    // 一文字ずつ表示（喋るスピード感）
    useEffect(() => {
        if (isInitialNantechatte || isRotatePattern || phase !== 'idle') return

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
