import type { Doctor } from "@/components/healthcare/cards";

export const mockDoctors: Doctor[] = [
  {
    id: "doc_1",
    name: "Dr. Aarav Patel",
    specialization: "Cardiologist",
    location: "Ahmedabad Multi-Specialty Hospital, Ahmedabad",
    rating: 4.9,
    reviews: 184,
    availableNext: "Today, 2:00 PM",
    imageUrl: "/images/doctor_aarav.jpg"
  },
  {
    id: "doc_2",
    name: "Dr. Hiren Kevadiya",
    specialization: "Interventional Cardiologist",
    location: "Kiran Multi Super Speciality Hospital, Surat",
    rating: 4.9,
    reviews: 240,
    availableNext: "Tomorrow, 10:00 AM",
    imageUrl: "/images/doctor_hiren.jpg"
  },
  {
    id: "doc_3",
    name: "Dr. Priya Sharma",
    specialization: "Dermatologist & Skin Care",
    location: "Apollo Clinic & Skin Care, Ahmedabad",
    rating: 4.8,
    reviews: 215,
    availableNext: "Today, 4:30 PM",
    imageUrl: "/images/doctor_priya.jpg"
  }
];

export const mockReviews = [
  {
    id: "rev_1",
    author: "Mitesh Patel",
    rating: 5,
    date: "2 days ago",
    text: "The AI symptom checker was incredibly accurate. It recommended I see a cardiologist, and I booked Dr. Aarav Patel on the same day. Life saver.",
    verified: true,
  },
  {
    id: "rev_2",
    author: "Sanjay Shah",
    rating: 5,
    date: "1 week ago",
    text: "Finally, an app where I can explain my symptoms in Gujarati. Dr. Hiren Kevadiya understood my issue perfectly before I even stepped into the clinic.",
    verified: true,
  },
  {
    id: "rev_3",
    author: "Deepa Desai",
    rating: 5,
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
