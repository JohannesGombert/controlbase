import { BarChart3, CalendarCheck, Save } from 'lucide-react'
import { getISOWeek } from 'date-fns'
import { PageHeader } from '../components/PageHeader'
import { Panel, SectionTitle } from '../components/Panel'

const summaries = [
  ['Trainingstage', '0'], ['Alkoholtage', '0'], ['Ø Zigaretten', '–'], ['Sauberes Essen', '0 Tage'], ['Top 3', '0 %'], ['CEO-Blöcke', '0'],
]
const questions = ['Was lief gut?', 'Was hat mich abgelenkt?', 'Was stoppe ich nächste Woche?']

export function WeeklyReview() {
  const week = `KW ${getISOWeek(new Date())}`
  return (
    <>
      <PageHeader eyebrow={week} title="Wochenreview" description="Die Woche ansehen, ohne mit ihr zu verhandeln. Erkennen, entscheiden, neu ausrichten." />
      <div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-5">
          <Panel>
            <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-blue-soft text-blue"><BarChart3 size={19} /></span><SectionTitle title="Wochenbild" description="Füllt sich mit deinen Check-ins." /></div>
            <div className="grid grid-cols-2 gap-3">
              {summaries.map(([label, value]) => <div className="rounded-xl bg-soft p-3.5" key={label}><p className="text-xs font-semibold text-muted">{label}</p><p className="mt-2 font-display text-xl font-semibold">{value}</p></div>)}
            </div>
          </Panel>
          <Panel className="bg-ink text-white">
            <CalendarCheck className="text-positive-light" size={24} />
            <h2 className="mt-5 font-display text-2xl font-semibold">Noch keine Daten – kein Problem.</h2>
            <p className="mt-2 text-sm leading-6 text-white/60">Nach den ersten Check-ins wird aus Gefühl ein klares Wochenbild.</p>
          </Panel>
        </div>
        <Panel>
          <SectionTitle title="Reflexion" description="Kurz, konkret und mit einer Entscheidung enden." />
          <form className="space-y-4">
            {questions.map((question) => <label className="block" key={question}><span className="text-xs font-bold uppercase tracking-wider text-muted">{question}</span><textarea className="mt-2 min-h-20 w-full resize-y rounded-xl border border-line bg-soft px-3.5 py-3 text-sm outline-none focus:border-accent focus:bg-white" /></label>)}
            <div className="border-t border-line pt-5"><p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted">Die drei Ziele für nächste Woche</p><div className="space-y-2">{[1, 2, 3].map((number) => <div className="flex items-center gap-3" key={number}><span className="grid size-8 shrink-0 place-items-center rounded-full bg-ink text-xs font-bold text-white">{number}</span><input className="w-full rounded-xl border border-line bg-soft px-3.5 py-3 text-sm outline-none focus:border-accent focus:bg-white" placeholder="Konkretes Ergebnis" /></div>)}</div></div>
            <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ink px-5 py-3.5 text-sm font-bold text-white" type="button"><Save size={17} /> Review speichern</button>
          </form>
        </Panel>
      </div>
    </>
  )
}
