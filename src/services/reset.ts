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

async function resetUserData(scope: 'all' | 'finance', confirm: string) {
  const response = await fetch('/.netlify/functions/reset-user-data', {
    body: JSON.stringify({ confirm, scope }),
    headers: { ...(await authHeaders()), 'content-type': 'application/json' },
    method: 'POST',
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error ?? 'Reset fehlgeschlagen.')
  return data as { deletedTables: string[]; scope: 'all' | 'finance'; skippedTables: string[] }
}

export async function resetAllUserData() {
  return resetUserData('all', 'RESET')
}

export async function resetFinanceData() {
  return resetUserData('finance', 'FINANZEN')
}
