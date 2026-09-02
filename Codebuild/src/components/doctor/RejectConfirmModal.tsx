import React, { useState } from "react"
import { Button } from "../ui/button"
import { XCircle } from "lucide-react"

interface RejectConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (reason?: string) => void
  patientName?: string
  isLoading?: boolean
}

export function RejectConfirmModal({ isOpen, onClose, onConfirm, patientName, isLoading }: RejectConfirmModalProps) {
  const [reason, setReason] = useState("")

  if (!isOpen) return null

  const handleConfirm = () => {
    onConfirm(reason.trim() || undefined)
    setReason("")
  }

  const handleClose = () => {
    setReason("")
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-card border rounded-3xl p-6 shadow-2xl max-w-md w-full animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
            <XCircle className="w-5 h-5 text-destructive" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-foreground">Reject appointment request?</h3>
            {patientName && (
              <p className="text-sm text-muted-foreground mt-0.5">From {patientName}</p>
            )}
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-5">
          This appointment request will be declined. The patient will be notified.
        </p>

        <div className="mb-5">
          <label className="block text-sm font-semibold text-foreground mb-2">
            Reason <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="e.g. Requested time is unavailable."
            rows={3}
            className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-destructive/30 transition"
          />
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleClose}
            className="flex-1"
            disabled={isLoading}
          >
            Keep request
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
          >
            {isLoading ? "Rejecting…" : "Reject request"}
          </Button>
        </div>
      </div>
    </div>
  )
}
