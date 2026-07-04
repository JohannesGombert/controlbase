import { CalendarClock, Plus, ShieldCheck, ShoppingBag } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { Panel, SectionTitle } from '../components/Panel'

const field = 'mt-2 w-full rounded-xl border border-line bg-soft px-3.5 py-3 text-sm outline-none focus:border-accent focus:bg-white'
const label = 'text-xs font-bold uppercase tracking-wider text-muted'

export function Purchases() {
  return (
    <>
      <PageHeader eyebrow="Impulskontrolle" title="Käufe" description="Was mehr als 300 CHF kostet, bekommt sieben Tage Abstand. Klarheit ist billiger als Reue." />
      <div className="grid gap-5 xl:grid-cols-[0.85fr_1.3fr]">
        <Panel>
          <SectionTitle title="Kauf parken" description="Noch keine Entscheidung. Nur sauber erfassen." />
          <form className="space-y-4">
            <label className="block"><span className={label}>Artikel</span><input className={field} placeholder="Was willst du kaufen?" /></label>
            <div className="grid grid-cols-2 gap-3">
              <label><span className={label}>Preis (CHF)</span><input className={field} min="300" placeholder="300" type="number" /></label>
              <label><span className={label}>Kategorie</span><select className={field}><option>Technik</option><option>Gesundheit</option><option>Freizeit</option><option>Business</option><option>Sonstiges</option></select></label>
            </div>
            <label className="block"><span className={label}>Warum will ich es?</span><textarea className={`${field} min-h-24 resize-y`} placeholder="Der ehrliche Grund, nicht die Verkaufsstory." /></label>
            <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ink px-4 py-3.5 text-sm font-bold text-white" type="button"><Plus size={17} /> 7-Tage-Regel starten</button>
          </form>
        </Panel>

        <div className="space-y-5">
          <Panel className="bg-blue text-white">
            <div className="flex items-start gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/10"><ShieldCheck size={21} /></span>
              <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-white/60">Deine Regel</p><h2 className="mt-2 font-display text-2xl font-semibold">Sieben Tage zwischen Wunsch und Entscheidung.</h2><p className="mt-2 text-sm leading-6 text-white/65">Danach drei Fragen: Will ich es noch? Zahlt es auf mein Leben ein? Bleibt die Sparquote intakt?</p></div>
            </div>
          </Panel>
          <Panel>
            <div className="grid min-h-72 place-items-center text-center">
              <div>
                <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-soft text-muted"><ShoppingBag size={24} /></span>
                <h2 className="mt-5 font-display text-2xl font-semibold">Keine Käufe in der Warteschleife</h2>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">Wenn der nächste größere Wunsch auftaucht, landet er hier – nicht direkt im Warenkorb.</p>
                <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-soft px-3 py-1.5 text-xs font-bold text-muted"><CalendarClock size={14} /> 7-Tage-Regel bereit</p>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </>
  )
}
