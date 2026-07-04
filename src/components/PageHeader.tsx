import type { ReactNode } from 'react'

type PageHeaderProps = {
  eyebrow: string
  title: string
  description: string
  action?: ReactNode
}

export function PageHeader({ eyebrow, title, description, action }: PageHeaderProps) {
  return (
    <header className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-accent">{eyebrow}</p>
        <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">{title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted sm:text-base">{description}</p>
      </div>
      {action}
    </header>
  )
}
