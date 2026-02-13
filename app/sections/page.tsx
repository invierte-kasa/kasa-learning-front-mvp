'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/utils/supabase/client'
import { MainNav } from '@/components/layout/MainNav'
import { SectionCard } from '@/components/dashboard/SectionCard'

// Icons
const BookIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
  </svg>
)

interface SectionData {
  id: string
  title: string
  topic: string
  level: number
}

interface ModuleCountData {
  section_id: string
  total: number
  completed: number
}

const supabase = createClient()

function SectionsContent() {
  const [sections, setSections] = useState<SectionData[]>([])
  const [moduleCounts, setModuleCounts] = useState<Map<string, ModuleCountData>>(new Map())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [shouldAnimate, setShouldAnimate] = useState(false)
  const [isExitingPage, setIsExitingPage] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log("🚀 [SectionsPage] Intentando obtener secciones...");
        setIsLoading(true);

        // 1. Fetch sections ordered by level
        const { data, error: fetchError } = await supabase
          .schema('kasa_learn_journey')
          .from('section')
          .select('*')
          .order('level', { ascending: true });

        if (fetchError) {
          console.error("❌ [SectionsPage] Error:", fetchError.message);

          // Fallback to public schema
          const { data: publicData, error: publicError } = await supabase
            .from('section')
            .select('*')
            .order('level', { ascending: true });

          if (publicError) {
            throw fetchError;
          }

          setSections(publicData || []);
        } else {
          console.log("✅ [SectionsPage] Secciones obtenidas:", data?.length);
          setSections(data || []);
        }

        // 2. Fetch module counts per section
        const { data: modulesData } = await supabase
          .schema('kasa_learn_journey')
          .from('module')
          .select('id, section_id');

        if (modulesData) {
          const countsMap = new Map<string, ModuleCountData>();

          modulesData.forEach((mod: any) => {
            const existing = countsMap.get(mod.section_id);
            if (existing) {
              existing.total += 1;
            } else {
              countsMap.set(mod.section_id, {
                section_id: mod.section_id,
                total: 1,
                completed: 0, // mocked for now
              });
            }
          });

          setModuleCounts(countsMap);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
        setTimeout(() => setShouldAnimate(true), 100);
      }
    };

    loadData();
  }, []);

  const handleNavItemClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    if (isExitingPage) return

    setIsExitingPage(true)

    setTimeout(() => {
      router.push(href)
    }, 800)
  }

  // Determine status for each section based on order
  // Mock logic: first section = active, rest = locked
  // In the future this would check actual user_section_progress
  const getSectionStatus = (index: number): 'completed' | 'active' | 'locked' => {
    if (index === 0) return 'active'
    // Mock: mark first as active, rest locked
    // Could mark index 0 as completed if user has finished it
    return 'locked'
  }

  const getSectionProgress = (sectionId: string): number => {
    const counts = moduleCounts.get(sectionId)
    if (!counts || counts.total === 0) return 0
    // Mock progress: 35% for first section, 0 for rest
    const section = sections.find(s => s.id === sectionId)
    if (section && sections.indexOf(section) === 0) return 35
    return 0
  }

  const getSectionCompletedModules = (sectionId: string): number => {
    const section = sections.find(s => s.id === sectionId)
    if (section && sections.indexOf(section) === 0) {
      const counts = moduleCounts.get(sectionId)
      // Mock: 1 completed module for first section
      return counts ? Math.min(1, counts.total) : 0
    }
    return 0
  }

  return (
    <div className="flex flex-col min-h-screen lg:flex-row bg-[#0F172A]">
      <MainNav onNavItemClick={handleNavItemClick} />

      <main className="flex-1 p-6 pb-[calc(80px+1.5rem)] w-full lg:p-8 lg:pb-8 lg:max-w-[720px] lg:mx-auto overflow-hidden">
        <motion.header
          initial={{ y: -50, opacity: 0 }}
          animate={isExitingPage
            ? { y: -100, opacity: 0 }
            : (shouldAnimate ? { y: 0, opacity: 1 } : { y: -50, opacity: 0 })
          }
          transition={isExitingPage
            ? { duration: 0.4, ease: "easeInOut", delay: 0.3 }
            : { type: "spring", stiffness: 180, damping: 13, mass: 1, bounce: 0.7, delay: 0.1 }
          }
          className="flex flex-col gap-2 mb-10"
        >
          <div className="flex items-center gap-3 text-kasa-primary mb-2">
            <BookIcon />
            <span className="text-xs font-black uppercase tracking-[0.2em]">Ruta de Aprendizaje</span>
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">
            Secciones <span className="text-kasa-primary">Disponibles</span>
          </h1>
          <p className="text-white/40 text-sm mt-1">
            Completa cada sección para desbloquear la siguiente
          </p>
        </motion.header>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-4"
            >
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-[180px] rounded-2xl bg-[#141e30]/50 animate-pulse border border-white/[0.06]" />
              ))}
            </motion.div>
          ) : error ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-20 text-center border-2 border-dashed border-red-500/20 rounded-3xl bg-red-500/5"
            >
              <p className="text-red-400 mb-2 font-bold">Error al cargar secciones</p>
              <p className="text-red-400/60 text-sm">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-6 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl transition-colors text-sm font-bold"
              >
                Reintentar
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 100 }}
              animate={isExitingPage
                ? { y: 100, opacity: 0 }
                : { y: 0, opacity: 1 }
              }
              transition={isExitingPage
                ? { duration: 0.4, ease: "easeInOut", delay: 0 }
                : { type: "spring", stiffness: 180, damping: 13, mass: 1, bounce: 0.7, delay: 0.3 }
              }
              className="flex flex-col gap-4"
            >
              {sections.length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-white/10 rounded-3xl">
                  <p className="text-text-muted">No se encontraron secciones.</p>
                </div>
              ) : (
                <>
                  {/* Vertical connector line behind cards */}
                  <div className="relative">
                    <div className="relative z-10 flex flex-col gap-4">
                      {sections.map((section, index) => {
                        const sectionStatus = getSectionStatus(index)
                        const progress = getSectionProgress(section.id)
                        const counts = moduleCounts.get(section.id)
                        const totalModules = counts?.total || 0
                        const completedModules = getSectionCompletedModules(section.id)

                        return (
                          <motion.div
                            key={section.id}
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{
                              duration: 0.5,
                              delay: 0.4 + (index * 0.12),
                              ease: [0.25, 0.46, 0.45, 0.94]
                            }}
                          >
                            <SectionCard
                              section={section}
                              progress={progress}
                              totalModules={totalModules}
                              completedModules={completedModules}
                              status={sectionStatus}
                              href={`/sections/${section.id}`}
                            />
                          </motion.div>
                        )
                      })}
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}

export default function SectionsPage() {
  return (
    <Suspense fallback={<div className="bg-[#0F172A] min-h-screen" />}>
      <SectionsContent />
    </Suspense>
  )
}
