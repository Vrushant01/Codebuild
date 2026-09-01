import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, Clock, Video, Building, ArrowRight, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export function AppointmentSection() {
  const [step, setStep] = useState(1)

  // Auto-advance simulation for demo
  React.useEffect(() => {
    if (step > 0 && step < 5) {
      const timer = setTimeout(() => {
        setStep(step + 1)
      }, 2500)
      return () => clearTimeout(timer)
    }
  }, [step])

  return (
    <section className="py-24 bg-background overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">
            Book without the back-and-forth.
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            See real-time availability and confirm your slot instantly. No more waiting on hold with the receptionist. Choose between in-person clinic visits or secure video consultations.
          </p>
        </div>

        <div className="flex justify-center">
          <div className="w-full max-w-md bg-slate-50 dark:bg-slate-900 rounded-3xl border border-border shadow-xl overflow-hidden relative min-h-[500px]">
            
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-6 h-full flex flex-col"
                >
                  <h4 className="font-heading font-semibold text-lg mb-6 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm">1</span> 
                    Select Date
                  </h4>
                  <div className="grid grid-cols-4 gap-2 mb-6">
                    {["Mon 12", "Tue 13", "Wed 14", "Thu 15"].map((d, i) => (
                      <div key={i} className={`p-3 rounded-xl text-center cursor-pointer border ${i === 1 ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-border text-muted-foreground'}`}>
                        <div className="text-xs uppercase opacity-80">{d.split(' ')[0]}</div>
                        <div className="text-lg font-bold font-heading">{d.split(' ')[1]}</div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-6 h-full flex flex-col"
                >
                  <h4 className="font-heading font-semibold text-lg mb-6 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm">2</span> 
                    Select Time
                  </h4>
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {["09:00 AM", "09:30 AM", "10:00 AM", "11:30 AM", "02:00 PM", "04:30 PM"].map((t, i) => (
                      <div key={i} className={`p-3 rounded-xl text-center text-sm font-medium border ${i === 2 ? 'bg-primary text-primary-foreground border-primary' : i === 3 ? 'opacity-50 border-dashed bg-muted' : 'bg-background border-border hover:border-primary/50'}`}>
                        {t}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div 
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-6 h-full flex flex-col"
                >
                  <h4 className="font-heading font-semibold text-lg mb-6 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm">3</span> 
                    Consultation Type
                  </h4>
                  <div className="space-y-3">
                    <div className="p-4 rounded-xl border-2 border-primary bg-primary/5 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                        <Video className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h5 className="font-medium">Video Consultation</h5>
                        <p className="text-xs text-muted-foreground">Join from anywhere</p>
                      </div>
                      <div className="w-5 h-5 rounded-full border-4 border-primary"></div>
                    </div>
                    <div className="p-4 rounded-xl border border-border bg-background flex items-center gap-4 opacity-70">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                        <Building className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h5 className="font-medium">In-Person Visit</h5>
                        <p className="text-xs text-muted-foreground">Metro Heart Institute</p>
                      </div>
                      <div className="w-5 h-5 rounded-full border-2 border-muted-foreground"></div>
                    </div>
                  </div>
                </motion.div>
              )}

              {step >= 4 && (
                <motion.div 
                  key="step4"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-8 h-full flex flex-col items-center justify-center text-center bg-success/5"
                >
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                    className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mb-6"
                  >
                    <CheckCircle2 className="w-10 h-10 text-success" />
                  </motion.div>
                  <h3 className="text-2xl font-heading font-bold mb-2">Request Sent!</h3>
                  <p className="text-muted-foreground mb-6">
                    Your appointment with Dr. Sarah Chen is pending approval by the clinic.
                  </p>
                  
                  <div className="w-full bg-background p-4 rounded-xl border border-border text-left shadow-sm mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Tue, 13 Oct</span>
                      <span className="text-sm font-medium">10:00 AM</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 w-fit px-2 py-1 rounded-full">
                      <Video className="w-3 h-3" /> Video Consultation
                    </div>
                  </div>

                  <Button variant="outline" className="rounded-full w-full" onClick={() => setStep(1)}>
                    Restart Demo
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
            
            {step < 4 && (
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-slate-50 dark:bg-slate-900 border-t border-border">
                <Button className="w-full rounded-full" onClick={() => setStep(step + 1)}>
                  Continue <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

      </div>
    </section>
  )
}
