'use client'

import { useState } from 'react'
import { AlertCircle, Mail, Loader2, CheckCircle } from 'lucide-react'
import { Button } from './button'

interface VerificationBadgeProps {
  isVerified: boolean
  onResend: () => Promise<boolean>
}

export function VerificationBadge({ isVerified, onResend }: VerificationBadgeProps) {
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  if (isVerified) {
    return (
      <div className="flex items-center gap-2 text-green-400 text-sm">
        <CheckCircle className="w-4 h-4" />
        <span>Email ověřen</span>
      </div>
    )
  }

  async function handleResend() {
    setSending(true)
    const success = await onResend()
    setSending(false)
    if (success) {
      setSent(true)
      setTimeout(() => setSent(false), 5000)
    }
  }

  return (
    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-medium text-yellow-500">Email neověřen</h4>
          <p className="text-sm text-gray-400 mt-1">
            Ověř svůj email pro přístup ke všem kapitolám. Aktuálně máš přístup pouze k prvním 3
            kapitolám.
          </p>

          <div className="mt-3">
            {sent ? (
              <div className="flex items-center gap-2 text-green-400 text-sm">
                <Mail className="w-4 h-4" />
                <span>Email odeslán! Zkontroluj schránku.</span>
              </div>
            ) : (
              <Button size="sm" variant="secondary" onClick={handleResend} disabled={sending}>
                {sending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" /> Odesílám...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" /> Poslat ověřovací email
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Small inline badge for profile/header
 */
export function VerificationBadgeSmall({ isVerified }: { isVerified: boolean }) {
  if (isVerified) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-green-500/20 text-green-400">
        <CheckCircle className="w-3 h-3" />
        Ověřeno
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-yellow-500/20 text-yellow-400">
      <AlertCircle className="w-3 h-3" />
      Neověřeno
    </span>
  )
}
