import React, { useState } from "react"
import { ShieldAlert, Plus, Search, X } from "lucide-react"
import { Button } from "../ui/button"
import type { Allergy } from "../../lib/history/medical-history-types"
import { AllergyForm } from "./AllergyForm"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"

interface AllergySectionProps {
  allergies: Allergy[]
  onAdd: (data: Partial<Allergy>) => Promise<void>
  onUpdate: (id: string, data: Partial<Allergy>) => Promise<void>
  onDelete: (id: string) => Promise<void>
  isDoctorView?: boolean
}

export function AllergySection({ allergies, onAdd, onUpdate, onDelete, isDoctorView }: AllergySectionProps) {
  const [search, setSearch] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [editingAllergy, setEditingAllergy] = useState<Allergy | null>(null)

  const filtered = allergies.filter(a => a.name.toLowerCase().includes(search.toLowerCase()))

  const handleSave = async (data: Partial<Allergy>) => {
    if (editingAllergy) {
      await onUpdate(editingAllergy.id, data)
    } else {
      await onAdd(data)
    }
    setModalOpen(false)
    setEditingAllergy(null)
  }

  const handleDelete = async () => {
    if (editingAllergy) {
      await onDelete(editingAllergy.id)
      setModalOpen(false)
      setEditingAllergy(null)
    }
  }

  const openAdd = () => {
    setEditingAllergy(null)
    setModalOpen(true)
  }

  const openEdit = (allergy: Allergy) => {
    if (isDoctorView) return // Doctors don't edit patient self-reported allergies from this view usually
    setEditingAllergy(allergy)
    setModalOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search allergy names..."
            className="w-full bg-card border rounded-xl pl-10 pr-4 py-2.5 text-sm shadow-sm"
          />
        </div>
        {!isDoctorView && (
          <Button onClick={openAdd} className="shrink-0 rounded-xl gap-2 shadow-md">
            <Plus className="w-4 h-4" /> Add allergy
          </Button>
        )}
      </div>

      {allergies.length === 0 ? (
        <div className="text-center py-16 px-4 border-2 border-dashed rounded-3xl bg-muted/10">
          <ShieldAlert className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-xl font-bold font-heading mb-2">No allergies added</h3>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">
            Keep your healthcare providers informed by adding any known allergies or adverse reactions.
          </p>
          {!isDoctorView && (
            <Button onClick={openAdd} variant="outline" className="rounded-xl gap-2">
              <Plus className="w-4 h-4" /> Add your first allergy
            </Button>
          )}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground font-medium">No allergies match your search.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(allergy => (
            <div 
              key={allergy.id}
              onClick={() => openEdit(allergy)}
              className="bg-red-50/50 dark:bg-red-950/10 border border-red-100 dark:border-red-900/30 rounded-2xl p-5 hover:border-red-200 transition-colors cursor-pointer group"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                  <ShieldAlert className="w-5 h-5 shrink-0" />
                  <h4 className="font-bold text-lg">{allergy.name}</h4>
                </div>
                {allergy.severity && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400">
                    {allergy.severity}
                  </span>
                )}
              </div>
              
              <div className="space-y-2">
                {allergy.reaction && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Reported Reaction</p>
                    <p className="text-sm font-medium text-foreground">{allergy.reaction}</p>
                  </div>
                )}
                {allergy.previousOccurrence && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Previous Occurrence</p>
                    <p className="text-sm font-medium text-foreground">{allergy.previousOccurrence}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      <Dialog open={modalOpen} onOpenChange={o => !o && setModalOpen(false)}>
        <DialogContent className="sm:max-w-lg rounded-[2rem] p-0 max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-500" /> 
                {editingAllergy ? "Edit Allergy" : "Add Allergy"}
              </DialogTitle>
            </DialogHeader>
            <AllergyForm 
              initialData={editingAllergy || undefined}
              onSave={handleSave}
              onCancel={() => setModalOpen(false)}
              onDelete={editingAllergy ? handleDelete : undefined}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
