import React from "react"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { ArrowRight, MapPin, Search, Calendar, Stethoscope, Play } from "lucide-react"
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              AI-Powered Healthcare Discovery
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-extrabold tracking-tight text-foreground leading-[1.1] mb-6">
              Stop guessing your symptoms. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-500">
                Find real care.
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed max-w-xl">
              Medireach brings top doctors, AI-guided symptom checks, and instant bookings straight to your pocket. Healthcare that actually works around your life.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="rounded-full h-14 px-8 text-base shadow-sm" asChild>
                <a href="#healthcare">
                  Find Healthcare <ArrowRight className="ml-2 w-5 h-5" />
                </a>
              </Button>
              <Button size="lg" variant="outline" className="rounded-full h-14 px-8 text-base bg-background/50 backdrop-blur" asChild>
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

          {/* Right: Layered UI Composition */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: "easeOut" }}
            className="relative h-[550px] lg:h-[650px] w-full perspective-1000"
          >
            {/* Base Map / Interface Layer */}
            <div className="absolute inset-0 bg-slate-100 dark:bg-slate-800 rounded-3xl border border-border overflow-hidden shadow-2xl rotate-y-[-5deg] rotate-x-[5deg] transform-gpu transition-transform hover:rotate-y-0 hover:rotate-x-0 duration-700">
              {/* Fake Map Background */}
              <div className="absolute inset-0 opacity-50 dark:opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiIGZpbGw9Im5vbmUiLz4KPHBhdGggZD0iTTAgMTBoNDBNMTAgMHY0ME0wIDIwaDQwTTIwIDB2NDBNMCAzMGg0ME0zMCAwdjQwIiBzdHJva2U9IiNlMmU4ZjAiIHN0cm9rZS13aWR0aD0iMSIvPgo8L3N2Zz4=')]"></div>
              
              <div className="absolute top-6 left-6 right-6">
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-2 shadow-sm flex items-center gap-2 border border-border">
                  <MapPin className="w-5 h-5 text-muted-foreground ml-2" />
                  <Input className="border-0 focus-visible:ring-0 shadow-none bg-transparent" placeholder="Search clinics in New York..." />
                  <Button size="icon" className="rounded-xl"><Search className="w-4 h-4" /></Button>
                </div>
              </div>

              {/* Mock Map Markers */}
              <div className="absolute top-[40%] left-[30%] w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center animate-pulse">
                <div className="w-4 h-4 bg-primary rounded-full"></div>
              </div>
              <div className="absolute top-[60%] left-[60%] w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
              </div>
            </div>

            {/* Floating AI Chat Layer */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="absolute top-32 -left-6 lg:-left-12 bg-background rounded-2xl p-4 shadow-xl border border-border w-72 z-10 glass-card"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground text-xs font-bold">+</span>
                </div>
                <div className="text-sm font-medium">Medireach AI</div>
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
              className="absolute bottom-16 -right-4 lg:-right-8 bg-background rounded-2xl p-4 shadow-2xl border border-border w-80 z-20 glass-card"
            >
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden">
                  <img src="https://i.pravatar.cc/150?u=sarah" alt="Doctor" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-heading font-semibold">Dr. Sarah Chen</h4>
                  <p className="text-xs text-muted-foreground mb-1">Cardiologist • 1.2 mi away</p>
                  <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full w-fit">
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

// Temporary inline components for icons used just here
function Shield(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
}
function Globe(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>
}
