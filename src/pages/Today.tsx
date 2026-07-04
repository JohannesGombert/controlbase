import { CheckCircle2, Moon, Save, Sun, Target } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { PageHeader } from '../components/PageHeader'
import { Panel, SectionTitle } from '../components/Panel'

const inputClass = 'mt-2 w-full rounded-xl border border-line bg-soft px-3.5 py-3 text-sm outline-none transition placeholder:text-muted/60 focus:border-accent focus:bg-white focus:ring-2 focus:ring-accent/10'
const labelClass = 'text-xs font-bold uppercase tracking-wider text-muted'

export function Today() {
  const [submitted, setSubmitted] = useState(false)
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    setSubmitted(true)
  }

  return (
    <>
      <PageHeader eyebrow="Täglicher Check-in" title="Heute" description="Zwei Minuten Ehrlichkeit. Nicht optimieren, einfach eintragen." />
      <form className="space-y-5" onSubmit={handleSubmit}>
        <Panel>
          <div className="flex gap-4"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-warning/10 text-warning"><Sun size={20} /></span><SectionTitle title="Morgencheck" description="Der Startpunkt für deinen Tag." /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label><span className={labelClass}>Gewicht (kg)</span><input className={inputClass} inputMode="decimal" min="30" max="300" placeholder="z. B. 82,4" type="number" step="0.1" /></label>
            <label><span className={labelClass}>Schlaf</span><select className={inputClass} defaultValue=""><option value="" disabled>Wie war die Nacht?</option><option>Schlecht</option><option>Okay</option><option>Gut</option></select></label>
          </div>
        </Panel>

        <Panel>
          <div className="flex gap-4"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-blue-soft text-blue"><Target size={20} /></span><SectionTitle title="Top 3" description="Je ein Ergebnis. Konkret genug, um es abzuhaken." /></div>
          <div className="space-y-4">
            {['Beruf', 'Gesundheit', 'Privat & Finanzen'].map((category) => (
              <label className="block" key={category}><span className={labelClass}>{category}</span><div className="mt-2 flex gap-2"><input className="min-w-0 flex-1 rounded-xl border border-line bg-soft px-3.5 py-3 text-sm outline-none focus:border-accent focus:bg-white" placeholder="Was ist heute das eine Ergebnis?" /><label className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-xl border border-line bg-white"><input className="peer sr-only" type="checkbox" /><CheckCircle2 className="text-muted peer-checked:text-positive" size={20} /><span className="sr-only">Erledigt</span></label></div></label>
            ))}
          </div>
        </Panel>

        <Panel>
          <div className="flex gap-4"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#eee8ff] text-[#6947a8]"><Moon size={20} /></span><SectionTitle title="Abendcheck" description="Fakten sammeln, ohne sie schönzureden." /></div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label><span className={labelClass}>Schritte</span><input className={inputClass} inputMode="numeric" min="0" placeholder="0" type="number" /></label>
            <label><span className={labelClass}>Training</span><select className={inputClass}><option>Nein</option><option>Krafttraining</option><option>Tennis</option><option>Cardio</option><option>Spaziergang</option><option>Wandern</option><option>Anderes</option></select></label>
            <label><span className={labelClass}>Essen</span><select className={inputClass} defaultValue=""><option value="" disabled>Auswählen</option><option>Sauber</option><option>Mittel</option><option>Schlecht</option></select></label>
            <label><span className={labelClass}>Alkohol</span><select className={inputClass}><option>Nein</option><option>Ja</option></select></label>
            <label><span className={labelClass}>Zigaretten</span><input className={inputClass} inputMode="numeric" min="0" placeholder="0" type="number" /></label>
            <label><span className={labelClass}>Erste Zigarette</span><input className={inputClass} type="time" /></label>
          </div>
          <label className="mt-4 block"><span className={labelClass}>Notiz</span><textarea className={`${inputClass} min-h-24 resize-y`} placeholder="Was sollte dein zukünftiges Ich über heute wissen?" /></label>
        </Panel>

        <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
          {submitted ? <p className="text-sm font-semibold text-positive">UI erfasst. Die sichere Datenspeicherung verbinden wir als Nächstes.</p> : <p className="text-sm text-muted">Deine Eingaben verlassen den Browser noch nicht.</p>}
          <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-ink px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5" type="submit"><Save size={17} /> Check-in speichern</button>
        </div>
      </form>
    </>
  )
}
