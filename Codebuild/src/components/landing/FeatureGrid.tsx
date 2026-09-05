import React from "react"
import { motion } from "framer-motion"
import { 
  Pill, 
  ShieldCheck, 
  FileText, 
  Smartphone, 
  Video, 
  Mic, 
  PhoneOff, 
  CheckCircle2, 
  Clock, 
  Download, 
  Star, 
  Volume2,
  Lock,
  Flame,
  AlertTriangle
} from "lucide-react"

export function FeatureGrid() {
  const features = [
    {
      title: "Telemedicine Built-in",
      desc: "High-quality, secure 1080p video consultations directly within Medireach. No third-party downloads required.",
      icon: Smartphone,
      colSpan: "lg:col-span-2",
      bgClass: "bg-gradient-to-br from-blue-50/80 to-indigo-50/40 dark:from-blue-950/30 dark:to-indigo-950/10",
      content: (
        <div className="mt-6 bg-slate-950 rounded-2xl p-3 sm:p-4 border border-slate-800 shadow-xl overflow-hidden relative text-white">
          {/* Main Video Call Screen */}
          <div className="relative h-44 sm:h-48 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center">
            {/* Doctor Feed Image */}
            <img 
              src="/images/doctor_aarav.jpg" 
              alt="Dr. Aarav Patel Video Consult" 
              className="absolute inset-0 w-full h-full object-cover object-top opacity-90"
            />
            
            {/* Subtle Video Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />

            {/* Top Video HUD: Doctor Info & Live Timer */}
            <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
              <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-semibold text-[11px]">Dr. Aarav Patel</span>
                <span className="text-[10px] text-slate-300 font-mono">| 1080p HD</span>
              </div>
              <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 text-[11px] font-mono text-emerald-300 font-bold">
                <Clock className="w-3 h-3 text-emerald-400" />
                <span>08:24</span>
              </div>
            </div>

            {/* Patient Picture-in-Picture (PiP) Window */}
            <div className="absolute bottom-2.5 right-2.5 w-24 sm:w-28 h-16 sm:h-20 bg-slate-800/90 backdrop-blur-md rounded-xl border-2 border-white/20 shadow-2xl overflow-hidden flex flex-col justify-between p-1.5 z-10">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold text-white/90 bg-black/50 px-1 rounded">You</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </div>
              <div className="flex items-center justify-center">
                <div className="w-7 h-7 rounded-full bg-primary/30 text-primary-foreground flex items-center justify-center text-[10px] font-bold border border-primary/50">
                  AJ
                </div>
              </div>
              <div className="text-[8px] text-center text-slate-300 font-medium">Alex Johnson</div>
            </div>

            {/* Bottom Call Control Bar */}
            <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 z-10">
              <button className="w-7 h-7 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center transition-colors">
                <Mic className="w-3.5 h-3.5 text-white" />
              </button>
              <button className="w-7 h-7 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center transition-colors">
                <Video className="w-3.5 h-3.5 text-white" />
              </button>
              <button className="w-7 h-7 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center transition-colors">
                <Volume2 className="w-3.5 h-3.5 text-white" />
              </button>
              <button className="w-7 h-7 rounded-lg bg-red-600 hover:bg-red-700 flex items-center justify-center transition-colors shadow-lg shadow-red-600/40">
                <PhoneOff className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          </div>

          {/* Bottom Security Footer */}
          <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400 px-1">
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-400" />
              <span>End-to-End Encrypted Consultation</span>
            </span>
            <span className="text-emerald-400 font-medium text-[10px] bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-full">
              Live Session Active
            </span>
          </div>
        </div>
      )
    },
    {
      title: "Smart Medicine Schedule",
      desc: "Never miss a dose. Automated dosage alerts and adherence tracking based on your doctor's prescription.",
      icon: Pill,
      colSpan: "lg:col-span-1",
      bgClass: "bg-gradient-to-br from-emerald-50/80 to-teal-50/40 dark:from-emerald-950/30 dark:to-teal-950/10",
      content: (
        <div className="mt-6 space-y-2.5">
          {/* Dose 1: Taken */}
          <div className="p-3 bg-card rounded-2xl shadow-sm border border-border flex items-center justify-between transition-all hover:border-emerald-500/30">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                💊
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">Amoxicillin 500mg</p>
                <p className="text-[10px] text-muted-foreground">08:00 AM • After Breakfast</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Taken
            </span>
          </div>

          {/* Dose 2: Due Soon */}
          <div className="p-3 bg-card rounded-2xl shadow-sm border border-primary/30 ring-1 ring-primary/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                💧
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">Paracetamol 650mg</p>
                <p className="text-[10px] text-primary font-medium">02:00 PM • Due in 20 mins</p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full animate-pulse">
              Take Now
            </span>
          </div>

          {/* Streak Indicator */}
          <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground px-1 pt-1">
            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
              <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>5-Day Adherence Streak</span>
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">100% Score</span>
          </div>
        </div>
      )
    },
    {
      title: "Verified Patient Reviews",
      desc: "100% authentic ratings and clinical feedback from patients following completed appointments.",
      icon: Star,
      colSpan: "lg:col-span-1",
      bgClass: "bg-gradient-to-br from-amber-50/80 to-orange-50/40 dark:from-amber-950/30 dark:to-orange-950/10",
      content: (
        <div className="mt-6 p-4 bg-card rounded-2xl shadow-sm border border-border space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold text-xs flex items-center justify-center">
                MP
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground leading-tight">Mitesh Patel</h4>
                <p className="text-[10px] text-muted-foreground">Ahmedabad • Verified Patient</p>
              </div>
            </div>
            <div className="flex items-center gap-0.5 text-amber-500">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
              ))}
            </div>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            "Dr. Aarav was extremely thorough during our video consultation. Diagnosed my symptoms clearly and the prescription was sent to my phone immediately."
          </p>

          <div className="pt-2 border-t flex items-center justify-between text-[10px]">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <ShieldCheck className="w-3 h-3" /> Verified Consultation
            </span>
            <span className="text-muted-foreground">Yesterday</span>
          </div>
        </div>
      )
    },
    {
      title: "Unified Medical History",
      desc: "Your allergies, diagnoses, doctor prescriptions, and laboratory reports organized in one chronological timeline.",
      icon: FileText,
      colSpan: "lg:col-span-2",
      bgClass: "bg-gradient-to-br from-purple-50/80 to-violet-50/40 dark:from-purple-950/30 dark:to-violet-950/10",
      content: (
        <div className="mt-6 grid sm:grid-cols-2 gap-3">
          {/* Medical Case Record */}
          <div className="p-3.5 bg-card rounded-2xl border border-border shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                Cardiology Case
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">Oct 12, 2026</span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground">Acute Chest Discomfort Checkup</h4>
              <p className="text-[11px] text-muted-foreground mt-0.5">Dr. Aarav Patel • Ahmedabad Hospital</p>
            </div>
            <div className="flex items-center justify-between pt-1 text-[10px] font-semibold text-primary">
              <span className="flex items-center gap-1">
                <Download className="w-3 h-3" /> Rx_Amoxicillin_ECG.pdf
              </span>
              <span className="text-emerald-600 dark:text-emerald-400">Resolved</span>
            </div>
          </div>

          {/* Safety Flags & Allergies Record */}
          <div className="p-3.5 bg-card rounded-2xl border border-border shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-600" /> Critical Allergies
              </span>
              <span className="text-[10px] text-emerald-600 font-bold">Auto-Flagged</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between bg-muted/40 px-2 py-1 rounded-lg text-xs">
                <span className="font-semibold text-foreground">Penicillin</span>
                <span className="text-[10px] text-destructive font-bold">Severe (Anaphylaxis)</span>
              </div>
              <div className="flex items-center justify-between bg-muted/40 px-2 py-1 rounded-lg text-xs">
                <span className="font-semibold text-foreground">Peanuts</span>
                <span className="text-[10px] text-amber-600 font-bold">Moderate</span>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground pt-0.5">Shared with all treating physicians automatically.</p>
          </div>
        </div>
      )
    }
  ]

  return (
    <section className="py-24 bg-background" id="features">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">
            Everything you need. <br/> Nothing you don't.
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Medireach is a complete ecosystem designed to make healthcare simpler, from the first symptom to the final follow-up.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className={`p-6 sm:p-8 rounded-3xl border border-border shadow-sm overflow-hidden flex flex-col justify-between ${feature.colSpan} ${feature.bgClass}`}
            >
              <div>
                <feature.icon className="w-8 h-8 text-primary mb-4" />
                <h3 className="text-xl font-heading font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
              </div>
              
              <div className="mt-4 pt-2">
                {feature.content}
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}
