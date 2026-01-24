'use client'

interface ProfileHeroProps {
  name: string
  avatar: string
  level: number
  role: string
  memberSince: string
}

export function ProfileHero({ name, avatar, level, role, memberSince }: ProfileHeroProps) {
  return (
    <section className="flex flex-col items-center text-center mb-8">
      <div className="relative mb-6">
        <img
          src={avatar}
          alt={name}
          className="w-[150px] h-[150px] rounded-full border-4 border-kasa-primary object-cover shadow-[0_0_25px_rgba(16,185,129,0.2)]"
        />
        <div className="absolute bottom-1 right-4 bg-kasa-primary text-black font-extrabold text-xs px-3 py-1 rounded-full border-[3px] border-kasa-body">
          LVL {level}
        </div>
      </div>
      <h2 className="text-3xl font-extrabold mb-1 text-white">{name}</h2>
      <p className="text-kasa-primary font-bold text-base mb-1">{role}</p>
      <p className="text-text-muted text-sm">Miembro desde {memberSince}</p>
    </section>
  )
}
