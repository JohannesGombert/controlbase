import { Camera, Check, ChefHat, Loader2, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { saveMealPhotoEstimate, setMealEaten, type Meal } from '../services/nutrition'

const mealTypeLabels: Record<string, string> = {
  breakfast: 'Fruehstueck',
  lunch: 'Mittagessen',
  dinner: 'Abendessen',
  snack: 'Snack',
}

const specificSteps: Record<string, string[]> = {
  'Skyr-Bowl mit Beeren': [
    'Skyr in eine Schuessel geben und cremig ruehren.',
    'Haferflocken und Beeren darauf verteilen.',
    'Nuesse grob hacken und als Topping daruebergeben.',
  ],
  'Poulet-Reis-Gemuese-Bowl': [
    'Reis nach Packungsangabe garen.',
    'Poulet wuerzen und in einer Pfanne vollstaendig durchbraten.',
    'Gemuese anbraten oder daempfen und alles mit Olivenoel auf Meal-Prep-Boxen verteilen.',
  ],
  'Lachs mit Kartoffeln und Brokkoli': [
    'Kartoffeln schneiden, wuerzen und bei 200 Grad etwa 30 Minuten backen.',
    'Lachs wuerzen und die letzten 12 bis 15 Minuten mitgaren.',
    'Brokkoli daempfen und gemeinsam portionieren.',
  ],
}

function genericSteps(meal: Meal) {
  const title = meal.title.toLowerCase()
  if (meal.meal_type === 'breakfast' || title.includes('bowl') || title.includes('porridge') || title.includes('oats')) {
    return [
      'Zutaten abwiegen und kalte Komponenten direkt in eine Schuessel oder Box geben.',
      'Warme Komponenten wie Porridge kurz kochen oder vorbereiten.',
      'Toppings erst kurz vor dem Essen zugeben, damit die Textur gut bleibt.',
    ]
  }
  if (title.includes('curry') || title.includes('chili') || title.includes('eintopf')) {
    return [
      'Basis wie Reis, Kartoffeln oder Pasta separat garen.',
      'Proteinquelle und Gemuese in einer grossen Pfanne oder einem Topf anbraten.',
      'Sauce oder Tomaten zugeben, koecheln lassen und in Meal-Prep-Portionen aufteilen.',
    ]
  }
  if (title.includes('salat') || title.includes('bowl')) {
    return [
      'Sattmacher wie Reis, Couscous, Quinoa oder Kartoffeln vorgaren.',
      'Proteinquelle braten, backen oder kalt vorbereiten.',
      'Salat und Sauce getrennt lagern und erst beim Essen mischen.',
    ]
  }
  if (title.includes('blech') || title.includes('ofen')) {
    return [
      'Gemuese und Staerkequelle schneiden, wuerzen und auf einem Blech verteilen.',
      'Proteinquelle dazugeben oder separat garen.',
      'Bei 190 bis 210 Grad backen, abkuehlen lassen und portionieren.',
    ]
  }
  return [
    'Alle Zutaten vorbereiten und die Portionen passend abwiegen.',
    'Proteinquelle zuerst garen, danach Gemuese und Kohlenhydrate ergaenzen.',
    'Abschmecken, abkuehlen lassen und fuer Meal-Prep sauber portionieren.',
  ]
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Foto konnte nicht gelesen werden.'))
    reader.onload = () => {
      const image = new Image()
      image.onerror = () => resolve(String(reader.result))
      image.onload = () => {
        const maxSize = 900
        const scale = Math.min(1, maxSize / Math.max(image.width, image.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(image.width * scale)
        canvas.height = Math.round(image.height * scale)
        const context = canvas.getContext('2d')
        if (!context) {
          resolve(String(reader.result))
          return
        }
        context.drawImage(image, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.74))
      }
      image.src = String(reader.result)
    }
    reader.readAsDataURL(file)
  })
}

export function MealCard({ meal, onChanged }: { meal: Meal; onChanged?: () => void | Promise<void> }) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const steps = useMemo(() => specificSteps[meal.title] ?? genericSteps(meal), [meal])
  const eaten = Boolean(meal.eaten_at)
  const calories = meal.photo_calorie_estimate ?? meal.calories
  const protein = meal.photo_protein_estimate ?? meal.protein

  const toggleEaten = async () => {
    setSaving(true)
    setError('')
    try {
      await setMealEaten(meal, !eaten)
      await onChanged?.()
    } catch {
      setError('Status konnte nicht gespeichert werden. Bitte Supabase-Schema aktualisieren.')
    } finally {
      setSaving(false)
    }
  }

  const uploadPhoto = async (file: File | undefined) => {
    if (!file) return
    setSaving(true)
    setError('')
    try {
      const dataUrl = await fileToDataUrl(file)
      await saveMealPhotoEstimate(meal, dataUrl)
      await onChanged?.()
    } catch {
      setError('Foto konnte nicht gespeichert werden. Bitte Supabase-Schema aktualisieren.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <article
        className={`w-full rounded-xl border p-3.5 text-left transition hover:-translate-y-0.5 hover:shadow-sm ${eaten ? 'border-positive/25 bg-[#e7f4ee]' : 'border-transparent bg-soft'}`}
        onClick={() => setOpen(true)}
        role="button"
        tabIndex={0}
      >
        <div className="flex justify-between gap-2">
          <p className="text-xs font-bold text-muted">{mealTypeLabels[meal.meal_type] ?? meal.meal_type}</p>
          <p className="text-xs text-muted">
            {calories} kcal - {protein} g
          </p>
        </div>
        <h3 className="mt-1 font-semibold">{meal.title}</h3>
        <p className="mt-2 text-xs leading-5 text-muted">{meal.ingredients.join(' - ')}</p>
        {meal.photo_data_url && (
          <img alt={`Foto von ${meal.title}`} className="mt-3 h-28 w-full rounded-xl object-cover" src={meal.photo_data_url} />
        )}
        {error && <p className="mt-2 text-xs font-semibold text-red-700">{error}</p>}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold ${eaten ? 'bg-positive text-white' : 'border border-line bg-white text-muted'}`}
            disabled={saving}
            onClick={(event) => {
              event.stopPropagation()
              void toggleEaten()
            }}
            type="button"
          >
            {saving ? <Loader2 className="animate-spin" size={13} /> : eaten ? <Check size={13} /> : <Check size={13} />}
            {eaten ? 'Gegessen' : 'Als gegessen markieren'}
          </button>
          <label
            className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-line bg-white px-3 py-1.5 text-xs font-bold text-muted"
            onClick={(event) => event.stopPropagation()}
          >
            <Camera size={13} /> Foto
            <input
              accept="image/*"
              className="sr-only"
              disabled={saving}
              onChange={(event) => void uploadPhoto(event.target.files?.[0])}
              type="file"
            />
          </label>
          <button
            className="inline-flex items-center gap-1 rounded-full px-2 py-1.5 text-xs font-bold text-accent"
            onClick={(event) => {
              event.stopPropagation()
              setOpen(true)
            }}
            type="button"
          >
            <ChefHat size={13} /> Rezept
          </button>
        </div>
      </article>

      {open && (
        <div
          className="fixed inset-0 z-[80] grid place-items-center bg-ink/55 p-4"
          onMouseDown={() => setOpen(false)}
          role="presentation"
        >
          <article
            aria-modal="true"
            className="max-h-[90dvh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
            onMouseDown={(event) => event.stopPropagation()}
            role="dialog"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-accent">
                  Rezept - {calories} kcal - {protein} g Protein
                </p>
                <h2 className="mt-2 font-display text-3xl font-semibold">{meal.title}</h2>
              </div>
              <button
                aria-label="Rezept schliessen"
                className="grid size-9 place-items-center rounded-full bg-soft"
                onClick={() => setOpen(false)}
                type="button"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button
                className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold ${eaten ? 'bg-positive text-white' : 'border border-line bg-soft text-ink'}`}
                disabled={saving}
                onClick={() => void toggleEaten()}
                type="button"
              >
                {saving ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
                {eaten ? 'Gegessen' : 'Als gegessen markieren'}
              </button>
              <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-line bg-soft px-4 py-3 text-sm font-bold">
                <Camera size={16} /> Foto hochladen
                <input
                  accept="image/*"
                  className="sr-only"
                  disabled={saving}
                  onChange={(event) => void uploadPhoto(event.target.files?.[0])}
                  type="file"
                />
              </label>
            </div>

            {meal.photo_data_url && (
              <div className="mt-5">
                <img alt={`Foto von ${meal.title}`} className="max-h-72 w-full rounded-2xl object-cover" src={meal.photo_data_url} />
                <p className="mt-2 text-xs leading-5 text-muted">
                  {meal.photo_analysis_note ?? 'Kalorien sind eine Schaetzung.'}
                </p>
              </div>
            )}

            <h3 className="mt-6 font-bold">Zutaten pro Portion</h3>
            <ul className="mt-2 space-y-2 text-sm text-muted">
              {meal.ingredients.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>

            <h3 className="mt-6 font-bold">Zubereitung</h3>
            <ol className="mt-2 space-y-3">
              {steps.map((step, index) => (
                <li className="flex gap-3 text-sm leading-6" key={step}>
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-ink text-xs font-bold text-white">
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>

            <div className="mt-6 rounded-xl bg-[#e7f4ee] p-4 text-sm leading-6 text-positive">
              <strong>Meal-Prep:</strong> Fuer zwei bis drei Tage vorkochen, rasch abkuehlen und gekuehlt lagern.
              Fischgerichte am besten frueher im Block essen.
            </div>
          </article>
        </div>
      )}
    </>
  )
}
