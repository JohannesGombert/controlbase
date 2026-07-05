import {
  CalendarCheck,
  Gauge,
  HeartPulse,
  Lightbulb,
  LogOut,
  Menu,
  MoreHorizontal,
  Settings,
  ShoppingBag,
  Target,
  WalletCards,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'

const navigation = [
  { label: 'Dashboard', path: '/dashboard', icon: Gauge },
  { label: 'Heute', path: '/heute', icon: Target },
  { label: 'Gesundheit', path: '/gesundheit', icon: HeartPulse },
  { label: 'Finanzen', path: '/finanzen', icon: WalletCards },
  { label: 'Käufe', path: '/kaeufe', icon: ShoppingBag },
  { label: 'Ideen', path: '/ideen', icon: Lightbulb },
  { label: 'Review', path: '/wochenreview', icon: CalendarCheck },
]

const mobileNavigation = [
  { label: 'Heute', path: '/heute', icon: Target },
  { label: 'Dashboard', path: '/dashboard', icon: Gauge },
  { label: 'Käufe', path: '/kaeufe', icon: ShoppingBag },
  { label: 'Review', path: '/wochenreview', icon: CalendarCheck },
  { label: 'Mehr', path: '/einstellungen', icon: MoreHorizontal },
]

function Brand() {
  return (
    <NavLink className="flex items-center gap-3" to="/dashboard">
      <span className="relative grid size-10 place-items-center rounded-xl border border-accent/40 bg-control-input text-sm font-black text-ink shadow-glow">
        <span className="absolute right-2 top-2 size-1.5 rounded-full bg-accent" />
        CB
      </span>
      <span>
        <strong className="block text-xl font-semibold leading-none tracking-tight text-ink">ControlBase</strong>
        <span className="text-[10px] font-bold uppercase tracking-[0.26em] text-muted">Executive system</span>
      </span>
    </NavLink>
  )
}

function TodayLine() {
  return new Intl.DateTimeFormat('de-CH', { day: '2-digit', month: 'long', weekday: 'long' }).format(new Date())
}

export function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, signOut } = useAuth()

  return (
    <div className="min-h-dvh bg-canvas text-ink">
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-line bg-canvas/90 px-5 backdrop-blur lg:hidden">
        <Brand />
        <button
          aria-label={menuOpen ? 'Menü schließen' : 'Menü öffnen'}
          className="grid size-10 place-items-center rounded-xl border border-line bg-control-surface text-ink"
          onClick={() => setMenuOpen((open) => !open)}
          type="button"
        >
          {menuOpen ? <X size={19} /> : <Menu size={19} />}
        </button>
      </header>

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-68 flex-col border-r border-line bg-control-deep/90 p-6 backdrop-blur lg:flex">
        <Brand />
        <nav className="mt-12 space-y-1.5" aria-label="Hauptnavigation">
          {navigation.map(({ label, path, icon: Icon }) => (
            <NavLink
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition ${
                  isActive ? 'bg-accent text-[#020617] shadow-glow' : 'text-muted hover:bg-control-hover hover:text-ink'
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
          <NavLink className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold text-muted hover:bg-control-hover hover:text-ink" to="/einstellungen">
            <Settings size={18} />
            Einstellungen
          </NavLink>
          <button className="mt-1 flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm font-semibold text-muted hover:bg-control-hover hover:text-ink" onClick={() => void signOut()} type="button">
            <LogOut size={18} /> Abmelden
          </button>
          <p className="mt-3 truncate px-3.5 text-[11px] text-muted">{user?.email}</p>
          <p className="mt-5 px-3.5 text-xs leading-relaxed text-muted">System ruhig halten.<br />Heute nachsteuern.</p>
        </div>
      </aside>

      {menuOpen && (
        <nav className="fixed inset-x-4 top-20 z-50 rounded-2xl border border-line bg-control-surface p-2 shadow-card lg:hidden" aria-label="Mobiles Menü">
          {[...navigation, { label: 'Einstellungen', path: '/einstellungen', icon: Settings }].map(({ label, path, icon: Icon }) => (
            <NavLink
              className={({ isActive }) => `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold ${isActive ? 'bg-accent text-[#020617]' : 'text-muted'}`}
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

      <main className="min-h-dvh pb-28 lg:ml-68 lg:pb-10">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-7 px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
          <div className="hidden items-center justify-between border-b border-line pb-5 lg:flex">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-muted">{TodayLine()}</p>
              <p className="mt-1 text-sm text-muted">Status prüfen. Entscheidung treffen. System halten.</p>
            </div>
            <div className="rounded-xl border border-line bg-control-surface px-4 py-2 text-right">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted">User</p>
              <p className="max-w-64 truncate text-sm font-semibold text-ink">{user?.email}</p>
            </div>
          </div>
          <Outlet />
        </div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-line bg-control-deep/95 px-1 pb-[max(.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur lg:hidden" aria-label="Schnellnavigation">
        {mobileNavigation.map(({ label, path, icon: Icon }) => (
          <NavLink className={({ isActive }) => `flex flex-col items-center gap-1 rounded-lg py-1.5 text-[10px] font-semibold ${isActive ? 'text-accent' : 'text-muted'}`} key={path} to={path}>
            {({ isActive }) => (
              <>
                <span className={`grid size-8 place-items-center rounded-xl ${isActive ? 'bg-accent text-[#020617]' : 'bg-control-surface text-muted'}`}><Icon size={17} /></span>
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
