export function Privacy() {
  return (
    <main className="min-h-screen bg-paper px-6 py-10 text-ink">
      <article className="mx-auto max-w-3xl rounded-2xl border border-line bg-white p-8 shadow-card">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">ControlBase</p>
        <h1 className="mt-3 font-display text-4xl font-semibold">Privacy Policy</h1>
        <p className="mt-4 text-sm leading-7 text-muted">
          ControlBase ist ein privates Dashboard fuer persoenliche Gesundheit, Ernaehrung, Finanzen und Tagesplanung.
          Diese Seite beschreibt, wie Daten im Zusammenhang mit der WHOOP Integration verarbeitet werden.
        </p>

        <h2 className="mt-8 font-display text-2xl font-semibold">Welche WHOOP Daten genutzt werden</h2>
        <p className="mt-3 text-sm leading-7 text-muted">
          Wenn du WHOOP verbindest, liest ControlBase Recovery-, Cycle-, Schlaf- und Workout-Daten aus, soweit du diese
          Scopes im WHOOP OAuth Dialog erlaubst. Dazu koennen zum Beispiel Recovery Score, HRV, Ruhepuls, Schlafdauer,
          Schlafqualitaet, Day Strain und Trainingsdaten gehoeren.
        </p>

        <h2 className="mt-8 font-display text-2xl font-semibold">Warum diese Daten genutzt werden</h2>
        <p className="mt-3 text-sm leading-7 text-muted">
          Die Daten werden genutzt, um dein privates Gesundheits- und Ernaehrungsdashboard zu verbessern, zum Beispiel
          fuer Verlauf, Belastung, Regeneration und spaetere Anpassungen deines Wochen- und Ernaehrungsplans.
        </p>

        <h2 className="mt-8 font-display text-2xl font-semibold">Speicherung und Zugriff</h2>
        <p className="mt-3 text-sm leading-7 text-muted">
          Deine Daten werden deinem angemeldeten ControlBase Konto zugeordnet und in Supabase gespeichert. Row Level
          Security ist dafuer vorgesehen, dass nur dein eigener Account die zugeordneten Daten lesen kann. OAuth Tokens
          werden nicht im Browser gespeichert und nur serverseitig ueber Netlify Functions verarbeitet.
        </p>

        <h2 className="mt-8 font-display text-2xl font-semibold">Weitergabe</h2>
        <p className="mt-3 text-sm leading-7 text-muted">
          ControlBase verkauft keine Daten und bietet keine oeffentlichen Profile oder sozialen Funktionen. Daten werden
          nicht an Dritte weitergegeben, ausser soweit technische Anbieter wie Netlify und Supabase fuer Betrieb und
          Speicherung erforderlich sind.
        </p>

        <h2 className="mt-8 font-display text-2xl font-semibold">Verbindung trennen und Loeschung</h2>
        <p className="mt-3 text-sm leading-7 text-muted">
          Du kannst die WHOOP Verbindung in ControlBase trennen lassen oder die Loeschung gespeicherter Daten anfragen.
          Fuer Anfragen kontaktiere bitte den Betreiber dieser privaten ControlBase Instanz.
        </p>

        <h2 className="mt-8 font-display text-2xl font-semibold">Kontakt</h2>
        <p className="mt-3 text-sm leading-7 text-muted">
          Kontakt: johannes.gombert@gmail.com
        </p>

        <p className="mt-8 text-xs text-muted">Stand: Juli 2026</p>
      </article>
    </main>
  )
}
