'use client'

import { useState, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { PackagePlus, X, Check, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { IconButton } from '@/components/ui/iconButton'
import { Input } from '@/components/ui/input'
import { createRoom } from '@/server/actions/room'
import { AnnoyingDinosaurComplaint } from './annoyingDinosaurComplaint'
import {
    getRandomCreateRoomMessage,
    getRandomDinosaurRoomName,
    getRandomTypingMessage,
} from '@/constants/dashboard/dinosaurMessages'

export function DashboardSidebar({ isTop5User = false }: { isTop5User?: boolean }) {
  const [roomFormOpen, setRoomFormOpen] = useState(false)
  const [dinosaurKey, setDinosaurKey] = useState(0)
  const [dinosaurExiting, setDinosaurExiting] = useState(false)
  const [typingMode, setTypingMode] = useState(false)
  const [typingRoomName, setTypingRoomName] = useState<string | null>(null)
  const [dinosaurMessage, setDinosaurMessage] = useState<string>('')
  const [roomName, setRoomName] = useState('')
  const typingModeFlipRef = useRef(false)

  const handleRoomFormOpen = () => {
    setRoomFormOpen(true)
    setDinosaurExiting(false)
    setDinosaurKey((k) => k + 1)
    setRoomName('')
    // 上位5位かつ50%の確率（クリックごとに交互）でのみタイピングモード
    typingModeFlipRef.current = !typingModeFlipRef.current
    const shouldTypingMode =
      isTop5User && typingModeFlipRef.current
    setTypingMode(shouldTypingMode)
    setTypingRoomName(shouldTypingMode ? getRandomDinosaurRoomName() : null)
    setDinosaurMessage(shouldTypingMode ? getRandomTypingMessage() : getRandomCreateRoomMessage())
  }

  const handleCancel = () => {
    setRoomFormOpen(false)
    setDinosaurExiting(true)
    setRoomName('')
    setTypingMode(false)
    setTypingRoomName(null)
  }

  const handleDinosaurComplete = () => {
    setDinosaurExiting(false)
  }

  const handleTypeIntoInput = useCallback((text: string) => {
    setRoomName(text)
  }, [])

  const showDinosaur = roomFormOpen || dinosaurExiting

  return (
    <div className="glass-card p-6 rounded-2xl">
      <h2 className="text-xl font-bold mb-4 text-brand-900 flex items-center gap-2">
        <PackagePlus className="w-4 h-4" />
        ルームを作成
      </h2>
      {!roomFormOpen ? (
        <Button
          onClick={handleRoomFormOpen}
          className="w-full bg-brand-300 hover:bg-brand-400 text-white shadow-md hover:shadow-lg transition-all duration-300 gap-2"
        >
          <Plus className="w-5 h-5" />
          新規ルーム
        </Button>
      ) : (
        <CreateRoomFormContent
          onClose={handleCancel}
          roomName={typingMode ? roomName : undefined}
          onRoomNameChange={typingMode ? setRoomName : undefined}
        />
      )}
      {showDinosaur &&
        typeof document !== 'undefined' &&
        createPortal(
          <AnnoyingDinosaurComplaint
            key={dinosaurKey}
            message={dinosaurMessage}
            onComplete={handleDinosaurComplete}
            triggerExit={dinosaurExiting}
            typingMode={typingMode}
            textToType={typingRoomName ?? undefined}
            onTypeIntoInput={typingMode ? handleTypeIntoInput : undefined}
          />,
          document.body
        )}
    </div>
  )
}

function CreateRoomFormContent({
  onClose,
  roomName,
  onRoomNameChange,
}: {
  onClose: () => void
  roomName?: string
  onRoomNameChange?: (v: string) => void
}) {
  const isControlled = roomName !== undefined && onRoomNameChange !== undefined

  return (
    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
      {/* <h3 className="font-bold mb-3 text-sm text-brand-800 dark:text-brand-300 uppercase tracking-wider flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
        新しいルームの詳細
      </h3> */}
      <form action={async (formData) => {
        await createRoom(formData)
        onClose()
      }} className="flex flex-col gap-3">
        <Input
          name="name"
          placeholder="ルーム名を入力...（15文字以内）"
          required
          maxLength={15}
          value={isControlled ? roomName : undefined}
          onChange={isControlled ? (e) => onRoomNameChange?.(e.target.value) : undefined}
          className="input-room-name w-full border-brand-200 focus:border-brand-500 focus:ring-brand-500/20 focus:ring-2"
          autoFocus
        />
        <div className="flex gap-2 mt-1">
          <Button type="submit" className="flex-1 bg-brand-300 hover:bg-brand-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)] hover:shadow-[0_0_25px_rgba(99,102,241,0.6)] transition-all duration-300 gap-2">
            <Check className="w-4 h-4" />
            作成
          </Button>
          <IconButton
            type="button"
            onClick={onClose}
            variant="ghost"
            size="md"
            icon={<X className="w-5 h-5" />}
            tooltip="キャンセル"
          />
        </div>
      </form>
    </div>
  )
}
