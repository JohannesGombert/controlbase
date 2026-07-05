import { ArrowRight, CheckCircle2, LockKeyhole } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient'

export function Login() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const { user, loading } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  if (!loading && user) return <Navigate replace to="/dashboard" />

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setMessage('')
    if (!supabase) {
      setError('Supabase ist noch nicht konfiguriert.')
      return
    }

    setSaving(true)
    if (mode === 'signup') {
      const { data, error: signUpError } = await supabase.auth.signUp({ email, password })
      if (signUpError) setError(signUpError.message)
      else if (!data.session) setMessage('Konto erstellt. Bitte bestätige die E-Mail und melde dich danach an.')
      else navigate('/dashboard', { replace: true })
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) setError('Anmeldung fehlgeschlagen. Bitte E-Mail und Passwort prüfen.')
      else {
        const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname
        navigate(from ?? '/dashboard', { replace: true })
      }
    }
    setSaving(false)
  }

  return (
    <main className="grid min-h-dvh bg-canvas lg:grid-cols-[1.1fr_0.9fr]">
      <section className="hidden bg-control-deep p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-control-surface text-sm font-bold text-ink">CB</span><strong className="font-display text-2xl">ControlBase</strong></div>
        <div className="max-w-xl"><p className="text-xs font-bold uppercase tracking-[0.24em] text-positive-light">Dein privates Cockpit</p><h1 className="mt-5 font-display text-6xl font-semibold leading-[1.05]">Klarheit beginnt mit ehrlichen Daten.</h1><p className="mt-6 max-w-lg text-base leading-7 text-white/60">Gesundheit, Fokus und Entscheidungen an einem Ort. Ohne Show, ohne Ausreden.</p></div>
        <p className="text-xs text-white/40">Privat. Direkt. Nur für dich.</p>
      </section>
      <section className="flex items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-md">
          <div className="mb-10 flex items-center gap-3 lg:hidden"><span className="grid size-10 place-items-center rounded-xl bg-control-deep text-sm font-bold text-white">CB</span><strong className="font-display text-2xl">ControlBase</strong></div>
          <span className="grid size-12 place-items-center rounded-2xl bg-[#e7f4ee] text-positive"><LockKeyhole size={22} /></span>
          <p className="mt-7 text-xs font-bold uppercase tracking-[0.2em] text-accent">Privater Zugang</p>
          <h2 className="mt-2 font-display text-4xl font-semibold">{mode === 'login' ? 'Willkommen zurück.' : 'Konto anlegen.'}</h2>
          <p className="mt-3 text-sm leading-6 text-muted">{mode === 'login' ? 'Melde dich an, um deinen heutigen Stand zu sehen.' : 'Ein Konto, alle Daten sicher voneinander getrennt.'}</p>
          {!isSupabaseConfigured && <p className="mt-6 rounded-xl bg-warning/10 p-3 text-sm font-semibold text-warning">Supabase-Variablen fehlen.</p>}
          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <label className="block"><span className="text-xs font-bold uppercase tracking-wider text-muted">E-Mail</span><input autoComplete="email" className="mt-2 w-full rounded-xl border border-line bg-control-surface px-4 py-3.5 outline-none focus:border-accent focus:ring-2 focus:ring-accent/10" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} /></label>
            <label className="block"><span className="text-xs font-bold uppercase tracking-wider text-muted">Passwort</span><input autoComplete={mode === 'login' ? 'current-password' : 'new-password'} className="mt-2 w-full rounded-xl border border-line bg-control-surface px-4 py-3.5 outline-none focus:border-accent focus:ring-2 focus:ring-accent/10" minLength={8} onChange={(event) => setPassword(event.target.value)} required type="password" value={password} /></label>
            {error && <p className="rounded-xl bg-red-50 px-3.5 py-3 text-sm font-semibold text-status-danger">{error}</p>}
            {message && <p className="flex gap-2 rounded-xl bg-[#e7f4ee] px-3.5 py-3 text-sm font-semibold text-positive"><CheckCircle2 className="shrink-0" size={18} />{message}</p>}
            <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-control-deep px-5 py-3.5 text-sm font-bold text-white disabled:opacity-60" disabled={saving || !isSupabaseConfigured} type="submit">{saving ? 'Bitte warten …' : mode === 'login' ? 'Anmelden' : 'Konto erstellen'} <ArrowRight size={17} /></button>
          </form>
          <button className="mt-5 text-sm font-semibold text-accent" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setMessage('') }} type="button">{mode === 'login' ? 'Noch kein Konto? Jetzt registrieren' : 'Bereits registriert? Anmelden'}</button>
        </div>
      </section>
    </main>
  )
}
