import React from "react"
import { AlertCircle, Calendar, MessageSquare } from "lucide-react"
import { Button } from "../ui/button"

export function PersistentSymptomsPrompt() {
  return (
    <div className="bg-primary/5 border border-primary/20 rounded-3xl p-6 relative overflow-hidden mt-8">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      
      <div className="flex flex-col sm:flex-row gap-5 relative z-10">
        <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <AlertCircle className="w-6 h-6" />
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-bold font-heading mb-1 text-foreground">Still feeling unwell?</h3>
          <p className="text-muted-foreground text-sm font-medium mb-4 max-w-[400px]">
            If you have completed your prescribed medication course but your symptoms persist, you should consult your healthcare provider.
          </p>
          
          <div className="flex flex-wrap gap-3">
            <Button className="bg-primary text-primary-foreground rounded-xl shadow-md hover:bg-primary/90">
              <Calendar className="w-4 h-4 mr-2" /> Request Follow-up
            </Button>
            <Button variant="outline" className="rounded-xl border-primary/20 hover:bg-primary/5 text-foreground">
              <MessageSquare className="w-4 h-4 mr-2" /> Contact Doctor
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
