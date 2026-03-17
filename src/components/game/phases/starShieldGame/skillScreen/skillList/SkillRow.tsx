import { type CSSProperties } from 'react'
import { skillRowStyles } from './styles'

const s = skillRowStyles()

export function SkillRow({
    label,
    detail,
    currentLevel,
    maxLevel,
    onClick,
    progressBarColor,
}: {
    label: React.ReactNode
    detail?: string
    currentLevel?: number
    maxLevel?: number
    onClick?: () => void
    progressBarColor: string
}) {
    return (
        <button onClick={onClick} className={s.root()}>
            <div className={s.labelCol()}>
                <div className={s.labelInner()}>
                    <span className={s.labelText()}>{label}</span>
                    {detail && <span className={s.detailText()}>{detail}</span>}
                    {currentLevel !== undefined && maxLevel !== undefined && (
                        <div className={s.levelBarWrapper()}>
                            <div className={s.levelBarTrack()}>
                                <div
                                    className={s.levelBarFill()}
                                    style={{
                                        '--progress': `${(currentLevel / maxLevel) * 100}%`,
                                        '--bar-color': progressBarColor,
                                    } as CSSProperties}
                                />
                            </div>
                            <span className={s.levelText()}>
                                {currentLevel}/{maxLevel}
                            </span>
                        </div>
                    )}
                </div>
            </div>
            {currentLevel === 0 ? (
                <span className={s.badgeNotOwned()}>未入手</span>
            ) : currentLevel === maxLevel ? (
                <span className={s.badgeMaxed()}>MAX</span>
            ) : (
                <span className={s.badgeLevel()}>Lv {currentLevel}</span>
            )}
        </button>
    )
}
