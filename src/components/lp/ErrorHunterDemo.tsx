'use client'

import { useState, useCallback, useEffect } from 'react'
import { Win95Dialog } from '@/components/game/Win95Dialog'
import { Win95TitleBarButton } from '@/components/game/Win95TitleBarButton'
import { cn } from '@/lib/utils'

const ERROR_MESSAGES = [
    'Windows Protection Error.\nYou need to restart your computer.',
    'A fatal exception 0E has occurred.\nThe current application will be terminated.',
    'This program has performed an illegal operation\nand will be shut down.',
]

function getRandomErrorMessage(): string {
    return ERROR_MESSAGES[Math.floor(Math.random() * ERROR_MESSAGES.length)]!
}

const DINOSAUR_ICON = '/svg/charactor/annoying-dinosaur.svg'

const ERROR_POSITIONS = [
    { x: 15, y: 25 },
    { x: 55, y: 30 },
    { x: 35, y: 55 },
    { x: 70, y: 60 },
    { x: 25, y: 75 },
]

interface ErrorModalState {
    id: string
    positionX: number
    positionY: number
    message: string
    closed: boolean
}

export function ErrorHunterDemo() {
    const [phase, setPhase] = useState<'playing' | 'result'>('playing')
    const [errors, setErrors] = useState<ErrorModalState[]>([])

    useEffect(() => {
        setErrors(
            ERROR_POSITIONS.map((pos, i) => ({
                id: `err-${i}`,
                positionX: pos.x,
                positionY: pos.y,
                message: getRandomErrorMessage(),
                closed: false,
            }))
        )
    }, [])

    const closeError = useCallback((id: string) => {
        setErrors((prev) => {
            const next = prev.map((e) => (e.id === id ? { ...e, closed: true } : e))
            const allClosed = next.every((e) => e.closed)
            if (allClosed) {
                setTimeout(() => setPhase('result'), 300)
            }
            return next
        })
    }, [])

    const endDemo = useCallback(() => {
        setPhase('playing')
        setErrors(
            ERROR_POSITIONS.map((pos, i) => ({
                id: `err-${i}`,
                positionX: pos.x,
                positionY: pos.y,
                message: getRandomErrorMessage(),
                closed: false,
            }))
        )
    }, [])

    return (
        <div
            className={cn(
                'relative rounded-xl overflow-hidden border-2 border-brand-500/50',
                'bg-[#008080] min-h-[400px]',
                "font-['MS_Sans_Serif','Segoe_UI',Tahoma,sans-serif] text-xs",
                'after:content-[""] after:absolute after:top-0 after:left-0 after:w-full after:h-full',
                'after:bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.03)_0px,rgba(0,0,0,0.03)_1px,transparent_1px,transparent_2px)]',
                'after:pointer-events-none'
            )}
        >
            {/* 星の装飾（他画面と同量・背景レイヤー） */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full opacity-80 animate-pulse" />
                <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-brand-400 rounded-full opacity-60" />
                <div className="absolute bottom-1/4 left-1/2 w-1.5 h-1.5 bg-white rounded-full opacity-70 animate-pulse" style={{ animationDelay: '1s' }} />
            </div>
            {/* Win95 デスクトップ上にエラーダイアログを配置 */}
            {phase === 'playing' &&
                errors
                    .filter((e) => !e.closed)
                    .map((e) => (
                        <div
                            key={e.id}
                            className={cn(
                                'absolute translate-x-[-50%] translate-y-[-50%] z-10',
                                'animate-[win95-appear_0.15s_ease-out]'
                            )}
                            style={{
                                left: `${e.positionX}%`,
                                top: `${e.positionY}%`,
                                width: 'min(320px, 90vw)',
                            }}
                        >
                            <Win95Dialog
                                title="Error"
                                icon="error"
                                innerClassName="error"
                                titlebarButtons={
                                    <Win95TitleBarButton
                                        onClick={() => closeError(e.id)}
                                        aria-label="Close"
                                    >
                                        ×
                                    </Win95TitleBarButton>
                                }
                            >
                                <p style={{ whiteSpace: 'pre-line', fontSize: '12px' }}>
                                    {e.message}
                                </p>
                            </Win95Dialog>
                        </div>
                    ))}

            {/* リザルトモーダル */}
            {phase === 'result' && (
                <div
                    className="absolute inset-0 flex items-center justify-center z-20"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
                >
                    <Win95Dialog
                        title="Result"
                        customIconSrc={DINOSAUR_ICON}
                        buttons={[
                            {
                                label: 'もう一度',
                                onClick: endDemo,
                                primary: true,
                            },
                        ]}
                    >
                        <div style={{ minWidth: '300px' }}>
                            <div style={{ marginBottom: '12px', marginLeft: '24px' }}>
                                <p
                                    style={{
                                        fontSize: '12px',
                                        fontWeight: 'normal',
                                        color: '#000',
                                        marginBottom: '4px',
                                        padding: '4px',
                                        backgroundColor: 'transparent',
                                        borderRadius: '2px',
                                    }}
                                >
                                    名もなき恐竜さんからのコメント
                                </p>
                                <p
                                    style={{
                                        fontSize: '14px',
                                        fontWeight: 'bold',
                                        color: '#000080',
                                        marginBottom: '4px',
                                        padding: '4px',
                                        backgroundColor: '#e0e0e0',
                                        borderRadius: '2px',
                                    }}
                                >
                                    ゲームで待ってるぜ
                                </p>
                            </div>
                            <p
                                style={{
                                    fontSize: '12px',
                                    color: '#000080',
                                    marginLeft: '24px',
                                    marginTop: '12px',
                                }}
                            >
                                あなたの負けです
                            </p>
                        </div>
                    </Win95Dialog>
                </div>
            )}
        </div>
    )
}
