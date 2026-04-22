import { useTranslation } from 'react-i18next'
import { useAuth } from '@/hooks/useAuth'
import { useUserProfile } from '@/hooks/useProfile'
import { QrCodeDisplay } from '@/components/QrCodeDisplay'
import { XpProgress } from '@/components/XpProgress'

export function ProfilePage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { data: profile, isLoading, error } = useUserProfile(user?.id ?? null)

  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto pt-28 px-4 pb-12">
        <div className="rounded-2xl border border-border bg-card px-5 py-10 text-sm text-muted-foreground">
          Chargement du profil...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto pt-28 px-4 pb-12">
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-5 py-4 text-sm text-destructive">
          Impossible de charger le profil : {error.message}
        </div>
      </div>
    )
  }

  const displayName = profile?.display_name ?? user?.user_metadata?.display_name ?? 'Sans nom'
  const email = profile?.email ?? user?.email ?? 'Email indisponible'
  const tier = profile?.tier ?? 'explorer'
  const xpTotal = profile?.xp_total ?? 0

  return (
    <div className="max-w-lg mx-auto pt-28 px-4 pb-12">
      <h1 className="text-2xl font-semibold tracking-tight mb-8">{t('profile.title')}</h1>

      <div className="flex flex-col items-center gap-4 mb-8">
        <img
          src={`https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(email)}`}
          alt="Profile"
          className="size-24 rounded-full ring-4 ring-primary/30"
        />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between rounded-xl border border-border bg-card px-5 py-4">
          <span className="text-sm text-muted-foreground">{t('profile.name')}</span>
          <span className="text-sm font-medium">{displayName}</span>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-border bg-card px-5 py-4">
          <span className="text-sm text-muted-foreground">{t('profile.email')}</span>
          <span className="text-sm font-medium">{email}</span>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card px-5 py-5 mt-4">
        <XpProgress xp={xpTotal} streak={profile?.streak?.current_count} showActions />
      </div>

      <div className="rounded-xl border border-border bg-card px-5 py-6 mt-4 flex flex-col items-center">
        <QrCodeDisplay tier={tier} />
      </div>
    </div>
  )
}
