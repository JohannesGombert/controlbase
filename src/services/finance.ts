import { endOfMonth, format, startOfMonth } from 'date-fns'
import { supabase } from '../lib/supabaseClient'

export type FinanceAccount = {
  id: string
  name: string
  account_type: string
  balance: number
  currency: string
  included_in_net_worth: boolean
}

export type FinanceTransaction = {
  id: string
  account_id: string | null
  transaction_date: string
  transaction_type: 'income' | 'expense' | 'transfer'
  amount: number
  category: string
  description: string
  notes: string | null
  import_hash?: string | null
  source?: string | null
  original_description?: string | null
}

export type FinanceBudget = {
  id: string
  month: string
  category: string
  limit_amount: number
}

export type FinanceCategory = {
  id: string
  name: string
  category_type: 'expense' | 'income' | 'transfer'
}

function client() {
  if (!supabase) throw new Error('Supabase ist nicht konfiguriert.')
  return supabase
}

export function monthKey(date = new Date()) {
  return format(startOfMonth(date), 'yyyy-MM-dd')
}

export async function loadFinance(userId: string, month: Date) {
  const start = format(startOfMonth(month), 'yyyy-MM-dd')
  const end = format(endOfMonth(month), 'yyyy-MM-dd')
  const [
    { data: accounts, error: accountError },
    { data: transactions, error: transactionError },
    { data: budgets, error: budgetError },
    { data: categories, error: categoryError },
  ] = await Promise.all([
    client().from('finance_accounts').select('*').eq('user_id', userId).order('created_at'),
    client().from('finance_transactions').select('*').eq('user_id', userId).gte('transaction_date', start).lte('transaction_date', end).order('transaction_date', { ascending: false }).order('created_at', { ascending: false }),
    client().from('finance_budgets').select('*').eq('user_id', userId).eq('month', monthKey(month)).order('category'),
    client().from('finance_categories').select('*').eq('user_id', userId).order('category_type').order('name'),
  ])
  if (accountError) throw accountError
  if (transactionError) throw transactionError
  if (budgetError) throw budgetError
  if (categoryError && categoryError.code !== '42P01') throw categoryError
  return {
    accounts: (accounts ?? []) as FinanceAccount[],
    budgets: (budgets ?? []) as FinanceBudget[],
    categories: categoryError ? [] : ((categories ?? []) as FinanceCategory[]),
    transactions: (transactions ?? []) as FinanceTransaction[],
  }
}

export async function loadFinanceTransactionsRange(userId: string, start: string, end: string) {
  const { data, error } = await client()
    .from('finance_transactions')
    .select('*')
    .eq('user_id', userId)
    .gte('transaction_date', start)
    .lte('transaction_date', end)
    .order('transaction_date', { ascending: true })
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []) as FinanceTransaction[]
}

export async function createAccount(userId: string, input: { name: string; accountType: string; balance: number }) {
  const { error } = await client().from('finance_accounts').insert({ user_id: userId, name: input.name, account_type: input.accountType, balance: input.balance, currency: 'CHF' })
  if (error) throw error
}

export async function createCategory(userId: string, input: { name: string; type: 'expense' | 'income' | 'transfer' }) {
  const { error } = await client()
    .from('finance_categories')
    .upsert({ user_id: userId, name: input.name.trim(), category_type: input.type }, { onConflict: 'user_id,name' })
  if (error) throw error
}

export async function deleteCategory(id: string) {
  const { error } = await client().from('finance_categories').delete().eq('id', id)
  if (error) throw error
}

export async function updateAccountBalance(id: string, balance: number) {
  const { error } = await client().from('finance_accounts').update({ balance }).eq('id', id)
  if (error) throw error
}

export async function createTransaction(userId: string, input: { accountId: string; date: string; type: 'income' | 'expense'; amount: number; category: string; description: string; notes: string }) {
  const { error } = await client().from('finance_transactions').insert({ user_id: userId, account_id: input.accountId || null, transaction_date: input.date, transaction_type: input.type, amount: input.amount, category: input.category, description: input.description, notes: input.notes || null })
  if (error) throw error
}

export async function importTransactions(
  userId: string,
  rows: {
    accountId: string
    date: string
    type: 'income' | 'expense' | 'transfer'
    amount: number
    category: string
    description: string
    originalDescription: string
    source: string
    importHash: string
  }[],
) {
  if (!rows.length) return
  const payload = rows.map((row) => ({
    user_id: userId,
    account_id: row.accountId || null,
    transaction_date: row.date,
    transaction_type: row.type,
    amount: row.amount,
    category: row.category,
    description: row.description,
    notes: null,
    original_description: row.originalDescription,
    source: row.source,
    import_hash: row.importHash,
  }))
  const { error } = await client()
    .from('finance_transactions')
    .upsert(payload, { onConflict: 'user_id,import_hash', ignoreDuplicates: true })
  if (error) throw error
}

export async function deleteTransaction(id: string) {
  const { error } = await client().from('finance_transactions').delete().eq('id', id)
  if (error) throw error
}

export async function updateTransaction(
  id: string,
  input: {
    accountId: string
    amount: number
    category: string
    date: string
    description: string
    notes: string
    type: 'income' | 'expense' | 'transfer'
  },
) {
  const { error } = await client()
    .from('finance_transactions')
    .update({
      account_id: input.accountId || null,
      amount: input.amount,
      category: input.category,
      description: input.description,
      notes: input.notes || null,
      transaction_date: input.date,
      transaction_type: input.type,
    })
    .eq('id', id)
  if (error) throw error
}

export async function saveBudget(userId: string, month: Date, category: string, limitAmount: number) {
  const { error } = await client().from('finance_budgets').upsert({ user_id: userId, month: monthKey(month), category, limit_amount: limitAmount }, { onConflict: 'user_id,month,category' })
  if (error) throw error
}
