declare module 'nodemailer' {
  interface SendMailOptions {
    from?: string
    to?: string
    subject?: string
    html?: string
  }

  interface Transporter {
    sendMail(options: SendMailOptions): Promise<any>
  }

  interface TransportOptions {
    host: string
    port: number
    secure?: boolean
    auth?: {
      user: string
      pass: string
    }
  }

  export function createTransport(options: TransportOptions): Transporter
}

