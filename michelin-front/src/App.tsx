import { useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router'
import { Header } from '@/components/Header'
import { BottomNav } from '@/components/BottomNav'
import { EstablishmentCard } from '@/components/EstablishmentCard'
import { MapPage } from '@/pages/MapPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { UsersPage } from '@/pages/UsersPage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { useAuth } from '@/hooks/useAuth'
import type { EstablishmentView } from '@/types/database'

function App() {
  const location = useLocation()
  const { user, loading } = useAuth()
  const isAuthPage = ['/login', '/register'].includes(location.pathname)
  const isProfilePage = location.pathname === '/profile'
  const [selectedEstablishment, setSelectedEstablishment] = useState<EstablishmentView | null>(null)

  function handleEstablishmentClick(e: EstablishmentView) {
    setSelectedEstablishment(e)
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 text-sm text-muted-foreground">
        Chargement...
      </main>
    )
  }

  return (
    <>
    {!isProfilePage && <Header minimal={isAuthPage} />}
    {!isAuthPage && !isProfilePage && <BottomNav />}
    {!isAuthPage && !isProfilePage && (
      <EstablishmentCard
        establishment={selectedEstablishment}
        onClose={() => setSelectedEstablishment(null)}
      />
    )}
      {isProfilePage ? (
        <Routes>
          <Route path="/profile" element={user ? <ProfilePage /> : <Navigate to="/login" replace />} />
        </Routes>
      ) : (
        <main className={isAuthPage ? 'pt-24' : ''}>
          <Routes>
            <Route path="/" element={<Navigate to={user ? '/map' : '/login'} replace />} />
            <Route path="/login" element={user ? <Navigate to="/map" replace /> : <LoginPage />} />
            <Route path="/register" element={user ? <Navigate to="/map" replace /> : <RegisterPage />} />
            <Route
              path="/map"
              element={
                user
                  ? <MapPage onEstablishmentClick={handleEstablishmentClick} />
                  : <Navigate to="/login" replace />
              }
            />
            <Route path="/social" element={user ? <UsersPage /> : <Navigate to="/login" replace />} />
            <Route path="/settings" element={user ? <SettingsPage /> : <Navigate to="/login" replace />} />
            <Route path="/profile" element={user ? <ProfilePage /> : <Navigate to="/login" replace />} />
            <Route path="/explore" element={<Navigate to="/map" replace />} />
            <Route path="/saved" element={<Navigate to="/social" replace />} />
            <Route path="*" element={<Navigate to={user ? '/map' : '/login'} replace />} />
          </Routes>
        </main>
      )}
    </>
  )
}

export default App
