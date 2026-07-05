import { endOfWeek, format, startOfWeek } from 'date-fns'
import { supabase } from '../lib/supabaseClient'

export type TodayForm = {
  weight: string
  sleepQuality: string
  businessTask: string
  healthTask: string
  privateTask: string
  steps: string
  trainingType: string
  alcohol: boolean
  cigarettes: string
  firstCigaretteTime: string
  foodQuality: string
  notes: string
}

export type Purchase = {
  id: string
  item_name: string
  price: number | null
  category: string | null
  reason: string | null
  created_date: string
  earliest_decision_date: string
  status: string
}

export type Idea = {
  id: string
  idea: string
  category: string | null
  importance: number | null
  effort: number | null
  benefit: number | null
  status: string
  created_at: string
}

export type ReviewForm = {
  whatWentWell: string
  whatDistractedMe: string
  whatToStop: string
  goal1: string
  goal2: string
  goal3: string
}

function client() {
  if (!supabase) throw new Error('Supabase ist nicht konfiguriert.')
  return supabase
}

function nullableNumber(value: string) {
  if (!value.trim()) return null
  const number = Number(value.replace(',', '.'))
  return Number.isFinite(number) ? number : null
}

export function localDateKey(date = new Date()) {
  return format(date, 'yyyy-MM-dd')
}

export function currentWeekBounds(date = new Date()) {
  return {
    start: format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
    end: format(endOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
  }
}

export async function loadToday(userId: string): Promise<TodayForm> {
  const date = localDateKey()
  const [{ data: checkin, error: checkinError }, { data: top3, error: top3Error }] = await Promise.all([
    client().from('daily_checkins').select('*').eq('user_id', userId).eq('date', date).maybeSingle(),
    client().from('daily_top3').select('*').eq('user_id', userId).eq('date', date).maybeSingle(),
  ])
  if (checkinError) throw checkinError
  if (top3Error) throw top3Error

  return {
    weight: checkin?.weight?.toString() ?? '',
    sleepQuality: checkin?.sleep_quality ?? '',
    businessTask: top3?.business_task ?? '',
    healthTask: top3?.health_task ?? '',
    privateTask: top3?.private_task ?? '',
    steps: checkin?.steps?.toString() ?? '',
    trainingType: checkin?.training_type ?? 'nein',
    alcohol: checkin?.alcohol ?? false,
    cigarettes: checkin?.cigarettes?.toString() ?? '',
    firstCigaretteTime: checkin?.first_cigarette_time?.slice(0, 5) ?? '',
    foodQuality: checkin?.food_quality ?? '',
    notes: checkin?.notes ?? '',
  }
}

export async function saveToday(userId: string, form: TodayForm) {
  const date = localDateKey()
  const completedTasks = [form.businessTask, form.healthTask, form.privateTask].filter((task) => task.trim()).length
  const [{ error: checkinError }, { error: top3Error }] = await Promise.all([
    client().from('daily_checkins').upsert({
      user_id: userId,
      date,
      weight: nullableNumber(form.weight),
      sleep_quality: form.sleepQuality || null,
      steps: nullableNumber(form.steps),
      training_type: form.trainingType || null,
      alcohol: form.alcohol,
      cigarettes: nullableNumber(form.cigarettes),
      first_cigarette_time: form.firstCigaretteTime || null,
      food_quality: form.foodQuality || null,
      top3_status: completedTasks === 3 ? 'ja' : completedTasks > 0 ? 'teilweise' : 'nein',
      notes: form.notes || null,
    }, { onConflict: 'user_id,date' }),
    client().from('daily_top3').upsert({
      user_id: userId,
      date,
      business_task: form.businessTask || null,
      health_task: form.healthTask || null,
      private_task: form.privateTask || null,
      business_done: Boolean(form.businessTask.trim()),
      health_done: Boolean(form.healthTask.trim()),
      private_done: Boolean(form.privateTask.trim()),
    }, { onConflict: 'user_id,date' }),
  ])
  if (checkinError) throw checkinError
  if (top3Error) throw top3Error
}

export async function listPurchases(userId: string): Promise<Purchase[]> {
  const { data, error } = await client().from('purchase_waitlist').select('*').eq('user_id', userId).order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function createPurchase(userId: string, input: { itemName: string; price: string; category: string; reason: string }) {
  const { error } = await client().from('purchase_waitlist').insert({ user_id: userId, item_name: input.itemName, price: nullableNumber(input.price), category: input.category, reason: input.reason || null })
  if (error) throw error
}

export async function setPurchaseStatus(id: string, status: string) {
  const { error } = await client().from('purchase_waitlist').update({ status }).eq('id', id)
  if (error) throw error
}

export async function listIdeas(userId: string): Promise<Idea[]> {
  const { data, error } = await client().from('idea_parking').select('*').eq('user_id', userId).order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function createIdea(userId: string, input: Omit<Idea, 'id' | 'user_id' | 'status' | 'created_at'>) {
  const { error } = await client().from('idea_parking').insert({ user_id: userId, ...input, status: 'parked' })
  if (error) throw error
}

export async function setIdeaStatus(id: string, status: string) {
  const { error } = await client().from('idea_parking').update({ status }).eq('id', id)
  if (error) throw error
}

export async function loadWeeklyReview(userId: string) {
  const { start, end } = currentWeekBounds()
  const [{ data: review, error: reviewError }, { data: checkins, error: checkinsError }, { data: top3, error: top3Error }] = await Promise.all([
    client().from('weekly_reviews').select('*').eq('user_id', userId).eq('week_start', start).maybeSingle(),
    client().from('daily_checkins').select('*').eq('user_id', userId).gte('date', start).lte('date', end),
    client().from('daily_top3').select('*').eq('user_id', userId).gte('date', start).lte('date', end),
  ])
  if (reviewError) throw reviewError
  if (checkinsError) throw checkinsError
  if (top3Error) throw top3Error

  return {
    form: {
      whatWentWell: review?.what_went_well ?? '',
      whatDistractedMe: review?.what_distracted_me ?? '',
      whatToStop: review?.what_to_stop ?? '',
      goal1: review?.next_week_goal_1 ?? '',
      goal2: review?.next_week_goal_2 ?? '',
      goal3: review?.next_week_goal_3 ?? '',
    } satisfies ReviewForm,
    checkins: checkins ?? [],
    top3: top3 ?? [],
  }
}

export async function saveWeeklyReview(userId: string, form: ReviewForm) {
  const { start, end } = currentWeekBounds()
  const { error } = await client().from('weekly_reviews').upsert({
    user_id: userId,
    week_start: start,
    week_end: end,
    what_went_well: form.whatWentWell || null,
    what_distracted_me: form.whatDistractedMe || null,
    what_to_stop: form.whatToStop || null,
    next_week_goal_1: form.goal1 || null,
    next_week_goal_2: form.goal2 || null,
    next_week_goal_3: form.goal3 || null,
  }, { onConflict: 'user_id,week_start' })
  if (error) throw error
}
