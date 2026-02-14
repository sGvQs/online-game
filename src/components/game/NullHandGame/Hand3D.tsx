'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import type { HandType } from '@/shared/types'
import { useRef } from 'react'
import * as THREE from 'three'

interface Hand3DProps {
    handType: HandType | null
    revealed?: boolean
    size?: 'small' | 'medium' | 'large'
}

/**
 * 3Dの手を表示するコンポーネント
 * I.Q風の白黒、無機質なデザイン
 */
export function Hand3D({ handType, revealed = true, size = 'medium' }: Hand3DProps) {
    const canvasHeight = size === 'small' ? '150px' : size === 'large' ? '400px' : '250px'

    return (
        <div style={{ width: '100%', height: canvasHeight, background: '#000000' }}>
            <Canvas>
                <PerspectiveCamera makeDefault position={[0, 0, 5]} />
                <ambientLight intensity={0.3} />
                <directionalLight position={[5, 5, 5]} intensity={0.8} color="#ffffff" />

                {revealed && handType && <Hand hand={handType} />}
                {!revealed && <QuestionMark />}

                <OrbitControls enableZoom={false} enablePan={false} />
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
            {/* 拳の本体 */}
            <mesh position={[0, 0, 0]}>
                <boxGeometry args={[1.2, 1.2, 1.2]} />
                <meshStandardMaterial
                    color="#ffffff"
                    metalness={0.1}
                    roughness={0.8}
                    flatShading
                />
            </mesh>

            {/* 親指 */}
            <mesh position={[-0.7, 0, 0.3]} rotation={[0, 0, Math.PI / 6]}>
                <boxGeometry args={[0.3, 0.8, 0.3]} />
                <meshStandardMaterial
                    color="#ffffff"
                    metalness={0.1}
                    roughness={0.8}
                    flatShading
                />
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
            {/* 手のひら */}
            <mesh position={[0, -0.5, 0]}>
                <boxGeometry args={[0.8, 0.6, 0.4]} />
                <meshStandardMaterial
                    color="#ffffff"
                    metalness={0.1}
                    roughness={0.8}
                    flatShading
                />
            </mesh>

            {/* 人差し指 */}
            <mesh position={[0.2, 0.5, 0]} rotation={[0, 0, -Math.PI / 12]}>
                <boxGeometry args={[0.25, 1.2, 0.25]} />
                <meshStandardMaterial
                    color="#ffffff"
                    metalness={0.1}
                    roughness={0.8}
                    flatShading
                />
            </mesh>

            {/* 中指 */}
            <mesh position={[-0.2, 0.5, 0]} rotation={[0, 0, Math.PI / 12]}>
                <boxGeometry args={[0.25, 1.2, 0.25]} />
                <meshStandardMaterial
                    color="#ffffff"
                    metalness={0.1}
                    roughness={0.8}
                    flatShading
                />
            </mesh>
        </group>
    )
}

/**
 * パー（紙）の3Dモデル
 */
function Paper() {
    const fingers = [
        { x: -0.6, rotation: Math.PI / 8 },
        { x: -0.2, rotation: 0 },
        { x: 0.2, rotation: 0 },
        { x: 0.6, rotation: -Math.PI / 8 },
    ]

    return (
        <group>
            {/* 手のひら */}
            <mesh position={[0, -0.3, 0]}>
                <boxGeometry args={[1.8, 0.6, 0.3]} />
                <meshStandardMaterial
                    color="#ffffff"
                    metalness={0.1}
                    roughness={0.8}
                    flatShading
                />
            </mesh>

            {/* 4本の指 */}
            {fingers.map((finger, index) => (
                <mesh
                    key={index}
                    position={[finger.x, 0.5, 0]}
                    rotation={[0, 0, finger.rotation]}
                >
                    <boxGeometry args={[0.3, 1.0, 0.25]} />
                    <meshStandardMaterial
                        color="#ffffff"
                        metalness={0.1}
                        roughness={0.8}
                        flatShading
                    />
                </mesh>
            ))}

            {/* 親指 */}
            <mesh position={[-1.1, -0.2, 0]} rotation={[0, 0, Math.PI / 3]}>
                <boxGeometry args={[0.25, 0.8, 0.25]} />
                <meshStandardMaterial
                    color="#ffffff"
                    metalness={0.1}
                    roughness={0.8}
                    flatShading
                />
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
                <sphereGeometry args={[0.8, 16, 16]} />
                <meshStandardMaterial
                    color="#404040"
                    metalness={0.1}
                    roughness={0.9}
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
    }
}
