import { Home, Map, Users, UserRound } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router'
import { useTranslation } from 'react-i18next'

const items = [
  { key: 'home',    icon: Home,      path: '/' },
  { key: 'map',     icon: Map,       path: '/map' },
  { key: 'social',  icon: Users,     path: '/social' },
  { key: 'profile', icon: UserRound, path: '/profile' },
] as const

export function BottomNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { t } = useTranslation()

  return (
    <nav className="sm:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)]">
      <div className="flex items-center justify-around rounded-2xl border border-border bg-background shadow-md px-2 py-0.5">
        {items.map(({ key, icon: Icon, path }) => {
          const active = pathname === path
          return (
            <button
              key={key}
              onClick={() => navigate(path)}
              className={[
                'flex flex-col items-center gap-1 flex-1 py-1 rounded-xl transition-all',
                active
                  ? 'text-primary'
                  : 'text-foreground/50 hover:text-foreground/80',
              ].join(' ')}
              aria-label={t(`header.${key}`)}
            >
              <span className={[
                'flex items-center justify-center size-9 rounded-xl transition-all',
                active ? 'bg-primary/10' : '',
              ].join(' ')}>
                <Icon className="size-5" strokeWidth={active ? 2.2 : 1.8} />
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
