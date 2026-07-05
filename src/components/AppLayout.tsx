import {
  CalendarCheck,
  Gauge,
  Lightbulb,
  LogOut,
  Menu,
  Settings,
  ShoppingBag,
  Target,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'

const navigation = [
  { label: 'Cockpit', path: '/dashboard', icon: Gauge },
  { label: 'Heute', path: '/heute', icon: Target },
  { label: 'Käufe', path: '/kaeufe', icon: ShoppingBag },
  { label: 'Ideen', path: '/ideen', icon: Lightbulb },
  { label: 'Review', path: '/wochenreview', icon: CalendarCheck },
]

function Brand() {
  return (
    <NavLink className="flex items-center gap-3" to="/dashboard">
      <span className="grid size-9 place-items-center rounded-xl bg-ink text-sm font-bold text-white shadow-sm">
        CB
      </span>
      <span>
        <strong className="block font-display text-xl leading-none tracking-tight">ControlBase</strong>
        <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted">Private cockpit</span>
      </span>
    </NavLink>
  )
}

export function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, signOut } = useAuth()

  return (
    <div className="min-h-dvh bg-canvas text-ink">
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-line/80 bg-canvas/95 px-5 backdrop-blur lg:hidden">
        <Brand />
        <button
          aria-label={menuOpen ? 'Menü schließen' : 'Menü öffnen'}
          className="grid size-10 place-items-center rounded-full border border-line bg-white"
          onClick={() => setMenuOpen((open) => !open)}
          type="button"
        >
          {menuOpen ? <X size={19} /> : <Menu size={19} />}
        </button>
      </header>

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-line bg-[#eeede7] p-6 lg:flex">
        <Brand />
        <nav className="mt-12 space-y-1.5" aria-label="Hauptnavigation">
          {navigation.map(({ label, path, icon: Icon }) => (
            <NavLink
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition ${
                  isActive ? 'bg-ink text-white shadow-sm' : 'text-muted hover:bg-white/80 hover:text-ink'
                }`
              }
              key={path}
              to={path}
            >
              <Icon size={18} strokeWidth={2} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto border-t border-line pt-5">
          <NavLink className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold text-muted hover:bg-white/80 hover:text-ink" to="/einstellungen">
            <Settings size={18} />
            Einstellungen
          </NavLink>
          <button className="mt-1 flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm font-semibold text-muted hover:bg-white/80 hover:text-ink" onClick={() => void signOut()} type="button">
            <LogOut size={18} /> Abmelden
          </button>
          <p className="mt-3 truncate px-3.5 text-[11px] text-muted">{user?.email}</p>
          <p className="mt-5 px-3.5 text-xs leading-relaxed text-muted">Heute zählt Wiederholung,<br />nicht Perfektion.</p>
        </div>
      </aside>

      {menuOpen && (
        <nav className="fixed inset-x-4 top-20 z-50 rounded-2xl border border-line bg-white p-2 shadow-xl lg:hidden" aria-label="Mobiles Menü">
          {[...navigation, { label: 'Einstellungen', path: '/einstellungen', icon: Settings }].map(({ label, path, icon: Icon }) => (
            <NavLink
              className={({ isActive }) => `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold ${isActive ? 'bg-ink text-white' : 'text-muted'}`}
              key={path}
              onClick={() => setMenuOpen(false)}
              to={path}
            >
              <Icon size={18} /> {label}
            </NavLink>
          ))}
          <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-muted" onClick={() => void signOut()} type="button"><LogOut size={18} /> Abmelden</button>
        </nav>
      )}

      <main className="min-h-dvh pb-28 lg:ml-64 lg:pb-10">
        <div className="mx-auto w-full max-w-7xl px-5 py-7 sm:px-8 lg:px-10 lg:py-10">
          <Outlet />
        </div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-line bg-white/95 px-2 pb-[max(.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur lg:hidden" aria-label="Schnellnavigation">
        {navigation.map(({ label, path, icon: Icon }) => (
          <NavLink className={({ isActive }) => `flex flex-col items-center gap-1 rounded-lg py-1.5 text-[10px] font-semibold ${isActive ? 'text-ink' : 'text-muted'}`} key={path} to={path}>
            {({ isActive }) => (
              <>
                <span className={`grid size-8 place-items-center rounded-xl ${isActive ? 'bg-ink text-white' : ''}`}><Icon size={17} /></span>
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
