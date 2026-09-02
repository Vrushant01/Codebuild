import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { doctorService } from "../../lib/doctor/doctor-service"
import type { DoctorPatient } from "../../lib/doctor/doctor-types"
import { Search, User, Calendar, Activity, QrCode, ChevronRight, X } from "lucide-react"
import { Button } from "../../components/ui/button"

export default function DoctorPatientsPage() {
  const navigate = useNavigate()
  const [patients, setPatients] = useState<DoctorPatient[]>([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState("")

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      const data = await doctorService.getPatients(search)
      setPatients(data)
      setLoading(false)
    }

    const timer = setTimeout(() => {
      loadData()
    }, search ? 250 : 0)

    return () => clearTimeout(timer)
  }, [search])

  const filtered = patients.filter(p =>
    (p.name && p.name.toLowerCase().includes(search.toLowerCase())) ||
    (p.patientId && p.patientId.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto animate-in fade-in">

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold">My Patients</h1>
          <p className="text-muted-foreground mt-1">Patients associated with your appointments.</p>
        </div>
        <Button onClick={() => navigate("/app/doctor/scanner")} variant="outline" className="gap-2 shrink-0">
          <QrCode className="w-4 h-4" /> Scan Patient ID
        </Button>
      </div>

      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or Patient ID…"
          className="w-full bg-card border rounded-2xl pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1,2,3,4].map(i => <div key={i} className="h-24 bg-muted rounded-3xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-3xl border border-dashed">
          <User className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-foreground">No patients found</h3>
          <p className="text-muted-foreground mt-1 text-sm">
            {search ? "Try a different name or ID." : "No patients associated yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(patient => (
            <div key={patient.id}
              onClick={() => navigate(`/app/doctor/patients/${patient.patientId}`)}
              className="bg-card border rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row gap-4 justify-between sm:items-center hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg shrink-0">
                  {patient.avatarInitials}
                </div>
                <div>
                  <h4 className="font-bold text-base">{patient.name}</h4>
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-1 mt-0.5">
                    <User className="w-3.5 h-3.5" /> {patient.patientId}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 sm:gap-6 items-center pl-[64px] sm:pl-0">
                {patient.currentCaseTitle && (
                  <div className="flex items-start gap-2">
                    <Activity className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Active Case</p>
                      <p className="text-sm font-medium max-w-[150px] truncate">{patient.currentCaseTitle}</p>
                    </div>
                  </div>
                )}

                {patient.lastAppointmentDate && (
                  <div className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Last Visit</p>
                      <p className="text-sm font-medium">{patient.lastAppointmentDate}</p>
                    </div>
                  </div>
                )}

                {patient.nextAppointmentDate && (
                  <div className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Upcoming</p>
                      <p className="text-sm font-medium text-primary">{patient.nextAppointmentDate}</p>
                    </div>
                  </div>
                )}

                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all ml-auto" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
