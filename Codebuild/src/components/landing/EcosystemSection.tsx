import React from "react"
import { motion } from "framer-motion"
import { User, Stethoscope, Building, Users } from "lucide-react"

export function EcosystemSection() {
  return (
    <section className="py-24 bg-slate-900 text-white overflow-hidden" id="about">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">
            A connected healthcare ecosystem.
          </h2>
          <p className="text-lg text-slate-300 leading-relaxed">
            Medireach isn't just for patients. It's a unified platform that connects everyone involved in the healthcare journey, eliminating friction at every step.
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto mt-20">
          
          {/* Connection Lines (Desktop only for visual simplicity) */}
          <div className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <path d="M 200,100 C 300,100 400,200 450,250" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" strokeDasharray="5,5" />
              <path d="M 700,100 C 600,100 500,200 450,250" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" strokeDasharray="5,5" />
              <path d="M 200,400 C 300,400 400,300 450,250" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" strokeDasharray="5,5" />
              <path d="M 700,400 C 600,400 500,300 450,250" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" strokeDasharray="5,5" />
            </svg>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-32 relative z-10">
            
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-700 shadow-2xl flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center mb-4">
                <User className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-heading font-semibold mb-2">Patients</h4>
              <p className="text-sm text-slate-400">Find doctors, book slots, manage medicines, and keep track of health history effortlessly.</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-700 shadow-2xl flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-4">
                <Stethoscope className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-heading font-semibold mb-2">Doctors</h4>
              <p className="text-sm text-slate-400">Manage appointments, review AI-generated symptom summaries, and conduct online consultations.</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-700 shadow-2xl flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 bg-purple-500/20 text-purple-400 rounded-full flex items-center justify-center mb-4">
                <Users className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-heading font-semibold mb-2">Receptionists</h4>
              <p className="text-sm text-slate-400">Approve bookings, manage clinic queues, and streamline patient intake smoothly.</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-700 shadow-2xl flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 bg-orange-500/20 text-orange-400 rounded-full flex items-center justify-center mb-4">
                <Building className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-heading font-semibold mb-2">Organizations</h4>
              <p className="text-sm text-slate-400">Oversee multiple clinics, track performance, and manage overarching healthcare operations.</p>
            </motion.div>
            
          </div>
          
          {/* Center Logo Node */}
          <motion.div 
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", bounce: 0.5, delay: 0.4 }}
            className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-primary text-primary-foreground rounded-full items-center justify-center shadow-2xl shadow-primary/20 z-20 font-heading font-bold text-4xl"
          >
            +
          </motion.div>
          
        </div>

      </div>
    </section>
  )
}
