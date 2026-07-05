import { CalendarCheck, Shield, Target } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { Panel, SectionTitle } from '../components/Panel'
import { ActionCard, StatusBadge } from '../components/ui'

export function Ceo() {
  return (
    <>
      <PageHeader eyebrow="CEO-Fokus" title="CEO" description="Strategische Zeit schützen. Operatives Rauschen begrenzen." />
      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <Panel className="bg-control-deep">
          <StatusBadge tone="ceo">Fokusbereich</StatusBadge>
          <h2 className="mt-5 text-3xl font-semibold tracking-tight">CEO-Zeit schützen.</h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
            Dieser Bereich ist für Strategie, Entscheidungen und wiederkehrende Führungsblöcke vorbereitet.
            Keine Fantasiedaten. Erst definieren, dann messen.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              ['Strategie', 'Richtung klären'],
              ['Entscheidung', 'Blocker lösen'],
              ['Review', 'System prüfen'],
            ].map(([label, note]) => (
              <div className="rounded-xl border border-line bg-soft p-4" key={label}>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted">{label}</p>
                <p className="mt-2 text-sm font-semibold text-ink">{note}</p>
              </div>
            ))}
          </div>
        </Panel>

        <div className="grid gap-5">
          <ActionCard
            action={<span className="inline-flex items-center gap-2 text-sm font-bold text-status-ceo"><CalendarCheck size={16} /> Wiederkehrende Blöcke folgen</span>}
            description="Als nächster Ausbauschritt können fixe CEO-Blöcke mit Kalenderlogik ergänzt werden."
            title="Zeitblock-System"
            tone="ceo"
          />
          <Panel>
            <SectionTitle title="Regel" description="Wenn alles wichtig ist, ist nichts geschützt." />
            <div className="flex items-center gap-3 rounded-xl border border-line bg-soft p-4">
              <span className="grid size-10 place-items-center rounded-xl bg-status-ceo/10 text-status-ceo"><Shield size={18} /></span>
              <p className="text-sm font-semibold text-ink">CEO-Zeit ist kein Puffer. Sie ist ein Termin mit dem System.</p>
            </div>
          </Panel>
          <Panel>
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-status-primary/10 text-status-primary"><Target size={18} /></span>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted">Nächster Schritt</p>
                <p className="mt-1 text-sm font-semibold text-ink">CEO-Kategorien und Wochenblöcke definieren.</p>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </>
  )
}
