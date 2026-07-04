import { Archive, Lightbulb, Plus, Sparkles } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { Panel, SectionTitle } from '../components/Panel'

const field = 'mt-2 w-full rounded-xl border border-line bg-soft px-3.5 py-3 text-sm outline-none focus:border-accent focus:bg-white'
const label = 'text-xs font-bold uppercase tracking-wider text-muted'

export function Ideas() {
  return (
    <>
      <PageHeader eyebrow="Ideen-Parkplatz" title="Ideen" description="Gute Ideen verdienen einen Platz – aber nicht automatisch deine Woche." />
      <div className="mb-5 flex items-start gap-3 rounded-2xl border border-warning/20 bg-warning/10 px-4 py-3.5 text-sm text-[#76540a]">
        <Sparkles className="mt-0.5 shrink-0" size={17} /><p><strong>Nicht sofort starten.</strong> Erst parken, dann im Review bewerten.</p>
      </div>
      <div className="grid gap-5 xl:grid-cols-[0.85fr_1.3fr]">
        <Panel>
          <SectionTitle title="Idee festhalten" description="60 Sekunden. Roh reicht völlig." />
          <form className="space-y-4">
            <label className="block"><span className={label}>Idee</span><textarea className={`${field} min-h-28 resize-y`} placeholder="Was ist dir gerade eingefallen?" /></label>
            <label className="block"><span className={label}>Kategorie</span><select className={field}><option>Business</option><option>Gesundheit</option><option>Privat</option><option>Finanzen</option><option>Sonstiges</option></select></label>
            <div className="grid grid-cols-3 gap-2">
              {['Wichtigkeit', 'Aufwand', 'Nutzen'].map((item) => <label key={item}><span className="text-[10px] font-bold uppercase tracking-wide text-muted">{item}</span><select className={field}>{[1, 2, 3, 4, 5].map((number) => <option key={number}>{number}</option>)}</select></label>)}
            </div>
            <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ink px-4 py-3.5 text-sm font-bold text-white" type="button"><Plus size={17} /> Idee parken</button>
          </form>
        </Panel>
        <Panel>
          <div className="flex items-center justify-between"><SectionTitle title="Geparkte Ideen" description="Im Wochenreview wird entschieden." /><span className="rounded-full bg-soft px-3 py-1 text-xs font-bold text-muted">0 Ideen</span></div>
          <div className="grid min-h-80 place-items-center text-center">
            <div>
              <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-soft text-accent"><Archive size={24} /></span>
              <h2 className="mt-5 font-display text-2xl font-semibold">Der Parkplatz ist leer</h2>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">Die nächste Idee darf hier sicher warten, ohne zu einem neuen Projekt zu werden.</p>
              <p className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-accent"><Lightbulb size={14} /> Parken ist eine Entscheidung</p>
            </div>
          </div>
        </Panel>
      </div>
    </>
  )
}
