import type { Doctor } from "@/components/healthcare/cards";

export const mockDoctors: Doctor[] = [
  {
    id: "doc_1",
    name: "Sarah Chen",
    specialization: "Cardiologist",
    location: "Metro Heart Institute, NY",
    rating: 4.9,
    reviews: 128,
    availableNext: "Today, 2:00 PM",
    imageUrl: "https://i.pravatar.cc/150?u=sarah"
  },
  {
    id: "doc_2",
    name: "James Wilson",
    specialization: "General Physician",
    location: "City Health Clinic",
    rating: 4.7,
    reviews: 84,
    availableNext: "Tomorrow, 10:00 AM",
    imageUrl: "https://i.pravatar.cc/150?u=james"
  },
  {
    id: "doc_3",
    name: "Priya Sharma",
    specialization: "Dermatologist",
    location: "SkinCare Center",
    rating: 4.8,
    reviews: 215,
    availableNext: "Today, 4:30 PM",
    imageUrl: "https://i.pravatar.cc/150?u=priya"
  }
];

export const mockReviews = [
  {
    id: "rev_1",
    author: "M. Thompson",
    rating: 5,
    date: "2 days ago",
    text: "The AI symptom checker was incredibly accurate. It recommended I see a cardiologist, and I booked Dr. Chen on the same day. Life saver.",
    verified: true,
  },
  {
    id: "rev_2",
    author: "S. Patel",
    rating: 5,
    date: "1 week ago",
    text: "Finally, an app where I can explain my symptoms in Gujarati. The doctor understood my issue perfectly before I even stepped into the clinic.",
    verified: true,
  },
  {
    id: "rev_3",
    author: "D. Garcia",
    rating: 4,
    date: "3 weeks ago",
    text: "The medicine reminders keep me on track. I used to forget my evening dose, but Medireach pings me right after dinner.",
    verified: true,
  }
];

export const mockAiChat = [
  { sender: "ai", text: "Hi there. I'm Medireach AI. How are you feeling today?" },
  { sender: "user", text: "I've had this really sharp pain on the right side of my stomach since yesterday." },
  { sender: "ai", text: "I'm sorry to hear that. Just to understand better, is the pain constant or does it come and go?" },
  { sender: "user", text: "It's pretty constant, and it hurts more when I move." }
];

export const mockAiChatGujarati = [
  { sender: "ai", text: "નમસ્તે. હું મેડીરીચ AI છું. આજે તમને કેવું લાગે છે?" },
  { sender: "user", text: "ગઈ કાલથી મારા પેટની જમણી બાજુએ ખૂબ જ દુખાવો થાય છે." },
  { sender: "ai", text: "મને તે સાંભળીને ખેદ છે. વધુ સારી રીતે સમજવા માટે, શું પીડા સતત રહે છે કે આવ-જા કરે છે?" },
  { sender: "user", text: "તે સતત છે, અને જ્યારે હું હલનચલન કરું છું ત્યારે વધુ દુખે છે." }
];

export const mockMedicineSchedule = [
  { id: "med_1", name: "Amoxicillin", dose: "500mg", time: "08:00 AM", instruction: "After food", status: "TAKEN" },
  { id: "med_2", name: "Paracetamol", dose: "650mg", time: "02:00 PM", instruction: "Before food", status: "UPCOMING" },
  { id: "med_3", name: "Amoxicillin", dose: "500mg", time: "08:00 PM", instruction: "After food", status: "UPCOMING" },
];
