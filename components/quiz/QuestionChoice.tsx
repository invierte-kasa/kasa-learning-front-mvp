'use client'

import { cn } from '@/lib/utils'

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
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => onSelect(index)}
            className={cn(
              'bg-kasa-card border-2 rounded-2xl p-5 cursor-pointer transition-all flex items-center gap-4 font-semibold text-left text-white',
              selectedOption === index
                ? 'border-kasa-primary bg-kasa-primary/10'
                : 'border-kasa-border hover:border-text-muted hover:bg-kasa-hover'
            )}
          >
            <div
              className={cn(
                'w-8 h-8 rounded-lg border flex items-center justify-center text-sm',
                selectedOption === index
                  ? 'bg-kasa-primary text-white border-kasa-primary'
                  : 'border-kasa-border text-text-muted'
              )}
            >
              {index + 1}
            </div>
            <span>{option}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
