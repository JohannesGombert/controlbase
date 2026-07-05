import { json, requireUser } from './whoop-utils.mjs'

export async function handler(event) {
  try {
    const { supabase, user } = await requireUser(event)
    const { data, error } = await supabase
      .from('whoop_connections')
      .select('whoop_user_id, connected_at, last_sync_at, status, scope, expires_at')
      .eq('user_id', user.id)
      .maybeSingle()
    if (error) throw error
    return json(200, { connected: Boolean(data), connection: data ?? null })
  } catch (error) {
    return json(400, { error: error instanceof Error ? error.message : 'WHOOP Status konnte nicht geladen werden.' })
  }
}
