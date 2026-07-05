import { addDays, format, startOfWeek } from 'date-fns'
import { supabase } from '../lib/supabaseClient'
import type { HealthProfile } from './health'

export type Meal = {
  id: string
  meal_date: string
  meal_type: string
  title: string
  calories: number
  protein: number
  ingredients: string[]
  notes: string | null
}
export type WeekPlan = { id: string; week_start: string; calorie_target: number; protein_target: number; meals: Meal[] }

type MealTemplate = [string, number, number, string[]]
type MealPool = { breakfast: MealTemplate[]; lunch: MealTemplate[]; dinner: MealTemplate[] }
type DietStyle = 'balanced' | 'vegetarian' | 'vegan'

const balancedBreakfast: MealTemplate[] = [
  ['Skyr-Bowl mit Beeren', 430, 35, ['300 g Skyr', '100 g Beeren', '40 g Haferflocken', '15 g Nuesse']],
  ['Protein-Porridge mit Banane', 480, 38, ['70 g Haferflocken', '30 g Whey', '1 Banane', '10 g Erdnussbutter']],
  ['Eier-Omelette mit Vollkornbrot', 520, 36, ['3 Eier', '150 g Eiklar', '2 Scheiben Vollkornbrot', 'Tomaten']],
  ['Huettenkaese-Toast mit Avocado', 510, 34, ['200 g Huettenkaese', '2 Scheiben Vollkornbrot', '80 g Avocado', 'Gurke']],
  ['Quark-Beeren-Crunch', 450, 42, ['300 g Magerquark', '120 g Beeren', '30 g Granola', '10 g Honig']],
  ['Ruehrei mit Pouletaufschnitt', 500, 41, ['2 Eier', '120 g Eiklar', '80 g Pouletaufschnitt', '2 Scheiben Roggenbrot']],
  ['Protein-Pancakes', 520, 40, ['60 g Haferflocken', '30 g Whey', '2 Eier', '100 g Beeren']],
  ['Lachs-Frischkaese-Bagel light', 540, 36, ['1 Vollkornbagel', '80 g Raeucherlachs', '60 g Frischkaese light', 'Salat']],
  ['Overnight-Oats Apfel-Zimt', 470, 32, ['60 g Haferflocken', '250 g Skyr', '1 Apfel', 'Zimt']],
  ['Breakfast-Burrito', 560, 42, ['1 Vollkorn-Wrap', '2 Eier', '100 g Poulet', 'Peperoni', 'Salsa']],
]

const balancedLunch: MealTemplate[] = [
  ['Poulet-Reis-Gemuese-Bowl', 650, 48, ['180 g Pouletbrust', '90 g Reis', '250 g Gemuese', '10 ml Olivenoel']],
  ['Rindshack mit Couscous und Salat', 670, 46, ['180 g mageres Rindshack', '90 g Couscous', '200 g Salat']],
  ['Thon-Kartoffel-Salat', 610, 45, ['1 Dose Thon', '300 g Kartoffeln', '150 g Bohnen', 'Joghurt-Dressing']],
  ['Turkey-Chili mit Reis', 690, 52, ['180 g Putenhack', '120 g Bohnen', '80 g Reis', 'Tomaten']],
  ['Poulet-Fajita-Bowl', 660, 49, ['180 g Poulet', '1 Vollkorn-Wrap', 'Peperoni', 'Mais', 'Salsa']],
  ['Beef-Teriyaki mit Brokkoli', 700, 50, ['180 g Rindstreifen', '90 g Reis', '250 g Brokkoli', 'Teriyaki light']],
  ['Shrimp-Nudel-Bowl', 620, 46, ['200 g Crevetten', '90 g Reisnudeln', '250 g Gemuese', 'Sojasauce']],
  ['Poulet-Suesskartoffel-Box', 680, 48, ['180 g Poulet', '350 g Suesskartoffeln', '200 g Zucchini', '10 ml Olivenoel']],
  ['Hackbaellchen mit Tomatenpasta', 720, 50, ['180 g mageres Rind', '90 g Vollkornpasta', 'Tomatensauce', 'Salat']],
  ['Greek-Chicken-Salat', 600, 47, ['180 g Poulet', '250 g Salat', '80 g Feta light', '1 Pitabrot']],
]

const balancedDinner: MealTemplate[] = [
  ['Lachs mit Kartoffeln und Brokkoli', 680, 45, ['180 g Lachs', '300 g Kartoffeln', '250 g Brokkoli']],
  ['Poulet-Curry light', 690, 48, ['180 g Poulet', '80 g Reis', '250 g Gemuese', 'Kokosmilch light']],
  ['Kabeljau mit Ofengemuese', 590, 44, ['220 g Kabeljau', '350 g Ofengemuese', '200 g Kartoffeln']],
  ['Rind-Steak mit Quinoa', 720, 52, ['180 g Rindsteak', '90 g Quinoa', '200 g Gemuese']],
  ['Puten-Geschnetzeltes mit Spaetzli light', 710, 50, ['180 g Pute', '180 g Spaetzli', 'Champignons', 'Joghurt-Sauce']],
  ['Lachs-Teriyaki mit Reis', 720, 47, ['180 g Lachs', '90 g Reis', '250 g Pak Choi', 'Teriyaki light']],
  ['Poulet-Blech mit Kartoffeln', 700, 50, ['200 g Poulet', '300 g Kartoffeln', 'Karotten', '10 ml Olivenoel']],
  ['Gefuellte Peperoni mit Rind', 650, 45, ['2 Peperoni', '160 g Rindshack', '70 g Reis', 'Tomaten']],
  ['Protein-Burger-Bowl', 680, 50, ['180 g Rindspatty light', '300 g Kartoffelwedges', 'Salat', 'Joghurt-Sauce']],
  ['Eiweiss-Flammkuchen', 620, 42, ['1 Protein-Wrap', '120 g Quark', '80 g Schinken', 'Zwiebeln']],
]

const vegetarianBreakfast: MealTemplate[] = [
  ['Skyr-Bowl mit Beeren', 430, 35, ['300 g Skyr', '100 g Beeren', '40 g Haferflocken']],
  ['Protein-Porridge mit Banane', 480, 38, ['70 g Haferflocken', '30 g Whey', '1 Banane']],
  ['Eier-Shakshuka', 540, 34, ['3 Eier', '200 g Tomaten', 'Paprika', '2 Scheiben Vollkornbrot']],
  ['Quark-Beeren-Crunch', 450, 42, ['300 g Magerquark', '120 g Beeren', '30 g Granola']],
  ['Huettenkaese-Toast mit Avocado', 510, 34, ['200 g Huettenkaese', '2 Scheiben Vollkornbrot', 'Avocado']],
  ['Protein-Pancakes', 520, 40, ['60 g Haferflocken', '30 g Whey', '2 Eier', 'Beeren']],
  ['Overnight-Oats Apfel-Zimt', 470, 32, ['60 g Haferflocken', '250 g Skyr', '1 Apfel']],
  ['Feta-Omelette mit Spinat', 520, 34, ['3 Eier', '60 g Feta light', 'Spinat', '1 Scheibe Brot']],
  ['Cottage-Cheese-Bowl herzhaft', 480, 38, ['250 g Huettenkaese', 'Tomaten', 'Gurke', '2 Scheiben Knackebrot']],
  ['Joghurt-Chia-Bowl', 460, 31, ['250 g griechischer Joghurt', '20 g Chiasamen', 'Beeren', '30 g Haferflocken']],
]

const vegetarianLunch: MealTemplate[] = [
  ['Linsen-Curry mit Reis', 650, 32, ['120 g Linsen', '80 g Reis', '250 g Gemuese', 'Kokosmilch light']],
  ['Tofu-Gemuese-Pfanne', 620, 38, ['200 g Tofu', '250 g Gemuese', '90 g Reis']],
  ['Halloumi-Couscous-Salat', 680, 35, ['120 g Halloumi light', '90 g Couscous', '250 g Salat', 'Tomaten']],
  ['Kichererbsen-Pasta', 610, 34, ['100 g Kichererbsenpasta', 'Tomatensauce', '200 g Gemuese']],
  ['Burrito-Bowl mit Bohnen', 660, 32, ['150 g Bohnen', '80 g Reis', 'Mais', 'Salsa', 'Skyr-Dip']],
  ['Tempeh-Suesskartoffel-Box', 690, 38, ['180 g Tempeh', '300 g Suesskartoffeln', 'Brokkoli']],
  ['Paneer-Spinat-Curry', 700, 40, ['160 g Paneer light', 'Spinat', '80 g Reis', 'Tomaten']],
  ['Falafel-Bowl light', 650, 30, ['5 Falafel', '250 g Salat', '80 g Couscous', 'Joghurt-Sauce']],
  ['Eier-Reis-Gemuese-Pfanne', 640, 34, ['3 Eier', '90 g Reis', '250 g Gemuese', 'Sojasauce']],
  ['Mozzarella-Pesto-Pasta light', 690, 36, ['90 g Vollkornpasta', '125 g Mozzarella light', 'Tomaten', 'Pesto light']],
]

const vegetarianDinner: MealTemplate[] = [
  ['Vegetarisches Chili', 660, 34, ['150 g Bohnen', '100 g Mais', 'Tomaten', '80 g Reis']],
  ['Tofu-Kokos-Curry', 680, 38, ['220 g Tofu', '250 g Gemuese', '80 g Reis', 'Kokosmilch light']],
  ['Auberginen-Linsen-Lasagne', 700, 36, ['120 g Linsen', 'Aubergine', 'Tomatensauce', 'Mozzarella light']],
  ['Protein-Spinat-Knoepfli', 690, 40, ['180 g Knoepfli', '250 g Spinat', '200 g Skyr-Sauce', 'Kaese light']],
  ['Frittata mit Kartoffeln', 620, 35, ['3 Eier', '250 g Kartoffeln', 'Gemuese', 'Salat']],
  ['Gnocchi-Gemuese-Pfanne', 680, 32, ['250 g Gnocchi', '250 g Gemuese', '150 g Huettenkaese']],
  ['Quinoa-Feta-Bowl', 650, 34, ['90 g Quinoa', '80 g Feta light', 'Kichererbsen', 'Salat']],
  ['Linsen-Bolognese', 680, 38, ['120 g Linsen', '90 g Vollkornpasta', 'Tomatensauce', 'Parmesan']],
  ['Shakshuka mit Bohnen', 640, 36, ['3 Eier', '120 g Bohnen', 'Tomaten', '2 Scheiben Brot']],
  ['Ofengemuese mit Tzatziki und Ei', 620, 34, ['400 g Ofengemuese', '250 g Skyr-Tzatziki', '2 Eier']],
]

const veganBreakfast: MealTemplate[] = [
  ['Protein-Porridge', 480, 32, ['70 g Haferflocken', '30 g veganes Proteinpulver', 'Banane']],
  ['Soja-Skyr-Bowl mit Beeren', 450, 31, ['300 g Soja-Skyr', '100 g Beeren', '40 g Haferflocken']],
  ['Tofu-Scramble mit Brot', 520, 34, ['220 g Tofu', '2 Scheiben Vollkornbrot', 'Spinat', 'Tomaten']],
  ['Overnight-Oats vegan', 470, 30, ['70 g Haferflocken', '250 ml Sojadrink', '30 g Proteinpulver', 'Apfel']],
  ['Chia-Protein-Pudding', 460, 31, ['25 g Chiasamen', '250 g Soja-Joghurt', '30 g Proteinpulver', 'Beeren']],
  ['Veganer Breakfast-Wrap', 560, 36, ['1 Vollkorn-Wrap', '180 g Tofu', 'Bohnen', 'Salsa']],
  ['Erdnuss-Bananen-Oats', 520, 32, ['70 g Haferflocken', '30 g Proteinpulver', 'Banane', '15 g Erdnussbutter']],
  ['Quinoa-Fruehstuecksbowl', 500, 28, ['80 g Quinoa', '250 g Soja-Joghurt', 'Beeren', 'Nuesse']],
  ['Smoothie-Bowl Protein', 480, 33, ['30 g Proteinpulver', 'Banane', 'Beeren', '40 g Haferflocken']],
  ['Avocado-Tofu-Toast', 540, 30, ['2 Scheiben Vollkornbrot', '150 g Raeuchertofu', '80 g Avocado']],
]

const veganLunch: MealTemplate[] = [
  ['Linsen-Curry mit Reis', 650, 30, ['120 g Linsen', '80 g Reis', '250 g Gemuese']],
  ['Tofu-Gemuese-Pfanne', 620, 38, ['220 g Tofu', '250 g Gemuese', '90 g Reis']],
  ['Kichererbsen-Pasta', 610, 34, ['100 g Kichererbsenpasta', 'Tomatensauce', '200 g Gemuese']],
  ['Tempeh-Bowl mit Suesskartoffeln', 690, 40, ['180 g Tempeh', '300 g Suesskartoffeln', 'Brokkoli']],
  ['Bohnen-Burrito-Bowl', 660, 32, ['180 g Bohnen', '80 g Reis', 'Mais', 'Salsa']],
  ['Seitan-Gyros mit Kartoffeln', 680, 45, ['180 g Seitan', '300 g Kartoffeln', 'Salat', 'Soja-Joghurt-Sauce']],
  ['Edamame-Nudel-Bowl', 640, 36, ['100 g Soba-Nudeln', '150 g Edamame', 'Gemuese', 'Sojasauce']],
  ['Tofu-Satay mit Reis', 690, 39, ['220 g Tofu', '80 g Reis', 'Gemuese', 'Satay-Sauce light']],
  ['Linsen-Quinoa-Salat', 620, 34, ['120 g Linsen', '80 g Quinoa', 'Salat', 'Tahini-Zitronen-Dressing']],
  ['Vegan Chili sin Carne', 660, 35, ['150 g Bohnen', '100 g Sojahack', 'Tomaten', 'Mais']],
]

const veganDinner: MealTemplate[] = [
  ['Tofu-Kokos-Curry', 680, 38, ['220 g Tofu', '250 g Gemuese', '80 g Reis', 'Kokosmilch light']],
  ['Linsen-Bolognese', 680, 36, ['130 g Linsen', '90 g Vollkornpasta', 'Tomatensauce']],
  ['Seitan-Steak mit Kartoffeln', 700, 48, ['200 g Seitan', '320 g Kartoffeln', 'Gruene Bohnen']],
  ['Kichererbsen-Spinat-Eintopf', 620, 32, ['180 g Kichererbsen', 'Spinat', 'Tomaten', '1 Pitabrot']],
  ['Tempeh-Teriyaki mit Brokkoli', 690, 40, ['180 g Tempeh', '90 g Reis', '250 g Brokkoli']],
  ['Vegane Protein-Lasagne', 720, 42, ['100 g Sojahack', 'Lasagneplatten', 'Tomaten', 'Cashew-Sauce light']],
  ['Falafel-Teller light', 650, 30, ['5 Falafel', '250 g Salat', '80 g Couscous', 'Hummus light']],
  ['Tofu-Blech mit Gemuese', 640, 38, ['220 g Tofu', '400 g Ofengemuese', '10 ml Olivenoel']],
  ['Bohnen-Suesskartoffel-Pfanne', 660, 32, ['180 g Bohnen', '300 g Suesskartoffeln', 'Peperoni']],
  ['Thai-Curry mit Edamame', 690, 37, ['150 g Edamame', '250 g Gemuese', '80 g Reis', 'Kokosmilch light']],
]

const meals: Record<DietStyle, MealPool> = {
  balanced: { breakfast: balancedBreakfast, lunch: balancedLunch, dinner: balancedDinner },
  vegetarian: { breakfast: vegetarianBreakfast, lunch: vegetarianLunch, dinner: vegetarianDinner },
  vegan: { breakfast: veganBreakfast, lunch: veganLunch, dinner: veganDinner },
}

function client() { if (!supabase) throw new Error('Supabase fehlt'); return supabase }
export function weekStart(date = new Date()) { return startOfWeek(date, { weekStartsOn: 1 }) }
export function calculateTargets(profile: HealthProfile) {
  const weight = Number(profile.currentWeight), target = Number(profile.targetWeight), height = Number(profile.heightCm)
  const age = profile.birthDate ? Math.floor((Date.now() - new Date(profile.birthDate).getTime()) / 31557600000) : 0
  if (!weight || !height || !age || !['male', 'female'].includes(profile.sex)) return null
  const bmr = 10 * weight + 6.25 * height - 5 * age + (profile.sex === 'male' ? 5 : -161)
  const factor: Record<string, number> = { low: 1.2, light: 1.375, moderate: 1.55, high: 1.725, very_high: 1.9 }
  const deficit = Math.min(1000, Number(profile.weeklyWeightLoss) * 7700 / 7)
  return { calories: Math.round(Math.max(bmr * 1.05, bmr * (factor[profile.activityLevel] ?? 1.55) - deficit) / 50) * 50, protein: Math.round((target || weight) * 1.4) }
}

function weekOffset(date: Date) {
  return Math.floor(weekStart(date).getTime() / (7 * 24 * 60 * 60 * 1000))
}

function pick(pool: MealTemplate[], offset: number) {
  return pool[((offset % pool.length) + pool.length) % pool.length]
}

export async function loadWeekPlan(userId: string, date: Date): Promise<WeekPlan | null> {
  const start = format(weekStart(date), 'yyyy-MM-dd')
  const { data: plan, error } = await client().from('nutrition_week_plans').select('*').eq('user_id', userId).eq('week_start', start).maybeSingle()
  if (error) throw error
  if (!plan) return null
  const { data: rows, error: mealError } = await client().from('nutrition_meals').select('*').eq('plan_id', plan.id).order('meal_date').order('meal_type')
  if (mealError) throw mealError
  return { ...plan, meals: rows ?? [] } as WeekPlan
}

export async function generateWeekPlan(userId: string, date: Date, profile: HealthProfile) {
  const targets = calculateTargets(profile)
  if (!targets) throw new Error('Profil unvollstaendig')
  const start = weekStart(date)
  const { data: plan, error } = await client()
    .from('nutrition_week_plans')
    .upsert({ user_id: userId, week_start: format(start, 'yyyy-MM-dd'), calorie_target: targets.calories, protein_target: targets.protein }, { onConflict: 'user_id,week_start' })
    .select()
    .single()
  if (error) throw error
  await client().from('nutrition_meals').delete().eq('plan_id', plan.id)

  const style: DietStyle = profile.dietStyle === 'vegan' ? 'vegan' : profile.dietStyle === 'vegetarian' ? 'vegetarian' : 'balanced'
  const pool = meals[style]
  const offset = weekOffset(start)
  const rows = []

  for (let day = 0; day < 7; day += 1) {
    const dateKey = format(addDays(start, day), 'yyyy-MM-dd')
    const batch = day < 3 ? 0 : day < 5 ? 1 : 2
    const recipeOffset = offset * 3 + batch
    const breakfast = pick(pool.breakfast, recipeOffset)
    const lunch = pick(pool.lunch, recipeOffset + 1)
    const dinner = pick(pool.dinner, recipeOffset + 2)
    for (const [type, item] of [['breakfast', breakfast], ['lunch', lunch], ['dinner', dinner]] as const) {
      rows.push({
        user_id: userId,
        plan_id: plan.id,
        meal_date: dateKey,
        meal_type: type,
        title: item[0],
        calories: item[1],
        protein: item[2],
        ingredients: item[3],
        notes: `Meal-Prep Block ${batch + 1}`,
      })
    }
  }
  const { error: insertError } = await client().from('nutrition_meals').insert(rows)
  if (insertError) throw insertError
}
