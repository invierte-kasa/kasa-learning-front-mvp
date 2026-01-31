'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { MainNav } from '@/components/layout/MainNav'
import { motion } from 'motion/react'
import { ModuleCard } from '@/components/dashboard/ModuleCard'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Module } from '@/types'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

// Back arrow icon
const BackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
)

interface SectionData {
  id: string
  title: string
  topic: string
}

interface ModuleData {
  id: string
  section_id: string
  title: string
  xp: number
  estimated_time_in_minutes: number
  module_number: number
}

function SectionsContent() {
  const [isExitingPage, setIsExitingPage] = useState(false)
  const [sectionData, setSectionData] = useState<SectionData | null>(null)
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)
  const [shouldAnimate, setShouldAnimate] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const sectionId = searchParams.get('id') || '1' // Default to first section
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setShouldAnimate(false)
        setError(null)

        // Verificar autenticación
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          router.push('/sign-in')
          return
        }

        // Validar si sectionId es un UUID válido
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
        const isValidUUID = uuidRegex.test(sectionId)

        let section: SectionData | null = null

        if (!isValidUUID) {
          // Si no es un UUID válido, obtener la primera sección disponible
          const { data: sections, error: sectionsError } = await supabase
            .schema('kasa_learn_journey')
            .from('section')
            .select('*')
            .order('created_at', { ascending: true })
            .limit(1)

          if (sectionsError || !sections || sections.length === 0) {
            throw new Error('No se encontraron secciones disponibles')
          }

          section = sections[0]
        } else {
          // Fetch section info usando UUID válido
          const { data, error: sectionError } = await supabase
            .schema('kasa_learn_journey')
            .from('section')
            .select('*')
            .eq('id', sectionId)
            .single()

          if (sectionError) {
            throw new Error(`Error fetching section: ${sectionError.message}`)
          }
          section = data
        }

        if (!section) {
          throw new Error('No se pudo obtener la información de la sección')
        }

        setSectionData(section)

        // Fetch modules usando el ID de la sección obtenida
        const { data: modulesData, error: modulesError } = await supabase
          .schema('kasa_learn_journey')
          .from('module')
          .select('*')
          .eq('section_id', section.id)
          .order('module_number', { ascending: true })

        if (modulesError) {
          throw new Error(`Error fetching modules: ${modulesError.message}`)
        }

        // Transform to Module type with status logic
        const transformedModules: Module[] = (modulesData || []).map((mod: ModuleData, index: number) => ({
          id: mod.id,
          number: mod.module_number,
          title: mod.title,
          status: index === 0 ? 'active' : 'locked', // TODO: Implement real progress logic
          duration: mod.estimated_time_in_minutes,
          xp: mod.xp,
        }))

        setModules(transformedModules)
      } catch (err) {
        console.error('Error fetching data:', err)
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [sectionId, supabase, router])

  // Activar animaciones después de que los datos estén cargados
  useEffect(() => {
    if (!loading && sectionData) {
      // Pequeño delay para asegurar que el DOM está renderizado
      const timer = setTimeout(() => {
        setShouldAnimate(true)
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [loading, sectionData])

  const handleNavItemClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    if (isExitingPage) return

    setIsExitingPage(true)

    // Secuencia de salida: última animación termina en 0.9s (delay 0.5s + 0.4s duration)
    // Esperamos 0.3s adicionales = 1.2s total
    setTimeout(() => {
      router.push(href)
    }, 1200)
  }

  // Calculate totals from modules
  const totalXp = modules.reduce((sum, mod) => sum + mod.xp, 0)
  const progress = 50 // TODO: Calculate real progress from user_module_progress

  // Error state
  if (error || (!loading && !sectionData)) {
    return (
      <div className="flex flex-col min-h-screen lg:flex-row">
        <MainNav onNavItemClick={handleNavItemClick} />
        <main className="flex-1 p-6 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error || 'Sección no encontrada'}</p>
            <Link href="/" className="text-kasa-primary hover:underline">
              Volver al inicio
            </Link>
          </div>
        </main>
      </div>
    )
  }

  // Mostrar contenido (visible pero sin animar hasta que shouldAnimate sea true)
  return (
    <div className="flex flex-col min-h-screen lg:flex-row">
      <MainNav onNavItemClick={handleNavItemClick} />

      <main className="flex-1 p-6 pb-[calc(80px+1.5rem)] w-full lg:p-8 lg:pb-8 lg:max-w-[800px] lg:mx-auto">
        {/* Header con animación de entrada/salida (solo anima cuando shouldAnimate es true) */}
        <motion.header
          initial={{ y: '-100%', opacity: 0 }}
          animate={isExitingPage
            ? { y: '-100%', opacity: 0 }
            : shouldAnimate
              ? { y: 0, opacity: 1 }
              : { y: '-100%', opacity: 0 }
          }
          transition={isExitingPage
            ? { duration: 0.4, ease: [0.4, 0, 1, 1], delay: 0 }
            : {
              type: "spring",
              stiffness: 180,
              damping: 13,
              mass: 1,
              bounce: 0.7,
              delay: 0.2
            }
          }
          className="flex items-center justify-between mb-8 py-2"
        >
          <Link
            href="/"
            className="w-10 h-10 bg-kasa-card border border-kasa-border rounded-full flex items-center justify-center text-white no-underline"
          >
            <BackIcon />
          </Link>

          <div className="flex-1 ml-4">
            <h1 className="text-xl font-bold text-white">{sectionData?.title || ''}</h1>
            <p className="text-sm text-text-muted">{sectionData?.topic || ''}</p>
          </div>

          <div className="text-right">
            <span className="text-kasa-primary font-extrabold text-base">{totalXp} XP</span>
            <span className="block text-[0.65rem] uppercase text-text-muted font-bold">Total Reward</span>
          </div>
        </motion.header>

        {/* Section info (solo anima cuando shouldAnimate es true) */}
        <motion.section
          initial={{ y: '-100%', opacity: 0 }}
          animate={isExitingPage
            ? { y: '-100%', opacity: 0 }
            : shouldAnimate
              ? { y: 0, opacity: 1 }
              : { y: '-100%', opacity: 0 }
          }
          transition={isExitingPage
            ? { duration: 0.4, ease: [0.4, 0, 1, 1], delay: 0.5 }
            : {
              type: "spring",
              stiffness: 180,
              damping: 13,
              mass: 1,
              bounce: 0.7,
              delay: 0.2
            }
          }
          className="mt-4"
        >
          <div className="flex justify-between items-end mb-2">
            <div>
              <h2 className="text-3xl font-bold text-white mb-1">Sección 1</h2>
              <p className="text-text-muted">Progreso del currículo</p>
            </div>
            <div className="text-kasa-primary font-extrabold text-2xl">{progress}%</div>
          </div>

          <div className="mb-8">
            <ProgressBar value={progress} size="lg" />
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
        </motion.section>
      </main>
    </div>
  )
}

export default function SectionsPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="text-white">Cargando...</div></div>}>
      <SectionsContent />
    </Suspense>
  )
}
