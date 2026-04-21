import { Navigate, Route, Routes } from 'react-router'
import { Header } from '@/components/Header'
import { BottomNav } from '@/components/BottomNav'
import { MapPage } from '@/pages/MapPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { UsersPage } from '@/pages/UsersPage'
import { LoginPage } from '@/pages/LoginPage'
import { useAuth } from '@/hooks/useAuth'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 text-sm text-muted-foreground">
        Chargement...
      </main>
    )
  }

  return (
    <>
      <Header />
      <BottomNav />
      <main className="pt-20 p-8">
        <Routes>
          <Route path="/" element={<Navigate to={user ? "/social" : "/login"} replace />} />
          <Route path="/login" element={user ? <Navigate to="/social" replace /> : <LoginPage />} />
          <Route path="/social" element={user ? <UsersPage /> : <Navigate to="/login" replace />} />
          <Route path="/map" element={user ? <MapPage /> : <Navigate to="/login" replace />} />
          <Route path="/settings" element={user ? <SettingsPage /> : <Navigate to="/login" replace />} />
          <Route path="/profile" element={user ? <ProfilePage /> : <Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to={user ? "/social" : "/login"} replace />} />
        </Routes>
      </main>
    </>
  )
}

export default App
