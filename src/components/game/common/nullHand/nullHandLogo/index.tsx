import { HandType } from '@/types'
import { Hand3D } from '@/components/game/common/nullHand/hand3D'
import { nullHandLogo } from './styles'

interface NullHandLogoProps {
    titleHand: HandType
    userColor?: string
    onClick?: () => void
    showChangeButton?: boolean
}

export function NullHandLogo({ titleHand, userColor, onClick, showChangeButton = true }: NullHandLogoProps) {
    const styles = nullHandLogo()

    return (
        <div className="text-center group" style={userColor ? { ['--logo-color' as string]: userColor } : undefined}>
            <div className={styles.logo()}>NULL HAND</div>
            <div
                className="w-64 h-64 mx-auto cursor-pointer transition-transform active:scale-95"
                onClick={onClick}
            >
                <Hand3D
                    handType={titleHand}
                    revealed={true}
                    size="medium"
                    isRotating={true}
                    personalColor={userColor}
                />
            </div>
            {showChangeButton &&
                <p className="text-[10px] text-gray-500 font-sans mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    CLICK TO CHANGE YOUR COLOR
                </p>
            }
        </div>
    )
}
