'use client'

import { UserProfile } from '@/context/UserContext'
import Head from 'next/head'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'motion/react'
import { useState, useEffect } from 'react'
import styles from './SyncScreen.module.css'

import { useUser } from '@/context/UserContext'

export function SyncScreen() {
  const { user } = useUser()
  const userName = user?.names_first || " "
  const UserProfile = user?.url_profile || " "
  const router = useRouter()
  const supabase = createClient()
  const [isVisible, setIsVisible] = useState(true)
  const [isExpanded, setIsExpanded] = useState(false)
  const [headerY, setHeaderY] = useState(0)
  const [whatsappX, setWhatsappX] = useState(0)

  console.log(user)
  useEffect(() => {
    // 1. Desaparece el contenido (Breadcrumbs/Loader) - 2s
    const visibilityTimer = setTimeout(() => {
      setIsVisible(false)
    }, 2000)

    // 2. Inicia la expansión fluida desde el centro - 2.5s
    const expansionTimer = setTimeout(() => {
      setIsExpanded(true)
    }, 2500)

    // 3. Desaparecer header y whatsapp - 3.5s
    const headerTimer = setTimeout(() => {
      setHeaderY(-200)
      setWhatsappX(200)
    }, 3500)

    return () => {
      clearTimeout(visibilityTimer)
      clearTimeout(expansionTimer)
      clearTimeout(headerTimer)
    }
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet" />
      </Head>

      <div className="fixed inset-0 z-[100] bg-[#ECEFE1] overflow-hidden" style={{ fontFamily: '__Montserrat_ca911e' }}>
        {/* Capa de Navegación (Siempre sobre la expansión) */}
        <div className={`${styles['header-container']} px-4 sm:px-6 lg:px-8 pt-12`}>
          <motion.header
            className="relative h-16 sm:h-20 lg:h-24 mt-2 sm:mt-4 lg:mt-7"
            animate={{ y: headerY }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
          >
            <div className={`absolute w-5/12 sm:w-4/12 lg:w-3/12 h-full ${isExpanded ? 'bg-transparent' : 'bg-[#101a28]'}`}></div>
            <div className={`relative z-10 h-full flex justify-center items-center pb-1 sm:pb-3 lg:pb-5 w-5/12 sm:w-4/12 lg:w-3/12 rounded-br-[30px] ${isExpanded ? 'bg-transparent' : 'bg-[#ECEFE1]'}`}>
              <img src="https://res.cloudinary.com/dtgrcjcbd/image/upload/v1756610794/Logo_dz1wjo.png" className="w-[100px] sm:w-[140px] lg:w-[180px] h-auto" alt="Kasa" />
            </div>

            <nav className="absolute top-0 right-0 h-full w-7/12 sm:w-8/12 lg:w-9/12 bg-[#101a28] rounded-tl-[30px] rounded-tr-[30px] px-10 flex items-center justify-between">
              <div className="hidden lg:flex flex-1 justify-between items-center pr-2">
                <ul className="flex items-center gap-4 text-white font-medium" style={{ fontFamily: '__Montserrat_ca911e' }}>
                  <li><a href="#" className="px-3 py-2 rounded-xl transition-all whitespace-nowrap hover:bg-black/20">Aprende</a></li>
                  <li><a href="#" className="px-3 py-2 rounded-xl transition-all whitespace-nowrap bg-black/30 hover:bg-black/20">Kasa Learn</a></li>
                  <li><a href="#" className="px-3 py-2 rounded-xl transition-all whitespace-nowrap hover:bg-black/20">Blog</a></li>
                  <li><a href="#" className="px-3 py-2 rounded-xl transition-all whitespace-nowrap hover:bg-black/20">Ayuda</a></li>
                  <li><a href="#" className="px-3 py-2 rounded-xl transition-all whitespace-nowrap hover:bg-black/20">Nosotros</a></li>
                </ul>

                <div className="flex items-center gap-8">
                  <button id="dropdownNotificationButton" className="relative inline-flex items-center text-sm font-medium text-center text-white hover:text-gray-200 focus:outline-none transition-transform duration-200 hover:scale-110" type="button">
                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" className="w-6 h-6" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                      <path d="M439.39 362.29c-19.32-20.76-55.47-51.99-55.47-154.29 0-77.7-54.48-139.9-127.94-155.16V32c0-17.67-14.32-32-31.98-32s-31.98 14.33-31.98 32v20.84C118.56 68.1 64.08 130.3 64.08 208c0 102.3-36.15 133.53-55.47 154.29-6 6.45-8.66 14.16-8.61 21.71.11 16.4 12.98 32 32.1 32h383.8c19.12 0 32-15.6 32.1-32 .05-7.55-2.61-15.27-8.61-21.71zM67.53 368c21.22-27.97 44.42-74.33 44.53-159.42 0-.2-.06-.38-.06-.58 0-61.86 50.14-112 112-112s112 50.14 112 112c0 .2-.06.38-.06.58.11 85.1 23.31 131.46 44.53 159.42H67.53zM224 512c35.32 0 63.97-28.65 63.97-64H160.03c0 35.35 28.65 64 63.97 64z"></path>
                    </svg>
                    <div className="absolute block w-3 h-3 bg-red-500 border-2 border-white rounded-full top-0 start-2.5"></div>
                  </button>
                  <div className="flex items-center gap-8">
                    <span className="flex items-center gap-3 text-white">
                      <div className="w-10 h-10 bg-gray-700 border border-gray-600 rounded-full flex items-center justify-center text-sm font-bold overflow-hidden">

                        <img
                          src={UserProfile}
                          alt={userName}
                          className="w-10 h-10 object-cover"
                        />

                      </div>
                      <span className="text-base font-medium whitespace-nowrap">Hey, {userName}!</span>
                    </span>
                    <button onClick={handleLogout} className="bg-[#00cc65] text-white border-none h-10 px-6 text-sm font-bold cursor-pointer transition-colors duration-200 whitespace-nowrap inline-flex items-center justify-center hover:bg-[#00a377]" style={{ borderRadius: 'calc(0.625rem + 4px)' }}>Cerrar Sesión</button>
                  </div>
                </div>
              </div>
              <button className="h-full flex flex-col justify-center items-center ml-auto lg:hidden cursor-pointer">
                <span className="block w-7 h-1 bg-white rounded"></span>
                <span className="block w-7 h-1 bg-white rounded my-1"></span>
                <span className="block w-7 h-1 bg-white rounded"></span>
              </button>
            </nav>
          </motion.header>
        </div>

        {/* Sección que se expande del centro hacia afuera */}
        <section className={`${styles['expandable-section']} ${isExpanded ? styles['is-expanded'] : ''}`}>
          <AnimatePresence initial={false}>
            {isVisible && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{
                  opacity: 0,
                  y: -50,
                  transition: {
                    duration: 0.3,
                    ease: [0.4, 0, 1, 1] // ease-in rápido
                  }
                }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                key="sync-content"
                className="flex-1 flex flex-col h-full"
              >
                <div className={`${styles.breadcrumbs} text-xs sm:text-sm flex justify-center text-white mt-10 px-4 py-2 sm:py-3`}>
                  <ul>
                    <li className="font-bold"><a href="/">Inicio</a></li>
                    <li className="opacity-60">Kasa Learn</li>
                  </ul>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center gap-6">
                  <div className="relative">
                    <div className={`w-16 h-16 border-4 border-[#00cc65]/20 border-t-[#00cc65] rounded-full ${styles['animate-spin']}`}></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className={`w-2 h-2 bg-[#00cc65] rounded-full ${styles['animate-ping']}`}></div>
                    </div>
                  </div>
                  <div className="text-center space-y-2">
                    <h2 className="text-xl sm:text-2xl font-bold text-white">Sincronizando con <span className="text-[#00cc65] text-nowrap">Kasa Learn</span></h2>
                    <p className="text-gray-400 text-sm sm:text-base max-w-xs mx-auto">Estamos preparando tu entorno de aprendizaje. Un momento, por favor...</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>

      {/* WhatsApp Button (z-index corregido) */}
      <motion.a
        href="https://wa.me/51917074464"
        className="fixed bottom-6 right-6 z-[9999] cursor-pointer hover:scale-110 transition-transform"
        target="_blank"
        rel="noopener noreferrer"
        animate={{ x: whatsappX }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
      >
        <span className="rounded-full shadow-lg bg-[#25D366] hover:bg-[#20ba5a] transition-colors w-14 h-14 flex items-center justify-center">
          <img
            alt="WhatsApp"
            loading="lazy"
            width="32"
            height="32"
            decoding="async"
            data-nimg="1"
            className="text-white"
            style={{ color: 'transparent' }}
            srcSet="/_next/image?url=https%3A%2F%2Fres.cloudinary.com%2Fdtgrcjcbd%2Fimage%2Fupload%2Fv1756159690%2Fwhatsapp_ffa7wt.svg&amp;w=32&amp;q=75 1x, /_next/image?url=https%3A%2F%2Fres.cloudinary.com%2Fdtgrcjcbd%2Fimage%2Fupload%2Fv1756159690%2Fwhatsapp_ffa7wt.svg&amp;w=64&amp;q=75 2x"
            src="/_next/image?url=https%3A%2F%2Fres.cloudinary.com%2Fdtgrcjcbd%2Fimage%2Fupload%2Fv1756159690%2Fwhatsapp_ffa7wt.svg&amp;w=64&amp;q=75"
          />
        </span>
      </motion.a>
    </>
  )
}
