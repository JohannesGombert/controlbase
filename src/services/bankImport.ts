export type ParsedBankTransaction = {
  id: string
  bookingDate: string
  valueDate: string
  description: string
  originalDescription: string
  amount: number
  transactionType: 'income' | 'expense' | 'transfer'
  category: string
  source: string
  importHash: string
}

type PdfTextItem = { str?: string; hasEOL?: boolean }
type PdfPage = { getTextContent: () => Promise<{ items: PdfTextItem[] }> }
type PdfDocument = { numPages: number; getPage: (pageNumber: number) => Promise<PdfPage> }

const transferPattern = /(UEBERTRAG|UBERTRAG|ÜBERTRAG|EIGENUEBERTRAG|EIGENÜBERTRAG|JOHANNES\s+GOMBERT)/i

function parseSwissAmount(value: string) {
  return Number(value.replace(/'/g, '').replace(',', '.'))
}

function toIsoDate(value: string) {
  const [day, month, year] = value.split('.')
  return `${year}-${month}-${day}`
}

function cleanDescription(value: string) {
  return value.replace(/\s+/g, ' ').trim()
}

function hash(value: string) {
  let result = 5381
  for (let index = 0; index < value.length; index += 1) result = (result * 33) ^ value.charCodeAt(index)
  return `ubs_${(result >>> 0).toString(36)}`
}

function guessCategory(description: string, signedAmount: number) {
  const text = description.toUpperCase()
  if (transferPattern.test(description)) return { transactionType: 'transfer' as const, category: 'Transfer' }
  if (/SALAEREINGANG|LOHN|SALARY|COMPUTER SOLUTIONS FACILITY|CSF\b/.test(text)) {
    return { transactionType: 'income' as const, category: 'Lohn' }
  }
  if (/COOP|MIGROS|DENNER|ALDI|LIDL|VOLG|SPAR|MANOR FOOD|BOTTEGA/.test(text)) {
    return { transactionType: 'expense' as const, category: 'Lebensmittel' }
  }
  if (/CSS|HELVETIA|VERSICHERUNG|KRANKENKASSE|ASSURANCE/.test(text)) {
    return { transactionType: 'expense' as const, category: 'Versicherungen' }
  }
  if (/STEUER|TAX|BAZG|BUNDESSTEUER|GEMEINDE/.test(text)) {
    return { transactionType: 'expense' as const, category: 'Steuern' }
  }
  if (/SBB|PARKING|PARKHAUS|TANKSTELLE|SHELL|BP |AVIA|MIGROL|BANCOMAT|ATM/.test(text)) {
    return { transactionType: 'expense' as const, category: /BANCOMAT|ATM/.test(text) ? 'Bargeld' : 'Mobilitaet' }
  }
  if (/GALAXUS|DIGITEC|AMAZON|ZALANDO|IKEA|ARISI/.test(text)) {
    return { transactionType: 'expense' as const, category: 'Shopping' }
  }
  if (/UBS|DIENSTLEISTUNGSPREIS|KONTOFUEHRUNG|KONTOFÜHRUNG|GEBUEHR|GEBÜHR/.test(text) && signedAmount < 0) {
    return { transactionType: 'expense' as const, category: 'Gebuehren' }
  }
  if (/TWINT/.test(text)) return { transactionType: signedAmount < 0 ? 'expense' as const : 'income' as const, category: 'TWINT' }
  if (/RUECKERSTATTUNG|RÜCKERSTATTUNG|REFUND|GUTSCHRIFT/.test(text)) {
    return { transactionType: 'income' as const, category: 'Rueckerstattung' }
  }
  return { transactionType: signedAmount < 0 ? 'expense' as const : 'income' as const, category: 'Sonstiges' }
}

async function readPdfText(file: File) {
  const pdfjs = await import('pdfjs-dist')
  const worker = await import('pdfjs-dist/build/pdf.worker.min.mjs?url')
  pdfjs.GlobalWorkerOptions.workerSrc = worker.default

  const bytes = await file.arrayBuffer()
  const document = (await pdfjs.getDocument({ data: bytes }).promise) as PdfDocument
  const pages: string[] = []

  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
    const page = await document.getPage(pageNumber)
    const content = await page.getTextContent()
    const pageText = content.items
      .map((item) => `${item.str ?? ''}${item.hasEOL ? '\n' : ' '}`)
      .join('')
    pages.push(pageText)
  }

  return pages.join('\n')
}

function parseUbsText(text: string) {
  const normalized = text
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s+/g, '\n')

  const rowPattern =
    /(\d{2}\.\d{2}\.\d{4})\s+(.+?)\s+(-?[\d']+[.,]\d{2})\s+(\d{2}\.\d{2}\.\d{4})\s+(-?[\d']+[.,]\d{2})(?=\s+\d{2}\.\d{2}\.\d{4}\s+|$)/gs

  const rows: ParsedBankTransaction[] = []
  for (const match of normalized.matchAll(rowPattern)) {
    const [, bookingDateRaw, descriptionRaw, amountRaw, valueDateRaw] = match
    const signedAmount = parseSwissAmount(amountRaw)
    if (!Number.isFinite(signedAmount) || signedAmount === 0) continue

    const originalDescription = cleanDescription(descriptionRaw)
    if (/^(Kontobewegungen|Buchungsdatum|Beschreibung|Belastung|Gutschrift|Valuta|Saldo)$/i.test(originalDescription)) continue

    const categorization = guessCategory(originalDescription, signedAmount)
    const bookingDate = toIsoDate(bookingDateRaw)
    const valueDate = toIsoDate(valueDateRaw)
    const importHash = hash(`${bookingDate}|${signedAmount.toFixed(2)}|${originalDescription}`)

    rows.push({
      id: importHash,
      bookingDate,
      valueDate,
      description: originalDescription.slice(0, 120),
      originalDescription,
      amount: Math.abs(signedAmount),
      transactionType: categorization.transactionType,
      category: categorization.category,
      source: 'UBS PDF',
      importHash,
    })
  }

  return rows
}

export async function parseBankStatement(file: File) {
  const text = await readPdfText(file)
  const transactions = parseUbsText(text)
  if (!transactions.length) throw new Error('Keine Buchungen erkannt. Aktuell ist der Import auf UBS-PDF-Auszüge optimiert.')
  return transactions
}
