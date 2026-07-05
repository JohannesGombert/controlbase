import { supabase } from '../lib/supabaseClient'

function client() {
  if (!supabase) throw new Error('Supabase ist nicht konfiguriert.')
  return supabase
}

async function authHeaders() {
  const { data } = await client().auth.getSession()
  const token = data.session?.access_token
  if (!token) throw new Error('Nicht angemeldet.')
  return { authorization: `Bearer ${token}` }
}

export async function resetAllUserData() {
  const response = await fetch('/.netlify/functions/reset-user-data', {
    body: JSON.stringify({ confirm: 'RESET' }),
    headers: { ...(await authHeaders()), 'content-type': 'application/json' },
    method: 'POST',
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error ?? 'Reset fehlgeschlagen.')
  return data as { deletedTables: string[]; skippedTables: string[] }
}
