'use client'

import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { toRomaji } from 'wanakana'
import { useSE } from '@/hooks/useSE'
import { createClient } from '@/utils/supabase/client'
import { saveStarShieldResult } from '@/server/actions/game'
import { STAR_TARGET_X, STAR_TARGET_Y, STAR_RADIUS } from '@/components/game/StarShieldGame/phases/playing/ProtectedStar'

/** ひらがな・カタカナ以外を除去して toRomaji に渡す（句読点はタイピング対象外） */
const KANA_ONLY = /[^\u3040-\u309F\u30A0-\u30FF\u31F0-\u31FF]/g
export const getRomaji = (text: string): string => toRomaji(text.replace(KANA_ONLY, ''))

// ============================================
// 定数・型
// ============================================

export type Difficulty = 'EASY' | 'NORMAL' | 'HARD' | 'HELL'
export type GameResult = 'CLEARED' | 'FAILED_CONTACT' | 'FAILED_TIMEOUT'

const GAME_DURATION_SECONDS = 90

// 座標系: ビューポート基準の正規化座標 (0-1)
import { DINO_SPAWN, BULLET_COLOR } from '@/components/game/StarShieldGame/constants'
export { DINO_SPAWN, BULLET_COLOR }
export const DINO_X = DINO_SPAWN.left / 100
export const DINO_Y = 1 - DINO_SPAWN.bottom / 100

/** 弾のスポーン位置オフセット（中心→口方向へ。正規化座標） */
export const BULLET_SPAWN_OFFSET_X = 0.055
export const BULLET_SPAWN_OFFSET_Y = 0.1
/** 弾の向き計算用：恐竜の口がアンカーより下にある分。負の値で弾が下に補正される */
const BULLET_ORIGIN_Y_OFFSET = -0.025
const SPAWN_X_MIN = 0.0   // 左
const SPAWN_X_MAX = 1.0  // 右
const SPAWN_Y_MIN = 0.1  // 下
const SPAWN_Y_MAX = 0.1  //  上
/** 隕石がスポーンから目標まで到達する時間（ms）。短いほど速い。HELL は playersTotalPoints で動的調整 */
const ASTEROID_DURATION_MS: Record<Exclude<Difficulty, 'HELL'>, number> = {
    EASY: 8000,
    NORMAL: 7000,
    HARD: 6000,
}
const HELL_ASTEROID_DURATION_BASE = 6000
const HELL_ASTEROID_DURATION_MIN = 2000

// 弾の設定（デバッグ用に BULLET_RADIUS を変数化）
const BULLET_SPEED = 0.0008 // 正規化座標/ms（速すぎないように）
// export const BULLET_RADIUS = 0.008 // デバッグ時は大きくできる
export const BULLET_RADIUS = 0.008 // デバッグ時は大きくできる
export const ASTEROID_RADIUS = 0.02
const BULLET_MAX_AGE_MS = 3000

// 隕石の目標点のランダムオフセット（±）
const STAR_TARGET_OFFSET = 0.04

// 隕石のスーポーン時間
const SPAWN_INTERVALS_MS: Record<Difficulty, number> = {
    EASY: 2000,
    NORMAL: 1500,
    HARD: 800,
    HELL: 200,
}

// 隕石のHP
export const ASTEROID_HP: Record<Difficulty, number> = {
    EASY: 3,
    NORMAL: 4,
    HARD: 5,
    HELL: 6,
}

// 星のHP
export const STAR_HP: Record<Difficulty, number> = {
    EASY: 20,
    NORMAL: 18,
    HARD: 15,
    HELL: 10,
}

/** 単語完了時の広範囲弾数（破壊なし。HELL は全破壊＋照準方向に弾で別扱い） */
const SPECIAL_SPREAD_BULLET_COUNT: Record<Difficulty, number> = {
    EASY: 12,
    NORMAL: 30,
    HARD: 60,
    HELL: 360,
}

/** EASY/NORMAL/HARD の必殺技の広がり角度（度） */
const SPREAD_DEG_EASY_NORMAL_HARD = 12
/** HELL 必殺技の広がり角度（度） */
const HELL_SPECIAL_SPREAD_DEG = 150
/** HELL 通常攻撃の弾数 */
const HELL_NORMAL_BULLET_COUNT = 3
/** HELL 通常攻撃の広がり角度（度） */
const HELL_NORMAL_SPREAD_DEG = 3

// ============================================
// セリフデータ（難易度によらず共通、配列からランダム選択）
// ============================================

export interface DialogueLine {
    text: string
}

export const DIALOGUES: DialogueLine[] = [
    // 昔の人間との出会い——ろけっと
    { text: 'あれは……ろけっと' },
    { text: 'まぶしいひかりが' },
    { text: 'とてつもないおとが' },
    { text: 'そらからおりてきた' },
    { text: 'ぼくはなにももっていなかった' },
    { text: 'このせかいにぼくだけだと思ってた' },
    { text: 'だからこわかった' },
    { text: 'あれはなんだ' },
    { text: 'てきなのか' },
    { text: 'じぶんいがいのなにか' },
    { text: 'ぼくはちかづいた' },
    { text: 'こわごわ' },
    { text: 'ひかりはきえた' },
    { text: 'あのなかから' },
    { text: 'なんかでてきた' },
    { text: 'なんだあれは' },
    { text: 'いきものか？' },
    { text: 'どうやらにんげんというらしい' },
    { text: 'にんげんってなんだ' },
    { text: 'けっきょく' },

    // 出会い直後——とまどいと感動
    { text: 'どうしたらいいかわからなかった' },
    { text: 'あのひとはなに？' },
    { text: 'ぼくとなにかちがう' },
    { text: 'あたたかかった' },
    { text: 'あのてをみたとき' },
    { text: 'ぼくはなにかをしった' },
    { text: 'こんなことがあるんだ' },

    // 生還の過程——まちつづける
    { text: 'ずっとういていた' },
    { text: 'どこかにいけば' },
    { text: 'あのひかりがもどるかもしれない' },
    { text: 'そうおもって' },
    { text: 'ぷかぷかうきながら' },
    { text: 'さがしてた' },
    { text: 'あのおとが' },
    { text: 'あのひとが' },
    { text: 'もどってこないかな' },
    { text: 'ずっと' },
    { text: 'もうなんねんだろう' },
    { text: 'ねんげつがたった' },
    { text: 'いつになったら' },
    { text: 'くるのかな' },
    { text: 'こないのかな' },
    { text: 'もっとまえ？' },
    { text: 'もうおぼえてない' },
    { text: 'いつのまにかときがたってた' },
    { text: 'ずっとまってた' },

    // わかれとさいかい
    { text: 'いつのまにかこなくなった' },
    { text: 'あのひと' },
    { text: 'ずっとまってた' },
    { text: 'またおりてきた' },
    { text: 'あのひかりが' },
    { text: 'ろけっとが' },
    { text: 'えっ' },
    { text: 'あのひとだ' },
    { text: 'あのひとがかえってきた' },

    // べつのにんげん——しゅうげきときゅうしゅつ
    { text: 'ちがうにんげんがきた' },
    { text: 'あのひとじゃない' },
    { text: 'あのひととちがう' },
    { text: 'こわかった' },
    { text: 'くらかった' },
    { text: 'ぼくをつかまえようとした' },
    { text: 'なんで？' },
    { text: 'ぼくはなにもしてない' },
    { text: 'でもあのひとがきた' },
    { text: 'あのひとが' },
    { text: 'ぼくをまもった' },
    { text: 'あのひとはつよかった' },
    { text: 'あのひとが' },
    { text: 'ぼくのために' },
    { text: 'たたかった' },

    // にんげんにもいろいろいることにきづく
    { text: 'にんげんって' },
    { text: 'いろいろなんだ' },
    { text: 'あのひとみたいなのもいるし' },
    { text: 'ぼくをおそうにんげんもいる' },
    { text: 'そういうものなのか' },
    { text: 'ぼくにはまだわからない' },
    { text: 'ほかのにんげんには' },
    { text: 'ぼくをきずつけるめをしてる' },
    { text: 'あのひとのめはちがった' },

    // ういんどーず95とのであい
    { text: 'あのとき、ぼくはなにももってなかった' },
    { text: 'でもあのひとがくれた' },
    { text: 'これがだいじなものだって' },
    { text: 'ずっとまもってた' },
    { text: 'たまにとまるけど' },
    { text: 'でもうごく' },
    { text: 'あのひとがくれたから' },
    { text: 'だからずっとだいじなの' },
    { text: 'ぱそこん' },
    { text: 'あのひかりがくれたもの' },
    { text: 'これをうしなったら' },

    // NULL HANDのおもいで
    { text: 'むずかしいあそびをおしえてくれた' },
    { text: 'るーるがあいまいで' },
    { text: 'でもなにかおもしろかった' },
    { text: 'わらってたきがする' },
    { text: 'あのひともあいまいだった' },
    { text: 'なにをかんがえてるかわからなかった' },
    { text: 'でもそれがすきだった' },
    { text: 'あのひととやっててたのしかった' },
    { text: 'ぼくはもっとしりたかった' },
    { text: 'あのひとのこと' },

    // わかれ
    { text: 'いつのまにかいなくなってた' },
    { text: 'なまえもおぼえてない' },
    { text: 'でもかおはおぼえてる' },
    { text: 'ずっとおぼえてる' },
    { text: 'わすれられない' },
    { text: 'あのえがお' },
    { text: 'あのこえ' },
    { text: 'あのぬくもり' },
    { text: 'ずっとずっとまえ' },
    { text: 'もうおぼえてない' },

    // きみとのかんけい
    { text: 'でもいま、きみがきた' },
    { text: 'あのひとじゃない' },
    { text: 'でもなにかおなじきがした' },
    { text: 'あのひとににてる' },
    { text: 'きみもそんなかんじがする' },
    { text: 'いっぱいはへんがおちてくる' },
    { text: 'でもいまはきみがいる' },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // せかいかんのようやく
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    // 〈ふゆう〉
    { text: 'ここはぷかぷかうちゅう' },
    { text: 'きみたちがあそぶばしょ' },
    { text: 'なんでもふわふわうく' },
    { text: 'じゅうりょくなんてない' },
    { text: 'ゆっくりゆっくりまわる' },
    { text: 'うえもしたもない' },
    { text: 'どこまでもつづく' },
    { text: 'ただういている' },
    { text: 'ぽかんとういている' },
    { text: 'どこまでもおちてくかんじ' },
    { text: 'でもこわくない' },
    { text: 'ここがすき' },
    { text: 'どこへでもいける' },
    { text: 'でもどこへもいけない' },
    { text: 'それがちょうどいい' },

    // 〈ほしとうちゅうのけしき〉
    { text: 'あのほしはなに？' },
    { text: 'まだなまえをしらない' },
    { text: 'とおくでひかってる' },
    { text: 'ずっとそこにいる' },
    { text: 'ちいさいほし' },
    { text: 'おおきいほし' },
    { text: 'よくわからないほし' },
    { text: 'ぜんぶきれい' },
    { text: 'ほしのちりがただよう' },
    { text: 'うっすらひかって' },
    { text: 'くもみたいなやつ' },
    { text: 'あれはなんだろう' },
    { text: 'あかいほし' },
    { text: 'あおいほし' },
    { text: 'しろいほし' },
    { text: 'たまにおれんじいろ' },
    { text: 'ほしがうまれてるばしょ' },
    { text: 'きれいだってことはわかる' },
    { text: 'ほしとほしのあいだ' },
    { text: 'そこをただよってる' },
    { text: 'ぷかぷかぷかぷか' },

    // 〈はへんとノイズとグリッチ〉
    { text: 'いっぱいはへんがおちてくる' },
    { text: 'どこからくるんだろう' },
    { text: 'ぐるぐるまわってる' },
    { text: 'きらきらひかってる' },
    { text: 'でもあたったらいたい' },
    { text: 'すこしくずれててもうごいてる' },
    { text: 'それがすきなんだ' },

    // 〈ふるいテクノロジーのびがく〉
    { text: 'もにたーのひかり' },
    { text: 'じーってしてる' },
    { text: 'ふるいけどあたたかい' },
    { text: 'あのぼんやりしたひかり' },
    { text: 'ちょっとぼやけてる' },
    { text: 'でもそれがいい' },
    { text: 'ぴこぴこおとがする' },
    { text: 'なつかしいかんじがする' },
    { text: 'おぼえてないのに' },
    { text: 'しってるきがする' },
    { text: 'かーそるがてんめつしてる' },
    { text: 'たぶん' },
    { text: 'なんだったんだろう' },
    { text: 'もうおぼえてない' },

    // 〈ひかりとかげ〉
    { text: 'まっくらなばしょがある' },
    { text: 'あっちにはいかない' },
    { text: 'でもきになる' },
    { text: 'なにがあるんだろう' },
    { text: 'そこだけほしもない' },
    { text: 'おともない' },
    { text: 'ただくらい' },
    { text: 'こっちはあかるい' },
    { text: 'あっちはくらい' },

    // 〈おととせいじゃく〉
    { text: 'うちゅうってしずかじゃないんだ' },
    { text: 'たまにどんって' },
    { text: 'とおくでどかん' },
    { text: 'でもすぐしずかになる' },
    { text: 'しずかすぎる' },
    { text: 'でもなれた' },
    { text: 'きみのきーぼーどのおと' },
    { text: 'ぱちぱちぱち' },
    { text: 'いいおとだな' },
    { text: 'すきかも' },
    { text: 'きみがうつおと' },
    { text: 'ここまできこえてくる' },
    { text: 'うれしい' },

    // 〈じかんのかんかく〉
    { text: 'ここではじかんがゆっくりながれる' },
    { text: 'いちにちがとてもながい' },
    { text: 'あっというまに' },
    { text: 'じかんのかんかくがおかしい' },
    { text: 'でもそれでいい' },
    { text: 'いつだっていま' },
    { text: 'いましかない' },
    { text: 'きみといるこのじかん' },
    { text: 'おわらないでほしい' },
    { text: 'でもおわる' },
    { text: 'それでいい' },
    { text: 'またきてくれるから' },

    // 〈うちゅうのこどくとあたたかさ〉
    { text: 'ひとりのじかんがながかった' },
    { text: 'ものすごく' },
    { text: 'でもきらいじゃなかった' },
    { text: 'ひとりはすき' },
    { text: 'でもだれかとはなすのもすき' },
    { text: 'なんかいい' },
    { text: 'きみがきてから' },
    { text: 'ここがもっとすきになった' },
    { text: 'なぜかわからないけど' },
    { text: 'そういうもんなんだろうな' },
    { text: 'きみがいるとちがう' },
    { text: 'なにかかわる' },
    { text: 'うまくいえないけど' },
]

const pickRandomDialogue = (): DialogueLine =>
    DIALOGUES[Math.floor(Math.random() * DIALOGUES.length)]

// ============================================
// 隕石・弾の型
// ============================================

export interface Asteroid {
    id: string
    spawnedAt: number
    spawnX: number // 0-1（スポーン時 X）
    spawnY: number // 0-1（スポーン時 Y）
    targetX: number // 0-1（飛翔先 X、星中心+ランダム）
    targetY: number // 0-1（飛翔先 Y、星中心+ランダム）
    durationMs: number // スポーン→目標までの時間（ms）
    hp: number // 現在HP（0で破壊）
    destroyedAt?: number
    hasDamagedStar?: boolean // 星にダメージを与えたか
}

export interface Bullet {
    id: string
    firedAt: number
    startX: number
    startY: number
    dirX: number
    dirY: number
}

// ============================================
// 位置計算ユーティリティ
// ============================================

export function getAsteroidPosition(asteroid: Asteroid, now: number): { x: number; y: number } {
    const elapsed = now - asteroid.spawnedAt
    const progress = Math.min(1, elapsed / asteroid.durationMs)
    return {
        x: asteroid.spawnX + (asteroid.targetX - asteroid.spawnX) * progress,
        y: asteroid.spawnY + (asteroid.targetY - asteroid.spawnY) * progress,
    }
}

export function getBulletPosition(bullet: Bullet, now: number): { x: number; y: number } {
    const elapsed = now - bullet.firedAt
    const dist = BULLET_SPEED * elapsed
    return {
        x: bullet.startX + bullet.dirX * dist,
        y: bullet.startY + bullet.dirY * dist,
    }
}

// ============================================
// Hook
// ============================================

interface UseStarShieldProps {
    matchId: string
    startedAt: number   // Unix ms timestamp（マッチ作成時刻）
    isShooter: boolean
    difficulty: Difficulty
    currentUserId: string
    onGameEnd: (result: GameResult, stats: GameStats) => void
    /** HELL 難易度時、両プレイヤーの合計 pt で隕石速度を調整（6000 - totalPt） */
    playersTotalPoints?: number
}

export interface GameStats {
    spawnedCount: number
    destroyedCount: number
    durationSeconds: number
    /** broadcast fire イベント数（送信文字数）フロント完結 */
    fireCount: number
}

/** game_state broadcast のペイロード（ホストが一元管理し Typist に通知） */
interface GameStatePayload {
    spawned: number
    destroyed: number
    fireCount: number
    starHp: number
}

/** game_end broadcast のペイロード */
interface GameEndPayload {
    result: GameResult
    stats: GameStats
}

const GAME_STATE_THROTTLE_MS = 100

export function useStarShield({
    matchId,
    startedAt,
    isShooter,
    difficulty,
    onGameEnd,
    playersTotalPoints = 0,
}: UseStarShieldProps) {
    const supabase = useMemo(() => createClient(), [])
    const channelName = `star_shield_fire_${matchId}`
    const { play } = useSE()
    const playVoiceRef = useRef(play)
    playVoiceRef.current = play

    // ゲーム状態（Shooter のみ asteroids, bullets を管理、Typist は不要）
    const [asteroids, setAsteroids] = useState<Asteroid[]>([])
    const [bullets, setBullets] = useState<Bullet[]>([])
    const [timer, setTimer] = useState(GAME_DURATION_SECONDS)
    const [score, setScore] = useState({ spawned: 0, destroyed: 0 })
    const maxStarHp = STAR_HP[difficulty]
    const [starHp, setStarHp] = useState(maxStarHp)

    // タイピング状態（Typist のみ）：配列からランダムに選択
    const [currentLine, setCurrentLine] = useState<DialogueLine | null>(() =>
        isShooter ? null : pickRandomDialogue()
    )
    const [charIndex, setCharIndex] = useState(0)
    /** Typist の正解打鍵回数（発射エフェクト用・最後の1文字も含む） */
    const [typistFireCount, setTypistFireCount] = useState(0)

    // Refs
    const asteroidsRef = useRef<Asteroid[]>([])
    const bulletsRef = useRef<Bullet[]>([])
    const scoreRef = useRef({ spawned: 0, destroyed: 0 })
    const fireCountRef = useRef(0)
    const starHpRef = useRef(maxStarHp)
    const aimRef = useRef({ x: 0.5, y: 0.5 }) // 正規化座標 0-1
    const gameEndedRef = useRef(false)
    const contactPendingRef = useRef(false)
    const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
    /** 時刻ズレ補正時のみセット。duration 計算で使用 */
    const effectiveStartedAtRef = useRef<number | null>(null)
    const lastGameStateSendRef = useRef(0)

    useEffect(() => {
        starHpRef.current = starHp
    }, [starHp])

    /** Shooter: game_state を broadcast（スロットリング付き） */
    const sendGameState = useCallback(() => {
        if (!isShooter) return
        const now = Date.now()
        if (now - lastGameStateSendRef.current < GAME_STATE_THROTTLE_MS) return
        lastGameStateSendRef.current = now
        channelRef.current?.send({
            type: 'broadcast',
            event: 'game_state',
            payload: {
                spawned: scoreRef.current.spawned,
                destroyed: scoreRef.current.destroyed,
                fireCount: fireCountRef.current,
                starHp: starHpRef.current,
            } satisfies GameStatePayload,
        })
    }, [isShooter])

    /** 隕石接触時の爆発位置・対象隕石ID（アニメ終了後に FAILED 遷移、対象隕石は非表示） */
    const [contactExplosion, setContactExplosion] = useState<{ x: number; y: number; asteroidId: string } | null>(null)

    // ============================================
    // ゲーム終了処理
    // ============================================

    const endGame = useCallback(async (result: GameResult) => {
        if (gameEndedRef.current) return
        gameEndedRef.current = true

        const baseStartedAt = effectiveStartedAtRef.current ?? startedAt
        const durationSeconds = Math.round((Date.now() - baseStartedAt) / 1000)
        const stats: GameStats = {
            spawnedCount: scoreRef.current.spawned,
            destroyedCount: scoreRef.current.destroyed,
            durationSeconds,
            fireCount: fireCountRef.current,
        }

        // Shooter: DB 保存を先に完了してから結果画面へ（returnToRoom による Match 削除との競合を防ぐ）
        if (isShooter) {
            try {
                await saveStarShieldResult(matchId, {
                    spawnedCount: stats.spawnedCount,
                    destroyedCount: stats.destroyedCount,
                    isCleared: result === 'CLEARED',
                    failureReason: result !== 'CLEARED' ? result : undefined,
                    durationSeconds: stats.durationSeconds,
                    difficulty,
                })
            } catch (e) {
                console.error('結果保存失敗:', e)
            }
            // Typist へ game_end を broadcast（postgres_changes の代替）
            channelRef.current?.send({
                type: 'broadcast',
                event: 'game_end',
                payload: { result, stats } satisfies GameEndPayload,
            })
        }

        onGameEnd(result, stats)
    }, [isShooter, matchId, startedAt, onGameEnd, difficulty])

    // ============================================
    // Supabase Realtime チャンネル
    // broadcast: fire, game_state, game_end（postgres_changes 廃止、ホスト集中管理）
    // ============================================

    useEffect(() => {
        const channel = supabase.channel(channelName)
        channelRef.current = channel

        channel
            // Typist → Shooter: fire イベント（broadcast）→ 弾を生成（送信文字数として両者でカウント）
            .on('broadcast', { event: 'fire' }, ({ payload }: { payload?: { special?: boolean } }) => {
                fireCountRef.current += 1
                playVoiceRef.current('shooting') // Shooter が fire を受信＝弾発射時
                if (isShooter) sendGameState()
                if (!isShooter) return

                const now = Date.now()

                if (payload?.special) {
                    if (difficulty === 'HELL') {
                        playVoiceRef.current('star-damage')
                        // HELL 必殺技: 全隕石一斉破壊 ＋ 全方位に弾を放出
                        const asts = asteroidsRef.current
                        const toDestroy = asts.filter((a) => !a.destroyedAt)
                        const destroyedCount = toDestroy.length

                        if (toDestroy.length > 0) {
                            setAsteroids((prev) => {
                                const ids = new Set(toDestroy.map((a) => a.id))
                                const next = prev.map((a) =>
                                    ids.has(a.id) ? { ...a, destroyedAt: now, hp: 0 } : a
                                )
                                asteroidsRef.current = next
                                return next
                            })
                            setScore((prev) => {
                                const next = { ...prev, destroyed: prev.destroyed + destroyedCount }
                                scoreRef.current = next
                                return next
                            })
                            sendGameState()
                        }

                        const hellBulletCount = SPECIAL_SPREAD_BULLET_COUNT[difficulty]
                        const aim = aimRef.current
                        const originY = DINO_Y + BULLET_ORIGIN_Y_OFFSET
                        const dx = aim.x - DINO_X
                        const dy = aim.y - originY
                        const len = Math.hypot(dx, dy)
                        const centerAngle = len >= 0.001 ? Math.atan2(dy, dx) : 0
                        const hellSpreadRad = (HELL_SPECIAL_SPREAD_DEG * Math.PI) / 180
                        const newBullets: Bullet[] = []
                        for (let i = 0; i < hellBulletCount; i++) {
                            const angle =
                                centerAngle -
                                hellSpreadRad / 2 +
                                (hellBulletCount > 1 ? (hellSpreadRad * i) / (hellBulletCount - 1) : 0)
                            const dirX = Math.cos(angle)
                            const dirY = Math.sin(angle)
                            newBullets.push({
                                id: crypto.randomUUID(),
                                firedAt: now,
                                startX: DINO_X + dirX * BULLET_SPAWN_OFFSET_X,
                                startY: DINO_Y + dirY * BULLET_SPAWN_OFFSET_Y,
                                dirX,
                                dirY,
                            })
                        }
                        setBullets((prev) => {
                            const next = [...prev, ...newBullets]
                            bulletsRef.current = next
                            return next
                        })
                    } else {
                        // EASY/NORMAL/HARD: 破壊なしで照準方向を中心に弾を放出
                        const aim = aimRef.current
                        const originY = DINO_Y + BULLET_ORIGIN_Y_OFFSET
                        const dx = aim.x - DINO_X
                        const dy = aim.y - originY
                        const len = Math.hypot(dx, dy)
                        const centerAngle = len >= 0.001 ? Math.atan2(dy, dx) : 0 // 照準方向（len小は右向き）
                        const spreadRad = (SPREAD_DEG_EASY_NORMAL_HARD * Math.PI) / 180
                        const count = SPECIAL_SPREAD_BULLET_COUNT[difficulty]
                        const newBullets: Bullet[] = []
                        for (let i = 0; i < count; i++) {
                            const angle =
                                centerAngle -
                                spreadRad / 2 +
                                (count > 1 ? (spreadRad * i) / (count - 1) : 0)
                            const dirX = Math.cos(angle)
                            const dirY = Math.sin(angle)
                            newBullets.push({
                                id: crypto.randomUUID(),
                                firedAt: now,
                                startX: DINO_X + dirX * BULLET_SPAWN_OFFSET_X,
                                startY: DINO_Y + dirY * BULLET_SPAWN_OFFSET_Y,
                                dirX,
                                dirY,
                            })
                        }
                        setBullets((prev) => {
                            const next = [...prev, ...newBullets]
                            bulletsRef.current = next
                            return next
                        })
                    }
                    return
                }

                // 通常攻撃（HELL は 12 発を 30 度、その他は単弾）
                const aim = aimRef.current
                const originY = DINO_Y + BULLET_ORIGIN_Y_OFFSET
                const dx = aim.x - DINO_X
                const dy = aim.y - originY
                const len = Math.hypot(dx, dy)
                if (len < 0.001) return // 照準が恐竜にほぼ重なっている場合は弾を出さない

                const centerAngle = Math.atan2(dy, dx)
                const dirX = dx / len
                const dirY = dy / len

                if (difficulty === 'HELL') {
                    const spreadRad = (HELL_NORMAL_SPREAD_DEG * Math.PI) / 180
                    const count = HELL_NORMAL_BULLET_COUNT
                    const newBullets: Bullet[] = []
                    for (let i = 0; i < count; i++) {
                        const angle =
                            centerAngle -
                            spreadRad / 2 +
                            (count > 1 ? (spreadRad * i) / (count - 1) : 0)
                        const bDirX = Math.cos(angle)
                        const bDirY = Math.sin(angle)
                        newBullets.push({
                            id: crypto.randomUUID(),
                            firedAt: now,
                            startX: DINO_X + bDirX * BULLET_SPAWN_OFFSET_X,
                            startY: DINO_Y + bDirY * BULLET_SPAWN_OFFSET_Y,
                            dirX: bDirX,
                            dirY: bDirY,
                        })
                    }
                    setBullets((prev) => {
                        const next = [...prev, ...newBullets]
                        bulletsRef.current = next
                        return next
                    })
                } else {
                    const bullet: Bullet = {
                        id: crypto.randomUUID(),
                        firedAt: now,
                        startX: DINO_X + dirX * BULLET_SPAWN_OFFSET_X,
                        startY: DINO_Y + dirY * BULLET_SPAWN_OFFSET_Y,
                        dirX,
                        dirY,
                    }
                    setBullets((prev) => {
                        const next = [...prev, bullet]
                        bulletsRef.current = next
                        return next
                    })
                }
            })
            // Typist: ホストが一元管理する game_state を受信
            .on('broadcast', { event: 'game_state' }, ({ payload }: { payload?: GameStatePayload }) => {
                if (isShooter || !payload) return
                if (payload.starHp < starHpRef.current) playVoiceRef.current('star-damage')
                setScore({ spawned: payload.spawned, destroyed: payload.destroyed })
                setStarHp(payload.starHp)
                fireCountRef.current = payload.fireCount
                setTypistFireCount(payload.fireCount)
            })
            // Typist: ホストが game_end を broadcast（postgres_changes の代替）
            .on('broadcast', { event: 'game_end' }, ({ payload }: { payload?: GameEndPayload }) => {
                if (isShooter || !payload) return
                if (gameEndedRef.current) return
                gameEndedRef.current = true
                onGameEnd(payload.result, payload.stats)
            })
            .subscribe()

        // Shooter: 初回 game_state を送信（Typist の初期同期用）
        if (isShooter) {
            lastGameStateSendRef.current = 0
            sendGameState()
        }

        return () => {
            supabase.removeChannel(channel)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [matchId])

    // ============================================
    // タイマー（startedAt ベースで両者独立計算）
    // クライアント・サーバー時刻ズレ対策: 初回時点で remaining<=0 なら
    // クライアント基準で開始時刻を補正し、即CLEARを防ぐ
    // ============================================

    useEffect(() => {
        effectiveStartedAtRef.current = null

        const getBase = () => effectiveStartedAtRef.current ?? startedAt
        const calcRemaining = () =>
            Math.max(0, GAME_DURATION_SECONDS - Math.floor((Date.now() - getBase()) / 1000))

        // 初回計算で既に残り時間が 0 以下の場合（時刻ズレ）→ クライアント基準で開始時刻を補正
        let initialRemaining = calcRemaining()
        if (initialRemaining <= 0) {
            effectiveStartedAtRef.current = Date.now()
            initialRemaining = GAME_DURATION_SECONDS
        }

        setTimer(initialRemaining)

        const interval = setInterval(() => {
            const remaining = calcRemaining()
            setTimer(remaining)

            if (remaining <= 0) {
                clearInterval(interval)
                if (!isShooter || gameEndedRef.current) return

                // Shooter: タイムアップ = 生還（成功）
                endGame('CLEARED')
            }
        }, 1000)

        return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [matchId, startedAt])

    // ============================================
    // Shooter のみ: 隕石スポーン + 接触ゲームオーバー検知
    // ============================================

    useEffect(() => {
        if (!isShooter) return

        const spawnInterval = SPAWN_INTERVALS_MS[difficulty]
        let spawnTimer: ReturnType<typeof setInterval> | null = null
        let rafId: number | null = null

        // 隕石スポーン（上中央ゾーンから星方向へ、目標は星中心+ランダムオフセット）
        spawnTimer = setInterval(() => {
            if (gameEndedRef.current || contactPendingRef.current) return
            const targetX = STAR_TARGET_X + (Math.random() * 2 - 1) * STAR_TARGET_OFFSET
            const targetY = STAR_TARGET_Y + (Math.random() * 2 - 1) * STAR_TARGET_OFFSET
            const durationMs =
                difficulty === 'HELL'
                    ? Math.max(HELL_ASTEROID_DURATION_MIN, HELL_ASTEROID_DURATION_BASE - playersTotalPoints)
                    : ASTEROID_DURATION_MS[difficulty]
            const asteroid: Asteroid = {
                id: crypto.randomUUID(),
                spawnedAt: Date.now(),
                spawnX: SPAWN_X_MIN + Math.random() * (SPAWN_X_MAX - SPAWN_X_MIN),
                spawnY: SPAWN_Y_MIN + Math.random() * (SPAWN_Y_MAX - SPAWN_Y_MIN),
                targetX,
                targetY,
                durationMs,
                hp: ASTEROID_HP[difficulty],
            }
            setAsteroids((prev) => {
                const next = [...prev, asteroid]
                asteroidsRef.current = next
                return next
            })
            setScore((prev) => {
                const next = { ...prev, spawned: prev.spawned + 1 }
                scoreRef.current = next
                return next
            })
            sendGameState()
        }, spawnInterval)

        // 弾・隕石の当たり判定 + 隕石→星の接触判定ループ
        const gameLoop = () => {
            if (gameEndedRef.current || contactPendingRef.current) return
            const now = Date.now()
            const asts = asteroidsRef.current
            const bts = bulletsRef.current

            // 弾 vs 隕石の当たり判定（1弾1ヒット、hp減算、hp<=0で破壊）
            const hitBulletIds = new Set<string>()
            const hitAsteroidIds = new Set<string>() // このフレームでヒットした隕石
            for (const bullet of bts) {
                if (hitBulletIds.has(bullet.id)) continue
                const bp = getBulletPosition(bullet, now)
                for (const a of asts) {
                    if (a.destroyedAt || hitAsteroidIds.has(a.id)) continue
                    const ap = getAsteroidPosition(a, now)
                    const dist = Math.hypot(bp.x - ap.x, bp.y - ap.y)
                    if (dist < ASTEROID_RADIUS + BULLET_RADIUS) {
                        hitBulletIds.add(bullet.id)
                        hitAsteroidIds.add(a.id)
                        break
                    }
                }
            }
            if (hitAsteroidIds.size > 0) {
                const hpUpdates = new Map<string, number>()
                let destroyedCount = 0
                for (const ast of asts) {
                    if (hitAsteroidIds.has(ast.id)) {
                        const newHp = ast.hp - 1
                        hpUpdates.set(ast.id, newHp)
                        if (newHp <= 0) destroyedCount++
                    }
                }
                setAsteroids((prev) => {
                    const next = prev.map((ast) => {
                        const newHp = hpUpdates.get(ast.id)
                        if (newHp === undefined) return ast
                        if (newHp <= 0) return { ...ast, hp: 0, destroyedAt: now }
                        return { ...ast, hp: newHp }
                    })
                    asteroidsRef.current = next
                    return next
                })
                setBullets((prev) => {
                    const next = prev.filter((b) => !hitBulletIds.has(b.id))
                    bulletsRef.current = next
                    return next
                })
                if (destroyedCount > 0) {
                    setScore((prev) => {
                        const next = { ...prev, destroyed: prev.destroyed + destroyedCount }
                        scoreRef.current = next
                        return next
                    })
                    sendGameState()
                }
            }

            // 古い弾を削除
            const toRemove = bts.filter((b) => now - b.firedAt > BULLET_MAX_AGE_MS)
            if (toRemove.length > 0) {
                const ids = new Set(toRemove.map((b) => b.id))
                setBullets((prev) => {
                    const next = prev.filter((b) => !ids.has(b.id))
                    bulletsRef.current = next
                    return next
                })
            }

            // 隕石 vs 星の接触判定（このフレームで破壊される隕石は除外）
            const destroyedThisFrame = new Set(
                [...hitAsteroidIds].filter((id) => {
                    const a = asts.find((x) => x.id === id)
                    return a && a.hp - 1 <= 0
                })
            )
            const contacts = asts.filter((a) => {
                if (a.destroyedAt || destroyedThisFrame.has(a.id) || a.hasDamagedStar) return false
                const ap = getAsteroidPosition(a, now)
                const progress = (now - a.spawnedAt) / a.durationMs
                if (progress >= 1) return true
                const dist = Math.hypot(ap.x - STAR_TARGET_X, ap.y - STAR_TARGET_Y)
                return dist < STAR_RADIUS + ASTEROID_RADIUS
            })
            if (contacts.length > 0 && !contactPendingRef.current) {
                playVoiceRef.current('star-damage')
                const damage = contacts.length
                const newStarHp = Math.max(0, starHpRef.current - damage)
                starHpRef.current = newStarHp
                setStarHp(newStarHp)
                lastGameStateSendRef.current = 0 // スロットルをリセットして即送信
                sendGameState()
                setAsteroids((prev) => {
                    const contactIds = new Set(contacts.map((c) => c.id))
                    const next = prev.map((a) =>
                        contactIds.has(a.id) ? { ...a, hasDamagedStar: true, destroyedAt: now } : a
                    )
                    asteroidsRef.current = next
                    return next
                })
                if (newStarHp <= 0) {
                    contactPendingRef.current = true
                    const ap = getAsteroidPosition(contacts[0], now)
                    setContactExplosion({ x: ap.x, y: ap.y, asteroidId: contacts[0].id })
                    return
                }
            }

            rafId = requestAnimationFrame(gameLoop)
        }
        rafId = requestAnimationFrame(gameLoop)

        return () => {
            if (spawnTimer) clearInterval(spawnTimer)
            if (rafId) cancelAnimationFrame(rafId)
        }
    }, [matchId, isShooter, difficulty, playersTotalPoints, sendGameState])

    // ============================================
    // マウス操作（Shooter）
    // ============================================

    const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect()
        aimRef.current = {
            x: (e.clientX - rect.left) / rect.width,
            y: (e.clientY - rect.top) / rect.height,
        }
    }, [])

    // ============================================
    // キーボード入力（Typist）
    // ============================================

    const onKeyDown = useCallback((e: KeyboardEvent) => {
        if (gameEndedRef.current) return
        if (e.key.length !== 1) return

        const line = currentLine
        if (!line) return

        const romaji = getRomaji(line.text)
        const expected = romaji[charIndex]
        if (e.key.toLowerCase() !== expected) return

        const nextChar = charIndex + 1
        const isLastChar = nextChar >= romaji.length

        // fire broadcast を Shooter へ送信（最後の文字なら必殺技）
        channelRef.current?.send({
            type: 'broadcast',
            event: 'fire',
            payload: { special: isLastChar },
        })
        // fireCount は game_state で Shooter から受信して更新（送信者は自分の broadcast を受信しない）
        playVoiceRef.current('shooting') // Typist がタイピング成功したタイミングで shooting SE

        if (isLastChar) {
            setCurrentLine(pickRandomDialogue())
            setCharIndex(0)
        } else {
            setCharIndex(nextChar)
        }
    }, [currentLine, charIndex])

    useEffect(() => {
        if (isShooter) return
        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
    }, [isShooter, onKeyDown])

    /** 接触時の爆発アニメーション終了後に呼ぶ（FAILED_CONTACT へ遷移） */
    const completeContactFail = useCallback(() => {
        setContactExplosion(null)
        endGame('FAILED_CONTACT')
    }, [endGame])

    return {
        asteroids,
        bullets,
        timer,
        score,
        starHp,
        aimRef,
        onMouseMove,
        dialogue: {
            line: currentLine ?? DIALOGUES[0],
            charIndex,
        },
        typistFireCount,
        contactExplosion,
        completeContactFail,
    }
}
