'use client'

import { MainNav } from '@/components/layout/MainNav'
import { ProfileHero, StatCard, XPCard, StreakCard, HousePreview } from '@/components/profile'

// Icons
const BookIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
  </svg>
)

const StarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
  </svg>
)

const SettingsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
  </svg>
)

const ShareIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
    <polyline points="16 6 12 2 8 6"></polyline>
    <line x1="12" y1="2" x2="12" y2="15"></line>
  </svg>
)

// Mock user data
const userData = {
  name: 'Juan Rodriguez',
  avatar: 'https://ui-avatars.com/api/?name=Juan+Rodriguez&background=10B981&color=fff',
  level: 5,
  role: 'Real Estate Apprentice',
  memberSince: 'Ene 2024',
  modulesCompleted: 8,
  totalModules: 10,
  achievements: 12,
  currentXP: 4532,
  targetXP: 5000,
  streak: 7,
  houseLevel: 'Cabana Moderna',
}

const weekDays = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

export default function ProfilePage() {
  return (
    <div className="flex flex-col min-h-screen lg:flex-row">
      <MainNav />

      <main className="flex-1 p-6 pb-[calc(80px+1.5rem)] w-full lg:p-12 lg:pb-12 lg:max-w-[900px] lg:mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-10">
          <div className="w-10 h-10 flex items-center justify-center text-white cursor-pointer">
            <SettingsIcon />
          </div>
          <h2 className="font-extrabold text-lg uppercase tracking-widest text-white">Perfil de Usuario</h2>
          <div className="w-10 h-10 flex items-center justify-center text-white cursor-pointer">
            <ShareIcon />
          </div>
        </header>

        <ProfileHero
          name={userData.name}
          avatar={userData.avatar}
          level={userData.level}
          role={userData.role}
          memberSince={userData.memberSince}
        />

        {/* Stats grid */}
        <section className="grid grid-cols-2 gap-4 mb-6">
          <StatCard
            value={`${userData.modulesCompleted}/${userData.totalModules}`}
            label="Modulos"
            icon={<BookIcon />}
          />
          <StatCard
            value={userData.achievements}
            label="Logros"
            icon={<StarIcon />}
          />
        </section>

        <XPCard
          currentXP={userData.currentXP}
          targetXP={userData.targetXP}
          currentLevel={userData.level}
        />

        <StreakCard streak={userData.streak} days={weekDays} />

        <HousePreview level={userData.houseLevel} />
      </main>
    </div>
  )
}
