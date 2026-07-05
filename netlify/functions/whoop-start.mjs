import { json, redirectUri, requireUser, signState, WHOOP_API, WHOOP_SCOPES } from './whoop-utils.mjs'

export async function handler(event) {
  try {
    const { user } = await requireUser(event)
    const clientId = process.env.WHOOP_CLIENT_ID
    if (!clientId) throw new Error('WHOOP_CLIENT_ID fehlt.')
    const state = signState({ createdAt: Date.now(), userId: user.id })
    const url = new URL(`${WHOOP_API}/oauth/oauth2/auth`)
    url.searchParams.set('response_type', 'code')
    url.searchParams.set('client_id', clientId)
    url.searchParams.set('redirect_uri', redirectUri(event))
    url.searchParams.set('scope', WHOOP_SCOPES)
    url.searchParams.set('state', state)
    return json(200, { url: url.toString() })
  } catch (error) {
    return json(400, { error: error instanceof Error ? error.message : 'WHOOP Start fehlgeschlagen.' })
  }
}
