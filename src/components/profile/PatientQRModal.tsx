import React from "react"
import { X, Lock, ShieldCheck } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"

interface PatientQRModalProps {
  isOpen: boolean
  onClose: () => void
  name: string
  patientId: string
}

export function PatientQRModal({ isOpen, onClose, name, patientId }: PatientQRModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="relative w-full max-w-sm bg-background border rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        
        <div className="flex justify-end p-4">
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full bg-muted/50 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-8 pb-8 text-center flex flex-col items-center">
          
          <h2 className="text-2xl font-heading font-bold mb-1">{name}</h2>
          <p className="font-mono text-muted-foreground font-bold tracking-widest mb-8">{patientId}</p>

          <div className="bg-white p-4 sm:p-6 rounded-3xl shadow-sm border mb-8 relative flex justify-center">
            <QRCodeSVG 
              value={patientId}
              size={200}
              bgColor={"#ffffff"}
              fgColor={"#09090b"}
              level={"H"}
              includeMargin={false}
              className="rounded-lg"
            />
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex gap-3 text-left w-full">
            <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
            <div>
              <p className="text-sm font-semibold mb-0.5">Secure Identity</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Show this code to an authorized healthcare provider. Only relevant medical information can be accessed.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
