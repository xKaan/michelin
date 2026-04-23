import { Search, X, Moon, Sun } from 'lucide-react'
import { useState, useRef, useEffect, useMemo } from 'react'
import { useLocation } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/hooks/useTheme'
import { useAllEstablishments } from '@/hooks/useRestaurants'
import type { EstablishmentView } from '@/types/database'

interface HeaderProps {
  minimal?: boolean
  onSelectEstablishment?: (e: EstablishmentView) => void
}

export function Header({ minimal = false, onSelectEstablishment }: HeaderProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const { t } = useTranslation()
  const { theme, toggle } = useTheme()
  const { pathname } = useLocation()
  const isMapPage = pathname === '/map'
  const hideSearch = !isMapPage

  const { data: establishments = [] } = useAllEstablishments()

  const results = useMemo(() => {
    if (!query.trim() || query.length < 2) return []
    const q = query.toLowerCase()
    return establishments
      .filter(e =>
        e.name?.toLowerCase().includes(q) ||
        e.address?.toLowerCase().includes(q) ||
        e.city?.toLowerCase().includes(q)
      )
      .slice(0, 8)
  }, [query, establishments])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  function toggleSearch() {
    if (open) {
      setOpen(false)
      setQuery('')
      return
    }
    setOpen(true)
  }

  function selectEstablishment(e: EstablishmentView) {
    onSelectEstablishment?.(e)
    setOpen(false)
    setQuery('')
  }

  if (minimal) {
    return (
      <header className="fixed top-5 left-4 right-4 z-50 flex items-center justify-between">
        <div className="flex items-center rounded-full bg-background shadow-xl border border-border/60 px-5 py-3">
          <span className="text-sm font-semibold tracking-widest uppercase text-primary">
            {t('header.title')}
          </span>
        </div>
        <button
          onClick={toggle}
          className="size-12 rounded-full bg-background shadow-xl border border-border/60 flex items-center justify-center"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <Moon className="size-4" /> : <Sun className="size-4" />}
        </button>
      </header>
    )
  }

  if (hideSearch) return null

  return (
    <div className="fixed top-5 right-4 z-50 md:hidden">
      <div
        className="relative h-12 rounded-full bg-background shadow-xl border border-border/60 overflow-visible transition-[width] duration-300 ease-in-out"
        style={{ width: open ? 'calc(100vw - 2rem)' : '3rem' }}
      >
        <div className="h-12 rounded-full overflow-hidden relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={t('header.search')}
            className="absolute inset-0 text-sm bg-transparent outline-none pl-4 pr-12 text-foreground placeholder:text-foreground/40"
            style={{ opacity: open ? 1 : 0, transition: 'opacity 0.15s' }}
          />
          <button
            onClick={toggleSearch}
            className="absolute inset-y-0 right-0 w-12 flex items-center justify-center"
            aria-label={t('header.search')}
          >
            {open ? <X className="size-5" /> : <Search className="size-5" />}
          </button>
        </div>

        {open && results.length > 0 && (
          <div className="absolute top-14 left-0 right-0 rounded-2xl bg-background border border-border/60 shadow-xl overflow-hidden">
            {results.map(e => (
              <button
                key={e.id}
                onClick={() => selectEstablishment(e)}
                className="w-full flex flex-col items-start px-4 py-3 text-left hover:bg-muted transition-colors border-b border-border/40 last:border-0"
              >
                <span className="text-sm font-medium text-foreground truncate w-full">{e.name}</span>
                {(e.city || e.address) && (
                  <span className="text-xs text-muted-foreground truncate w-full">{e.city ?? e.address}</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
