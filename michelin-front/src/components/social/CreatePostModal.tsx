// src/components/social/CreatePostModal.tsx
import React, { useMemo, useRef, useState } from 'react'
import { Camera, Star, X } from 'lucide-react'
import { BottomSheet } from '@/components/shared/BottomSheet'
import { SearchInput } from '@/components/shared/SearchInput'
import { useAllEstablishments } from '@/hooks/useRestaurants'
import { useCreatePost } from '@/hooks/useSocial'

interface CreatePostModalProps {
  onClose: () => void
}

export function CreatePostModal({ onClose }: CreatePostModalProps) {
  const { data: establishments = [] } = useAllEstablishments()
  const createPost = useCreatePost()

  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [rating, setRating] = useState(3)
  const [title, setTitle] = useState('')
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
    if (!selectedId || !title.trim() || !content.trim()) return
    await createPost.mutateAsync({
      establishment_id: selectedId,
      title: title.trim(),
      content: content.trim(),
      rating,
      imageFile: imageFile ?? undefined,
    })
    onClose()
  }

  return (
    <BottomSheet onClose={onClose} maxHeight="92vh">
      <div className="overflow-y-auto px-5 pb-5 flex flex-col gap-5">
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
                <SearchInput
                  value={search}
                  onChange={setSearch}
                  placeholder="Chercher un restaurant..."
                  autoFocus
                />
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

          {/* Title */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">
              Titre
            </label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ex : Dîner parfait, enfin !"
              className="rounded-2xl bg-muted px-4 py-3 text-sm outline-none placeholder:text-muted-foreground"
            />
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

          {/* Photo */}
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
            disabled={!selectedId || !title.trim() || !content.trim() || createPost.isPending}
            className="rounded-2xl bg-primary py-4 text-sm font-bold text-white disabled:opacity-40 transition-opacity active:scale-[0.98]"
          >
            {createPost.isPending ? 'Publication...' : 'Publier'}
          </button>
        </form>
      </div>
    </BottomSheet>
  )
}
