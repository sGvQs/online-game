'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { PackagePlus, MessageSquare, Edit2, X, Check, Plus, ScanFace } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { IconButton } from '@/components/ui/IconButton'
import { Input } from '@/components/ui/Input'
import { setUserComment } from '@/server/actions/user/setUserComment'
import { setUserFaceIcon } from '@/server/actions/user/setUserFaceIcon'
import { createRoom } from '@/server/actions/room'
import { FACE_ICON_PATHS, FACE_ICON_OPTIONS, FaceIcon } from '@/shared/constants/faceIcon'

interface DashboardSidebarProps {
  initialComment: string | null
  initialFaceIcon: FaceIcon
}

export function DashboardSidebar({ initialComment, initialFaceIcon }: DashboardSidebarProps) {
  const router = useRouter()
  const [roomFormOpen, setRoomFormOpen] = useState(false)
  const [commentFormOpen, setCommentFormOpen] = useState(false)
  const [faceFormOpen, setFaceFormOpen] = useState(false)
  const [currentComment, setCurrentComment] = useState(initialComment)
  const [currentFaceIcon, setCurrentFaceIcon] = useState(initialFaceIcon)

  // 一方が開いたらもう一方を閉じる
  const handleRoomFormOpen = () => {
    setRoomFormOpen(true)
    setCommentFormOpen(false)
    setFaceFormOpen(false)
  }

  const handleRoomFormClose = () => {
    setRoomFormOpen(false)
  }

  const handleCommentFormOpen = () => {
    setCommentFormOpen(true)
    setRoomFormOpen(false)
    setFaceFormOpen(false)
  }

  const handleCommentFormClose = () => {
    setCommentFormOpen(false)
  }

  const handleFaceFormOpen = () => {
    setFaceFormOpen(true)
    setRoomFormOpen(false)
    setCommentFormOpen(false)
  }

  const handleFaceFormClose = () => {
    setFaceFormOpen(false)
  }

  return (
    <aside className="lg:col-span-1 space-y-6">
     {/* 顔アイコン設定セクション */}
      <div className="glass-card p-6 rounded-2xl">
        <h2 className="text-xl font-bold mb-4 text-brand-900 flex items-center gap-2">
          <ScanFace className="w-4 h-4" />
          顔アイコン設定
        </h2>
        {!faceFormOpen ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 relative shrink-0 rounded-full overflow-hidden">
              <Image
                src={FACE_ICON_PATHS[currentFaceIcon]}
                alt="顔アイコン"
                fill
                className="object-contain"
              />
            </div>
            <Button
              onClick={handleFaceFormOpen}
              className="flex-1 bg-brand-300 hover:bg-brand-400 text-white shadow-md hover:shadow-lg transition-all duration-300 gap-2"
            >
              <Edit2 className="w-4 h-4" />
              変更
            </Button>
          </div>
        ) : (
          <FaceIconFormContent
            currentFaceIcon={currentFaceIcon}
            onClose={handleFaceFormClose}
            onSave={(newFaceIcon) => {
              setCurrentFaceIcon(newFaceIcon)
              router.refresh()
            }}
          />
        )}
      </div>
      {/* ルーム作成セクション */}
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
          <CreateRoomFormContent onClose={handleRoomFormClose} />
        )}
      </div>
      {/* 煽りコメント設定セクション */}
      <div className="glass-card p-6 rounded-2xl">
        <h2 className="text-xl font-bold mb-4 text-brand-900 flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          煽りコメント設定
        </h2>
        {!commentFormOpen ? (
          <div className="space-y-3">
            {currentComment && (
              <div className="p-3 bg-white/10 rounded-lg border border-brand-200/30">
                <p className="text-xs text-brand-900 opacity-90">
                  {currentComment}
                </p>
              </div>
            )}
            <Button
              onClick={handleCommentFormOpen}
              className="w-full bg-brand-300 hover:bg-brand-400 text-white shadow-md hover:shadow-lg transition-all duration-300 gap-2"
            >
              <Edit2 className="w-5 h-5" />
              追加・変更
            </Button>
          </div>
        ) : (
          <UserCommentFormContent
            initialComment={currentComment}
            onClose={handleCommentFormClose}
            onSave={(newComment) => {
              setCurrentComment(newComment)
              router.refresh()
            }}
          />
        )}
      </div>
    </aside>
  )
}

// ルーム作成フォームのコンテンツ
function CreateRoomFormContent({ onClose }: { onClose: () => void }) {
  return (
    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
      <h3 className="font-bold mb-3 text-sm text-brand-800 dark:text-brand-300 uppercase tracking-wider flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
        新しいルームの詳細
      </h3>
      <form action={async (formData) => {
        await createRoom(formData)
        onClose()
      }} className="flex flex-col gap-3">
        <Input
          name="name"
          placeholder="ルーム名を入力..."
          required
          className="w-full bg-white/50 dark:bg-slate-900/50 border-brand-200 dark:border-brand-700 focus:border-brand-500 focus:ring-brand-500/20 dark:text-white placeholder:text-brand-400/50"
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
      <div className="mt-6 pt-6 border-t border-brand-100">
        <p className="text-xs text-brand-900 leading-relaxed">
          新しいルームを作成して、友達とゲームを始めましょう。
        </p>
      </div>
    </div>
  )
}

// 顔アイコンフォームのコンテンツ
function FaceIconFormContent({
  currentFaceIcon,
  onClose,
  onSave
}: {
  currentFaceIcon: FaceIcon
  onClose: () => void
  onSave: (newFaceIcon: FaceIcon) => void
}) {
  const [selectedFaceIcon, setSelectedFaceIcon] = useState(currentFaceIcon)
  const [isPending, startTransition] = useTransition()
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    startTransition(async () => {
      try {
        await setUserFaceIcon(selectedFaceIcon)
        setSuccess(true)
        onSave(selectedFaceIcon)
        setTimeout(() => {
          setSuccess(false)
          onClose()
        }, 1000)
      } catch (error) {
        console.error('顔アイコンの保存に失敗しました:', error)
        alert('顔アイコンの保存に失敗しました')
      }
    })
  }

  return (
    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
      <h3 className="font-bold mb-3 text-sm text-brand-800 dark:text-brand-300 uppercase tracking-wider flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
        顔を選択
      </h3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="grid grid-cols-4 gap-2">
          {FACE_ICON_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setSelectedFaceIcon(option.value)}
              className={`relative w-full aspect-square rounded-xl border-2 transition-all overflow-hidden ${
                selectedFaceIcon === option.value
                  ? 'border-brand-500 bg-brand-100 dark:bg-brand-900/50'
                  : 'border-transparent bg-white/10 hover:bg-white/20'
              }`}
            >
              <Image
                src={FACE_ICON_PATHS[option.value]}
                alt={option.label}
                fill
                className="object-contain p-2"
              />
            </button>
          ))}
        </div>
        <div className="flex gap-2 mt-1">
          <Button
            type="submit"
            disabled={isPending || selectedFaceIcon === currentFaceIcon}
            className="flex-1 bg-brand-300 hover:bg-brand-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)] hover:shadow-[0_0_25px_rgba(99,102,241,0.6)] transition-all duration-300 gap-2"
          >
            <Check className="w-4 h-4" />
            {isPending ? '保存中...' : success ? '保存しました！' : '保存'}
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
        {success && (
          <p className="text-sm text-green-600 text-center">
            顔アイコンが保存されました
          </p>
        )}
      </form>
      <div className="mt-6 pt-6 border-t border-brand-100">
        <p className="text-xs text-brand-900 leading-relaxed">
          ルームの参加者リストなどで表示される顔アイコンを選択できます。
        </p>
      </div>
    </div>
  )
}

// コメントフォームのコンテンツ
function UserCommentFormContent({
  initialComment,
  onClose,
  onSave
}: {
  initialComment: string | null
  onClose: () => void
  onSave: (newComment: string) => void
}) {
  const [comment, setComment] = useState(initialComment || '')
  const [isPending, startTransition] = useTransition()
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    startTransition(async () => {
      try {
        await setUserComment(comment)
        setSuccess(true)
        onSave(comment)
        setTimeout(() => {
          setSuccess(false)
          onClose()
        }, 1000)
      } catch (error) {
        console.error('コメントの保存に失敗しました:', error)
        alert('コメントの保存に失敗しました')
      }
    })
  }

  return (
    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
      <h3 className="font-bold mb-3 text-sm text-brand-800 dark:text-brand-300 uppercase tracking-wider flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
        コメントを設定
      </h3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Input
          type="text"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="ゲーム終了後に勝ったら表示されるコメントを入力..."
          maxLength={20}
          disabled={isPending}
          className="w-full bg-white/50 dark:bg-slate-900/50 border-brand-200 dark:border-brand-700 focus:border-brand-500 focus:ring-brand-500/20 dark:text-white placeholder:text-brand-400/50"
          autoFocus
        />
        <p className="text-xs text-brand-900 opacity-70">
          {comment.length} / 20文字
        </p>
        <div className="flex gap-2 mt-1">
          <Button
            type="submit"
            disabled={isPending || comment === initialComment}
            className="flex-1 bg-brand-300 hover:bg-brand-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)] hover:shadow-[0_0_25px_rgba(99,102,241,0.6)] transition-all duration-300 gap-2"
          >
            <Check className="w-4 h-4" />
            {isPending ? '保存中...' : success ? '保存しました！' : '保存'}
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
        {success && (
          <p className="text-sm text-green-600 text-center">
            コメントが保存されました
          </p>
        )}
      </form>
      <div className="mt-6 pt-6 border-t border-brand-100">
        <p className="text-xs text-brand-900 leading-relaxed">
          ゲームで勝利した際に、他のプレイヤーに表示されるコメントを設定できます。
        </p>
      </div>
    </div>
  )
}
