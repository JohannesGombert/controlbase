import { adminClient, json, requireUser } from './whoop-utils.mjs'

const tablesInDeleteOrder = [
  'nutrition_shopping_items',
  'nutrition_meals',
  'nutrition_week_plans',
  'finance_transactions',
  'finance_budgets',
  'finance_accounts',
  'finance_categories',
  'health_weight_entries',
  'health_profiles',
  'daily_top3',
  'daily_checkins',
  'purchase_waitlist',
  'idea_parking',
  'weekly_reviews',
  'ceo_blocks',
  'whoop_workouts',
  'whoop_daily_metrics',
  'whoop_sync_log',
  'whoop_connections',
]

function canIgnoreMissingTable(error) {
  const text = `${error?.code ?? ''} ${error?.message ?? ''}`.toLowerCase()
  return text.includes('pgrst205') || text.includes('42p01') || text.includes('could not find the table') || text.includes('does not exist')
}

export async function handler(event) {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' })

  try {
    const { user } = await requireUser(event)
    const body = JSON.parse(event.body ?? '{}')
    if (body.confirm !== 'RESET') return json(400, { error: 'Bestaetigung fehlt.' })

    const supabase = await adminClient()
    const deletedTables = []
    const skippedTables = []

    for (const table of tablesInDeleteOrder) {
      const { error } = await supabase.from(table).delete().eq('user_id', user.id)
      if (error) {
        if (canIgnoreMissingTable(error)) {
          skippedTables.push(table)
          continue
        }
        throw new Error(`${table}: ${error.message}`)
      }
      deletedTables.push(table)
    }

    return json(200, { deletedTables, skippedTables })
  } catch (error) {
    return json(500, { error: error.message ?? 'Reset fehlgeschlagen.' })
  }
}
