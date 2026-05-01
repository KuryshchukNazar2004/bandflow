import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

const domain = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

export const sendBookingCreatedEmail = async (
  email: string,
  clientName: string,
  bandName: string,
  date: Date
) => {
  await resend.emails.send({
    from: "BandFlow <onboarding@resend.dev>",
    to: email,
    subject: "New Booking Request",
    html: `
      <h1>New Booking Request for ${bandName}</h1>
      <p>Hello,</p>
      <p>You have a new booking request from ${clientName}.</p>
      <p>Date: ${date.toDateString()}</p>
      <p>Please log in to your dashboard to review and respond.</p>
      <a href="${domain}/dashboard/bookings">View Booking</a>
    `
  })
}

export const sendBookingStatusEmail = async (
  email: string,
  clientName: string,
  bandName: string,
  status: "CONFIRMED" | "CANCELLED",
  date: Date
) => {
  await resend.emails.send({
    from: "BandFlow <onboarding@resend.dev>",
    to: email,
    subject: `Booking ${status === "CONFIRMED" ? "Confirmed" : "Cancelled"} - ${bandName}`,
    html: `
      <h1>Booking Update</h1>
      <p>Hello ${clientName},</p>
      <p>Your booking request for ${bandName} on ${date.toDateString()} has been <strong>${status}</strong>.</p>
      <p>If you have any questions, please contact the band directly.</p>
    `
  })
}
