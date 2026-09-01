import React, { useState } from "react"
import { X, AlertTriangle } from "lucide-react"
import { Button } from "../ui/button"

interface CancelAppointmentModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
}

export function CancelAppointmentModal({ isOpen, onClose, onConfirm }: CancelAppointmentModalProps) {
  const [isCancelling, setIsCancelling] = useState(false)

  if (!isOpen) return null

  const handleConfirm = async () => {
    setIsCancelling(true)
    await onConfirm()
    setIsCancelling(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Click-away backdrop */}
      <div className="absolute inset-0" onClick={() => !isCancelling && onClose()} />
      
      <div 
        className="relative w-full max-w-sm bg-background border rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cancel-modal-title"
      >
        
        <div className="p-6">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-destructive" />
          </div>
          
          <h2 id="cancel-modal-title" className="text-xl font-heading font-bold mb-2">Cancel appointment?</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Your appointment request will be cancelled and the clinic will be notified. This action cannot be undone.
          </p>

          <div className="flex flex-col gap-3">
            <Button 
              variant="destructive" 
              onClick={handleConfirm}
              disabled={isCancelling}
              className="w-full"
            >
              {isCancelling ? "Cancelling..." : "Yes, cancel appointment"}
            </Button>
            <Button 
              variant="outline" 
              onClick={onClose}
              disabled={isCancelling}
              className="w-full"
            >
              Keep appointment
            </Button>
          </div>
        </div>

      </div>
    </div>
  )
}
