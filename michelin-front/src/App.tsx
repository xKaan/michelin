import { Route, Routes } from 'react-router'
import { Header } from '@/components/Header'
import { BottomNav } from '@/components/BottomNav'
import { MapPage } from '@/pages/MapPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { ProfilePage } from '@/pages/ProfilePage'

function App() {
  return (
    <>
      <Header />
      <BottomNav />
      <main className="pt-20 p-8">
        <Routes>
          <Route path="/map" element={<MapPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </main>
    </>
  )
}

export default App
