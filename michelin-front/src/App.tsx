import { useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router'
import { Header } from '@/components/Header'
import { BottomNav } from '@/components/BottomNav'
import { PoiCard } from '@/components/PoiCard'
import type { SelectedPoi } from '@/components/PoiCard'
import { MapPage } from '@/pages/MapPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { UsersPage } from '@/pages/UsersPage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { useAuth } from '@/hooks/useAuth'

function App() {
  const location = useLocation()
  const { user, loading } = useAuth()
  const isAuthPage = ['/login', '/register'].includes(location.pathname)
  const [selectedPoi, setSelectedPoi] = useState<SelectedPoi | null>(null)

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 text-sm text-muted-foreground">
        Chargement...
      </main>
    )
  }

  return (
    <>
      <Header minimal={isAuthPage} />
      {!isAuthPage && <BottomNav />}
      {!isAuthPage && (
        <PoiCard poi={selectedPoi} onClose={() => setSelectedPoi(null)} />
      )}
      <main className={isAuthPage ? 'pt-24' : ''}>
        <Routes>
          <Route path="/" element={<Navigate to={user ? '/map' : '/login'} replace />} />
          <Route path="/login" element={user ? <Navigate to="/map" replace /> : <LoginPage />} />
          <Route path="/register" element={user ? <Navigate to="/map" replace /> : <RegisterPage />} />
          <Route path="/map" element={user ? <MapPage onPoiClick={setSelectedPoi} /> : <Navigate to="/login" replace />} />
          <Route path="/social" element={user ? <UsersPage /> : <Navigate to="/login" replace />} />
          <Route path="/settings" element={user ? <SettingsPage /> : <Navigate to="/login" replace />} />
          <Route path="/profile" element={user ? <ProfilePage /> : <Navigate to="/login" replace />} />
          <Route path="/explore" element={<Navigate to="/map" replace />} />
          <Route path="/saved" element={<Navigate to="/social" replace />} />
          <Route path="*" element={<Navigate to={user ? '/map' : '/login'} replace />} />
        </Routes>
      </main>
    </>
  )
}

export default App
