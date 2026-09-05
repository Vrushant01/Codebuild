import React from "react"
import { Building, MapPin, ShieldCheck, Copy, CheckCircle2 } from "lucide-react"

interface OrganizationIdentityCardProps {
  organization: any
}

export function OrganizationIdentityCard({ organization }: OrganizationIdentityCardProps) {
  const [copied, setCopied] = React.useState(false)

  const handleCopyId = () => {
    navigator.clipboard.writeText(organization.organizationId || organization.id)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Get initials as fallback logo
  const initials = organization.name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()

  return (
    <div className="bg-card border rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left relative overflow-hidden">
      
      {/* Decorative bg */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none" />

      {/* Logo */}
      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-primary/10 text-primary flex items-center justify-center font-heading font-bold text-4xl shrink-0 shadow-inner">
        {organization.logo ? (
          <img src={organization.logo} alt={organization.name} className="w-full h-full object-cover rounded-3xl" />
        ) : initials}
      </div>
      
      {/* Details */}
      <div className="flex-1 space-y-3">
        
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
            <h2 className="text-2xl sm:text-3xl font-heading font-bold">{organization.name}</h2>
            {organization.verificationStatus === "Verified" && (
              <span className="flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider bg-white text-emerald-700 border border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-700 px-3 py-0.5 rounded-full w-fit mx-auto sm:mx-0 shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Verified
              </span>
            )}
            {organization.verificationStatus === "Pending" && (
              <span className="flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider bg-white text-amber-700 border border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-700 px-3 py-0.5 rounded-full w-fit mx-auto sm:mx-0 shadow-xs">
                Pending Verification
              </span>
            )}
          </div>
          <p className="text-lg font-medium text-primary flex items-center justify-center sm:justify-start gap-2">
            <Building className="w-4 h-4" /> {organization.type}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4" /> 
            <span>{organization.address}, {organization.city}</span>
          </div>
        </div>

        <div className="pt-2 border-t mt-4 flex items-center justify-center sm:justify-start gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Org ID:</span>
          <code className="bg-muted px-2 py-1 rounded-md text-sm font-medium">
            {organization.organizationId || organization.id}
          </code>
          <button 
            onClick={handleCopyId}
            className="text-muted-foreground hover:text-foreground transition-colors"
            title="Copy ID"
          >
            {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

      </div>
    </div>
  )
}
