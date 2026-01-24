'use client'

interface QuestionInputProps {
  question: string
  placeholder: string
  value: string
  onChange: (value: string) => void
}

export function QuestionInput({ question, placeholder, value, onChange }: QuestionInputProps) {
  return (
    <div className="flex-1 flex flex-col">
      <h2 className="text-2xl font-extrabold mb-8 leading-snug text-white">{question}</h2>

      <div className="mt-4">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full bg-kasa-card border-2 border-kasa-border rounded-2xl p-6 text-lg text-white outline-none transition-colors focus:border-kasa-primary placeholder:text-text-disabled"
        />
      </div>
    </div>
  )
}
