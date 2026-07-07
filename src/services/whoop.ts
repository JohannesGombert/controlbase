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

export type WhoopDailyMetric = {
  date: string
  recovery_score: number | null
  hrv_rmssd_milli: number | null
  resting_heart_rate: number | null
  sleep_performance_percentage: number | null
  sleep_efficiency_percentage: number | null
  total_in_bed_minutes: number | null
  total_awake_minutes: number | null
  total_light_sleep_minutes: number | null
  total_slow_wave_sleep_minutes: number | null
  total_rem_sleep_minutes: number | null
  day_strain: number | null
  score_state: string | null
}

export type WhoopWorkout = {
  id: string
  start_time: string | null
  end_time: string | null
  sport_id: number | null
  training_type: string | null
  training_note: string | null
  strain: number | null
  average_heart_rate: number | null
  max_heart_rate: number | null
  kilojoule: number | null
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

export async function loadWhoopHealthData(userId: string) {
  if (!supabase) throw new Error('Supabase ist nicht konfiguriert.')
  const from = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const [{ data: daily, error: dailyError }, { data: workouts, error: workoutError }] = await Promise.all([
    supabase
      .from('whoop_daily_metrics')
      .select('date,recovery_score,hrv_rmssd_milli,resting_heart_rate,sleep_performance_percentage,sleep_efficiency_percentage,total_in_bed_minutes,total_awake_minutes,total_light_sleep_minutes,total_slow_wave_sleep_minutes,total_rem_sleep_minutes,day_strain,score_state')
      .eq('user_id', userId)
      .gte('date', from)
      .order('date', { ascending: true }),
    supabase
      .from('whoop_workouts')
      .select('id,start_time,end_time,sport_id,training_type,training_note,strain,average_heart_rate,max_heart_rate,kilojoule')
      .eq('user_id', userId)
      .gte('start_time', `${from}T00:00:00.000Z`)
      .order('start_time', { ascending: false })
      .limit(20),
  ])
  if (dailyError) throw dailyError
  if (workoutError) throw workoutError
  return { daily: (daily ?? []) as WhoopDailyMetric[], workouts: (workouts ?? []) as WhoopWorkout[] }
}

export async function updateWhoopWorkoutTraining(workoutId: string, input: { trainingType: string; trainingNote?: string }) {
  if (!supabase) throw new Error('Supabase ist nicht konfiguriert.')
  const { error } = await supabase
    .from('whoop_workouts')
    .update({
      training_type: input.trainingType || null,
      training_note: input.trainingNote?.trim() || null,
    })
    .eq('id', workoutId)
  if (error) throw error
}
