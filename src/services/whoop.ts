import { supabase } from '../lib/supabaseClient'

export type WhoopConnectionStatus = {
  connected: boolean
  connection: {
    connected_at: string | null
    expires_at: string | null
    last_sync_at: string | null
    scope: string | null
    status: string | null
    whoop_user_id: number | null
  } | null
}

async function authHeaders() {
  if (!supabase) throw new Error('Supabase ist nicht konfiguriert.')
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  if (!token) throw new Error('Bitte zuerst anmelden.')
  return { authorization: `Bearer ${token}` }
}

export async function loadWhoopStatus(): Promise<WhoopConnectionStatus> {
  const response = await fetch('/.netlify/functions/whoop-status', { headers: await authHeaders() })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error ?? 'WHOOP Status konnte nicht geladen werden.')
  return data
}

export async function startWhoopConnection() {
  const response = await fetch('/.netlify/functions/whoop-start', { headers: await authHeaders() })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error ?? 'WHOOP Verbindung konnte nicht gestartet werden.')
  window.location.href = data.url
}

export async function syncWhoop() {
  const response = await fetch('/.netlify/functions/whoop-sync', { headers: await authHeaders(), method: 'POST' })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error ?? 'WHOOP Sync fehlgeschlagen.')
  return data as { daily: number; workouts: number }
}
