'use client'

import { useState, useTransition } from 'react'
import { setUserComment } from '@/server/actions/user/getUserComment'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

interface UserCommentFormProps {
  initialComment?: string | null
}

export function UserCommentForm({ initialComment }: UserCommentFormProps) {
  const [comment, setComment] = useState(initialComment || '')
  const [isPending, startTransition] = useTransition()
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    startTransition(async () => {
      try {
        await setUserComment(comment)
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      } catch (error) {
        console.error('コメントの保存に失敗しました:', error)
        alert('コメントの保存に失敗しました')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="comment" className="block text-sm font-medium text-brand-900 mb-2">
          煽りコメント
        </label>
        <Input
          id="comment"
          type="text"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="ゲーム終了後に勝ったら表示されるコメントを入力..."
          maxLength={100}
          disabled={isPending}
          className="w-full"
        />
        <p className="mt-1 text-xs text-brand-900 opacity-70">
          {comment.length} / 100文字
        </p>
      </div>
      
      <Button
        type="submit"
        disabled={isPending || comment === initialComment}
        fullWidth
      >
        {isPending ? '保存中...' : success ? '保存しました！' : 'コメントを保存'}
      </Button>
      
      {success && (
        <p className="text-sm text-green-600 text-center">
          コメントが保存されました
        </p>
      )}
    </form>
  )
}
