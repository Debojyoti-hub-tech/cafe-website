import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// Create transporter lazily so env vars are always loaded first
const getTransporter = () =>
  nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASS,
    },
  });

export const sendOtpEmail = async (to, otp, purpose = "booking") => {
  const purposeLabel =
    purpose === "order" ? "place your order" : "confirm your table reservation";

  // Debug — will print in your terminal so you can confirm values loaded
  console.log("📧 Sending OTP to:", to);
  console.log("📧 SMTP_EMAIL:", process.env.SMTP_EMAIL);
  console.log("📧 SMTP_PASS set:", !!process.env.SMTP_PASS);

  await getTransporter().sendMail({
    from: `"Café Lumière" <${process.env.SMTP_EMAIL}>`,
    to,
    subject: `Your Café Lumière Verification Code`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 480px; margin: auto; padding: 32px; background: #fdf6ee; border-radius: 16px; border: 1px solid #e8d8c0;">
        <h2 style="color: #1a0f0a; font-size: 28px; margin-bottom: 4px;">☕ Café Lumière</h2>
        <p style="color: #6b4c3a; margin-bottom: 24px; font-size: 15px;">Your verification code to ${purposeLabel}:</p>
        <div style="background: #1a0f0a; color: #c8882a; font-size: 36px; letter-spacing: 12px; text-align: center; padding: 20px; border-radius: 12px; font-family: monospace; font-weight: bold;">
          ${otp}
        </div>
        <p style="color: #888; font-size: 13px; margin-top: 20px;">This code expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
        <hr style="border: none; border-top: 1px solid #e8d8c0; margin: 24px 0;" />
        <p style="color: #bbb; font-size: 12px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
};
