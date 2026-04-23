// src/components/social/CommentsSheet.tsx
import React, { useState } from 'react'
import { X } from 'lucide-react'
import { BottomSheet } from '@/components/shared/BottomSheet'
import { useComments, useAddComment } from '@/hooks/useSocial'
import { avatar, timeAgo } from './utils'

interface CommentsSheetProps {
  reviewId: string
  currentUserId: string
  onClose: () => void
}

export function CommentsSheet({ reviewId, currentUserId, onClose }: CommentsSheetProps) {
  const { data: comments = [], isLoading } = useComments(reviewId, true)
  const addComment = useAddComment()
  const [text, setText] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return
    setText('')
    await addComment.mutateAsync({ reviewId, content: trimmed })
  }

  return (
    <BottomSheet onClose={onClose} maxHeight="75vh">
      <div className="flex-shrink-0 px-5 pb-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold">Commentaires</h2>
          <button onClick={onClose} className="rounded-full p-2 bg-muted">
            <X className="size-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 flex flex-col gap-3 pb-3">
        {isLoading && (
          <p className="text-xs text-muted-foreground py-4 text-center">Chargement...</p>
        )}
        {!isLoading && comments.length === 0 && (
          <p className="text-sm text-muted-foreground py-8 text-center">
            Aucun commentaire · Sois le premier !
          </p>
        )}
        {comments.map(c => (
          <div key={c.id} className="flex items-start gap-3">
            <img
              src={avatar(c.user_id)}
              alt={c.user.display_name}
              className="size-8 rounded-full bg-muted flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm leading-snug">
                <span className="font-semibold mr-1.5">{c.user.display_name}</span>
                {c.content}
              </p>
              <p className="text-[11px] text-muted-foreground/60 mt-0.5">
                {timeAgo(c.created_at)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex-shrink-0 flex items-center gap-3 px-5 py-3 border-t border-border"
      >
        <img
          src={avatar(currentUserId)}
          alt="moi"
          className="size-8 rounded-full bg-muted flex-shrink-0"
        />
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Ajouter un commentaire..."
          className="flex-1 text-sm bg-muted rounded-full px-4 py-2 outline-none placeholder:text-muted-foreground"
          autoFocus
        />
        <button
          type="submit"
          disabled={!text.trim() || addComment.isPending}
          className="text-sm font-bold text-primary disabled:opacity-40 flex-shrink-0"
        >
          Envoyer
        </button>
      </form>
    </BottomSheet>
  )
}
