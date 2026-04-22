import { Camera, Heart, MessageCircle, MoreHorizontal, Plus, UserPlus, X, Search, Star } from 'lucide-react'
import React, { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '@/hooks/useAuth'
import { useSheetDrag } from '@/hooks/useSheetDrag'
import { useUsers } from '@/hooks/useUsers'
import { useAllEstablishments } from '@/hooks/useRestaurants'
import { useBatchAvatarUrls } from '@/hooks/useMascot'
import {
  useSocialFeed,
  useMyLikes,
  useToggleLike,
  useFollowing,
  useFollow,
  useUnfollow,
  useCreatePost,
  useDeletePost,
  useComments,
  useAddComment,
  type SocialPost,
} from '@/hooks/useSocial'

function avatar(seed: string) {
  return `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(seed)}&size=56`
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "à l'instant"
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  return `${Math.floor(hrs / 24)}j`
}

// ── Create Post Modal ────────────────────────────────────────────────────────

function CreatePostModal({ onClose }: { onClose: () => void }) {
  const { data: establishments = [] } = useAllEstablishments()
  const createPost = useCreatePost()
  const { handleProps, sheetStyle } = useSheetDrag(onClose)

  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [rating, setRating] = useState(3)
  const [content, setContent] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setPreview(URL.createObjectURL(file))
  }

  function removeImage() {
    setImageFile(null)
    if (preview) URL.revokeObjectURL(preview)
    setPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const filtered = useMemo(() =>
    establishments.filter(e =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      (e.city ?? '').toLowerCase().includes(search.toLowerCase())
    ).slice(0, 8),
    [establishments, search]
  )

  const selected = useMemo(() =>
    establishments.find(e => e.id === selectedId),
    [establishments, selectedId]
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedId || !content.trim()) return
    await createPost.mutateAsync({
      establishment_id: selectedId,
      content: content.trim(),
      rating,
      imageFile: imageFile ?? undefined,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end" onClick={onClose}>
      <div
        className="w-full max-h-[92vh] overflow-y-auto rounded-t-3xl bg-background border-t border-border flex flex-col"
        style={sheetStyle}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div {...handleProps}>
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>
        <div className="px-5 pb-5 flex flex-col gap-5">

        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Nouveau post</h2>
          <button onClick={onClose} className="rounded-full p-2 bg-muted">
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Establishment */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">
              Restaurant
            </label>
            {selected ? (
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                className="flex items-center justify-between rounded-2xl bg-primary/10 px-4 py-3 text-sm font-semibold text-primary"
              >
                <span>{selected.name}{selected.city ? ` · ${selected.city}` : ''}</span>
                <X className="size-4 flex-shrink-0" />
              </button>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 rounded-2xl bg-muted px-4 py-2.5">
                  <Search className="size-4 text-muted-foreground flex-shrink-0" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Chercher un restaurant..."
                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    autoFocus
                  />
                </div>
                {search && (
                  <div className="rounded-2xl border border-border bg-card overflow-hidden max-h-44 overflow-y-auto">
                    {filtered.map((e, i) => (
                      <button
                        key={e.id}
                        type="button"
                        onClick={() => { setSelectedId(e.id); setSearch('') }}
                        className={[
                          'w-full text-left px-4 py-3 text-sm hover:bg-muted transition-colors',
                          i < filtered.length - 1 ? 'border-b border-border/50' : '',
                        ].join(' ')}
                      >
                        <span className="font-medium">{e.name}</span>
                        {e.city && <span className="text-muted-foreground ml-2 text-xs">{e.city}</span>}
                      </button>
                    ))}
                    {filtered.length === 0 && (
                      <p className="px-4 py-3 text-sm text-muted-foreground">Aucun résultat</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Rating */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">
              Note
            </label>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  className="transition-transform active:scale-90"
                >
                  <Star
                    className={[
                      'size-8 transition-colors',
                      n <= rating ? 'fill-primary text-primary' : 'text-muted-foreground/30',
                    ].join(' ')}
                    strokeWidth={1.5}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Caption */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">
              Description
            </label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Décris ton expérience..."
              rows={4}
              className="rounded-2xl bg-muted px-4 py-3 text-sm outline-none resize-none placeholder:text-muted-foreground leading-relaxed"
            />
          </div>

          {/* Photo upload */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">
              Photo <span className="normal-case tracking-normal font-normal">(optionnelle)</span>
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleFileChange}
            />
            {preview ? (
              <div className="relative rounded-2xl overflow-hidden aspect-square">
                <img src={preview} alt="preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 rounded-full bg-black/60 p-1.5 backdrop-blur-sm"
                >
                  <X className="size-4 text-white" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-border bg-muted/50 py-8 transition-colors active:bg-muted"
              >
                <Camera className="size-7 text-muted-foreground" strokeWidth={1.5} />
                <span className="text-sm text-muted-foreground">Ajouter une photo</span>
              </button>
            )}
          </div>

          {createPost.error && (
            <p className="text-xs text-destructive rounded-xl bg-destructive/10 px-3 py-2">
              {(createPost.error as Error).message}
            </p>
          )}

          <button
            type="submit"
            disabled={!selectedId || !content.trim() || createPost.isPending}
            className="rounded-2xl bg-primary py-4 text-sm font-bold text-white disabled:opacity-40 transition-opacity active:scale-[0.98]"
          >
            {createPost.isPending ? 'Publication...' : 'Publier'}
          </button>
        </form>
        </div>
      </div>
    </div>
  )
}

// ── Find Friends Modal ───────────────────────────────────────────────────────

function FindFriendsModal({ onClose, currentUserId }: {
  onClose: () => void
  currentUserId: string
}) {
  const { data: users = [] } = useUsers()
  const { data: following = [] } = useFollowing(currentUserId)
  const follow = useFollow()
  const unfollow = useUnfollow()
  const [query, setQuery] = useState('')
  const { handleProps, sheetStyle } = useSheetDrag(onClose)

  const followingIds = useMemo(() => new Set(following.map(f => f.id)), [following])

  const filtered = useMemo(() =>
    users.filter(u =>
      u.id !== currentUserId &&
      u.display_name.toLowerCase().includes(query.toLowerCase())
    ),
    [users, currentUserId, query]
  )

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end" onClick={onClose}>
      <div
        className="w-full max-h-[80vh] flex flex-col rounded-t-3xl bg-background border-t border-border"
        style={sheetStyle}
        onClick={e => e.stopPropagation()}
      >
        <div {...handleProps}>
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>
        <div className="px-5 pb-4 flex flex-col gap-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Trouver des amis</h2>
            <button onClick={onClose} className="rounded-full p-2 bg-muted">
              <X className="size-4" />
            </button>
          </div>
          <div className="flex items-center gap-2 rounded-2xl bg-muted px-4 py-2.5">
            <Search className="size-4 text-muted-foreground flex-shrink-0" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Rechercher un utilisateur..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              autoFocus
            />
          </div>
        </div>

        <div className="overflow-y-auto flex-1 px-5 pb-8 flex flex-col gap-2">
          {filtered.map(u => {
            const isFollowing = followingIds.has(u.id)
            const isPending = follow.isPending || unfollow.isPending
            return (
              <div key={u.id} className="flex items-center gap-3 rounded-2xl bg-card px-4 py-3">
                <img
                  src={avatar(u.id)}
                  alt={u.display_name}
                  className="size-11 rounded-full bg-muted flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{u.display_name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{u.tier}</p>
                </div>
                <button
                  onClick={() =>
                    isFollowing ? unfollow.mutate(u.id) : follow.mutate(u.id)
                  }
                  disabled={isPending}
                  className={[
                    'rounded-full px-4 py-1.5 text-xs font-bold transition-all active:scale-95 flex-shrink-0',
                    isFollowing
                      ? 'bg-muted text-foreground'
                      : 'bg-primary text-white',
                  ].join(' ')}
                >
                  {isFollowing ? 'Suivi ✓' : 'Suivre'}
                </button>
              </div>
            )
          })}
          {filtered.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Aucun utilisateur trouvé
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Comments Sheet ───────────────────────────────────────────────────────────

function CommentsSheet({ reviewId, currentUserId, onClose }: {
  reviewId: string
  currentUserId: string
  onClose: () => void
}) {
  const { data: comments = [], isLoading } = useComments(reviewId, true)
  const addComment = useAddComment()
  const [text, setText] = useState('')
  const { handleProps, sheetStyle } = useSheetDrag(onClose)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return
    setText('')
    await addComment.mutateAsync({ reviewId, content: trimmed })
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end" onClick={onClose}>
      <div
        className="w-full max-h-[75vh] flex flex-col rounded-t-3xl bg-background border-t border-border"
        style={sheetStyle}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle + title */}
        <div {...handleProps}>
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>
        <div className="flex-shrink-0 px-5 pb-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold">Commentaires</h2>
            <button onClick={onClose} className="rounded-full p-2 bg-muted">
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Comments list */}
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

        {/* Input */}
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
      </div>
    </div>
  )
}

// ── Post Card ────────────────────────────────────────────────────────────────

function PostCard({
  post,
  isLiked,
  onToggleLike,
  currentUserId,
  avatarUrl,
}: {
  post: SocialPost
  isLiked: boolean
  onToggleLike: () => void
  currentUserId: string
  avatarUrl: string
}) {
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
            className="size-10 rounded-full overflow-hidden flex-shrink-0 active:opacity-70 transition-opacity"
            style={{ backgroundColor: post.user.avatar_color ?? '#dde0ef' }}
          >
            <img
              src={avatarUrl}
              alt={post.user.display_name}
              className="size-full object-cover"
            />
          </button>
          <div className="flex-1 min-w-0">
            <button onClick={goToProfile} className="text-sm font-semibold leading-tight active:opacity-70 transition-opacity">{post.user.display_name}</button>
            <p className="text-xs text-muted-foreground truncate">
              {post.establishment.name}
              {post.establishment.city ? ` · ${post.establishment.city}` : ''}
            </p>
          </div>
          {isOwner && (
            <button
              onClick={() => setShowDeleteSheet(true)}
              className="p-1.5 -mr-1 text-muted-foreground rounded-full flex-shrink-0"
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

        {/* Actions + Likes */}
        <div className="px-4 pt-3 pb-1 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onToggleLike}
              className="transition-transform active:scale-90"
              aria-label="J'aime"
            >
              <Heart
                className={[
                  'size-6 transition-colors',
                  isLiked ? 'fill-primary text-primary' : 'text-foreground',
                ].join(' ')}
                strokeWidth={isLiked ? 0 : 1.8}
              />
            </button>
            <button
              onClick={() => setShowComments(v => !v)}
              aria-label="Commenter"
            >
              <MessageCircle
                className={[
                  'size-6 transition-colors',
                  showComments ? 'text-primary' : 'text-foreground',
                ].join(' ')}
                strokeWidth={1.8}
              />
            </button>
          </div>
          <p className="text-sm font-semibold">
            {post.likes_count} j'aime{post.likes_count !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Caption */}
        {post.content && (
          <p className="px-4 mt-1 text-sm leading-snug">
            <span className="font-semibold mr-1.5">{post.user.display_name}</span>
            {post.content}
          </p>
        )}

        {/* Rating */}
        <div className="px-4 mt-1 flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={[
                'size-3',
                i < post.rating ? 'fill-primary text-primary' : 'text-muted-foreground/30',
              ].join(' ')}
              strokeWidth={0}
            />
          ))}
        </div>

        {/* Time */}
        <p className="px-4 mt-1.5 pb-4 text-[11px] uppercase tracking-wide text-muted-foreground/70">
          Il y a {timeAgo(post.created_at)}
        </p>
      </article>

      {/* Comments sheet */}
      {showComments && (
        <CommentsSheet
          reviewId={post.id}
          currentUserId={currentUserId}
          onClose={() => setShowComments(false)}
        />
      )}

      {/* Delete action sheet */}
      {showDeleteSheet && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-end"
          onClick={() => setShowDeleteSheet(false)}
        >
          <div
            className="w-full rounded-t-3xl bg-background border-t border-border p-5 flex flex-col gap-3"
            onClick={e => e.stopPropagation()}
          >
            <div className="mx-auto w-10 h-1 rounded-full bg-border -mt-1" />
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
        </div>
      )}
    </>
  )
}

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