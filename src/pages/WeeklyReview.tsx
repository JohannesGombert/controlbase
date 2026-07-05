import { BarChart3, CalendarCheck, Save } from 'lucide-react'
import { getISOWeek } from 'date-fns'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { PageHeader } from '../components/PageHeader'
import { Panel, SectionTitle } from '../components/Panel'
import { loadWeeklyReview, saveWeeklyReview, type ReviewForm } from '../services/data'

const emptyForm: ReviewForm = { whatWentWell: '', whatDistractedMe: '', whatToStop: '', goal1: '', goal2: '', goal3: '' }

export function WeeklyReview() {
  const { user } = useAuth()
  const [form, setForm] = useState<ReviewForm>(emptyForm)
  const [checkins, setCheckins] = useState<Record<string, unknown>[]>([])
  const [top3, setTop3] = useState<Record<string, unknown>[]>([])
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const week = `KW ${getISOWeek(new Date())}`

  useEffect(() => {
    if (!user) return
    void loadWeeklyReview(user.id).then((result) => { setForm(result.form); setCheckins(result.checkins); setTop3(result.top3) }).catch(() => setError('Wochenreview konnte nicht geladen werden.'))
  }, [user])

  const summaries = useMemo(() => {
    const cigarettes = checkins.map((item) => item.cigarettes).filter((value): value is number => typeof value === 'number')
    const completed = top3.reduce((sum, item) => sum + ['business_done', 'health_done', 'private_done'].filter((key) => item[key] === true).length, 0)
    return [
      ['Trainingstage', String(checkins.filter((item) => item.training_type && item.training_type !== 'nein').length)],
      ['Alkoholtage', String(checkins.filter((item) => item.alcohol === true).length)],
      ['Ø Zigaretten', cigarettes.length ? (cigarettes.reduce((sum, value) => sum + value, 0) / cigarettes.length).toFixed(1) : '–'],
      ['Sauberes Essen', `${checkins.filter((item) => item.food_quality === 'sauber').length} Tage`],
      ['Tagesergebnisse', top3.length ? `${Math.round((completed / (top3.length * 3)) * 100)} %` : '0 %'],
      ['Check-ins', String(checkins.length)],
    ]
  }, [checkins, top3])

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
            <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-blue-soft text-blue"><BarChart3 size={19} /></span><SectionTitle title="Wochenbild" description="Automatisch aus deinen Check-ins." /></div>
            <div className="grid grid-cols-2 gap-3">{summaries.map(([label, value]) => <div className="rounded-xl bg-soft p-3.5" key={label}><p className="text-xs font-semibold text-muted">{label}</p><p className="mt-2 font-display text-xl font-semibold">{value}</p></div>)}</div>
          </Panel>
          <Panel className="bg-control-deep text-white"><CalendarCheck className="text-positive-light" size={24} /><h2 className="mt-5 font-display text-2xl font-semibold">{checkins.length ? `${checkins.length} Tage sichtbar.` : 'Noch keine Daten – kein Problem.'}</h2><p className="mt-2 text-sm leading-6 text-white/60">Jeder Check-in macht dein Wochenbild klarer.</p></Panel>
        </div>
        <Panel>
          <SectionTitle title="Reflexion" description="Kurz, konkret und mit einer Entscheidung enden." />
          <form className="space-y-4" onSubmit={handleSubmit}>
            {([
              ['Was lief gut?', 'whatWentWell'],
              ['Was hat mich abgelenkt?', 'whatDistractedMe'],
              ['Was stoppe ich nächste Woche?', 'whatToStop'],
            ] as const).map(([question, key]) => <label className="block" key={key}><span className="text-xs font-bold uppercase tracking-wider text-muted">{question}</span><textarea className="mt-2 min-h-20 w-full resize-y rounded-xl border border-line bg-soft px-3.5 py-3 text-sm outline-none focus:border-accent focus:bg-control-hover" onChange={(event) => setForm({ ...form, [key]: event.target.value })} value={form[key]} /></label>)}
            <div className="border-t border-line pt-5"><p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted">Die drei Ziele für nächste Woche</p><div className="space-y-2">{(['goal1', 'goal2', 'goal3'] as const).map((key, index) => <div className="flex items-center gap-3" key={key}><span className="grid size-8 shrink-0 place-items-center rounded-full bg-control-deep text-xs font-bold text-white">{index + 1}</span><input className="w-full rounded-xl border border-line bg-soft px-3.5 py-3 text-sm outline-none focus:border-accent focus:bg-control-hover" onChange={(event) => setForm({ ...form, [key]: event.target.value })} placeholder="Konkretes Ergebnis" value={form[key]} /></div>)}</div></div>
            {message && <p className="text-sm font-semibold text-positive">{message}</p>}{error && <p className="text-sm font-semibold text-status-danger">{error}</p>}
            <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-control-deep px-5 py-3.5 text-sm font-bold text-white disabled:opacity-60" disabled={saving} type="submit"><Save size={17} /> {saving ? 'Speichert …' : 'Review speichern'}</button>
          </form>
        </Panel>
      </div>
    </>
  )
}
