import React from "react"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { ArrowRight, MapPin, Search, Calendar, Stethoscope, Play, Globe, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-background">
      {/* Abstract Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full overflow-hidden -z-10">
        <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-secondary/50 blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">

          {/* Left: Copy & CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-extrabold tracking-tight text-foreground leading-[1.1] mb-6">
              Stop guessing your symptoms. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-500">
                Find real care.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed max-w-xl">
              Medireach brings top doctors, AI-guided symptom checks, and instant bookings straight to your pocket. Healthcare that actually works around your life.
            </p>

            <div className="flex flex-col sm:flex-row flex-wrap gap-3.5">
              <Button size="lg" className="rounded-full h-14 px-8 text-base shadow-sm font-bold" asChild>
                <a href="#healthcare">
                  Find Healthcare <ArrowRight className="ml-2 w-5 h-5" />
                </a>
              </Button>
              <Button size="lg" variant="outline" className="rounded-full h-14 px-8 text-base font-bold bg-background/50 backdrop-blur" asChild>
                <Link to="/login">
                  <Play className="mr-2 w-4 h-4 fill-foreground" /> Meet Medireach AI
                </Link>
              </Button>
            </div>

            <div className="mt-10 flex items-center gap-6 text-sm font-medium text-muted-foreground">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-primary" /> Verified Doctors
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" /> Multilingual
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" /> Secure Data
              </div>
            </div>
          </motion.div>

          {/* Right: Layered UI Composition with Authentic Mumbai Map Photo */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: "easeOut" }}
            className="relative h-[550px] lg:h-[650px] w-full perspective-1000"
          >
            {/* Base Map Photo / Interface Layer */}
            <div className="absolute inset-0 bg-slate-950 rounded-3xl border border-border overflow-hidden shadow-2xl rotate-y-[-5deg] rotate-x-[5deg] transform-gpu transition-transform hover:rotate-y-0 hover:rotate-x-0 duration-700">
              
              {/* Authentic Mumbai Map Photo */}
              <img 
                src="/images/mumbai_map_hero.jpg" 
                alt="Mumbai City Map" 
                className="absolute inset-0 w-full h-full object-cover select-none filter contrast-[1.05] brightness-[0.97] dark:brightness-[0.85] transition-transform duration-1000 hover:scale-105"
              />

              {/* Subtle Ambient Vignette Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-background/20 pointer-events-none" />

              {/* Search Bar Overlay */}
              <div className="absolute top-6 left-6 right-6 z-20">
                <div className="bg-background/90 backdrop-blur-md dark:bg-slate-900/90 rounded-2xl p-2 shadow-lg flex items-center gap-2 border border-border/80">
                  <MapPin className="w-5 h-5 text-primary ml-2 shrink-0" />
                  <Input 
                    className="border-0 focus-visible:ring-0 shadow-none bg-transparent text-sm placeholder:text-muted-foreground font-medium" 
                    placeholder="Search clinics in Mumbai..." 
                    readOnly
                  />
                  <Button size="icon" className="rounded-xl shrink-0"><Search className="w-4 h-4" /></Button>
                </div>
              </div>

              {/* Mumbai Map Pin Marker 1 (South Mumbai / Marine Drive) */}
              <div className="absolute top-[68%] left-[68%] z-10 flex flex-col items-center group cursor-pointer">
                <span className="absolute w-10 h-10 bg-primary/30 rounded-full animate-ping" />
                <div className="w-5 h-5 bg-primary border-2 border-white rounded-full shadow-lg flex items-center justify-center relative z-10">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
                <div className="mt-1.5 bg-background/95 backdrop-blur-md text-[11px] font-bold text-foreground px-2.5 py-0.5 rounded-full border border-border shadow-md whitespace-nowrap">
                  🏥 South Mumbai Clinic
                </div>
              </div>

              {/* Mumbai Map Pin Marker 2 (Worli / Sea Link) */}
              <div className="absolute top-[38%] left-[50%] z-10 flex flex-col items-center group cursor-pointer">
                <span className="absolute w-8 h-8 bg-emerald-500/30 rounded-full animate-ping" />
                <div className="w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-lg flex items-center justify-center relative z-10">
                  <div className="w-1.5 h-1.5 bg-white rounded-full" />
                </div>
                <div className="mt-1.5 bg-background/95 backdrop-blur-md text-[11px] font-bold text-foreground px-2.5 py-0.5 rounded-full border border-border shadow-md whitespace-nowrap">
                  🏥 Worli Super Speciality
                </div>
              </div>

            </div>

            {/* Floating AI Chat Layer */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="absolute top-32 -left-6 lg:-left-12 bg-background/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-border w-72 z-20"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground text-xs font-bold">M</span>
                </div>
                <div className="text-sm font-medium font-heading">Medireach AI</div>
              </div>
              <div className="bg-muted p-3 rounded-tr-2xl rounded-br-2xl rounded-bl-2xl text-sm mb-2">
                I understand you have abdominal pain. How long have you felt this?
              </div>
              <div className="bg-primary text-primary-foreground p-3 rounded-tl-2xl rounded-bl-2xl rounded-br-2xl text-sm ml-8">
                Since yesterday morning.
              </div>
            </motion.div>

            {/* Floating Doctor Card Layer */}
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-14 -right-4 lg:-right-8 bg-background/95 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-border w-80 z-30"
            >
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden shrink-0">
                  <img src="https://i.pravatar.cc/150?u=sarah" alt="Doctor" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-heading font-semibold text-sm">Dr. Sarah Chen</h4>
                  <p className="text-xs text-muted-foreground mb-1">Cardiologist • 1.2 mi away</p>
                  <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full w-fit border border-emerald-200 dark:border-emerald-800">
                    <Calendar className="w-3 h-3" /> Available Today
                  </div>
                </div>
              </div>
            </motion.div>

          </motion.div>

        </div>
      </div>
    </section>
  )
}
