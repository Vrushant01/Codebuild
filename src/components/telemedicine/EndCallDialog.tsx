import React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog"
import { Button } from "../ui/button"
import { PhoneOff } from "lucide-react"

interface EndCallDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function EndCallDialog({ isOpen, onOpenChange, onConfirm }: EndCallDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <PhoneOff className="w-6 h-6 text-destructive" />
          </div>
          <DialogTitle className="text-center text-xl">End consultation?</DialogTitle>
          <DialogDescription className="text-center">
            Are you sure you want to leave this consultation? The session will be marked as completed.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-col gap-2 sm:space-x-0 mt-6">
          <Button variant="destructive" className="w-full text-base h-11" onClick={onConfirm}>
            End consultation
          </Button>
          <Button variant="outline" className="w-full text-base h-11 mt-0" onClick={() => onOpenChange(false)}>
            Continue consultation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
