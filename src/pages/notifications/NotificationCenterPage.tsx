import React, { useState, useMemo } from "react"
import { Check, Settings, BellOff, Search, CalendarX2, Pill, MessageSquare } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Button } from "../../components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { useNotifications } from "../../lib/notifications/NotificationContext"
import { NotificationCard } from "../../components/notifications/NotificationCard"
import type { AppNotification } from "../../lib/notifications/notification-types"
import { NotificationCategory } from "../../lib/notifications/notification-types"
import { getNotificationCategory } from "../../lib/notifications/notification-utils"
import { useAuth } from "../../lib/auth/AuthContext"

export default function NotificationCenterPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { notifications, unreadCount, markAllAsRead } = useNotifications()
  
  const [activeCategory, setActiveCategory] = useState<NotificationCategory>(NotificationCategory.ALL)
  const [searchQuery, setSearchQuery] = useState("")

  const role = user?.role || "PATIENT"

  // Defined by prompt for Notification Center tabs
  const availableCategories = [
    NotificationCategory.ALL,
    NotificationCategory.UNREAD,
    NotificationCategory.APPOINTMENTS,
    NotificationCategory.MEDICINES,
    NotificationCategory.FEEDBACK,
  ]

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    let result = notifications

    if (activeCategory === NotificationCategory.UNREAD) {
      result = result.filter(n => !n.read)
    } else if (activeCategory !== NotificationCategory.ALL) {
      result = result.filter(n => getNotificationCategory(n.type) === activeCategory)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(n => n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q))
    }
    
    return result
  }, [notifications, activeCategory, searchQuery])

  // Group by date
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const grouped = useMemo(() => {
    const todayGroup: AppNotification[] = []
    const yesterdayGroup: AppNotification[] = []
    const earlierGroup: AppNotification[] = []

    filteredNotifications.forEach(n => {
      const d = new Date(n.createdAt)
      if (d >= today) todayGroup.push(n)
      else if (d >= yesterday) yesterdayGroup.push(n)
      else earlierGroup.push(n)
    })

    return { todayGroup, yesterdayGroup, earlierGroup }
  }, [filteredNotifications, today, yesterday])

  // Get tab label
  const getTabLabel = (cat: NotificationCategory) => {
    switch (cat) {
      case NotificationCategory.ALL: return "All"
      case NotificationCategory.UNREAD: return "Unread"
      case NotificationCategory.APPOINTMENTS: return "Appointments"
      case NotificationCategory.MEDICINES: return "Medicines"
      case NotificationCategory.FEEDBACK: return "Feedback"
      default: return "Other"
    }
  }

  // Get empty state component
  const getEmptyState = () => {
    if (searchQuery.trim()) {
      return (
        <div className="flex flex-col items-center justify-center py-24 text-center space-y-4 border rounded-3xl bg-card border-dashed">
          <Search className="h-12 w-12 text-muted-foreground/30" />
          <p className="text-xl font-semibold text-foreground">No notifications match your search.</p>
          <p className="text-muted-foreground max-w-sm">Try adjusting your search terms or clearing the filter.</p>
          <Button variant="outline" onClick={() => setSearchQuery("")}>Clear search</Button>
        </div>
      )
    }

    if (activeCategory === NotificationCategory.UNREAD) {
      return (
        <div className="flex flex-col items-center justify-center py-24 text-center space-y-4 border rounded-3xl bg-card border-dashed">
          <div className="h-16 w-16 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
            <Check className="h-8 w-8 text-emerald-500" />
          </div>
          <p className="text-xl font-semibold text-foreground">You're all caught up.</p>
          <p className="text-muted-foreground max-w-sm">You have no unread notifications right now.</p>
        </div>
      )
    }

    if (activeCategory === NotificationCategory.APPOINTMENTS) {
      return (
        <div className="flex flex-col items-center justify-center py-24 text-center space-y-4 border rounded-3xl bg-card border-dashed">
          <CalendarX2 className="h-12 w-12 text-muted-foreground/30" />
          <p className="text-xl font-semibold text-foreground">No appointment notifications.</p>
          <p className="text-muted-foreground max-w-sm">Updates about your appointments will appear here.</p>
        </div>
      )
    }

    if (activeCategory === NotificationCategory.MEDICINES) {
      return (
        <div className="flex flex-col items-center justify-center py-24 text-center space-y-4 border rounded-3xl bg-card border-dashed">
          <Pill className="h-12 w-12 text-muted-foreground/30" />
          <p className="text-xl font-semibold text-foreground">No medicine notifications.</p>
          <p className="text-muted-foreground max-w-sm">Reminders for your scheduled medicines will appear here.</p>
        </div>
      )
    }

    if (activeCategory === NotificationCategory.FEEDBACK) {
      return (
        <div className="flex flex-col items-center justify-center py-24 text-center space-y-4 border rounded-3xl bg-card border-dashed">
          <MessageSquare className="h-12 w-12 text-muted-foreground/30" />
          <p className="text-xl font-semibold text-foreground">No feedback notifications.</p>
          <p className="text-muted-foreground max-w-sm">Updates about your verified reviews will appear here.</p>
        </div>
      )
    }

    return (
      <div className="flex flex-col items-center justify-center py-24 text-center space-y-4 border rounded-3xl bg-card border-dashed">
        <BellOff className="h-12 w-12 text-muted-foreground/30" />
        <p className="text-xl font-semibold text-foreground">No notifications yet.</p>
        <p className="text-muted-foreground max-w-sm">Important updates will appear here.</p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 flex flex-col animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground tracking-tight">Notifications</h1>
          <p className="text-muted-foreground mt-1">Updates about your appointments, medicines, and care.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button variant="outline" onClick={() => navigate("/app/patient/settings")}>
            <Settings className="mr-2 h-4 w-4" />
            Preferences
          </Button>
          <Button 
            variant="default" 
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="flex-1 sm:flex-none"
          >
            <Check className="mr-2 h-4 w-4" />
            Mark all read
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <div className="flex-1 space-y-6 min-w-0">
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Tabs 
              value={activeCategory} 
              onValueChange={(v) => setActiveCategory(v as NotificationCategory)}
              className="w-full sm:w-auto"
            >
              <div className="w-full overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
                <TabsList className="inline-flex h-10 items-center justify-center rounded-lg bg-muted p-1">
                  {availableCategories.map(cat => {
                    // Show badge for unread count if applicable
                    let count = 0
                    if (cat === NotificationCategory.UNREAD) count = unreadCount
                    else if (cat !== NotificationCategory.ALL) {
                      count = notifications.filter(n => getNotificationCategory(n.type) === cat && !n.read).length
                    }

                    return (
                      <TabsTrigger 
                        key={cat} 
                        value={cat}
                        className="px-4 font-medium text-sm gap-2"
                      >
                        {getTabLabel(cat)}
                        {count > 0 && (
                          <span className="bg-primary/20 text-primary px-1.5 py-0.5 rounded-full text-[10px] font-bold">
                            {count}
                          </span>
                        )}
                      </TabsTrigger>
                    )
                  })}
                </TabsList>
              </div>
            </Tabs>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search notifications..."
                className="w-full pl-9 pr-4 py-2 bg-card border rounded-xl text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
          </div>

          <div className="space-y-8 mt-6">
            {filteredNotifications.length === 0 ? (
              getEmptyState()
            ) : (
              <>
                {grouped.todayGroup.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold tracking-wider text-muted-foreground uppercase ml-1">Today</h3>
                    <div className="grid gap-3">
                      {grouped.todayGroup.map(n => <NotificationCard key={n.id} notification={n} />)}
                    </div>
                  </div>
                )}
                
                {grouped.yesterdayGroup.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold tracking-wider text-muted-foreground uppercase ml-1">Yesterday</h3>
                    <div className="grid gap-3">
                      {grouped.yesterdayGroup.map(n => <NotificationCard key={n.id} notification={n} />)}
                    </div>
                  </div>
                )}
                
                {grouped.earlierGroup.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold tracking-wider text-muted-foreground uppercase ml-1">Earlier</h3>
                    <div className="grid gap-3">
                      {grouped.earlierGroup.map(n => <NotificationCard key={n.id} notification={n} />)}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
