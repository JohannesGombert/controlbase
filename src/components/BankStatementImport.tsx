import { FileUp, Loader2, UploadCloud } from 'lucide-react'
import { useMemo, useState } from 'react'
import { parseBankStatement, type ParsedBankTransaction } from '../services/bankImport'
import { importTransactions, type FinanceAccount } from '../services/finance'
import { Panel, SectionTitle } from './Panel'

const field = 'mt-2 w-full rounded-xl border border-line bg-soft px-3.5 py-3 text-sm outline-none focus:border-accent focus:bg-white'
const label = 'text-xs font-bold uppercase tracking-wider text-muted'
const categories = [
  'Lebensmittel',
  'Lohn',
  'Transfer',
  'Versicherungen',
  'Steuern',
  'Mobilitaet',
  'Bargeld',
  'Shopping',
  'TWINT',
  'Rueckerstattung',
  'Gebuehren',
  'Sonstiges',
]

function money(value: number) {
  return new Intl.NumberFormat('de-CH', { style: 'currency', currency: 'CHF', maximumFractionDigits: 2 }).format(value)
}

function typeLabel(type: ParsedBankTransaction['transactionType']) {
  if (type === 'income') return 'Einnahme'
  if (type === 'transfer') return 'Transfer'
  return 'Ausgabe'
}

function monthKey(date: string) {
  return date.slice(0, 7)
}

function monthLabel(key: string) {
  return new Date(`${key}-01T12:00:00`).toLocaleDateString('de-CH', { month: 'long', year: 'numeric' })
}

export function BankStatementImport({
  accounts,
  onImported,
  userId,
}: {
  accounts: FinanceAccount[]
  onImported: (month?: string) => Promise<void>
  userId: string
}) {
  const [accountId, setAccountId] = useState('')
  const [rows, setRows] = useState<ParsedBankTransaction[]>([])
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [activeMonth, setActiveMonth] = useState('all')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const selectedRows = useMemo(() => rows.filter((row) => selected[row.id]), [rows, selected])
  const summary = useMemo(
    () =>
      selectedRows.reduce(
        (result, row) => {
          result.count += 1
          if (row.transactionType === 'income') result.income += row.amount
          if (row.transactionType === 'expense') result.expenses += row.amount
          if (row.transactionType === 'transfer') result.transfers += row.amount
          return result
        },
        { count: 0, income: 0, expenses: 0, transfers: 0 },
      ),
    [selectedRows],
  )
  const monthSummaries = useMemo(() => {
    const summaries = rows.reduce<Record<string, { count: number; selected: number; income: number; expenses: number; transfers: number }>>(
      (result, row) => {
        const key = monthKey(row.bookingDate)
        const current = result[key] ?? { count: 0, selected: 0, income: 0, expenses: 0, transfers: 0 }
        current.count += 1
        if (selected[row.id]) {
          current.selected += 1
          if (row.transactionType === 'income') current.income += row.amount
          if (row.transactionType === 'expense') current.expenses += row.amount
          if (row.transactionType === 'transfer') current.transfers += row.amount
        }
        result[key] = current
        return result
      },
      {},
    )
    return Object.entries(summaries).sort(([left], [right]) => right.localeCompare(left))
  }, [rows, selected])
  const visibleRows = useMemo(
    () => (activeMonth === 'all' ? rows : rows.filter((row) => monthKey(row.bookingDate) === activeMonth)),
    [activeMonth, rows],
  )

  async function handleFile(file: File | null) {
    if (!file) return
    setLoading(true)
    setMessage('')
    try {
      const parsed = await parseBankStatement(file)
      setRows(parsed)
      setSelected(Object.fromEntries(parsed.map((row) => [row.id, true])))
      const newestMonth = parsed.map((row) => monthKey(row.bookingDate)).sort().at(-1) ?? 'all'
      setActiveMonth(newestMonth)
      const monthCount = new Set(parsed.map((row) => monthKey(row.bookingDate))).size
      setMessage(
        `${parsed.length} Buchungen in ${monthCount} Monat${monthCount === 1 ? '' : 'en'} erkannt. Jede Buchung wird anhand des Buchungsdatums dem richtigen Monat zugeordnet.`,
      )
    } catch (error) {
      setRows([])
      setSelected({})
      setActiveMonth('all')
      setMessage(error instanceof Error ? error.message : 'PDF konnte nicht gelesen werden.')
    } finally {
      setLoading(false)
    }
  }

  async function saveSelected() {
    if (!selectedRows.length) return
    setSaving(true)
    setMessage('')
    try {
      await importTransactions(
        userId,
        selectedRows.map((row) => ({
          accountId,
          amount: row.amount,
          category: row.category,
          date: row.bookingDate,
          description: row.description,
          importHash: row.importHash,
          originalDescription: row.originalDescription,
          source: row.source,
          type: row.transactionType,
        })),
      )
      const newestImportedMonth = selectedRows.map((row) => monthKey(row.bookingDate)).sort().at(-1)
      setRows([])
      setSelected({})
      setActiveMonth('all')
      setMessage('Import abgeschlossen. Die Bewegungen wurden anhand ihres Buchungsdatums in die jeweiligen Monate einsortiert.')
      await onImported(newestImportedMonth)
    } catch {
      setMessage('Import fehlgeschlagen. Bitte finance_import_schema.sql in Supabase ausfuehren und erneut versuchen.')
    } finally {
      setSaving(false)
    }
  }

  function updateRow(id: string, patch: Partial<ParsedBankTransaction>) {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, ...patch } : row)))
  }

  return (
    <Panel className="mt-5">
      <SectionTitle
        description="UBS-Kontoauszug als PDF hochladen, automatisch erkennen lassen und erst nach deiner Kontrolle importieren."
        title="Kontoauszug importieren"
      />

      <div className="grid gap-3 lg:grid-cols-[0.7fr_1fr_auto]">
        <label>
          <span className={label}>Zielkonto</span>
          <select className={field} onChange={(event) => setAccountId(event.target.value)} value={accountId}>
            <option value="">Kein Konto zuordnen</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className={label}>PDF-Datei</span>
          <span className="mt-2 flex min-h-[46px] cursor-pointer items-center gap-3 rounded-xl border border-dashed border-line bg-soft px-3.5 py-3 text-sm text-muted hover:bg-white">
            <FileUp size={17} />
            Kontoauszug auswaehlen
            <input
              accept="application/pdf"
              className="sr-only"
              disabled={loading}
              onChange={(event) => void handleFile(event.target.files?.[0] ?? null)}
              type="file"
            />
          </span>
        </label>

        <button
          className="mt-auto inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-ink px-5 text-sm font-bold text-white disabled:opacity-60"
          disabled={!selectedRows.length || saving}
          onClick={() => void saveSelected()}
          type="button"
        >
          {saving ? <Loader2 className="animate-spin" size={17} /> : <UploadCloud size={17} />}
          Importieren
        </button>
      </div>

      {loading && <p className="mt-4 text-sm text-muted">PDF wird gelesen und Buchungen werden erkannt ...</p>}
      {message && <p className="mt-4 rounded-xl bg-soft px-4 py-3 text-sm font-semibold text-muted">{message}</p>}

      {rows.length > 0 && (
        <>
          <div className="mt-5 grid gap-3 sm:grid-cols-4">
            <div className="rounded-xl bg-soft p-4">
              <p className="text-xs text-muted">Auswahl</p>
              <p className="mt-1 font-display text-2xl font-semibold">{summary.count}</p>
            </div>
            <div className="rounded-xl bg-soft p-4">
              <p className="text-xs text-muted">Einnahmen</p>
              <p className="mt-1 font-display text-2xl font-semibold text-positive">{money(summary.income)}</p>
            </div>
            <div className="rounded-xl bg-soft p-4">
              <p className="text-xs text-muted">Ausgaben</p>
              <p className="mt-1 font-display text-2xl font-semibold text-red-700">{money(summary.expenses)}</p>
            </div>
            <div className="rounded-xl bg-soft p-4">
              <p className="text-xs text-muted">Transfers</p>
              <p className="mt-1 font-display text-2xl font-semibold text-accent">{money(summary.transfers)}</p>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-line bg-soft p-3">
            <div className="flex flex-wrap gap-2">
              <button
                className={`rounded-full px-3 py-1.5 text-xs font-bold ${activeMonth === 'all' ? 'bg-ink text-white' : 'bg-white text-muted'}`}
                onClick={() => setActiveMonth('all')}
                type="button"
              >
                Alle Monate · {rows.length}
              </button>
              {monthSummaries.map(([key, month]) => (
                <button
                  className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                    activeMonth === key ? 'bg-ink text-white' : 'bg-white text-muted'
                  }`}
                  key={key}
                  onClick={() => setActiveMonth(key)}
                  type="button"
                >
                  {monthLabel(key)} · {month.selected}/{month.count}
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs leading-5 text-muted">
              Der Monatsfilter dient nur der Kontrolle. Beim Import wird jede ausgewaehlte Buchung mit ihrem echten Datum gespeichert
              und erscheint danach automatisch im passenden Monatsfilter oben rechts.
            </p>
          </div>

          <div className="mt-5 max-h-[520px] overflow-auto rounded-xl border border-line">
            {visibleRows.map((row) => (
              <div className="grid gap-3 border-b border-line p-3 last:border-b-0 lg:grid-cols-[auto_0.7fr_1.8fr_0.8fr_0.8fr_0.7fr]" key={row.id}>
                <input
                  aria-label={`${row.description} auswaehlen`}
                  checked={Boolean(selected[row.id])}
                  className="mt-3 size-4"
                  onChange={(event) => setSelected((current) => ({ ...current, [row.id]: event.target.checked }))}
                  type="checkbox"
                />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Datum</p>
                  <p className="mt-1 text-sm font-semibold">{new Date(`${row.bookingDate}T12:00:00`).toLocaleDateString('de-CH')}</p>
                </div>
                <label>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted">Beschreibung</span>
                  <input
                    className="mt-1 w-full rounded-lg border border-line bg-white px-2 py-2 text-sm"
                    onChange={(event) => updateRow(row.id, { description: event.target.value })}
                    value={row.description}
                  />
                </label>
                <label>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted">Art</span>
                  <select
                    className="mt-1 w-full rounded-lg border border-line bg-white px-2 py-2 text-sm"
                    onChange={(event) =>
                      updateRow(row.id, { transactionType: event.target.value as ParsedBankTransaction['transactionType'] })
                    }
                    value={row.transactionType}
                  >
                    <option value="expense">Ausgabe</option>
                    <option value="income">Einnahme</option>
                    <option value="transfer">Transfer</option>
                  </select>
                </label>
                <label>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted">Kategorie</span>
                  <select
                    className="mt-1 w-full rounded-lg border border-line bg-white px-2 py-2 text-sm"
                    onChange={(event) => updateRow(row.id, { category: event.target.value })}
                    value={row.category}
                  >
                    {categories.map((category) => (
                      <option key={category}>{category}</option>
                    ))}
                  </select>
                </label>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Betrag</p>
                  <p
                    className={`mt-2 text-sm font-bold ${
                      row.transactionType === 'income'
                        ? 'text-positive'
                        : row.transactionType === 'transfer'
                          ? 'text-accent'
                          : 'text-red-700'
                    }`}
                  >
                    {typeLabel(row.transactionType)} · {money(row.amount)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </Panel>
  )
}
