import React, { useState } from "react"
import { Menu, PanelRightClose, PanelRightOpen, MapPin } from "lucide-react"
import { useChat } from "../../lib/chat/ChatContext"
import { useLocationStore } from "../../lib/location/LocationContext"
import { ChatMessageList } from "../../components/chat/ChatMessageList"
import { ChatComposer } from "../../components/chat/ChatComposer"
import { SymptomSummaryPanel } from "../../components/chat/SymptomSummaryPanel"
import { ChatHistorySidebar } from "../../components/chat/ChatHistorySidebar"
import { Button } from "../../components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "../../components/ui/sheet"

export default function PatientChatPage() {
  const { activeSession, isTyping, sendMessage } = useChat()
  const { searchLocation } = useLocationStore()
  
  // Desktop panel toggles
  const [showHistory, setShowHistory] = useState(true)
  const [showSummary, setShowSummary] = useState(true)

  if (!activeSession) return null

  return (
    <div className="flex flex-col h-[calc(100vh-65px)] md:h-screen bg-background relative overflow-hidden">
      
      {/* Mobile Header (Desktop uses AppShell header if integrated, but we'll add a specific chat header here) */}
      <header className="flex-none h-14 border-b bg-background/95 backdrop-blur z-20 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          {/* Mobile History Toggle */}
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="-ml-2">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] p-0 border-r">
                <div className="sr-only">
                  <SheetTitle>Chat History</SheetTitle>
                </div>
                <ChatHistorySidebar className="border-r-0" />
              </SheetContent>
            </Sheet>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Medireach AI</span>
              <span className="flex items-center gap-1.5 text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Ready
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Location Badge */}
          {searchLocation ? (
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              {searchLocation.city}
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full border border-dashed border-muted-foreground/30">
              <MapPin className="w-3.5 h-3.5" />
              Location needed
            </div>
          )}

          {/* Desktop Panel Toggles */}
          <div className="hidden lg:flex items-center gap-1 border-l pl-2 ml-2">
            <Button variant="ghost" size="icon" onClick={() => setShowHistory(!showHistory)} className="text-muted-foreground" title="Toggle History">
              <Menu className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setShowSummary(!showSummary)} className="text-muted-foreground" title="Toggle Summary">
              {showSummary ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
            </Button>
          </div>
          
          {/* Mobile Summary Toggle */}
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="-mr-2">
                  <PanelRightOpen className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[320px] sm:w-[400px] p-0 border-l">
                <div className="sr-only">
                  <SheetTitle>Symptom Summary</SheetTitle>
                </div>
                <SymptomSummaryPanel 
                  symptoms={activeSession.symptoms} 
                  isReady={activeSession.healthcareSearchReady} 
                  className="border-l-0"
                />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Desktop History */}
        {showHistory && (
          <div className="hidden lg:block w-[280px] shrink-0 border-r bg-background transition-all">
            <ChatHistorySidebar className="border-r-0" />
          </div>
        )}

        {/* Central Chat Area */}
        <div className="flex-1 flex flex-col bg-background/50 relative">
          <ChatMessageList 
            messages={activeSession.messages} 
            isTyping={isTyping} 
            onSuggestionClick={(text) => sendMessage(text)}
          />
          <ChatComposer 
            onSend={(text) => sendMessage(text)} 
            disabled={isTyping} 
          />
        </div>

        {/* Desktop Summary */}
        {showSummary && (
          <div className="hidden xl:block w-[320px] shrink-0 border-l bg-background transition-all">
            <SymptomSummaryPanel 
              symptoms={activeSession.symptoms} 
              isReady={activeSession.healthcareSearchReady} 
              className="border-l-0"
            />
          </div>
        )}

      </div>
    </div>
  )
}
