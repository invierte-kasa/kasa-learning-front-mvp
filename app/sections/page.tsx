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
}

function SectionsContent() {
  const [sections, setSections] = useState<SectionData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [shouldAnimate, setShouldAnimate] = useState(false)
  const [isExitingPage, setIsExitingPage] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log("🚀 [SectionsPage] Petición directa GET a secciones...");
        setIsLoading(true);

        const { data, error: fetchError } = await supabase
          .schema('kasa_learn_journey')
          .from('section')
          .select('*')
          .order('created_at', { ascending: true });

        if (fetchError) {
          throw fetchError;
        }

        console.log("✅ [SectionsPage] Secciones obtenidas:", data?.length);
        setSections(data || []);
      } catch (err: any) {
        console.error("💥 [SectionsPage] Error:", err.message);
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

    // Exit sequence: Sections exit first (delay 0s), then Header (delay 0.3s)
    // Wait total 0.8s for transition
    setTimeout(() => {
      router.push(href)
    }, 800)
  }

  return (
    <div className="flex flex-col min-h-screen lg:flex-row bg-[#0F172A]">
      <MainNav onNavItemClick={handleNavItemClick} />

      <main className="flex-1 p-6 pb-[calc(80px+1.5rem)] w-full lg:p-8 lg:pb-8 lg:max-w-[1000px] lg:mx-auto overflow-hidden">
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
        </motion.header>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-[240px] rounded-3xl bg-kasa-card/50 animate-pulse border border-kasa-border" />
              ))}
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
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {sections.length === 0 ? (
                <div className="col-span-full py-20 text-center border-2 border-dashed border-white/10 rounded-3xl">
                  <p className="text-text-muted">No se encontraron secciones.</p>
                </div>
              ) : (
                sections.map((section, index) => (
                  <motion.div
                    key={section.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      duration: 0.4,
                      delay: 0.4 + (index * 0.1),
                    }}
                  >
                    <SectionCard
                      section={section}
                      href={`/sections/${section.id}`}
                    />
                  </motion.div>
                ))
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
