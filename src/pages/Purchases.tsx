import { CalendarClock, Plus, ShieldCheck, ShoppingBag } from 'lucide-react'
import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { PageHeader } from '../components/PageHeader'
import { Panel, SectionTitle } from '../components/Panel'
import { createPurchase, listPurchases, setPurchaseStatus, type Purchase } from '../services/data'

const field = 'mt-2 w-full rounded-xl border border-line bg-soft px-3.5 py-3 text-sm outline-none focus:border-accent focus:bg-white'
const label = 'text-xs font-bold uppercase tracking-wider text-muted'
const statusLabels: Record<string, string> = { waiting: 'Wartet', allowed: 'Kaufen erlaubt', bought: 'Gekauft', rejected: 'Verworfen', postponed: 'Weiter warten' }

export function Purchases() {
  const { user } = useAuth()
  const [items, setItems] = useState<Purchase[]>([])
  const [form, setForm] = useState({ itemName: '', price: '', category: 'Technik', reason: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    if (!user) return
    try { setItems(await listPurchases(user.id)) } catch { setError('Käufe konnten nicht geladen werden. Bitte Datenbank-Setup prüfen.') }
  }, [user])
  useEffect(() => { void refresh() }, [refresh])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!user) return
    if (Number(form.price) < 300) { setError('Die 7-Tage-Regel gilt ab 300 CHF.'); return }
    setSaving(true); setError('')
    try {
      await createPurchase(user.id, form)
      setForm({ itemName: '', price: '', category: 'Technik', reason: '' })
      await refresh()
    } catch { setError('Kauf konnte nicht gespeichert werden.') } finally { setSaving(false) }
  }

  const changeStatus = async (id: string, status: string) => {
    try { await setPurchaseStatus(id, status); await refresh() } catch { setError('Status konnte nicht geändert werden.') }
  }

  return (
    <>
      <PageHeader eyebrow="Impulskontrolle" title="Käufe" description="Was mehr als 300 CHF kostet, bekommt sieben Tage Abstand. Klarheit ist billiger als Reue." />
      <div className="grid gap-5 xl:grid-cols-[0.85fr_1.3fr]">
        <Panel>
          <SectionTitle title="Kauf parken" description="Noch keine Entscheidung. Nur sauber erfassen." />
          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="block"><span className={label}>Artikel</span><input className={field} onChange={(event) => setForm({ ...form, itemName: event.target.value })} placeholder="Was willst du kaufen?" required value={form.itemName} /></label>
            <div className="grid grid-cols-2 gap-3">
              <label><span className={label}>Preis (CHF)</span><input className={field} min="300" onChange={(event) => setForm({ ...form, price: event.target.value })} placeholder="300" required type="number" value={form.price} /></label>
              <label><span className={label}>Kategorie</span><select className={field} onChange={(event) => setForm({ ...form, category: event.target.value })} value={form.category}><option>Technik</option><option>Gesundheit</option><option>Freizeit</option><option>Business</option><option>Sonstiges</option></select></label>
            </div>
            <label className="block"><span className={label}>Warum will ich es?</span><textarea className={`${field} min-h-24 resize-y`} onChange={(event) => setForm({ ...form, reason: event.target.value })} placeholder="Der ehrliche Grund, nicht die Verkaufsstory." value={form.reason} /></label>
            {error && <p className="text-sm font-semibold text-red-700">{error}</p>}
            <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ink px-4 py-3.5 text-sm font-bold text-white disabled:opacity-60" disabled={saving} type="submit"><Plus size={17} /> {saving ? 'Speichert …' : '7-Tage-Regel starten'}</button>
          </form>
        </Panel>

        <div className="space-y-5">
          <Panel className="bg-blue text-white"><div className="flex items-start gap-4"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/10"><ShieldCheck size={21} /></span><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-white/60">Deine Regel</p><h2 className="mt-2 font-display text-2xl font-semibold">Sieben Tage zwischen Wunsch und Entscheidung.</h2><p className="mt-2 text-sm leading-6 text-white/65">Danach drei Fragen: Will ich es noch? Zahlt es auf mein Leben ein? Bleibt die Sparquote intakt?</p></div></div></Panel>
          <Panel>
            <div className="flex items-center justify-between"><SectionTitle title="Warteschleife" description="Gespeichert und nach Entscheidungsdatum sortiert." /><span className="rounded-full bg-soft px-3 py-1 text-xs font-bold text-muted">{items.length} Käufe</span></div>
            {items.length === 0 ? <div className="grid min-h-64 place-items-center text-center"><div><span className="mx-auto grid size-14 place-items-center rounded-2xl bg-soft text-muted"><ShoppingBag size={24} /></span><h2 className="mt-5 font-display text-2xl font-semibold">Keine Käufe in der Warteschleife</h2><p className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-muted"><CalendarClock size={14} /> 7-Tage-Regel bereit</p></div></div> : <div className="space-y-3">{items.map((item) => <article className="rounded-xl border border-line bg-soft p-4" key={item.id}><div className="flex items-start justify-between gap-3"><div><h3 className="font-bold">{item.item_name}</h3><p className="mt-1 text-sm text-muted">{item.price?.toLocaleString('de-CH')} CHF · Entscheidung ab {new Date(`${item.earliest_decision_date}T12:00:00`).toLocaleDateString('de-CH')}</p>{item.reason && <p className="mt-2 text-sm">{item.reason}</p>}</div><select aria-label={`Status für ${item.item_name}`} className="rounded-lg border border-line bg-white px-2 py-2 text-xs font-semibold" onChange={(event) => void changeStatus(item.id, event.target.value)} value={item.status}>{Object.entries(statusLabels).map(([value, text]) => <option key={value} value={value}>{text}</option>)}</select></div></article>)}</div>}
          </Panel>
        </div>
      </div>
    </>
  )
}
