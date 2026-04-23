import { MapPin, Users, Compass, Bookmark, UserRound, Settings, LogOut } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router'
import { useTranslation } from 'react-i18next'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth, useSignOut } from '@/hooks/useAuth'
import { useUserProfile } from '@/hooks/useProfile'
import { useUserMascot } from '@/hooks/useMascot'

const items = [
  { key: 'map',     icon: MapPin,   path: '/map' },
  { key: 'social',  icon: Users,    path: '/social' },
  { key: 'explore', icon: Compass,  path: '/explore' },
  { key: 'save',    icon: Bookmark, path: '/saved' },
] as const

export function BottomNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { t } = useTranslation()
  const { user } = useAuth()
  const { data: mascot } = useUserMascot(user?.id ?? null)
  const signOut = useSignOut()
  const { data: profile } = useUserProfile(user?.id ?? null)
  const avatarColor = profile?.avatar_color ?? '#dde0ef'

  const avatarUrl = mascot?.head_url ?? `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(user?.email ?? 'michelin')}`

  return (
    <nav className="md:hidden fixed bottom-5 left-4 right-4 z-50 flex items-center justify-between">
      {/* Pill */}
      <div className="flex flex-col items-stretch rounded-full bg-background shadow-xl border border-border/60 overflow-hidden">

        <div className="flex items-center px-2 pb-2 pt-1">
          {items.map(({ key, icon: Icon, path }) => {
            const active = pathname === path
            return (
              <button
                key={key}
                onClick={() => navigate(path)}
                className={[
                  'flex flex-col items-center gap-0.5 w-16 py-2 rounded-full transition-all',
                  active ? 'text-primary' : 'text-foreground/40 hover:text-foreground/70',
                ].join(' ')}
                aria-label={t(`nav.${key}`)}
              >
                <Icon className="size-5" strokeWidth={active ? 2.4 : 1.8} />
                <span className="text-[10px] font-semibold leading-tight">{t(`nav.${key}`)}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Profile avatar — séparé */}
      <DropdownMenu>
        <DropdownMenuTrigger
          className="size-14 rounded-full overflow-hidden shadow-xl flex-shrink-0 focus:outline-none"
          style={{ backgroundColor: avatarColor }}
          aria-label={t('header.profile')}
        >
          <img
            src={avatarUrl}
            alt="Profile"
            className="size-full object-cover"
            key={avatarUrl}
            onError={(e) => {
              e.currentTarget.src = `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(user?.email ?? 'michelin')}`
            }}
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="top" className="w-44 mb-2">
          <DropdownMenuItem onClick={() => navigate('/profile')}>
            <UserRound className="size-4" />
            {t('header.profile')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/settings')}>
            <Settings className="size-4" />
            {t('header.settings')}
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
            {t('header.logout')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  )
}
