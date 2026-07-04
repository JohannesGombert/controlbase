import type { ReactNode } from 'react'

type PanelProps = {
  children: ReactNode
  className?: string
}

export function Panel({ children, className = '' }: PanelProps) {
  const background = className.includes('bg-') ? '' : 'bg-white'
  return <section className={`rounded-2xl border border-line ${background} p-5 shadow-card sm:p-6 ${className}`}>{children}</section>
}

export function SectionTitle({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-5">
      <h2 className="font-display text-2xl font-semibold tracking-tight">{title}</h2>
      {description && <p className="mt-1 text-sm leading-6 text-muted">{description}</p>}
    </div>
  )
}
