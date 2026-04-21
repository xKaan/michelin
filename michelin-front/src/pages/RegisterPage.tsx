import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function RegisterPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !email || !password || !confirm) {
      setError(t('login.errorRequired'))
      return
    }
    if (password !== confirm) {
      setError(t('register.errorPasswordMatch'))
      return
    }
    // Mock auth — navigate to map on submit
    navigate('/map')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <span className="text-primary text-4xl font-bold tracking-tight">M</span>
          <h1 className="mt-2 text-xl font-semibold tracking-tight">{t('header.title')}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t('register.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">{t('register.name')}</Label>
            <Input
              id="name"
              type="text"
              autoComplete="name"
              placeholder="Jean Dupont"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

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
            <Label htmlFor="password">{t('login.password')}</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="confirm">{t('register.confirmPassword')}</Label>
            <Input
              id="confirm"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button type="submit" className="w-full mt-1">
            {t('register.submit')}
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          {t('register.hasAccount')}{' '}
          <button
            type="button"
            className="text-primary hover:underline font-medium"
            onClick={() => navigate('/login')}
          >
            {t('login.submit')}
          </button>
        </p>
      </div>
    </div>
  )
}
