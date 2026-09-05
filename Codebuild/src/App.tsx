import React from "react"
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom"
import { AppShell } from "./components/layout/AppShell"
import DesignSystem from "./pages/DesignSystem"
import LandingPage from "./pages/LandingPage"
import { Toaster } from "react-hot-toast"

// Auth Pages
import { AuthProvider, useAuth } from "./lib/auth/AuthContext"
import LoginPage from "./pages/auth/LoginPage"
import RegisterPage from "./pages/auth/RegisterPage"
import JoinOrganizationPage from "./pages/auth/JoinOrganizationPage"
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage"
import ResetPasswordPage from "./pages/auth/ResetPasswordPage"
import VerifyAccountPage from "./pages/auth/VerifyAccountPage"

import { LanguageProvider } from "./lib/i18n/LanguageContext"
import LanguageSelectionPage from "./pages/onboarding/LanguageSelectionPage"
import { LocationProvider } from "./lib/location/LocationContext"
import LocationSelectionPage from "./pages/onboarding/LocationSelectionPage"
import { ChatProvider } from "./lib/chat/ChatContext"
import PatientChatPage from "./pages/patient/PatientChatPage"
import PatientMapPage from "./pages/patient/PatientMapPage"
import PatientBookingPage from "./pages/patient/PatientBookingPage"
import PatientAppointmentHub from "./pages/patient/PatientAppointmentHub"
import PatientSchedulePage from "./pages/patient/PatientSchedulePage"
import PatientProfilePage from "./pages/patient/PatientProfilePage"
import PatientMedicalHistoryPage from "./pages/patient/PatientMedicalHistoryPage"
import PatientReviewCenter from "./pages/patient/PatientReviewCenter"

import DoctorDashboardPage from "./pages/doctor/DoctorDashboardPage"
import DoctorAppointmentsPage from "./pages/doctor/DoctorAppointmentsPage"
import DoctorAppointmentDetailPage from "./pages/doctor/DoctorAppointmentDetailPage"
import DoctorPatientsPage from "./pages/doctor/DoctorPatientsPage"
import DoctorPatientDetailPage from "./pages/doctor/DoctorPatientDetailPage"
import DoctorSchedulePage from "./pages/doctor/DoctorSchedulePage"
import DoctorProfilePage from "./pages/doctor/DoctorProfilePage"
import DoctorFeedbackDashboard from "./pages/doctor/DoctorFeedbackDashboard"
import PatientScannerPage from "./pages/doctor/PatientScannerPage"

import OrgDashboardPage from "./pages/organization/OrgDashboardPage"
import OrgAppointmentsPage from "./pages/organization/OrgAppointmentsPage"
import OrgDoctorsPage from "./pages/organization/OrgDoctorsPage"
import OrgReceptionistsPage from "./pages/organization/OrgReceptionistsPage"
import OrgServicesPage from "./pages/organization/OrgServicesPage"
import OrgFeedbackPage from "./pages/organization/OrgFeedbackPage"
import OrgBillingPage from "./pages/organization/OrgBillingPage"
import OrgProfilePage from "./pages/organization/OrgProfilePage"
import OrgSettingsPage from "./pages/organization/OrgSettingsPage"

// Receptionist Pages
import ReceptionistDashboardPage from "./pages/receptionist/ReceptionistDashboardPage"
import ReceptionistAppointmentsPage from "./pages/receptionist/ReceptionistAppointmentsPage"
import ReceptionistAppointmentDetailPage from "./pages/receptionist/ReceptionistAppointmentDetailPage"
import ReceptionistPatientsPage from "./pages/receptionist/ReceptionistPatientsPage"
import ReceptionistPatientDetailPage from "./pages/receptionist/ReceptionistPatientDetailPage"
import ReceptionistSchedulePage from "./pages/receptionist/ReceptionistSchedulePage"
import ReceptionistOrganizationPage from "./pages/receptionist/ReceptionistOrganizationPage"
import ReceptionistProfilePage from "./pages/receptionist/ReceptionistProfilePage"

// Admin Pages
import { AdminLayout } from "./components/admin/AdminLayout"
import AdminDashboardPage from "./pages/admin/AdminDashboardPage"
import OrganizationsPage from "./pages/admin/organizations/OrganizationsPage"
import AddOrganizationPage from "./pages/admin/organizations/AddOrganizationPage"
import OrganizationDetailPage from "./pages/admin/organizations/OrganizationDetailPage"
import AdminDoctorsPage from "./pages/admin/doctors/AdminDoctorsPage"
import AdminReceptionistsPage from "./pages/admin/receptionists/AdminReceptionistsPage"
import AdminPatientsPage from "./pages/admin/patients/AdminPatientsPage"
import AdminAppointmentsPage from "./pages/admin/appointments/AdminAppointmentsPage"
import AdminListingsPage from "./pages/admin/listings/AdminListingsPage"
import AdminSubscriptionsPage from "./pages/admin/subscriptions/AdminSubscriptionsPage"
import AdminSettingsPage from "./pages/admin/settings/AdminSettingsPage"

// Notification Context
import { NotificationProvider } from "./lib/notifications/NotificationContext"
import NotificationCenterPage from "./pages/notifications/NotificationCenterPage"
import NotificationPreferencesPage from "./pages/notifications/NotificationPreferencesPage"

// Telemedicine Page
import TelemedicinePage from "./pages/telemedicine/TelemedicinePage"

// Reviews
import { ReviewProvider } from "./lib/reviews/ReviewContext"

// Protected Route Wrapper
const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}

// Redirect based on active role
const AppIndexRedirect = () => {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role === "PATIENT") return <Navigate to="/app/patient" replace />
  if (user.role === "DOCTOR") return <Navigate to="/app/doctor" replace />
  if (user.role === "RECEPTIONIST") return <Navigate to="/app/receptionist" replace />
  if (user.role === "ORGANIZATION") return <Navigate to="/app/organization" replace />
  if (user.role === "ADMIN") return <Navigate to="/admin" replace />
  return <Navigate to="/app/patient" replace />
}

// Redirect if already authenticated
const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user, isLoading } = useAuth()
  
  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

  if (isAuthenticated && user) {
    if (user.role === "PATIENT") {
      const hasOnboardedLanguage = localStorage.getItem("medireach_language")
      const hasOnboardedLocation = localStorage.getItem("medireach_location")
      
      if (!hasOnboardedLanguage) {
        return <Navigate to="/onboarding/language" replace />
      }
      if (!hasOnboardedLocation) {
        return <Navigate to="/onboarding/location" replace />
      }
      return <Navigate to="/app/patient" replace />
    }
    if (user.role === "DOCTOR") return <Navigate to="/app/doctor" replace />
    if (user.role === "RECEPTIONIST") return <Navigate to="/app/receptionist" replace />
    if (user.role === "ORGANIZATION") return <Navigate to="/app/organization" replace />
    if (user.role === "ADMIN") return <Navigate to="/admin" replace />
    return <Navigate to="/app/patient" replace />
  }

  return <>{children}</>
}

// Placeholder pages
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center h-full min-h-[50vh]">
    <div className="text-center space-y-2">
      <h2 className="text-2xl font-heading font-semibold text-muted-foreground">{title}</h2>
      <p className="text-muted-foreground">This feature is not yet implemented.</p>
    </div>
  </div>
)

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
      <LanguageProvider>
        <LocationProvider>
          <ChatProvider>
            <ReviewProvider>
            <BrowserRouter>
          <Routes>
            {/* Public Landing Route */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/design-system" element={<DesignSystem />} />
            
            {/* Auth & Registration Routes */}
            <Route path="/login" element={<AuthRoute><LoginPage /></AuthRoute>} />
            <Route path="/register" element={<AuthRoute><RegisterPage /></AuthRoute>} />
            <Route path="/join-organization" element={<AuthRoute><JoinOrganizationPage /></AuthRoute>} />
            <Route path="/register/organization" element={<AuthRoute><JoinOrganizationPage /></AuthRoute>} />
            <Route path="/forgot-password" element={<AuthRoute><ForgotPasswordPage /></AuthRoute>} />
            <Route path="/reset-password" element={<AuthRoute><ResetPasswordPage /></AuthRoute>} />
            <Route path="/verify-account" element={<AuthRoute><VerifyAccountPage /></AuthRoute>} />
            
            {/* Onboarding Routes (Protected, Patient Only for now) */}
            <Route path="/onboarding" element={<ProtectedRoute />}>
              <Route index element={<Navigate to="/onboarding/language" replace />} />
              <Route path="language" element={<LanguageSelectionPage />} />
              <Route path="location" element={<LocationSelectionPage />} />
            </Route>

            {/* Notification Routes */}
            <Route path="/notifications" element={<ProtectedRoute />}>
              <Route element={<AppShell />}>
                <Route index element={<NotificationCenterPage />} />
                <Route path="preferences" element={<NotificationPreferencesPage />} />
              </Route>
            </Route>

            {/* Telemedicine Route */}
            <Route path="/telemedicine/:appointmentId" element={<ProtectedRoute />}>
              <Route index element={<TelemedicinePage />} />
            </Route>
            <Route path="/app/telemedicine/:appointmentId" element={<ProtectedRoute />}>
              <Route index element={<TelemedicinePage />} />
            </Route>

            {/* Protected App Routes */}
            <Route path="/app" element={<ProtectedRoute />}>
              <Route element={<AppShell />}>
                <Route index element={<AppIndexRedirect />} />
                
                {/* Patient Routes */}
                <Route path="patient">
                  <Route index element={<PatientChatPage />} />
                  <Route path="chat" element={<Navigate to="/app/patient" replace />} />
                  <Route path="map" element={<PatientMapPage />} />
                  <Route path="book/:doctorId" element={<PatientBookingPage />} />
                  <Route path="appointments">
                    <Route index element={<PatientAppointmentHub />} />
                    <Route path=":appointmentId" element={<PatientAppointmentHub />} />
                  </Route>
                  <Route path="schedule" element={<PatientSchedulePage />} />
                  <Route path="profile">
                    <Route index element={<PatientProfilePage />} />
                    <Route path="history" element={<PatientMedicalHistoryPage />} />
                  </Route>
                  <Route path="reviews" element={<PatientReviewCenter />} />
                </Route>

                {/* Doctor Routes */}
                <Route path="doctor">
                  <Route index element={<DoctorDashboardPage />} />
                  <Route path="appointments" element={<DoctorAppointmentsPage />} />
                  <Route path="appointments/:id" element={<DoctorAppointmentDetailPage />} />
                  <Route path="patients">
                    <Route index element={<DoctorPatientsPage />} />
                    <Route path=":patientId" element={<DoctorPatientDetailPage />} />
                  </Route>
                  <Route path="scanner" element={<PatientScannerPage />} />
                  <Route path="schedule" element={<DoctorSchedulePage />} />
                  <Route path="profile" element={<DoctorProfilePage />} />
                  <Route path="feedback" element={<DoctorFeedbackDashboard />} />
                </Route>
                
                {/* Organization Routes */}
                <Route path="organization">
                  <Route index element={<OrgDashboardPage />} />
                  <Route path="dashboard" element={<OrgDashboardPage />} />
                  <Route path="appointments" element={<OrgAppointmentsPage />} />
                  <Route path="doctors" element={<OrgDoctorsPage />} />
                  <Route path="receptionists" element={<OrgReceptionistsPage />} />
                  <Route path="services" element={<OrgServicesPage />} />
                  <Route path="feedback" element={<OrgFeedbackPage />} />
                  <Route path="billing" element={<OrgBillingPage />} />
                  <Route path="profile" element={<OrgProfilePage />} />
                  <Route path="settings" element={<OrgSettingsPage />} />
                </Route>

                {/* Receptionist Routes */}
                <Route path="receptionist">
                  <Route index element={<ReceptionistDashboardPage />} />
                  <Route path="dashboard" element={<ReceptionistDashboardPage />} />
                  <Route path="appointments" element={<ReceptionistAppointmentsPage />} />
                  <Route path="appointments/:id" element={<ReceptionistAppointmentDetailPage />} />
                  <Route path="patients" element={<ReceptionistPatientsPage />} />
                  <Route path="patients/:id" element={<ReceptionistPatientDetailPage />} />
                  <Route path="scanner" element={<PatientScannerPage />} />
                  <Route path="schedule" element={<ReceptionistSchedulePage />} />
                  <Route path="organization" element={<ReceptionistOrganizationPage />} />
                  <Route path="profile" element={<ReceptionistProfilePage />} />
                </Route>
              </Route>
            </Route>

            {/* Admin Routes - Separate from AppShell */}
            <Route path="/admin" element={<ProtectedRoute />}>
              <Route element={<AdminLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboardPage />} />
                <Route path="organizations" element={<OrganizationsPage />} />
                <Route path="organizations/new" element={<AddOrganizationPage />} />
                <Route path="organizations/:organizationId" element={<OrganizationDetailPage />} />
                <Route path="doctors" element={<AdminDoctorsPage />} />
                <Route path="receptionists" element={<AdminReceptionistsPage />} />
                <Route path="patients" element={<AdminPatientsPage />} />
                <Route path="appointments" element={<AdminAppointmentsPage />} />
                <Route path="listings" element={<AdminListingsPage />} />
                <Route path="subscriptions" element={<AdminSubscriptionsPage />} />
                <Route path="settings" element={<AdminSettingsPage />} />
              </Route>
            </Route>
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <Toaster position="top-right" />
          </BrowserRouter>
          </ReviewProvider>
          </ChatProvider>
        </LocationProvider>
      </LanguageProvider>
      </NotificationProvider>
    </AuthProvider>
  )
}

