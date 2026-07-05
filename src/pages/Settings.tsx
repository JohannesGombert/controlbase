import { CheckCircle2, CircleOff, Database, ExternalLink, RefreshCw, ShieldCheck, Watch } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { PageHeader } from '../components/PageHeader'
import { Panel, SectionTitle } from '../components/Panel'
import { isSupabaseConfigured } from '../lib/supabaseClient'
import { loadWhoopStatus, startWhoopConnection, syncWhoop, type WhoopConnectionStatus } from '../services/whoop'

function dateTime(value?: string | null) {
  return value ? new Date(value).toLocaleString('de-CH') : 'noch nie'
}

export function Settings() {
  const { user } = useAuth()
  const [whoop, setWhoop] = useState<WhoopConnectionStatus | null>(null)
  const [loadingWhoop, setLoadingWhoop] = useState(false)
  const [whoopMessage, setWhoopMessage] = useState('')
  const [whoopError, setWhoopError] = useState('')

  const refreshWhoop = useCallback(async () => {
    if (!user) return
    setWhoopError('')
    try {
      const status = await loadWhoopStatus()
      setWhoop(status)
    } catch (error) {
      setWhoopError(error instanceof Error ? error.message : 'WHOOP Status konnte nicht geladen werden.')
    }
  }, [user])

  useEffect(() => {
    void refreshWhoop()
    const params = new URLSearchParams(window.location.search)
    if (params.get('whoop') === 'connected') setWhoopMessage('WHOOP wurde verbunden. Du kannst jetzt synchronisieren.')
    if (params.get('whoop') === 'error') setWhoopError(params.get('message') ?? 'WHOOP Verbindung fehlgeschlagen.')
  }, [refreshWhoop, user])

  async function connect() {
    setLoadingWhoop(true)
    setWhoopError('')
    try {
      await startWhoopConnection()
    } catch (error) {
      setWhoopError(error instanceof Error ? error.message : 'WHOOP Verbindung konnte nicht gestartet werden.')
      setLoadingWhoop(false)
    }
  }

  async function sync() {
    setLoadingWhoop(true)
    setWhoopError('')
    setWhoopMessage('')
    try {
      const result = await syncWhoop()
      setWhoopMessage(`Synchronisiert: ${result.daily} Tageswerte und ${result.workouts} Workouts.`)
      await refreshWhoop()
    } catch (error) {
      setWhoopError(error instanceof Error ? error.message : 'WHOOP Sync fehlgeschlagen.')
    } finally {
      setLoadingWhoop(false)
    }
  }

  return (
    <>
      <PageHeader eyebrow="System" title="Einstellungen" description="Verbindungen, Datenschutz und optionale Erweiterungen an einem ruhigen Ort." />
      <div className="grid gap-5 lg:grid-cols-2">
        <Panel>
          <div className="flex items-start justify-between gap-4">
            <div className="flex gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#e7f4ee] text-positive">
                <Database size={19} />
              </span>
              <SectionTitle title="Supabase" description="Authentifizierung und sichere Datenspeicherung." />
            </div>
            {isSupabaseConfigured ? <CheckCircle2 className="text-positive" size={20} /> : <CircleOff className="text-muted" size={20} />}
          </div>
          <div className="rounded-xl bg-soft p-4">
            <p className="text-sm font-bold">{isSupabaseConfigured ? 'Verbunden' : 'Noch nicht verbunden'}</p>
            <p className="mt-1 text-xs leading-5 text-muted">
              {isSupabaseConfigured ? 'Die Umgebungsvariablen sind gesetzt.' : 'VITE_SUPABASE_URL und VITE_SUPABASE_PUBLISHABLE_KEY fehlen noch.'}
            </p>
          </div>
        </Panel>
        <Panel>
          <div className="flex gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-blue-soft text-blue">
              <ShieldCheck size={19} />
            </span>
            <SectionTitle title="Privatsphaere" description="Private Daten bleiben deinem Konto zugeordnet." />
          </div>
          <ul className="space-y-3 text-sm text-muted">
            <li className="flex gap-2"><CheckCircle2 className="mt-0.5 shrink-0 text-positive" size={16} /> Keine oeffentlichen Profile oder sozialen Funktionen</li>
            <li className="flex gap-2"><CheckCircle2 className="mt-0.5 shrink-0 text-positive" size={16} /> Row Level Security im Datenbankschema vorbereitet</li>
            <li className="flex gap-2"><CheckCircle2 className="mt-0.5 shrink-0 text-positive" size={16} /> Keine echten Zugangsdaten im Repository</li>
          </ul>
        </Panel>
        <Panel className="lg:col-span-2">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#e7f4ee] text-positive">
                <Watch size={19} />
              </span>
              <div>
                <SectionTitle title="WHOOP" description="Recovery, Schlaf, Strain und Workouts sicher ueber OAuth synchronisieren." />
                <div className="rounded-xl bg-soft p-4">
                  <p className="text-sm font-bold">{whoop?.connected ? 'Verbunden' : 'Noch nicht verbunden'}</p>
                  <p className="mt-1 text-xs leading-5 text-muted">
                    Letzter Sync: {dateTime(whoop?.connection?.last_sync_at)} · Status: {whoop?.connection?.status ?? 'offen'}
                  </p>
                  {whoop?.connection?.scope && <p className="mt-1 text-xs leading-5 text-muted">Scopes: {whoop.connection.scope}</p>}
                </div>
              </div>
            </div>
            <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
              <button
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-ink px-5 py-3 text-sm font-bold text-white disabled:opacity-60"
                disabled={!user || loadingWhoop}
                onClick={() => void connect()}
                type="button"
              >
                <ExternalLink size={16} /> {whoop?.connected ? 'Neu verbinden' : 'WHOOP verbinden'}
              </button>
              <button
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-white px-5 py-3 text-sm font-bold disabled:opacity-60"
                disabled={!whoop?.connected || loadingWhoop}
                onClick={() => void sync()}
                type="button"
              >
                <RefreshCw className={loadingWhoop ? 'animate-spin' : ''} size={16} /> Synchronisieren
              </button>
            </div>
          </div>
          {whoopMessage && <p className="mt-4 rounded-xl bg-[#e7f4ee] px-4 py-3 text-sm font-semibold text-positive">{whoopMessage}</p>}
          {whoopError && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{whoopError}</p>}
          <p className="mt-4 text-xs leading-5 text-muted">
            Wichtig: WHOOP Client Secret und Supabase Service Role Key werden nur in Netlify Functions genutzt, nicht im Browser.
          </p>
        </Panel>
      </div>
    </>
  )
}
