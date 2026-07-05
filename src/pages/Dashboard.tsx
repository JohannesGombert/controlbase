import { ArrowRight, CalendarCheck, Check, Cigarette, Footprints, GlassWater, Scale, ShoppingBag, Target, TimerReset } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import { PageHeader } from '../components/PageHeader'
import { Panel } from '../components/Panel'
import { MetricCard, PrimaryButton, StatusBadge } from '../components/ui'
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
  const hasHealthSignal = Boolean(todayData.weight || todayData.steps || todayData.trainingType !== 'nein' || todayData.sleepQuality)
  const status = completedFocusCount === 3 && hasHealthSignal ? 'success' : completedFocusCount > 0 || hasHealthSignal ? 'warning' : 'danger'
  const statusText = status === 'success' ? 'Auf Kurs.' : status === 'warning' ? 'Teilweise im Plan. Heute nachsteuern.' : 'Check-in fehlt.'
  const nextAction = status === 'success' ? 'Review offen halten.' : 'Check-in abschließen.'

  const metrics = useMemo(() => [
    { label: 'Gewicht', value: todayData.weight ? `${todayData.weight} kg` : '–', note: todayData.weight ? 'heute erfasst' : 'nicht erfasst', tone: 'success' as const, icon: <Scale size={18} /> },
    { label: 'Schritte', value: todayData.steps || '–', note: 'heutiger Stand', tone: 'primary' as const, icon: <Footprints size={18} /> },
    { label: 'Training', value: todayData.trainingType && todayData.trainingType !== 'nein' ? 'Aktiv' : '0', note: todayData.trainingType && todayData.trainingType !== 'nein' ? todayData.trainingType : 'kein Training', tone: 'ceo' as const, icon: <Target size={18} /> },
    { label: 'Alkohol', value: todayData.alcohol ? 'Ja' : 'Nein', note: todayData.alcohol ? 'Risiko markieren' : 'im Plan', tone: todayData.alcohol ? 'warning' as const : 'success' as const, icon: <GlassWater size={18} /> },
    { label: 'Rauchen', value: todayData.cigarettes || '0', note: 'Zigaretten', tone: Number(todayData.cigarettes || 0) > 0 ? 'danger' as const : 'success' as const, icon: <Cigarette size={18} /> },
    { label: 'Top 3', value: `${completedFocusCount}/3`, note: 'Bereiche dokumentiert', tone: completedFocusCount === 3 ? 'success' as const : 'warning' as const, icon: <Check size={18} /> },
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
      <PageHeader eyebrow={today} title="Heute auf Kurs?" description="Status, Abweichung, nächste Aktion. Kein Lärm." />

      <div className="grid gap-5 xl:grid-cols-[1.3fr_0.9fr]">
        <Panel className="relative overflow-hidden bg-control-deep">
          <div className="absolute -right-20 -top-24 size-72 rounded-full border-[44px] border-accent/5" />
          <div className="relative">
            <StatusBadge tone={status}>{statusText}</StatusBadge>
            <h2 className="mt-7 max-w-2xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">{nextAction}</h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-muted">
              {status === 'success'
                ? 'Die Kernsignale sind gesetzt. System weiter ruhig halten.'
                : 'Ein kurzer Check-in reicht, damit das Cockpit wieder belastbar ist.'}
            </p>
            <Link to="/heute">
              <PrimaryButton className="mt-8">
                {status === 'success' ? 'Check-in bearbeiten' : 'Check-in starten'} <ArrowRight size={17} />
              </PrimaryButton>
            </Link>
          </div>
        </Panel>

        <Panel>
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted">Tagesfokus</p>
            <span className="text-xs font-semibold text-muted">{completedFocusCount} von 3</span>
          </div>
          <h2 className="mt-4 text-2xl font-semibold">Heute festgehalten</h2>
          {error && <p className="mt-3 rounded-xl bg-status-danger/10 px-4 py-3 text-sm font-semibold text-status-danger">{error}</p>}
          <div className="mt-5 space-y-3">
            {focusItems.map((item, index) => (
              <div className="flex items-center gap-3 rounded-xl border border-line bg-soft px-4 py-3" key={item.key}>
                <span className="grid size-7 shrink-0 place-items-center rounded-full border border-line bg-control-surface text-xs font-bold text-muted">{index + 1}</span>
                <span className={`text-sm font-semibold ${todayData[item.key].trim() ? 'text-ink' : 'text-muted'}`}>
                  {item.label}: {loading ? 'wird geladen …' : todayData[item.key].trim() || 'nicht erfasst'}
                </span>
              </div>
            ))}
          </div>
          <Link className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-accent" to="/heute">Ergebnisse dokumentieren <ArrowRight size={15} /></Link>
        </Panel>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Panel>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="grid size-11 place-items-center rounded-xl bg-status-warning/10 text-status-warning"><TimerReset size={20} /></span>
              <div><h3 className="font-bold">Käufe</h3><p className="mt-1 text-sm text-muted">Kaufentscheidung noch gesperrt.</p></div>
            </div>
            <ShoppingBag className="text-muted" size={20} />
          </div>
        </Panel>
        <Panel>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="grid size-11 place-items-center rounded-xl bg-status-ceo/10 text-status-ceo"><CalendarCheck size={20} /></span>
              <div><h3 className="font-bold">Review</h3><p className="mt-1 text-sm text-muted">Wochenbild prüfen. Nächste Entscheidung setzen.</p></div>
            </div>
            <ArrowRight className="text-muted" size={20} />
          </div>
        </Panel>
      </div>
    </>
  )
}
