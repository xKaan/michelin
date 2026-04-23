// src/components/social/PostCard.tsx
import { useState } from 'react'
import { Heart, MessageCircle, MoreHorizontal, Star } from 'lucide-react'
import { useNavigate } from 'react-router'
import { BottomSheet } from '@/components/shared/BottomSheet'
import { CommentsSheet } from './CommentsSheet'
import { useDeletePost } from '@/hooks/useSocial'
import type { SocialPost } from '@/hooks/useSocial'
import { timeAgo } from './utils'

interface PostCardProps {
  post: SocialPost
  isLiked: boolean
  onToggleLike: () => void
  currentUserId: string
  avatarUrl: string
}

export function PostCard({ post, isLiked, onToggleLike, currentUserId, avatarUrl }: PostCardProps) {
  const photo = post.media.find(m => m.type === 'photo')
  const deletePost = useDeletePost()
  const navigate = useNavigate()
  const [showDeleteSheet, setShowDeleteSheet] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const isOwner = post.user_id === currentUserId

  function goToProfile() {
    if (isOwner) navigate('/profile')
    else navigate(`/profile/${post.user_id}`)
  }

  return (
    <>
      <article className="rounded-3xl bg-card overflow-hidden">
        {/* Header */}
        <div className="flex items-center px-4 py-3 gap-3">
          <button
            onClick={goToProfile}
            className="size-10 rounded-full overflow-hidden shrink-0 active:opacity-70 transition-opacity"
            style={{ backgroundColor: post.user.avatar_color ?? '#dde0ef' }}
          >
            <img src={avatarUrl} alt={post.user.display_name} className="size-full object-cover" />
          </button>
          <div className="flex-1 min-w-0">
            <button
              onClick={goToProfile}
              className="text-sm font-semibold leading-tight active:opacity-70 transition-opacity"
            >
              {post.user.display_name}
            </button>
            <p className="text-xs text-muted-foreground truncate">
              {post.establishment.name}
              {post.establishment.city ? ` · ${post.establishment.city}` : ''}
            </p>
          </div>
          {isOwner && (
            <button
              onClick={() => setShowDeleteSheet(true)}
              className="p-1.5 -mr-1 text-muted-foreground rounded-full shrink-0"
              aria-label="Options"
            >
              <MoreHorizontal className="size-5" />
            </button>
          )}
        </div>

        {/* Photo */}
        {photo && (
          <div className="px-3">
            <img
              src={photo.url}
              alt={post.establishment.name}
              className="w-full aspect-square object-cover rounded-[28px]"
              loading="lazy"
            />
          </div>
        )}

        {/* Actions */}
        <div className="px-4 pt-3 pb-1 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onToggleLike} className="transition-transform active:scale-90" aria-label="J'aime">
              <Heart
                className={['size-6 transition-colors', isLiked ? 'fill-primary text-primary' : 'text-foreground'].join(' ')}
                strokeWidth={isLiked ? 0 : 1.8}
              />
            </button>
            <button onClick={() => setShowComments(v => !v)} aria-label="Commenter">
              <MessageCircle
                className={['size-6 transition-colors', showComments ? 'text-primary' : 'text-foreground'].join(' ')}
                strokeWidth={1.8}
              />
            </button>
          </div>
          <p className="text-sm font-semibold">{post.likes_count} j'aime{post.likes_count !== 1 ? 's' : ''}</p>
        </div>

        {post.title && <p className="px-4 mt-2 text-base font-bold leading-tight">{post.title}</p>}

        {post.content && (
          <p className={['px-4 text-sm leading-snug', post.title ? 'mt-0.5' : 'mt-1'].join(' ')}>
            <span className="font-semibold mr-1.5">{post.user.display_name}</span>
            {post.content}
          </p>
        )}

        <div className="px-4 mt-1 flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={['size-3', i < post.rating ? 'fill-primary text-primary' : 'text-muted-foreground/30'].join(' ')}
              strokeWidth={0}
            />
          ))}
        </div>

        <p className="px-4 mt-1.5 pb-4 text-[11px] uppercase tracking-wide text-muted-foreground/70">
          Il y a {timeAgo(post.created_at)}
        </p>
      </article>

      {showComments && (
        <CommentsSheet
          reviewId={post.id}
          currentUserId={currentUserId}
          onClose={() => setShowComments(false)}
        />
      )}

      {showDeleteSheet && (
        <BottomSheet onClose={() => setShowDeleteSheet(false)}>
          <div className="px-5 pb-5 flex flex-col gap-3">
            <p className="text-center text-sm text-muted-foreground px-4">
              Cette action est irréversible. Le post et sa photo seront supprimés.
            </p>
            <button
              onClick={async () => {
                await deletePost.mutateAsync(post)
                setShowDeleteSheet(false)
              }}
              disabled={deletePost.isPending}
              className="rounded-2xl bg-destructive/10 py-3.5 text-sm font-bold text-destructive disabled:opacity-50 active:scale-[0.98] transition-transform"
            >
              {deletePost.isPending ? 'Suppression...' : 'Supprimer le post'}
            </button>
            <button
              onClick={() => setShowDeleteSheet(false)}
              className="rounded-2xl bg-muted py-3.5 text-sm font-semibold active:scale-[0.98] transition-transform"
            >
              Annuler
            </button>
          </div>
        </BottomSheet>
      )}
    </>
  )
}
