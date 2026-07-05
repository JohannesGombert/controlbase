import { endOfMonth, format, startOfMonth } from 'date-fns'
import { BarChart3, Filter } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { loadFinanceTransactionsRange, type FinanceTransaction } from '../services/finance'
import { Panel, SectionTitle } from './Panel'

const field = 'mt-2 w-full rounded-xl border border-line bg-soft px-3.5 py-3 text-sm outline-none focus:border-accent focus:bg-white'
const label = 'text-xs font-bold uppercase tracking-wider text-muted'

type PeriodMode = 'year' | 'month' | 'custom'
type GroupMode = 'month' | 'category' | 'type'

function money(value: number) {
  return new Intl.NumberFormat('de-CH', { style: 'currency', currency: 'CHF', maximumFractionDigits: 2 }).format(value)
}

function todayYear() {
  return String(new Date().getFullYear())
}

function monthName(key: string) {
  return new Date(`${key}-01T12:00:00`).toLocaleDateString('de-CH', { month: 'short', year: '2-digit' })
}

function typeLabel(type: FinanceTransaction['transaction_type']) {
  if (type === 'income') return 'Einnahmen'
  if (type === 'expense') return 'Ausgaben'
  return 'Transfers'
}

function getRange(mode: PeriodMode, year: string, month: string, customStart: string, customEnd: string) {
  if (mode === 'month') {
    const date = new Date(`${month}-01T12:00:00`)
    return { end: format(endOfMonth(date), 'yyyy-MM-dd'), start: format(startOfMonth(date), 'yyyy-MM-dd') }
  }
  if (mode === 'custom') return { end: customEnd, start: customStart }
  return { end: `${year}-12-31`, start: `${year}-01-01` }
}

function groupKey(transaction: FinanceTransaction, groupMode: GroupMode) {
  if (groupMode === 'category') return transaction.category
  if (groupMode === 'type') return typeLabel(transaction.transaction_type)
  return transaction.transaction_date.slice(0, 7)
}

export function FinanceStats({ refreshKey, userId }: { refreshKey: string; userId: string }) {
  const [periodMode, setPeriodMode] = useState<PeriodMode>('year')
  const [year, setYear] = useState(todayYear())
  const [month, setMonth] = useState(format(new Date(), 'yyyy-MM'))
  const [customStart, setCustomStart] = useState(`${todayYear()}-01-01`)
  const [customEnd, setCustomEnd] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [groupMode, setGroupMode] = useState<GroupMode>('month')
  const [includeTransfers, setIncludeTransfers] = useState(false)
  const [showDetails, setShowDetails] = useState(true)
  const [transactions, setTransactions] = useState<FinanceTransaction[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const range = useMemo(() => getRange(periodMode, year, month, customStart, customEnd), [customEnd, customStart, month, periodMode, year])

  useEffect(() => {
    let active = true
    async function load() {
      if (!range.start || !range.end) return
      setLoading(true)
      setError('')
      try {
        const rows = await loadFinanceTransactionsRange(userId, range.start, range.end)
        if (active) setTransactions(rows)
      } catch {
        if (active) setError('Statistik konnte nicht geladen werden.')
      } finally {
        if (active) setLoading(false)
      }
    }
    void load()
    return () => {
      active = false
    }
  }, [range.end, range.start, refreshKey, userId])

  const visibleTransactions = useMemo(
    () => transactions.filter((transaction) => includeTransfers || transaction.transaction_type !== 'transfer'),
    [includeTransfers, transactions],
  )

  const totals = useMemo(() => {
    const income = visibleTransactions
      .filter((transaction) => transaction.transaction_type === 'income')
      .reduce((sum, transaction) => sum + Number(transaction.amount), 0)
    const expenses = visibleTransactions
      .filter((transaction) => transaction.transaction_type === 'expense')
      .reduce((sum, transaction) => sum + Number(transaction.amount), 0)
    const transfers = transactions
      .filter((transaction) => transaction.transaction_type === 'transfer')
      .reduce((sum, transaction) => sum + Number(transaction.amount), 0)
    const cashflow = income - expenses
    return {
      cashflow,
      count: visibleTransactions.length,
      expenses,
      income,
      savingsRate: income ? (cashflow / income) * 100 : 0,
      transfers,
    }
  }, [transactions, visibleTransactions])

  const chartData = useMemo(() => {
    const grouped = visibleTransactions.reduce<Record<string, { name: string; income: number; expenses: number; transfers: number; net: number }>>(
      (result, transaction) => {
        const key = groupKey(transaction, groupMode)
        const current = result[key] ?? {
          expenses: 0,
          income: 0,
          name: groupMode === 'month' ? monthName(key) : key,
          net: 0,
          transfers: 0,
        }
        if (transaction.transaction_type === 'income') current.income += Number(transaction.amount)
        if (transaction.transaction_type === 'expense') current.expenses += Number(transaction.amount)
        if (transaction.transaction_type === 'transfer') current.transfers += Number(transaction.amount)
        current.net = current.income - current.expenses
        result[key] = current
        return result
      },
      {},
    )
    return Object.entries(grouped)
      .sort(([left], [right]) => (groupMode === 'month' ? left.localeCompare(right) : grouped[right].expenses - grouped[left].expenses))
      .map(([, value]) => value)
  }, [groupMode, visibleTransactions])

  const categoryRanking = useMemo(
    () =>
      visibleTransactions
        .filter((transaction) => transaction.transaction_type === 'expense')
        .reduce<Record<string, number>>((result, transaction) => {
          result[transaction.category] = (result[transaction.category] ?? 0) + Number(transaction.amount)
          return result
        }, {}),
    [visibleTransactions],
  )

  const rankedCategories = Object.entries(categoryRanking)
    .sort(([, left], [, right]) => right - left)
    .slice(0, 8)

  return (
    <Panel className="mt-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <SectionTitle
          description="Zeitraum, Gruppierung und Detailtiefe frei einstellen. So siehst du Monat, Jahr oder eigene Ausschnitte."
          title="Statistik & Analyse"
        />
        <span className="inline-flex items-center gap-2 rounded-full bg-soft px-3 py-1 text-xs font-bold text-muted">
          <BarChart3 size={14} /> {visibleTransactions.length} Buchungen
        </span>
      </div>

      <div className="grid gap-3 lg:grid-cols-[0.8fr_0.8fr_0.8fr_1fr]">
        <label>
          <span className={label}>Zeitraum</span>
          <select className={field} onChange={(event) => setPeriodMode(event.target.value as PeriodMode)} value={periodMode}>
            <option value="year">Ganzes Jahr</option>
            <option value="month">Einzelner Monat</option>
            <option value="custom">Eigener Zeitraum</option>
          </select>
        </label>
        {periodMode === 'year' && (
          <label>
            <span className={label}>Jahr</span>
            <input className={field} min="2020" onChange={(event) => setYear(event.target.value)} type="number" value={year} />
          </label>
        )}
        {periodMode === 'month' && (
          <label>
            <span className={label}>Monat</span>
            <input className={field} onChange={(event) => setMonth(event.target.value)} type="month" value={month} />
          </label>
        )}
        {periodMode === 'custom' && (
          <>
            <label>
              <span className={label}>Von</span>
              <input className={field} onChange={(event) => setCustomStart(event.target.value)} type="date" value={customStart} />
            </label>
            <label>
              <span className={label}>Bis</span>
              <input className={field} onChange={(event) => setCustomEnd(event.target.value)} type="date" value={customEnd} />
            </label>
          </>
        )}
        <label>
          <span className={label}>Gruppierung</span>
          <select className={field} onChange={(event) => setGroupMode(event.target.value as GroupMode)} value={groupMode}>
            <option value="month">Nach Monat</option>
            <option value="category">Nach Kategorie</option>
            <option value="type">Nach Art</option>
          </select>
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <label className="inline-flex items-center gap-2 rounded-full bg-soft px-3 py-2 text-xs font-bold text-muted">
          <input checked={includeTransfers} onChange={(event) => setIncludeTransfers(event.target.checked)} type="checkbox" />
          Transfers einbeziehen
        </label>
        <label className="inline-flex items-center gap-2 rounded-full bg-soft px-3 py-2 text-xs font-bold text-muted">
          <input checked={showDetails} onChange={(event) => setShowDetails(event.target.checked)} type="checkbox" />
          Detailtabelle anzeigen
        </label>
      </div>

      {error && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
      {loading && <p className="mt-4 text-sm text-muted">Statistik wird geladen ...</p>}

      <div className="mt-5 grid gap-3 md:grid-cols-5">
        <div className="rounded-xl bg-soft p-4">
          <p className="text-xs text-muted">Einnahmen</p>
          <p className="mt-1 font-display text-xl font-semibold text-positive">{money(totals.income)}</p>
        </div>
        <div className="rounded-xl bg-soft p-4">
          <p className="text-xs text-muted">Ausgaben</p>
          <p className="mt-1 font-display text-xl font-semibold text-red-700">{money(totals.expenses)}</p>
        </div>
        <div className="rounded-xl bg-soft p-4">
          <p className="text-xs text-muted">Cashflow</p>
          <p className={`mt-1 font-display text-xl font-semibold ${totals.cashflow < 0 ? 'text-red-700' : 'text-positive'}`}>
            {money(totals.cashflow)}
          </p>
        </div>
        <div className="rounded-xl bg-soft p-4">
          <p className="text-xs text-muted">Sparquote</p>
          <p className={`mt-1 font-display text-xl font-semibold ${totals.savingsRate < 0 ? 'text-red-700' : 'text-accent'}`}>
            {totals.savingsRate.toFixed(0)} %
          </p>
        </div>
        <div className="rounded-xl bg-soft p-4">
          <p className="text-xs text-muted">Transfers separat</p>
          <p className="mt-1 font-display text-xl font-semibold text-accent">{money(totals.transfers)}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.4fr_0.8fr]">
        <div className="min-h-72 rounded-xl border border-line bg-white p-4">
          {chartData.length ? (
            <ResponsiveContainer height={280} width="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={11} />
                <YAxis fontSize={11} tickFormatter={(value) => `${Number(value) / 1000}k`} width={42} />
                <Tooltip formatter={(value, name) => [money(Number(value)), String(name)]} />
                <Bar dataKey="income" fill="#2f7d55" name="Einnahmen" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expenses" fill="#c60000" name="Ausgaben" radius={[6, 6, 0, 0]} />
                {includeTransfers && <Bar dataKey="transfers" fill="#3f6b57" name="Transfers" radius={[6, 6, 0, 0]} />}
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="grid h-72 place-items-center text-center text-sm text-muted">
              <div>
                <Filter className="mx-auto mb-3" size={24} />
                Keine Buchungen im gewaehlten Zeitraum.
              </div>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-line bg-white p-4">
          <h3 className="font-display text-xl font-semibold">Top-Ausgaben</h3>
          <div className="mt-4 space-y-3">
            {rankedCategories.length ? (
              rankedCategories.map(([category, value]) => {
                const percent = totals.expenses ? Math.min(100, (value / totals.expenses) * 100) : 0
                return (
                  <div key={category}>
                    <div className="flex justify-between gap-3 text-sm">
                      <span className="font-semibold">{category}</span>
                      <span className="text-muted">{money(value)}</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-soft">
                      <div className="h-full rounded-full bg-red-600" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                )
              })
            ) : (
              <p className="py-8 text-center text-sm text-muted">Noch keine Ausgaben im Zeitraum.</p>
            )}
          </div>
        </div>
      </div>

      {showDetails && (
        <div className="mt-5 max-h-96 overflow-auto rounded-xl border border-line">
          {visibleTransactions.map((transaction) => (
            <div className="grid gap-2 border-b border-line p-3 text-sm last:border-b-0 md:grid-cols-[0.7fr_1.6fr_0.8fr_0.8fr_0.8fr]" key={transaction.id}>
              <span className="font-semibold">{new Date(`${transaction.transaction_date}T12:00:00`).toLocaleDateString('de-CH')}</span>
              <span className="truncate">{transaction.description}</span>
              <span className="text-muted">{transaction.category}</span>
              <span className="text-muted">{typeLabel(transaction.transaction_type)}</span>
              <span className={transaction.transaction_type === 'income' ? 'font-bold text-positive' : 'font-bold text-red-700'}>
                {money(Number(transaction.amount))}
              </span>
            </div>
          ))}
          {!visibleTransactions.length && <p className="p-6 text-center text-sm text-muted">Keine Details fuer diese Auswahl.</p>}
        </div>
      )}
    </Panel>
  )
}
