'use client'

import { StarVisual } from '@/components/game/common/starShield/StarVisual'

export const STAR_POSITION = {
    left: '-45%',
    bottom: '-120%',
    width: '90vmax',
    height: '90vmax',
} as const

export const STAR_TARGET_X = 0.03
export const STAR_TARGET_Y = 0.92
export const STAR_RADIUS = 0.28

export function ProtectedStar() {
    return <StarVisual position={STAR_POSITION} />
}
