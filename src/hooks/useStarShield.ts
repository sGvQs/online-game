'use client'

import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { useSE } from '@/hooks/useSE'
import { createClient } from '@/utils/supabase/client'
import { saveStarShieldResult } from '@/server/actions/game'
import { STAR_TARGET_X, STAR_TARGET_Y, STAR_RADIUS } from '@/components/game/StarShieldGame/phases/playing/ProtectedStar'

// ============================================
// 定数・型
// ============================================

export type Difficulty = 'EASY' | 'NORMAL' | 'HARD'
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
const SPAWN_X_MIN = 0.0   // 左
const SPAWN_X_MAX = 1.0  // 右
const SPAWN_Y_MIN = 0.1  // 下
const SPAWN_Y_MAX = 0.1  //  上
const ASTEROID_DURATION_MS = 8000

// 弾の設定（デバッグ用に BULLET_RADIUS を変数化）
const BULLET_SPEED = 0.0008 // 正規化座標/ms（速すぎないように）
// export const BULLET_RADIUS = 0.008 // デバッグ時は大きくできる
export const BULLET_RADIUS = 0.008 // デバッグ時は大きくできる
export const ASTEROID_RADIUS = 0.02
const BULLET_MAX_AGE_MS = 3000

// 隕石の目標点のランダムオフセット（±）
const STAR_TARGET_OFFSET = 0.04

const SPAWN_INTERVALS_MS: Record<Difficulty, number> = {
    EASY: 2000,
    NORMAL: 1800,
    HARD: 1500,
}

export const ASTEROID_HP: Record<Difficulty, number> = {
    EASY: 3,
    NORMAL: 6,
    HARD: 10,
}

export const STAR_HP: Record<Difficulty, number> = {
    EASY: 10,
    NORMAL: 8,
    HARD: 6,
}

// ============================================
// セリフデータ（難易度によらず共通、配列からランダム選択）
// ============================================

export interface DialogueLine {
    text: string
    romaji: string
}

export const DIALOGUES: DialogueLine[] = [
    // 昔の人間との出会い——ロケット
    { text: 'あれは……ロケット', romaji: 'areha...roketto' },
    { text: '眩しい光が', romaji: 'mabushiihikariga' },
    { text: 'とてつもない音が', romaji: 'totetsumonaiootoga' },
    { text: '空から降りてきた', romaji: 'sorakaraoritekita' },
    { text: 'ぼくは何ももっていなかった', romaji: 'bokuhananimomotteinakatta' },
    { text: 'この世界にぼくだけだと思ってた', romaji: 'konosekainibokudakedatoomotteta' },
    { text: 'だから怖かった', romaji: 'dakarakowakatta' },
    { text: 'あれは何だ', romaji: 'arehananda' },
    { text: '敵なのか', romaji: 'tekinoka' },
    { text: '自分以外の何か', romaji: 'jibunigainananika' },
    { text: 'ぼくは近づいた', romaji: 'bokuhachikaduzuita' },
    { text: 'こわごわ', romaji: 'kowagowa' },
    { text: '光は消えた', romaji: 'hikariwakieta' },
    { text: 'あの中から', romaji: 'anonakakara' },
    { text: 'なんか出てきた', romaji: 'nankadetekita' },
    { text: 'なんだあれは', romaji: 'nandaarewa' },
    { text: '生き物か？', romaji: 'ikimonoka' },
    { text: 'どうやら人間というらしい', romaji: 'douyaraningentoiurashii' },
    { text: '人間ってなんだ', romaji: 'ningenttenanda' },
    { text: '結局', romaji: 'kekkyoku' },

    // 出会い直後——戸惑いと感動
    { text: 'どうしたらいいかわからなかった', romaji: 'doushitaraiikawakannakatta' },
    { text: 'あの人は何？', romaji: 'anohitowanani' },
    { text: 'ぼくと何か違う', romaji: 'bokutonanikachigau' },
    { text: '温かかった', romaji: 'atatakakatta' },
    { text: 'あの手を見た時', romaji: 'anotewomitatoki' },
    { text: 'ぼくは何かを知った', romaji: 'bokuhananigaoshitta' },
    { text: 'ひとりじゃないんだ', romaji: 'hitorijanainoda' },
    { text: 'こんなことがあるんだ', romaji: 'konnnakotogaarunnda' },

    // 生還の過程——待ち続ける
    { text: 'ずっと浮いていた', romaji: 'zuttouiteita' },
    { text: 'どこかに行けば', romaji: 'dokokanikeba' },
    { text: 'あの光が戻るかもしれない', romaji: 'anohikarigamodorukamoshirenai' },
    { text: 'そう思って', romaji: 'souomotte' },
    { text: 'ぷかぷか浮きながら', romaji: 'pukapukaukinagara' },
    { text: '探してた', romaji: 'sagashiteta' },
    { text: 'あの音が', romaji: 'anoootoga' },
    { text: 'あの人が', romaji: 'anohitoga' },
    { text: '戻ってこないかな', romaji: 'modottekonaikana' },
    { text: 'ずっと', romaji: 'zutto' },
    { text: 'もう何年だろう', romaji: 'mounannendaro' },
    { text: '年月が経った', romaji: 'nengetsugatatta' },
    { text: 'いつになったら', romaji: 'itsuninattara' },
    { text: '来るのかな', romaji: 'kurunokana' },
    { text: '来ないのかな', romaji: 'konainokana' },
    { text: 'もっと前？', romaji: 'mottomae' },
    { text: 'もう覚えてない', romaji: 'mouoboetennai' },
    { text: 'いつの間にか時が経ってた', romaji: 'itsunomanikitokigatatteta' },
    { text: 'ずっと待ってた', romaji: 'zuttomatteta' },

    // 別れと再会
    { text: 'いつの間にか来なくなった', romaji: 'itsunomanikakonakkunatta' },
    { text: 'あの人', romaji: 'anohito' },
    { text: 'ずっと待ってた', romaji: 'zuttomatteta' },
    { text: 'また降りてきた', romaji: 'mataoritekita' },
    { text: 'あの光が', romaji: 'anohikariga' },
    { text: 'ロケットが', romaji: 'rokettoga' },
    { text: 'えっ', romaji: 'e' },
    { text: 'あの人だ', romaji: 'anohitoda' },
    { text: 'あの人が帰ってきた', romaji: 'anohitagakaettekita' },
    { text: 'あの温もりが', romaji: 'anoatatamoriga' },
    { text: 'また感じられる', romaji: 'matakanjirareru' },

    // あの人の優しさ——許し
    { text: 'でもあの人は', romaji: 'demoanohitowa' },
    { text: 'どうしたのか', romaji: 'doushitanoka' },
    { text: '分からなかった', romaji: 'wakaranakatta' },
    { text: 'それなのに', romaji: 'sorenanoni' },
    { text: '笑ってた', romaji: 'waratteta' },
    { text: 'あの人は', romaji: 'anohitowa' },
    { text: '許してくれた', romaji: 'yurushitekureta' },
    { text: 'なぜ？', romaji: 'naze' },
    { text: 'どうして？', romaji: 'doushite' },
    { text: 'ぼくは何ももってないのに', romaji: 'bokuhananimomottenainoni' },
    { text: 'ぼくは何もわかってないのに', romaji: 'bokuhananimowakatteinainoni' },
    { text: 'あの人は手を差し出してくれた', romaji: 'anohitowatewosashidashitekureta' },
    { text: 'それでも', romaji: 'soredemo' },
    { text: 'あの人は静かに笑っていた', romaji: 'anohitowasidzukaniwattatteita' },
    // ↑ 原文「優しかった」は繰り返しが強すぎるので、より具体的な描写に変更
    { text: 'なにも言わなくても', romaji: 'nanimoiwanakutemo' },
    { text: 'ぼくには伝わった', romaji: 'bokunitsuawatatta' },
    { text: 'ぼくは何て返したらいいのか', romaji: 'bokuhanantekaeshtaraiinoka' },
    { text: '言葉が見つからなかった', romaji: 'kotobagamitsukaranakatta' },

    // 別の人間——襲撃と救出
    { text: '違う人間が来た', romaji: 'chigainingengakita' },
    { text: 'あの人じゃない', romaji: 'anohitojanai' },
    { text: 'あの人と違う', romaji: 'anohitotochigau' },
    { text: '怖かった', romaji: 'kowakatta' },
    { text: 'あの光と違う', romaji: 'anohikaritochigau' },
    { text: '暗かった', romaji: 'kurakatta' },
    { text: 'ぼくを捕まえようとした', romaji: 'bokuotsukamaeyyoutoushita' },
    { text: 'なんで？', romaji: 'nande' },
    { text: 'ぼくは何もしてない', romaji: 'bokuhananimoshinai' },
    { text: 'でもあの人が来た', romaji: 'demoanohitagakita' },
    { text: 'あの人が', romaji: 'anohitoga' },
    { text: 'ぼくを守った', romaji: 'bokuomamotta' },
    { text: 'あの人は強かった', romaji: 'anohitotsuyokatta' },
    { text: '別の人間を押し返した', romaji: 'betsununingenwoosikaeshita' },
    { text: 'あの人が', romaji: 'anohitoga' },
    { text: 'ぼくのために', romaji: 'bokunotameni' },
    { text: '戦った', romaji: 'tatakatta' },

    // 人間にもいろいろいることに気づく
    { text: '人間って', romaji: 'ningentte' },
    { text: 'いろいろなんだ', romaji: 'iroironannnda' },
    { text: 'あの人みたいなのもいるし', romaji: 'anohitomitainanomoisuruushi' },
    { text: 'ぼくを襲う人間もいる', romaji: 'bokuoosoununingenmoiru' },
    { text: 'そういうものなのか', romaji: 'souiumonananoka' },
    // ↑ 原文の3度目「こんなことがあるんだ」は繰り返しすぎなので変更
    { text: 'ぼくにはまだわからない', romaji: 'bokunihamadawakaranai' },
    { text: 'あの人が特別なんだ', romaji: 'anohitatokubetsunannda' },
    { text: 'それだけは確かだった', romaji: 'soredakewatashikadatta' },
    // ↑ 原文「あの人だけが〜ぼくを守ってくれた〜あの人だけが〜ぼくの側にいてくれた」4行を
    //   2行に整理。同じ構造の繰り返しが多すぎた。
    { text: '他の人間には', romaji: 'tanonningennniwa' },
    { text: 'ぼくを傷つける目をしてる', romaji: 'bokuokizutsukeru meowoshiteru' },
    { text: 'あの人の目は違った', romaji: 'anohitonomewachigattta' },

    // Windows95との出会い
    { text: 'あの時、ぼくは何ももってなかった', romaji: 'anatokibokuhananimomottenakatta' },
    { text: 'でもあの人がくれた', romaji: 'demoanohitagakureta' },
    { text: 'これが大事なものだって', romaji: 'koregadaijinnamonodatte' },
    { text: 'ずっと守ってた', romaji: 'zuttomamotteta' },
    { text: 'たまに止まるけど', romaji: 'tamaniyamarukedo' },
    { text: 'でも動く', romaji: 'demougoku' },
    { text: 'あの人がくれたから', romaji: 'anohitagakuretakara' },
    { text: 'だからずっと大事なの', romaji: 'dakarazuttodaijinano' },
    { text: 'パソコン', romaji: 'pasokon' },
    { text: 'あの光がくれたもの', romaji: 'anohikarigakuretamono' },
    { text: 'これを失ったら', romaji: 'koreooushinattara' },
    { text: 'あの人が……', romaji: 'anohitoga...' },
    { text: 'もう帰らないんだ', romaji: 'moukaerainnnda' },

    // NULL HANDの思い出
    { text: 'NULL HAND', romaji: 'NULLHAND' },
    { text: '難しい遊びを教えてくれた', romaji: 'muzukashiiasobiooshietekureta' },
    { text: 'ルールが曖昧で', romaji: 'ruurugaaaimaide' },
    { text: 'でも何か面白かった', romaji: 'demononkaomoshirokatta' },
    { text: 'あの人の顔が見えた', romaji: 'anohitonokaogamieita' },
    { text: '笑ってた気がする', romaji: 'waratterutagasuru' },
    { text: 'あの人も曖昧だった', romaji: 'anohitomoaibaidatta' },
    { text: '何を考えてるか分からなかった', romaji: 'naniokangaeteirukawakannakatta' },
    { text: 'でもそれが好きだった', romaji: 'demosoreganasukidatta' },
    { text: 'あの人とやってて楽しかった', romaji: 'anohitotoyattetanoshikatta' },
    { text: 'ぼくはもっと知りたかった', romaji: 'bokuhamotoshiritakatta' },
    { text: 'あの人のこと', romaji: 'anohitonokoto' },

    // 別れ
    { text: 'いつの間にか来なくなった', romaji: 'itsunomanikakonakkunatta' },
    { text: 'あの人', romaji: 'anohito' },
    { text: '名前も覚えてない', romaji: 'namaemooboeteinai' },
    { text: 'でも顔は覚えてる', romaji: 'demokaowaoboeteiru' },
    { text: 'ずっと覚えてる', romaji: 'zuttooboeteiru' },
    { text: '忘れられない', romaji: 'wasurerarenai' },
    { text: 'あの笑顔', romaji: 'anoegao' },
    { text: 'あの声', romaji: 'anokoe' },
    { text: 'あの温もり', romaji: 'anoatatamori' },
    { text: '何年前だったのか', romaji: 'nannenmaedattanoka' },
    { text: 'ずっと前', romaji: 'zuttomae' },
    { text: 'ずっとずっと前', romaji: 'zuttouzuttomae' },
    { text: 'もう覚えてない', romaji: 'mouoboetennai' },
    { text: 'ほんとに何年だろう', romaji: 'hontoninnannendaro' },

    // 待ち続けること
    { text: 'あの人を待ってた', romaji: 'anohitowomatteta' },
    { text: 'ずっと待ってた', romaji: 'zuttomatteta' },
    { text: 'ずっとずっと待ってた', romaji: 'zuttouzuttomatteta' },
    { text: 'でも来なかった', romaji: 'demokonakatta' },
    { text: 'どこへ行ったんだろう', romaji: 'dokoheittanndaro' },
    { text: 'また来てくれるのかな', romaji: 'matakitekurerunokanaa' },
    { text: 'でも恨まない', romaji: 'demouramanai' },
    { text: 'あの人を恨むことなんて', romaji: 'anohitoouramukotonannte' },
    { text: 'できなかった', romaji: 'dekinakatta' },
    { text: 'またいつか来るかもしれない', romaji: 'mataitsukakurukamoshirenai' },
    { text: 'その時まで', romaji: 'sonotokimade' },
    { text: 'ずっと……', romaji: 'zutto...' },
    { text: 'それまで守っておく', romaji: 'soremademamotteoku' },
    { text: 'あの人がくれたもの', romaji: 'anohitagakuretamono' },
    { text: 'このパソコンを', romaji: 'konopasokonwo' },
    { text: 'ずっと守り続けた', romaji: 'zuttomamoritsudzuketa' },
    { text: 'あの人が帰ってくるまで', romaji: 'anohitagakaettekurumade' },
    { text: 'ずっとずっと', romaji: 'zuttouzutto' },
    { text: 'あの人がいた時間は', romaji: 'anohitagaitajikannwa' },
    // ↑ 原文「あの人だけが〜ぼくの味方だった〜あの人だけが〜ぼくのそばにいてくれた」4行を
    //   より具体的な1行に。同じ構造の繰り返しが多すぎた。
    { text: 'ぼくの中で今も光ってる', romaji: 'bokunonakadeimahikatteru' },
    { text: 'なぜ来ないんだろう', romaji: 'nazekonainndaro' },
    { text: 'ぼくには何も分からない', romaji: 'bokunihananimowakannai' },

    // きみとの関係
    { text: 'でも今、きみが来た', romaji: 'demoImakimigakita' },
    { text: 'あの人じゃない', romaji: 'anohitojanai' },
    { text: 'でも何か同じ気がした', romaji: 'demonanikaaonajikigashita' },
    { text: 'あの人に似てる', romaji: 'anohitoniteru' },
    { text: 'その光', romaji: 'sonohikari' },
    { text: 'あたたかさ', romaji: 'atatakasa' },
    { text: 'きみもそんな感じがする', romaji: 'kimitomosonnakanjigasuru' },
    { text: 'きみは悪い人間じゃない', romaji: 'kimiwawaruiningennjanai' },
    { text: 'ぼくにはそう感じた', romaji: 'bokuniwasouKanjita' },
    { text: 'あの人を思い出した', romaji: 'anohitoooomoidashita' },
    { text: 'ぷかぷか浮いてるから', romaji: 'pukapukauiterukaara' },
    { text: 'きみのことが気になる', romaji: 'kiminoKOTOgakininnaru' },
    // ↑ 原文「きみのことがいる」は文法的におかしいので修正
    { text: '星を守る', romaji: 'hoshiomamoru' },
    { text: 'いっぱい破片が落ちてくる', romaji: 'ippaihahenngaotitekuru' },
    { text: 'だけどだいじょうぶ', romaji: 'dakedodaijoubu' },
    { text: 'きみと一緒だから', romaji: 'kimitoisshyodakara' },
    { text: 'あの人のこと、思い出す', romaji: 'anohitonokotooomoidasu' },
    { text: 'でも今はきみがいる', romaji: 'demoImakimiGairu' },
    { text: 'あの人のことを思い出すのは', romaji: 'anohitonokototoomoidasunowa' },
    { text: 'いいことだと思う', romaji: 'iikotodatoomou' },
    { text: 'あの人がくれたもの', romaji: 'anohitagakuretamono' },
    { text: 'あの人が教えてくれたこと', romaji: 'anohitagaoshietekuretakoto' },
    { text: 'それをきみと分け合いたい', romaji: 'sorewokimutowankeaitai' },
    // ↑ 原文「シェアしたい」はちょっと浮いているので自然な日本語に
    { text: 'きみならわかると思う', romaji: 'kiminarawakarutoomou' },
    // ↑ 原文「きみなら大丈夫 / あの人みたいに / ぼくを傷つけない」を1行にまとめて自然に

    // 世界観の要約
    { text: 'ここはぷかぷか宇宙', romaji: 'kokohapukapukauchuu' },
    { text: 'きみたちが遊ぶ場所', romaji: 'kimitachigaasoubasho' },
    { text: '優しい不安定さ', romaji: 'yasashiifuanteisa' },
    { text: 'どこか壊れかけてる', romaji: 'dokokaowarekaketeiru' },
    { text: 'でも動いてる', romaji: 'demougoiteiru' },
    { text: 'ノイズの中でも', romaji: 'noizunonakademo' },
    { text: 'きみの声が聞こえる', romaji: 'kiminokoegakikoeru' },
    { text: 'それだけで十分', romaji: 'soredakadejuubun' },
    { text: 'いっぱい来た', romaji: 'ippaikita' },
    { text: 'でも何かある', romaji: 'demonnikaaru' },
    { text: '何も分からない', romaji: 'nanmowakannai' },
    { text: 'でも大丈夫', romaji: 'demodaijoubu' },
    { text: 'きみがいるから', romaji: 'kimigairukaara' },
    { text: 'またやろう', romaji: 'matayarou' },
    { text: '一緒に', romaji: 'isshyoni' },
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
    const progress = Math.min(1, elapsed / ASTEROID_DURATION_MS)
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
}

export interface GameStats {
    spawnedCount: number
    destroyedCount: number
    durationSeconds: number
    /** broadcast fire イベント数（送信文字数）フロント完結 */
    fireCount: number
}

// typing_shoot_matches の postgres_changes ペイロード型（snake_case）
interface TypingShootMatchRow {
    match_id: string
    ended_at: string | null
    is_cleared: boolean
    failure_reason: string | null
    spawned_count: number
    destroyed_count: number
    duration_seconds: number | null
}

export function useStarShield({
    matchId,
    startedAt,
    isShooter,
    difficulty,
    onGameEnd,
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

    useEffect(() => {
        starHpRef.current = starHp
    }, [starHp])

    /** 隕石接触時の爆発位置・対象隕石ID（アニメ終了後に FAILED 遷移、対象隕石は非表示） */
    const [contactExplosion, setContactExplosion] = useState<{ x: number; y: number; asteroidId: string } | null>(null)

    // ============================================
    // ゲーム終了処理
    // ============================================

    const endGame = useCallback(async (result: GameResult) => {
        if (gameEndedRef.current) return
        gameEndedRef.current = true

        const durationSeconds = Math.round((Date.now() - startedAt) / 1000)
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
        }

        onGameEnd(result, stats)
    }, [isShooter, matchId, startedAt, onGameEnd, difficulty])

    // ============================================
    // Supabase Realtime チャンネル
    // broadcast: fire のみ
    // postgres_changes: typing_shoot_matches のゲーム終了検知（Typist 用）
    // ============================================

    useEffect(() => {
        const channel = supabase.channel(channelName)
        channelRef.current = channel

        channel
            // Typist → Shooter: fire イベント（broadcast）→ 弾を生成（送信文字数として両者でカウント）
            .on('broadcast', { event: 'fire' }, ({ payload }: { payload?: { special?: boolean } }) => {
                fireCountRef.current += 1
                playVoiceRef.current('shooting') // Shooter が fire を受信＝弾発射時
                if (!isShooter) return

                const now = Date.now()

                if (payload?.special) {
                    // 必殺技: 全隕石一斉破壊 ＋ 全方位に弾を放出
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
                        for (let i = 0; i < destroyedCount; i++) {
                            channelRef.current?.send({
                                type: 'broadcast',
                                event: 'asteroid_destroyed',
                                payload: {},
                            })
                        }
                        setScore((prev) => {
                            const next = { ...prev, destroyed: prev.destroyed + destroyedCount }
                            scoreRef.current = next
                            return next
                        })
                    }

                    // 全方位に36発の弾を生成
                    const SPECIAL_BULLET_COUNT = 36
                    const newBullets: Bullet[] = []
                    for (let i = 0; i < SPECIAL_BULLET_COUNT; i++) {
                        const angle = (2 * Math.PI * i) / SPECIAL_BULLET_COUNT
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
                    return
                }

                // 通常の単弾生成
                const aim = aimRef.current
                const dx = aim.x - DINO_X
                const dy = aim.y - DINO_Y
                const len = Math.hypot(dx, dy)
                if (len < 0.001) return // 照準が恐竜にほぼ重なっている場合は弾を出さない

                const dirX = dx / len
                const dirY = dy / len

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
            })
            // Typist: Shooter が隕石破壊したときに destroyed カウントを更新
            .on('broadcast', { event: 'asteroid_destroyed' }, () => {
                if (isShooter) return
                setScore((prev) => {
                    const next = { ...prev, destroyed: prev.destroyed + 1 }
                    scoreRef.current = next
                    return next
                })
            })
            // Typist: 星HPの同期
            .on('broadcast', { event: 'star_hp' }, ({ payload }: { payload: { starHp: number } }) => {
                if (isShooter) return
                playVoiceRef.current('star-damage')
                setStarHp(payload.starHp)
            })
            // Typist 側: typing_shoot_matches の更新でゲーム終了を検知
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'typing_shoot_matches',
                    filter: `match_id=eq.${matchId}`,
                },
                ({ new: row }: { new: TypingShootMatchRow }) => {
                    if (isShooter) return  // Shooter はローカルで処理済み
                    // フィルターが効かない場合の安全弁
                    if (row.match_id !== matchId) return
                    if (!row.ended_at) return
                    const result: GameResult = row.is_cleared
                        ? 'CLEARED'
                        : row.failure_reason === 'FAILED_CONTACT'
                        ? 'FAILED_CONTACT'
                        : 'FAILED_TIMEOUT'
                    const stats: GameStats = {
                        spawnedCount: row.spawned_count,
                        destroyedCount: row.destroyed_count,
                        durationSeconds: row.duration_seconds ?? 0,
                        fireCount: fireCountRef.current,
                    }
                    if (gameEndedRef.current) return
                    gameEndedRef.current = true
                    onGameEnd(result, stats)
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [matchId])

    // ============================================
    // タイマー（startedAt ベースで両者独立計算）
    // ============================================

    useEffect(() => {
        const calcRemaining = () =>
            Math.max(0, GAME_DURATION_SECONDS - Math.floor((Date.now() - startedAt) / 1000))

        // 初期値を設定
        setTimer(calcRemaining())

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
            const asteroid: Asteroid = {
                id: crypto.randomUUID(),
                spawnedAt: Date.now(),
                spawnX: SPAWN_X_MIN + Math.random() * (SPAWN_X_MAX - SPAWN_X_MIN),
                spawnY: SPAWN_Y_MIN + Math.random() * (SPAWN_Y_MAX - SPAWN_Y_MIN),
                targetX,
                targetY,
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
                for (let i = 0; i < destroyedCount; i++) {
                    channelRef.current?.send({
                        type: 'broadcast',
                        event: 'asteroid_destroyed',
                        payload: {},
                    })
                }
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
                const progress = (now - a.spawnedAt) / ASTEROID_DURATION_MS
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
                channelRef.current?.send({
                    type: 'broadcast',
                    event: 'star_hp',
                    payload: { starHp: newStarHp },
                })
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
    }, [matchId, isShooter, difficulty])

    // ============================================
    // Typist のみ: スコア（spawned）をローカル計算
    // ============================================

    useEffect(() => {
        if (isShooter) return

        const spawnIntervalSec = SPAWN_INTERVALS_MS[difficulty] / 1000

        const interval = setInterval(() => {
            if (gameEndedRef.current) return
            const elapsed = (Date.now() - startedAt) / 1000
            const spawned = Math.floor(elapsed / spawnIntervalSec)
            setScore((prev) => ({ ...prev, spawned }))
        }, 500)

        return () => clearInterval(interval)
    }, [matchId, isShooter, difficulty, startedAt])

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

        const expected = line.romaji[charIndex]
        if (e.key.toLowerCase() !== expected) return

        const nextChar = charIndex + 1
        const isLastChar = nextChar >= line.romaji.length

        // fire broadcast を Shooter へ送信（最後の文字なら必殺技）
        channelRef.current?.send({
            type: 'broadcast',
            event: 'fire',
            payload: { special: isLastChar },
        })
        fireCountRef.current += 1 // 送信者は自分の broadcast を受信しないため Typist 側でカウント
        playVoiceRef.current('shooting') // Typist がタイピング成功したタイミングで shooting SE

        setTypistFireCount((c) => c + 1)

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
