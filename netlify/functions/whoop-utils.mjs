import crypto from 'node:crypto'
import WebSocket from 'ws'

export const WHOOP_API = 'https://api.prod.whoop.com'
export const WHOOP_SCOPES = 'read:cycles read:recovery read:sleep read:workout'

export function json(statusCode, body) {
  return {
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
    statusCode,
  }
}

let cachedSupabase = null

export async function adminClient() {
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) throw new Error('SUPABASE_URL/VITE_SUPABASE_URL und SUPABASE_SERVICE_ROLE_KEY fehlen.')
  if (cachedSupabase) return cachedSupabase
  if (!globalThis.WebSocket) globalThis.WebSocket = WebSocket
  const { createClient } = await import('@supabase/supabase-js')
  cachedSupabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    realtime: { WebSocket },
  })
  return cachedSupabase
}

export async function requireUser(event) {
  const header = event.headers.authorization ?? event.headers.Authorization ?? ''
  const token = header.replace(/^Bearer\s+/i, '')
  if (!token) throw new Error('Nicht angemeldet.')
  const supabase = await adminClient()
  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data.user) throw new Error('Session ist nicht gueltig.')
  return { supabase, user: data.user }
}

export function siteUrl(event) {
  return process.env.SITE_URL ?? process.env.URL ?? `${event.headers['x-forwarded-proto'] ?? 'https'}://${event.headers.host}`
}

export function redirectUri(event) {
  return process.env.WHOOP_REDIRECT_URI ?? `${siteUrl(event)}/.netlify/functions/whoop-callback`
}

export function stateSecret() {
  return process.env.WHOOP_STATE_SECRET ?? process.env.WHOOP_CLIENT_SECRET ?? 'controlbase-local-state'
}

export function signState(payload) {
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const signature = crypto.createHmac('sha256', stateSecret()).update(encoded).digest('base64url')
  return `${encoded}.${signature}`
}

export function verifyState(state) {
  const [encoded, signature] = String(state ?? '').split('.')
  if (!encoded || !signature) throw new Error('OAuth state fehlt.')
  const expected = crypto.createHmac('sha256', stateSecret()).update(encoded).digest('base64url')
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) throw new Error('OAuth state ist ungueltig.')
  const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'))
  if (!payload.userId || Date.now() - Number(payload.createdAt) > 10 * 60 * 1000) throw new Error('OAuth state ist abgelaufen.')
  return payload
}

export async function whoopTokenRequest(params) {
  const clientId = process.env.WHOOP_CLIENT_ID
  const clientSecret = process.env.WHOOP_CLIENT_SECRET
  if (!clientId || !clientSecret) throw new Error('WHOOP_CLIENT_ID oder WHOOP_CLIENT_SECRET fehlt.')
  const body = new URLSearchParams({ client_id: clientId, client_secret: clientSecret, ...params })
  const response = await fetch(`${WHOOP_API}/oauth/oauth2/token`, {
    body,
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    method: 'POST',
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error_description ?? data.error ?? `WHOOP token request failed: ${response.status}`)
  return data
}

export async function whoopFetch(path, accessToken, params = {}) {
  const url = new URL(`${WHOOP_API}${path}`)
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, String(value))
  })
  const response = await fetch(url, { headers: { authorization: `Bearer ${accessToken}` } })
  if (response.status === 404) return null
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error_description ?? data.error ?? `WHOOP request failed: ${response.status}`)
  return data
}

export async function pagedWhoopFetch(path, accessToken, params = {}) {
  const records = []
  let nextToken = ''
  do {
    const data = await whoopFetch(path, accessToken, { ...params, limit: 25, nextToken })
    records.push(...(data?.records ?? []))
    nextToken = data?.next_token ?? ''
  } while (nextToken)
  return records
}

export async function getFreshConnection(supabase, userId) {
  const { data: connection, error } = await supabase.from('whoop_connections').select('*').eq('user_id', userId).maybeSingle()
  if (error) throw error
  if (!connection?.refresh_token) throw new Error('WHOOP ist noch nicht verbunden.')
  const expiresAt = connection.expires_at ? new Date(connection.expires_at).getTime() : 0
  if (expiresAt > Date.now() + 5 * 60 * 1000) return connection

  const refreshed = await whoopTokenRequest({ grant_type: 'refresh_token', refresh_token: connection.refresh_token })
  const nextConnection = {
    ...connection,
    access_token: refreshed.access_token,
    expires_at: new Date(Date.now() + Number(refreshed.expires_in ?? 3600) * 1000).toISOString(),
    refresh_token: refreshed.refresh_token ?? connection.refresh_token,
    scope: refreshed.scope ?? connection.scope,
    token_type: refreshed.token_type ?? connection.token_type,
  }
  const { error: updateError } = await supabase.from('whoop_connections').update(nextConnection).eq('user_id', userId)
  if (updateError) throw updateError
  return nextConnection
}

export function milliToMinutes(value) {
  return value == null ? null : Math.round(Number(value) / 60000)
}
