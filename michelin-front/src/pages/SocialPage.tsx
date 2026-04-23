import { Plus, UserPlus, X } from 'lucide-react'
import React, { useMemo, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useBatchAvatarUrls } from '@/hooks/useMascot'
import {
  useSocialFeed,
  useMyLikes,
  useToggleLike,
  useFollowing,
} from '@/hooks/useSocial'
import { CreatePostModal } from '@/components/social/CreatePostModal'
import { FindFriendsModal } from '@/components/social/FindFriendsModal'
import { PostCard } from '@/components/social/PostCard'
import { avatar } from '@/components/social/utils'

// ── Main Page ────────────────────────────────────────────────────────────────

export function SocialPage() {
  const { user } = useAuth()
  const { data: feed = [], isLoading } = useSocialFeed()
  const { data: myLikes = new Set<string>() } = useMyLikes()
  const { data: following = [] } = useFollowing(user?.id ?? null)
  const toggleLike = useToggleLike()

  const [showCreatePost, setShowCreatePost] = useState(false)
  const [showFindFriends, setShowFindFriends] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  const allUserIds = useMemo(() => {
    const ids = new Set(following.map(f => f.id))
    feed.forEach(p => ids.add(p.user_id))
    if (user?.id) ids.add(user.id)
    return [...ids]
  }, [following, feed, user?.id])

  const { data: avatarUrls = new Map<string, string>() } = useBatchAvatarUrls(allUserIds)

  function resolveAvatar(userId: string) {
    return avatarUrls.get(userId) ?? avatar(userId)
  }

  const filteredFeed = useMemo(
    () => selectedUserId ? feed.filter(p => p.user_id === selectedUserId) : feed,
    [feed, selectedUserId]
  )

  function toggleUserFilter(id: string) {
    setSelectedUserId(prev => prev === id ? null : id)
  }

  return (
    <div className="flex flex-col min-h-screen bg-background pb-28 pt-8">
      {/* Header */}
      <div className="px-4 pb-3 pt-1 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          Mich' <span className="text-primary">Social</span>
        </h1>
        <button
          onClick={() => setShowFindFriends(true)}
          className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-semibold"
        >
          <UserPlus className="size-3.5" />
          Amis
        </button>
      </div>

      {/* Stories row */}
      <div className="overflow-x-auto px-4 pt-2 pb-4 no-scrollbar">
        <div className="flex gap-3">
          {/* Add story / create post */}
          <button
            onClick={() => setShowCreatePost(true)}
            className="flex flex-col items-center gap-1.5 flex-shrink-0"
          >
            <div className="rounded-full p-[2.5px] bg-muted">
              <div className="rounded-full bg-background p-[2px]">
                <div className="size-14 rounded-full bg-muted flex items-center justify-center">
                  <Plus className="size-5 text-primary" strokeWidth={2.5} />
                </div>
              </div>
            </div>
            <span className="text-[11px] font-medium text-foreground/80 max-w-[62px] truncate">
              Moi
            </span>
          </button>

          {/* Following */}
          {following.map(f => {
            const isSelected = selectedUserId === f.id
            const color = f.avatar_color ?? '#dde0ef'
            return (
              <button
                key={f.id}
                onClick={() => toggleUserFilter(f.id)}
                className="flex flex-col items-center gap-1.5 flex-shrink-0"
              >
                <div
                  className={[
                    'size-[60px] rounded-full overflow-hidden transition-all flex-shrink-0',
                    isSelected ? 'ring-[3px] ring-offset-2 ring-offset-background' : '',
                  ].join(' ')}
                  style={{
                    backgroundColor: color,
                    ...(isSelected ? { '--tw-ring-color': color } as React.CSSProperties : {}),
                    boxShadow: isSelected ? `0 0 0 2px var(--background), 0 0 0 4px ${color}` : undefined,
                  }}
                >
                  <img
                    src={resolveAvatar(f.id)}
                    alt={f.display_name}
                    className="size-full object-cover"
                  />
                </div>
                <span className={[
                  'text-[11px] font-medium max-w-[62px] truncate transition-colors',
                  isSelected ? 'font-bold' : 'text-foreground/80',
                ].join(' ')}
                  style={isSelected ? { color } : undefined}
                >
                  {f.display_name}
                </span>
              </button>
            )
          })}

          {/* Empty state in stories */}
          {following.length === 0 && (
            <button
              onClick={() => setShowFindFriends(true)}
              className="flex flex-col items-center gap-1.5 flex-shrink-0"
            >
              <div className="rounded-full p-[2.5px] bg-border">
                <div className="rounded-full bg-background p-[2px]">
                  <div className="size-14 rounded-full bg-muted flex items-center justify-center">
                    <UserPlus className="size-5 text-muted-foreground" strokeWidth={1.8} />
                  </div>
                </div>
              </div>
              <span className="text-[11px] font-medium text-muted-foreground max-w-[62px] text-center leading-tight">
                Trouver
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Active filter banner */}
      {selectedUserId && (() => {
        const u = following.find(f => f.id === selectedUserId)
        return u ? (
          <div className="mx-5 mb-3 flex items-center justify-between rounded-2xl bg-primary/10 px-4 py-2.5">
            <p className="text-sm font-semibold text-primary">
              Posts de {u.display_name}
            </p>
            <button
              onClick={() => setSelectedUserId(null)}
              className="rounded-full bg-primary/20 p-1"
              aria-label="Effacer le filtre"
            >
              <X className="size-3.5 text-primary" />
            </button>
          </div>
        ) : null
      })()}

      {/* Feed */}
      <div className="flex flex-col gap-4 px-5 pt-3">
        {isLoading && (
          <div className="py-16 text-center text-sm text-muted-foreground">
            Chargement...
          </div>
        )}

        {!isLoading && filteredFeed.length === 0 && (
          <div className="py-16 text-center rounded-3xl border border-dashed border-border flex flex-col gap-2">
            <p className="text-sm font-semibold">Aucun post pour l'instant</p>
            <p className="text-xs text-muted-foreground">
              {selectedUserId
                ? 'Cet utilisateur n\'a pas encore posté'
                : 'Suis des amis ou crée ton premier post'}
            </p>
            {!selectedUserId && (
              <button
                onClick={() => setShowCreatePost(true)}
                className="mt-3 mx-auto rounded-full bg-primary px-5 py-2 text-xs font-bold text-white"
              >
                Créer un post
              </button>
            )}
          </div>
        )}

        {filteredFeed.map(post => (
          <PostCard
            key={post.id}
            post={post}
            isLiked={myLikes.has(post.id)}
            onToggleLike={() =>
              toggleLike.mutate({ reviewId: post.id, isLiked: myLikes.has(post.id) })
            }
            currentUserId={user?.id ?? ''}
            avatarUrl={resolveAvatar(post.user_id)}
          />
        ))}
      </div>

      {/* Modals */}
      {showCreatePost && (
        <CreatePostModal onClose={() => setShowCreatePost(false)} />
      )}
      {showFindFriends && user && (
        <FindFriendsModal
          onClose={() => setShowFindFriends(false)}
          currentUserId={user.id}
        />
      )}
    </div>
  )
}