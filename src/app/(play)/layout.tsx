import { StarfieldBackground } from '@/components/StarfieldBackground'

/**
 * room と game の共通レイアウト。
 * StarfieldBackground をここで1度だけ描画し、
 * room → star-shield 等の遷移時もアンマウントされないようにする。
 */
export default function PlayLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="relative min-h-screen">
            <StarfieldBackground />
            {children}
        </div>
    )
}
