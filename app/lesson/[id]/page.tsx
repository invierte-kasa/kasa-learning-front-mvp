'use client'

import Link from 'next/link'
import { MainNav } from '@/components/layout/MainNav'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'

// Icons
const BackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
)

const ClockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
)

const StarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
  </svg>
)

const LightbulbIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18h6M10 22h4m-7-5 a7 7 0 1 1 10 0a3 3 0 0 0 -3 3v1h-4v-1a3 3 0 0 0 -3-3z"></path>
  </svg>
)

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
)

const FileIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="9" y1="15" x2="15" y2="15"></line>
  </svg>
)

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
)

// Lesson data
const lessonData = {
  id: '1',
  title: 'El ABC del Real Estate:',
  highlightTitle: 'Flujo de Caja',
  breadcrumbs: ['FUNDAMENTOS', 'MODULO 1'],
  duration: 5,
  level: 'Nivel Basico',
  xp: 350,
  progress: 60,
}

const checklistItems = [
  { title: 'Ingresos Brutos:', description: 'El total de rentas cobradas mensualmente.' },
  { title: 'Gastos Operativos:', description: 'Mantenimiento, impuestos, seguros y administracion.' },
  { title: 'Servicio de Deuda:', description: 'El pago mensual de capital e intereses al banco.' },
]

export default function LessonPage() {
  return (
    <div className="flex flex-col min-h-screen lg:flex-row">
      <MainNav />

      <main className="flex-1 p-6 pb-[calc(80px+120px)] w-full lg:pb-[120px]">
        <div className="max-w-[700px] mx-auto">
          {/* Header */}
          <header className="py-6 flex items-center justify-between mb-8 border-b border-kasa-border sticky top-0 bg-kasa-body z-10">
            <Link
              href="/sections"
              className="w-10 h-10 bg-kasa-card border border-kasa-border rounded-full flex items-center justify-center text-white no-underline flex-shrink-0"
            >
              <BackIcon />
            </Link>

            <div className="flex-1 ml-4">
              <h4 className="text-base font-bold text-white">Leccion</h4>
              <p className="text-xs text-text-muted uppercase">Kasa Learn Journal</p>
            </div>

            <div className="text-right flex flex-col items-end gap-1">
              <span className="text-xs text-kasa-primary font-bold">{lessonData.xp} XP</span>
              <div className="w-16">
                <ProgressBar value={lessonData.progress} size="sm" />
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="px-6 lg:px-0">
            {/* Breadcrumbs */}
            <nav className="text-xs font-bold text-kasa-primary uppercase tracking-widest mb-3 flex gap-2 opacity-90">
              {lessonData.breadcrumbs.join(' › ')}
            </nav>

            {/* Title */}
            <h1 className="text-3xl font-extrabold leading-tight mb-6 text-white">
              {lessonData.title}<br />
              <em className="not-italic text-kasa-primary">{lessonData.highlightTitle}</em>
            </h1>

            {/* Meta */}
            <div className="flex gap-6 mb-8 text-sm text-text-muted">
              <div className="flex items-center gap-2">
                <ClockIcon />
                <span>{lessonData.duration} min lectura</span>
              </div>
              <div className="flex items-center gap-2">
                <StarIcon />
                <span>{lessonData.level}</span>
              </div>
            </div>

            {/* Article content */}
            <article>
              <p className="text-lg text-white mb-6 opacity-90">
                El flujo de caja (o cash flow) es el alma de cualquier inversion inmobiliaria. No se trata solo de cuanto vale la propiedad, sino de cuanto dinero queda en tu bolsillo al final del mes.
              </p>

              <h2 className="text-2xl font-bold mt-10 mb-5 text-white">¿Como se calcula?</h2>

              <p className="text-lg text-white mb-6 opacity-90">
                Para determinar el flujo de caja neto, restamos todos los gastos operativos y el servicio de la deuda (la hipoteca) de los ingresos brutos del alquiler.
              </p>

              {/* Key concept box */}
              <div className="bg-kasa-primary/5 border-l-4 border-kasa-primary rounded-xl p-6 my-8">
                <div className="flex items-center gap-3 text-kasa-primary text-xs font-extrabold uppercase mb-4">
                  <LightbulbIcon />
                  Concepto Clave
                </div>
                <div className="text-base italic text-white">
                  &quot;Un flujo de caja positivo te permite reinvertir, mientras que un flujo negativo requiere que pongas dinero de tu bolsillo cada mes.&quot;
                </div>
              </div>

              {/* Checklist */}
              <ul className="list-none flex flex-col gap-5 my-8">
                {checklistItems.map((item, index) => (
                  <li key={index} className="flex gap-4 items-start">
                    <div className="w-5 h-5 bg-kasa-primary text-white rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckIcon />
                    </div>
                    <div className="text-text-muted">
                      <strong className="text-white font-bold">{item.title}</strong> {item.description}
                    </div>
                  </li>
                ))}
              </ul>

              {/* Next hint */}
              <div className="text-center text-text-muted text-sm italic mt-8 flex items-center justify-center gap-2">
                ¿Listo para poner a prueba lo aprendido?
                <ChevronDownIcon />
              </div>
            </article>
          </div>

          {/* Fixed action buttons */}
          <div className="fixed bottom-[calc(80px+env(safe-area-inset-bottom))] left-0 w-full p-6 pb-10 bg-gradient-to-t from-kasa-body via-kasa-body to-transparent z-50 flex flex-col items-center gap-3 lg:left-[260px] lg:w-[calc(100%-260px)]">
            <Link href="/quiz/1" className="w-full max-w-[400px] no-underline">
              <Button fullWidth className="gap-3">
                DAR PRUEBA
                <FileIcon />
              </Button>
            </Link>
            <Link href="/sections" className="w-full max-w-[400px] no-underline">
              <Button variant="secondary" fullWidth>
                Cancelar
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
