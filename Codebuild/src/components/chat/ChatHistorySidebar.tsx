import React from "react"
import { MessageSquare, Plus, Clock } from "lucide-react"
import { useChat } from "../../lib/chat/ChatContext"
import { useTranslation } from "../../lib/i18n/useTranslation"
import { Button } from "../ui/button"
import { cn } from "../../lib/utils"

export function ChatHistorySidebar({ className }: { className?: string }) {
  const { history, activeSession, loadSession, startNewSession } = useChat()
  const { t } = useTranslation()

  const todaySessions = history.filter(s => {
    const d = new Date(s.updatedAt)
    const today = new Date()
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()
  })

  const olderSessions = history.filter(s => !todaySessions.includes(s))

  return (
    <div className={cn("bg-muted/10 border-r flex flex-col h-full overflow-y-auto", className)}>
      <div className="p-4 border-b sticky top-0 bg-background/95 backdrop-blur z-10">
        <Button 
          className="w-full justify-start rounded-xl h-11" 
          variant="outline"
          onClick={startNewSession}
        >
          <Plus className="w-4 h-4 mr-2" />
          {t("chat.newConversation")}
        </Button>
      </div>

      <div className="p-3 space-y-6 flex-1">
        
        {todaySessions.length > 0 && (
          <div className="space-y-1">
            <h4 className="text-xs font-semibold text-muted-foreground px-3 mb-2 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-3 h-3" /> {t("common.today")}
            </h4>
            <div className="space-y-0.5">
              {todaySessions.map(session => (
                <button
                  key={session.id}
                  onClick={() => loadSession(session.id)}
                  className={cn(
                    "w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors flex flex-col gap-1",
                    activeSession?.id === session.id 
                      ? "bg-primary/10 text-primary font-medium" 
                      : "hover:bg-muted text-foreground"
                  )}
                >
                  <span className="truncate block">{session.title}</span>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-normal">
                    <span className="uppercase">{session.language}</span>
                    <span>&bull;</span>
                    <span>{new Date(session.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {olderSessions.length > 0 && (
          <div className="space-y-1">
            <h4 className="text-xs font-semibold text-muted-foreground px-3 mb-2 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-3 h-3" /> {t("common.previous")}
            </h4>
            <div className="space-y-0.5">
              {olderSessions.map(session => (
                <button
                  key={session.id}
                  onClick={() => loadSession(session.id)}
                  className={cn(
                    "w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors flex flex-col gap-1",
                    activeSession?.id === session.id 
                      ? "bg-primary/10 text-primary font-medium" 
                      : "hover:bg-muted text-foreground"
                  )}
                >
                  <span className="truncate block">{session.title}</span>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-normal">
                    <span className="uppercase">{session.language}</span>
                    <span>&bull;</span>
                    <span>{new Date(session.updatedAt).toLocaleDateString()}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {history.length === 0 && (
          <div className="px-4 py-8 text-center text-muted-foreground">
            <MessageSquare className="w-8 h-8 mx-auto mb-3 opacity-20" />
            <p className="text-sm">{t("chat.noRecent")}</p>
          </div>
        )}

      </div>
    </div>
  )
}
