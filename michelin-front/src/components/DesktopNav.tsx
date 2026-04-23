// src/components/DesktopNav.tsx
import { Search, X, Moon, Sun, LogOut, Settings, UserRound } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router'
import { useState, useRef, useMemo, useEffect } from 'react'
import { useTheme } from '@/hooks/useTheme'
import { useAuth, useSignOut } from '@/hooks/useAuth'
import { useUserProfile } from '@/hooks/useProfile'
import { useUserMascot } from '@/hooks/useMascot'
import { useAllEstablishments } from '@/hooks/useRestaurants'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { EstablishmentView } from '@/types/database'

const NAV_ITEMS = [
  { path: '/map',     label: 'Carte' },
  { path: '/explore', label: 'Explorer' },
  { path: '/social',  label: 'Social' },
  { path: '/saved',   label: 'Enregistrés' },
] as const

interface DesktopNavProps {
  onSelectEstablishment?: (e: EstablishmentView) => void
}

export function DesktopNav({ onSelectEstablishment }: DesktopNavProps) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { theme, toggle } = useTheme()
  const { user } = useAuth()
  const signOut = useSignOut()
  const { data: profile } = useUserProfile(user?.id ?? null)
  const { data: mascot } = useUserMascot(user?.id ?? null)
  const avatarColor = profile?.avatar_color ?? '#dde0ef'
  const avatarUrl = mascot?.head_url
    ?? `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(user?.email ?? 'michelin')}`

  const isMapPage = pathname === '/map'
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
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
    if (searchOpen) inputRef.current?.focus()
  }, [searchOpen])

  useEffect(() => {
    if (!isMapPage) { setSearchOpen(false); setQuery('') }
  }, [isMapPage])

  function closeSearch() { setSearchOpen(false); setQuery('') }

  function selectEstablishment(e: EstablishmentView) {
    onSelectEstablishment?.(e)
    closeSearch()
  }

  return (
    <header className="hidden md:flex fixed top-0 left-0 right-0 h-16 z-50 items-center justify-between px-8 bg-background border-b border-border/60 shadow-sm">
      {/* Wordmark */}
      <span className="text-sm font-semibold tracking-widest uppercase text-primary select-none flex-shrink-0">
        Michelin
      </span>

      {/* Center: nav or search */}
      <div className="flex-1 flex items-center justify-center relative">
        {isMapPage && searchOpen ? (
          <div className="relative w-80">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Rechercher un établissement..."
              className="w-full rounded-full border border-border/60 bg-muted px-4 pr-10 py-2 text-sm outline-none focus:border-primary/40 text-foreground placeholder:text-foreground/40"
            />
            <button
              onClick={closeSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50 hover:text-foreground"
              aria-label="Fermer la recherche"
            >
              <X className="size-4" />
            </button>
            {results.length > 0 && (
              <div className="absolute top-11 left-0 right-0 rounded-2xl bg-background border border-border/60 shadow-xl overflow-hidden z-10">
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
        ) : (
          <nav className="flex items-center gap-1">
            {NAV_ITEMS.map(({ path, label }) => {
              const active = pathname === path
              return (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  className={[
                    'relative px-4 py-2 text-sm font-medium rounded-md transition-colors',
                    active ? 'text-primary' : 'text-foreground/60 hover:text-foreground',
                  ].join(' ')}
                >
                  {label}
                  {active && (
                    <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary rounded-full" />
                  )}
                </button>
              )
            })}
            {isMapPage && (
              <button
                onClick={() => setSearchOpen(true)}
                className="ml-2 size-8 flex items-center justify-center rounded-full text-foreground/60 hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Rechercher"
              >
                <Search className="size-4" />
              </button>
            )}
          </nav>
        )}
      </div>

      {/* Right: theme + avatar */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={toggle}
          className="size-9 rounded-full flex items-center justify-center text-foreground/60 hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Basculer le thème"
        >
          {theme === 'light' ? <Moon className="size-4" /> : <Sun className="size-4" />}
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger
            className="size-9 rounded-full overflow-hidden focus:outline-none flex-shrink-0"
            style={{ backgroundColor: avatarColor }}
            aria-label="Profil"
          >
            <img
              src={avatarUrl}
              alt="Profil"
              className="size-full object-cover"
              onError={e => {
                e.currentTarget.src = `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(user?.email ?? 'michelin')}`
              }}
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={() => navigate('/profile')}>
              <UserRound className="size-4" />
              Profil
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              <Settings className="size-4" />
              Paramètres
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={async () => {
                await signOut.mutateAsync()
                navigate('/login', { replace: true })
              }}
            >
              <LogOut className="size-4" />
              Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
