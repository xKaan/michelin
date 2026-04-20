import { Moon, Sun, Map, Users, Settings, UserRound, LogOut } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTheme } from '@/hooks/useTheme'

export function Header() {
  const { theme, toggle } = useTheme()
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-6xl">
      <div className="rounded-2xl border border-border bg-background shadow-md overflow-hidden">

        {/* Main bar */}
        <div className="flex items-center justify-between px-5 py-3">
          <span className="text-sm font-semibold tracking-widest uppercase text-primary">
            {t('header.title')}
          </span>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-1">
            <Button variant="ghost" size="sm" className="gap-2 text-xs font-medium" onClick={() => navigate('/map')}>
              <Map className="size-4" />
              {t('header.map')}
            </Button>
            <Button variant="ghost" size="sm" className="gap-2 text-xs font-medium">
              <Users className="size-4" />
              {t('header.social')}
            </Button>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Lang + theme — desktop only */}
            <div className="hidden sm:flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
                {theme === 'light' ? <Moon className="size-4" /> : <Sun className="size-4" />}
              </Button>
            </div>

            {/* Profile dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger
                className="size-8 rounded-full overflow-hidden ring-2 ring-primary/40 hover:ring-primary transition-all focus:outline-none flex items-center justify-center p-0"
                aria-label="Profile"
              >
                <img
                  src="https://api.dicebear.com/9.x/notionists/svg?seed=michelin"
                  alt="Profile"
                  className="size-full object-cover"
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <UserRound className="size-4" />
                  {t('header.profile')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <Settings className="size-4" />
                  {t('header.settings')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:text-destructive">
                  <LogOut className="size-4" />
                  {t('header.logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

          </div>
        </div>

      </div>
    </header>
  )
}
