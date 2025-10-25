import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: any[];
}

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  secure: process.env.EMAIL_SERVER_PORT === '465', // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

export async function sendEmail({ to, subject, html, attachments }: EmailOptions) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
      attachments,
    });
    console.log(`E-mail enviado para ${to}: ${subject}`);
  } catch (error) {
    console.error(`Erro ao enviar e-mail para ${to}:`, error);
    throw new Error(`Falha ao enviar e-mail: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}
