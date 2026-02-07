'use client'

import React, { useEffect } from 'react'
import { roomModal } from './styles'

interface RoomModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    children: React.ReactNode
    showCloseButton?: boolean
}

/**
 * Room画面用の共通モーダルコンポーネント
 * 
 * glassmorphismデザインで、画面の縦横60%のサイズで中央に浮遊表示される。
 * room画面の雰囲気（space theme + neon accents）に合わせたデザイン。
 */
export function RoomModal({
    isOpen,
    onClose,
    title,
    children,
    showCloseButton = true,
}: RoomModalProps) {
    const styles = roomModal()

    // ESCキーでモーダルを閉じる
    useEffect(() => {
        if (!isOpen) return

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose()
            }
        }

        document.addEventListener('keydown', handleEscape)
        return () => document.removeEventListener('keydown', handleEscape)
    }, [isOpen, onClose])

    // モーダルが開いているときはbodyのスクロールを無効化
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }

        return () => {
            document.body.style.overflow = ''
        }
    }, [isOpen])

    if (!isOpen) return null

    return (
        <div className={styles.overlay()} onClick={onClose}>
            <div 
                className={styles.content()} 
                onClick={(e) => e.stopPropagation()}
            >
                {/* ヘッダー */}
                <div className={styles.header()}>
                    <h2 className={styles.title()}>{title}</h2>
                    {showCloseButton && (
                        <button
                            className={styles.closeButton()}
                            onClick={onClose}
                            aria-label="閉じる"
                        >
                            ×
                        </button>
                    )}
                </div>

                {/* コンテンツ */}
                <div className={styles.body()}>
                    {children}
                </div>
            </div>
        </div>
    )
}
