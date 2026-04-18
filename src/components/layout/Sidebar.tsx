import { NavLink } from 'react-router-dom'
import {
  Home,
  Leaf,
  PawPrint,
  ShoppingBag,
  ListTodo,
  LogOut,
  Trees,
  Users,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { cn } from '../../lib/utils'

const NAV = [
  { to: '/app', label: 'Home', icon: Home, end: true },
  { to: '/app/check-in', label: 'Check-in', icon: Leaf },
  { to: '/app/pet', label: 'Deer', icon: PawPrint },
  { to: '/app/todos', label: 'Todos', icon: ListTodo },
  { to: '/app/friends', label: 'Friends', icon: Users },
  { to: '/app/neighbourhood', label: 'Neighbourhood', icon: Trees },
  { to: '/app/shop', label: 'Shop', icon: ShoppingBag },
]

export function Sidebar() {
  const { signOut, profile } = useAuth()
  const profileName = profile?.display_name?.trim() || profile?.email?.split('@')[0] || 'Friend'
  const profileInitial = profileName.charAt(0).toUpperCase()
  return (
    <aside className="glass-strong sticky top-0 hidden h-screen w-64 flex-none flex-col justify-between border-r border-slate-300/80 p-5 md:flex">
      <div className="space-y-7">
        <div className="flex items-center gap-2.5 px-2 pt-1">
          <LogoMark />
          <div>
            <div className="on-forest-text font-display text-lg leading-tight">Endeerment</div>
            <div className="on-forest-text-muted text-[11px] uppercase tracking-[0.2em]">
              a gentle check-in
            </div>
          </div>
        </div>
        <nav className="space-y-1">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm transition',
                  isActive
                    ? 'on-forest-surface-strong on-forest-text'
                    : 'on-forest-text-soft hover:on-forest-text border border-transparent hover:border-slate-300 hover:bg-white/92'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-md transition',
                      isActive
                        ? 'bg-sage-50 on-forest-text border border-slate-300'
                        : 'border border-slate-300 bg-white on-forest-text-soft group-hover:on-forest-text'
                    )}
                  >
                    <Icon size={16} />
                  </span>
                  <span className="font-medium">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="space-y-3">
        {profile && (
          <NavLink
            to="/app/account"
            className={({ isActive }) =>
              cn(
                'on-forest-surface flex items-center gap-3 rounded-lg px-3 py-2.5 transition',
                isActive ? 'ring-1 ring-sage-500/20' : 'hover:border-slate-300 hover:bg-white/96'
              )
            }
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-900 font-display text-white">
              {profileInitial}
            </div>
            <div className="min-w-0">
              <div className="on-forest-text truncate text-sm font-medium">
                {profileName}
              </div>
              <div className="on-forest-text-muted truncate text-[11px]">{profile.email}</div>
            </div>
          </NavLink>
        )}
        <button
          onClick={signOut}
          className="on-forest-text-soft hover:on-forest-text flex w-full items-center gap-2.5 rounded-lg border border-transparent px-3.5 py-2.5 text-sm transition hover:border-slate-300 hover:bg-white/92"
        >
          <LogOut size={14} /> Sign out
        </button>
      </div>
    </aside>
  )
}

function LogoMark() {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-300 bg-white shadow-soft">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
        <path
          d="M6 4 L8 1 L10 4 M10 4 L12 1 L14 4"
          stroke="#17382b"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <circle cx="10" cy="12" r="5" fill="#17382b" />
        <circle cx="8.3" cy="11.4" r="0.7" fill="#ffffff" />
        <circle cx="11.7" cy="11.4" r="0.7" fill="#ffffff" />
      </svg>
    </div>
  )
}
