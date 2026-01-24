'use client'

import { useRouter } from 'next/navigation'
import { QuizContainer } from '@/components/quiz'
import { Question } from '@/types'

// Mock quiz data
const quizQuestions: Question[] = [
  {
    id: '1',
    type: 'choice',
    title: '¿Que es el flujo de caja (Cash Flow) en una inversion inmobiliaria?',
    options: [
      'El valor total de mercado de la propiedad.',
      'El dinero neto que queda mensualmente tras pagar todos los gastos.',
      'El impuesto que se paga al comprar un inmueble.',
      'La velocidad con la que se vende una propiedad.',
    ],
    correct: 1,
  },
  {
    id: '2',
    type: 'cloze',
    title: 'Completa el significado fundamental:',
    sentence: 'Un flujo de caja [gap] permite reinvertir, mientras que uno [gap] requiere poner dinero propio.',
    pool: ['positivo', 'negativo', 'nulo', 'catastral'],
    correct: ['positivo', 'negativo'],
  },
  {
    id: '3',
    type: 'choice',
    title: 'Si los gastos son mayores que los ingresos, el flujo de caja es...',
    options: ['Positivo', 'Nulo', 'Negativo', 'Variable'],
    correct: 2,
  },
  {
    id: '4',
    type: 'input',
    title: 'Termina la frase: El Cash Flow es el alma de cualquier...',
    placeholder: 'Escribe la palabra faltante',
    correct: 'inversion',
  },
  {
    id: '5',
    type: 'cloze',
    title: 'Une los conceptos correctamente:',
    sentence: 'Los ingresos [gap] menos los gastos [gap] resultan en el Cash Flow.',
    pool: ['brutos', 'operativos', 'netos', 'fijos'],
    correct: ['brutos', 'operativos'],
  },
  {
    id: '6',
    type: 'input',
    title: 'Si cobras $1000 de renta y gastas $700 en hipoteca y mantenimiento, ¿cual es tu flujo de caja?',
    placeholder: 'Ingresa el monto numerico',
    correct: '300',
  },
  {
    id: '7',
    type: 'choice',
    title: '¿Cual es el principal beneficio de tener Cash Flow positivo?',
    options: [
      'Sustentabilidad del activo a largo plazo.',
      'Pagar mas comisiones al banco.',
      'Reducir el tamano de la propiedad.',
      'Ninguna de las anteriores.',
    ],
    correct: 0,
  },
]

export default function QuizPage() {
  const router = useRouter()

  const handleQuit = () => {
    router.back()
  }

  return (
    <div className="min-h-screen bg-kasa-body flex flex-col overflow-x-hidden">
      <QuizContainer questions={quizQuestions} onQuit={handleQuit} />
    </div>
  )
}
