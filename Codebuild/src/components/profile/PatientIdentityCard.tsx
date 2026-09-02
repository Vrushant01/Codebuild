import React, { useState } from "react"
import { Copy, QrCode, Check } from "lucide-react"
import { Button } from "../ui/button"

interface PatientIdentityCardProps {
  name: string
  patientId: string
  avatarInitials: string
  onShowQR: () => void
}

export function PatientIdentityCard({ name, patientId, avatarInitials, onShowQR }: PatientIdentityCardProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(patientId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-gradient-to-br from-primary to-primary/80 dark:from-primary/80 dark:to-primary/50 text-primary-foreground rounded-3xl p-6 sm:p-8 shadow-xl shadow-primary/20 relative overflow-hidden flex flex-col h-full">
      
      {/* Decorative Blur */}
      <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex justify-between items-start mb-8">
        <div>
          <h3 className="font-heading font-bold text-lg tracking-tight">MEDIREACH</h3>
          <p className="text-primary-foreground/70 text-xs">Patient Identity</p>
        </div>
        <button 
          onClick={onShowQR}
          className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl transition-colors border border-white/20 flex items-center gap-2 group text-sm font-semibold"
          title="Show QR Code"
        >
          <QrCode className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
          Show QR
        </button>
      </div>

      <div className="mt-auto relative z-10">
        <h2 className="text-2xl sm:text-3xl font-heading font-bold mb-4 leading-tight">{name}</h2>
        
        <div className="flex items-center justify-between bg-black/10 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
          <div>
            <p className="text-[10px] uppercase font-bold text-primary-foreground/60 tracking-wider mb-1">Your Patient ID</p>
            <p className="font-mono font-bold text-lg tracking-wider">{patientId}</p>
          </div>
          <button 
            onClick={handleCopy}
            className="p-2 hover:bg-white/20 rounded-xl transition-colors text-white/80 hover:text-white"
          >
            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
          </button>
        </div>
        <p className="text-primary-foreground/60 text-[10px] text-center mt-4">
          Show this to an authorized healthcare provider.
        </p>
      </div>
      
    </div>
  )
}
