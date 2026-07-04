import { CheckCircle2, CircleOff, Database, ExternalLink, ShieldCheck } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { Panel, SectionTitle } from '../components/Panel'
import { isSupabaseConfigured } from '../lib/supabaseClient'

export function Settings() {
  return (
    <>
      <PageHeader eyebrow="System" title="Einstellungen" description="Verbindungen, Datenschutz und optionale Erweiterungen an einem ruhigen Ort." />
      <div className="grid gap-5 lg:grid-cols-2">
        <Panel>
          <div className="flex items-start justify-between gap-4"><div className="flex gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#e7f4ee] text-positive"><Database size={19} /></span><SectionTitle title="Supabase" description="Authentifizierung und sichere Datenspeicherung." /></div>{isSupabaseConfigured ? <CheckCircle2 className="text-positive" size={20} /> : <CircleOff className="text-muted" size={20} />}</div>
          <div className="rounded-xl bg-soft p-4"><p className="text-sm font-bold">{isSupabaseConfigured ? 'Verbunden' : 'Noch nicht verbunden'}</p><p className="mt-1 text-xs leading-5 text-muted">{isSupabaseConfigured ? 'Die Umgebungsvariablen sind gesetzt.' : 'VITE_SUPABASE_URL und VITE_SUPABASE_ANON_KEY fehlen noch.'}</p></div>
        </Panel>
        <Panel>
          <div className="flex gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-blue-soft text-blue"><ShieldCheck size={19} /></span><SectionTitle title="Privatsphäre" description="Private Daten bleiben deinem Konto zugeordnet." /></div>
          <ul className="space-y-3 text-sm text-muted"><li className="flex gap-2"><CheckCircle2 className="mt-0.5 shrink-0 text-positive" size={16} /> Keine öffentlichen Profile oder sozialen Funktionen</li><li className="flex gap-2"><CheckCircle2 className="mt-0.5 shrink-0 text-positive" size={16} /> Row Level Security im Datenbankschema vorbereitet</li><li className="flex gap-2"><CheckCircle2 className="mt-0.5 shrink-0 text-positive" size={16} /> Keine echten Zugangsdaten im Repository</li></ul>
        </Panel>
        <Panel className="lg:col-span-2">
          <div className="flex items-center justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">Optionale Integration</p><h2 className="mt-2 font-display text-2xl font-semibold">WHOOP</h2><p className="mt-2 text-sm text-muted">Bewusst deaktiviert, bis der tägliche Kernablauf stabil funktioniert.</p></div><span className="rounded-full bg-soft px-3 py-1.5 text-xs font-bold text-muted">Später</span></div>
          <button className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-muted" disabled type="button">Mehr erfahren <ExternalLink size={14} /></button>
        </Panel>
      </div>
    </>
  )
}
