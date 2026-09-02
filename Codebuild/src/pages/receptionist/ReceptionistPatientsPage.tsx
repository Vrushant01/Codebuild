import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { receptionistService } from "../../lib/receptionist/receptionist-service"
import type { ReceptionistPatientView } from "../../lib/receptionist/receptionist-types"
import { Search, Phone, Mail, ChevronRight, Users } from "lucide-react"

export default function ReceptionistPatientsPage() {
  const navigate = useNavigate()
  const [patients, setPatients] = useState<ReceptionistPatientView[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    const loadPatients = async () => {
      setLoading(true)
      const data = await receptionistService.getPatients()
      setPatients(data)
      setLoading(false)
    }
    loadPatients()
  }, [])

  const filteredPatients = patients.filter(p => 
    p.patientName.toLowerCase().includes(search.toLowerCase()) || 
    p.patientIdentifier.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto animate-in fade-in">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" /> Patients
          </h1>
          <p className="text-muted-foreground mt-1">Directory of patients with upcoming or past appointments.</p>
        </div>
      </div>

      <div className="bg-card border rounded-3xl p-2 pl-4 flex items-center shadow-sm w-full md:max-w-md focus-within:ring-2 ring-primary transition-all mb-8">
        <Search className="w-5 h-5 text-muted-foreground" />
        <input 
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search patient name or ID..."
          className="w-full bg-transparent border-none focus:outline-none px-3 py-2"
        />
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-muted rounded-3xl" />)}
        </div>
      ) : filteredPatients.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-3xl border border-dashed">
          <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-foreground">No patients found</h3>
          <p className="text-muted-foreground mt-1">Try adjusting your search.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredPatients.map(patient => (
            <div 
              key={patient.patientId}
              onClick={() => navigate(`/app/receptionist/patients/${patient.patientId}`)}
              className="bg-card border rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-primary/50 transition-all cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                    {patient.patientName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{patient.patientName}</h3>
                    <p className="text-sm text-muted-foreground">{patient.patientIdentifier}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </div>

              <div className="space-y-2 mb-5">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4" /> {patient.mobile}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4" /> {patient.email}
                </div>
              </div>

              {patient.nextAppointment ? (
                <div className="bg-muted/50 rounded-2xl p-3 border border-border/50">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Next Appointment</p>
                  <p className="text-sm font-semibold">{patient.nextAppointment.date} at {patient.nextAppointment.timeStr}</p>
                  <p className="text-xs text-muted-foreground truncate">w/ {patient.nextAppointment.doctor.name}</p>
                </div>
              ) : (
                <div className="bg-muted/50 rounded-2xl p-3 border border-border/50 text-center">
                  <p className="text-sm text-muted-foreground">No upcoming appointments</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  )
}
