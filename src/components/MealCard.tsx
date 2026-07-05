import { ChefHat, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { Meal } from '../services/nutrition'

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

export function MealCard({ meal }: { meal: Meal }) {
  const [open, setOpen] = useState(false)
  const steps = useMemo(() => specificSteps[meal.title] ?? genericSteps(meal), [meal])

  return (
    <>
      <button
        className="w-full rounded-xl bg-soft p-3.5 text-left transition hover:-translate-y-0.5 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-accent"
        onClick={() => setOpen(true)}
        type="button"
      >
        <div className="flex justify-between gap-2">
          <p className="text-xs font-bold text-muted">{mealTypeLabels[meal.meal_type] ?? meal.meal_type}</p>
          <p className="text-xs text-muted">
            {meal.calories} kcal - {meal.protein} g
          </p>
        </div>
        <h3 className="mt-1 font-semibold">{meal.title}</h3>
        <p className="mt-2 text-xs leading-5 text-muted">{meal.ingredients.join(' - ')}</p>
        <p className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-accent">
          <ChefHat size={13} /> Rezept ansehen
        </p>
      </button>

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
                  Rezept - {meal.calories} kcal - {meal.protein} g Protein
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
