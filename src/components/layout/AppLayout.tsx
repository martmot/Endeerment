import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'

export function AppLayout() {
  return (
    <div className="relative flex min-h-screen bg-forest-gradient">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-y-0 left-64 hidden w-px bg-slate-300/70 md:block" />
        <div className="absolute inset-x-0 top-0 h-px bg-white/80" />
      </div>

      <Sidebar />

      <main className="relative flex-1 min-w-0 px-4 pb-28 pt-6 md:px-10 md:pb-10">
        <div className="mx-auto w-full max-w-6xl">
          <Outlet />
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
