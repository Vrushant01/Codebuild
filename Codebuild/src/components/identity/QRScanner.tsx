import React, { useEffect, useRef, useState } from "react"
import { Html5Qrcode } from "html5-qrcode"
import { Camera, CameraOff, Keyboard, QrCode, Sparkles, CheckCircle2 } from "lucide-react"

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void
  onManualEntry: (patientId: string) => void
}

export function QRScanner({ onScanSuccess, onManualEntry }: QRScannerProps) {
  const [manualId, setManualId] = useState("")
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)
  
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const isMountedRef = useRef<boolean>(true)
  const elementIdRef = useRef<string>(`qr-reader-${Math.random().toString(36).substring(2, 9)}`)

  useEffect(() => {
    isMountedRef.current = true
    const elementId = elementIdRef.current

    const startScanner = async () => {
      try {
        setIsInitializing(true)
        setCameraError(null)

        const devices = await Html5Qrcode.getCameras().catch(() => [])
        if (!isMountedRef.current) return

        if (!devices || devices.length === 0) {
          setCameraError("No physical camera detected on this system. You can enter Patient ID manually or use Quick Demo Scan below.")
          setIsInitializing(false)
          return
        }

        const scanner = new Html5Qrcode(elementId)
        scannerRef.current = scanner

        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            if (isMountedRef.current) {
              onScanSuccess(decodedText)
            }
          },
          () => {}
        )

        if (isMountedRef.current) {
          setCameraActive(true)
          setIsInitializing(false)
        }
      } catch (err: any) {
        if (!isMountedRef.current) return
        console.warn("Camera start warning:", err)
        setCameraError(err?.message || "Camera permission denied or camera is in use.")
        setIsInitializing(false)
      }
    }

    // Delay slightly to ensure DOM node is fully mounted
    const timer = setTimeout(() => {
      startScanner()
    }, 150)

    return () => {
      isMountedRef.current = false
      clearTimeout(timer)
      const scanner = scannerRef.current
      if (scanner) {
        try {
          if (scanner.isScanning) {
            scanner.stop().then(() => {
              try { scanner.clear() } catch {}
            }).catch(() => {
              try { scanner.clear() } catch {}
            })
          } else {
            try { scanner.clear() } catch {}
          }
        } catch {}
      }
    }
  }, [onScanSuccess])

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (manualId.trim()) {
      onManualEntry(manualId.trim())
    }
  }

  const handleQuickDemoScan = (demoId: string) => {
    onScanSuccess(demoId)
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      
      {/* Scanner Viewport Box */}
      <div className="bg-card border-2 border-primary/20 rounded-3xl overflow-hidden shadow-lg relative min-h-[300px] flex flex-col items-center justify-center">
        
        {/* Isolated DOM node specifically for html5-qrcode (No React children inside this div) */}
        <div 
          id={elementIdRef.current} 
          className="w-full h-full min-h-[300px] bg-black/90 flex items-center justify-center overflow-hidden" 
        />

        {/* Floating overlays rendered as siblings to protect React Virtual DOM */}
        {isInitializing && !cameraError && (
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center bg-black/70 backdrop-blur-xs text-white p-6 text-center z-10 animate-pulse">
            <Camera className="w-10 h-10 mb-3 text-primary" />
            <p className="font-semibold text-sm">Starting camera scanner...</p>
          </div>
        )}

        {cameraError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-card/95 backdrop-blur-md text-foreground z-10">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mb-3">
              <CameraOff className="w-7 h-7" />
            </div>
            <p className="font-bold text-sm text-foreground">Camera Notice</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs">{cameraError}</p>
          </div>
        )}
      </div>

      {/* Quick Demo Scan Buttons for Instant Testing */}
      <div className="bg-gradient-to-br from-primary/10 via-background to-teal-500/10 p-5 rounded-3xl border border-primary/20 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-primary" /> Quick Patient Scanner
          </span>
          <span className="text-[11px] text-muted-foreground font-medium">Instant Test</span>
        </div>

        <div className="grid grid-cols-1 gap-2">
          <button
            type="button"
            onClick={() => handleQuickDemoScan("PAT-Y7WTEQ")}
            className="flex items-center justify-between p-3 rounded-2xl bg-card border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary font-bold flex items-center justify-center text-xs">
                RE
              </div>
              <div>
                <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">Rr Empire</p>
                <p className="text-[11px] text-muted-foreground font-mono">PAT-Y7WTEQ • Current Patient</p>
              </div>
            </div>
            <CheckCircle2 className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>

          <button
            type="button"
            onClick={() => handleQuickDemoScan("PAT-8F2A91")}
            className="flex items-center justify-between p-3 rounded-2xl bg-card border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary font-bold flex items-center justify-center text-xs">
                AJ
              </div>
              <div>
                <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">Alex Johnson</p>
                <p className="text-[11px] text-muted-foreground font-mono">PAT-8F2A91 • Verified Patient</p>
              </div>
            </div>
            <CheckCircle2 className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
      </div>

      {/* Manual Patient ID Input */}
      <div className="bg-muted/40 p-5 rounded-3xl border space-y-3">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <Keyboard className="w-4 h-4 text-primary" />
          Enter Patient ID Manually
        </h3>
        <form onSubmit={handleManualSubmit} className="flex gap-2">
          <input 
            type="text" 
            value={manualId}
            onChange={(e) => setManualId(e.target.value.toUpperCase())}
            placeholder="e.g. PAT-8F2A91"
            className="flex-1 bg-background border rounded-2xl px-4 py-2.5 text-sm uppercase font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow"
          />
          <button 
            type="submit"
            disabled={!manualId.trim()}
            className="bg-primary text-primary-foreground font-bold px-5 py-2.5 text-sm rounded-2xl disabled:opacity-40 transition-opacity shadow-sm shadow-primary/25"
          >
            Identify
          </button>
        </form>
      </div>

    </div>
  )
}
