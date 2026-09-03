import React from "react"
import { Link } from "react-router-dom"
import { Globe, Heart, Shield, HelpCircle, PhoneCall } from "lucide-react"

export function LandingFooter() {
  return (
    <footer className="bg-slate-50 dark:bg-slate-900 border-t border-border pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
          
          <div className="col-span-2 lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-heading font-bold text-xl">+</span>
              </div>
              <span className="font-heading font-bold text-2xl tracking-tight text-foreground">
                MEDIREACH
              </span>
            </div>
            <p className="text-muted-foreground text-sm max-w-sm leading-relaxed">
              Making premium healthcare accessible, intelligent, and deeply human for everyone, everywhere.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Globe className="w-4 h-4" /> English (US)
              </button>
            </div>
          </div>

          <div>
            <h4 className="font-heading font-semibold mb-4 text-foreground">Product</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="#ai-assistant" className="hover:text-primary transition-colors">AI Assistant</a></li>
              <li><a href="#healthcare" className="hover:text-primary transition-colors">Healthcare Discovery</a></li>
              <li><a href="#how-it-works" className="hover:text-primary transition-colors">How it Works</a></li>
              <li><a href="#features" className="hover:text-primary transition-colors">Features</a></li>
              <li><a href="#about" className="hover:text-primary transition-colors">Ecosystem</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold mb-4 text-foreground">Ecosystem</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link to="/patient" className="hover:text-primary transition-colors">For Patients</Link></li>
              <li><Link to="/doctor" className="hover:text-primary transition-colors">For Doctors</Link></li>
              <li><Link to="/receptionist" className="hover:text-primary transition-colors">For Clinics</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold mb-4 text-foreground">Support</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors flex items-center gap-2"><HelpCircle className="w-4 h-4" /> Help Center</a></li>
              <li><a href="#" className="hover:text-primary transition-colors flex items-center gap-2"><Shield className="w-4 h-4" /> Privacy & Safety</a></li>
              <li><a href="#" className="hover:text-primary transition-colors flex items-center gap-2"><Heart className="w-4 h-4" /> Accessibility</a></li>
              <li><a href="#" className="hover:text-primary transition-colors flex items-center gap-2"><PhoneCall className="w-4 h-4" /> Contact Us</a></li>
            </ul>
          </div>

        </div>
        
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-border/50 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Medireach Healthcare. All rights reserved.</p>
          <div className="flex items-center gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-foreground transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
