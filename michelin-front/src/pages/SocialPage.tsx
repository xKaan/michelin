import { Plus, UserPlus, X } from 'lucide-react'
import React, { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
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
  const [highlightPostId, setHighlightPostId] = useState<string | null>(null)

  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    const postId = searchParams.get('post')
    if (!postId || isLoading) return
    setHighlightPostId(postId)
    setSearchParams({}, { replace: true })
    requestAnimationFrame(() => {
      document.getElementById(`post-${postId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
  }, [searchParams, isLoading, setSearchParams])

  const allUserIds = useMemo(() => {
    const ids = new Set(following.map(f => f.id))
    feed.forEach(p => ids.add(p.user_id))
    if (user?.id) ids.add(user.id)
    return [...ids]
  }, [following, feed, user])

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
    <div className="min-h-screen bg-background pb-28 md:pb-8 pt-8">
      <div className="md:flex md:gap-6 md:max-w-4xl md:mx-auto md:px-4">

        {/* ── Main feed column ── */}
        <div className="md:flex-1 md:max-w-xl md:min-w-0">
          {/* Header */}
          <div className="px-4 pb-3 pt-1 flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight">
              Mich' <span className="text-primary">Social</span>
            </h1>
            <button
              onClick={() => setShowFindFriends(true)}
              className="md:hidden flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-semibold"
            >
              <UserPlus className="size-3.5" />
              Amis
            </button>
          </div>

          {/* Stories row */}
          <div className="overflow-x-auto px-4 pt-2 pb-4 no-scrollbar">
            <div className="flex gap-3">
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
                <span className="text-[11px] font-medium text-foreground/80 max-w-[62px] truncate">Moi</span>
              </button>

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
                      <img src={resolveAvatar(f.id)} alt={f.display_name} className="size-full object-cover" />
                    </div>
                    <span
                      className={['text-[11px] font-medium max-w-[62px] truncate transition-colors', isSelected ? 'font-bold' : 'text-foreground/80'].join(' ')}
                      style={isSelected ? { color } : undefined}
                    >
                      {f.display_name}
                    </span>
                  </button>
                )
              })}

              {following.length === 0 && (
                <button onClick={() => setShowFindFriends(true)} className="flex flex-col items-center gap-1.5 flex-shrink-0">
                  <div className="rounded-full p-[2.5px] bg-border">
                    <div className="rounded-full bg-background p-[2px]">
                      <div className="size-14 rounded-full bg-muted flex items-center justify-center">
                        <UserPlus className="size-5 text-muted-foreground" strokeWidth={1.8} />
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] font-medium text-muted-foreground max-w-[62px] text-center leading-tight">Trouver</span>
                </button>
              )}
            </div>
          </div>

          {/* Active filter banner */}
          {selectedUserId && (() => {
            const u = following.find(f => f.id === selectedUserId)
            return u ? (
              <div className="mx-5 mb-3 flex items-center justify-between rounded-2xl bg-primary/10 px-4 py-2.5">
                <p className="text-sm font-semibold text-primary">Posts de {u.display_name}</p>
                <button onClick={() => setSelectedUserId(null)} className="rounded-full bg-primary/20 p-1" aria-label="Effacer le filtre">
                  <X className="size-3.5 text-primary" />
                </button>
              </div>
            ) : null
          })()}

          {/* Feed */}
          <div className="flex flex-col gap-4 px-5 pt-3">
            {isLoading && (
              <div className="py-16 text-center text-sm text-muted-foreground">Chargement...</div>
            )}
            {!isLoading && filteredFeed.length === 0 && (
              <div className="py-16 text-center rounded-3xl border border-dashed border-border flex flex-col gap-2">
                <p className="text-sm font-semibold">Aucun post pour l'instant</p>
                <p className="text-xs text-muted-foreground">
                  {selectedUserId ? "Cet utilisateur n'a pas encore posté" : 'Suis des amis ou crée ton premier post'}
                </p>
                {!selectedUserId && (
                  <button onClick={() => setShowCreatePost(true)} className="mt-3 mx-auto rounded-full bg-primary px-5 py-2 text-xs font-bold text-white">
                    Créer un post
                  </button>
                )}
              </div>
            )}
            {filteredFeed.map(post => (
              <div
                key={post.id}
                id={`post-${post.id}`}
                className={highlightPostId === post.id ? 'ring-2 ring-primary/50 rounded-3xl transition-all' : ''}
              >
                <PostCard
                  post={post}
                  isLiked={myLikes.has(post.id)}
                  onToggleLike={() => toggleLike.mutate({ reviewId: post.id, isLiked: myLikes.has(post.id) })}
                  currentUserId={user?.id ?? ''}
                  avatarUrl={resolveAvatar(post.user_id)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* ── Desktop sidebar ── */}
        <aside className="hidden md:block w-72 flex-shrink-0">
          <div className="sticky top-20 rounded-2xl border border-border/60 bg-background p-4 flex flex-col gap-4">
            <button
              onClick={() => setShowCreatePost(true)}
              className="w-full rounded-full bg-primary py-2.5 text-sm font-bold text-white hover:bg-primary/90 transition-colors"
            >
              + Créer un post
            </button>

            <div>
              <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Abonnements
              </p>
              {following.length === 0 ? (
                <p className="text-[13px] text-muted-foreground">Aucun abonnement pour l'instant.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {following.map(f => (
                    <button
                      key={f.id}
                      onClick={() => toggleUserFilter(f.id)}
                      className={[
                        'flex items-center gap-2.5 rounded-xl px-2 py-1.5 text-left w-full transition-colors',
                        selectedUserId === f.id ? 'bg-primary/10' : 'hover:bg-muted',
                      ].join(' ')}
                    >
                      <div
                        className="size-8 rounded-full overflow-hidden flex-shrink-0"
                        style={{ backgroundColor: f.avatar_color ?? '#dde0ef' }}
                      >
                        <img src={resolveAvatar(f.id)} alt={f.display_name} className="size-full object-cover" />
                      </div>
                      <span className="text-[13px] font-medium truncate">{f.display_name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setShowFindFriends(true)}
              className="flex items-center justify-center gap-1.5 rounded-full border border-border/60 py-2 text-sm font-semibold text-foreground/70 hover:text-foreground hover:border-border transition-colors"
            >
              <UserPlus className="size-4" />
              Trouver des amis
            </button>
          </div>
        </aside>
      </div>

      {/* Modals */}
      {showCreatePost && <CreatePostModal onClose={() => setShowCreatePost(false)} />}
      {showFindFriends && user && (
        <FindFriendsModal onClose={() => setShowFindFriends(false)} currentUserId={user.id} />
      )}
    </div>
  )
}
