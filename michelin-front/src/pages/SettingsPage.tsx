import { useTranslation } from 'react-i18next'
import { useTheme } from '@/hooks/useTheme'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function SettingsPage() {
  const { t, i18n } = useTranslation()
  const { theme, toggle } = useTheme()

  return (
    <div className="max-w-lg mx-auto pt-28 px-4 pb-12">
      <h1 className="text-2xl font-semibold tracking-tight mb-8">{t('settings.title')}</h1>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between rounded-xl border border-border bg-card px-5 py-4">
          <span className="text-sm font-medium">{t('settings.language')}</span>
          <Select value={i18n.language} onValueChange={(v) => i18n.changeLanguage(v)}>
            <SelectTrigger className="w-36">
              <SelectValue>
                {i18n.language === 'fr' ? '🇫🇷 Français' : '🇬🇧 English'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fr">🇫🇷 Français</SelectItem>
              <SelectItem value="en">🇬🇧 English</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-border bg-card px-5 py-4">
          <span className="text-sm font-medium">{t('settings.theme')}</span>
          <Select value={theme} onValueChange={(v) => { if (v !== theme) toggle() }}>
            <SelectTrigger className="w-36">
              <SelectValue>
                {theme === 'light' ? `☀️ ${t('settings.light')}` : `🌙 ${t('settings.dark')}`}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">☀️ {t('settings.light')}</SelectItem>
              <SelectItem value="dark">🌙 {t('settings.dark')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
