import { addDays, format, startOfWeek } from 'date-fns'
import { supabase } from '../lib/supabaseClient'
import type { HealthProfile } from './health'

export type Meal = { id: string; meal_date: string; meal_type: string; title: string; calories: number; protein: number; ingredients: string[]; notes: string | null }
export type WeekPlan = { id: string; week_start: string; calorie_target: number; protein_target: number; meals: Meal[] }

const meals = {
  balanced: [
    ['Skyr-Bowl mit Beeren', 430, 35, ['300 g Skyr', '100 g Beeren', '40 g Haferflocken', '15 g Nüsse']],
    ['Poulet-Reis-Gemüse-Bowl', 650, 48, ['180 g Pouletbrust', '90 g Reis', '250 g Gemüse', '10 ml Olivenöl']],
    ['Lachs mit Kartoffeln und Brokkoli', 680, 45, ['180 g Lachs', '300 g Kartoffeln', '250 g Brokkoli']],
    ['Omelette mit Vollkornbrot', 520, 36, ['3 Eier', '150 g Eiklar', '2 Scheiben Vollkornbrot', 'Tomaten']],
    ['Rindshack mit Couscous und Salat', 670, 46, ['180 g mageres Rindshack', '90 g Couscous', '200 g Salat']],
  ],
  vegetarian: [
    ['Skyr-Bowl mit Beeren', 430, 35, ['300 g Skyr', '100 g Beeren', '40 g Haferflocken']],
    ['Linsen-Curry mit Reis', 650, 32, ['120 g Linsen', '80 g Reis', '250 g Gemüse', 'Kokosmilch light']],
    ['Tofu-Gemüse-Pfanne', 620, 38, ['200 g Tofu', '250 g Gemüse', '90 g Reis']],
    ['Eier-Shakshuka', 540, 34, ['3 Eier', '200 g Tomaten', 'Paprika', '2 Scheiben Vollkornbrot']],
  ],
  vegan: [
    ['Protein-Porridge', 480, 32, ['70 g Haferflocken', '30 g veganes Proteinpulver', 'Banane']],
    ['Linsen-Curry mit Reis', 650, 30, ['120 g Linsen', '80 g Reis', '250 g Gemüse']],
    ['Tofu-Gemüse-Pfanne', 620, 38, ['220 g Tofu', '250 g Gemüse', '90 g Reis']],
    ['Kichererbsen-Pasta', 610, 34, ['100 g Kichererbsenpasta', 'Tomatensauce', '200 g Gemüse']],
  ],
}

function client() { if (!supabase) throw new Error('Supabase fehlt'); return supabase }
export function weekStart(date = new Date()) { return startOfWeek(date, { weekStartsOn: 1 }) }
export function calculateTargets(profile: HealthProfile) {
  const weight=Number(profile.currentWeight), target=Number(profile.targetWeight), height=Number(profile.heightCm)
  const age=profile.birthDate?Math.floor((Date.now()-new Date(profile.birthDate).getTime())/31557600000):0
  if(!weight||!height||!age||!['male','female'].includes(profile.sex)) return null
  const bmr=10*weight+6.25*height-5*age+(profile.sex==='male'?5:-161)
  const factor:Record<string,number>={low:1.2,light:1.375,moderate:1.55,high:1.725,very_high:1.9}
  const deficit=Math.min(1000,Number(profile.weeklyWeightLoss)*7700/7)
  return { calories:Math.round(Math.max(bmr*1.05,bmr*(factor[profile.activityLevel]??1.55)-deficit)/50)*50, protein:Math.round((target||weight)*1.4) }
}
export async function loadWeekPlan(userId:string,date:Date):Promise<WeekPlan|null>{const start=format(weekStart(date),'yyyy-MM-dd');const{data:plan,error}=await client().from('nutrition_week_plans').select('*').eq('user_id',userId).eq('week_start',start).maybeSingle();if(error)throw error;if(!plan)return null;const{data:rows,error:mealError}=await client().from('nutrition_meals').select('*').eq('plan_id',plan.id).order('meal_date').order('meal_type');if(mealError)throw mealError;return{...plan,meals:rows??[]} as WeekPlan}
export async function generateWeekPlan(userId:string,date:Date,profile:HealthProfile){const targets=calculateTargets(profile);if(!targets)throw new Error('Profil unvollständig');const start=weekStart(date);const{data:plan,error}=await client().from('nutrition_week_plans').upsert({user_id:userId,week_start:format(start,'yyyy-MM-dd'),calorie_target:targets.calories,protein_target:targets.protein},{onConflict:'user_id,week_start'}).select().single();if(error)throw error;await client().from('nutrition_meals').delete().eq('plan_id',plan.id);const style=profile.dietStyle==='vegan'?'vegan':profile.dietStyle==='vegetarian'?'vegetarian':'balanced';const pool=meals[style];const rows=[];for(let day=0;day<7;day++){const dateKey=format(addDays(start,day),'yyyy-MM-dd');const batch=day<3?0:day<5?1:2;const breakfast=pool[batch%pool.length],lunch=pool[(batch+1)%pool.length],dinner=pool[(batch+2)%pool.length];for(const[type,item]of [['breakfast',breakfast],['lunch',lunch],['dinner',dinner]] as const)rows.push({user_id:userId,plan_id:plan.id,meal_date:dateKey,meal_type:type,title:item[0],calories:item[1],protein:item[2],ingredients:item[3],notes:`Meal-Prep Block ${batch+1}`})}const{error:insertError}=await client().from('nutrition_meals').insert(rows);if(insertError)throw insertError}
