import { HandType } from '@/types'
import { Hand3D } from './hand3D'
import { nullHandGame } from './styles'

interface NullHandLogoProps {
    titleHand: HandType
    userColor?: string
    onClick?: () => void
    showChangeButton?: boolean
}

export function NullHandLogo({ titleHand, userColor, onClick, showChangeButton = true }: NullHandLogoProps) {
    const styles = nullHandGame()

    return (
        <div className="text-center group">
            <div style={{ color: userColor }} className={styles.logo()} >NULL HAND</div>
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
                <p className="text-[10px] text-gray-500 font-mono mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    CLICK TO CHANGE YOUR COLOR
                </p>
            }
        </div>
    )
}
