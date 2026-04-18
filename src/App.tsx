import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { AppLayout } from './components/layout/AppLayout'
import { DeerLoader } from './components/DeerLoader'
import { Landing } from './pages/Landing'
import { Auth } from './pages/Auth'
import { Dashboard } from './pages/Dashboard'
import { CheckIn } from './pages/CheckIn'
import { Pet } from './pages/Pet'
import { Todos } from './pages/Todos'
import { Shop } from './pages/Shop'
import { Account } from './pages/Account'
import { Onboarding } from './pages/Onboarding'
import { Friends } from './pages/Friends'
import { Neighbourhood } from './pages/Neighbourhood'

function Protected({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useAuth()
  const location = useLocation()
  if (loading) return <DeerLoader fullScreen label="Finding your clearing…" />
  if (!profile) return <Navigate to="/auth" replace state={{ from: location }} />
  if (!profile.onboarded && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />
  }
  return <>{children}</>
}

function RootRoute() {
  const { profile, loading } = useAuth()

  if (loading) return <DeerLoader fullScreen label="Finding your clearing…" />
  if (!profile) return <Landing />

  return <Navigate to={profile.onboarded ? '/app' : '/onboarding'} replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRoute />} />
      <Route path="/auth" element={<Auth />} />
      <Route
        path="/onboarding"
        element={
          <Protected>
            <Onboarding />
          </Protected>
        }
      />
      <Route
        path="/app"
        element={
          <Protected>
            <AppLayout />
          </Protected>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="check-in" element={<CheckIn />} />
        <Route path="pet" element={<Pet />} />
        <Route path="todos" element={<Todos />} />
        <Route path="friends" element={<Friends />} />
        <Route path="neighbourhood" element={<Neighbourhood />} />
        <Route path="shop" element={<Shop />} />
        <Route path="account" element={<Account />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
