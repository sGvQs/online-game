'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import type { HandType } from '@/shared/types'
// import { useRef } from 'react' // 今回は未使用のためコメントアウト
import * as THREE from 'three'

interface Hand3DProps {
    handType: HandType | null
    revealed?: boolean
    size?: 'small' | 'medium' | 'large'
}

// 共通のマテリアル（I.Q風の無機質な質感）
const materialProps = {
    color: "#ffffff",
    metalness: 0.2,
    roughness: 0.7,
    flatShading: true,
}

/**
 * 3Dの手を表示するコンポーネント
 */
export function Hand3D({ handType, revealed = true, size = 'medium' }: Hand3DProps) {
    const canvasHeight = size === 'small' ? '150px' : size === 'large' ? '400px' : '250px'

    return (
        <div style={{ width: '100%', height: canvasHeight, background: '#000000' }}>
            <Canvas>
                <PerspectiveCamera makeDefault position={[0, 0, 6]} />

                {/* 環境光を少し落として影を濃くする */}
                <ambientLight intensity={0.4} />
                {/* メインのライト（右上から強めに） */}
                <directionalLight position={[5, 5, 5]} intensity={1.2} color="#ffffff" />
                {/* サブのライト（左下から青白い光を当ててサイバー感を出す） */}
                <directionalLight position={[-5, -5, 2]} intensity={0.3} color="#aaccff" />

                {/* 全体を少し斜めに傾けて立体感を出す */}
                <group rotation={[0.2, -0.5, 0]}>
                    {revealed && handType && <Hand hand={handType} />}
                    {!revealed && <QuestionMark />}
                </group>

                {/* ユーザーが少しだけ回せるように制限をかけると3D感が伝わります */}
                <OrbitControls
                    enableZoom={false}
                    enablePan={false}
                    minPolarAngle={Math.PI / 3}
                    maxPolarAngle={Math.PI / 1.5}
                    minAzimuthAngle={-Math.PI / 4}
                    maxAzimuthAngle={Math.PI / 4}
                />
            </Canvas>
        </div>
    )
}

/**
 * グー（岩）の3Dモデル
 */
function Rock() {
    return (
        <group>
            {/* 手のひら・甲（ベースとなる大きな塊） */}
            <mesh position={[0, 0, 0]}>
                <boxGeometry args={[1.4, 1.4, 0.8]} />
                <meshStandardMaterial {...materialProps} />
            </mesh>

            {/* 握りこんだ指（手前に出っ張らせる） */}
            <mesh position={[0.1, -0.2, 0.6]}>
                <boxGeometry args={[1.2, 0.8, 0.5]} />
                <meshStandardMaterial {...materialProps} />
            </mesh>

            {/* 親指（折りたたんで手前に） */}
            <mesh position={[-0.7, 0.1, 0.7]} rotation={[0, 0, -Math.PI / 6]}>
                <boxGeometry args={[0.4, 0.9, 0.4]} />
                <meshStandardMaterial {...materialProps} />
            </mesh>
        </group>
    )
}

/**
 * チョキ（ハサミ）の3Dモデル
 */
function Scissors() {
    return (
        <group>
            {/* 手のひら（下半分） */}
            <mesh position={[0, -0.4, 0]}>
                <boxGeometry args={[1.4, 1.0, 0.6]} />
                <meshStandardMaterial {...materialProps} />
            </mesh>

            {/* 握りこんだ薬指・小指（手前に配置） */}
            <mesh position={[0.3, -0.4, 0.4]}>
                <boxGeometry args={[0.8, 0.8, 0.4]} />
                <meshStandardMaterial {...materialProps} />
            </mesh>

            {/* 人差し指 */}
            <mesh position={[-0.3, 0.8, 0]} rotation={[0, 0, Math.PI / 12]}>
                <boxGeometry args={[0.3, 1.4, 0.3]} />
                <meshStandardMaterial {...materialProps} />
            </mesh>

            {/* 中指（人差し指より少し奥に配置して立体感を） */}
            <mesh position={[0.2, 0.9, -0.1]} rotation={[0, 0, -Math.PI / 12]}>
                <boxGeometry args={[0.3, 1.5, 0.3]} />
                <meshStandardMaterial {...materialProps} />
            </mesh>

            {/* 親指（握りこんだ指を抑えるように） */}
            <mesh position={[-0.6, -0.2, 0.5]} rotation={[0, 0, -Math.PI / 4]}>
                <boxGeometry args={[0.3, 0.8, 0.4]} />
                <meshStandardMaterial {...materialProps} />
            </mesh>
        </group>
    )
}

/**
 * パー（紙）の3Dモデル
 */
function Paper() {
    // 指にわずかな前後のバラつき（z）を持たせる
    const fingers = [
        { x: -0.6, y: 0.8, z: 0.1, rotation: Math.PI / 12, length: 1.2 }, // 人差し指
        { x: -0.2, y: 0.9, z: 0.0, rotation: Math.PI / 24, length: 1.4 }, // 中指
        { x: 0.2, y: 0.8, z: -0.1, rotation: -Math.PI / 24, length: 1.3 }, // 薬指
        { x: 0.6, y: 0.6, z: -0.2, rotation: -Math.PI / 12, length: 1.0 }, // 小指
    ]

    return (
        <group>
            {/* 手のひら */}
            <mesh position={[0, -0.4, 0]}>
                <boxGeometry args={[1.6, 1.2, 0.4]} />
                <meshStandardMaterial {...materialProps} />
            </mesh>

            {/* 4本の指 */}
            {fingers.map((finger, index) => (
                <mesh
                    key={index}
                    position={[finger.x, finger.y, finger.z]}
                    rotation={[0, 0, finger.rotation]}
                >
                    <boxGeometry args={[0.3, finger.length, 0.3]} />
                    <meshStandardMaterial {...materialProps} />
                </mesh>
            ))}

            {/* 親指（大きく横・手前に張り出す） */}
            <mesh position={[-1.0, -0.2, 0.2]} rotation={[0, 0, Math.PI / 4]} >
                <boxGeometry args={[0.35, 1.0, 0.35]} />
                <meshStandardMaterial {...materialProps} />
            </mesh>
        </group>
    )
}

/**
 * クエスチョンマーク（未公開状態）
 */
function QuestionMark() {
    return (
        <group>
            <mesh>
                {/* I.Q風なら球体より正八面体（Octahedron）などのカクカクした形が似合うかもしれません */}
                <octahedronGeometry args={[1.0, 0]} />
                <meshStandardMaterial
                    color="#404040"
                    metalness={0.5}
                    roughness={0.5}
                    wireframe
                />
            </mesh>
        </group>
    )
}

/**
 * 手の種類に応じて適切なコンポーネントを返す
 */
function Hand({ hand }: { hand: HandType }) {
    switch (hand) {
        case 'ROCK':
            return <Rock />
        case 'SCISSORS':
            return <Scissors />
        case 'PAPER':
            return <Paper />
        default:
            return null
    }
}