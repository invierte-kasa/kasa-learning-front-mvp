'use client'

import { cn } from '@/lib/utils'

// Misma paleta de colores usada en QuestionPairs (estilo Duolingo)
const OPTION_COLORS = [
  { bg: 'bg-emerald-500/20', border: 'border-emerald-400', text: 'text-emerald-300', badgeBg: 'bg-emerald-500', badgeBorder: 'border-emerald-500' },
  { bg: 'bg-sky-500/20', border: 'border-sky-400', text: 'text-sky-300', badgeBg: 'bg-sky-500', badgeBorder: 'border-sky-500' },
  { bg: 'bg-amber-500/20', border: 'border-amber-400', text: 'text-amber-300', badgeBg: 'bg-amber-500', badgeBorder: 'border-amber-500' },
  { bg: 'bg-violet-500/20', border: 'border-violet-400', text: 'text-violet-300', badgeBg: 'bg-violet-500', badgeBorder: 'border-violet-500' },
  { bg: 'bg-rose-500/20', border: 'border-rose-400', text: 'text-rose-300', badgeBg: 'bg-rose-500', badgeBorder: 'border-rose-500' },
  { bg: 'bg-teal-500/20', border: 'border-teal-400', text: 'text-teal-300', badgeBg: 'bg-teal-500', badgeBorder: 'border-teal-500' },
  { bg: 'bg-orange-500/20', border: 'border-orange-400', text: 'text-orange-300', badgeBg: 'bg-orange-500', badgeBorder: 'border-orange-500' },
  { bg: 'bg-fuchsia-500/20', border: 'border-fuchsia-400', text: 'text-fuchsia-300', badgeBg: 'bg-fuchsia-500', badgeBorder: 'border-fuchsia-500' },
]

interface QuestionChoiceProps {
  question: string
  options: string[]
  selectedOption: number | null
  onSelect: (index: number) => void
}

export function QuestionChoice({ question, options, selectedOption, onSelect }: QuestionChoiceProps) {
  return (
    <div className="flex-1 flex flex-col">
      <h2 className="text-2xl font-extrabold mb-8 leading-snug text-white">{question}</h2>

      <div className="flex flex-col gap-3">
        {options.map((option, index) => {
          const color = OPTION_COLORS[index % OPTION_COLORS.length]
          const isSelected = selectedOption === index

          return (
            <button
              key={index}
              onClick={() => onSelect(index)}
              className={cn(
                'bg-kasa-card border-2 rounded-2xl p-5 cursor-pointer transition-all flex items-center gap-4 font-semibold text-left text-white',
                isSelected
                  ? `${color.bg} ${color.border}`
                  : 'border-kasa-border hover:border-text-muted hover:bg-kasa-hover'
              )}
            >
              <div
                className={cn(
                  'w-8 h-8 rounded-lg border flex items-center justify-center text-sm',
                  isSelected
                    ? `${color.badgeBg} text-white ${color.badgeBorder}`
                    : 'border-kasa-border text-text-muted'
                )}
              >
                {index + 1}
              </div>
              <span>{option}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
