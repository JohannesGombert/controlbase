import { Activity, Apple, Save, Scale, Target } from 'lucide-react'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { PageHeader } from '../components/PageHeader'
import { Panel, SectionTitle } from '../components/Panel'
import { emptyHealthProfile, loadHealthProfile, saveHealthProfile, type HealthProfile } from '../services/health'

const field = 'mt-2 w-full rounded-xl border border-line bg-soft px-3.5 py-3 text-sm outline-none focus:border-accent focus:bg-white'
const label = 'text-xs font-bold uppercase tracking-wider text-muted'

export function Health() {
  const { user } = useAuth()
  const [form, setForm] = useState<HealthProfile>(emptyHealthProfile)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  useEffect(() => { if (user) void loadHealthProfile(user.id).then(setForm).catch(() => setError('Profil konnte nicht geladen werden. Bitte health_profile_schema.sql ausführen.')).finally(() => setLoading(false)) }, [user])
  const update = <K extends keyof HealthProfile>(key: K, value: HealthProfile[K]) => setForm((current) => ({ ...current, [key]: value }))
  const projection = useMemo(() => { const difference = Number(form.currentWeight) - Number(form.targetWeight); const rate = Number(form.weeklyWeightLoss); return difference > 0 && rate > 0 ? Math.ceil(difference / rate) : 0 }, [form.currentWeight, form.targetWeight, form.weeklyWeightLoss])
  const submit = async (event: FormEvent) => { event.preventDefault(); if (!user) return; setSaving(true); setError(''); setMessage(''); try { await saveHealthProfile(user.id, form); setMessage('Abnehmprofil wurde gespeichert.') } catch { setError('Profil konnte nicht gespeichert werden.') } finally { setSaving(false) } }

  return <><PageHeader eyebrow="Gesundheit & Ernährung" title="Dein Abnehmprofil" description="Die Grundlage für Gewichtstrend, Ernährungsplan und spätere WHOOP-Anpassungen." />
    {loading ? <Panel><p className="text-sm text-muted">Profil wird geladen …</p></Panel> : <form className="space-y-5" onSubmit={submit}>
      <div className="grid gap-4 sm:grid-cols-3">
        <Panel className="p-4 sm:p-5"><Scale className="text-accent" size={19} /><p className="mt-4 text-xs font-semibold text-muted">Aktuelles Gewicht</p><p className="mt-1 font-display text-3xl font-semibold">{form.currentWeight || '–'} <span className="text-base">kg</span></p></Panel>
        <Panel className="p-4 sm:p-5"><Target className="text-positive" size={19} /><p className="mt-4 text-xs font-semibold text-muted">Zielgewicht</p><p className="mt-1 font-display text-3xl font-semibold">{form.targetWeight || '–'} <span className="text-base">kg</span></p></Panel>
        <Panel className="p-4 sm:p-5"><Activity className="text-blue" size={19} /><p className="mt-4 text-xs font-semibold text-muted">Orientierungszeitraum</p><p className="mt-1 font-display text-3xl font-semibold">{projection || '–'} <span className="text-base">Wochen</span></p></Panel>
      </div>
      <Panel><SectionTitle title="Körper & Ziel" description="Diese Angaben bestimmen später den sicheren Ausgangsrahmen." /><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label><span className={label}>Aktuelles Gewicht (kg)</span><input className={field} min="30" onChange={(e) => update('currentWeight', e.target.value)} required step="0.1" type="number" value={form.currentWeight} /></label>
        <label><span className={label}>Zielgewicht (kg)</span><input className={field} min="30" onChange={(e) => update('targetWeight', e.target.value)} required step="0.1" type="number" value={form.targetWeight} /></label>
        <label><span className={label}>Größe (cm)</span><input className={field} min="120" onChange={(e) => update('heightCm', e.target.value)} required type="number" value={form.heightCm} /></label>
        <label><span className={label}>Geburtsdatum</span><input className={field} onChange={(e) => update('birthDate', e.target.value)} type="date" value={form.birthDate} /></label>
        <label><span className={label}>Geschlecht</span><select className={field} onChange={(e) => update('sex', e.target.value)} value={form.sex}><option value="unspecified">Keine Angabe</option><option value="male">Männlich</option><option value="female">Weiblich</option><option value="diverse">Divers</option></select></label>
        <label><span className={label}>Zieltempo pro Woche</span><select className={field} onChange={(e) => update('weeklyWeightLoss', e.target.value)} value={form.weeklyWeightLoss}><option value="0.25">0,25 kg · sanft</option><option value="0.5">0,5 kg · ausgewogen</option><option value="0.75">0,75 kg · ambitioniert</option><option value="1">1,0 kg · obere Grenze</option></select></label>
      </div></Panel>
      <Panel><div className="flex gap-4"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#e7f4ee] text-positive"><Apple size={20} /></span><SectionTitle title="Ernährungsrahmen" description="Damit der spätere Wochenplan wirklich zu deinem Alltag passt." /></div><div className="grid gap-4 sm:grid-cols-3">
        <label><span className={label}>Aktivität</span><select className={field} onChange={(e) => update('activityLevel', e.target.value)} value={form.activityLevel}><option value="low">Überwiegend sitzend</option><option value="light">Leicht aktiv</option><option value="moderate">Moderat aktiv</option><option value="high">Sehr aktiv</option><option value="very_high">Leistungssport</option></select></label>
        <label><span className={label}>Ernährungsform</span><select className={field} onChange={(e) => update('dietStyle', e.target.value)} value={form.dietStyle}><option value="balanced">Ausgewogen</option><option value="mediterranean">Mediterran</option><option value="vegetarian">Vegetarisch</option><option value="vegan">Vegan</option><option value="low_carb">Low Carb</option><option value="other">Andere</option></select></label>
        <label><span className={label}>Mahlzeiten pro Tag</span><select className={field} onChange={(e) => update('mealsPerDay', e.target.value)} value={form.mealsPerDay}>{[2,3,4,5,6].map(n => <option key={n}>{n}</option>)}</select></label>
        <label><span className={label}>Allergien & Unverträglichkeiten</span><textarea className={`${field} min-h-24`} onChange={(e) => update('allergies', e.target.value)} placeholder="z. B. Laktose, Nüsse" value={form.allergies} /></label>
        <label><span className={label}>Mag ich nicht</span><textarea className={`${field} min-h-24`} onChange={(e) => update('dislikes', e.target.value)} placeholder="Lebensmittel ausschließen" value={form.dislikes} /></label>
        <label><span className={label}>Weitere Hinweise</span><textarea className={`${field} min-h-24`} onChange={(e) => update('notes', e.target.value)} placeholder="Arbeitszeiten, Kochzeit, Besonderheiten" value={form.notes} /></label>
      </div></Panel>
      <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center"><div>{message && <p className="text-sm font-semibold text-positive">{message}</p>}{error && <p className="text-sm font-semibold text-red-700">{error}</p>}</div><button className="inline-flex items-center justify-center gap-2 rounded-xl bg-ink px-5 py-3.5 text-sm font-bold text-white disabled:opacity-60" disabled={saving} type="submit"><Save size={17} /> {saving ? 'Speichert …' : 'Abnehmprofil speichern'}</button></div>
    </form>}</>
}
