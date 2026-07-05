import { Activity, Apple, HeartPulse, Moon, Plus, Save, Scale, Target, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useAuth } from '../auth/AuthProvider'
import { PageHeader } from '../components/PageHeader'
import { Panel, SectionTitle } from '../components/Panel'
import {
  emptyHealthProfile,
  loadHealthProfile,
  loadWeightEntries,
  saveHealthProfile,
  saveWeightEntry,
  type HealthProfile,
  type WeightEntry,
} from '../services/health'
import { loadWhoopHealthData, type WhoopDailyMetric, type WhoopWorkout } from '../services/whoop'

const field = 'mt-2 w-full rounded-xl border border-line bg-soft px-3.5 py-3 text-sm outline-none focus:border-accent focus:bg-control-hover'
const label = 'text-xs font-bold uppercase tracking-wider text-muted'

function metric(value: number | null | undefined, suffix = '') {
  return value == null ? '-' : `${Number(value).toFixed(value % 1 ? 1 : 0)}${suffix}`
}

function minutesToHours(value: number | null | undefined) {
  if (value == null) return '-'
  const hours = Math.floor(value / 60)
  const minutes = Math.round(value % 60)
  return `${hours}h ${minutes}m`
}

function WhoopPanel({ daily, workouts }: { daily: WhoopDailyMetric[]; workouts: WhoopWorkout[] }) {
  const latest = daily.at(-1)
  const chartData = daily.map((item) => ({
    date: item.date,
    recovery: item.recovery_score ?? null,
    sleep: item.sleep_performance_percentage ?? null,
    strain: item.day_strain ?? null,
  }))

  return (
    <Panel>
      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#e7f4ee] text-positive">
            <HeartPulse size={20} />
          </span>
          <SectionTitle title="WHOOP Daten" description="Recovery, Schlaf und Belastung aus deiner WHOOP Synchronisierung." />
        </div>
        <p className="rounded-full bg-soft px-3 py-1 text-xs font-bold text-muted">{daily.length ? `${daily.length} Tage` : 'Keine Daten'}</p>
      </div>

      {latest ? (
        <>
          <div className="grid gap-3 sm:grid-cols-4">
            <div className="rounded-xl bg-soft p-4">
              <HeartPulse className="text-positive" size={17} />
              <p className="mt-3 text-xs text-muted">Recovery</p>
              <p className="mt-1 font-display text-2xl font-semibold">{metric(latest.recovery_score, ' %')}</p>
            </div>
            <div className="rounded-xl bg-soft p-4">
              <Activity className="text-accent" size={17} />
              <p className="mt-3 text-xs text-muted">HRV / Ruhepuls</p>
              <p className="mt-1 font-display text-2xl font-semibold">{metric(latest.hrv_rmssd_milli)} / {metric(latest.resting_heart_rate)}</p>
            </div>
            <div className="rounded-xl bg-soft p-4">
              <Moon className="text-blue" size={17} />
              <p className="mt-3 text-xs text-muted">Schlaf</p>
              <p className="mt-1 font-display text-2xl font-semibold">{metric(latest.sleep_performance_percentage, ' %')}</p>
            </div>
            <div className="rounded-xl bg-soft p-4">
              <Zap className="text-warning" size={17} />
              <p className="mt-3 text-xs text-muted">Day Strain</p>
              <p className="mt-1 font-display text-2xl font-semibold">{metric(latest.day_strain)}</p>
            </div>
          </div>

          <div className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_0.8fr]">
            <div className="h-64 rounded-xl border border-line bg-control-surface p-3">
              <ResponsiveContainer height="100%" width="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="date" fontSize={11} tickFormatter={(value) => new Date(`${value}T12:00:00`).toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit' })} />
                  <YAxis fontSize={11} width={34} />
                  <Tooltip labelFormatter={(value) => new Date(`${value}T12:00:00`).toLocaleDateString('de-CH')} />
                  <Line dataKey="recovery" dot={false} name="Recovery %" stroke="#2f7d55" strokeWidth={2} type="monotone" />
                  <Line dataKey="sleep" dot={false} name="Schlaf %" stroke="#3466d6" strokeWidth={2} type="monotone" />
                  <Line dataKey="strain" dot={false} name="Strain" stroke="#d89400" strokeWidth={2} type="monotone" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="rounded-xl border border-line bg-control-surface p-4">
              <h3 className="font-display text-xl font-semibold">Schlafdetails</h3>
              <div className="mt-4 space-y-3 text-sm">
                <p className="flex justify-between gap-3"><span className="text-muted">Im Bett</span><strong>{minutesToHours(latest.total_in_bed_minutes)}</strong></p>
                <p className="flex justify-between gap-3"><span className="text-muted">Wach</span><strong>{minutesToHours(latest.total_awake_minutes)}</strong></p>
                <p className="flex justify-between gap-3"><span className="text-muted">Leicht</span><strong>{minutesToHours(latest.total_light_sleep_minutes)}</strong></p>
                <p className="flex justify-between gap-3"><span className="text-muted">Tief</span><strong>{minutesToHours(latest.total_slow_wave_sleep_minutes)}</strong></p>
                <p className="flex justify-between gap-3"><span className="text-muted">REM</span><strong>{minutesToHours(latest.total_rem_sleep_minutes)}</strong></p>
                <p className="flex justify-between gap-3"><span className="text-muted">Effizienz</span><strong>{metric(latest.sleep_efficiency_percentage, ' %')}</strong></p>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-line bg-control-surface p-4">
            <h3 className="font-display text-xl font-semibold">Letzte Workouts</h3>
            {workouts.length ? (
              <div className="mt-3 divide-y divide-line">
                {workouts.map((workout) => (
                  <div className="grid gap-2 py-3 text-sm sm:grid-cols-[1fr_0.5fr_0.5fr_0.5fr]" key={workout.id}>
                    <span className="font-semibold">{workout.start_time ? new Date(workout.start_time).toLocaleString('de-CH') : 'Workout'}</span>
                    <span className="text-muted">Strain {metric(workout.strain)}</span>
                    <span className="text-muted">Ø HF {metric(workout.average_heart_rate)}</span>
                    <span className="text-muted">Max HF {metric(workout.max_heart_rate)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted">Noch keine Workouts synchronisiert.</p>
            )}
          </div>
        </>
      ) : (
        <p className="rounded-xl bg-soft p-5 text-sm leading-6 text-muted">
          WHOOP ist verbunden, aber hier sind noch keine Tageswerte sichtbar. Klicke in den Einstellungen auf “Synchronisieren”.
        </p>
      )}
    </Panel>
  )
}

export function Health() {
  const { user } = useAuth()
  const [form, setForm] = useState<HealthProfile>(emptyHealthProfile)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [entries, setEntries] = useState<WeightEntry[]>([])
  const [newWeight, setNewWeight] = useState('')
  const [whoopDaily, setWhoopDaily] = useState<WhoopDailyMetric[]>([])
  const [whoopWorkouts, setWhoopWorkouts] = useState<WhoopWorkout[]>([])

  useEffect(() => {
    if (!user) return
    setLoading(true)
    void Promise.all([loadHealthProfile(user.id), loadWeightEntries(user.id), loadWhoopHealthData(user.id)])
      .then(([profile, weights, whoop]) => {
        setForm(profile)
        setEntries(weights)
        setWhoopDaily(whoop.daily)
        setWhoopWorkouts(whoop.workouts)
      })
      .catch(() => setError('Gesundheitsdaten konnten nicht geladen werden. Bitte Health- und WHOOP-SQL-Dateien ausfuehren.'))
      .finally(() => setLoading(false))
  }, [user])

  const update = <K extends keyof HealthProfile>(key: K, value: HealthProfile[K]) => setForm((current) => ({ ...current, [key]: value }))
  const projection = useMemo(() => {
    const difference = Number(form.currentWeight) - Number(form.targetWeight)
    const rate = Number(form.weeklyWeightLoss)
    return difference > 0 && rate > 0 ? Math.ceil(difference / rate) : 0
  }, [form.currentWeight, form.targetWeight, form.weeklyWeightLoss])
  const targets = useMemo(() => {
    const weight = Number(form.currentWeight), height = Number(form.heightCm), target = Number(form.targetWeight)
    const age = form.birthDate ? Math.floor((Date.now() - new Date(form.birthDate).getTime()) / 31557600000) : 0
    if (!weight || !height || !age || !['male', 'female'].includes(form.sex)) return null
    const bmr = 10 * weight + 6.25 * height - 5 * age + (form.sex === 'male' ? 5 : -161)
    const factors: Record<string, number> = { low: 1.2, light: 1.375, moderate: 1.55, high: 1.725, very_high: 1.9 }
    const maintenance = bmr * (factors[form.activityLevel] ?? 1.55)
    const deficit = Math.min(1000, Number(form.weeklyWeightLoss) * 7700 / 7)
    return {
      calories: Math.round(Math.max(bmr * 1.05, maintenance - deficit) / 50) * 50,
      maintenance: Math.round(maintenance / 50) * 50,
      protein: Math.round((target || weight) * 1.4),
    }
  }, [form])
  const trend = useMemo(() => {
    const recent = entries.slice(-7)
    return recent.length ? recent.reduce((sum, item) => sum + Number(item.weight), 0) / recent.length : null
  }, [entries])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!user) return
    setSaving(true); setError(''); setMessage('')
    try { await saveHealthProfile(user.id, form); setMessage('Abnehmprofil wurde gespeichert.') }
    catch { setError('Profil konnte nicht gespeichert werden.') }
    finally { setSaving(false) }
  }

  const addWeight = async () => {
    if (!user || !newWeight) return
    setError('')
    try {
      await saveWeightEntry(user.id, new Date().toISOString().slice(0, 10), Number(newWeight))
      const updated = await loadWeightEntries(user.id)
      setEntries(updated)
      const next = { ...form, currentWeight: newWeight }
      setForm(next)
      await saveHealthProfile(user.id, next)
      setNewWeight('')
      setMessage('Heutiges Gewicht wurde gespeichert.')
    } catch {
      setError('Gewicht konnte nicht gespeichert werden.')
    }
  }

  return (
    <>
      <PageHeader
        action={<div className="flex gap-2"><Link className="rounded-xl border border-line bg-control-surface px-4 py-3 text-sm font-bold" to="/einkaufsliste">Einkaufsliste</Link><Link className="rounded-xl bg-control-deep px-4 py-3 text-sm font-bold text-white" to="/ernaehrung">Zum Wochenplan</Link></div>}
        description="Die Grundlage fuer Gewichtstrend, Ernaehrungsplan und WHOOP-Anpassungen."
        eyebrow="Gesundheit & Ernaehrung"
        title="Dein Abnehmprofil"
      />
      {loading ? <Panel><p className="text-sm text-muted">Profil wird geladen ...</p></Panel> : (
        <form className="space-y-5" onSubmit={submit}>
          <div className="grid gap-4 sm:grid-cols-3">
            <Panel className="p-4 sm:p-5"><Scale className="text-accent" size={19} /><p className="mt-4 text-xs font-semibold text-muted">Aktuelles Gewicht</p><p className="mt-1 font-display text-3xl font-semibold">{form.currentWeight || '-'} <span className="text-base">kg</span></p></Panel>
            <Panel className="p-4 sm:p-5"><Target className="text-positive" size={19} /><p className="mt-4 text-xs font-semibold text-muted">Zielgewicht</p><p className="mt-1 font-display text-3xl font-semibold">{form.targetWeight || '-'} <span className="text-base">kg</span></p></Panel>
            <Panel className="p-4 sm:p-5"><Activity className="text-blue" size={19} /><p className="mt-4 text-xs font-semibold text-muted">Orientierungszeitraum</p><p className="mt-1 font-display text-3xl font-semibold">{projection || '-'} <span className="text-base">Wochen</span></p></Panel>
          </div>
          <div className="grid gap-5 xl:grid-cols-[1.35fr_0.8fr]">
            <Panel><SectionTitle title="Gewichtstrend" description="Der 7-Tage-Durchschnitt glaettet normale taegliche Schwankungen." /><div className="mb-4 flex gap-2"><input aria-label="Heutiges Gewicht" className="min-w-0 flex-1 rounded-xl border border-line bg-soft px-3.5 py-3 text-sm" min="30" onChange={(event) => setNewWeight(event.target.value)} placeholder="Heutiges Gewicht in kg" step="0.1" type="number" value={newWeight} /><button className="inline-flex items-center gap-2 rounded-xl bg-control-deep px-4 text-sm font-bold text-white" onClick={() => void addWeight()} type="button"><Plus size={16} /> Eintragen</button></div>{entries.length ? <div className="h-56"><ResponsiveContainer height="100%" width="100%"><LineChart data={entries}><XAxis dataKey="measured_on" fontSize={11} tickFormatter={(value) => new Date(`${value}T12:00:00`).toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit' })} /><YAxis domain={['dataMin - 1', 'dataMax + 1']} fontSize={11} width={42} /><Tooltip formatter={(value) => [`${Number(value).toFixed(1)} kg`, 'Gewicht']} labelFormatter={(value) => new Date(`${value}T12:00:00`).toLocaleDateString('de-CH')} /><Line dataKey="weight" dot={{ r: 3 }} stroke="#00D4FF" strokeWidth={2} type="monotone" /></LineChart></ResponsiveContainer></div> : <p className="py-16 text-center text-sm text-muted">Trage dein erstes Gewicht ein.</p>}<p className="mt-3 text-sm font-semibold text-accent">7-Tage-Trend: {trend ? `${trend.toFixed(1)} kg` : 'noch nicht verfuegbar'}</p></Panel>
            <Panel className="bg-control-deep text-white"><p className="text-xs font-bold uppercase tracking-[0.18em] text-positive-light">Taeglicher Orientierungsrahmen</p>{targets ? <><p className="mt-6 font-display text-4xl font-semibold">{targets.calories} kcal</p><p className="mt-2 text-sm text-white/60">Erhaltung geschaetzt: {targets.maintenance} kcal</p><div className="mt-6 rounded-xl bg-control-hover p-4"><p className="text-xs text-white/55">Proteinziel</p><p className="mt-1 font-display text-2xl font-semibold">{targets.protein} g / Tag</p></div></> : <p className="mt-6 text-sm leading-6 text-white/65">Ergaenze Geburtsdatum, Groesse, Gewicht und Geschlecht, damit ein Rahmen berechnet werden kann.</p>}<p className="mt-6 text-xs leading-5 text-white/45">Schaetzung, keine medizinische Ernaehrungsempfehlung. Anpassungen erfolgen spaeter anhand des Wochentrends.</p></Panel>
          </div>
          <WhoopPanel daily={whoopDaily} workouts={whoopWorkouts} />
          <Panel><SectionTitle title="Koerper & Ziel" description="Diese Angaben bestimmen spaeter den sicheren Ausgangsrahmen." /><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label><span className={label}>Aktuelles Gewicht (kg)</span><input className={field} min="30" onChange={(event) => update('currentWeight', event.target.value)} required step="0.1" type="number" value={form.currentWeight} /></label>
            <label><span className={label}>Zielgewicht (kg)</span><input className={field} min="30" onChange={(event) => update('targetWeight', event.target.value)} required step="0.1" type="number" value={form.targetWeight} /></label>
            <label><span className={label}>Groesse (cm)</span><input className={field} min="120" onChange={(event) => update('heightCm', event.target.value)} required type="number" value={form.heightCm} /></label>
            <label><span className={label}>Geburtsdatum</span><input className={field} onChange={(event) => update('birthDate', event.target.value)} type="date" value={form.birthDate} /></label>
            <label><span className={label}>Geschlecht</span><select className={field} onChange={(event) => update('sex', event.target.value)} value={form.sex}><option value="unspecified">Keine Angabe</option><option value="male">Maennlich</option><option value="female">Weiblich</option><option value="diverse">Divers</option></select></label>
            <label><span className={label}>Zieltempo pro Woche</span><select className={field} onChange={(event) => update('weeklyWeightLoss', event.target.value)} value={form.weeklyWeightLoss}><option value="0.25">0,25 kg - sanft</option><option value="0.5">0,5 kg - ausgewogen</option><option value="0.75">0,75 kg - ambitioniert</option><option value="1">1,0 kg - obere Grenze</option></select></label>
          </div></Panel>
          <Panel><div className="flex gap-4"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#e7f4ee] text-positive"><Apple size={20} /></span><SectionTitle title="Ernaehrungsrahmen" description="Damit der spaetere Wochenplan wirklich zu deinem Alltag passt." /></div><div className="grid gap-4 sm:grid-cols-3">
            <label><span className={label}>Aktivitaet</span><select className={field} onChange={(event) => update('activityLevel', event.target.value)} value={form.activityLevel}><option value="low">Ueberwiegend sitzend</option><option value="light">Leicht aktiv</option><option value="moderate">Moderat aktiv</option><option value="high">Sehr aktiv</option><option value="very_high">Leistungssport</option></select></label>
            <label><span className={label}>Ernaehrungsform</span><select className={field} onChange={(event) => update('dietStyle', event.target.value)} value={form.dietStyle}><option value="balanced">Ausgewogen</option><option value="mediterranean">Mediterran</option><option value="vegetarian">Vegetarisch</option><option value="vegan">Vegan</option><option value="low_carb">Low Carb</option><option value="other">Andere</option></select></label>
            <label><span className={label}>Mahlzeiten pro Tag</span><select className={field} onChange={(event) => update('mealsPerDay', event.target.value)} value={form.mealsPerDay}>{[2, 3, 4, 5, 6].map((number) => <option key={number}>{number}</option>)}</select></label>
            <label><span className={label}>Allergien & Unvertraeglichkeiten</span><textarea className={`${field} min-h-24`} onChange={(event) => update('allergies', event.target.value)} placeholder="z. B. Laktose, Nuesse" value={form.allergies} /></label>
            <label><span className={label}>Mag ich nicht</span><textarea className={`${field} min-h-24`} onChange={(event) => update('dislikes', event.target.value)} placeholder="Lebensmittel ausschliessen" value={form.dislikes} /></label>
            <label><span className={label}>Weitere Hinweise</span><textarea className={`${field} min-h-24`} onChange={(event) => update('notes', event.target.value)} placeholder="Arbeitszeiten, Kochzeit, Besonderheiten" value={form.notes} /></label>
          </div></Panel>
          <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center"><div>{message && <p className="text-sm font-semibold text-positive">{message}</p>}{error && <p className="text-sm font-semibold text-status-danger">{error}</p>}</div><button className="inline-flex items-center justify-center gap-2 rounded-xl bg-control-deep px-5 py-3.5 text-sm font-bold text-white disabled:opacity-60" disabled={saving} type="submit"><Save size={17} /> {saving ? 'Speichert ...' : 'Abnehmprofil speichern'}</button></div>
        </form>
      )}
    </>
  )
}
