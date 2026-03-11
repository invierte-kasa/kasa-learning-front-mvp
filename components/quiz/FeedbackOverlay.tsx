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

const LightbulbIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18h6M10 22h4M12 2a7 7 0 0 1 7 7c0 2.5-1.3 4.7-3.3 6l-.7.5V18H9v-2.5l-.7-.5C6.3 13.7 5 11.5 5 9a7 7 0 0 1 7-7z"/>
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

const GENERIC_CORRECT_SUMMARY = '¡Excelente trabajo! Sigue así para convertirte en un experto en inversión inmobiliaria.'
const GENERIC_WRONG_SUMMARY = 'Revisa este concepto con calma — entenderlo bien te ayudará a tomar mejores decisiones de inversión.'

interface FeedbackOverlayProps {
  isCorrect: boolean
  onContinue: () => void
  correctAnswer?: string
  questionType?: string
  /** Contextual summary from the DB (correct_answer_summary or wrong_answer_summary). Null/undefined shows a generic message. */
  summary?: string | null
}

export function FeedbackOverlay({ isCorrect, onContinue, correctAnswer, questionType, summary }: FeedbackOverlayProps) {
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

  // The explanation text to show (summary from DB, or generic fallback)
  const explanationText = summary?.trim() || (isCorrect ? GENERIC_CORRECT_SUMMARY : GENERIC_WRONG_SUMMARY)

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 w-full z-[100] animate-bounce-feedback',
        isCorrect ? 'bg-feedback-success-dark' : 'bg-feedback-error-dark'
      )}
    >
      {/* Main content */}
      <div className="max-w-[600px] mx-auto px-6 pt-5 pb-7 flex flex-col gap-4">
        {isCorrect ? (
          /* ── Correct Answer ── */
          <>
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

            {/* Explanation / summary box */}
            <div className="bg-emerald-900/40 border border-emerald-500/30 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-emerald-300">
                  <LightbulbIcon />
                </span>
                <span className="text-emerald-200 text-xs font-bold uppercase tracking-wider">¿Por qué es correcta?</span>
              </div>
              <p className="text-white/90 text-sm leading-relaxed">
                {explanationText}
              </p>
            </div>
          </>
        ) : (
          /* ── Incorrect Answer ── */
          <div className="flex flex-col gap-4">
            {/* Header row */}
            <div className="flex items-center gap-3 animate-shake-x">
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

            {/* Explanation / summary box */}
            <div className="bg-red-900/30 border border-red-500/20 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-red-300">
                  <LightbulbIcon />
                </span>
                <span className="text-red-200 text-xs font-bold uppercase tracking-wider">¿Por qué?</span>
              </div>
              <p className="text-white/90 text-sm leading-relaxed">
                {explanationText}
              </p>
            </div>

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
