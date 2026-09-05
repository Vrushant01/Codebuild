import mongoose from "mongoose"
import bcrypt from "bcryptjs"
import dotenv from "dotenv"

import { User } from "./models/User.js"
import { Patient } from "./models/Patient.js"
import { Organization } from "./models/Organization.js"
import { Doctor } from "./models/Doctor.js"
import { Receptionist } from "./models/Receptionist.js"
import { Appointment } from "./models/Appointment.js"
import { Schedule } from "./models/Schedule.js"
import { MedicalCase } from "./models/MedicalCase.js"
import { MedicineSchedule } from "./models/MedicineSchedule.js"
import { Allergy } from "./models/Allergy.js"
import { Review } from "./models/Review.js"
import { Notification } from "./models/Notification.js"
import { Subscription } from "./models/Subscription.js"

dotenv.config()

export const syncOrganizationUsers = async () => {
  try {
    const salt = await bcrypt.genSalt(10)
    const commonPasswordHash = await bcrypt.hash("password123", salt)

    // Ensure Admin User
    let admin = await User.findOne({ email: "admin@medireach.demo" })
    if (!admin) {
      admin = await User.create({
        name: "Medireach Admin",
        email: "admin@medireach.demo",
        phone: "9999999999",
        passwordHash: commonPasswordHash,
        role: "ADMIN",
        accountStatus: "active"
      })
    }

    const unlinkedOrgs = await Organization.find({ $or: [{ userId: { $exists: false } }, { userId: null }] })
    if (unlinkedOrgs.length === 0) return

    for (const org of unlinkedOrgs) {
      const email = org.contact?.email ? org.contact.email.toLowerCase().trim() : `org_${org._id.toString().substring(0, 6)}@medireach.demo`
      let user = await User.findOne({ email })
      if (!user) {
        user = await User.create({
          name: org.name,
          email,
          phone: org.contact?.phone || "9876543210",
          passwordHash: commonPasswordHash,
          role: "ORGANIZATION",
          accountStatus: org.listingStatus === "PENDING" ? "pending" : "active"
        })
      }
      org.userId = user._id
      await org.save()
    }
  } catch (err) {
    console.warn("Error syncing organization users:", err)
  }
}

export const seedDatabase = async (force: boolean = false) => {
  const orgCount = await Organization.countDocuments()
  if (!force && orgCount > 0) {
    console.log("ℹ️ Database already contains organizations. Syncing organization user accounts...")
    await syncOrganizationUsers()
    return
  }

  try {
    console.log("🌱 Clearing and seeding fresh healthcare dataset...")
    await Promise.all([
      User.deleteMany({}),
      Patient.deleteMany({}),
      Organization.deleteMany({}),
      Doctor.deleteMany({}),
      Receptionist.deleteMany({}),
      Appointment.deleteMany({}),
      Schedule.deleteMany({}),
      MedicalCase.deleteMany({}),
      MedicineSchedule.deleteMany({}),
      Allergy.deleteMany({}),
      Review.deleteMany({}),
      Notification.deleteMany({}),
      Subscription.deleteMany({})
    ])

    const salt = await bcrypt.genSalt(10)
    const commonPasswordHash = await bcrypt.hash("password123", salt)

    // 1. Patient User
    const patientUser = await User.create({
      name: "Alex Johnson",
      email: "patient@medireach.demo",
      phone: "9876543210",
      passwordHash: commonPasswordHash,
      role: "PATIENT",
      preferredLanguage: "en",
      accountStatus: "active"
    })

    const patient = await Patient.create({
      userId: patientUser._id,
      patientId: "PAT-8F2A91",
      name: patientUser.name,
      email: patientUser.email,
      phone: patientUser.phone,
      qrCodeToken: "medireach_qr_8f2a91_secure_pat_token",
      allergies: ["Penicillin", "Peanuts"],
      bloodGroup: "O+",
      city: "Ahmedabad",
      preferredLanguage: "en",
      emergencyContact: {
        name: "Sarah Johnson",
        relationship: "Spouse",
        phone: "9876543211"
      }
    })

    // 2. Organizations
    // Ahmedabad
    const org1 = await Organization.create({
      name: "Ahmedabad Multi-Specialty Hospital",
      type: "Hospital",
      address: "12 University Road, Navrangpura",
      city: "Ahmedabad",
      state: "Gujarat",
      pincode: "380009",
      location: { lat: 23.0374, lng: 72.5522 },
      contact: { phone: "+91 79 2630 1100", email: "info@ahmedabadhospital.org" },
      specializations: ["Cardiology", "General Medicine", "Orthopedics", "Pediatrics"],
      receptionistEnabled: true,
      telemedicineEnabled: true,
      workingHours: {
        open: "09:00 AM",
        close: "08:00 PM",
        days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
      },
      rating: 4.8,
      reviewCount: 142,
      listingStatus: "ACTIVE"
    })

    const org2 = await Organization.create({
      name: "Apollo Care Clinic Bodakdev",
      type: "Clinic",
      address: "401 Pride Square, Judges Bungalow Road, Bodakdev",
      city: "Ahmedabad",
      state: "Gujarat",
      pincode: "380054",
      location: { lat: 23.0416, lng: 72.5074 },
      contact: { phone: "+91 79 4000 5000", email: "contact@apollocarebodakdev.com" },
      specializations: ["Dermatology", "General Medicine", "Pediatrics"],
      receptionistEnabled: true,
      telemedicineEnabled: true,
      workingHours: {
        open: "09:00 AM",
        close: "02:00 PM",
        days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
      },
      rating: 4.9,
      reviewCount: 88,
      listingStatus: "ACTIVE"
    })

    // Surat Top Hospitals
    const orgSurat1 = await Organization.create({
      name: "Kiran Multi Super Speciality Hospital",
      type: "Hospital",
      address: "Vasta Devdi Rd, Near Sumul Dairy Road, Katargam",
      city: "Surat",
      state: "Gujarat",
      pincode: "395004",
      location: { lat: 21.2226, lng: 72.8339 },
      contact: { phone: "+91 261 716 1111", email: "info@kiranhospital.com" },
      specializations: ["Cardiology", "Neurology", "Orthopedics", "General Medicine", "Oncology"],
      receptionistEnabled: true,
      telemedicineEnabled: true,
      workingHours: { open: "Open 24 Hours", close: "Open 24 Hours", days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] },
      rating: 4.8,
      reviewCount: 58200,
      listingStatus: "ACTIVE"
    })

    const orgSurat2 = await Organization.create({
      name: "Shalby Multi-Specialty Hospital",
      type: "Hospital",
      address: "Nr. Navyug College, Rander Rd",
      city: "Surat",
      state: "Gujarat",
      pincode: "395009",
      location: { lat: 21.1985, lng: 72.7981 },
      contact: { phone: "+91 261 711 7000", email: "contact@shalbysurat.com" },
      specializations: ["Orthopedics", "Cardiology", "General Medicine", "Gastroenterology"],
      receptionistEnabled: true,
      telemedicineEnabled: true,
      workingHours: { open: "Open 24 Hours", close: "Open 24 Hours", days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] },
      rating: 4.8,
      reviewCount: 13400,
      listingStatus: "ACTIVE"
    })

    const orgSurat3 = await Organization.create({
      name: "Universal Hospital | Multispeciality & Trauma",
      type: "Hospital",
      address: "Ring Rd, near Sub-Jail",
      city: "Surat",
      state: "Gujarat",
      pincode: "395002",
      location: { lat: 21.1895, lng: 72.8423 },
      contact: { phone: "+91 261 717 0000", email: "care@universalhospitalsurat.com" },
      specializations: ["General Medicine", "Trauma", "Critical Care", "Gynecology"],
      receptionistEnabled: true,
      telemedicineEnabled: true,
      workingHours: { open: "Open 24 Hours", close: "Open 24 Hours", days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] },
      rating: 4.7,
      reviewCount: 1150,
      listingStatus: "ACTIVE"
    })

    const orgSurat4 = await Organization.create({
      name: "Smt. Rasilaben Sevantilal Shah Venus Hospital",
      type: "Hospital",
      address: "Ashakatashram Campus, SRSS Venus Hospital, Lal Darwaja",
      city: "Surat",
      state: "Gujarat",
      pincode: "395003",
      location: { lat: 21.2052, lng: 72.8270 },
      contact: { phone: "+91 261 241 1234", email: "info@venushospital.org" },
      specializations: ["General Medicine", "Pediatrics", "Cardiology", "Surgery"],
      receptionistEnabled: true,
      telemedicineEnabled: true,
      workingHours: { open: "Open 24 Hours", close: "Open 24 Hours", days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] },
      rating: 4.9,
      reviewCount: 4820,
      listingStatus: "ACTIVE"
    })

    const orgSurat5 = await Organization.create({
      name: "LifeLine Multispeciality Hospital",
      type: "Hospital",
      address: "Palanpur Jakatnaka, Rander Road",
      city: "Surat",
      state: "Gujarat",
      pincode: "395009",
      location: { lat: 21.2180, lng: 72.7885 },
      contact: { phone: "+91 261 277 8899", email: "info@lifelinesurat.com" },
      specializations: ["General Medicine", "Orthopedics", "ENT"],
      receptionistEnabled: true,
      telemedicineEnabled: true,
      workingHours: { open: "Open 24 Hours", close: "Open 24 Hours", days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] },
      rating: 4.7,
      reviewCount: 2300,
      listingStatus: "ACTIVE"
    })

    const orgSurat6 = await Organization.create({
      name: "BAPS Pramukh Swami Hospital",
      type: "Hospital",
      address: "Anand Mahal Road, Adajan",
      city: "Surat",
      state: "Gujarat",
      pincode: "395009",
      location: { lat: 21.1920, lng: 72.7925 },
      contact: { phone: "+91 261 278 0000", email: "care@bapshospitalsurat.org" },
      specializations: ["Cardiology", "Nephrology", "General Medicine", "Pediatrics"],
      receptionistEnabled: true,
      telemedicineEnabled: true,
      workingHours: { open: "Open 24 Hours", close: "Open 24 Hours", days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] },
      rating: 4.8,
      reviewCount: 9400,
      listingStatus: "ACTIVE"
    })

    const orgSurat7 = await Organization.create({
      name: "Apple Maitreya Hospital",
      type: "Hospital",
      address: "Ring Road, near Khatodara GIDC, Majura Gate",
      city: "Surat",
      state: "Gujarat",
      pincode: "395002",
      location: { lat: 21.1730, lng: 72.8210 },
      contact: { phone: "+91 261 260 0000", email: "contact@applemaitreya.com" },
      specializations: ["Cardiology", "Oncology", "Critical Care", "Neurology"],
      receptionistEnabled: true,
      telemedicineEnabled: true,
      workingHours: { open: "Open 24 Hours", close: "Open 24 Hours", days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] },
      rating: 4.6,
      reviewCount: 3100,
      listingStatus: "ACTIVE"
    })

    const orgSurat8 = await Organization.create({
      name: "Unity Hospital & Unity Trauma Centre",
      type: "Hospital",
      address: "Aai Mata Road, Parvat Patiya",
      city: "Surat",
      state: "Gujarat",
      pincode: "395010",
      location: { lat: 21.1905, lng: 72.8680 },
      contact: { phone: "+91 261 234 5678", email: "support@unityhospital.in" },
      specializations: ["Trauma", "Orthopedics", "General Medicine", "Neurosurgery"],
      receptionistEnabled: true,
      telemedicineEnabled: true,
      workingHours: { open: "Open 24 Hours", close: "Open 24 Hours", days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] },
      rating: 4.7,
      reviewCount: 2850,
      listingStatus: "ACTIVE"
    })

    const orgSurat9 = await Organization.create({
      name: "Unique Hospital & Research Centre",
      type: "Hospital",
      address: "Civil Char Rasta, Near Ghod Dod Road",
      city: "Surat",
      state: "Gujarat",
      pincode: "395007",
      location: { lat: 21.1620, lng: 72.8080 },
      contact: { phone: "+91 261 224 8800", email: "help@uniquehospital.org" },
      specializations: ["Urology", "Gastroenterology", "General Medicine"],
      receptionistEnabled: true,
      telemedicineEnabled: true,
      workingHours: { open: "Open 24 Hours", close: "Open 24 Hours", days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] },
      rating: 4.6,
      reviewCount: 1900,
      listingStatus: "ACTIVE"
    })

    const orgSurat10 = await Organization.create({
      name: "Mahavir Hospital & Heart Institute",
      type: "Hospital",
      address: "Athwa Gate, Ring Road, Nanpura",
      city: "Surat",
      state: "Gujarat",
      pincode: "395001",
      location: { lat: 21.1810, lng: 72.8055 },
      contact: { phone: "+91 261 247 1100", email: "info@mahavirhospital.org" },
      specializations: ["Cardiology", "Cardiac Surgery", "General Medicine"],
      receptionistEnabled: true,
      telemedicineEnabled: true,
      workingHours: { open: "Open 24 Hours", close: "Open 24 Hours", days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] },
      rating: 4.7,
      reviewCount: 5600,
      listingStatus: "ACTIVE"
    })

    const orgSurat11 = await Organization.create({
      name: "Param Superspeciality Hospital",
      type: "Clinic",
      address: "Katargam Main Road",
      city: "Surat",
      state: "Gujarat",
      pincode: "395004",
      location: { lat: 21.2150, lng: 72.8390 },
      contact: { phone: "+91 261 254 3322", email: "contact@paramhospital.com" },
      specializations: ["General Medicine", "Pediatrics", "Dermatology"],
      receptionistEnabled: true,
      telemedicineEnabled: true,
      workingHours: { open: "09:00 AM", close: "08:00 PM", days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] },
      rating: 4.6,
      reviewCount: 1400,
      listingStatus: "ACTIVE"
    })

    const orgSurat12 = await Organization.create({
      name: "Velocity Multispeciality Hospital",
      type: "Hospital",
      address: "Gaurav Path, Adajan",
      city: "Surat",
      state: "Gujarat",
      pincode: "395009",
      location: { lat: 21.1970, lng: 72.7840 },
      contact: { phone: "+91 261 276 9900", email: "care@velocityhospital.com" },
      specializations: ["General Medicine", "Orthopedics", "Gynecology"],
      receptionistEnabled: true,
      telemedicineEnabled: true,
      workingHours: { open: "Open 24 Hours", close: "Open 24 Hours", days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] },
      rating: 4.8,
      reviewCount: 2100,
      listingStatus: "ACTIVE"
    })

    const orgSurat13 = await Organization.create({
      name: "Nirmal Super Speciality Hospital",
      type: "Hospital",
      address: "Near Prime Arcade, Anand Mahal Road, Adajan",
      city: "Surat",
      state: "Gujarat",
      pincode: "395009",
      location: { lat: 21.1950, lng: 72.7890 },
      contact: { phone: "+91 261 279 5500", email: "info@nirmalhospital.com" },
      specializations: ["Pediatrics", "Neonatology", "General Medicine"],
      receptionistEnabled: true,
      telemedicineEnabled: true,
      workingHours: { open: "Open 24 Hours", close: "Open 24 Hours", days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] },
      rating: 4.7,
      reviewCount: 1800,
      listingStatus: "ACTIVE"
    })

    // 3. Doctors
    // Ahmedabad Org 1 Doctors
    const docUser1 = await User.create({
      name: "Dr. Sarah Smith",
      email: "doctor@medireach.demo",
      phone: "9876543212",
      passwordHash: commonPasswordHash,
      role: "DOCTOR",
      preferredLanguage: "en",
      accountStatus: "active"
    })

    const doc1 = await Doctor.create({
      userId: docUser1._id,
      organizationId: org1._id,
      name: docUser1.name,
      specialization: "Cardiology",
      qualifications: ["MBBS", "MD (Cardiology)", "FACC"],
      experienceYears: 14,
      consultationFee: 800,
      telemedicineAvailable: true,
      bio: "Senior Consultant Cardiologist with extensive experience in cardiovascular therapies.",
      rating: 4.9,
      reviewCount: 95,
      workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      workingHours: { start: "09:00", end: "17:00" },
      slotDurationMinutes: 30
    })

    const docUser2 = await User.create({
      name: "Dr. Aarav Patel",
      email: "aarav.patel@medireach.demo",
      phone: "9876543213",
      passwordHash: commonPasswordHash,
      role: "DOCTOR",
      preferredLanguage: "gu",
      accountStatus: "active"
    })

    const doc2 = await Doctor.create({
      userId: docUser2._id,
      organizationId: org1._id,
      name: docUser2.name,
      specialization: "General Medicine",
      qualifications: ["MBBS", "MD (General Medicine)"],
      experienceYears: 9,
      consultationFee: 500,
      telemedicineAvailable: true,
      bio: "Expert physician treating chronic ailments, diabetes management and hypertension.",
      rating: 4.8,
      reviewCount: 47,
      workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      workingHours: { start: "10:00", end: "18:00" },
      slotDurationMinutes: 30
    })

    // Kiran Hospital Doctors (Surat Org 1)
    const kiranDoc1User = await User.create({
      name: "Dr. Hiren Kevadiya",
      email: "hiren.k@kiranhospital.demo",
      phone: "9876543220",
      passwordHash: commonPasswordHash,
      role: "DOCTOR",
      preferredLanguage: "gu",
      accountStatus: "active"
    })
    await Doctor.create({
      userId: kiranDoc1User._id,
      organizationId: orgSurat1._id,
      name: kiranDoc1User.name,
      specialization: "Cardiology",
      qualifications: ["MBBS", "MD", "DM (Cardiology)"],
      experienceYears: 16,
      consultationFee: 700,
      telemedicineAvailable: true,
      bio: "Chief of Interventional Cardiology at Kiran Hospital with 15+ years of clinical excellence.",
      rating: 4.9,
      reviewCount: 420,
      workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      workingHours: { start: "09:00", end: "18:00" },
      slotDurationMinutes: 30
    })

    const kiranDoc2User = await User.create({
      name: "Dr. Meera Patel",
      email: "meera.p@kiranhospital.demo",
      phone: "9876543221",
      passwordHash: commonPasswordHash,
      role: "DOCTOR",
      preferredLanguage: "gu",
      accountStatus: "active"
    })
    await Doctor.create({
      userId: kiranDoc2User._id,
      organizationId: orgSurat1._id,
      name: kiranDoc2User.name,
      specialization: "General Medicine",
      qualifications: ["MBBS", "MD (Internal Medicine)"],
      experienceYears: 11,
      consultationFee: 500,
      telemedicineAvailable: true,
      bio: "Senior consultant in internal medicine, managing lifestyle diseases, fever, and metabolic health.",
      rating: 4.8,
      reviewCount: 290,
      workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      workingHours: { start: "10:00", end: "19:00" },
      slotDurationMinutes: 30
    })

    const kiranDoc3User = await User.create({
      name: "Dr. Ketan Chodvadiya",
      email: "ketan.c@kiranhospital.demo",
      phone: "9876543222",
      passwordHash: commonPasswordHash,
      role: "DOCTOR",
      preferredLanguage: "gu",
      accountStatus: "active"
    })
    await Doctor.create({
      userId: kiranDoc3User._id,
      organizationId: orgSurat1._id,
      name: kiranDoc3User.name,
      specialization: "Neurology",
      qualifications: ["MBBS", "MS", "MCh (Neurosurgery)"],
      experienceYears: 14,
      consultationFee: 900,
      telemedicineAvailable: true,
      bio: "Renowned neurosurgeon specializing in brain and spine surgeries.",
      rating: 4.9,
      reviewCount: 180,
      workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      workingHours: { start: "09:30", end: "16:30" },
      slotDurationMinutes: 30
    })

    // Shalby Hospital Doctors (Surat Org 2)
    const shalbyDocUser = await User.create({
      name: "Dr. Vikramaditya Shah",
      email: "vikram.shah@shalby.demo",
      phone: "9876543223",
      passwordHash: commonPasswordHash,
      role: "DOCTOR",
      preferredLanguage: "en",
      accountStatus: "active"
    })
    await Doctor.create({
      userId: shalbyDocUser._id,
      organizationId: orgSurat2._id,
      name: shalbyDocUser.name,
      specialization: "Orthopedics",
      qualifications: ["MBBS", "MS (Orthopedics)", "MCh"],
      experienceYears: 20,
      consultationFee: 850,
      telemedicineAvailable: true,
      bio: "Pioneer in zero-technique joint replacement and orthopedic trauma surgery.",
      rating: 4.9,
      reviewCount: 650,
      workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      workingHours: { start: "09:00", end: "17:00" },
      slotDurationMinutes: 30
    })

    // Universal Hospital Doctors (Surat Org 3)
    const universalDocUser = await User.create({
      name: "Dr. Jayesh Vaghela",
      email: "jayesh.v@universal.demo",
      phone: "9876543224",
      passwordHash: commonPasswordHash,
      role: "DOCTOR",
      preferredLanguage: "gu",
      accountStatus: "active"
    })
    await Doctor.create({
      userId: universalDocUser._id,
      organizationId: orgSurat3._id,
      name: universalDocUser.name,
      specialization: "General Medicine",
      qualifications: ["MBBS", "MD"],
      experienceYears: 10,
      consultationFee: 450,
      telemedicineAvailable: true,
      bio: "Expert in acute trauma management, general medicine, and emergency triage.",
      rating: 4.7,
      reviewCount: 180,
      workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      workingHours: { start: "08:00", end: "16:00" },
      slotDurationMinutes: 30
    })

    // Venus Hospital Doctors (Surat Org 4)
    const venusDocUser = await User.create({
      name: "Dr. Pooja Mehta",
      email: "pooja.m@venus.demo",
      phone: "9876543225",
      passwordHash: commonPasswordHash,
      role: "DOCTOR",
      preferredLanguage: "gu",
      accountStatus: "active"
    })
    await Doctor.create({
      userId: venusDocUser._id,
      organizationId: orgSurat4._id,
      name: venusDocUser.name,
      specialization: "Pediatrics",
      qualifications: ["MBBS", "DCH", "MD (Pediatrics)"],
      experienceYears: 14,
      consultationFee: 550,
      telemedicineAvailable: true,
      bio: "Specialist in newborn child health, immunization, and pediatric development.",
      rating: 4.9,
      reviewCount: 310,
      workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      workingHours: { start: "10:00", end: "18:00" },
      slotDurationMinutes: 30
    })

    // LifeLine Hospital (Surat Org 5)
    const lifelineDocUser = await User.create({
      name: "Dr. Ankit Patel",
      email: "ankit.p@lifeline.demo",
      phone: "9876543226",
      passwordHash: commonPasswordHash,
      role: "DOCTOR",
      preferredLanguage: "gu",
      accountStatus: "active"
    })
    await Doctor.create({
      userId: lifelineDocUser._id,
      organizationId: orgSurat5._id,
      name: lifelineDocUser.name,
      specialization: "Orthopedics",
      qualifications: ["MBBS", "MS (Ortho)"],
      experienceYears: 12,
      consultationFee: 600,
      telemedicineAvailable: true,
      bio: "Specialist in fracture treatments, arthritis, and spine rehabilitation.",
      rating: 4.7,
      reviewCount: 150,
      workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      workingHours: { start: "09:00", end: "17:00" },
      slotDurationMinutes: 30
    })

    // BAPS Hospital (Surat Org 6)
    const bapsDocUser = await User.create({
      name: "Dr. Shailesh Kakadiya",
      email: "shailesh.k@baps.demo",
      phone: "9876543227",
      passwordHash: commonPasswordHash,
      role: "DOCTOR",
      preferredLanguage: "gu",
      accountStatus: "active"
    })
    await Doctor.create({
      userId: bapsDocUser._id,
      organizationId: orgSurat6._id,
      name: bapsDocUser.name,
      specialization: "Nephrology",
      qualifications: ["MBBS", "MD", "DM (Nephrology)"],
      experienceYears: 18,
      consultationFee: 850,
      telemedicineAvailable: true,
      bio: "Senior nephrologist with extensive expertise in dialysis and kidney care.",
      rating: 4.8,
      reviewCount: 280,
      workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      workingHours: { start: "09:00", end: "16:00" },
      slotDurationMinutes: 30
    })

    // Apple Maitreya Hospital (Surat Org 7)
    const appleDocUser = await User.create({
      name: "Dr. Dharmesh Surati",
      email: "dharmesh.s@applemaitreya.demo",
      phone: "9876543228",
      passwordHash: commonPasswordHash,
      role: "DOCTOR",
      preferredLanguage: "gu",
      accountStatus: "active"
    })
    await Doctor.create({
      userId: appleDocUser._id,
      organizationId: orgSurat7._id,
      name: appleDocUser.name,
      specialization: "Cardiology",
      qualifications: ["MBBS", "MD", "FACC"],
      experienceYears: 15,
      consultationFee: 800,
      telemedicineAvailable: true,
      bio: "Expert in cardiovascular critical care, angiography, and pacemakers.",
      rating: 4.6,
      reviewCount: 190,
      workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      workingHours: { start: "10:00", end: "18:00" },
      slotDurationMinutes: 30
    })

    // Unity Hospital (Surat Org 8)
    const unityDocUser = await User.create({
      name: "Dr. Hardik Savani",
      email: "hardik.s@unity.demo",
      phone: "9876543229",
      passwordHash: commonPasswordHash,
      role: "DOCTOR",
      preferredLanguage: "gu",
      accountStatus: "active"
    })
    await Doctor.create({
      userId: unityDocUser._id,
      organizationId: orgSurat8._id,
      name: unityDocUser.name,
      specialization: "Trauma & Neurosurgery",
      qualifications: ["MBBS", "MS", "MCh"],
      experienceYears: 13,
      consultationFee: 750,
      telemedicineAvailable: true,
      bio: "Specializing in emergency trauma care, head injury rehabilitation, and spine surgery.",
      rating: 4.7,
      reviewCount: 220,
      workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      workingHours: { start: "09:00", end: "17:00" },
      slotDurationMinutes: 30
    })

    // Unique Hospital (Surat Org 9)
    const uniqueDocUser = await User.create({
      name: "Dr. Ramesh Jariwala",
      email: "ramesh.j@unique.demo",
      phone: "9876543231",
      passwordHash: commonPasswordHash,
      role: "DOCTOR",
      preferredLanguage: "gu",
      accountStatus: "active"
    })
    await Doctor.create({
      userId: uniqueDocUser._id,
      organizationId: orgSurat9._id,
      name: uniqueDocUser.name,
      specialization: "Urology",
      qualifications: ["MBBS", "MS", "MCh (Urology)"],
      experienceYears: 17,
      consultationFee: 800,
      telemedicineAvailable: true,
      bio: "Expert urologist & andrologist specializing in laser stone removal and prostate therapies.",
      rating: 4.8,
      reviewCount: 210,
      workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      workingHours: { start: "10:00", end: "18:00" },
      slotDurationMinutes: 30
    })

    // Mahavir Hospital (Surat Org 10)
    const mahavirDocUser = await User.create({
      name: "Dr. Sunil Kanani",
      email: "sunil.k@mahavir.demo",
      phone: "9876543232",
      passwordHash: commonPasswordHash,
      role: "DOCTOR",
      preferredLanguage: "gu",
      accountStatus: "active"
    })
    await Doctor.create({
      userId: mahavirDocUser._id,
      organizationId: orgSurat10._id,
      name: mahavirDocUser.name,
      specialization: "Cardiology",
      qualifications: ["MBBS", "MD", "DM (Cardiology)"],
      experienceYears: 19,
      consultationFee: 850,
      telemedicineAvailable: true,
      bio: "Senior cardiologist with over 5,000 successful coronary interventions.",
      rating: 4.9,
      reviewCount: 380,
      workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      workingHours: { start: "09:00", end: "17:00" },
      slotDurationMinutes: 30
    })

    // Param Superspeciality (Surat Org 11)
    const paramDocUser = await User.create({
      name: "Dr. Bhavna Gondaliya",
      email: "bhavna.g@param.demo",
      phone: "9876543233",
      passwordHash: commonPasswordHash,
      role: "DOCTOR",
      preferredLanguage: "gu",
      accountStatus: "active"
    })
    await Doctor.create({
      userId: paramDocUser._id,
      organizationId: orgSurat11._id,
      name: paramDocUser.name,
      specialization: "Dermatology",
      qualifications: ["MBBS", "DDVL"],
      experienceYears: 11,
      consultationFee: 500,
      telemedicineAvailable: true,
      bio: "Specialist dermatologist offering clinical allergy and cosmetic consultations.",
      rating: 4.7,
      reviewCount: 160,
      workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      workingHours: { start: "10:00", end: "16:00" },
      slotDurationMinutes: 30
    })

    // Velocity Hospital (Surat Org 12)
    const velocityDocUser = await User.create({
      name: "Dr. Dipen Vashi",
      email: "dipen.v@velocity.demo",
      phone: "9876543234",
      passwordHash: commonPasswordHash,
      role: "DOCTOR",
      preferredLanguage: "gu",
      accountStatus: "active"
    })
    await Doctor.create({
      userId: velocityDocUser._id,
      organizationId: orgSurat12._id,
      name: velocityDocUser.name,
      specialization: "Orthopedics",
      qualifications: ["MBBS", "MS (Ortho)"],
      experienceYears: 13,
      consultationFee: 650,
      telemedicineAvailable: true,
      bio: "Orthopedic surgeon managing sports injuries, joint arthroscopy, and spine care.",
      rating: 4.8,
      reviewCount: 230,
      workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      workingHours: { start: "09:00", end: "17:00" },
      slotDurationMinutes: 30
    })

    // Nirmal Hospital (Surat Org 13)
    const nirmalDocUser = await User.create({
      name: "Dr. Nirmal Choksi",
      email: "nirmal.c@nirmal.demo",
      phone: "9876543235",
      passwordHash: commonPasswordHash,
      role: "DOCTOR",
      preferredLanguage: "gu",
      accountStatus: "active"
    })
    await Doctor.create({
      userId: nirmalDocUser._id,
      organizationId: orgSurat13._id,
      name: nirmalDocUser.name,
      specialization: "Pediatrics",
      qualifications: ["MBBS", "MD (Pediatrics)", "FIAP"],
      experienceYears: 22,
      consultationFee: 600,
      telemedicineAvailable: true,
      bio: "Senior pediatrician and neonatologist leading comprehensive child wellness care.",
      rating: 4.9,
      reviewCount: 410,
      workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      workingHours: { start: "09:00", end: "18:00" },
      slotDurationMinutes: 30
    })

    // Apollo Care Clinic Bodakdev (Ahmedabad Org 2)
    const apolloDocUser = await User.create({
      name: "Dr. Ananya Shah",
      email: "ananya.shah@apollocare.demo",
      phone: "9876543230",
      passwordHash: commonPasswordHash,
      role: "DOCTOR",
      preferredLanguage: "en",
      accountStatus: "active"
    })
    await Doctor.create({
      userId: apolloDocUser._id,
      organizationId: org2._id,
      name: apolloDocUser.name,
      specialization: "Dermatology",
      qualifications: ["MBBS", "DDVL", "MD"],
      experienceYears: 10,
      consultationFee: 600,
      telemedicineAvailable: true,
      bio: "Consultant dermatologist and cosmetologist with advanced laser certifications.",
      rating: 4.9,
      reviewCount: 140,
      workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      workingHours: { start: "10:00", end: "16:00" },
      slotDurationMinutes: 30
    })

    // 4. Receptionist
    const recUser = await User.create({
      name: "Priya Sharma",
      email: "receptionist@medireach.demo",
      phone: "9876543214",
      passwordHash: commonPasswordHash,
      role: "RECEPTIONIST",
      preferredLanguage: "en",
      accountStatus: "active"
    })

    await Receptionist.create({
      userId: recUser._id,
      organizationId: org1._id,
      name: recUser.name,
      email: recUser.email,
      phone: recUser.phone,
      permissions: {
        manageAppointments: true,
        manageSchedule: true,
        viewPatientBasicInfo: true,
        manageOrgDetails: false
      }
    })

    // 5. Admin
    await User.create({
      name: "System Administrator",
      email: "admin@medireach.demo",
      phone: "9876543215",
      passwordHash: commonPasswordHash,
      role: "ADMIN",
      preferredLanguage: "en",
      accountStatus: "active"
    })

    // 6. Appointments
    const apt1 = await Appointment.create({
      patientId: patient._id,
      patientUserId: patientUser._id,
      patientName: patientUser.name,
      patientPhone: patientUser.phone,
      doctorId: doc1._id,
      organizationId: org1._id,
      date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
      startTime: "10:30 AM",
      endTime: "11:00 AM",
      type: "Online",
      appointmentFor: "Myself",
      status: "CONFIRMED",
      attendanceStatus: "UNKNOWN",
      fee: 800,
      paymentStatus: "paid",
      telemedicineRoomId: "tele_medireach_live_room_001"
    })

    const aptCompleted = await Appointment.create({
      patientId: patient._id,
      patientUserId: patientUser._id,
      patientName: patientUser.name,
      patientPhone: patientUser.phone,
      doctorId: doc1._id,
      organizationId: org1._id,
      date: "2026-08-20",
      startTime: "11:00 AM",
      endTime: "11:30 AM",
      type: "Physical",
      appointmentFor: "Myself",
      status: "COMPLETED",
      attendanceStatus: "YES",
      fee: 800,
      paymentStatus: "paid"
    })

    // 7. Verified Review for completed appointment
    await Review.create({
      appointmentId: aptCompleted._id,
      patientUserId: patientUser._id,
      patientName: patientUser.name,
      doctorId: doc1._id,
      organizationId: org1._id,
      rating: 5,
      comment: "Dr. Sarah Smith was exceptionally attentive and precise. The hospital facility was clean and organized.",
      verified: true
    })

    // 8. Medicine Schedule
    // (No fake medicines seeded - clean real data only)

    // 9. Allergies
    await Allergy.create({
      patientId: patient._id,
      patientUserId: patientUser._id,
      allergyName: "Penicillin",
      reactionDescription: "Skin rash and mild facial swelling.",
      severity: "severe",
      diagnosedDate: "2024-05-12"
    })

    await Allergy.create({
      patientId: patient._id,
      patientUserId: patientUser._id,
      allergyName: "Peanuts",
      reactionDescription: "Itching and throat irritation.",
      severity: "moderate",
      diagnosedDate: "2022-09-10"
    })

    // 10. Medical Cases
    await MedicalCase.create({
      patientId: patient._id,
      doctorId: doc1._id,
      organizationId: org1._id,
      appointmentId: aptCompleted._id,
      title: "Lipid Profile & Preventive Cardiology",
      diagnosis: "Hyperlipidemia with mild hypertension",
      treatment: "Lifestyle modifications, reduced sodium diet, and lipid lowering statin therapy.",
      symptoms: ["Occasional palpitations", "Fatigue"],
      notes: "Patient advised 30 minutes daily walking and re-evaluation in 3 months.",
      status: "active",
      date: "2026-08-20",
      prescribedMedicines: [
        { name: "Atorvastatin 20mg", dosage: "20mg", frequency: "Once daily", duration: "90 days" }
      ]
    })

    console.log("🎉 Seed database created successfully with 4 user roles & healthcare data!")
  } catch (err: any) {
    console.error("❌ Seeding error:", err.message)
  }
}

// Direct execution
if (process.argv[1]?.endsWith("seed.ts") || process.argv[1]?.endsWith("seed.js")) {
  mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/healthcare_db").then(() => {
    seedDatabase(true).then(() => process.exit(0)).catch(() => process.exit(1))
  })
}
