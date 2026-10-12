import nodemailer from 'nodemailer'

interface RegistrationEmailPayload {
  to: string
  name: string
  gaamName?: string
}

interface RegistrationStatusPayload {
  to: string
  name: string
  status: string
  username?: string
  password?: string
  notes?: string | null
}

interface OTPEmailPayload {
  to: string
  name: string
  otp: string
}

interface AdminCredentialsEmailPayload {
  to: string
  name: string
  username: string
  password: string
}

interface AdminNewRegistrationPayload {
  to: string
  adminName: string
  memberName: string
  memberEmail: string
  gaamName: string
}

let transporter: nodemailer.Transporter | null = null

function getBaseUrl(): string {
  const url = process.env.NEXTAUTH_URL || 'https://12gaam.com'
  return url.replace(/\/+$/, '')
}

function getEmailTransporter() {
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    const missingVars = []
    if (!process.env.EMAIL_HOST) missingVars.push('EMAIL_HOST')
    if (!process.env.EMAIL_USER) missingVars.push('EMAIL_USER')
    if (!process.env.EMAIL_PASS) missingVars.push('EMAIL_PASS')
    throw new Error(`Email environment variables are not configured. Missing: ${missingVars.join(', ')}`)
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

/**
 * Builds a responsive, branded HTML email template for 12Gaam Samaj.
 */
function buildEmailTemplate({
  headline,
  preheader,
  badgeText,
  badgeType = 'info',
  bodyHtml,
  callToAction
}: {
  headline: string
  preheader?: string
  badgeText?: string
  badgeType?: 'success' | 'warning' | 'danger' | 'info'
  bodyHtml: string
  callToAction?: { label: string; url: string }
}): string {
  const currentYear = new Date().getFullYear()

  // Badge styles
  const badgeStyles: Record<string, { bg: string; color: string; border: string }> = {
    success: { bg: '#ecfdf5', color: '#065f46', border: '#a7f3d0' },
    warning: { bg: '#fffbeb', color: '#92400e', border: '#fde68a' },
    danger: { bg: '#fef2f2', color: '#991b1b', border: '#fecaca' },
    info: { bg: '#eff6ff', color: '#1e40af', border: '#bfdbfe' }
  }

  const badgeStyle = badgeStyles[badgeType] || badgeStyles.info
  const baseUrl = getBaseUrl()

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${headline}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #334155;
      -webkit-font-smoothing: antialiased;
    }
    table {
      border-collapse: collapse;
    }
    img {
      border: 0;
      line-height: 100%;
      outline: none;
      text-decoration: none;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }
    .btn-primary {
      background-color: #1e3a8a;
      color: #ffffff !important;
      padding: 13px 28px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 15px;
      text-decoration: none;
      display: inline-block;
      text-align: center;
    }
    @media only screen and (max-width: 620px) {
      .email-container {
        width: 100% !important;
        border-radius: 0 !important;
      }
      .content-padding {
        padding: 24px 20px !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 24px 10px; background-color: #f1f5f9;">
  ${preheader ? `<div style="display:none;font-size:1px;color:#f1f5f9;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${preheader}</div>` : ''}

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center">
        <table role="presentation" class="email-container" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e3a8a 0%, #172554 100%); padding: 32px 30px; text-align: center;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center">
                    <span style="font-size: 28px; font-weight: 900; letter-spacing: -0.5px; color: #ffffff; text-decoration: none; display: inline-block;">
                      12<span style="color: #f59e0b;">Gaam</span> Samaj
                    </span>
                    <div style="color: rgba(255, 255, 255, 0.75); font-size: 12px; text-transform: uppercase; letter-spacing: 2px; font-weight: 600; margin-top: 6px;">
                      Community &bull; Heritage &bull; Unity
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content Body -->
          <tr>
            <td class="content-padding" style="padding: 36px 32px 28px 32px;">
              ${badgeText ? `
                <div style="margin-bottom: 20px;">
                  <span style="display: inline-block; background-color: ${badgeStyle.bg}; color: ${badgeStyle.color}; border: 1px solid ${badgeStyle.border}; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                    ${badgeText}
                  </span>
                </div>
              ` : ''}

              <h1 style="margin: 0 0 18px 0; font-size: 22px; font-weight: 700; color: #0f172a; line-height: 1.3;">
                ${headline}
              </h1>

              <div style="font-size: 15px; line-height: 1.6; color: #334155;">
                ${bodyHtml}
              </div>

              ${callToAction ? `
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 30px; margin-bottom: 12px;">
                  <tr>
                    <td align="center">
                      <a href="${callToAction.url}" target="_blank" class="btn-primary" style="background-color: #1e3a8a; color: #ffffff !important; padding: 13px 32px; border-radius: 8px; font-weight: 600; font-size: 15px; text-decoration: none; display: inline-block;">
                        ${callToAction.label} &rarr;
                      </a>
                    </td>
                  </tr>
                </table>
              ` : ''}
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 32px;">
              <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 0;">
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #f8fafc; text-align: center; color: #64748b; font-size: 12px; line-height: 1.5;">
              <p style="margin: 0 0 8px 0; font-weight: 600; color: #475569;">
                12 Gaam Samaj Community Portal
              </p>
              <p style="margin: 0; color: #94a3b8; font-size: 11px;">
                &copy; ${currentYear} 12Gaam Samaj. All rights reserved.<br>
                This is an automated system notification. Please do not reply directly to this message.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
}

/**
 * 1. Email to Member upon registration submission.
 */
export async function sendRegistrationCredentialsEmail(payload: RegistrationEmailPayload) {
  const transporterInstance = getEmailTransporter()
  const baseUrl = getBaseUrl()

  const bodyHtml = `
    <p style="margin-top: 0;">Hi <strong>${payload.name}</strong>,</p>
    <p>Thank you for submitting your registration to the <strong>12 Gaam Samaj</strong> community platform.</p>
    
    <div style="background-color: #f8fafc; border-left: 4px solid #1e3a8a; padding: 16px 18px; border-radius: 0 8px 8px 0; margin: 20px 0;">
      <p style="margin: 0 0 8px 0; font-weight: 600; color: #0f172a;">What happens next?</p>
      <p style="margin: 0; font-size: 14px; color: #475569; line-height: 1.5;">
        Your application is now under review by your Gaam administrator. Once your details are verified and approved, you will receive an email confirmation and immediate access to your dashboard and member directory.
      </p>
    </div>

    <p style="margin-bottom: 0; font-size: 14px; color: #64748b;">
      If you have questions in the meantime, please contact your local village representative.
    </p>
  `

  const html = buildEmailTemplate({
    headline: 'Registration Received & Under Review',
    preheader: `Hi ${payload.name}, your 12Gaam registration has been submitted and is under review.`,
    badgeText: 'Status: Pending Verification',
    badgeType: 'warning',
    bodyHtml,
    callToAction: {
      label: 'Visit Community Home',
      url: baseUrl
    }
  })

  await transporterInstance.sendMail({
    from: `"12Gaam Samaj" <${process.env.EMAIL_USER}>`,
    to: payload.to,
    subject: 'Welcome to 12Gaam - Registration Received',
    html
  })
}

/**
 * 2. Email to Member when approved or rejected by Gaam Admin.
 */
export async function sendRegistrationStatusEmail(payload: RegistrationStatusPayload) {
  const transporterInstance = getEmailTransporter()
  const baseUrl = getBaseUrl()
  const isApproved = payload.status === 'Approved'

  let bodyHtml = `<p style="margin-top: 0;">Hi <strong>${payload.name}</strong>,</p>`

  if (isApproved) {
    bodyHtml += `
      <p>Great news! Your registration request with <strong>12 Gaam Samaj</strong> has been reviewed and <strong style="color: #047857;">approved</strong> by your Gaam admin.</p>
      
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin: 22px 0;">
        <p style="margin: 0 0 10px 0; font-weight: 600; color: #0f172a; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">
          Your Account Details
        </p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size: 14px;">
          ${payload.username ? `
            <tr>
              <td style="padding: 6px 0; color: #64748b; width: 120px;"><strong>Username:</strong></td>
              <td style="padding: 6px 0; color: #0f172a; font-family: monospace; font-size: 15px;"><strong>${payload.username}</strong></td>
            </tr>
          ` : ''}
          <tr>
            <td style="padding: 6px 0; color: #64748b;"><strong>Email:</strong></td>
            <td style="padding: 6px 0; color: #0f172a;">${payload.to}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;"><strong>Sign-In Method:</strong></td>
            <td style="padding: 6px 0; color: #0f172a;">Instant One-Time Password (OTP) sent to your email</td>
          </tr>
        </table>
      </div>

      ${payload.notes ? `
        <div style="background-color: #eff6ff; border-left: 3px solid #3b82f6; padding: 12px 16px; border-radius: 0 6px 6px 0; margin-bottom: 20px; font-size: 14px; color: #1e40af;">
          <strong>Admin Note:</strong> ${payload.notes}
        </div>
      ` : ''}

      <p style="font-size: 14px; color: #475569;">
        You can now sign in to your dashboard to complete your family directory profile, view members, and stay connected with our community.
      </p>
    `
  } else {
    bodyHtml += `
      <p>We are writing to inform you that your registration request with <strong>12 Gaam Samaj</strong> was not approved at this time.</p>

      ${payload.notes ? `
        <div style="background-color: #fef2f2; border-left: 3px solid #ef4444; padding: 12px 16px; border-radius: 0 6px 6px 0; margin: 18px 0; font-size: 14px; color: #991b1b;">
          <strong>Reason provided by admin:</strong> ${payload.notes}
        </div>
      ` : ''}

      <p style="font-size: 14px; color: #475569;">
        If you believe this was an error or would like to provide updated details, please reach out to your local village admin or contact support.
      </p>
    `
  }

  const html = buildEmailTemplate({
    headline: isApproved ? 'Registration Approved - Welcome!' : 'Update Regarding Your Registration',
    preheader: isApproved ? `Hi ${payload.name}, your 12Gaam registration has been approved!` : `Update regarding your 12Gaam registration request.`,
    badgeText: isApproved ? 'Status: Approved' : 'Status: Rejected',
    badgeType: isApproved ? 'success' : 'danger',
    bodyHtml,
    callToAction: isApproved ? {
      label: 'Sign In to Your Dashboard',
      url: `${baseUrl}/join#login`
    } : undefined
  })

  await transporterInstance.sendMail({
    from: `"12Gaam Samaj" <${process.env.EMAIL_USER}>`,
    to: payload.to,
    subject: isApproved ? 'Welcome to 12Gaam - Account Approved' : '12Gaam Registration Status Update',
    html
  })
}

/**
 * 3. One-Time Password (OTP) Email.
 */
export async function sendOTPEmail(payload: OTPEmailPayload) {
  const transporterInstance = getEmailTransporter()

  const bodyHtml = `
    <p style="margin-top: 0;">Hi <strong>${payload.name}</strong>,</p>
    <p>Use the following verification code to complete your login to <strong>12 Gaam Samaj</strong>:</p>

    <!-- OTP Code Box -->
    <div style="margin: 28px 0; text-align: center;">
      <div style="display: inline-block; background-color: #f8fafc; border: 2px dashed #94a3b8; border-radius: 10px; padding: 16px 36px; font-family: 'Courier New', Courier, monospace; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #1e3a8a;">
        ${payload.otp}
      </div>
    </div>

    <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 12px 16px; font-size: 13px; color: #92400e; margin-bottom: 18px;">
      &#9201; <strong>Security Notice:</strong> This code is valid for <strong>15 minutes</strong>. Never share this code with anyone.
    </div>

    <p style="margin-bottom: 0; font-size: 13px; color: #64748b;">
      If you did not request this login code, you can safely ignore this email. No changes will be made to your account.
    </p>
  `

  const html = buildEmailTemplate({
    headline: 'Your Login Verification Code',
    preheader: `Your 12Gaam verification code is ${payload.otp}. Valid for 15 minutes.`,
    badgeText: 'Secure Sign-In',
    badgeType: 'info',
    bodyHtml
  })

  await transporterInstance.sendMail({
    from: `"12Gaam Samaj" <${process.env.EMAIL_USER}>`,
    to: payload.to,
    subject: `${payload.otp} is your 12Gaam login code`,
    html
  })
}

/**
 * 4. Email to new Administrator with credentials.
 */
export async function sendAdminCredentialsEmail(payload: AdminCredentialsEmailPayload) {
  const transporterInstance = getEmailTransporter()
  const baseUrl = getBaseUrl()

  const bodyHtml = `
    <p style="margin-top: 0;">Hi <strong>${payload.name}</strong>,</p>
    <p>Your administrator account for the <strong>12 Gaam Samaj Management Portal</strong> has been created.</p>

    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin: 22px 0;">
      <p style="margin: 0 0 10px 0; font-weight: 600; color: #0f172a; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">
        Administrator Credentials
      </p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size: 14px;">
        <tr>
          <td style="padding: 6px 0; color: #64748b; width: 120px;"><strong>Username:</strong></td>
          <td style="padding: 6px 0; color: #0f172a; font-family: monospace;"><strong>${payload.username}</strong></td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;"><strong>Email:</strong></td>
          <td style="padding: 6px 0; color: #0f172a;">${payload.to}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;"><strong>Temporary Password:</strong></td>
          <td style="padding: 6px 0; color: #0f172a; font-family: monospace; background-color: #fee2e2; padding: 2px 6px; border-radius: 4px; display: inline-block;">${payload.password}</td>
        </tr>
      </table>
    </div>

    <div style="background-color: #eff6ff; border-left: 3px solid #3b82f6; padding: 12px 16px; border-radius: 0 6px 6px 0; margin-bottom: 20px; font-size: 13px; color: #1e40af;">
      &#128274; <strong>Important:</strong> Please sign in and change your temporary password immediately from your profile settings.
    </div>
  `

  const html = buildEmailTemplate({
    headline: 'Administrator Account Created',
    preheader: `Hi ${payload.name}, your 12Gaam administrator credentials are ready.`,
    badgeText: 'Admin Access',
    badgeType: 'info',
    bodyHtml,
    callToAction: {
      label: 'Sign In to Admin Portal',
      url: `${baseUrl}/auth/signin`
    }
  })

  await transporterInstance.sendMail({
    from: `"12Gaam Samaj" <${process.env.EMAIL_USER}>`,
    to: payload.to,
    subject: 'Your 12Gaam Administrator Account Credentials',
    html
  })
}

/**
 * 5. Pending approvals reminder notification (cron).
 */
export async function sendPendingApprovalsNotification(payload: { to: string; name: string; gaam: string; count: number }) {
  const transporterInstance = getEmailTransporter()
  const baseUrl = getBaseUrl()

  const bodyHtml = `
    <p style="margin-top: 0;">Hi <strong>${payload.name}</strong>,</p>
    <p>You have <strong>${payload.count}</strong> pending registration request(s) for <strong>${payload.gaam}</strong> that require your review and approval.</p>

    <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 14px 18px; margin: 20px 0; font-size: 14px; color: #92400e;">
      Prompt verification ensures new families can connect with our community and access their village directory without delay.
    </div>
  `

  const html = buildEmailTemplate({
    headline: 'Pending Registrations Require Approval',
    preheader: `You have ${payload.count} pending registration(s) for ${payload.gaam}.`,
    badgeText: `${payload.count} Action Items`,
    badgeType: 'warning',
    bodyHtml,
    callToAction: {
      label: 'Review Registrations',
      url: `${baseUrl}/admin/registrations`
    }
  })

  await transporterInstance.sendMail({
    from: `"12Gaam Samaj" <${process.env.EMAIL_USER}>`,
    to: payload.to,
    subject: `Action Required: ${payload.count} Pending Registration(s) for ${payload.gaam}`,
    html
  })
}

/**
 * 6. Real-time notification to Gaam Admin / Super Admin when a new registration is submitted.
 */
export async function sendAdminNewRegistrationNotification(payload: AdminNewRegistrationPayload) {
  const transporterInstance = getEmailTransporter()
  const baseUrl = getBaseUrl()

  // Format date in USA MM/DD/YY format
  const now = new Date()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  const yy = String(now.getFullYear()).slice(-2)
  const formattedDate = `${mm}/${dd}/${yy}`

  const bodyHtml = `
    <p style="margin-top: 0;">Hi <strong>${payload.adminName}</strong>,</p>
    <p>A new member has submitted a registration request for village <strong>${payload.gaamName}</strong> and is awaiting your review:</p>

    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin: 22px 0;">
      <p style="margin: 0 0 10px 0; font-weight: 600; color: #0f172a; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">
        Applicant Details
      </p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size: 14px;">
        <tr>
          <td style="padding: 6px 0; color: #64748b; width: 110px;"><strong>Full Name:</strong></td>
          <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${payload.memberName}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;"><strong>Email:</strong></td>
          <td style="padding: 6px 0; color: #0f172a;">${payload.memberEmail}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;"><strong>Gaam (Village):</strong></td>
          <td style="padding: 6px 0; color: #1e3a8a; font-weight: 600;">${payload.gaamName}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;"><strong>Submitted:</strong></td>
          <td style="padding: 6px 0; color: #475569;">${formattedDate}</td>
        </tr>
      </table>
    </div>

    <p style="font-size: 14px; color: #475569;">
      Please click below to verify the member's details and approve or reject the application.
    </p>
  `

  const html = buildEmailTemplate({
    headline: 'New Registration Request',
    preheader: `New registration from ${payload.memberName} for ${payload.gaamName}.`,
    badgeText: 'New Request',
    badgeType: 'warning',
    bodyHtml,
    callToAction: {
      label: 'Review & Verify Registration',
      url: `${baseUrl}/admin/registrations`
    }
  })

  await transporterInstance.sendMail({
    from: `"12Gaam Samaj" <${process.env.EMAIL_USER}>`,
    to: payload.to,
    subject: `New Registration Request: ${payload.memberName} (${payload.gaamName})`,
    html
  })
}
