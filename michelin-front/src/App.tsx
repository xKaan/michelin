import { useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router'
import { Header } from '@/components/Header'
import { BottomNav } from '@/components/BottomNav'
import { DesktopNav } from '@/components/DesktopNav'
import { EstablishmentCard } from '@/components/EstablishmentCard'
import { MapPage } from '@/pages/MapPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { SocialPage } from '@/pages/SocialPage'
import { ExplorePage } from '@/pages/ExplorePage'
import { SavedPage } from '@/pages/SavedPage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { LandingPage } from '@/pages/LandingPage'
import { useAuth } from '@/hooks/useAuth'
import type { EstablishmentView } from '@/types/database'

function App() {
  const location = useLocation()
  const { user, loading } = useAuth()
  const isAuthPage = ['/login', '/register'].includes(location.pathname)
  const isLandingPage = location.pathname === '/' && !user
  const isProfilePage = location.pathname.startsWith('/profile')
  const showNav = !isAuthPage && !isLandingPage && !isProfilePage
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
      {showNav && <DesktopNav onSelectEstablishment={handleEstablishmentClick} />}
      {!isProfilePage && !isLandingPage && <Header minimal={isAuthPage} onSelectEstablishment={handleEstablishmentClick} />}
      {showNav && <BottomNav />}
      {showNav && (
        <EstablishmentCard
          establishment={selectedEstablishment}
          onClose={() => setSelectedEstablishment(null)}
        />
      )}
      {isProfilePage ? (
        <Routes>
          <Route path="/profile" element={user ? <ProfilePage /> : <Navigate to="/login" replace />} />
          <Route path="/profile/:userId" element={user ? <ProfilePage /> : <Navigate to="/login" replace />} />
        </Routes>
      ) : (
        <main className={[
          isAuthPage && !isLandingPage ? 'pt-24' : '',
          showNav ? 'md:pt-16' : '',
        ].filter(Boolean).join(' ')}>
          <Routes>
            <Route path="/" element={user ? <Navigate to="/map" replace /> : <LandingPage />} />
            <Route path="/login" element={user ? <Navigate to="/map" replace /> : <LoginPage />} />
            <Route path="/register" element={user ? <Navigate to="/map" replace /> : <RegisterPage />} />
            <Route
              path="/map"
              element={
                user
                  ? <MapPage onEstablishmentClick={handleEstablishmentClick} flyTarget={selectedEstablishment} />
                  : <Navigate to="/login" replace />
              }
            />
            <Route path="/social" element={user ? <SocialPage /> : <Navigate to="/login" replace />} />
            <Route path="/settings" element={user ? <SettingsPage /> : <Navigate to="/login" replace />} />
            <Route path="/profile" element={user ? <ProfilePage /> : <Navigate to="/login" replace />} />
            <Route path="/profile/:userId" element={user ? <ProfilePage /> : <Navigate to="/login" replace />} />
            <Route
              path="/explore"
              element={
                user
                  ? <ExplorePage onEstablishmentClick={handleEstablishmentClick} />
                  : <Navigate to="/login" replace />
              }
            />
            <Route
              path="/saved"
              element={
                user
                  ? <SavedPage onEstablishmentClick={handleEstablishmentClick} />
                  : <Navigate to="/login" replace />
              }
            />
            <Route path="*" element={<Navigate to={user ? '/map' : '/login'} replace />} />
          </Routes>
        </main>
      )}
    </>
  )
}

export default App
