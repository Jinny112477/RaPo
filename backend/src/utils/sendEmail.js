import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, text }) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // app password (NOT your real password)
    },
  });

  await transporter.sendMail({
    from: `"RaPO" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
  });
};