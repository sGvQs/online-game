'use client'

import { useState, useTransition } from 'react'
import { setUserComment } from '@/server/actions/user/setUserComment'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { userCommentForm } from './UserCommentForm.styles'
import { Typography } from '@/components/ui/typography'

const styles = userCommentForm()

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
    <form onSubmit={handleSubmit} className={styles.form()}>
      <div>
        <label htmlFor="comment" className={styles.label()}>
          煽りコメント
        </label>
        <Input
          id="comment"
          type="text"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="ゲーム終了後に勝ったら表示されるコメントを入力..."
          maxLength={20}
          disabled={isPending}
          className="w-full"
        />
        <Typography variant="caption" as="p" className={styles.charCount()}>
          {comment.length} / 20文字
        </Typography>
      </div>

      <Button
        type="submit"
        disabled={isPending || comment === initialComment}
        fullWidth
      >
        {isPending ? '保存中...' : success ? '保存しました！' : 'コメントを保存'}
      </Button>

      {success && (
        <p className={styles.successMessage()}>
          コメントが保存されました
        </p>
      )}
    </form>
  )
}
