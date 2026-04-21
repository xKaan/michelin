import { useState } from 'react'
import { Route, Routes, useLocation } from 'react-router'
import { Header } from '@/components/Header'
import { BottomNav } from '@/components/BottomNav'
import { PoiCard } from '@/components/PoiCard'
import type { SelectedPoi } from '@/components/PoiCard'
import { MapPage } from '@/pages/MapPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'

function App() {
  const location = useLocation()
  const isAuthPage = ['/login', '/register'].includes(location.pathname)
  const [selectedPoi, setSelectedPoi] = useState<SelectedPoi | null>(null)

  return (
    <>
      <Header minimal={isAuthPage} />
      {!isAuthPage && <BottomNav />}
      {!isAuthPage && (
        <PoiCard poi={selectedPoi} onClose={() => setSelectedPoi(null)} />
      )}
      <main className={isAuthPage ? 'pt-24' : ''}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/map" element={<MapPage onPoiClick={setSelectedPoi} />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </main>
    </>
  )
}

export default App
