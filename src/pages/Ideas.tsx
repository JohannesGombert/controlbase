import { Archive, Lightbulb, Plus, Sparkles } from 'lucide-react'
import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { PageHeader } from '../components/PageHeader'
import { Panel, SectionTitle } from '../components/Panel'
import { createIdea, listIdeas, setIdeaStatus, type Idea } from '../services/data'

const field = 'mt-2 w-full rounded-xl border border-line bg-soft px-3.5 py-3 text-sm outline-none focus:border-accent focus:bg-control-hover'
const label = 'text-xs font-bold uppercase tracking-wider text-muted'
const statusLabels: Record<string, string> = { parked: 'Geparkt', review: 'Prüfen', start: 'Starten', delete: 'Löschen' }

export function Ideas() {
  const { user } = useAuth()
  const [items, setItems] = useState<Idea[]>([])
  const [form, setForm] = useState({ idea: '', category: 'Business', importance: 3, effort: 3, benefit: 3 })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    if (!user) return
    try { setItems(await listIdeas(user.id)) } catch { setError('Ideen konnten nicht geladen werden. Bitte Datenbank-Setup prüfen.') }
  }, [user])
  useEffect(() => { void refresh() }, [refresh])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!user) return
    setSaving(true); setError('')
    try {
      await createIdea(user.id, form)
      setForm({ idea: '', category: 'Business', importance: 3, effort: 3, benefit: 3 })
      await refresh()
    } catch { setError('Idee konnte nicht gespeichert werden.') } finally { setSaving(false) }
  }

  const changeStatus = async (id: string, status: string) => {
    try { await setIdeaStatus(id, status); await refresh() } catch { setError('Status konnte nicht geändert werden.') }
  }

  return (
    <>
      <PageHeader eyebrow="Ideen-Parkplatz" title="Ideen" description="Gute Ideen verdienen einen Platz – aber nicht automatisch deine Woche." />
      <div className="mb-5 flex items-start gap-3 rounded-2xl border border-warning/20 bg-warning/10 px-4 py-3.5 text-sm text-status-warning"><Sparkles className="mt-0.5 shrink-0" size={17} /><p><strong>Nicht sofort starten.</strong> Erst parken, dann im Review bewerten.</p></div>
      <div className="grid gap-5 xl:grid-cols-[0.85fr_1.3fr]">
        <Panel>
          <SectionTitle title="Idee festhalten" description="60 Sekunden. Roh reicht völlig." />
          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="block"><span className={label}>Idee</span><textarea className={`${field} min-h-28 resize-y`} onChange={(event) => setForm({ ...form, idea: event.target.value })} placeholder="Was ist dir gerade eingefallen?" required value={form.idea} /></label>
            <label className="block"><span className={label}>Kategorie</span><select className={field} onChange={(event) => setForm({ ...form, category: event.target.value })} value={form.category}><option>Business</option><option>Gesundheit</option><option>Privat</option><option>Finanzen</option><option>Sonstiges</option></select></label>
            <div className="grid grid-cols-3 gap-2">
              {(['importance', 'effort', 'benefit'] as const).map((key, index) => <label key={key}><span className="text-[10px] font-bold uppercase tracking-wide text-muted">{['Wichtigkeit', 'Aufwand', 'Nutzen'][index]}</span><select className={field} onChange={(event) => setForm({ ...form, [key]: Number(event.target.value) })} value={form[key]}>{[1, 2, 3, 4, 5].map((number) => <option key={number}>{number}</option>)}</select></label>)}
            </div>
            {error && <p className="text-sm font-semibold text-status-danger">{error}</p>}
            <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-control-deep px-4 py-3.5 text-sm font-bold text-white disabled:opacity-60" disabled={saving} type="submit"><Plus size={17} /> {saving ? 'Speichert …' : 'Idee parken'}</button>
          </form>
        </Panel>
        <Panel>
          <div className="flex items-center justify-between"><SectionTitle title="Geparkte Ideen" description="Im Wochenreview wird entschieden." /><span className="rounded-full bg-soft px-3 py-1 text-xs font-bold text-muted">{items.length} Ideen</span></div>
          {items.length === 0 ? <div className="grid min-h-80 place-items-center text-center"><div><span className="mx-auto grid size-14 place-items-center rounded-2xl bg-soft text-accent"><Archive size={24} /></span><h2 className="mt-5 font-display text-2xl font-semibold">Der Parkplatz ist leer</h2><p className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-accent"><Lightbulb size={14} /> Parken ist eine Entscheidung</p></div></div> : <div className="space-y-3">{items.map((item) => <article className="rounded-xl border border-line bg-soft p-4" key={item.id}><div className="flex items-start justify-between gap-3"><div><h3 className="font-bold">{item.idea}</h3><p className="mt-1 text-xs text-muted">{item.category} · Wichtigkeit {item.importance} · Aufwand {item.effort} · Nutzen {item.benefit}</p></div><select aria-label={`Status für ${item.idea}`} className="rounded-lg border border-line bg-control-surface px-2 py-2 text-xs font-semibold" onChange={(event) => void changeStatus(item.id, event.target.value)} value={item.status}>{Object.entries(statusLabels).map(([value, text]) => <option key={value} value={value}>{text}</option>)}</select></div></article>)}</div>}
        </Panel>
      </div>
    </>
  )
}
