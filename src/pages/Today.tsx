import { CheckCircle2, Moon, Save, Sun, Target } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { PageHeader } from '../components/PageHeader'
import { Panel, SectionTitle } from '../components/Panel'
import { loadToday, saveToday, type TodayForm } from '../services/data'

const inputClass = 'mt-2 w-full rounded-xl border border-line bg-soft px-3.5 py-3 text-sm outline-none transition placeholder:text-muted/60 focus:border-accent focus:bg-white focus:ring-2 focus:ring-accent/10'
const labelClass = 'text-xs font-bold uppercase tracking-wider text-muted'
const emptyForm: TodayForm = { weight: '', sleepQuality: '', businessTask: '', healthTask: '', privateTask: '', businessDone: false, healthDone: false, privateDone: false, steps: '', trainingType: 'nein', alcohol: false, cigarettes: '', firstCigaretteTime: '', foodQuality: '', notes: '' }

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
      setMessage('Check-in und Top 3 wurden sicher gespeichert.')
    } catch {
      setError('Speichern fehlgeschlagen. Bitte Datenbank-Setup und Verbindung prüfen.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <PageHeader eyebrow="Täglicher Check-in" title="Heute" description="Zwei Minuten Ehrlichkeit. Nicht optimieren, einfach eintragen." />
      {loading ? <Panel><p className="text-sm text-muted">Heutige Daten werden geladen …</p></Panel> : (
      <form className="space-y-5" onSubmit={handleSubmit}>
        <Panel>
          <div className="flex gap-4"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-warning/10 text-warning"><Sun size={20} /></span><SectionTitle title="Morgencheck" description="Der Startpunkt für deinen Tag." /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label><span className={labelClass}>Gewicht (kg)</span><input className={inputClass} inputMode="decimal" max="300" min="30" onChange={(event) => update('weight', event.target.value)} placeholder="z. B. 82,4" step="0.1" type="number" value={form.weight} /></label>
            <label><span className={labelClass}>Schlaf</span><select className={inputClass} onChange={(event) => update('sleepQuality', event.target.value)} value={form.sleepQuality}><option value="">Wie war die Nacht?</option><option value="schlecht">Schlecht</option><option value="okay">Okay</option><option value="gut">Gut</option></select></label>
          </div>
        </Panel>

        <Panel>
          <div className="flex gap-4"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-blue-soft text-blue"><Target size={20} /></span><SectionTitle title="Top 3" description="Je ein Ergebnis. Konkret genug, um es abzuhaken." /></div>
          <div className="space-y-4">
            {([
              ['Beruf', 'businessTask', 'businessDone'],
              ['Gesundheit', 'healthTask', 'healthDone'],
              ['Privat & Finanzen', 'privateTask', 'privateDone'],
            ] as const).map(([category, taskKey, doneKey]) => (
              <div className="block" key={category}><span className={labelClass}>{category}</span><div className="mt-2 flex gap-2"><input aria-label={`${category} Aufgabe`} className="min-w-0 flex-1 rounded-xl border border-line bg-soft px-3.5 py-3 text-sm outline-none focus:border-accent focus:bg-white" onChange={(event) => update(taskKey, event.target.value)} placeholder="Was ist heute das eine Ergebnis?" value={form[taskKey]} /><label className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-xl border border-line bg-white"><input checked={form[doneKey]} className="peer sr-only" onChange={(event) => update(doneKey, event.target.checked)} type="checkbox" /><CheckCircle2 className="text-muted peer-checked:text-positive" size={20} /><span className="sr-only">Erledigt</span></label></div></div>
            ))}
          </div>
        </Panel>

        <Panel>
          <div className="flex gap-4"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#eee8ff] text-[#6947a8]"><Moon size={20} /></span><SectionTitle title="Abendcheck" description="Fakten sammeln, ohne sie schönzureden." /></div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label><span className={labelClass}>Schritte</span><input className={inputClass} inputMode="numeric" min="0" onChange={(event) => update('steps', event.target.value)} placeholder="0" type="number" value={form.steps} /></label>
            <label><span className={labelClass}>Training</span><select className={inputClass} onChange={(event) => update('trainingType', event.target.value)} value={form.trainingType}><option value="nein">Nein</option><option value="krafttraining">Krafttraining</option><option value="tennis">Tennis</option><option value="cardio">Cardio</option><option value="spaziergang">Spaziergang</option><option value="wandern">Wandern</option><option value="anderes">Anderes</option></select></label>
            <label><span className={labelClass}>Essen</span><select className={inputClass} onChange={(event) => update('foodQuality', event.target.value)} value={form.foodQuality}><option value="">Auswählen</option><option value="sauber">Sauber</option><option value="mittel">Mittel</option><option value="schlecht">Schlecht</option></select></label>
            <label><span className={labelClass}>Alkohol</span><select className={inputClass} onChange={(event) => update('alcohol', event.target.value === 'ja')} value={form.alcohol ? 'ja' : 'nein'}><option value="nein">Nein</option><option value="ja">Ja</option></select></label>
            <label><span className={labelClass}>Zigaretten</span><input className={inputClass} inputMode="numeric" min="0" onChange={(event) => update('cigarettes', event.target.value)} placeholder="0" type="number" value={form.cigarettes} /></label>
            <label><span className={labelClass}>Erste Zigarette</span><input className={inputClass} onChange={(event) => update('firstCigaretteTime', event.target.value)} type="time" value={form.firstCigaretteTime} /></label>
          </div>
          <label className="mt-4 block"><span className={labelClass}>Notiz</span><textarea className={`${inputClass} min-h-24 resize-y`} onChange={(event) => update('notes', event.target.value)} placeholder="Was sollte dein zukünftiges Ich über heute wissen?" value={form.notes} /></label>
        </Panel>

        <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
          <div>{message && <p className="text-sm font-semibold text-positive">{message}</p>}{error && <p className="text-sm font-semibold text-red-700">{error}</p>}{!message && !error && <p className="text-sm text-muted">Deine Daten werden privat in Supabase gespeichert.</p>}</div>
          <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-ink px-5 py-3.5 text-sm font-bold text-white shadow-sm disabled:opacity-60" disabled={saving} type="submit"><Save size={17} /> {saving ? 'Speichert …' : 'Check-in speichern'}</button>
        </div>
      </form>)}
    </>
  )
}
