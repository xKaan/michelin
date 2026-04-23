import { useRef, useState, useMemo } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useSavedIds, useToggleSave } from '@/hooks/useWishlist'
import {
  Bookmark, BookmarkCheck, ChevronLeft, ChevronRight,
  Globe, MapPin, MessageCircle, Phone, Award, Star, BadgeCheck,
  UtensilsCrossed, BedDouble, X, PenLine, Users, Gift, Lock, Check, Copy,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CriticReview, EstablishmentView, MichelinStatus, ReviewWithMedia, Unlockable } from '@/types/database'
import { Rosettes } from '@/components/shared/MichelinBadge'
import { useCriticReviews, useReviews } from '@/hooks/useReviews'
import { useEstablishmentUnlockables, useEstablishmentLoyalty, useClaimReward } from '@/hooks/useRewards'
import type { LoyaltyReward } from '@/hooks/useRewards'
import { useFollowing } from '@/hooks/useSocial'
import { useBatchAvatarUrls } from '@/hooks/useMascot'
import { CreatePostModal } from '@/components/social/CreatePostModal'

// ── Constants ─────────────────────────────────────────────────────────────────

const NAV_H = 88
const COMPACT_H = 272

// ── Opening hours ─────────────────────────────────────────────────────────────

const DAYS: Record<number, string> = {
  0: 'dimanche', 1: 'lundi', 2: 'mardi', 3: 'mercredi',
  4: 'jeudi', 5: 'vendredi', 6: 'samedi',
}

function parseMin(t: string): number {
  const m = t.match(/(\d+)h(\d+)?/)
  if (!m) return -1
  return +m[1] * 60 + (m[2] ? +m[2] : 0)
}

function fmt(min: number) {
  const h = Math.floor(min / 60), m = min % 60
  return m ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`
}

function openStatus(hours: Record<string, string> | null) {
  if (!hours) return { open: false, until: null }
  const today = hours[DAYS[new Date().getDay()]]
  if (!today || today.toLowerCase() === 'fermé') return { open: false, until: null }
  const now = new Date().getHours() * 60 + new Date().getMinutes()
  for (const slot of today.split('/')) {
    const [a, b] = slot.trim().split('-')
    const o = parseMin(a?.trim() ?? ''), c = parseMin(b?.trim() ?? '')
    if (o < 0 || c < 0) continue
    if (now >= o && now < c) return { open: true, until: fmt(c) }
  }
  return { open: false, until: null }
}

// ── Michelin rosettes ─────────────────────────────────────────────────────────

const STATUS_META: Record<MichelinStatus, { count: number; isBib: boolean }> = {
  three: { count: 3, isBib: false },
  two:   { count: 2, isBib: false },
  one:   { count: 1, isBib: false },
  bib:   { count: 0, isBib: true },
  none:  { count: 0, isBib: false },
}

// ── Unlockable card ───────────────────────────────────────────────────────────

function UnlockableCard({ item }: { item: Unlockable }) {
  const isMascot = item.unlockable_type === 'mascot'
  return (
    <div className="flex items-center gap-3 bg-card rounded-2xl px-4 py-3.5 border border-border/50">
      <div className="size-12 rounded-xl overflow-hidden bg-muted flex-shrink-0 flex items-center justify-center">
        {item.preview_url ? (
          <img src={item.preview_url} alt={item.unlockable_name} className="size-full object-cover" />
        ) : isMascot ? (
          <img
            src={`/Buddy/${item.unlockable_name}.png`}
            alt={item.unlockable_name}
            className="size-full object-contain scale-110"
            style={{ filter: 'brightness(0)' }}
          />
        ) : (
          <span className="text-xl">👘</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold">{item.unlockable_name}</p>
        <p className="text-[12px] text-muted-foreground mt-0.5">
          {isMascot ? 'Buddy à débloquer' : 'Tenue à débloquer'}
        </p>
      </div>
      <span className="text-[11px] font-semibold text-primary border border-primary/30 bg-primary/8 rounded-full px-2.5 py-[3px] flex-shrink-0">
        {isMascot ? 'Buddy' : 'Tenue'}
      </span>
    </div>
  )
}

// ── Critique card ─────────────────────────────────────────────────────────────

function initials(name: string) {
  return name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()
}

function CriticReviewCard({ review }: { review: CriticReview }) {
  const date = review.published_at
    ? new Date(review.published_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
    : ''
  return (
    <div className="bg-background rounded-2xl p-4 border border-border/50 shadow-sm">
      <div className="flex items-center gap-3 mb-2.5">
        <div className="size-[34px] rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 text-[11px] font-bold text-primary">
          {initials(review.critic_name)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[13px] font-semibold truncate">{review.critic_name}</span>
            <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-primary bg-primary/10 rounded-full px-1.5 py-0.5 flex-shrink-0">
              <BadgeCheck className="size-[10px]" />
              Critique vérifié
            </span>
          </div>
          <span className="text-[11px] text-muted-foreground">{date}</span>
        </div>
        <div className="flex gap-0.5 flex-shrink-0">
          {Array.from({ length: review.rating }).map((_, i) => (
            <Star key={i} className="size-[9px] fill-amber-400 text-amber-400" />
          ))}
        </div>
      </div>
      <p className="text-[13px] text-foreground/75 leading-relaxed">{review.content}</p>
    </div>
  )
}

// ── Friend review card ────────────────────────────────────────────────────────

function FriendReviewCard({ review, isSelf, avatarUrl }: { review: ReviewWithMedia; isSelf?: boolean; avatarUrl?: string }) {
  const date = review.published_at
    ? new Date(review.published_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
    : ''
  return (
    <div className="bg-background rounded-2xl p-4 border border-border/50 shadow-sm">
      <div className="flex items-center gap-3 mb-2.5">
        <div className="size-[34px] rounded-full bg-muted flex-shrink-0 overflow-hidden">
          {avatarUrl
            ? <img src={avatarUrl} alt={review.user.display_name} className="size-full object-cover" />
            : <span className="size-full flex items-center justify-center text-[11px] font-bold text-foreground/60">{initials(review.user.display_name)}</span>
          }
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[13px] font-semibold truncate">{review.user.display_name}</span>
            <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-foreground/50 bg-muted rounded-full px-1.5 py-0.5 flex-shrink-0">
              <Users className="size-[10px]" />
              {isSelf ? 'Moi' : 'Ami'}
            </span>
          </div>
          <span className="text-[11px] text-muted-foreground">{date}</span>
        </div>
        <div className="flex gap-0.5 flex-shrink-0">
          {Array.from({ length: review.rating }).map((_, i) => (
            <Star key={i} className="size-[9px] fill-amber-400 text-amber-400" />
          ))}
        </div>
      </div>
      {review.title && (
        <p className="text-[13px] font-semibold mb-1">{review.title}</p>
      )}
      <p className="text-[13px] text-foreground/75 leading-relaxed">{review.content}</p>
    </div>
  )
}

// ── Loyalty ───────────────────────────────────────────────────────────────────

const REWARD_EMOJI: Record<string, string> = {
  drink: '🍹', food: '🍮', discount: '🏷️', other: '🎁',
}

function loyaltyCode(userRewardId: string) {
  return userRewardId.replace(/-/g, '').slice(0, 8).toUpperCase()
}

function LoyaltySection({ userId, establishmentId }: {
  userId: string
  establishmentId: string
}) {
  const { data, isLoading } = useEstablishmentLoyalty(userId, establishmentId)
  const claimReward = useClaimReward()
  const [revealed, setRevealed] = useState<string | null>(null)
  const [copied, setCopied]     = useState(false)

  if (isLoading || !data || data.rewards.length === 0) return null

  const { rewards, visitCount } = data
  const next = rewards.find(r => visitCount < r.min_checkins)
  const toNext = next ? next.min_checkins - visitCount : 0

  function copy(code: string) {
    navigator.clipboard.writeText(code).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleClaim(r: LoyaltyReward) {
    if (r.userRewardId && r.status === 'available') {
      claimReward.mutate(r.userRewardId)
    }
    setRevealed(prev => prev === r.id ? null : r.id)
    setCopied(false)
  }

  return (
    <div className="mx-5 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <Gift className="size-4 text-primary" />
          <h3 className="text-[15px] font-bold">Fidélité</h3>
        </div>
        <div className="flex items-center gap-1.5 bg-primary/10 rounded-full px-2.5 py-1">
          <span className="text-[13px] font-bold text-primary">{visitCount}</span>
          <span className="text-[11px] text-primary/70">visite{visitCount > 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Progress dots */}
      <div className="flex items-center gap-1.5 mb-4 flex-wrap">
        {rewards.map((r, i) => {
          const unlocked = visitCount >= r.min_checkins
          return (
            <div key={r.id} className="flex items-center gap-1.5">
              {i > 0 && <div className={cn('h-px w-4', unlocked ? 'bg-primary/40' : 'bg-border')} />}
              <div className={cn(
                'size-7 rounded-full flex items-center justify-center text-[11px] font-bold border-2 transition-colors',
                unlocked ? 'bg-primary border-primary text-white' : 'bg-muted border-border text-muted-foreground',
              )}>
                {unlocked ? '✓' : r.min_checkins}
              </div>
            </div>
          )
        })}
        {next && (
          <span className="text-[11px] text-muted-foreground ml-1">
            encore {toNext} visite{toNext > 1 ? 's' : ''} pour la prochaine
          </span>
        )}
      </div>

      {/* Reward rows */}
      <div className="space-y-2.5">
        {rewards.map(r => {
          const unlocked   = r.status !== null                // row exists in user_rewards
          const available  = r.status === 'available'
          const claimed    = r.status === 'claimed'
          const locked     = !unlocked && visitCount < r.min_checkins
          const isRevealed = revealed === r.id
          const code       = r.userRewardId ? loyaltyCode(r.userRewardId) : ''

          return (
            <div key={r.id} className={cn(
              'rounded-2xl border transition-colors overflow-hidden',
              claimed ? 'bg-muted/30 border-border/20' : unlocked ? 'bg-card border-border/50' : 'bg-muted/40 border-border/30',
            )}>
              <div className="flex items-center gap-3 px-4 py-3">
                <span className={cn('text-xl flex-shrink-0', (locked || claimed) && 'opacity-40')}>
                  {REWARD_EMOJI[r.reward_type] ?? '🎁'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className={cn('text-[13px] font-semibold', (locked || claimed) && 'text-muted-foreground')}>
                    {r.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{r.description}</p>
                </div>

                {claimed ? (
                  <span className="flex-shrink-0 inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground bg-muted rounded-full px-2.5 py-1">
                    <Check className="size-3" />
                    Utilisé
                  </span>
                ) : available ? (
                  <button
                    onPointerDown={e => e.stopPropagation()}
                    onClick={e => { e.stopPropagation(); handleClaim(r) }}
                    className="flex-shrink-0 rounded-full bg-primary px-3 py-1.5 text-[11px] font-bold text-white transition-transform active:scale-95"
                  >
                    {isRevealed ? 'Masquer' : 'Réclamer'}
                  </button>
                ) : (
                  <div className="flex-shrink-0 flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Lock className="size-3" />
                    <span>{r.min_checkins}ème visite</span>
                  </div>
                )}
              </div>

              {/* Revealed code */}
              {isRevealed && available && code && (
                <div className="mx-4 mb-3 rounded-xl bg-primary/8 border border-primary/20 px-4 py-3">
                  <p className="text-[11px] text-primary/70 font-medium mb-1.5">
                    Montrez ce code à votre serveur
                  </p>
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-[15px] font-bold text-primary tracking-widest">
                      {code}
                    </span>
                    <button
                      onPointerDown={e => e.stopPropagation()}
                      onClick={e => { e.stopPropagation(); copy(code) }}
                      className="flex items-center gap-1 text-[11px] text-primary font-semibold active:opacity-60"
                    >
                      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                      {copied ? 'Copié !' : 'Copier'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

type Snap = 0 | 1 | 2

interface Props {
  establishment: EstablishmentView | null
  onClose: () => void
}

export function EstablishmentCard(props: Props) {
  return <EstablishmentCardContent key={props.establishment?.id ?? 'empty'} {...props} />
}

function EstablishmentCardContent({ establishment: e, onClose }: Props) {
  const [snap, setSnap]               = useState<Snap>(0)
  const [imgIdx, setImgIdx]           = useState(0)
  const [dragDy, setDragDy]           = useState(0)
  const [dragging, setDragging]       = useState(false)
  const [showPostModal, setShowPostModal] = useState(false)

  const { user } = useAuth()
  const savedIds   = useSavedIds(user?.id ?? null)
  const toggleSave = useToggleSave()
  const saved = e ? savedIds.has(e.id) : false
  const dragY0 = useRef<number | null>(null)

  const criticType = e?.establishment_type === 'hotel' ? 'hotel' : 'restaurant'
  const { data: criticReviews = [] } = useCriticReviews(e?.id ?? null, criticType)
  const topCritic = criticReviews[0] ?? null
  const { data: unlockables = [] } = useEstablishmentUnlockables(e?.id ?? null)
  const { data: allReviews = [] } = useReviews(e?.id ?? null)
  const { data: following = [] } = useFollowing(user?.id ?? null)
  const followingIds = useMemo(() => new Set(following.map(f => f.id)), [following])
  const friendReviews = useMemo(
    () => allReviews.filter(r => (followingIds.has(r.user_id) || r.user_id === user?.id) && r.content),
    [allReviews, followingIds, user?.id],
  )
  const friendUserIds = useMemo(() => friendReviews.map(r => r.user_id), [friendReviews])
  const { data: friendAvatars = new Map<string, string>() } = useBatchAvatarUrls(friendUserIds)

  function snapY(s: Snap): number {
    const vh = window.innerHeight
    if (s === 0) return vh - COMPACT_H - NAV_H
    if (s === 1) return Math.round(vh * 0.3)
    return 0
  }

  const ty = (e ? snapY(snap) : window.innerHeight) + (dragging ? dragDy : 0)

  function startDrag(y: number) { dragY0.current = y; setDragging(true) }
  function moveDrag(y: number)  { if (dragY0.current !== null) setDragDy(y - dragY0.current) }
  function endDrag() {
    const dy = dragDy
    setDragging(false); setDragDy(0); dragY0.current = null
    if (Math.abs(dy) < 8) return // tap: let onClick handle it
    if (dy < -55)     setSnap(s => Math.min(2, s + 1) as Snap)
    else if (dy > 80) {
      if (snap === 0) onClose()
      else setSnap(s => Math.max(0, s - 1) as Snap)
    }
  }

  function advanceSnap() { setSnap(s => s === 0 ? 2 : Math.min(2, s + 1) as Snap) }

  const meta        = e ? STATUS_META[e.michelin_status] : null
  const Icon        = e?.establishment_type === 'hotel' ? BedDouble : UtensilsCrossed
  const { open, until } = openStatus(e?.opening_hours ?? null)

  return (
    <div
      className="fixed inset-x-0 bottom-0"
      style={{ height: '100dvh', zIndex: snap === 2 ? 70 : 60, pointerEvents: e ? 'auto' : 'none' }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 transition-opacity duration-400"
        style={{ opacity: snap >= 1 ? 1 : 0, pointerEvents: e ? 'auto' : 'none' }}
        onClick={() => snap === 0 ? onClose() : setSnap(s => Math.max(0, s - 1) as Snap)}
      />

      {/* Sheet */}
      <div
        className="absolute inset-x-0 bottom-0 bg-background flex flex-col"
        style={{
          height: '100dvh',
          transform: `translateY(${ty}px)`,
          transition: dragging ? 'none' : 'transform 0.42s cubic-bezier(0.32, 0.72, 0, 1)',
          borderRadius: snap === 2 ? '0 0 0 0' : '26px 26px 0 0',
          boxShadow: '0 -6px 50px rgba(0,0,0,0.13)',
        }}
      >
        {/* ── DRAG ZONE ── */}
        <div
          className="flex-shrink-0 touch-none select-none cursor-grab active:cursor-grabbing"
          onTouchStart={ev => startDrag(ev.touches[0].clientY)}
          onTouchMove={ev  => moveDrag(ev.touches[0].clientY)}
          onTouchEnd={endDrag}
          onMouseDown={ev  => startDrag(ev.clientY)}
          onMouseMove={ev  => dragging && moveDrag(ev.clientY)}
          onMouseUp={endDrag}
          onMouseLeave={endDrag}
        >
          {/* Handle pill — tap to expand, drag to snap */}
          <button
            onClick={advanceSnap}
            className="flex flex-col items-center w-full pt-3.5 pb-1 gap-1"
            aria-label="Développer"
          >
            <div className="w-9 h-[5px] rounded-full bg-foreground/18" />
          </button>

          {/* Sticky header */}
          <div className="px-5 pt-2 pb-4">
            {/* Title row */}
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <h2 className="text-[22px] font-bold tracking-tight leading-tight">{e?.name ?? ''}</h2>
                <div className="flex items-center gap-2 flex-wrap mt-1.5">
                  {meta && meta.count > 0 && <Rosettes count={meta.count} size={14} />}
                  {meta?.isBib && (
                    <span className="text-[12px] font-bold text-amber-500">Bib Gourmand</span>
                  )}
                  {e?.cuisines?.length ? (
                    <span className="text-[13px] text-muted-foreground">
                      {e.cuisines.slice(0, 2).join(' · ')}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0 pt-0.5">
                <button
                  onPointerDown={ev => ev.stopPropagation()}
                  onClick={() => e && toggleSave.mutate({ establishmentId: e.id, isSaved: saved })}
                  className="size-9 rounded-full bg-muted flex items-center justify-center transition-transform active:scale-90"
                  aria-label="Sauvegarder"
                >
                  {saved
                    ? <BookmarkCheck className="size-[15px] fill-primary text-primary" />
                    : <Bookmark className="size-[15px] text-foreground/55" />
                  }
                </button>
                <button
                  onPointerDown={ev => ev.stopPropagation()}
                  onClick={onClose}
                  className="size-9 rounded-full bg-muted flex items-center justify-center transition-transform active:scale-90"
                  aria-label="Fermer"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            {/* Status + CTA row */}
            <div className="flex items-center justify-between mt-3.5 gap-3">
              {e?.opening_hours ? (
                <div className="flex items-center gap-1.5">
                  <span className={cn('size-[7px] rounded-full flex-shrink-0', open ? 'bg-emerald-500' : 'bg-rose-400')} />
                  <span className="text-[13px]">
                    {open
                      ? <><span className="font-semibold text-emerald-600">Ouvert</span><span className="text-muted-foreground"> · Ferme à {until}</span></>
                      : <span className="text-muted-foreground font-medium">Fermé</span>
                    }
                  </span>
                </div>
              ) : <div />}

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onPointerDown={ev => ev.stopPropagation()}
                  onClick={() => setShowPostModal(true)}
                  className="size-9 rounded-full bg-muted flex items-center justify-center transition-transform active:scale-90"
                  aria-label="Écrire un post"
                >
                  <PenLine className="size-[15px] text-foreground/70" />
                </button>
                <button
                  onPointerDown={ev => ev.stopPropagation()}
                  className="bg-foreground text-background rounded-full px-5 py-[9px] text-[13px] font-bold tracking-wide transition-transform active:scale-95"
                >
                  Réserver
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── SCROLLABLE BODY ── */}
        <div
          className="flex-1 min-h-0"
          style={{ overflowY: snap >= 1 ? 'auto' : 'hidden' }}
          onClick={() => snap === 0 && setSnap(1)}
        >
          {/* STATE 0: Cover image */}
          <div
            className={cn(
              'px-5 pb-5 transition-all duration-300',
              snap === 0 ? 'opacity-100' : 'opacity-0 max-h-0 overflow-hidden py-0 px-0'
            )}
          >
            <div className="rounded-[18px] overflow-hidden bg-muted" style={{ height: 154 }}>
              {e?.image_url ? (
                <img src={e.image_url} alt={e?.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary/8">
                  <Icon className="size-14 text-primary/20" strokeWidth={1} />
                </div>
              )}
            </div>
          </div>

          {/* STATE 1+: Expanded content */}
          {snap >= 1 && (
            <>
              {/* Social recommendation — critique vérifié */}
              {topCritic && (
                <div className="mx-5 mb-5 flex items-center gap-3 bg-muted/50 rounded-[18px] px-4 py-3.5">
                  <div className="size-[30px] rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-[11px] font-black text-primary">{initials(topCritic.critic_name)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] leading-snug">
                      <span className="font-semibold">{topCritic.critic_name}</span>
                      <span className="text-muted-foreground"> recommande cet endroit</span>
                    </p>
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-primary mt-0.5">
                      <BadgeCheck className="size-[10px]" />
                      Critique vérifié{topCritic.critic_type === 'hotel' ? ' · Hôtellerie' : ' · Gastronomie'}
                    </span>
                  </div>
                </div>
              )}

              {/* Image carousel */}
              <div className="mx-5 mb-5">
                <div
                  className="relative rounded-[20px] overflow-hidden bg-muted"
                  style={{ aspectRatio: '16/9' }}
                >
                  {e?.image_url ? (
                    <img src={e.image_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/8">
                      <Icon className="size-16 text-primary/15" strokeWidth={1} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  <button
                    onClick={ev => { ev.stopPropagation(); setImgIdx(i => Math.max(0, i - 1)) }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 size-8 rounded-full bg-black/25 backdrop-blur-sm flex items-center justify-center"
                  >
                    <ChevronLeft className="size-4 text-white" />
                  </button>
                  <button
                    onClick={ev => { ev.stopPropagation(); setImgIdx(i => Math.min(2, i + 1)) }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 size-8 rounded-full bg-black/25 backdrop-blur-sm flex items-center justify-center"
                  >
                    <ChevronRight className="size-4 text-white" />
                  </button>
                </div>
                {/* Carousel indicators */}
                <div className="flex justify-center gap-1.5 mt-2.5">
                  {[0, 1, 2].map(i => (
                    <button
                      key={i}
                      onClick={ev => { ev.stopPropagation(); setImgIdx(i) }}
                      className={cn(
                        'rounded-full transition-all duration-200',
                        i === imgIdx ? 'w-[18px] h-[5px] bg-foreground' : 'size-[5px] bg-foreground/20'
                      )}
                    />
                  ))}
                </div>
              </div>

              {/* Contact / info rows */}
              <div className="mx-5 rounded-[18px] border border-border/50 overflow-hidden mb-5 bg-card">
                {(e?.address || e?.city) && (
                  <div className="flex items-center gap-4 px-4 py-3.5 border-b border-border/40">
                    <div className="size-8 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                      <MapPin className="size-3.5 text-muted-foreground" />
                    </div>
                    <span className="text-[13px] text-foreground">
                      {[e?.address, e?.city].filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-4 px-4 py-3.5 border-b border-border/40">
                  <div className="size-8 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                    <Globe className="size-3.5 text-muted-foreground" />
                  </div>
                  <span className="text-[13px] text-primary font-medium">guide.michelin.com</span>
                </div>
                {e?.phone && (
                  <a
                    href={`tel:${e.phone}`}
                    onClick={ev => ev.stopPropagation()}
                    className="flex items-center gap-4 px-4 py-3.5"
                  >
                    <div className="size-8 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                      <Phone className="size-3.5 text-muted-foreground" />
                    </div>
                    <span className="text-[13px] text-primary font-medium">{e.phone}</span>
                  </a>
                )}
              </div>

            </>
          )}

          {/* STATE 1+: Rewards + Reviews */}
          {snap >= 1 && (
            <>
              {/* Unlockables */}
              {unlockables.length > 0 && (
                <div className="mx-5 mb-6">
                  <div className="flex items-center gap-2 mb-3.5">
                    <Award className="size-4 text-primary" />
                    <h3 className="text-[15px] font-bold">Déblocables ici</h3>
                  </div>
                  <div className="space-y-2.5">
                    {unlockables.map(item => (
                      <UnlockableCard key={`${item.unlockable_type}-${item.unlockable_id}`} item={item} />
                    ))}
                  </div>
                </div>
              )}

              {/* Loyalty section */}
              {user && e && (
                <LoyaltySection userId={user.id} establishmentId={e.id} />
              )}

              {/* Reviews section */}
              {(criticReviews.length > 0 || friendReviews.length > 0) && (
                <div className="mx-5 pb-32">
                  <div className="flex items-center gap-2 mb-1">
                    <MessageCircle className="size-4 text-primary" />
                    <h3 className="text-[15px] font-bold">Ce qu'ils en pensent</h3>
                  </div>
                  <p className="text-[12px] text-muted-foreground pl-6 mb-4">
                    {criticReviews.length > 0 && `${criticReviews.length} critique${criticReviews.length > 1 ? 's' : ''}`}
                    {criticReviews.length > 0 && friendReviews.length > 0 && ' · '}
                    {friendReviews.length > 0 && `${friendReviews.length} ami${friendReviews.length > 1 ? 's' : ''}`}
                  </p>

                  {/* Critic reviews */}
                  {criticReviews.length > 0 && (
                    <div className="space-y-3">
                      {criticReviews.map(r => (
                        <CriticReviewCard key={r.id} review={r} />
                      ))}
                    </div>
                  )}

                  {/* Friend reviews */}
                  {friendReviews.length > 0 && (
                    <>
                      {criticReviews.length > 0 && (
                        <div className="flex items-center gap-2 mt-5 mb-3">
                          <div className="flex-1 h-px bg-border/50" />
                          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                            <Users className="size-3" />
                            Tes amis
                          </span>
                          <div className="flex-1 h-px bg-border/50" />
                        </div>
                      )}
                      <div className="space-y-3">
                        {friendReviews.map(r => (
                          <FriendReviewCard
                            key={r.id}
                            review={r}
                            isSelf={r.user_id === user?.id}
                            avatarUrl={friendAvatars.get(r.user_id)}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showPostModal && e && (
        <CreatePostModal
          establishmentId={e.id}
          onClose={() => setShowPostModal(false)}
        />
      )}
    </div>
  )
}
