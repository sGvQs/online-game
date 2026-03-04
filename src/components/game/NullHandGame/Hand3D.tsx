'use client'

import React, { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { HandType } from '@/types'

interface Hand3DProps {
    handType: HandType | null
    revealed?: boolean
    size?: 'micro' | 'small' | 'medium' | 'large'
    isRotating?: boolean
    personalColor?: string // NEW: 自分の色の場合はネオンカラー、そうでなければマットなクレヨン
}

/**
 * メインコンポーネント
 */
export function Hand3D({
    handType,
    revealed = true,
    size = 'medium',
    isRotating = true,
    personalColor,
}: Hand3DProps) {
    const canvasHeight = size === 'micro' ? '100px' : size === 'small' ? '150px' : size === 'large' ? '400px' : '250px'
    const canvasWidth = size === 'micro' ? '100px' : '100%'
    return (
        <div style={{ width: canvasWidth, height: canvasHeight, background: '#000000' }}>
            <Canvas>
                <PerspectiveCamera makeDefault position={[0, 0, 6]} fov={40} />

                {/* ライティング：面を際立たせる強い光 */}
                <ambientLight intensity={personalColor ? 0.4 : 0.6} />
                <directionalLight position={[5, 5, 5]} intensity={personalColor ? 3 : 1.2} />
                <directionalLight position={[-5, -5, 2]} intensity={0.4} color="#aaccff" />

                <group>
                    {revealed && handType && (
                        <HandContainer handType={handType} isRotating={isRotating} personalColor={personalColor} />
                    )}
                    {!revealed && <QuestionMark isRotating={isRotating} />}
                </group>

                <OrbitControls enableZoom={false} enablePan={false} />
            </Canvas>
        </div>
    )
}

/**
 * 手のコンテナ（ゆっくり反復アニメーション制御）
 */
function HandContainer({
    handType,
    isRotating,
    personalColor
}: {
    handType: HandType;
    isRotating: boolean;
    personalColor?: string
}) {
    const groupRef = useRef<THREE.Group>(null!)

    useFrame((state) => {
        if (isRotating && groupRef.current) {
            // 速度調整：elapsedTimeにかける数字を小さくしてゆっくりに (2.5 -> 0.8)
            const speed = 0.8
            const angle = Math.sin(state.clock.elapsedTime * speed) * (Math.PI / 4) // 左右45度
            groupRef.current.rotation.y = angle

            // 浮遊もゆっくりに
            groupRef.current.position.y = Math.sin(state.clock.elapsedTime * speed * 0.8) * 0.1
        } else if (groupRef.current) {
            // 停止時はゆっくり正面に戻る
            groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, 0, 0.05)
            groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, 0, 0.05)
        }
    })

    return (
        <group ref={groupRef}>
            {handType === HandType.ROCK && <Rock color={personalColor} />}
            {handType === HandType.SCISSORS && <Scissors color={personalColor} />}
            {handType === HandType.PAPER && <Paper color={personalColor} />}
        </group>
    )
}

/**
 * 共通マテリアル
 * flatShading: true でポリゴン感を強調
 */
const PolygonMaterial = ({ color }: { color?: string }) => {
    // 自分の色の場合はその色、そうでなければホストカラー（レッド）
    const targetColor = color || "#FF4444"
    const isNeon = true // クレヨンモードを廃止し、常にネオン
    return (
        <meshStandardMaterial
            color={targetColor}
            emissive={targetColor} // 常に発光させる
            emissiveIntensity={0.3}
            roughness={0.3}
            metalness={0.4}
            flatShading={true}
        />
    )
}

// 面取りの設定：半径を小さく、滑らかさを最低にして「角を削った」感を出す
const bevelProps = {
    radius: 0.08, // 角の削り幅
    smoothness: 1 // 分割数。1だとカクっとした斜めの面になる
}

/**
 * ROCK（グー）
 */
function Rock({ color }: { color?: string }) {
    return (
        <group>
            {/* 手の甲 */}
            <RoundedBox args={[1.4, 1.2, 0.9]} {...bevelProps} position={[0, -0.1, 0]}>
                <PolygonMaterial color={color} />
            </RoundedBox>
            {/* 握った指 */}
            {[
                { x: -0.45, h: 0.8, z: 0.5 },
                { x: -0.15, h: 0.9, z: 0.55 },
                { x: 0.15, h: 0.85, z: 0.5 },
                { x: 0.45, h: 0.7, z: 0.45 },
            ].map((f, i) => (
                <RoundedBox key={i} args={[0.28, f.h, 0.5]} {...bevelProps} position={[f.x, 0.2, f.z]}>
                    <PolygonMaterial color={color} />
                </RoundedBox>
            ))}
            {/* 親指 */}
            <RoundedBox args={[0.4, 0.8, 0.5]} {...bevelProps} position={[-0.4, -0.1, 0.75]} rotation={[0, 0, -Math.PI / 2.2]}>
                <PolygonMaterial color={color} />
            </RoundedBox>
        </group>
    )
}

/**
 * SCISSORS（チョキ）
 */
function Scissors({ color }: { color?: string }) {
    return (
        <group>
            {/* 手のひらベース */}
            <RoundedBox args={[1.2, 1.0, 0.6]} {...bevelProps} position={[0, -0.3, 0]}>
                <PolygonMaterial color={color} />
            </RoundedBox>
            {/* 人差し指 */}
            <RoundedBox args={[0.3, 1.8, 0.3]} {...bevelProps} position={[-0.35, 0.8, 0]} rotation={[0, 0, 0.25]}>
                <PolygonMaterial color={color} />
            </RoundedBox>
            {/* 中指 */}
            <RoundedBox args={[0.3, 1.9, 0.3]} {...bevelProps} position={[0.35, 0.85, 0]} rotation={[0, 0, -0.25]}>
                <PolygonMaterial color={color} />
            </RoundedBox>
            {/* 握り込んだ指 */}
            <RoundedBox args={[0.7, 0.7, 0.45]} {...bevelProps} position={[0.2, -0.2, 0.4]}>
                <PolygonMaterial color={color} />
            </RoundedBox>
            {/* 親指 */}
            <RoundedBox args={[0.35, 0.8, 0.4]} {...bevelProps} position={[-0.5, -0.2, 0.5]} rotation={[0, 0, -Math.PI / 4]}>
                <PolygonMaterial color={color} />
            </RoundedBox>
        </group>
    )
}

/**
 * PAPER（パー）
 */
function Paper({ color }: { color?: string }) {
    const fingers = [
        { x: -0.6, y: 0.7, r: 0.3, h: 1.3 },
        { x: -0.2, y: 0.9, r: 0.1, h: 1.5 },
        { x: 0.2, y: 0.8, r: -0.1, h: 1.4 },
        { x: 0.6, y: 0.6, r: -0.3, h: 1.1 },
    ]
    return (
        <group>
            {/* 手のひら */}
            <RoundedBox args={[1.5, 1.2, 0.3]} {...bevelProps} position={[0, -0.4, 0]}>
                <PolygonMaterial color={color} />
            </RoundedBox>
            {fingers.map((f, i) => (
                <RoundedBox key={i} args={[0.3, f.h, 0.25]} {...bevelProps} position={[f.x, f.y, 0]} rotation={[0, 0, f.r]}>
                    <PolygonMaterial color={color} />
                </RoundedBox>
            ))}
            {/* 親指 */}
            <RoundedBox args={[0.3, 1.0, 0.25]} {...bevelProps} position={[-1.0, -0.2, 0.1]} rotation={[0, 0, Math.PI / 2.5]}>
                <PolygonMaterial color={color} />
            </RoundedBox>
        </group>
    )
}

/**
 * クエスチョンマーク
 */
function QuestionMark({ isRotating }: { isRotating: boolean }) {
    const ref = useRef<THREE.Mesh>(null!)
    useFrame((state) => {
        if (isRotating && ref.current) {
            // こちらもゆっくりに
            ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.8) * (Math.PI / 4)
        }
    })
    return (
        <mesh ref={ref}>
            {/* Icosahedron（正二十面体）で少し複雑な多面体感を出す */}
            <icosahedronGeometry args={[1.0, 0]} />
            <meshStandardMaterial color="#444444" wireframe />
        </mesh>
    )
}