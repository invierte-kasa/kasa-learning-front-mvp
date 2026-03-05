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

const FlagIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
    <line x1="4" y1="22" x2="4" y2="15"></line>
  </svg>
)

// Encouraging messages for incorrect answers (real estate themed)
const INCORRECT_MESSAGES = [
  '¡Cada error te acerca más a ser un experto inmobiliario! 🏗️',
  '¡Los mejores inversionistas aprenden de sus errores! 💡',
  '¡No te rindas! La inversión es un camino de aprendizaje. 📚',
  '¡Sigue así! Pronto dominarás este tema. 🏠',
  '¡Un error hoy, un acierto mañana! 🔑',
]

interface FeedbackOverlayProps {
  isCorrect: boolean
  onContinue: () => void
  correctAnswer?: string
  questionType?: string
}

export function FeedbackOverlay({ isCorrect, onContinue, correctAnswer, questionType }: FeedbackOverlayProps) {
  const randomMessage = INCORRECT_MESSAGES[Math.floor(Math.random() * INCORRECT_MESSAGES.length)]

  // Label for the correct answer based on question type
  const getAnswerLabel = () => {
    switch (questionType) {
      case 'choice': return 'Respuesta correcta:'
      case 'cloze': return 'Palabras correctas:'
      case 'input': return 'Respuesta esperada:'
      case 'pairs': return 'Relaciones correctas:'
      default: return 'Respuesta correcta:'
    }
  }

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 w-full z-[100] animate-[slideUp_0.35s_ease-out]',
        isCorrect ? 'bg-feedback-success-dark' : 'bg-feedback-error-dark'
      )}
    >
      {/* Main content */}
      <div className="max-w-[600px] mx-auto px-6 py-6">
        {isCorrect ? (
          /* ── Correct Answer ── */
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white rounded-full w-10 h-10 flex items-center justify-center text-kasa-primary-dark shrink-0">
                <CheckIcon />
              </div>
              <div>
                <h3 className="font-extrabold text-xl text-white">¡Impresionante!</h3>
                <p className="opacity-90 text-emerald-100 text-sm">Vas por buen camino.</p>
              </div>
            </div>

            <button
              onClick={onContinue}
              className="bg-white rounded-xl px-8 py-3.5 font-extrabold text-kasa-primary-dark shadow-[0_4px_0_#d1fae5] active:translate-y-0.5 active:shadow-[0_2px_0_#d1fae5] transition-all cursor-pointer border-none text-sm shrink-0"
            >
              CONTINUAR
            </button>
          </div>
        ) : (
          /* ── Incorrect Answer ── */
          <div className="flex flex-col gap-4">
            {/* Header row */}
            <div className="flex items-center gap-3 animate-[shakeX_0.4s_ease-in-out]">
              <div className="bg-white rounded-full w-10 h-10 flex items-center justify-center text-feedback-error-dark shrink-0">
                <XIcon />
              </div>
              <div>
                <h3 className="font-extrabold text-xl text-white">Respuesta Incorrecta</h3>
              </div>
            </div>

            {/* Correct answer card */}
            {correctAnswer && (
              <div className="bg-red-900/40 border border-red-500/30 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-red-300">
                    <FlagIcon />
                  </span>
                  <span className="text-red-200 text-xs font-bold uppercase tracking-wider">{getAnswerLabel()}</span>
                </div>
                <p className="text-white font-bold text-base leading-relaxed">
                  {correctAnswer}
                </p>
              </div>
            )}

            {/* Encouraging message */}
            <p className="text-red-200/80 text-sm">
              {randomMessage}
            </p>

            {/* Continue button */}
            <button
              onClick={onContinue}
              className="bg-white rounded-xl w-full py-3.5 font-extrabold text-feedback-error-dark shadow-[0_4px_0_#fee2e2] active:translate-y-0.5 active:shadow-[0_2px_0_#fee2e2] transition-all cursor-pointer border-none text-sm"
            >
              ENTENDIDO
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
