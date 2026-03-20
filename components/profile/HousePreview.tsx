'use client'

import { Maximize2 } from 'lucide-react'
import { Button } from '../ui/Button'

interface HousePreviewProps {
  level: string
  imageUrl?: string
}

export function HousePreview({ level, imageUrl }: HousePreviewProps) {
  const defaultImage = 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=800'

  return (
    <section
      className="rounded-[2rem] h-[180px] w-full p-6 flex items-end justify-between mb-8 relative overflow-hidden border border-kasa-border"
      style={{
        background: `linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 100%), url('${imageUrl || defaultImage}') center/cover`,
      }}
    >
      <div>
        <p className="text-kasa-primary font-extrabold text-sm uppercase tracking-widest">Nivel: {level}</p>
        <h3 className="text-2xl font-black text-white">Tu Casa</h3>
      </div>
      <Button variant="continue" size="sm" className="gap-2">
        VER 3D
        <Maximize2 size={18} />
      </Button>
    </section>
  )
}
