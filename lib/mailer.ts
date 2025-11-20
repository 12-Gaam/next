import nodemailer from 'nodemailer'

interface RegistrationEmailPayload {
  to: string
  name: string
  username: string
  password: string
}

interface RegistrationStatusPayload {
  to: string
  name: string
  status: string
  notes?: string | null
}

interface OTPEmailPayload {
  to: string
  name: string
  otp: string
}

let transporter: nodemailer.Transporter | null = null

function getEmailTransporter() {
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('Email environment variables are not configured')
  }

  if (!transporter) {
    const port = Number(process.env.EMAIL_PORT || 465)
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port,
      secure: port === 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    })
  }

  return transporter
}

export async function sendRegistrationCredentialsEmail(payload: RegistrationEmailPayload) {
  const transporterInstance = getEmailTransporter()

  await transporterInstance.sendMail({
    from: `"12Gaam" <${process.env.EMAIL_USER}>`,
    to: payload.to,
    subject: 'Welcome to 12Gaam - Your Login Credentials',
    html: `
      <p>Hi ${payload.name},</p>
      <p>Thank you for registering with 12Gaam. Here are your login credentials:</p>
      <ul>
        <li><strong>Username:</strong> ${payload.username}</li>
        <li><strong>Password:</strong> ${payload.password}</li>
      </ul>
      <p>Your account is now under review by your Gaam admin. We will notify you once it has been approved.</p>
      <p>Regards,<br />12Gaam Team</p>
    `
  })
}

export async function sendRegistrationStatusEmail(payload: RegistrationStatusPayload) {
  const transporterInstance = getEmailTransporter()

  await transporterInstance.sendMail({
    from: `"12Gaam" <${process.env.EMAIL_USER}>`,
    to: payload.to,
    subject: `12Gaam Registration ${payload.status}`,
    html: `
      <p>Hi ${payload.name},</p>
      <p>Your registration status has been updated to <strong>${payload.status}</strong>.</p>
      ${
        payload.notes
          ? `<p>Notes from the admin: ${payload.notes}</p>`
          : ''
      }
      ${
        payload.status === 'Approved'
          ? `<p>You can now sign in at https://12gaam.com/join. As a member, you will use OTP-based login. When you sign in, click "Send OTP" to receive a one-time password via email.</p>`
          : `<p>You can sign in at https://12gaam.com/join once approved.</p>`
      }
      <p>Regards,<br />12Gaam Team</p>
    `
  })
}

export async function sendOTPEmail(payload: OTPEmailPayload) {
  const transporterInstance = getEmailTransporter()

  await transporterInstance.sendMail({
    from: `"12Gaam" <${process.env.EMAIL_USER}>`,
    to: payload.to,
    subject: 'Your 12Gaam Login OTP',
    html: `
      <p>Hi ${payload.name},</p>
      <p>Your login OTP is: <strong style="font-size: 24px; letter-spacing: 4px;">${payload.otp}</strong></p>
      <p>This OTP will expire in 15 minutes.</p>
      <p>If you didn't request this OTP, please ignore this email.</p>
      <p>Regards,<br />12Gaam Team</p>
    `
  })
}

