import React from "react"
import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function FinalCtaSection() {
  return (
    <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
        <div className="absolute -top-[50%] -right-[10%] w-[100%] h-[200%] rounded-full border-[100px] border-white/20"></div>
        <div className="absolute top-[50%] -left-[20%] w-[80%] h-[150%] rounded-full border-[60px] border-white/20"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-6 text-center relative z-10">
        <h2 className="text-5xl md:text-6xl font-heading font-extrabold mb-8 leading-tight">
          Your healthcare journey <br/> starts here.
        </h2>
        <p className="text-xl md:text-2xl text-primary-foreground/80 font-medium mb-12 max-w-2xl mx-auto">
          Find care. Book confidently. Stay connected. Join Medireach today and experience healthcare the way it should be.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button size="lg" variant="secondary" className="rounded-full h-14 px-8 text-base text-primary shadow-lg" asChild>
            <a href="#healthcare">
              Find Healthcare <ArrowRight className="ml-2 w-5 h-5" />
            </a>
          </Button>
          <Button size="lg" className="rounded-full h-14 px-8 text-base bg-primary-foreground/10 hover:bg-primary-foreground/20 border border-primary-foreground/20 text-primary-foreground backdrop-blur" asChild>
            <Link to="/register">
              Create an Account
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
