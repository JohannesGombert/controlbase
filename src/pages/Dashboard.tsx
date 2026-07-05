import { ArrowRight, Check, Footprints, GlassWater, Scale, ShoppingBag, Target, TimerReset } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import { PageHeader } from '../components/PageHeader'
import { Panel } from '../components/Panel'
import { loadToday, type TodayForm } from '../services/data'

const emptyToday: TodayForm = {
  weight: '',
  sleepQuality: '',
  businessTask: '',
  healthTask: '',
  privateTask: '',
  steps: '',
  trainingType: 'nein',
  alcohol: false,
  cigarettes: '',
  firstCigaretteTime: '',
  foodQuality: '',
  notes: '',
}

const focusItems = [
  { label: 'Beruf', key: 'businessTask' },
  { label: 'Gesundheit', key: 'healthTask' },
  { label: 'Privat & Finanzen', key: 'privateTask' },
] as const

export function Dashboard() {
  const { user } = useAuth()
  const [todayData, setTodayData] = useState<TodayForm>(emptyToday)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const today = new Intl.DateTimeFormat('de-CH', { weekday: 'long', day: '2-digit', month: 'long' }).format(new Date())
  const completedFocusCount = focusItems.filter((item) => todayData[item.key].trim()).length
  const hasCheckIn = completedFocusCount > 0 || Boolean(todayData.weight || todayData.sleepQuality || todayData.steps || todayData.notes)
  const metrics = useMemo(() => [
    { label: 'Gewicht', value: todayData.weight ? `${todayData.weight} kg` : '–', note: todayData.weight ? 'heute erfasst' : 'Noch keine Daten', icon: Scale },
    { label: 'Training', value: todayData.trainingType && todayData.trainingType !== 'nein' ? '1' : '0', note: todayData.trainingType && todayData.trainingType !== 'nein' ? todayData.trainingType : 'heute', icon: Footprints },
    { label: 'Alkohol', value: todayData.alcohol ? 'Ja' : 'Nein', note: 'heute', icon: GlassWater },
    { label: 'Tagesergebnisse', value: `${completedFocusCount}/3`, note: 'Bereiche dokumentiert', icon: Target },
  ], [completedFocusCount, todayData])

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')
    void loadToday(user.id)
      .then(setTodayData)
      .catch(() => setError('Heutige Daten konnten nicht geladen werden.'))
      .finally(() => setLoading(false))
  }, [user])

  return (
    <>
      <PageHeader eyebrow={today} title="Heute auf Kurs?" description="Ein klarer Blick auf das, was heute zählt. Kein Urteil – nur Standortbestimmung." />

      <div className="grid gap-5 xl:grid-cols-[1.45fr_0.8fr]">
        <Panel className="relative overflow-hidden bg-ink text-white">
          <div className="absolute -right-14 -top-20 size-64 rounded-full border-[42px] border-white/5" />
          <div className="relative flex min-h-64 flex-col justify-between">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-warning/15 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-warning-light">
                <span className="size-2 rounded-full bg-warning-light" /> {hasCheckIn ? 'Im Plan sichtbar' : 'Noch offen'}
              </span>
              <h2 className="mt-6 max-w-lg font-display text-3xl font-semibold leading-tight sm:text-4xl">{hasCheckIn ? 'Dein Tag ist dokumentiert.' : 'Du bist heute noch nicht sichtbar im Plan.'}</h2>
              <p className="mt-3 max-w-lg text-sm leading-6 text-white/60">
                {hasCheckIn ? `${completedFocusCount} von 3 Tagesergebnissen sind festgehalten.` : 'Der erste Check-in dauert weniger als zwei Minuten. Eintragen statt diskutieren.'}
              </p>
            </div>
            <Link className="mt-8 inline-flex w-fit items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-ink transition hover:-translate-y-0.5" to="/heute">
              {hasCheckIn ? 'Check-in bearbeiten' : 'Check-in starten'} <ArrowRight size={17} />
            </Link>
          </div>
        </Panel>

        <Panel className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">Tagesfokus</p>
              <span className="text-xs font-semibold text-muted">{completedFocusCount} von 3</span>
            </div>
            <h2 className="mt-4 font-display text-2xl font-semibold">Heute festgehalten</h2>
            {error && <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
            <div className="mt-5 space-y-3">
              {focusItems.map((item, index) => (
                <div className="flex items-center gap-3 rounded-xl bg-soft px-4 py-3" key={item.key}>
                  <span className="grid size-7 shrink-0 place-items-center rounded-full border border-line bg-white text-xs font-bold text-muted">{index + 1}</span>
                  <span className={`text-sm font-semibold ${todayData[item.key].trim() ? 'text-ink' : 'text-muted'}`}>
                    {item.label}: {loading ? 'wird geladen …' : todayData[item.key].trim() || 'noch nichts eingetragen'}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <Link className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-accent" to="/heute">Ergebnisse dokumentieren <ArrowRight size={15} /></Link>
        </Panel>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {metrics.map(({ label, value, note, icon: Icon }) => (
          <Panel className="p-4 sm:p-5" key={label}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-muted">{label}</p>
                <p className="mt-3 font-display text-3xl font-semibold">{value}</p>
                <p className="mt-1 text-xs text-muted">{note}</p>
              </div>
              <span className="grid size-9 place-items-center rounded-xl bg-soft text-accent"><Icon size={18} /></span>
            </div>
          </Panel>
        ))}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Panel>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="grid size-11 place-items-center rounded-xl bg-blue-soft text-blue"><TimerReset size={20} /></span>
              <div><h3 className="font-bold">7-Tage-Regel</h3><p className="mt-1 text-sm text-muted">Keine offenen Kaufentscheidungen.</p></div>
            </div>
            <Check className="text-positive" size={20} />
          </div>
        </Panel>
        <Panel>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="grid size-11 place-items-center rounded-xl bg-soft text-accent"><ShoppingBag size={20} /></span>
              <div><h3 className="font-bold">Wochenreview</h3><p className="mt-1 text-sm text-muted">Am Sonntag bereit für deinen Rückblick.</p></div>
            </div>
            <ArrowRight className="text-muted" size={20} />
          </div>
        </Panel>
      </div>
    </>
  )
}
