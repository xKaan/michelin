// src/components/social/FindFriendsModal.tsx
import { useMemo, useState } from 'react'
import { X } from 'lucide-react'
import { BottomSheet } from '@/components/shared/BottomSheet'
import { SearchInput } from '@/components/shared/SearchInput'
import { useUsers } from '@/hooks/useUsers'
import { useFollowing, useFollow, useUnfollow } from '@/hooks/useSocial'
import { avatar } from './utils'

interface FindFriendsModalProps {
  onClose: () => void
  currentUserId: string
}

export function FindFriendsModal({ onClose, currentUserId }: FindFriendsModalProps) {
  const { data: users = [] } = useUsers()
  const { data: following = [] } = useFollowing(currentUserId)
  const follow = useFollow()
  const unfollow = useUnfollow()
  const [query, setQuery] = useState('')

  const followingIds = useMemo(() => new Set(following.map(f => f.id)), [following])

  const filtered = useMemo(() =>
    users.filter(u =>
      u.id !== currentUserId &&
      u.display_name.toLowerCase().includes(query.toLowerCase())
    ),
    [users, currentUserId, query]
  )

  return (
    <BottomSheet onClose={onClose} maxHeight="80vh">
      <div className="px-5 pb-4 flex flex-col gap-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Trouver des amis</h2>
          <button onClick={onClose} className="rounded-full p-2 bg-muted">
            <X className="size-4" />
          </button>
        </div>
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Rechercher un utilisateur..."
          autoFocus
        />
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
                onClick={() => isFollowing ? unfollow.mutate(u.id) : follow.mutate(u.id)}
                disabled={isPending}
                className={[
                  'rounded-full px-4 py-1.5 text-xs font-bold transition-all active:scale-95 flex-shrink-0',
                  isFollowing ? 'bg-muted text-foreground' : 'bg-primary text-white',
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
    </BottomSheet>
  )
}
