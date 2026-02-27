'use client'

import { cn } from '@/lib/utils'

interface QuestionPairsProps {
    question: string
    leftWords: string[]
    rightWords: string[]
    selectedPairs: Record<string, string>
    selectedLeft: string | null
    onSelectLeft: (word: string) => void
    onSelectRight: (word: string) => void
    onDeselectPair: (leftWord: string) => void
}

// Colores para los pares emparejados (estilo Duolingo)
const PAIR_COLORS = [
    { bg: 'bg-emerald-500/20', border: 'border-emerald-400', text: 'text-emerald-300' },
    { bg: 'bg-sky-500/20', border: 'border-sky-400', text: 'text-sky-300' },
    { bg: 'bg-amber-500/20', border: 'border-amber-400', text: 'text-amber-300' },
    { bg: 'bg-violet-500/20', border: 'border-violet-400', text: 'text-violet-300' },
    { bg: 'bg-rose-500/20', border: 'border-rose-400', text: 'text-rose-300' },
    { bg: 'bg-teal-500/20', border: 'border-teal-400', text: 'text-teal-300' },
    { bg: 'bg-orange-500/20', border: 'border-orange-400', text: 'text-orange-300' },
    { bg: 'bg-fuchsia-500/20', border: 'border-fuchsia-400', text: 'text-fuchsia-300' },
]

export function QuestionPairs({
    question,
    leftWords,
    rightWords,
    selectedPairs,
    selectedLeft,
    onSelectLeft,
    onSelectRight,
    onDeselectPair,
}: QuestionPairsProps) {
    // Asignar un color a cada par emparejado
    const pairedLeftWords = Object.keys(selectedPairs)
    const getColorIndex = (leftWord: string) => {
        const idx = pairedLeftWords.indexOf(leftWord)
        return idx >= 0 ? idx % PAIR_COLORS.length : -1
    }

    const getRightColorIndex = (rightWord: string) => {
        const leftKey = Object.entries(selectedPairs).find(([, v]) => v === rightWord)?.[0]
        if (!leftKey) return -1
        return getColorIndex(leftKey)
    }

    return (
        <div className="flex-1 flex flex-col">
            <h2 className="text-2xl font-extrabold mb-8 leading-snug text-white">{question}</h2>

            <div className="grid grid-cols-2 gap-4">
                {/* Columna izquierda */}
                <div className="flex flex-col gap-3">
                    {leftWords.map((word) => {
                        const isPaired = word in selectedPairs
                        const colorIdx = getColorIndex(word)
                        const color = colorIdx >= 0 ? PAIR_COLORS[colorIdx] : null

                        return (
                            <button
                                key={`left-${word}`}
                                onClick={() => isPaired ? onDeselectPair(word) : onSelectLeft(word)}
                                className={cn(
                                    'group border-2 rounded-2xl p-4 cursor-pointer transition-all font-semibold text-left text-sm min-h-[56px] flex items-center justify-between',
                                    isPaired && color
                                        ? `${color.bg} ${color.border} ${color.text} hover:opacity-70`
                                        : selectedLeft === word
                                            ? 'border-kasa-primary bg-kasa-primary/20 text-white shadow-[0_0_16px_rgba(16,185,129,0.25)] scale-[1.02]'
                                            : 'bg-kasa-card border-kasa-border text-white hover:border-text-muted hover:bg-kasa-hover active:scale-[0.98]'
                                )}
                            >
                                <span>{word}</span>
                                {isPaired && (
                                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs ml-2">
                                        ✕
                                    </span>
                                )}
                            </button>
                        )
                    })}
                </div>

                {/* Columna derecha */}
                <div className="flex flex-col gap-3">
                    {rightWords.map((word) => {
                        const isPaired = Object.values(selectedPairs).includes(word)
                        const colorIdx = getRightColorIndex(word)
                        const color = colorIdx >= 0 ? PAIR_COLORS[colorIdx] : null
                        // Find the left word paired to this right word for de-selection
                        const pairedLeftWord = Object.entries(selectedPairs).find(([, v]) => v === word)?.[0]

                        return (
                            <button
                                key={`right-${word}`}
                                onClick={() => {
                                    if (isPaired && pairedLeftWord) {
                                        onDeselectPair(pairedLeftWord)
                                    } else if (!isPaired && selectedLeft) {
                                        onSelectRight(word)
                                    }
                                }}
                                disabled={!isPaired && !selectedLeft}
                                className={cn(
                                    'group border-2 rounded-2xl p-4 cursor-pointer transition-all font-semibold text-left text-sm min-h-[56px] flex items-center justify-between',
                                    isPaired && color
                                        ? `${color.bg} ${color.border} ${color.text} hover:opacity-70`
                                        : !selectedLeft
                                            ? 'bg-kasa-card border-kasa-border text-text-muted cursor-not-allowed'
                                            : 'bg-kasa-card border-kasa-border text-white hover:border-text-muted hover:bg-kasa-hover active:scale-[0.98]'
                                )}
                            >
                                <span>{word}</span>
                                {isPaired && (
                                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs ml-2">
                                        ✕
                                    </span>
                                )}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Indicador de progreso de emparejamiento */}
            <div className="mt-6 text-center">
                <span className="text-text-muted text-sm">
                    {Object.keys(selectedPairs).length} / {leftWords.length} pares conectados
                </span>
            </div>
        </div>
    )
}
