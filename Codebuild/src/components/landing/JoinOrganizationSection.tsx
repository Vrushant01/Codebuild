import React from "react"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { 
  Building2, 
  MapPin, 
  Users, 
  CalendarCheck, 
  ArrowRight, 
  CheckCircle, 
  ShieldCheck, 
  Sparkles,
  Stethoscope,
  TrendingUp
} from "lucide-react"
import { Button } from "@/components/ui/button"

export function JoinOrganizationSection() {
  return (
    <section className="py-24 bg-gradient-to-b from-background via-primary/[0.02] to-muted/20 border-t relative overflow-hidden" id="join-organization">
      {/* Abstract Background Glows */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 md:px-6">
        
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left: Copy & Value Proposition */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 space-y-6"
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-sm">
              <Sparkles className="w-3.5 h-3.5" /> For Hospitals, Clinics & Diagnostic Centers
            </div>

            <h2 className="text-4xl sm:text-5xl font-extrabold font-heading tracking-tight text-foreground leading-[1.15]">
              Put your healthcare organization on the map. <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-500">
                Join Medireach Network.
              </span>
            </h2>

            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
              Register your hospital or clinic in minutes with real-time GPS location pinning. Gain instant visibility for patients nearby, streamline front-desk token queues, and enable telemedicine video consultations.
            </p>

            {/* Benefit Checkpoints */}
            <div className="grid sm:grid-cols-2 gap-4 pt-2">
              <div className="flex items-start gap-3">
                <div className="p-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground">Real-Time GPS Map Visibility</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Patients find and navigate to your clinic with live proximity search.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground">Doctor & Staff Partitioning</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Manage multiple departments, specialists, and receptionist desks.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground">Zero Friction Digital Bookings</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Accept verified in-person slots and telemedicine calls effortlessly.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground">Instant Database Activation</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Your dashboard opens instantly upon registration with full admin tools.</p>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button size="lg" className="rounded-2xl h-14 px-8 text-base font-bold shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90" asChild>
                <Link to="/join-organization">
                  <Building2 className="mr-2 w-5 h-5" /> Join as Organization <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-2xl h-14 px-8 text-base font-bold bg-background/80 backdrop-blur" asChild>
                <Link to="/login">
                  Organization Login
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Right: Interactive Visual Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-5"
          >
            <div className="bg-card border border-border shadow-2xl rounded-3xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
              
              {/* Header Preview */}
              <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-emerald-500 flex items-center justify-center text-white font-bold shadow-md">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-base">Facility Dashboard</h3>
                    <p className="text-xs text-muted-foreground">Live Organization View</p>
                  </div>
                </div>
                <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/20 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Active on Map
                </span>
              </div>

              {/* Authentic Surat Map GPS Viewport */}
              <div className="rounded-2xl border border-border relative overflow-hidden h-48 sm:h-52 flex items-center justify-center shadow-inner group">
                <img 
                  src="/images/surat_gps_org_map.jpg" 
                  alt="Surat Healthcare GPS Location Map" 
                  className="absolute inset-0 w-full h-full object-cover select-none filter contrast-[1.05] brightness-[0.98] dark:brightness-[0.85] transition-transform duration-700 group-hover:scale-105"
                />
                
                {/* Ambient gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-slate-950/20 pointer-events-none" />

                {/* Real-Time GPS Pin Marker */}
                <div className="relative z-10 flex flex-col items-center animate-bounce">
                  <div className="bg-primary text-primary-foreground text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-md mb-1 border border-primary-foreground/20">
                    🏥 Clinic Entrance Pin
                  </div>
                  <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center shadow-xl border-2 border-white">
                    <MapPin className="w-4 h-4 fill-white" />
                  </div>
                </div>

                <div className="absolute bottom-2.5 left-3 text-[10px] font-mono text-foreground font-semibold bg-background/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-border shadow-md z-10 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>GPS: 21.1702° N, 72.8311° E (Surat, Gujarat)</span>
                </div>
              </div>

              {/* Stats Highlights */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/40 border rounded-2xl p-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                    <Users className="w-4 h-4 text-blue-500" /> Patient Inflow
                  </div>
                  <div className="text-xl font-heading font-bold mt-1">+140 / mo</div>
                </div>
                <div className="bg-muted/40 border rounded-2xl p-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                    <CalendarCheck className="w-4 h-4 text-emerald-500" /> Confirmed Slots
                  </div>
                  <div className="text-xl font-heading font-bold mt-1">98.4%</div>
                </div>
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Join hundreds of verified hospitals and clinics empowering patients with transparent, high-speed care.
                </p>
              </div>

            </div>
          </motion.div>

        </div>

      </div>
    </section>
  )
}
