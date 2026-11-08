'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

interface ConfirmButtonProps {
  /** Contenu du bouton d'origine (texte, éventuellement avec une icône). */
  label: ReactNode
  /** Question posée avant d'agir. */
  message: string
  confirmLabel?: string
  onConfirm: () => void
  disabled?: boolean
  ariaLabel?: string
  /** Classes du bouton d'origine. */
  className: string
  /** 'dark' pour l'espace admin, 'light' pour les espaces prestataire et voyageur. */
  tone?: 'dark' | 'light'
}

const TONES = {
  dark: {
    text: 'text-white/70',
    confirm: 'bg-red-500/20 text-red-300 border border-red-400/30 hover:bg-red-500/30',
    cancel: 'border border-white/10 text-white/60 hover:bg-white/10',
  },
  light: {
    text: 'text-stone',
    confirm: 'bg-danger text-white hover:bg-danger/90',
    cancel: 'border border-mist text-stone hover:bg-sand',
  },
} as const

/**
 * Confirmation en deux temps intégrée à la page. Remplace window.confirm, qui ne s'affiche pas dans tous les
 * contextes (navigateur intégré, dialogues bloqués) et laisse alors le bouton muet : l'utilisateur croit à un bug.
 */
export function ConfirmButton({ label, message, confirmLabel = 'Confirmer', onConfirm, disabled, ariaLabel, className, tone = 'light' }: ConfirmButtonProps) {
  const [asking, setAsking] = useState(false)
  const confirmRef = useRef<HTMLButtonElement>(null)
  const t = TONES[tone]

  useEffect(() => {
    if (asking) confirmRef.current?.focus()
  }, [asking])

  if (!asking) {
    return (
      <button type="button" disabled={disabled} aria-label={ariaLabel} className={className} onClick={() => setAsking(true)}>
        {label}
      </button>
    )
  }

  return (
    <span
      role="group"
      aria-label={message}
      onKeyDown={(e) => {
        if (e.key === 'Escape') setAsking(false)
      }}
      className="inline-flex flex-col items-start gap-1.5"
    >
      <span className={`text-[11px] leading-snug max-w-[16rem] ${t.text}`}>{message}</span>
      <span className="inline-flex gap-2">
        <button
          ref={confirmRef}
          type="button"
          disabled={disabled}
          className={`text-xs px-3 py-1.5 rounded-lg disabled:opacity-40 ${t.confirm}`}
          onClick={() => {
            setAsking(false)
            onConfirm()
          }}
        >
          {confirmLabel}
        </button>
        <button type="button" className={`text-xs px-3 py-1.5 rounded-lg ${t.cancel}`} onClick={() => setAsking(false)}>
          Annuler
        </button>
      </span>
    </span>
  )
}
