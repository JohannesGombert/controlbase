import { BarChart3, CalendarCheck, CalendarDays, Dumbbell, Save } from 'lucide-react'
import { getISOWeek } from 'date-fns'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { PageHeader } from '../components/PageHeader'
import { Panel, SectionTitle } from '../components/Panel'
import { loadWeeklyReview, saveWeeklyReview, type ReviewForm } from '../services/data'

const emptyForm: ReviewForm = { whatWentWell: '', whatDistractedMe: '', whatToStop: '', goal1: '', goal2: '', goal3: '' }

type ReviewWorkout = {
  id: string
  start_time: string | null
  end_time: string | null
  training_type: string | null
  strain: number | null
  average_heart_rate: number | null
  max_heart_rate: number | null
}

const trainingLabels: Record<string, string> = {
  cardio: 'Cardio',
  tennis: 'Tennis',
  krafttraining: 'Krafttraining',
  laufen: 'Laufen',
  velofahren: 'Velofahren',
  wandern: 'Wandern',
  fussball: 'Fussball',
  yoga: 'Yoga / Mobility',
  anderes: 'Anderes',
  nein: 'Kein Training',
}

function weekDates() {
  const today = new Date()
  const monday = new Date(today)
  monday.setHours(12, 0, 0, 0)
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7))
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday)
    date.setDate(monday.getDate() + index)
    return date.toISOString().slice(0, 10)
  })
}

function displayDate(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString('de-CH', { weekday: 'short', day: '2-digit', month: '2-digit' })
}

function workoutDate(workout: ReviewWorkout) {
  return workout.start_time ? new Date(workout.start_time).toISOString().slice(0, 10) : ''
}

function workoutLabel(workout: ReviewWorkout) {
  if (workout.training_type) return trainingLabels[workout.training_type] ?? workout.training_type
  return 'WHOOP-Session'
}

export function WeeklyReview() {
  const { user } = useAuth()
  const [form, setForm] = useState<ReviewForm>(emptyForm)
  const [checkins, setCheckins] = useState<Record<string, unknown>[]>([])
  const [top3, setTop3] = useState<Record<string, unknown>[]>([])
  const [whoopWorkouts, setWhoopWorkouts] = useState<ReviewWorkout[]>([])
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const week = `KW ${getISOWeek(new Date())}`

  useEffect(() => {
    if (!user) return
    void loadWeeklyReview(user.id)
      .then((result) => {
        setForm(result.form)
        setCheckins(result.checkins)
        setTop3(result.top3)
        setWhoopWorkouts((result.whoopWorkouts ?? []) as ReviewWorkout[])
      })
      .catch(() => setError('Wochenreview konnte nicht geladen werden.'))
  }, [user])

  const top3ByDate = useMemo(() => new Map(top3.map((item) => [String(item.date), item])), [top3])
  const checkinsByDate = useMemo(() => new Map(checkins.map((item) => [String(item.date), item])), [checkins])
  const workoutsByDate = useMemo(() => {
    const grouped = new Map<string, ReviewWorkout[]>()
    whoopWorkouts.forEach((workout) => {
      const date = workoutDate(workout)
      if (!date) return
      grouped.set(date, [...(grouped.get(date) ?? []), workout])
    })
    return grouped
  }, [whoopWorkouts])

  const dayRows = useMemo(() => weekDates().map((date) => {
    const checkin = checkinsByDate.get(date)
    const top = top3ByDate.get(date)
    const workouts = workoutsByDate.get(date) ?? []
    const topItems = [
      top?.business_task ? String(top.business_task) : '',
      top?.health_task ? String(top.health_task) : '',
      top?.private_task ? String(top.private_task) : '',
    ].filter(Boolean)
    const completedTop3 = ['business_done', 'health_done', 'private_done'].filter((key) => top?.[key] === true).length
    const checkinTraining = typeof checkin?.training_type === 'string' && checkin.training_type !== 'nein'
      ? trainingLabels[checkin.training_type] ?? checkin.training_type
      : ''
    return { date, checkin, top, topItems, completedTop3, workouts, checkinTraining }
  }), [checkinsByDate, top3ByDate, workoutsByDate])

  const summaries = useMemo(() => {
    const cigarettes = checkins.map((item) => item.cigarettes).filter((value): value is number => typeof value === 'number')
    const completed = top3.reduce((sum, item) => sum + ['business_done', 'health_done', 'private_done'].filter((key) => item[key] === true).length, 0)
    const trainingDays = new Set<string>()
    checkins.forEach((item) => {
      if (item.training_type && item.training_type !== 'nein') trainingDays.add(String(item.date))
    })
    whoopWorkouts.forEach((workout) => {
      const date = workoutDate(workout)
      if (date) trainingDays.add(date)
    })
    return [
      ['Trainingstage', String(trainingDays.size)],
      ['WHOOP-Sessions', String(whoopWorkouts.length)],
      ['Alkoholtage', String(checkins.filter((item) => item.alcohol === true).length)],
      ['Ø Zigaretten', cigarettes.length ? (cigarettes.reduce((sum, value) => sum + value, 0) / cigarettes.length).toFixed(1) : '-'],
      ['Sauberes Essen', `${checkins.filter((item) => item.food_quality === 'sauber').length} Tage`],
      ['Tagesergebnisse', top3.length ? `${Math.round((completed / (top3.length * 3)) * 100)} %` : '0 %'],
    ]
  }, [checkins, top3, whoopWorkouts])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!user) return
    setSaving(true); setError(''); setMessage('')
    try { await saveWeeklyReview(user.id, form); setMessage('Wochenreview wurde gespeichert.') } catch { setError('Review konnte nicht gespeichert werden.') } finally { setSaving(false) }
  }

  return (
    <>
      <PageHeader eyebrow={week} title="Wochenreview" description="Die Woche ansehen, ohne mit ihr zu verhandeln. Erkennen, entscheiden, neu ausrichten." />
      <div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-5">
          <Panel>
            <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-blue-soft text-blue"><BarChart3 size={19} /></span><SectionTitle title="Wochenbild" description="Automatisch aus Check-ins und WHOOP-Sessions." /></div>
            <div className="grid grid-cols-2 gap-3">{summaries.map(([label, value]) => <div className="rounded-xl bg-soft p-3.5" key={label}><p className="text-xs font-semibold text-muted">{label}</p><p className="mt-2 font-display text-xl font-semibold">{value}</p></div>)}</div>
          </Panel>
          <Panel className="bg-control-deep text-white"><CalendarCheck className="text-positive-light" size={24} /><h2 className="mt-5 font-display text-2xl font-semibold">{checkins.length ? `${checkins.length} Tage sichtbar.` : 'Noch keine Daten - kein Problem.'}</h2><p className="mt-2 text-sm leading-6 text-white/60">Jeder Check-in macht dein Wochenbild klarer.</p></Panel>
        </div>
        <Panel>
          <SectionTitle title="Reflexion" description="Kurz, konkret und mit einer Entscheidung enden." />
          <form className="space-y-4" onSubmit={handleSubmit}>
            {([
              ['Was lief gut?', 'whatWentWell'],
              ['Was hat mich abgelenkt?', 'whatDistractedMe'],
              ['Was stoppe ich naechste Woche?', 'whatToStop'],
            ] as const).map(([question, key]) => <label className="block" key={key}><span className="text-xs font-bold uppercase tracking-wider text-muted">{question}</span><textarea className="mt-2 min-h-20 w-full resize-y rounded-xl border border-line bg-soft px-3.5 py-3 text-sm outline-none focus:border-accent focus:bg-control-hover" onChange={(event) => setForm({ ...form, [key]: event.target.value })} value={form[key]} /></label>)}
            <div className="border-t border-line pt-5"><p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted">Die drei Ziele fuer naechste Woche</p><div className="space-y-2">{(['goal1', 'goal2', 'goal3'] as const).map((key, index) => <div className="flex items-center gap-3" key={key}><span className="grid size-8 shrink-0 place-items-center rounded-full bg-control-deep text-xs font-bold text-white">{index + 1}</span><input className="w-full rounded-xl border border-line bg-soft px-3.5 py-3 text-sm outline-none focus:border-accent focus:bg-control-hover" onChange={(event) => setForm({ ...form, [key]: event.target.value })} placeholder="Konkretes Ergebnis" value={form[key]} /></div>)}</div></div>
            {message && <p className="text-sm font-semibold text-positive">{message}</p>}{error && <p className="text-sm font-semibold text-status-danger">{error}</p>}
            <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-control-deep px-5 py-3.5 text-sm font-bold text-white disabled:opacity-60" disabled={saving} type="submit"><Save size={17} /> {saving ? 'Speichert ...' : 'Review speichern'}</button>
          </form>
        </Panel>
      </div>

      <Panel className="mt-5">
        <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-soft text-accent"><CalendarDays size={19} /></span><SectionTitle title="Heute-Uebersicht" description="Alle erfassten Tage dieser Woche mit Ergebnissen, Check-in und WHOOP-Training." /></div>
        <div className="mt-4 divide-y divide-line">
          {dayRows.map((day) => (
            <div className="grid gap-3 py-4 lg:grid-cols-[0.35fr_1fr_1fr_1fr]" key={day.date}>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted">{displayDate(day.date)}</p>
                <p className="mt-1 text-sm font-semibold">{day.checkin || day.top || day.workouts.length ? 'erfasst' : 'offen'}</p>
              </div>
              <div className="rounded-xl bg-soft p-3">
                <p className="text-xs font-bold uppercase tracking-wider text-muted">Heute</p>
                <p className="mt-2 text-sm">{day.checkin ? `${day.checkin.weight ? `${day.checkin.weight} kg · ` : ''}${day.checkin.food_quality ? `Essen: ${day.checkin.food_quality}` : 'Check-in vorhanden'}` : 'Noch kein Check-in'}</p>
                {day.checkin?.notes ? <p className="mt-2 text-xs text-muted">{String(day.checkin.notes)}</p> : null}
              </div>
              <div className="rounded-xl bg-soft p-3">
                <p className="text-xs font-bold uppercase tracking-wider text-muted">Tagesergebnisse</p>
                <p className="mt-2 text-sm font-semibold">{day.top ? `${day.completedTop3} von 3 festgehalten` : 'Noch nichts festgehalten'}</p>
                {day.topItems.length ? <ul className="mt-2 space-y-1 text-xs text-muted">{day.topItems.map((item) => <li key={item}>- {item}</li>)}</ul> : null}
              </div>
              <div className="rounded-xl bg-soft p-3">
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted"><Dumbbell size={14} /> Training</p>
                {day.workouts.length ? (
                  <div className="mt-2 space-y-2 text-sm">
                    {day.workouts.map((workout) => <p key={workout.id}><strong>{workoutLabel(workout)}</strong>{workout.strain ? ` · Strain ${Number(workout.strain).toFixed(1)}` : ''}</p>)}
                  </div>
                ) : (
                  <p className="mt-2 text-sm">{day.checkinTraining || 'Keine Session erfasst'}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </>
  )
}
