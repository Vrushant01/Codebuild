import React from "react"
import { Globe, Bell, Eye, ShieldCheck, Settings } from "lucide-react"

export default function AdminSettingsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in">
      <div>
        <h1 className="text-3xl font-heading font-bold text-primary">Platform Settings</h1>
        <p className="text-muted-foreground mt-1">Configure global platform behavior.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        
        {/* Platform Settings */}
        <div className="bg-card border rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Globe className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-lg">Platform</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Platform Name</label>
              <div className="font-medium mt-1">Medireach</div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Default Language</label>
              <div className="font-medium mt-1">English</div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Available Languages</label>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="text-xs bg-muted px-2 py-1 rounded-md">English</span>
                <span className="text-xs bg-muted px-2 py-1 rounded-md">Gujarati</span>
                <span className="text-xs bg-muted px-2 py-1 rounded-md">Hindi</span>
              </div>
            </div>
          </div>
        </div>

        {/* Listing Settings */}
        <div className="bg-card border rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Eye className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-lg">Listings</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Organization Approval Required</div>
                <div className="text-xs text-muted-foreground">New organizations must be approved before activation.</div>
              </div>
              <div className="w-10 h-6 bg-emerald-500 rounded-full relative cursor-pointer">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Auto-publish listings</div>
                <div className="text-xs text-muted-foreground">Listings become visible upon activation.</div>
              </div>
              <div className="w-10 h-6 bg-emerald-500 rounded-full relative cursor-pointer">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-card border rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Bell className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-lg">Admin Notifications</h2>
          </div>
          <div className="space-y-4">
            {["Organization submitted", "Organization approved", "Organization rejected", "Organization suspended"].map(item => (
              <div key={item} className="flex items-center justify-between">
                <div className="font-medium text-sm">{item}</div>
                <div className="w-10 h-6 bg-emerald-500 rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Access Settings */}
        <div className="bg-card border rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-lg">Access & Security</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Current Access Level</label>
              <div className="font-medium mt-1 text-primary">Super Admin</div>
              <p className="text-xs text-muted-foreground mt-1">Full access to platform control center.</p>
            </div>
            <div className="pt-4 border-t">
              <button className="text-sm font-medium text-primary hover:underline flex items-center gap-2">
                <Settings className="w-4 h-4" /> Manage Role Architecture (Future)
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
