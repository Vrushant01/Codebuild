import React from "react"
import { motion } from "framer-motion"
import { Activity, Search, CalendarCheck, Clock, MessageSquare, Star } from "lucide-react"

export function CoreJourney() {
  const steps = [
    { num: "01", title: "Tell us what you're experiencing", icon: Activity, desc: "Use text or voice to describe your symptoms to Medireach AI." },
    { num: "02", title: "Understand your symptoms", icon: MessageSquare, desc: "Get an immediate summary and understanding of potential care needs." },
    { num: "03", title: "Discover nearby healthcare", icon: Search, desc: "See top-rated doctors and clinics right in your neighborhood." },
    { num: "04", title: "Book a slot", icon: CalendarCheck, desc: "Choose a time that works for you and book instantly." },
    { num: "05", title: "Manage follow-up", icon: Clock, desc: "Track your medicine schedule and medical history." },
    { num: "06", title: "Share verified feedback", icon: Star, desc: "Help others by leaving a verified review after your visit." },
  ]

  return (
    <section className="py-24 bg-muted/30" id="how-it-works">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        
        {/* Problem Statement */}
        <div className="max-w-3xl mx-auto text-center mb-24">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">
            Healthcare is too fragmented.
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Finding the right doctor, explaining your symptoms, dealing with language barriers, and keeping track of your medical history shouldn't require five different apps. Medireach brings it all into one connected experience.
          </p>
        </div>

        {/* Core Journey Timeline */}
        <div className="mb-12 text-center">
          <h3 className="text-2xl font-heading font-bold">One journey. One place.</h3>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 relative">
          {steps.map((step, index) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              key={step.num} 
              className="bg-background p-6 rounded-2xl border border-border shadow-sm soft-shadow relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 font-heading text-8xl font-black pointer-events-none group-hover:scale-110 transition-transform duration-500">
                {step.num}
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 text-primary">
                <step.icon className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-heading font-semibold mb-3">{step.title}</h4>
              <p className="text-muted-foreground text-sm leading-relaxed relative z-10">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
        
      </div>
    </section>
  )
}
