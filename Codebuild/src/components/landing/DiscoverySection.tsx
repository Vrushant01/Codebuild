import React from "react"
import { motion } from "framer-motion"
import { MapPin, Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DoctorCard } from "@/components/healthcare/cards"
import { mockDoctors } from "@/lib/mock-data/landing"

export function DiscoverySection() {
  return (
    <section className="py-24 bg-muted/10 border-t" id="healthcare">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">
              Find healthcare around you.
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Discover top-rated doctors, clinics, and hospitals across Gujarat and India. See real-time availability and book slots instantly, whether you need an in-person visit or a quick video consultation.
            </p>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search specialties in Ahmedabad, Surat..." className="pl-9 bg-background" />
            </div>
            <Button variant="outline" size="icon" className="bg-background">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Split View: List + Map */}
        <div className="grid lg:grid-cols-5 gap-6 h-[800px] lg:h-[700px]">
          
          {/* Left: Cards List */}
          <div className="lg:col-span-2 flex flex-col gap-4 overflow-y-auto pr-2 pb-4 snap-y custom-scrollbar">
            {mockDoctors.map((doc, idx) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="snap-start"
              >
                <DoctorCard doctor={doc} />
              </motion.div>
            ))}
          </div>

          {/* Right: Authentic Ahmedabad Map Simulation */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="lg:col-span-3 bg-slate-950 rounded-3xl overflow-hidden relative border border-border shadow-2xl group"
          >
            {/* Ahmedabad Map Photo */}
            <img 
              src="/images/ahmedabad_map_discovery.jpg" 
              alt="Ahmedabad Healthcare Discovery Map" 
              className="absolute inset-0 w-full h-full object-cover select-none filter contrast-[1.05] brightness-[0.98] dark:brightness-[0.85] transition-transform duration-1000 group-hover:scale-105" 
            />
            
            {/* Ambient Vignette Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/30 via-transparent to-background/20 pointer-events-none" />

            {/* Current Location Marker (Ellisbridge) */}
            <div className="absolute top-[48%] left-[52%] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
              <div className="relative flex h-7 w-7 items-center justify-center">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-60"></span>
                <span className="relative inline-flex rounded-full h-5 w-5 border-2 border-white bg-blue-600 shadow-md"></span>
              </div>
              <div className="bg-background/95 backdrop-blur-md text-[10px] font-bold text-foreground px-2 py-0.5 rounded-full border border-border shadow-xs mt-1">
                You are here (Ellisbridge)
              </div>
            </div>

            {/* Clinic Marker 1: Ahmedabad Multi-Specialty Hospital */}
            <div className="absolute top-[28%] left-[75%] flex flex-col items-center group/pin cursor-pointer z-20">
              <div className="bg-background/95 backdrop-blur-md rounded-xl p-2.5 shadow-xl mb-1.5 opacity-0 group-hover/pin:opacity-100 transition-all -translate-y-1 whitespace-nowrap border border-border">
                <p className="font-bold text-xs text-foreground">Ahmedabad Multi-Specialty Hospital</p>
                <p className="text-[10px] text-muted-foreground">Navrangpura • Dr. Aarav Patel (Cardiology)</p>
              </div>
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white shadow-xl border-2 border-white">
                <MapPin className="w-5 h-5 fill-primary text-white" />
              </div>
              <div className="bg-background/90 backdrop-blur-xs text-[10px] font-bold px-2 py-0.5 rounded-md border shadow-xs mt-1">
                Navrangpura
              </div>
            </div>

            {/* Clinic Marker 2: Apollo Clinic & Skin Care */}
            <div className="absolute top-[35%] left-[22%] flex flex-col items-center group/pin cursor-pointer z-20">
              <div className="bg-background/95 backdrop-blur-md rounded-xl p-2.5 shadow-xl mb-1.5 opacity-0 group-hover/pin:opacity-100 transition-all -translate-y-1 whitespace-nowrap border border-border">
                <p className="font-bold text-xs text-foreground">Apollo Clinic & Skin Care</p>
                <p className="text-[10px] text-muted-foreground">Bodakdev / SG Hwy • Dr. Priya Sharma</p>
              </div>
              <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-xl border-2 border-white">
                <MapPin className="w-5 h-5 fill-emerald-500 text-white" />
              </div>
              <div className="bg-background/90 backdrop-blur-xs text-[10px] font-bold px-2 py-0.5 rounded-md border shadow-xs mt-1">
                Bodakdev
              </div>
            </div>

            {/* Clinic Marker 3: Sabarmati Heart Institute */}
            <div className="absolute top-[68%] left-[45%] flex flex-col items-center group/pin cursor-pointer z-20">
              <div className="bg-background/95 backdrop-blur-md rounded-xl p-2.5 shadow-xl mb-1.5 opacity-0 group-hover/pin:opacity-100 transition-all -translate-y-1 whitespace-nowrap border border-border">
                <p className="font-bold text-xs text-foreground">Sabarmati Heart & Care Center</p>
                <p className="text-[10px] text-muted-foreground">Paldi / Riverfront • 24x7 Emergency</p>
              </div>
              <div className="w-9 h-9 bg-purple-600 rounded-full flex items-center justify-center text-white shadow-xl border-2 border-white">
                <MapPin className="w-4 h-4 fill-purple-600 text-white" />
              </div>
              <div className="bg-background/90 backdrop-blur-xs text-[10px] font-bold px-2 py-0.5 rounded-md border shadow-xs mt-1">
                Paldi
              </div>
            </div>

            {/* Map Controls */}
            <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-20">
              <Button variant="secondary" size="icon" className="rounded-xl shadow-lg bg-background/90 backdrop-blur-md border border-border">
                +
              </Button>
              <Button variant="secondary" size="icon" className="rounded-xl shadow-lg bg-background/90 backdrop-blur-md border border-border">
                -
              </Button>
            </div>

            {/* Location Label Badge */}
            <div className="absolute bottom-6 left-6 bg-background/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-border shadow-lg text-xs font-bold flex items-center gap-1.5 z-20">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              <span>Ahmedabad, Gujarat, India</span>
            </div>

          </motion.div>

        </div>

      </div>
    </section>
  )
}
