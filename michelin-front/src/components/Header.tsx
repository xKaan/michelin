import { Search, X, Moon, Sun } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/hooks/useTheme'

export function Header({ minimal = false }: { minimal?: boolean }) {
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { t } = useTranslation()
  const { theme, toggle } = useTheme()

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

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

  return (
    <div className="fixed top-5 right-4 z-50">
      <div
        className="relative h-12 rounded-full bg-background shadow-xl border border-border/60 overflow-hidden transition-[width] duration-300 ease-in-out"
        style={{ width: open ? 'calc(100vw - 2rem)' : '3rem' }}
      >
        <input
          ref={inputRef}
          type="text"
          placeholder={t('header.search')}
          className="absolute inset-0 text-sm bg-transparent outline-none pl-4 pr-12 text-foreground placeholder:text-foreground/40"
          style={{ opacity: open ? 1 : 0, transition: 'opacity 0.15s' }}
        />
        <button
          onClick={() => setOpen(v => !v)}
          className="absolute inset-y-0 right-0 w-12 flex items-center justify-center"
          aria-label={t('header.search')}
        >
          {open ? <X className="size-5" /> : <Search className="size-5" />}
        </button>
      </div>
    </div>
  )
}
