import { HandType } from '@/shared/types'
import { Hand3D } from './Hand3D'
import { nullHandGame } from './styles'

interface NullHandLogoProps {
    titleHand: HandType
}

export function NullHandLogo({ titleHand }: NullHandLogoProps) {
    const styles = nullHandGame()

    return (
        <div className="text-center">
            <div className={styles.logo()}>NULL HAND</div>
            <div className="w-64 h-64 mx-auto">
                <Hand3D handType={titleHand} revealed={true} size="medium" isRotating={true} />
            </div>
        </div>
    )
}
