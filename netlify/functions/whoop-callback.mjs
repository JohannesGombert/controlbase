import { adminClient, redirectUri, siteUrl, verifyState, whoopTokenRequest } from './whoop-utils.mjs'

export async function handler(event) {
  const appUrl = siteUrl(event)
  try {
    const params = event.queryStringParameters ?? {}
    if (params.error) throw new Error(params.error_description ?? params.error)
    if (!params.code) throw new Error('WHOOP hat keinen Code geliefert.')
    const state = verifyState(params.state)
    const token = await whoopTokenRequest({
      code: params.code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri(event),
    })
    const supabase = adminClient()
    const { error } = await supabase.from('whoop_connections').upsert(
      {
        access_token: token.access_token,
        connected_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + Number(token.expires_in ?? 3600) * 1000).toISOString(),
        refresh_token: token.refresh_token,
        scope: token.scope,
        status: 'connected',
        token_type: token.token_type,
        user_id: state.userId,
        whoop_user_id: null,
      },
      { onConflict: 'user_id' },
    )
    if (error) throw error
    return {
      headers: { location: `${appUrl}/einstellungen?whoop=connected` },
      statusCode: 302,
    }
  } catch (error) {
    return {
      headers: { location: `${appUrl}/einstellungen?whoop=error&message=${encodeURIComponent(error instanceof Error ? error.message : 'WHOOP Verbindung fehlgeschlagen')}` },
      statusCode: 302,
    }
  }
}
