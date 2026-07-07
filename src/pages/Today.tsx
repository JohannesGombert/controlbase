import { Dumbbell, Moon, Save, Sun, Target } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { PageHeader } from '../components/PageHeader'
import { Panel, SectionTitle } from '../components/Panel'
import { FormInput, PrimaryButton, SelectInput, Textarea, labelClass } from '../components/ui'
import { loadToday, saveToday, type TodayForm, type TodayWhoopWorkout } from '../services/data'

const emptyForm: TodayForm = { weight: '', sleepQuality: '', businessTask: '', healthTask: '', privateTask: '', steps: '', trainingType: 'nein', alcohol: false, cigarettes: '', firstCigaretteTime: '', foodQuality: '', notes: '', whoopWorkouts: [] }

const trainingLabels: Record<string, string> = {
  cardio: 'Cardio',
  tennis: 'Tennis',
  krafttraining: 'Krafttraining',
  laufen: 'Laufen',
  velofahren: 'Velofahren',
  wandern: 'Wandern',
  fussball: 'Fussball',
  yoga: 'Yoga / Mobility',
  spaziergang: 'Spaziergang',
  anderes: 'Anderes',
  mehrere: 'Mehrere WHOOP-Sessions',
  nein: 'Nein',
}

function workoutTime(workout: TodayWhoopWorkout) {
  if (!workout.start_time) return 'WHOOP-Session'
  const start = new Date(workout.start_time).toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' })
  const end = workout.end_time ? new Date(workout.end_time).toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' }) : ''
  return end ? `${start} - ${end}` : start
}

export function Today() {
  const { user } = useAuth()
  const [form, setForm] = useState<TodayForm>(emptyForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return
    void loadToday(user.id)
      .then(setForm)
      .catch(() => setError('Daten konnten nicht geladen werden. Wurde das Supabase-Schema ausgeführt?'))
      .finally(() => setLoading(false))
  }, [user])

  const update = <K extends keyof TodayForm>(key: K, value: TodayForm[K]) => setForm((current) => ({ ...current, [key]: value }))
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!user) return
    setSaving(true)
    setError('')
    setMessage('')
    try {
      await saveToday(user.id, form)
      setMessage('Check-in gespeichert. System aktualisiert.')
    } catch {
      setError('Speichern fehlgeschlagen. Datenbank-Setup und Verbindung prüfen.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <PageHeader eyebrow="Täglicher Check-in" title="Heute" description="Unter zwei Minuten. Nur Daten, keine Story." />
      {loading ? <Panel><p className="text-sm text-muted">Heutige Daten werden geladen …</p></Panel> : (
      <form className="space-y-5" onSubmit={handleSubmit}>
        <Panel>
          <div className="flex gap-4"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-status-warning/10 text-status-warning"><Sun size={20} /></span><SectionTitle title="Morgencheck" description="Startwerte setzen. Tag ausrichten." /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label><span className={labelClass}>Gewicht (kg)</span><FormInput inputMode="decimal" max="300" min="30" onChange={(event) => update('weight', event.target.value)} placeholder="z. B. 82,4" step="0.1" type="number" value={form.weight} /></label>
            <label><span className={labelClass}>Schlaf</span><SelectInput onChange={(event) => update('sleepQuality', event.target.value)} value={form.sleepQuality}><option value="">Nacht bewerten</option><option value="schlecht">Schlecht</option><option value="okay">Okay</option><option value="gut">Gut</option></SelectInput></label>
          </div>
        </Panel>

        <Panel>
          <div className="flex gap-4"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-status-primary/10 text-status-primary"><Target size={20} /></span><SectionTitle title="Was hast du heute gemacht?" description="Je Lebensbereich ein konkretes Ergebnis." /></div>
          <p className="mb-5 rounded-xl border border-status-primary/20 bg-status-primary/10 px-4 py-3 text-sm leading-6 text-muted"><strong className="text-ink">Keine To-do-Liste:</strong> Festhalten, was abgeschlossen, erreicht oder bewusst entschieden wurde.</p>
          <div className="space-y-4">
            {([
              ['Beruf', 'businessTask', 'Was wurde beruflich abgeschlossen oder vorangebracht?'],
              ['Gesundheit', 'healthTask', 'Was wurde für Gesundheit oder Ernährung getan?'],
              ['Privat & Finanzen', 'privateTask', 'Was wurde privat oder finanziell erledigt?'],
            ] as const).map(([category, taskKey, placeholder]) => (
              <label className="block" key={category}><span className={labelClass}>{category}</span><FormInput aria-label={`${category} Ergebnis`} onChange={(event) => update(taskKey, event.target.value)} placeholder={placeholder} value={form[taskKey]} /></label>
            ))}
          </div>
        </Panel>

        <Panel>
          <div className="flex gap-4"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-status-ceo/10 text-status-ceo"><Moon size={20} /></span><SectionTitle title="Abendcheck" description="Fakten sammeln. Abweichungen erkennen." /></div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label><span className={labelClass}>Schritte</span><FormInput inputMode="numeric" min="0" onChange={(event) => update('steps', event.target.value)} placeholder="0" type="number" value={form.steps} /></label>
            <label><span className={labelClass}>Training</span><SelectInput onChange={(event) => update('trainingType', event.target.value)} value={form.trainingType}><option value="nein">Nein</option><option value="mehrere">Mehrere WHOOP-Sessions</option><option value="krafttraining">Krafttraining</option><option value="tennis">Tennis</option><option value="cardio">Cardio</option><option value="laufen">Laufen</option><option value="velofahren">Velofahren</option><option value="spaziergang">Spaziergang</option><option value="wandern">Wandern</option><option value="yoga">Yoga / Mobility</option><option value="anderes">Anderes</option></SelectInput></label>
            <label><span className={labelClass}>Essen</span><SelectInput onChange={(event) => update('foodQuality', event.target.value)} value={form.foodQuality}><option value="">Auswählen</option><option value="sauber">Sauber</option><option value="mittel">Mittel</option><option value="schlecht">Schlecht</option></SelectInput></label>
            <label><span className={labelClass}>Alkohol</span><SelectInput onChange={(event) => update('alcohol', event.target.value === 'ja')} value={form.alcohol ? 'ja' : 'nein'}><option value="nein">Nein</option><option value="ja">Ja</option></SelectInput></label>
            <label><span className={labelClass}>Zigaretten</span><FormInput inputMode="numeric" min="0" onChange={(event) => update('cigarettes', event.target.value)} placeholder="0" type="number" value={form.cigarettes} /></label>
            <label><span className={labelClass}>Erste Zigarette</span><FormInput onChange={(event) => update('firstCigaretteTime', event.target.value)} type="time" value={form.firstCigaretteTime} /></label>
          </div>
          {form.whoopWorkouts.length ? (
            <div className="mt-4 rounded-2xl border border-status-primary/20 bg-status-primary/10 p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-ink"><Dumbbell size={16} /> Verknuepfte WHOOP-Sessions</div>
              <div className="mt-3 grid gap-2 md:grid-cols-2">
                {form.whoopWorkouts.map((workout) => (
                  <div className="rounded-xl bg-control-surface px-3.5 py-3 text-sm" key={workout.id}>
                    <div className="flex items-center justify-between gap-3">
                      <strong>{workout.training_type ? trainingLabels[workout.training_type] ?? workout.training_type : 'Noch nicht gemappt'}</strong>
                      <span className="text-xs text-muted">{workoutTime(workout)}</span>
                    </div>
                    <p className="mt-2 text-xs text-muted">
                      Strain {workout.strain ? Number(workout.strain).toFixed(1) : '-'} · Ø HF {workout.average_heart_rate ?? '-'} · Max HF {workout.max_heart_rate ?? '-'}
                    </p>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-muted">Aenderungen am Typ machst du unter Gesundheit bei den WHOOP-Workouts. Der Abendcheck uebernimmt die Zuordnung automatisch.</p>
            </div>
          ) : null}
          <label className="mt-4 block"><span className={labelClass}>Notiz</span><Textarea className="min-h-24" onChange={(event) => update('notes', event.target.value)} placeholder="Was sollte dein zukünftiges Ich über heute wissen?" value={form.notes} /></label>
        </Panel>

        <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
          <div>{message && <p className="text-sm font-semibold text-positive">{message}</p>}{error && <p className="text-sm font-semibold text-status-danger">{error}</p>}{!message && !error && <p className="text-sm text-muted">Private Speicherung in Supabase.</p>}</div>
          <PrimaryButton disabled={saving} type="submit"><Save size={17} /> {saving ? 'Speichert …' : 'Check-in speichern'}</PrimaryButton>
        </div>
      </form>)}
    </>
  )
}
