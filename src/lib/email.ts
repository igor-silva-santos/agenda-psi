import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
  secure: process.env.EMAIL_SERVER_PORT === '465', // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: Array<{ filename: string; content: string | Buffer; contentType?: string }>;
}

export async function sendEmail({ to, subject, html, text, attachments }: SendEmailOptions) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>?/gm, ''),
      attachments,
    });
    console.log(`Email enviado para ${to}: ${subject}`);
  } catch (error) {
    console.error(`Erro ao enviar email para ${to}:`, error);
    throw new Error(`Falha ao enviar email: ${error}`);
  }
}