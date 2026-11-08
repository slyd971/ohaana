'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Link2, Copy, Check, QrCode, Globe } from 'lucide-react'

const AFFILIATE_LINK = 'https://www.ohaana.fr/?ref=iles-dorees'
const WIDGET_CODE = `<script src="https://www.ohaana.fr/widget.js" data-ref="iles-dorees"></script>`

export default function PartnerLinkPage() {
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedWidget, setCopiedWidget] = useState(false)

  function copyLink() {
    navigator.clipboard.writeText(AFFILIATE_LINK).catch(() => {})
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  function copyWidget() {
    navigator.clipboard.writeText(WIDGET_CODE).catch(() => {})
    setCopiedWidget(true)
    setTimeout(() => setCopiedWidget(false), 2000)
  }

  return (
    <div className="p-5 md:p-8 space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-display text-deep-green">Mon lien affilié</h1>
        <p className="text-stone text-sm mt-0.5">Partagez ce lien pour générer des réservations et toucher vos commissions.</p>
      </div>

      {/* Lien */}
      <div className="bg-coconut rounded-card border border-mist p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Link2 size={15} className="text-deep-green" />
          <h2 className="text-sm font-semibold text-charcoal">Lien de parrainage</h2>
        </div>
        <div className="flex items-center gap-2 bg-sand rounded-control px-4 py-3">
          <Globe size={13} className="text-stone flex-none" />
          <span className="text-sm text-charcoal flex-1 truncate font-mono text-xs">{AFFILIATE_LINK}</span>
          <Button size="sm" type="button" onClick={copyLink} className="rounded-full flex-none">
            {copiedLink ? <Check size={12} /> : <Copy size={12} />}
            {copiedLink ? 'Copié !' : 'Copier'}
          </Button>
        </div>
        <p className="text-xs text-stone">
          Chaque client qui réserve via ce lien vous génère <span className="font-semibold text-charcoal">12 % de commission</span> pendant 30 jours.
        </p>
      </div>

      {/* QR Code */}
      <div className="bg-coconut rounded-card border border-mist p-5 space-y-3">
        <div className="flex items-center gap-2">
          <QrCode size={15} className="text-deep-green" />
          <h2 className="text-sm font-semibold text-charcoal">QR Code</h2>
        </div>
        <div className="flex items-center gap-5">
          <div className="w-24 h-24 bg-sand rounded-control flex items-center justify-center border border-mist">
            <QrCode size={40} className="text-stone/40" />
          </div>
          <div className="space-y-2">
            <p className="text-xs text-stone leading-relaxed">Imprimez ce QR code et affichez-le dans vos locaux, supports de communication ou packagings.</p>
            <Button variant="link" size="bare" type="button" className="text-xs">Télécharger en PNG</Button>
          </div>
        </div>
      </div>

      {/* Widget */}
      <div className="bg-coconut rounded-card border border-mist p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Globe size={15} className="text-deep-green" />
          <h2 className="text-sm font-semibold text-charcoal">Widget site web</h2>
        </div>
        <p className="text-xs text-stone">Intégrez un bouton de réservation Ohaana directement sur votre site.</p>
        <div className="bg-charcoal rounded-control px-4 py-3 flex items-center gap-2">
          <code className="text-xs text-coconut/70 flex-1 truncate">{WIDGET_CODE}</code>
          <button
            type="button"
            onClick={copyWidget}
            className="flex items-center gap-1.5 text-xs bg-coconut/10 text-coconut px-3 py-1.5 rounded-full font-medium hover:bg-coconut/20 transition-colors flex-none"
          >
            {copiedWidget ? <Check size={12} /> : <Copy size={12} />}
            {copiedWidget ? 'Copié !' : 'Copier'}
          </button>
        </div>
      </div>
    </div>
  )
}
