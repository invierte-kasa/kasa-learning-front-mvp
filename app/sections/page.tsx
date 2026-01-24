'use client'

import Link from 'next/link'
import { MainNav } from '@/components/layout/MainNav'
import { ModuleCard } from '@/components/dashboard/ModuleCard'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Module } from '@/types'

// Back arrow icon
const BackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
)

// Mock data
const sectionData = {
  title: 'Fundamentos',
  subtitle: 'Master property valuation',
  totalXp: 450,
  progress: 50,
}

const modules: Module[] = [
  {
    id: '1',
    number: 1,
    title: 'Conceptos Basicos de Inversion',
    status: 'completed',
    duration: 15,
    xp: 100,
  },
  {
    id: '2',
    number: 2,
    title: 'Tipos de Propiedades',
    status: 'completed',
    duration: 25,
    xp: 150,
  },
  {
    id: '3',
    number: 3,
    title: 'Estudio de Mercado Local',
    status: 'active',
    duration: 20,
    xp: 200,
  },
  {
    id: '4',
    number: 4,
    title: 'Analisis de Riesgo Financiero',
    status: 'locked',
    duration: 30,
    xp: 200,
  },
]

export default function SectionsPage() {
  return (
    <div className="flex flex-col min-h-screen lg:flex-row">
      <MainNav />

      <main className="flex-1 p-6 pb-[calc(80px+1.5rem)] w-full lg:p-8 lg:pb-8 lg:max-w-[800px] lg:mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-8 py-2">
          <Link
            href="/"
            className="w-10 h-10 bg-kasa-card border border-kasa-border rounded-full flex items-center justify-center text-white no-underline"
          >
            <BackIcon />
          </Link>

          <div className="flex-1 ml-4">
            <h1 className="text-xl font-bold text-white">{sectionData.title}</h1>
            <p className="text-sm text-text-muted">{sectionData.subtitle}</p>
          </div>

          <div className="text-right">
            <span className="text-kasa-primary font-extrabold text-base">{sectionData.totalXp} XP</span>
            <span className="block text-[0.65rem] uppercase text-text-muted font-bold">Total Reward</span>
          </div>
        </header>

        {/* Section info */}
        <section className="mt-4">
          <div className="flex justify-between items-end mb-2">
            <div>
              <h2 className="text-3xl font-bold text-white mb-1">Seccion 1</h2>
              <p className="text-text-muted">Progreso del curriculo</p>
            </div>
            <div className="text-kasa-primary font-extrabold text-2xl">{sectionData.progress}%</div>
          </div>

          <div className="mb-8">
            <ProgressBar value={sectionData.progress} size="lg" />
          </div>

          {/* Modules list */}
          <div className="flex flex-col gap-6">
            {modules.map((module) => (
              <ModuleCard
                key={module.id}
                module={module}
                href={module.status === 'active' ? '/lesson/1' : undefined}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
