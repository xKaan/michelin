import { useTranslation } from 'react-i18next'

export function ProfilePage() {
  const { t } = useTranslation()

  return (
    <div className="max-w-lg mx-auto pt-28 px-4 pb-12">
      <h1 className="text-2xl font-semibold tracking-tight mb-8">{t('profile.title')}</h1>

      <div className="flex flex-col items-center gap-4 mb-8">
        <img
          src="https://api.dicebear.com/9.x/notionists/svg?seed=michelin"
          alt="Profile"
          className="size-24 rounded-full ring-4 ring-primary/30"
        />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between rounded-xl border border-border bg-card px-5 py-4">
          <span className="text-sm text-muted-foreground">{t('profile.name')}</span>
          <span className="text-sm font-medium">John Doe</span>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-border bg-card px-5 py-4">
          <span className="text-sm text-muted-foreground">{t('profile.email')}</span>
          <span className="text-sm font-medium">john@example.com</span>
        </div>
      </div>
    </div>
  )
}
