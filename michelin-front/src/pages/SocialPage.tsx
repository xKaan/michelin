import { Heart, MessageCircle, Plus } from 'lucide-react'
import { useState } from 'react'

const FRIENDS = [
  { id: 'me',       name: 'Moi',       seed: 'myself',   hasStory: false, isMe: true },
  { id: 'lea',      name: 'Léa',       seed: 'lea42',    hasStory: true },
  { id: 'laurine',  name: 'Laurine F', seed: 'laurinef', hasStory: true },
  { id: 'rico',     name: '🇫🇷 Rico',  seed: 'ricomado', hasStory: true },
  { id: 'king',     name: '👑 King C', seed: 'kingc',    hasStory: true },
  { id: 'mathilde', name: 'Mathilde',  seed: 'mathilde', hasStory: false },
  { id: 'pierre',   name: 'Pierre',    seed: 'pierre77', hasStory: true },
]

const POSTS = [
  {
    id: 1,
    user:       { name: 'Léa', seed: 'lea42' },
    place:      'Babinsky',
    city:       'Paris',
    image:      'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=700&q=80',
    caption:    'Un saumon fondant comme jamais, les légumes du jardin et une cuisson parfaite. Une adresse à ne pas manquer cet automne.',
    likedBy:    ['Mathilde', '6 autres'],
    likes:      7,
    comments:   3,
    timeAgo:    '2h',
  },
  {
    id: 2,
    user:       { name: 'Philipine', seed: 'philipine' },
    place:      'Guzepe',
    city:       'Le Havre',
    image:      'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=700&q=80',
    caption:    'Les tagliatelles aux truffes noires de saison. Le chef surprend à chaque visite — impressionnant.',
    likedBy:    ['Rico', '12 autres'],
    likes:      13,
    comments:   5,
    timeAgo:    '5h',
  },
  {
    id: 3,
    user:       { name: 'Pierre', seed: 'pierre77' },
    place:      'Chez Maison',
    city:       'Lyon',
    image:      'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=700&q=80',
    caption:    'La côte de bœuf Wagyu — un moment suspendu. Service impeccable, cadre intimiste.',
    likedBy:    ['Laurine F', '4 autres'],
    likes:      5,
    comments:   2,
    timeAgo:    '1j',
  },
  {
    id: 4,
    user:       { name: 'Laurine F', seed: 'laurinef' },
    place:      'La Mer Dorée',
    city:       'Marseille',
    image:      'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=700&q=80',
    caption:    'Sushi omakase 18 pièces, chaque bouchée est une révélation. Le chef Yamamoto signe un chef-d\'œuvre.',
    likedBy:    ['Léa', '21 autres'],
    likes:      22,
    comments:   9,
    timeAgo:    '1j',
  },
  {
    id: 5,
    user:       { name: '🇫🇷 Rico', seed: 'ricomado' },
    place:      'Pâtisserie Céleste',
    city:       'Bordeaux',
    image:      'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=700&q=80',
    caption:    'Le soufflé au chocolat grand cru arrivé à la seconde parfaite. Certaines choses méritent le détour.',
    likedBy:    ['Pierre', '8 autres'],
    likes:      9,
    comments:   4,
    timeAgo:    '2j',
  },
]

function avatar(seed: string, size = 40) {
  return `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(seed)}&size=${size}`
}

export function SocialPage() {
  const [liked, setLiked] = useState<Record<number, boolean>>({})

  function toggleLike(id: number) {
    setLiked(prev => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="flex flex-col min-h-screen bg-background pb-28 pt-20">
      <div className="px-4 pb-3 pt-1">
        <h1 className="text-2xl font-bold tracking-tight">
          Mich' <span className="text-primary">Social</span>
        </h1>
      </div>

      {/* Stories row */}
      <div className="overflow-x-auto px-4 pb-4 no-scrollbar">
        <div className="flex gap-3">
          {FRIENDS.map(f => (
            <button key={f.id} className="flex flex-col items-center gap-1.5 flex-shrink-0">
              <div
                className={[
                  'rounded-full p-[2.5px]',
                  f.isMe
                    ? 'bg-muted'
                    : f.hasStory
                    ? 'bg-gradient-to-tr from-yellow-400 via-rose-500 to-purple-600'
                    : 'bg-border',
                ].join(' ')}
              >
                <div className="rounded-full bg-background p-[2px]">
                  {f.isMe ? (
                    <div className="size-14 rounded-full bg-muted flex items-center justify-center">
                      <Plus className="size-5 text-primary" strokeWidth={2.5} />
                    </div>
                  ) : (
                    <img
                      src={avatar(f.seed, 56)}
                      alt={f.name}
                      className="size-14 rounded-full object-cover bg-muted"
                    />
                  )}
                </div>
              </div>
              <span className="text-[11px] font-medium text-foreground/80 max-w-[62px] truncate">
                {f.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Feed */}
      <div className="flex flex-col gap-4 px-5 pt-3">
        {POSTS.map(post => {
          const isLiked = liked[post.id] ?? false
          const likeCount = post.likes + (isLiked ? 1 : 0)
          return (
            <article key={post.id} className="rounded-3xl bg-card overflow-hidden">
              {/* Post header */}
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 via-rose-500 to-purple-600">
                    <div className="rounded-full bg-card p-[2px]">
                      <img
                        src={avatar(post.user.seed, 40)}
                        alt={post.user.name}
                        className="size-9 rounded-full object-cover bg-muted"
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold leading-tight">{post.user.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {post.place} · {post.city}
                    </p>
                  </div>
                </div>
              </div>

              {/* Photo */}
              <img
                src={post.image}
                alt={post.place}
                className="w-full aspect-square object-cover rounded-2xl"
                loading="lazy"
              />

              {/* Actions */}
              <div className="px-4 pt-3 pb-1 flex items-center gap-4">
                <button
                  onClick={() => toggleLike(post.id)}
                  className="transition-transform active:scale-90"
                  aria-label="J'aime"
                >
                  <Heart
                    className={['size-6 transition-colors', isLiked ? 'fill-primary text-primary' : 'text-foreground'].join(' ')}
                    strokeWidth={isLiked ? 0 : 1.8}
                  />
                </button>
                <button aria-label="Commenter">
                  <MessageCircle className="size-6 text-foreground" strokeWidth={1.8} />
                </button>
              </div>

              {/* Likes */}
              <p className="px-4 text-sm font-semibold">
                {likeCount} j'aime{likeCount > 1 ? 's' : ''}
              </p>

              {/* Liked by */}
              <p className="px-4 mt-0.5 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{post.likedBy[0]}</span>
                {' & '}
                {post.likedBy[1]} aiment ce poste
              </p>

              {/* Caption */}
              <p className="px-4 mt-1 text-sm leading-snug">
                <span className="font-semibold mr-1.5">{post.user.name}</span>
                {post.caption}
              </p>

              {/* Time */}
              <p className="px-4 mt-1.5 pb-4 text-[11px] uppercase tracking-wide text-muted-foreground/70">
                Il y a {post.timeAgo}
              </p>
            </article>
          )
        })}
      </div>
    </div>
  )
}
