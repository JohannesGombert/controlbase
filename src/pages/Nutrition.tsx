import { addDays, format } from 'date-fns'
import { de } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, RefreshCw, ShoppingCart, Utensils } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import { MealCard } from '../components/MealCard'
import { PageHeader } from '../components/PageHeader'
import { Panel } from '../components/Panel'
import { loadHealthProfile, type HealthProfile } from '../services/health'
import { generateWeekPlan, loadWeekPlan, weekStart, type WeekPlan } from '../services/nutrition'

export function Nutrition() {
  const { user } = useAuth()
  const [date, setDate] = useState(weekStart())
  const [profile, setProfile] = useState<HealthProfile | null>(null)
  const [plan, setPlan] = useState<WeekPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const [profileData, weekPlan] = await Promise.all([loadHealthProfile(user.id), loadWeekPlan(user.id, date)])
      setProfile(profileData)
      setPlan(weekPlan)
      setError('')
    } catch {
      setError('Ernaehrungsplan konnte nicht geladen werden. Bitte meal_plan_schema.sql in Supabase ausfuehren.')
    } finally {
      setLoading(false)
    }
  }, [date, user])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const generate = async () => {
    if (!user || !profile) return
    setLoading(true)
    try {
      await generateWeekPlan(user.id, date, profile)
      await refresh()
    } catch {
      setError('Plan konnte nicht erstellt werden. Bitte vervollstaendige zuerst dein Abnehmprofil.')
      setLoading(false)
    }
  }

  const days = Array.from({ length: 7 }, (_, index) => addDays(weekStart(date), index))

  return (
    <>
      <PageHeader
        action={
          <div className="flex items-center rounded-xl border border-line bg-control-surface p-1">
            <button
              aria-label="Vorherige Woche"
              className="grid size-9 place-items-center"
              onClick={() => setDate(addDays(date, -7))}
              type="button"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="px-2 text-xs font-bold">
              {format(weekStart(date), 'dd.MM.')} - {format(addDays(weekStart(date), 6), 'dd.MM.')}
            </span>
            <button
              aria-label="Naechste Woche"
              className="grid size-9 place-items-center"
              onClick={() => setDate(addDays(date, 7))}
              type="button"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        }
        description="Meal-Prep-Bloecke fuer zwei bis drei Tage: einmal planen, weniger entscheiden."
        eyebrow="Gesundheit & Ernaehrung"
        title="Wochenplan"
      />

      {error && <p className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-status-danger">{error}</p>}

      <div className="mb-5 grid gap-4 sm:grid-cols-[1fr_auto_auto]">
        <Panel className="p-4 sm:p-5">
          <div className="flex items-center gap-5">
            <span className="grid size-11 place-items-center rounded-xl bg-[#e7f4ee] text-positive">
              <Utensils size={20} />
            </span>
            <div>
              <p className="text-xs text-muted">Tagesrahmen</p>
              <p className="mt-1 font-display text-2xl font-semibold">
                {plan ? `${plan.calorie_target} kcal · ${plan.protein_target} g Protein` : 'Noch kein Plan'}
              </p>
            </div>
          </div>
        </Panel>
        <Link
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-control-surface px-5 py-3 text-sm font-bold"
          to="/einkaufsliste"
        >
          <ShoppingCart size={17} /> Einkaufsliste
        </Link>
        <button
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-control-deep px-5 py-3 text-sm font-bold text-white disabled:opacity-60"
          disabled={loading}
          onClick={() => void generate()}
          type="button"
        >
          <RefreshCw size={17} />
          {plan ? 'Woche neu planen' : 'Wochenplan erstellen'}
        </button>
      </div>

      {loading ? (
        <Panel>
          <p className="text-sm text-muted">Plan wird geladen ...</p>
        </Panel>
      ) : plan ? (
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {days.map((day) => {
            const key = format(day, 'yyyy-MM-dd')
            return (
              <Panel key={key}>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">
                  {format(day, 'EEEE', { locale: de })}
                </p>
                <p className="mt-1 text-sm text-muted">{format(day, 'dd. MMMM', { locale: de })}</p>
                <div className="mt-4 space-y-3">
                  {plan.meals
                    .filter((meal) => meal.meal_date === key)
                    .map((meal) => (
                      <MealCard key={meal.id} meal={meal} onChanged={refresh} />
                    ))}
                </div>
              </Panel>
            )
          })}
        </div>
      ) : (
        <Panel>
          <div className="py-16 text-center">
            <Utensils className="mx-auto text-muted" size={28} />
            <h2 className="mt-4 font-display text-2xl font-semibold">Noch kein Wochenplan</h2>
            <p className="mt-2 text-sm text-muted">Erstelle auf Basis deines Abnehmprofils den ersten Entwurf.</p>
          </div>
        </Panel>
      )}

      <p className="mt-5 text-xs leading-5 text-muted">
        Kalorien und Makros sind Schaetzwerte. Passe Portionsgroessen an Hunger, Vertraeglichkeit und professionelle
        Empfehlungen an.
      </p>
    </>
  )
}
