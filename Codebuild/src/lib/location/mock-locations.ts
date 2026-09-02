export interface LocationData {
  id: string
  label: string
  city: string
  region: string
  country: string
  latitude: number
  longitude: number
  source: "device" | "manual"
}

export const MOCK_LOCATIONS: Omit<LocationData, "source">[] = [
  {
    id: "loc_ahmedabad",
    label: "Ahmedabad, Gujarat",
    city: "Ahmedabad",
    region: "Gujarat",
    country: "India",
    latitude: 23.0225,
    longitude: 72.5714,
  },
  {
    id: "loc_surat",
    label: "Surat, Gujarat",
    city: "Surat",
    region: "Gujarat",
    country: "India",
    latitude: 21.1702,
    longitude: 72.8311,
  },
  {
    id: "loc_rajkot",
    label: "Rajkot, Gujarat",
    city: "Rajkot",
    region: "Gujarat",
    country: "India",
    latitude: 22.3039,
    longitude: 70.8022,
  },
  {
    id: "loc_vadodara",
    label: "Vadodara, Gujarat",
    city: "Vadodara",
    region: "Gujarat",
    country: "India",
    latitude: 22.3072,
    longitude: 73.1812,
  },
  {
    id: "loc_mumbai",
    label: "Mumbai, Maharashtra",
    city: "Mumbai",
    region: "Maharashtra",
    country: "India",
    latitude: 19.0760,
    longitude: 72.8777,
  },
  {
    id: "loc_delhi",
    label: "New Delhi, Delhi",
    city: "New Delhi",
    region: "Delhi",
    country: "India",
    latitude: 28.6139,
    longitude: 77.2090,
  }
]
