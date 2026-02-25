import Image from 'next/image'
import { FACE_ICON_PATHS, DEFAULT_FACE_ICON, FaceIcon } from '@/shared/constants/faceIcon'

interface PlayerFaceIconProps {
    faceIcon?: FaceIcon | null
    size?: 'sm' | 'md' | 'lg'
    className?: string
}

const sizeMap = {
    sm: { w: 24, h: 24 },
    md: { w: 32, h: 32 },
    lg: { w: 40, h: 40 },
}

export function PlayerFaceIcon({ faceIcon, size = 'md', className = '' }: PlayerFaceIconProps) {
    const icon = faceIcon ?? DEFAULT_FACE_ICON
    const path = FACE_ICON_PATHS[icon]
    const { w, h } = sizeMap[size]

    return (
        <div
            className={`relative shrink-0 overflow-hidden rounded-full bg-black/40 ${className}`}
            style={{ width: w, height: h }}
        >
            <Image
                src={path}
                alt=""
                width={w}
                height={h}
                className="object-contain"
            />
        </div>
    )
}
