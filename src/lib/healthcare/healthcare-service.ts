import type { Organization, Doctor, Review, HealthcareFilterState } from "./types"
import { MOCK_ORGANIZATIONS, MOCK_DOCTORS, MOCK_REVIEWS } from "./mock-data"

const mockDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// A simple distance calculation for the mock (using a rough degree to km conversion)
// 1 degree ~ 111 km
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const dx = (lon1 - lon2) * 111 * Math.cos((lat1 + lat2) / 2 * Math.PI / 180)
  const dy = (lat1 - lat2) * 111
  return Math.sqrt(dx * dx + dy * dy)
}

// City approximate coordinates
const CITY_COORDS: Record<string, { lat: number, lon: number }> = {
  "Ahmedabad": { lat: 23.0225, lon: 72.5714 },
  "Surat": { lat: 21.1702, lon: 72.8311 },
  "Vadodara": { lat: 22.3072, lon: 73.1812 },
  "Rajkot": { lat: 22.3039, lon: 70.8022 },
}

export const healthcareService = {
  
  async searchOrganizations(city: string, filters?: Partial<HealthcareFilterState>): Promise<Organization[]> {
    await mockDelay(600) // Simulate network request

    const center = CITY_COORDS[city] || CITY_COORDS["Ahmedabad"]

    let results = MOCK_ORGANIZATIONS.filter(org => org.city.toLowerCase() === city.toLowerCase())

    // Apply Filters
    if (filters) {
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase()
        results = results.filter(org => 
          org.name.toLowerCase().includes(query) ||
          org.specializations.some(s => s.toLowerCase().includes(query)) ||
          org.type.toLowerCase().includes(query)
        )
      }
      
      if (filters.organizationType && filters.organizationType.length > 0) {
        results = results.filter(org => filters.organizationType!.includes(org.type))
      }

      if (filters.specializations && filters.specializations.length > 0) {
        results = results.filter(org => 
          org.specializations.some(s => filters.specializations!.includes(s))
        )
      }

      if (filters.availability && filters.availability !== "All") {
        if (filters.availability === "Available") {
          results = results.filter(org => org.availability.status === "available")
        } else if (filters.availability === "Limited") {
          results = results.filter(org => org.availability.status === "limited")
        } else if (filters.availability === "Fully booked") {
          results = results.filter(org => org.availability.status === "full")
        }
      }

      if (filters.minRating) {
        results = results.filter(org => org.rating >= filters.minRating!)
      }
    }

    // Map distances
    results = results.map(org => ({
      ...org,
      distance: Number(calculateDistance(center.lat, center.lon, org.latitude, org.longitude).toFixed(1))
    }))

    // Sort by distance roughly
    results.sort((a, b) => (a.distance || 0) - (b.distance || 0))

    return results
  },

  async getOrganization(id: string): Promise<Organization | undefined> {
    await mockDelay(300)
    return MOCK_ORGANIZATIONS.find(org => org.id === id)
  },

  async getDoctorsByOrganization(orgId: string): Promise<Doctor[]> {
    await mockDelay(400)
    return MOCK_DOCTORS.filter(doc => doc.organizationId === orgId)
  },

  async getDoctor(id: string): Promise<Doctor | undefined> {
    await mockDelay(300)
    return MOCK_DOCTORS.find(doc => doc.id === id)
  },

  async getReviews(targetId: string, type: "organization" | "doctor"): Promise<Review[]> {
    await mockDelay(300)
    if (type === "organization") {
      return MOCK_REVIEWS.filter(rev => rev.organizationId === targetId)
    } else {
      return MOCK_REVIEWS.filter(rev => rev.doctorId === targetId)
    }
  }

}
