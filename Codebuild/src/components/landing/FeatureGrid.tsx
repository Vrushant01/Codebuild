import React from "react"
import { motion } from "framer-motion"
import { Pill, Activity, ShieldCheck, Stethoscope, MessageCircle, FileText, Smartphone, Languages } from "lucide-react"

export function FeatureGrid() {
  const features = [
    {
      title: "Telemedicine Built-in",
      desc: "High-quality, secure video consultations directly within the platform. No extra apps needed.",
      icon: Smartphone,
      colSpan: "lg:col-span-2",
      bgClass: "bg-blue-50 dark:bg-blue-950/20",
      content: (
        <div className="mt-6 flex gap-2">
          <div className="w-2/3 h-32 bg-slate-200 dark:bg-slate-800 rounded-xl relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">Doctor Video</div>
            <div className="absolute bottom-2 right-2 w-1/3 h-12 bg-slate-300 dark:bg-slate-700 rounded-lg border-2 border-white dark:border-slate-900"></div>
          </div>
          <div className="w-1/3 h-32 flex flex-col gap-2">
            <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center shadow-sm">
              <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center"><div className="w-3 h-3 rounded-sm bg-destructive"></div></div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Smart Medicine Schedule",
      desc: "Never miss a dose. Get reminders based on your prescription.",
      icon: Pill,
      colSpan: "lg:col-span-1",
      bgClass: "bg-emerald-50 dark:bg-emerald-950/20",
      content: (
        <div className="mt-6 space-y-2">
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-border flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">08:00 AM</p>
              <p className="text-xs text-muted-foreground">Amoxicillin</p>
            </div>
            <div className="w-5 h-5 rounded-full bg-success text-success-foreground flex items-center justify-center text-[10px]">✓</div>
          </div>
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-border flex items-center justify-between opacity-60">
            <div>
              <p className="text-sm font-semibold">08:00 PM</p>
              <p className="text-xs text-muted-foreground">Amoxicillin</p>
            </div>
            <div className="w-5 h-5 rounded-full border-2 border-muted-foreground"></div>
          </div>
        </div>
      )
    },
    {
      title: "Verified Reviews",
      desc: "Real feedback from actual patients after their confirmed appointments.",
      icon: StarIcon,
      colSpan: "lg:col-span-1",
      bgClass: "bg-orange-50 dark:bg-orange-950/20",
      content: (
        <div className="mt-6 p-4 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-border">
          <div className="flex items-center gap-1 text-warning mb-2">
            <StarIcon className="w-4 h-4 fill-warning" />
            <StarIcon className="w-4 h-4 fill-warning" />
            <StarIcon className="w-4 h-4 fill-warning" />
            <StarIcon className="w-4 h-4 fill-warning" />
            <StarIcon className="w-4 h-4 fill-warning" />
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">"The doctor was extremely thorough and the clinic staff was very helpful."</p>
          <div className="mt-2 text-[10px] text-emerald-600 bg-emerald-50 px-2 py-1 rounded w-fit flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Verified Visit
          </div>
        </div>
      )
    },
    {
      title: "Unified Medical History",
      desc: "Your allergies, past cases, and prescriptions in one timeline.",
      icon: FileText,
      colSpan: "lg:col-span-2",
      bgClass: "bg-purple-50 dark:bg-purple-950/20",
      content: (
        <div className="mt-6 flex items-start gap-4">
          <div className="flex flex-col items-center">
            <div className="w-3 h-3 rounded-full bg-primary mt-1"></div>
            <div className="w-0.5 h-12 bg-primary/20 my-1"></div>
            <div className="w-3 h-3 rounded-full bg-primary/40"></div>
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <p className="text-sm font-semibold">General Checkup</p>
              <p className="text-xs text-muted-foreground">Dr. Wilson • Oct 12, 2026</p>
            </div>
            <div>
              <p className="text-sm font-semibold">Prescription Added</p>
              <p className="text-xs text-muted-foreground">Amoxicillin 500mg</p>
            </div>
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
              className={`p-8 rounded-3xl border border-border shadow-sm overflow-hidden flex flex-col ${feature.colSpan} ${feature.bgClass}`}
            >
              <feature.icon className="w-8 h-8 text-foreground mb-4" />
              <h3 className="text-xl font-heading font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.desc}</p>
              
              <div className="mt-auto pt-6 flex-1 flex flex-col justify-end">
                {feature.content}
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}

function StarIcon(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
}
