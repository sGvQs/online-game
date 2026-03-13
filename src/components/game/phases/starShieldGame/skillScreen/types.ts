import type { TechniqueId } from '@/constants/starShieldGame/techniques'

export type PreviewData =
    | { kind: 'normalAttack'; techniqueId: TechniqueId }
    | { kind: 'specialAttack'; id: string }
    | { kind: 'heal' }
    | { kind: 'starHp' }
