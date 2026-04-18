import { NavLink } from 'react-router-dom'
import { Home, Leaf, PawPrint, ShoppingBag, ListTodo, Trees, Users } from 'lucide-react'
import { cn } from '../../lib/utils'

const NAV = [
  { to: '/app', label: 'Home', icon: Home, end: true },
  { to: '/app/check-in', label: 'Check-in', icon: Leaf },
  { to: '/app/pet', label: 'Deer', icon: PawPrint },
  { to: '/app/todos', label: 'Todos', icon: ListTodo },
  { to: '/app/friends', label: 'Friends', icon: Users },
  { to: '/app/neighbourhood', label: 'Nearby', icon: Trees },
  { to: '/app/shop', label: 'Shop', icon: ShoppingBag },
]

export function BottomNav() {
  return (
    <nav
      className="fixed inset-x-3 bottom-3 z-40 md:hidden"
      aria-label="Primary"
    >
      <div className="glass-strong no-scrollbar flex items-center gap-1 overflow-x-auto rounded-xl border border-slate-300/80 px-2 py-1.5 shadow-card">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex min-w-[68px] flex-col items-center gap-0.5 rounded-lg px-1 py-2 text-[10.5px] transition',
                isActive
                  ? 'on-forest-surface-strong on-forest-text'
                  : 'on-forest-text-muted hover:on-forest-text hover:bg-white/88'
              )
            }
          >
            <Icon size={18} />
            <span className="tracking-tight">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
