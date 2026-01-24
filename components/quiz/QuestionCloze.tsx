'use client'

import { cn } from '@/lib/utils'

interface FilledGap {
  word: string
  poolIdx: number
}

interface QuestionClozeProps {
  question: string
  sentence: string
  pool: string[]
  filledGaps: (FilledGap | null)[]
  onSelectWord: (word: string, poolIndex: number) => void
  onClearGap: (gapIndex: number) => void
}

export function QuestionCloze({
  question,
  sentence,
  pool,
  filledGaps,
  onSelectWord,
  onClearGap,
}: QuestionClozeProps) {
  const parts = sentence.split('[gap]')

  const usedPoolIndices = new Set(filledGaps.filter(Boolean).map((g) => g!.poolIdx))

  return (
    <div className="flex-1 flex flex-col">
      <h2 className="text-2xl font-extrabold mb-8 leading-snug text-white">{question}</h2>

      {/* Sentence with gaps */}
      <div className="text-xl leading-[2.2] mb-12 text-center text-white">
        {parts.map((part, i) => (
          <span key={i}>
            {part}
            {i < parts.length - 1 && (
              <button
                onClick={() => filledGaps[i] && onClearGap(i)}
                className={cn(
                  'inline-flex min-w-[100px] h-10 mx-2 rounded align-middle items-center justify-center transition-all',
                  filledGaps[i]
                    ? 'bg-kasa-card border-b-[3px] border-kasa-primary px-4 font-bold text-white cursor-pointer'
                    : 'bg-white/5 border-b-[3px] border-kasa-border'
                )}
              >
                {filledGaps[i]?.word || ''}
              </button>
            )}
          </span>
        ))}
      </div>

      {/* Word pool */}
      <div className="flex flex-wrap justify-center gap-3 mt-auto py-4">
        {pool.map((word, index) => {
          const isUsed = usedPoolIndices.has(index)
          return (
            <button
              key={index}
              onClick={() => !isUsed && onSelectWord(word, index)}
              disabled={isUsed}
              className={cn(
                'bg-kasa-card border-2 border-kasa-border rounded-xl px-5 py-2.5 font-bold transition-all select-none',
                isUsed
                  ? 'opacity-30 bg-transparent border-dashed cursor-default shadow-none text-text-muted'
                  : 'shadow-[0_3px_0_var(--border)] cursor-pointer active:translate-y-0.5 active:shadow-none text-white hover:bg-kasa-hover'
              )}
            >
              {word}
            </button>
          )
        })}
      </div>
    </div>
  )
}
