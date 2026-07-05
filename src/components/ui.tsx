import type { ComponentPropsWithoutRef, ReactNode } from 'react'

type ButtonProps = ComponentPropsWithoutRef<'button'>
type InputProps = ComponentPropsWithoutRef<'input'>
type SelectProps = ComponentPropsWithoutRef<'select'>
type TextareaProps = ComponentPropsWithoutRef<'textarea'>

const baseButton = 'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-55'
export const fieldClass = 'mt-2 w-full rounded-xl border border-line bg-soft px-3.5 py-3 text-sm text-ink outline-none transition placeholder:text-muted/60 focus:border-accent focus:bg-control-hover focus:ring-2 focus:ring-accent/15'
export const labelClass = 'text-[11px] font-bold uppercase tracking-[0.18em] text-muted'

export function PrimaryButton({ className = '', ...props }: ButtonProps) {
  return <button className={`${baseButton} executive-primary ${className}`} {...props} />
}

export function SecondaryButton({ className = '', ...props }: ButtonProps) {
  return <button className={`${baseButton} border border-line bg-transparent text-ink hover:border-control-borderStrong hover:bg-control-hover ${className}`} {...props} />
}

export function DangerButton({ className = '', ...props }: ButtonProps) {
  return <button className={`${baseButton} border border-status-danger bg-status-danger/10 text-status-danger hover:bg-status-danger/15 ${className}`} {...props} />
}

export function FormInput({ className = '', ...props }: InputProps) {
  return <input className={`${fieldClass} ${className}`} {...props} />
}

export function SelectInput({ className = '', ...props }: SelectProps) {
  return <select className={`${fieldClass} ${className}`} {...props} />
}

export function Textarea({ className = '', ...props }: TextareaProps) {
  return <textarea className={`${fieldClass} resize-y ${className}`} {...props} />
}

type StatusTone = 'success' | 'warning' | 'danger' | 'primary' | 'ceo' | 'muted'
const toneClass: Record<StatusTone, string> = {
  ceo: 'border-status-ceo/30 bg-status-ceo/10 text-status-ceo',
  danger: 'border-status-danger/30 bg-status-danger/10 text-status-danger',
  muted: 'border-line bg-soft text-muted',
  primary: 'border-status-primary/30 bg-status-primary/10 text-status-primary',
  success: 'border-status-success/30 bg-status-success/10 text-status-success',
  warning: 'border-status-warning/30 bg-status-warning/10 text-status-warning',
}

export function StatusBadge({ children, tone = 'muted' }: { children: ReactNode; tone?: StatusTone }) {
  return <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] ${toneClass[tone]}`}><span className="size-1.5 rounded-full bg-current" />{children}</span>
}

export function MetricCard({ label, value, note, tone = 'primary', icon }: { label: string; value: ReactNode; note?: string; tone?: StatusTone; icon?: ReactNode }) {
  return (
    <section className="executive-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-ink">{value}</p>
          {note && <p className="mt-1 text-xs text-muted">{note}</p>}
        </div>
        {icon && <span className={`grid size-10 place-items-center rounded-xl ${toneClass[tone]}`}>{icon}</span>}
      </div>
    </section>
  )
}

export function ActionCard({ title, description, action, tone = 'primary' }: { title: string; description: string; action?: ReactNode; tone?: StatusTone }) {
  return (
    <section className="executive-card p-5">
      <StatusBadge tone={tone}>Aktion</StatusBadge>
      <h3 className="mt-4 text-xl font-semibold text-ink">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </section>
  )
}
