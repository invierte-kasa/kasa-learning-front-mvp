'use client'

import { cn } from '@/lib/utils'

// Icons
const CheckIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
)

const XIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
)

interface FeedbackOverlayProps {
  isCorrect: boolean
  onContinue: () => void
}

export function FeedbackOverlay({ isCorrect, onContinue }: FeedbackOverlayProps) {
  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 w-full p-8 flex items-center justify-between z-[100]',
        isCorrect ? 'bg-feedback-success-dark text-emerald-50' : 'bg-feedback-error-dark text-red-100'
      )}
    >
      <div className="flex items-center gap-4">
        <div
          className={cn(
            'bg-white rounded-full w-10 h-10 flex items-center justify-center',
            isCorrect ? 'text-kasa-primary-dark' : 'text-feedback-error-dark'
          )}
        >
          {isCorrect ? <CheckIcon /> : <XIcon />}
        </div>
        <div>
          <h3 className="font-extrabold text-xl text-white">
            {isCorrect ? '¡Impresionante!' : 'Respuesta Incorrecta'}
          </h3>
          <p className="opacity-90 text-white">
            {isCorrect ? 'Vas por buen camino.' : '¡Tu puedes, intentalo de nuevo!'}
          </p>
        </div>
      </div>

      <button
        onClick={onContinue}
        className={cn(
          'bg-white rounded-xl px-10 py-4 font-extrabold transition-all',
          isCorrect
            ? 'text-kasa-primary-dark shadow-[0_4px_0_#d1fae5]'
            : 'text-feedback-error-dark shadow-[0_4px_0_#fee2e2]'
        )}
      >
        CONTINUAR
      </button>
    </div>
  )
}
