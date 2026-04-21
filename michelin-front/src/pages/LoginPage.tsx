import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSignIn } from '@/hooks/useAuth'

export function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const signIn = useSignIn()
  const [email, setEmail] = useState('lea.martin.seed@michelin-local.test')
  const [password, setPassword] = useState('SeedUser!2026')
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!email || !password) {
      setError(t('login.errorRequired'))
      return
    }

    try {
      setError('')
      await signIn.mutateAsync({ email, password })
      navigate('/map', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : t('login.errorRequired'))
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <span className="text-primary text-4xl font-bold tracking-tight">M</span>
          <h1 className="mt-2 text-xl font-semibold tracking-tight">{t('header.title')}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t('login.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">{t('login.email')}</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="vous@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">{t('login.password')}</Label>
              <button
                type="button"
                className="text-xs text-primary hover:underline"
                onClick={() => {}}
              >
                {t('login.forgotPassword')}
              </button>
            </div>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button type="submit" className="w-full mt-1" disabled={signIn.isPending}>
            {signIn.isPending ? 'Connexion...' : t('login.submit')}
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          {t('login.noAccount')}{' '}
          <Link to="/register" className="text-primary hover:underline font-medium">
            {t('login.signUp')}
          </Link>
        </p>
      </div>
    </div>
  )
}
