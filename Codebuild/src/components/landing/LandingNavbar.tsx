import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Menu, X, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function LandingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navLinks = [
    { title: "How it Works", href: "#how-it-works" },
    { title: "Healthcare", href: "#discovery" },
    { title: "Features", href: "#features" },
    { title: "About", href: "#about" },
  ]

  return (
    <nav 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent",
        isScrolled ? "bg-background/95 backdrop-blur-md border-border shadow-sm py-3" : "bg-transparent py-5"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 z-50">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-heading font-bold text-xl">+</span>
          </div>
          <span className="font-heading font-bold text-xl tracking-tight text-foreground">
            MEDIREACH
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <div className="flex items-center gap-6">
            {navLinks.map((link) => (
              <a 
                key={link.title} 
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.title}
              </a>
            ))}
          </div>
          
          <div className="flex items-center gap-4 border-l pl-6 border-border">
            <Button variant="ghost" size="icon" className="rounded-full" title="Switch Language">
              <Globe className="w-4 h-4" />
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/login">Log in</Link>
            </Button>
            <Button className="rounded-full px-6 shadow-sm soft-shadow hover:shadow-md transition-shadow" asChild>
              <Link to="/register">Get Started</Link>
            </Button>
          </div>
        </div>

        {/* Mobile Toggle */}
        <div className="md:hidden flex items-center gap-4 z-50">
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="absolute top-0 left-0 right-0 h-screen bg-background border-b z-40 p-6 pt-24 flex flex-col gap-6 md:hidden">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a 
                  key={link.title} 
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-lg font-medium text-foreground py-2 border-b border-border/50"
                >
                  {link.title}
                </a>
              ))}
            </div>
            <div className="mt-auto flex flex-col gap-3 pb-safe">
              <Button variant="outline" className="w-full justify-center" asChild>
                <Link to="/login">Log in</Link>
              </Button>
              <Button className="w-full justify-center" asChild>
                <Link to="/register">Get Started</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
