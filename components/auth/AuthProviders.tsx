'use client'

import { createContext, useContext } from 'react'
import { GoogleButton } from './GoogleButton'

const AuthProvidersContext = createContext<{ google: boolean }>({ google: false })

export function AuthProvidersProvider({ google, children }: { google: boolean; children: React.ReactNode }) {
  return <AuthProvidersContext.Provider value={{ google }}>{children}</AuthProvidersContext.Provider>
}

/** Google button + "or" separator, rendered only when Google sign-in is enabled in Supabase. */
export function GoogleSection({
  label,
  orLabel,
  onClick,
  disabled,
}: {
  label: string
  orLabel: string
  onClick: () => void
  disabled?: boolean
}) {
  const { google } = useContext(AuthProvidersContext)
  if (!google) return null
  return (
    <>
      <GoogleButton label={label} onClick={onClick} disabled={disabled} />
      <div className="flex items-center gap-3 text-stone text-sm">
        <div className="flex-1 h-px bg-mist" />
        {orLabel}
        <div className="flex-1 h-px bg-mist" />
      </div>
    </>
  )
}
