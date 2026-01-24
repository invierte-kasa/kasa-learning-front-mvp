'use client'

import { ReactNode } from 'react'

interface StatCardProps {
  value: string | number
  label: string
  icon: ReactNode
}

export function StatCard({ value, label, icon }: StatCardProps) {
  return (
    <div className="bg-kasa-card border border-kasa-border rounded-card p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-kasa-primary hover:bg-kasa-hover">
      <span className="text-3xl font-black text-kasa-primary mb-2 block">{value}</span>
      <span className="text-xs font-extrabold text-text-muted uppercase tracking-widest flex items-center justify-center gap-1.5">
        {icon}
        {label}
      </span>
    </div>
  )
}
