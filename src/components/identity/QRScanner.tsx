import React, { useEffect, useRef, useState } from "react"
import { Html5Qrcode } from "html5-qrcode"
import { Camera, CameraOff, Keyboard, AlertCircle } from "lucide-react"

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void
  onManualEntry: (patientId: string) => void
}

export function QRScanner({ onScanSuccess, onManualEntry }: QRScannerProps) {
  const [manualId, setManualId] = useState("")
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [cameraActive, setCameraActive] = useState(false)
  const scannerRef = useRef<Html5Qrcode | null>(null)

  useEffect(() => {
    // Only initialize if we want to try camera
    const initScanner = async () => {
      try {
        const hasCameras = await Html5Qrcode.getCameras()
        if (hasCameras && hasCameras.length > 0) {
          scannerRef.current = new Html5Qrcode("qr-reader")
          await scannerRef.current.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: { width: 250, height: 250 } },
            (decodedText) => {
              // Successfully decoded
              // Wait briefly to avoid multiple scans
              setTimeout(() => {
                onScanSuccess(decodedText)
              }, 500)
            },
            () => {
              // Ignore scan failures (happens every frame when no QR)
            }
          )
          setCameraActive(true)
        } else {
          setCameraError("No cameras found on this device.")
        }
      } catch (err) {
        console.warn("Camera init failed:", err)
        setCameraError("Camera access denied or unavailable.")
      }
    }

    initScanner()

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error)
      }
    }
  }, [onScanSuccess])

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (manualId.trim()) {
      onManualEntry(manualId.trim())
    }
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      
      <div className="bg-card border rounded-3xl overflow-hidden shadow-sm relative">
        {/* The scanner viewport must have an ID for html5-qrcode */}
        <div id="qr-reader" className="w-full min-h-[300px] bg-black/5 flex items-center justify-center">
          {cameraError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-black/80 backdrop-blur-sm text-white">
              <CameraOff className="w-12 h-12 text-white/50 mb-4" />
              <p className="font-semibold">{cameraError}</p>
              <p className="text-sm text-white/70 mt-2">You can enter the Patient ID manually instead.</p>
            </div>
          )}
          {!cameraError && !cameraActive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground animate-pulse z-0">
              <Camera className="w-8 h-8 mb-2 opacity-50" />
              <p>Starting camera...</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-muted/50 p-6 rounded-3xl border">
        <h3 className="font-semibold flex items-center gap-2 mb-4">
          <Keyboard className="w-5 h-5 text-primary" />
          Can't scan? Enter ID
        </h3>
        <form onSubmit={handleManualSubmit} className="flex gap-3">
          <input 
            type="text" 
            value={manualId}
            onChange={(e) => setManualId(e.target.value.toUpperCase())}
            placeholder="e.g. PAT-8F2A91"
            className="flex-1 bg-background border rounded-xl px-4 py-2 uppercase font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
          />
          <button 
            type="submit"
            disabled={!manualId.trim()}
            className="bg-primary text-primary-foreground font-semibold px-6 py-2 rounded-xl disabled:opacity-50 transition-opacity"
          >
            Find
          </button>
        </form>
      </div>

    </div>
  )
}
