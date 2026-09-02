import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mic, ArrowUp, Volume2, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { mockAiChat, mockAiChatGujarati } from "@/lib/mock-data/landing"

export function AIAssistantSection() {
  const [language, setLanguage] = useState<"EN" | "GU">("EN")
  const [isRecording, setIsRecording] = useState(false)
  
  const chatData = language === "EN" ? mockAiChat : mockAiChatGujarati

  const handleMicClick = () => {
    setIsRecording(!isRecording)
  }

  return (
    <section className="py-24 bg-background overflow-hidden" id="ai-assistant">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left: Interactive Mock Chat */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50 rounded-[2rem] border border-border shadow-xl overflow-hidden flex flex-col h-[600px] relative"
          >
            <div className="p-4 border-b bg-background text-foreground flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold">+</span>
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-sm">Medireach AI</h3>
                  <p className="text-xs text-emerald-600 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span> Online
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-full text-xs"
                onClick={() => setLanguage(lang => lang === "EN" ? "GU" : "EN")}
              >
                <Globe className="w-3 h-3 mr-2" />
                {language === "EN" ? "English" : "ગુજરાતી"}
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {chatData.map((msg, idx) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.2 }}
                  viewport={{ once: true }}
                  key={idx} 
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[80%] rounded-2xl p-4 text-sm ${
                    msg.sender === "user" 
                      ? "bg-primary text-primary-foreground rounded-tr-sm" 
                      : "bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-50 border border-border shadow-sm rounded-tl-sm"
                  }`}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              
              {isRecording && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex justify-end"
                >
                  <div className="bg-primary/10 border border-primary/20 text-primary rounded-2xl p-4 text-sm rounded-tr-sm flex items-center gap-2">
                    <span className="flex gap-1 items-center h-4">
                      <motion.span animate={{ height: [4, 12, 4] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-1 bg-primary rounded-full block"></motion.span>
                      <motion.span animate={{ height: [4, 16, 4] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }} className="w-1 bg-primary rounded-full block"></motion.span>
                      <motion.span animate={{ height: [4, 8, 4] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }} className="w-1 bg-primary rounded-full block"></motion.span>
                    </span>
                    Listening...
                  </div>
                </motion.div>
              )}
            </div>

            <div className="p-4 bg-background text-foreground border-t">
              <div className="relative flex items-center gap-2">
                <Button 
                  size="icon" 
                  variant={isRecording ? "destructive" : "secondary"}
                  className="rounded-full flex-shrink-0 relative"
                  onClick={handleMicClick}
                >
                  {isRecording && (
                    <span className="absolute inset-0 rounded-full border-2 border-destructive animate-ping opacity-50"></span>
                  )}
                  <Mic className="w-5 h-5" />
                </Button>
                <div className="flex-1 bg-muted rounded-full px-4 py-3 text-sm text-muted-foreground">
                  Type your symptoms...
                </div>
                <Button size="icon" className="rounded-full flex-shrink-0">
                  <ArrowUp className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Right: Copy */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">
                Start with a conversation.
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                Medireach AI understands you. Whether you type or speak, it accurately collects your symptoms, understands your health context, and prepares a summary for your doctor.
              </p>
              <div className="bg-amber-50 border border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20 rounded-lg p-4 text-sm text-black flex gap-3">
                <Volume2 className="w-5 h-5 text-warning flex-shrink-0" />
                <p><strong>Healthcare should speak your language.</strong> We support multilingual voice and text input, ensuring language is never a barrier to care.</p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50 border rounded-2xl p-6">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">AI generated summary</h4>
              <div className="space-y-4">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-sm text-muted-foreground">Symptom</span>
                  <span className="text-sm font-medium">Abdominal pain</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-sm text-muted-foreground">Location</span>
                  <span className="text-sm font-medium">Right side</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-sm text-muted-foreground">Duration</span>
                  <span className="text-sm font-medium">1 day</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Nature</span>
                  <span className="text-sm font-medium">Constant, worsens on movement</span>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
