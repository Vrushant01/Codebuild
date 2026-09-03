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
              Discover top-rated doctors, clinics, and hospitals. See real-time availability and book slots instantly, whether you need an in-person visit or a quick video consultation.
            </p>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search specialties..." className="pl-9 bg-background" />
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

          {/* Right: Map Simulation */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="lg:col-span-3 bg-slate-200 dark:bg-slate-800 rounded-3xl overflow-hidden relative border border-border shadow-inner"
          >
            {/* Map Grid Pattern */}
            <div className="absolute inset-0 opacity-40 dark:opacity-20" 
                 style={{ backgroundImage: 'url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCI+CjxwYXRoIGQ9Ik0wIDBoODB2ODBIMHoiIGZpbGw9Im5vbmUiLz4KPHBhdGggZD0iTTAgMjBoODBNMCA0MGg4ME0wIDYwaDgwTTIwIDB2ODBNNDAgMHY4ME02MCAwdjgwIiBzdHJva2U9IiM5NGExYjIiIHN0cm9rZS13aWR0aD0iMSIvPgo8L3N2Zz4=")' }}>
            </div>
            
            {/* Map Roads (SVG Simulation) */}
            <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              <path d="M-100,200 Q300,100 500,400 T1200,300" fill="none" stroke="currentColor" strokeWidth="12" />
              <path d="M200,-100 Q300,300 100,600 T400,900" fill="none" stroke="currentColor" strokeWidth="8" />
            </svg>

            {/* Current Location Marker */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <div className="relative flex h-6 w-6">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-40"></span>
                <span className="relative inline-flex rounded-full h-6 w-6 border-2 border-white bg-blue-500 shadow-md"></span>
              </div>
            </div>

            {/* Mock Clinic Markers */}
            <div className="absolute top-[30%] left-[60%] flex flex-col items-center group cursor-pointer">
              <div className="bg-white dark:bg-slate-900 rounded-xl p-2 shadow-lg mb-2 opacity-0 group-hover:opacity-100 transition-opacity -translate-y-2 whitespace-nowrap border border-border">
                <p className="font-semibold text-sm">Metro Heart Institute</p>
                <p className="text-xs text-muted-foreground">1.2 mi • 3 Doctors</p>
              </div>
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white shadow-lg border-2 border-white">
                <MapPin className="w-5 h-5 fill-primary text-white" />
              </div>
            </div>

            <div className="absolute top-[65%] left-[25%] flex flex-col items-center group cursor-pointer">
              <div className="bg-white dark:bg-slate-900 rounded-xl p-2 shadow-lg mb-2 opacity-0 group-hover:opacity-100 transition-opacity -translate-y-2 whitespace-nowrap border border-border">
                <p className="font-semibold text-sm">City Health Clinic</p>
                <p className="text-xs text-muted-foreground">2.4 mi • 1 Doctor</p>
              </div>
              <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg border-2 border-white">
                <MapPin className="w-5 h-5 fill-emerald-500 text-white" />
              </div>
            </div>

            {/* Float Controls */}
            <div className="absolute bottom-6 right-6 flex flex-col gap-2">
              <Button size="icon" variant="secondary" className="rounded-full shadow-md w-12 h-12 bg-background">+</Button>
              <Button size="icon" variant="secondary" className="rounded-full shadow-md w-12 h-12 bg-background">-</Button>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
