import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  Edit3,
  Landmark,
  PiggyBank,
  Plus,
  ReceiptText,
  Save,
  Trash2,
  WalletCards,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { BankStatementImport } from '../components/BankStatementImport'
import { FinanceStats } from '../components/FinanceStats'
import { PageHeader } from '../components/PageHeader'
import { Panel, SectionTitle } from '../components/Panel'
import {
  createAccount,
  createCategory,
  createTransaction,
  deleteCategory,
  deleteTransaction,
  loadFinance,
  saveBudget,
  updateAccountBalance,
  updateSimilarTransactionCategories,
  updateTransaction,
  type FinanceAccount,
  type FinanceBudget,
  type FinanceCategory,
  type FinanceTransaction,
} from '../services/finance'

const field = 'mt-2 w-full rounded-xl border border-line bg-soft px-3.5 py-3 text-sm outline-none focus:border-accent focus:bg-control-hover'
const label = 'text-xs font-bold uppercase tracking-wider text-muted'
const expenseCategories = [
  'Wohnen',
  'Lebensmittel',
  'Mobilitaet',
  'Gesundheit',
  'Freizeit',
  'Shopping',
  'Versicherungen',
  'Steuern',
  'Reisen',
  'Sonstiges',
]
const incomeCategories = ['Lohn', 'Bonus', 'Dividenden', 'Verkauf', 'Rueckerstattung', 'Sonstiges']
const transactionCategories = Array.from(
  new Set([...expenseCategories, ...incomeCategories, 'Transfer', 'TWINT', 'Bargeld', 'Gebuehren']),
)
const accountTypes: Record<string, string> = {
  bank: 'Bankkonto',
  cash: 'Bargeld',
  credit_card: 'Kreditkarte',
  investment: 'Depot',
  debt: 'Schulden',
  other: 'Sonstiges',
}

function money(value: number) {
  return new Intl.NumberFormat('de-CH', { style: 'currency', currency: 'CHF', maximumFractionDigits: 2 }).format(value)
}

function AccountRow({ account, onSave }: { account: FinanceAccount; onSave: (id: string, balance: number) => Promise<void> }) {
  const [balance, setBalance] = useState(String(account.balance))
  const [saving, setSaving] = useState(false)

  useEffect(() => setBalance(String(account.balance)), [account.balance])

  return (
    <div className="rounded-xl border border-line bg-soft p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-bold">{account.name}</h3>
          <p className="mt-1 text-xs text-muted">{accountTypes[account.account_type] ?? account.account_type}</p>
        </div>
        <p className={`font-display text-xl font-semibold ${account.balance < 0 ? 'text-status-danger' : ''}`}>
          {money(account.balance)}
        </p>
      </div>
      <div className="mt-3 flex gap-2">
        <input
          aria-label={`Saldo ${account.name}`}
          className="min-w-0 flex-1 rounded-lg border border-line bg-control-surface px-3 py-2 text-sm"
          onChange={(event) => setBalance(event.target.value)}
          step="0.01"
          type="number"
          value={balance}
        />
        <button
          className="rounded-lg bg-control-deep px-3 text-xs font-bold text-white disabled:opacity-60"
          disabled={saving}
          onClick={async () => {
            setSaving(true)
            await onSave(account.id, Number(balance))
            setSaving(false)
          }}
          type="button"
        >
          Aktualisieren
        </button>
      </div>
    </div>
  )
}

function TransactionIcon({ item }: { item: FinanceTransaction }) {
  if (item.transaction_type === 'income') {
    return (
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#e7f4ee] text-positive">
        <ArrowDownLeft size={17} />
      </span>
    )
  }
  if (item.transaction_type === 'transfer') {
    return (
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-blue-50 text-accent">
        <ArrowLeftRight size={17} />
      </span>
    )
  }
  return (
    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-red-50 text-status-danger">
      <ArrowUpRight size={17} />
    </span>
  )
}

function TransactionRow({
  accounts,
  categories,
  item,
  onDelete,
  onSave,
}: {
  accounts: FinanceAccount[]
  categories: string[]
  item: FinanceTransaction
  onDelete: () => Promise<void>
  onSave: (id: string, input: Parameters<typeof updateTransaction>[1], item: FinanceTransaction) => Promise<void>
}) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    accountId: item.account_id ?? '',
    amount: String(item.amount),
    category: item.category,
    date: item.transaction_date,
    description: item.description,
    notes: item.notes ?? '',
    type: item.transaction_type,
  })

  useEffect(() => {
    if (!editing) {
      setForm({
        accountId: item.account_id ?? '',
        amount: String(item.amount),
        category: item.category,
        date: item.transaction_date,
        description: item.description,
        notes: item.notes ?? '',
        type: item.transaction_type,
      })
    }
  }, [editing, item])

  const isIncome = item.transaction_type === 'income'
  const isTransfer = item.transaction_type === 'transfer'

  async function submit(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    try {
      await onSave(item.id, {
        accountId: form.accountId,
        amount: Number(form.amount),
        category: form.category,
        date: form.date,
        description: form.description,
        notes: form.notes,
        type: form.type,
      }, item)
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  if (editing) {
    return (
      <form className="space-y-3 py-4" onSubmit={submit}>
        <div className="grid gap-3 lg:grid-cols-[1fr_1.4fr_0.8fr_0.9fr]">
          <label>
            <span className={label}>Datum</span>
            <input
              className={field}
              onChange={(event) => setForm({ ...form, date: event.target.value })}
              required
              type="date"
              value={form.date}
            />
          </label>
          <label>
            <span className={label}>Beschreibung</span>
            <input
              className={field}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              required
              value={form.description}
            />
          </label>
          <label>
            <span className={label}>Art</span>
            <select
              className={field}
              onChange={(event) => setForm({ ...form, type: event.target.value as FinanceTransaction['transaction_type'] })}
              value={form.type}
            >
              <option value="expense">Ausgabe</option>
              <option value="income">Einnahme</option>
              <option value="transfer">Transfer</option>
            </select>
          </label>
          <label>
            <span className={label}>Betrag CHF</span>
            <input
              className={field}
              min="0.01"
              onChange={(event) => setForm({ ...form, amount: event.target.value })}
              required
              step="0.01"
              type="number"
              value={form.amount}
            />
          </label>
        </div>
        <div className="grid gap-3 lg:grid-cols-[1fr_1fr_1.4fr_auto]">
          <label>
            <span className={label}>Kategorie</span>
            <select className={field} onChange={(event) => setForm({ ...form, category: event.target.value })} value={form.category}>
              {categories.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </label>
          <label>
            <span className={label}>Konto</span>
            <select className={field} onChange={(event) => setForm({ ...form, accountId: event.target.value })} value={form.accountId}>
              <option value="">Kein Konto</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className={label}>Notiz</span>
            <input className={field} onChange={(event) => setForm({ ...form, notes: event.target.value })} value={form.notes} />
          </label>
          <div className="flex items-end gap-2">
            <button
              className="inline-flex h-[46px] items-center justify-center gap-2 rounded-xl bg-control-deep px-4 text-sm font-bold text-white disabled:opacity-60"
              disabled={saving}
              type="submit"
            >
              <Save size={16} /> Speichern
            </button>
            <button
              className="grid h-[46px] w-[46px] place-items-center rounded-xl border border-line bg-control-surface text-muted"
              onClick={() => setEditing(false)}
              title="Abbrechen"
              type="button"
            >
              <X size={17} />
            </button>
          </div>
        </div>
        {item.original_description && item.original_description !== item.description && (
          <p className="text-xs leading-5 text-muted">Original aus Import: {item.original_description}</p>
        )}
      </form>
    )
  }

  return (
    <div className="flex items-center gap-3 py-3">
      <TransactionIcon item={item} />
      <button className="min-w-0 flex-1 text-left" onClick={() => setEditing(true)} type="button">
        <p className="truncate text-sm font-bold">{item.description}</p>
        <p className="mt-0.5 text-xs text-muted">
          {new Date(`${item.transaction_date}T12:00:00`).toLocaleDateString('de-CH')} · {item.category}
          {item.source ? ` · ${item.source}` : ''}
        </p>
      </button>
      <p className={`text-sm font-bold ${isIncome ? 'text-positive' : isTransfer ? 'text-accent' : 'text-status-danger'}`}>
        {isIncome ? '+' : isTransfer ? '↔ ' : '−'}
        {money(Number(item.amount))}
      </p>
      <button
        aria-label={`${item.description} bearbeiten`}
        className="grid size-8 place-items-center text-muted hover:text-accent"
        onClick={() => setEditing(true)}
        type="button"
      >
        <Edit3 size={15} />
      </button>
      <button
        aria-label={`${item.description} loeschen`}
        className="grid size-8 place-items-center text-muted hover:text-status-danger"
        onClick={() => void onDelete()}
        type="button"
      >
        <Trash2 size={15} />
      </button>
    </div>
  )
}

function CategoryManager({
  categories,
  onCreate,
  onDelete,
}: {
  categories: FinanceCategory[]
  onCreate: (name: string, type: FinanceCategory['category_type']) => Promise<void>
  onDelete: (id: string) => Promise<void>
}) {
  const [name, setName] = useState('')
  const [type, setType] = useState<FinanceCategory['category_type']>('expense')
  const [saving, setSaving] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    try {
      await onCreate(name.trim(), type)
      setName('')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Panel>
      <SectionTitle
        description="Eigene Kategorien fuer Buchungen, Import-Korrekturen, Budgets und Auswertungen anlegen."
        title="Kategorien"
      />
      <form className="grid gap-3 border-b border-line pb-5 sm:grid-cols-[1fr_0.8fr_auto]" onSubmit={submit}>
        <label>
          <span className={label}>Name</span>
          <input
            className={field}
            onChange={(event) => setName(event.target.value)}
            placeholder="z. B. Weiterbildung"
            required
            value={name}
          />
        </label>
        <label>
          <span className={label}>Art</span>
          <select className={field} onChange={(event) => setType(event.target.value as FinanceCategory['category_type'])} value={type}>
            <option value="expense">Ausgabe</option>
            <option value="income">Einnahme</option>
            <option value="transfer">Transfer</option>
          </select>
        </label>
        <button
          className="mt-auto inline-flex h-[46px] items-center justify-center rounded-xl bg-control-deep px-4 text-sm font-bold text-white disabled:opacity-60"
          disabled={saving}
          type="submit"
        >
          <Plus size={17} />
        </button>
      </form>
      <div className="mt-4 flex flex-wrap gap-2">
        {categories.length ? (
          categories.map((category) => (
            <span className="inline-flex items-center gap-2 rounded-full bg-soft px-3 py-2 text-xs font-bold text-muted" key={category.id}>
              {category.name}
              <span className="font-normal">· {category.category_type === 'expense' ? 'Ausgabe' : category.category_type === 'income' ? 'Einnahme' : 'Transfer'}</span>
              <button
                aria-label={`${category.name} loeschen`}
                className="text-muted hover:text-status-danger"
                onClick={() => void onDelete(category.id)}
                type="button"
              >
                <X size={13} />
              </button>
            </span>
          ))
        ) : (
          <p className="py-4 text-sm text-muted">Noch keine eigenen Kategorien.</p>
        )}
      </div>
    </Panel>
  )
}

export function Finance() {
  const { user } = useAuth()
  const [monthValue, setMonthValue] = useState(format(new Date(), 'yyyy-MM'))
  const [accounts, setAccounts] = useState<FinanceAccount[]>([])
  const [transactions, setTransactions] = useState<FinanceTransaction[]>([])
  const [budgets, setBudgets] = useState<FinanceBudget[]>([])
  const [categories, setCategories] = useState<FinanceCategory[]>([])
  const [accountForm, setAccountForm] = useState({ name: '', accountType: 'bank', balance: '' })
  const [transactionForm, setTransactionForm] = useState({
    accountId: '',
    amount: '',
    category: 'Lebensmittel',
    date: format(new Date(), 'yyyy-MM-dd'),
    description: '',
    notes: '',
    type: 'expense' as 'income' | 'expense',
  })
  const [budgetForm, setBudgetForm] = useState({ category: 'Lebensmittel', limitAmount: '' })
  const [saving, setSaving] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [statsRefreshKey, setStatsRefreshKey] = useState('initial')

  const selectedMonth = useMemo(() => new Date(`${monthValue}-01T12:00:00`), [monthValue])

  const refresh = useCallback(async () => {
    if (!user) return
    setError('')
    setMessage('')
    try {
      const data = await loadFinance(user.id, selectedMonth)
      setAccounts(data.accounts)
      setTransactions(data.transactions)
      setBudgets(data.budgets)
      setCategories(data.categories)
      setStatsRefreshKey(`${Date.now()}`)
    } catch {
      setError('Finanzdaten konnten nicht geladen werden. Bitte finance_schema.sql in Supabase ausfuehren.')
    }
  }, [selectedMonth, user])

  const handleImported = useCallback(
    async (month?: string) => {
      if (month && month !== monthValue) {
        setMonthValue(month)
        return
      }
      await refresh()
    },
    [monthValue, refresh],
  )

  useEffect(() => {
    void refresh()
  }, [refresh])

  useEffect(() => {
    if (!transactionForm.accountId && accounts[0]) {
      setTransactionForm((current) => ({ ...current, accountId: accounts[0].id }))
    }
  }, [accounts, transactionForm.accountId])

  const totals = useMemo(() => {
    const income = transactions
      .filter((item) => item.transaction_type === 'income')
      .reduce((sum, item) => sum + Number(item.amount), 0)
    const expenses = transactions
      .filter((item) => item.transaction_type === 'expense')
      .reduce((sum, item) => sum + Number(item.amount), 0)
    const netWorth = accounts
      .filter((item) => item.included_in_net_worth)
      .reduce((sum, item) => sum + Number(item.balance), 0)
    return { cashflow: income - expenses, expenses, income, netWorth, savingsRate: income ? ((income - expenses) / income) * 100 : 0 }
  }, [accounts, transactions])

  const spendingByCategory = useMemo(
    () =>
      transactions
        .filter((item) => item.transaction_type === 'expense')
        .reduce<Record<string, number>>(
          (result, item) => ({ ...result, [item.category]: (result[item.category] ?? 0) + Number(item.amount) }),
          {},
        ),
    [transactions],
  )
  const customExpenseCategories = useMemo(
    () => categories.filter((category) => category.category_type === 'expense').map((category) => category.name),
    [categories],
  )
  const customIncomeCategories = useMemo(
    () => categories.filter((category) => category.category_type === 'income').map((category) => category.name),
    [categories],
  )
  const customTransferCategories = useMemo(
    () => categories.filter((category) => category.category_type === 'transfer').map((category) => category.name),
    [categories],
  )
  const expenseCategoryOptions = useMemo(() => Array.from(new Set([...expenseCategories, ...customExpenseCategories])).sort(), [customExpenseCategories])
  const incomeCategoryOptions = useMemo(() => Array.from(new Set([...incomeCategories, ...customIncomeCategories])).sort(), [customIncomeCategories])
  const allCategoryOptions = useMemo(
    () => Array.from(new Set([...transactionCategories, ...customExpenseCategories, ...customIncomeCategories, ...customTransferCategories])).sort(),
    [customExpenseCategories, customIncomeCategories, customTransferCategories],
  )

  async function addAccount(event: FormEvent) {
    event.preventDefault()
    if (!user) return
    setSaving('account')
    setError('')
    setMessage('')
    try {
      await createAccount(user.id, {
        accountType: accountForm.accountType,
        balance: Number(accountForm.balance || 0),
        name: accountForm.name,
      })
      setAccountForm({ name: '', accountType: 'bank', balance: '' })
      await refresh()
    } catch {
      setError('Konto konnte nicht gespeichert werden.')
    } finally {
      setSaving('')
    }
  }

  async function addTransaction(event: FormEvent) {
    event.preventDefault()
    if (!user) return
    setSaving('transaction')
    setError('')
    setMessage('')
    try {
      await createTransaction(user.id, { ...transactionForm, amount: Number(transactionForm.amount) })
      setTransactionForm((current) => ({ ...current, amount: '', description: '', notes: '' }))
      await refresh()
    } catch {
      setError('Buchung konnte nicht gespeichert werden.')
    } finally {
      setSaving('')
    }
  }

  async function addBudget(event: FormEvent) {
    event.preventDefault()
    if (!user) return
    setSaving('budget')
    setError('')
    setMessage('')
    try {
      await saveBudget(user.id, selectedMonth, budgetForm.category, Number(budgetForm.limitAmount))
      setBudgetForm((current) => ({ ...current, limitAmount: '' }))
      await refresh()
    } catch {
      setError('Budget konnte nicht gespeichert werden.')
    } finally {
      setSaving('')
    }
  }

  async function addCategory(name: string, type: FinanceCategory['category_type']) {
    if (!user) return
    setError('')
    setMessage('')
    try {
      await createCategory(user.id, { name, type })
      await refresh()
    } catch {
      setError('Kategorie konnte nicht gespeichert werden. Bitte finance_categories_schema.sql in Supabase ausfuehren.')
    }
  }

  async function removeCategory(id: string) {
    setError('')
    setMessage('')
    try {
      await deleteCategory(id)
      await refresh()
    } catch {
      setError('Kategorie konnte nicht geloescht werden.')
    }
  }

  return (
    <>
      <PageHeader
        action={
          <label className="block rounded-xl border border-line bg-control-surface px-4 py-3">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-muted">Monat</span>
            <input
              className="mt-1 bg-transparent text-sm font-bold outline-none"
              onChange={(event) => setMonthValue(event.target.value)}
              type="month"
              value={monthValue}
            />
          </label>
        }
        description="Vermoegen, Cashflow und Budgets an einem Ort. Zahlen eintragen, Muster erkennen, bewusst entscheiden."
        eyebrow="Finanz-Cockpit"
        title="Finanzen"
      />

      {error && <p className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-status-danger">{error}</p>}
      {message && <p className="mb-5 rounded-xl bg-status-success/10 px-4 py-3 text-sm font-semibold text-status-success">{message}</p>}

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-5">
        {[
          ['Nettovermoegen', money(totals.netWorth), WalletCards, 'text-ink'],
          ['Einnahmen', money(totals.income), ArrowDownLeft, 'text-positive'],
          ['Ausgaben', money(totals.expenses), ArrowUpRight, 'text-status-danger'],
          ['Cashflow', money(totals.cashflow), PiggyBank, totals.cashflow < 0 ? 'text-status-danger' : 'text-positive'],
          ['Sparquote', `${totals.savingsRate.toFixed(0)} %`, Landmark, totals.savingsRate < 0 ? 'text-status-danger' : 'text-accent'],
        ].map(([title, value, Icon, color]) => (
          <Panel className="p-4 sm:p-5" key={String(title)}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-semibold text-muted">{String(title)}</p>
                <p className={`mt-3 font-display text-2xl font-semibold ${String(color)}`}>{String(value)}</p>
              </div>
              <span className="grid size-9 place-items-center rounded-xl bg-soft text-accent">
                <Icon size={18} />
              </span>
            </div>
          </Panel>
        ))}
      </div>

      {user && <BankStatementImport accounts={accounts} categories={allCategoryOptions} onImported={handleImported} userId={user.id} />}

      {user && <FinanceStats refreshKey={statsRefreshKey} userId={user.id} />}

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <Panel>
          <SectionTitle description="Aktuelle Salden manuell pflegen. Schulden als negativen Saldo eintragen." title="Konten & Vermoegen" />
          <form className="grid gap-3 border-b border-line pb-5 sm:grid-cols-[1fr_0.8fr_0.7fr_auto]" onSubmit={addAccount}>
            <label>
              <span className={label}>Name</span>
              <input
                className={field}
                onChange={(event) => setAccountForm({ ...accountForm, name: event.target.value })}
                placeholder="Privatkonto"
                required
                value={accountForm.name}
              />
            </label>
            <label>
              <span className={label}>Typ</span>
              <select
                className={field}
                onChange={(event) => setAccountForm({ ...accountForm, accountType: event.target.value })}
                value={accountForm.accountType}
              >
                {Object.entries(accountTypes).map(([value, text]) => (
                  <option key={value} value={value}>
                    {text}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className={label}>Saldo CHF</span>
              <input
                className={field}
                onChange={(event) => setAccountForm({ ...accountForm, balance: event.target.value })}
                placeholder="0"
                step="0.01"
                type="number"
                value={accountForm.balance}
              />
            </label>
            <button
              className="mt-auto inline-flex h-[46px] items-center justify-center rounded-xl bg-control-deep px-4 text-white disabled:opacity-60"
              disabled={saving === 'account'}
              title="Konto hinzufuegen"
              type="submit"
            >
              <Plus size={18} />
            </button>
          </form>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {accounts.length ? (
              accounts.map((account) => (
                <AccountRow
                  account={account}
                  key={account.id}
                  onSave={async (id, balance) => {
                    await updateAccountBalance(id, balance)
                    await refresh()
                  }}
                />
              ))
            ) : (
              <p className="col-span-2 py-8 text-center text-sm text-muted">Noch keine Konten erfasst.</p>
            )}
          </div>
        </Panel>

        {user && <CategoryManager categories={categories} onCreate={addCategory} onDelete={removeCategory} />}
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <Panel>
          <SectionTitle description="Einnahmen und Ausgaben fuer die Monatsuebersicht." title="Buchung erfassen" />
          <form className="space-y-4" onSubmit={addTransaction}>
            <div className="grid grid-cols-2 gap-3">
              <label>
                <span className={label}>Art</span>
                <select
                  className={field}
                  onChange={(event) => {
                    const type = event.target.value as 'income' | 'expense'
                    setTransactionForm({ ...transactionForm, type, category: type === 'income' ? 'Lohn' : 'Lebensmittel' })
                  }}
                  value={transactionForm.type}
                >
                  <option value="expense">Ausgabe</option>
                  <option value="income">Einnahme</option>
                </select>
              </label>
              <label>
                <span className={label}>Betrag CHF</span>
                <input
                  className={field}
                  min="0.01"
                  onChange={(event) => setTransactionForm({ ...transactionForm, amount: event.target.value })}
                  required
                  step="0.01"
                  type="number"
                  value={transactionForm.amount}
                />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label>
                <span className={label}>Datum</span>
                <input
                  className={field}
                  onChange={(event) => setTransactionForm({ ...transactionForm, date: event.target.value })}
                  required
                  type="date"
                  value={transactionForm.date}
                />
              </label>
              <label>
                <span className={label}>Konto</span>
                <select
                  className={field}
                  onChange={(event) => setTransactionForm({ ...transactionForm, accountId: event.target.value })}
                  value={transactionForm.accountId}
                >
                  <option value="">Kein Konto</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="block">
              <span className={label}>Kategorie</span>
              <select
                className={field}
                onChange={(event) => setTransactionForm({ ...transactionForm, category: event.target.value })}
                value={transactionForm.category}
              >
                {(transactionForm.type === 'income' ? incomeCategoryOptions : expenseCategoryOptions).map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className={label}>Beschreibung</span>
              <input
                className={field}
                onChange={(event) => setTransactionForm({ ...transactionForm, description: event.target.value })}
                placeholder="z. B. Migros Wocheneinkauf"
                required
                value={transactionForm.description}
              />
            </label>
            <label className="block">
              <span className={label}>Notiz (optional)</span>
              <input
                className={field}
                onChange={(event) => setTransactionForm({ ...transactionForm, notes: event.target.value })}
                value={transactionForm.notes}
              />
            </label>
            <button
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-control-deep px-4 py-3.5 text-sm font-bold text-white disabled:opacity-60"
              disabled={saving === 'transaction'}
              type="submit"
            >
              <Plus size={17} /> Buchung speichern
            </button>
          </form>
        </Panel>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_0.8fr]">
        <Panel>
          <div className="flex items-center justify-between">
            <SectionTitle
              description="Alle erfassten Einnahmen, Ausgaben und Transfers."
              title={`Buchungen · ${format(selectedMonth, 'MMMM yyyy', { locale: de })}`}
            />
            <span className="rounded-full bg-soft px-3 py-1 text-xs font-bold text-muted">{transactions.length}</span>
          </div>
          {transactions.length ? (
            <div className="divide-y divide-line">
              {transactions.map((item) => (
                <TransactionRow
                  accounts={accounts}
                  categories={allCategoryOptions}
                  item={item}
                  key={item.id}
                  onDelete={async () => {
                    await deleteTransaction(item.id)
                    await refresh()
                  }}
                  onSave={async (id, input, transaction) => {
                    if (!user) return
                    setError('')
                    setMessage('')
                    await updateTransaction(id, input)
                    let similarCount = 0
                    if (transaction.category !== input.category) {
                      similarCount = await updateSimilarTransactionCategories(user.id, transaction, input.category)
                    }
                    await refresh()
                    if (transaction.category !== input.category) {
                      setMessage(
                        similarCount > 1
                          ? `Kategorie auf ${similarCount} gleiche Buchungen übertragen.`
                          : 'Kategorie gespeichert. Keine weiteren gleichen Buchungen gefunden.',
                      )
                    }
                  }}
                />
              ))}
              {transactions.filter(() => false).map((item) => {
                const isIncome = item.transaction_type === 'income'
                const isTransfer = item.transaction_type === 'transfer'
                return (
                  <div className="flex items-center gap-3 py-3" key={item.id}>
                    <TransactionIcon item={item} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{item.description}</p>
                      <p className="mt-0.5 text-xs text-muted">
                        {new Date(`${item.transaction_date}T12:00:00`).toLocaleDateString('de-CH')} · {item.category}
                      </p>
                    </div>
                    <p className={`text-sm font-bold ${isIncome ? 'text-positive' : isTransfer ? 'text-accent' : 'text-status-danger'}`}>
                      {isIncome ? '+' : isTransfer ? '↔ ' : '−'}
                      {money(Number(item.amount))}
                    </p>
                    <button
                      aria-label={`${item.description} loeschen`}
                      className="grid size-8 place-items-center text-muted hover:text-status-danger"
                      onClick={async () => {
                        await deleteTransaction(item.id)
                        await refresh()
                      }}
                      type="button"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="grid min-h-48 place-items-center text-center">
              <div>
                <ReceiptText className="mx-auto text-muted" size={25} />
                <p className="mt-3 text-sm text-muted">Noch keine Buchungen in diesem Monat.</p>
              </div>
            </div>
          )}
        </Panel>

        <Panel>
          <SectionTitle description="Grenzen pro Ausgabenkategorie festlegen." title="Monatsbudgets" />
          <form className="grid grid-cols-[1fr_0.7fr_auto] gap-2 border-b border-line pb-5" onSubmit={addBudget}>
            <select
              aria-label="Budgetkategorie"
              className="rounded-xl border border-line bg-soft px-3 text-sm"
              onChange={(event) => setBudgetForm({ ...budgetForm, category: event.target.value })}
              value={budgetForm.category}
            >
              {expenseCategoryOptions.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
            <input
              aria-label="Budgetbetrag"
              className="min-w-0 rounded-xl border border-line bg-soft px-3 text-sm"
              min="1"
              onChange={(event) => setBudgetForm({ ...budgetForm, limitAmount: event.target.value })}
              placeholder="CHF"
              required
              type="number"
              value={budgetForm.limitAmount}
            />
            <button className="grid size-11 place-items-center rounded-xl bg-control-deep text-white" title="Budget speichern" type="submit">
              <Save size={17} />
            </button>
          </form>
          <div className="mt-5 space-y-4">
            {budgets.length ? (
              budgets.map((budget) => {
                const spent = spendingByCategory[budget.category] ?? 0
                const percent = Math.min(100, (spent / Number(budget.limit_amount)) * 100)
                return (
                  <div key={budget.id}>
                    <div className="flex justify-between gap-3 text-sm">
                      <span className="font-semibold">{budget.category}</span>
                      <span className={spent > Number(budget.limit_amount) ? 'font-bold text-status-danger' : 'text-muted'}>
                        {money(spent)} / {money(Number(budget.limit_amount))}
                      </span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-soft">
                      <div
                        className={`h-full rounded-full ${percent >= 100 ? 'bg-red-600' : percent >= 80 ? 'bg-warning' : 'bg-positive'}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                )
              })
            ) : (
              <p className="py-8 text-center text-sm text-muted">Noch keine Budgets gesetzt.</p>
            )}
          </div>
        </Panel>
      </div>
    </>
  )
}
