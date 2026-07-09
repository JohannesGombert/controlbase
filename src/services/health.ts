import { supabase } from '../lib/supabaseClient'

export type HealthProfile = {
  currentWeight: string
  targetWeight: string
  heightCm: string
  birthDate: string
  sex: string
  weeklyWeightLoss: string
  activityLevel: string
  dietStyle: string
  mealsPerDay: string
  allergies: string
  dislikes: string
  notes: string
}

export const emptyHealthProfile: HealthProfile = { currentWeight: '', targetWeight: '', heightCm: '', birthDate: '', sex: 'unspecified', weeklyWeightLoss: '0.5', activityLevel: 'moderate', dietStyle: 'balanced', mealsPerDay: '3', allergies: '', dislikes: '', notes: '' }

export type WeightEntry = { id: string; measured_on: string; weight: number; notes: string | null }

function client() {
  if (!supabase) throw new Error('Supabase ist nicht konfiguriert.')
  return supabase
}

export async function loadHealthProfile(userId: string): Promise<HealthProfile> {
  const { data, error } = await client().from('health_profiles').select('*').eq('user_id', userId).maybeSingle()
  if (error) throw error
  if (!data) return emptyHealthProfile
  return { currentWeight: data.current_weight?.toString() ?? '', targetWeight: data.target_weight?.toString() ?? '', heightCm: data.height_cm?.toString() ?? '', birthDate: data.birth_date ?? '', sex: data.sex ?? 'unspecified', weeklyWeightLoss: data.weekly_weight_loss?.toString() ?? '0.5', activityLevel: data.activity_level ?? 'moderate', dietStyle: data.diet_style ?? 'balanced', mealsPerDay: data.meals_per_day?.toString() ?? '3', allergies: data.allergies ?? '', dislikes: data.dislikes ?? '', notes: data.notes ?? '' }
}

export async function saveHealthProfile(userId: string, profile: HealthProfile) {
  const { error } = await client().from('health_profiles').upsert({ user_id: userId, current_weight: Number(profile.currentWeight), target_weight: Number(profile.targetWeight), height_cm: Number(profile.heightCm), birth_date: profile.birthDate || null, sex: profile.sex, weekly_weight_loss: Number(profile.weeklyWeightLoss), activity_level: profile.activityLevel, diet_style: profile.dietStyle, meals_per_day: Number(profile.mealsPerDay), allergies: profile.allergies || null, dislikes: profile.dislikes || null, notes: profile.notes || null }, { onConflict: 'user_id' })
  if (error) throw error
}

export async function loadWeightEntries(userId: string): Promise<WeightEntry[]> {
  const { data, error } = await client().from('health_weight_entries').select('*').eq('user_id', userId).order('measured_on', { ascending: true }).limit(90)
  if (error) throw error
  return data ?? []
}

export async function saveWeightEntry(userId: string, measuredOn: string, weight: number) {
  const [{ error: weightError }, { error: checkinError }, { error: profileError }] = await Promise.all([
    client().from('health_weight_entries').upsert({ user_id: userId, measured_on: measuredOn, weight }, { onConflict: 'user_id,measured_on' }),
    client().from('daily_checkins').upsert({ user_id: userId, date: measuredOn, weight }, { onConflict: 'user_id,date' }),
    client().from('health_profiles').update({ current_weight: weight }).eq('user_id', userId),
  ])
  if (weightError) throw weightError
  if (checkinError) throw checkinError
  if (profileError) throw profileError
}
