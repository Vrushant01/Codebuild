import { Resend } from "resend"

const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  if (apiKey && apiKey.startsWith("re_")) {
    return new Resend(apiKey)
  }
  return null
}

export interface MedicationReminderEmailOptions {
  to: string
  patientName: string
  medicineName: string
  dosage: string
  scheduledTime: string
  foodInstruction: string
  instructions?: string
  reminderType?: "10_MIN_PRIOR" | "EXACT_TIME"
}

export async function sendMedicationReminderEmail(options: MedicationReminderEmailOptions): Promise<{ success: boolean; id?: string; error?: string }> {
  const {
    to,
    patientName,
    medicineName,
    dosage,
    scheduledTime,
    foodInstruction,
    instructions,
    reminderType = "EXACT_TIME"
  } = options

  const is10Min = reminderType === "10_MIN_PRIOR"
  const subject = is10Min
    ? `⏰ Reminder: Take ${medicineName} in 10 minutes (${scheduledTime})`
    : `💊 Time to take your medicine: ${medicineName} (${scheduledTime})`

  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173"
  const scheduleUrl = `${clientUrl}/app/patient/schedule`

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px 12px; color: #1e293b;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); border: 1px solid #e2e8f0;">
        
        <!-- Header -->
        <tr>
          <td style="padding: 28px 32px; background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%); text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">MEDIREACH</h1>
            <p style="color: #ccfbf1; margin: 4px 0 0 0; font-size: 13px; font-weight: 500;">Your Personal Healthcare Schedule</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding: 32px 32px 24px 32px;">
            <p style="font-size: 16px; margin: 0 0 16px 0; color: #334155;">
              Hello <strong>${patientName || "Patient"}</strong>,
            </p>
            <p style="font-size: 15px; margin: 0 0 24px 0; color: #475569; line-height: 1.5;">
              ${
                is10Min
                  ? `This is a reminder that your medication dose is coming up in <strong>10 minutes</strong> at <strong>${scheduledTime}</strong>.`
                  : `It is now <strong>${scheduledTime}</strong>. It's time to take your scheduled medication.`
              }
            </p>

            <!-- Medication Card -->
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f0fdfa; border: 1.5px solid #99f6e4; border-radius: 12px; margin-bottom: 24px;">
              <tr>
                <td style="padding: 20px;">
                  <div style="font-size: 20px; font-weight: 700; color: #0f766e; margin-bottom: 8px;">
                    💊 ${medicineName}
                  </div>
                  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 14px; color: #334155;">
                    <tr>
                      <td style="padding: 4px 0; width: 110px; color: #64748b; font-weight: 600;">Dosage:</td>
                      <td style="padding: 4px 0; font-weight: 700; color: #0f172a;">${dosage}</td>
                    </tr>
                    <tr>
                      <td style="padding: 4px 0; color: #64748b; font-weight: 600;">Time:</td>
                      <td style="padding: 4px 0; font-weight: 700; color: #0f766e;">${scheduledTime}</td>
                    </tr>
                    <tr>
                      <td style="padding: 4px 0; color: #64748b; font-weight: 600;">Instruction:</td>
                      <td style="padding: 4px 0; font-weight: 600; color: #0f172a;">${foodInstruction}</td>
                    </tr>
                    ${
                      instructions
                        ? `
                    <tr>
                      <td style="padding: 4px 0; color: #64748b; font-weight: 600;">Special note:</td>
                      <td style="padding: 4px 0; font-style: italic; color: #b45309;">${instructions}</td>
                    </tr>`
                        : ""
                    }
                  </table>
                </td>
              </tr>
            </table>

            <!-- Button CTA -->
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 28px 0 16px 0;">
              <tr>
                <td align="center">
                  <a href="${scheduleUrl}" style="background-color: #0d9488; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 700; font-size: 15px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(13, 148, 136, 0.2);">
                    Open Schedule & Mark as Taken →
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding: 20px 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8;">
            <p style="margin: 0 0 6px 0;">
              MEDIREACH Healthcare Accessibility Platform • Always follow doctor guidance.
            </p>
            <p style="margin: 0;">
              Manage your notifications in your <a href="${scheduleUrl}" style="color: #0d9488; text-decoration: underline;">account preferences</a>.
            </p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `

  const resend = getResendClient()
  const fromEmail = process.env.RESEND_FROM_EMAIL || "MEDIREACH <onboarding@resend.dev>"
  const deliverTo = to.trim()

  if (resend) {
    try {
      const { data, error } = await resend.emails.send({
        from: fromEmail,
        to: [deliverTo],
        subject,
        html: htmlContent
      })

      if (error) {
        console.error("❌ Resend API Error:", error)
        return { success: false, error: error.message }
      }

      console.log(`✅ Resend Medication Email sent successfully to ${deliverTo}! Message ID: ${data?.id}`)
      return { success: true, id: data?.id }
    } catch (err: any) {
      console.error("❌ Failed to send email via Resend:", err)
      return { success: false, error: err.message || "Failed to send email" }
    }
  } else {
    console.log(`ℹ️ [Resend Ready] Email generated for ${to} (${subject}). Provide RESEND_API_KEY in server/.env to deliver live emails.`)
    return { success: true, id: `simulated_${Date.now()}` }
  }
}

export interface AppointmentEmailOptions {
  to: string
  patientName: string
  doctorName: string
  organizationName: string
  date: string
  timeStr: string
  consultationType: string
  notes?: string
  telemedicineRoomId?: string
}

// 📧 Resend Email: Appointment Accepted -> Patient Notification
export async function sendAppointmentAcceptedEmailToPatient(options: AppointmentEmailOptions): Promise<{ success: boolean; id?: string; error?: string }> {
  const {
    to,
    patientName,
    doctorName,
    organizationName,
    date,
    timeStr,
    consultationType,
    telemedicineRoomId
  } = options

  const subject = `✅ Appointment Confirmed with ${doctorName} on ${date} at ${timeStr}`
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173"
  const hubUrl = `${clientUrl}/app/patient/schedule`

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>${subject}</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px 12px; color: #1e293b;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0;">
        <tr>
          <td style="padding: 28px 32px; background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%); text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800;">MEDIREACH</h1>
            <p style="color: #ccfbf1; margin: 4px 0 0 0; font-size: 13px; font-weight: 500;">Appointment Confirmation</p>
          </td>
        </tr>
        <tr>
          <td style="padding: 32px;">
            <p style="font-size: 16px; margin: 0 0 16px 0; color: #334155;">
              Hello <strong>${patientName || "Patient"}</strong>,
            </p>
            <p style="font-size: 15px; margin: 0 0 20px 0; color: #475569; line-height: 1.5;">
              Great news! Your consultation request has been <strong>ACCEPTED and CONFIRMED</strong> by <strong>${doctorName}</strong>.
            </p>

            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f0fdfa; border: 1.5px solid #99f6e4; border-radius: 12px; margin-bottom: 24px; padding: 16px;">
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: 600; font-size: 14px; width: 130px;">Doctor:</td>
                <td style="padding: 6px 0; font-weight: 700; color: #0f766e; font-size: 15px;">${doctorName}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: 600; font-size: 14px;">Hospital / Clinic:</td>
                <td style="padding: 6px 0; font-weight: 600; color: #0f172a; font-size: 14px;">${organizationName}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: 600; font-size: 14px;">Date:</td>
                <td style="padding: 6px 0; font-weight: 700; color: #0f172a; font-size: 14px;">📅 ${date}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: 600; font-size: 14px;">Time Slot:</td>
                <td style="padding: 6px 0; font-weight: 700; color: #0d9488; font-size: 14px;">⏰ ${timeStr}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: 600; font-size: 14px;">Consultation Type:</td>
                <td style="padding: 6px 0; font-weight: 700; color: #0f172a; font-size: 14px;">${consultationType}</td>
              </tr>
            </table>

            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 24px 0 12px 0;">
              <tr>
                <td align="center">
                  <a href="${hubUrl}" style="background-color: #0d9488; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 700; font-size: 15px; display: inline-block;">
                    View in Appointment Hub →
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding: 16px 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8;">
            MEDIREACH Healthcare Accessibility • Please arrive 10 minutes early.
          </td>
        </tr>
      </table>
    </body>
    </html>
  `

  const resend = getResendClient()
  const fromEmail = process.env.RESEND_FROM_EMAIL || "MEDIREACH <onboarding@resend.dev>"
  const deliverTo = to.trim()

  if (resend) {
    try {
      const { data, error } = await resend.emails.send({
        from: fromEmail,
        to: [deliverTo],
        subject,
        html: htmlContent
      })
      if (error) {
        console.error("❌ Resend Patient Confirmation Error:", error)
        return { success: false, error: error.message }
      }
      console.log(`✅ Resend Patient Appointment Email sent to ${deliverTo}! ID: ${data?.id}`)
      return { success: true, id: data?.id }
    } catch (err: any) {
      console.error("❌ Resend Patient Appointment Error:", err)
      return { success: false, error: err.message }
    }
  } else {
    console.log(`ℹ️ [Resend Ready] Patient Confirmation sent to ${deliverTo} (${subject})`)
    return { success: true, id: `simulated_${Date.now()}` }
  }
}

// 📧 Resend Email: Appointment Accepted -> Doctor Notification
export async function sendAppointmentAcceptedEmailToDoctor(options: AppointmentEmailOptions): Promise<{ success: boolean; id?: string; error?: string }> {
  const {
    to,
    doctorName,
    patientName,
    organizationName,
    date,
    timeStr,
    consultationType,
    notes
  } = options

  const subject = `📅 New Confirmed Appointment: ${patientName} on ${date} at ${timeStr}`
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173"
  const doctorHubUrl = `${clientUrl}/app/doctor/appointments`

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>${subject}</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px 12px; color: #1e293b;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0;">
        <tr>
          <td style="padding: 28px 32px; background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%); text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800;">MEDIREACH</h1>
            <p style="color: #ccfbf1; margin: 4px 0 0 0; font-size: 13px; font-weight: 500;">Doctor Schedule Update</p>
          </td>
        </tr>
        <tr>
          <td style="padding: 32px;">
            <p style="font-size: 16px; margin: 0 0 16px 0; color: #334155;">
              Dear <strong>${doctorName}</strong>,
            </p>
            <p style="font-size: 15px; margin: 0 0 20px 0; color: #475569; line-height: 1.5;">
              You have a confirmed patient consultation on your calendar:
            </p>

            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 12px; margin-bottom: 24px; padding: 16px;">
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: 600; font-size: 14px; width: 130px;">Patient:</td>
                <td style="padding: 6px 0; font-weight: 700; color: #0f172a; font-size: 15px;">${patientName}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: 600; font-size: 14px;">Date:</td>
                <td style="padding: 6px 0; font-weight: 700; color: #0f172a; font-size: 14px;">📅 ${date}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: 600; font-size: 14px;">Time:</td>
                <td style="padding: 6px 0; font-weight: 700; color: #0d9488; font-size: 14px;">⏰ ${timeStr}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: 600; font-size: 14px;">Consultation:</td>
                <td style="padding: 6px 0; font-weight: 700; color: #0f172a; font-size: 14px;">${consultationType}</td>
              </tr>
              ${notes ? `
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: 600; font-size: 14px;">Patient Notes:</td>
                <td style="padding: 6px 0; font-style: italic; color: #334155; font-size: 14px;">${notes}</td>
              </tr>` : ""}
            </table>

            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 24px 0 12px 0;">
              <tr>
                <td align="center">
                  <a href="${doctorHubUrl}" style="background-color: #0d9488; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 700; font-size: 15px; display: inline-block;">
                    Open Doctor Appointment Hub →
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `

  const resend = getResendClient()
  const fromEmail = process.env.RESEND_FROM_EMAIL || "MEDIREACH <onboarding@resend.dev>"
  const deliverTo = to.trim()

  if (resend) {
    try {
      const { data, error } = await resend.emails.send({
        from: fromEmail,
        to: [deliverTo],
        subject,
        html: htmlContent
      })
      if (error) {
        console.error("❌ Resend Doctor Confirmation Error:", error)
        return { success: false, error: error.message }
      }
      console.log(`✅ Resend Doctor Appointment Email sent to ${deliverTo}! ID: ${data?.id}`)
      return { success: true, id: data?.id }
    } catch (err: any) {
      console.error("❌ Resend Doctor Appointment Error:", err)
      return { success: false, error: err.message }
    }
  } else {
    console.log(`ℹ️ [Resend Ready] Doctor Confirmation sent to ${deliverTo} (${subject})`)
    return { success: true, id: `simulated_${Date.now()}` }
  }
}
