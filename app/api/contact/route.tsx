import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,                          // e.g. smtp.ipage.com
  port: Number(process.env.SMTP_PORT || 587),           // usually 587 or 465
  secure: process.env.SMTP_SECURE === "true",            // true if port 465, else false
  auth: {
    user: process.env.SMTP_USER_ADMIN,                   // SMTP login email, e.g. admin@actfast.ca
    pass: process.env.SMTP_PASS_ADMIN,                   // SMTP login password
  },
});

export async function POST(req: Request) {
  try {
    const { fullName, phoneNumber, email, category, message } = await req.json();

    if (!fullName?.trim() || !phoneNumber?.trim() || !message?.trim()) {
      return NextResponse.json(
        { error: "Full Name, Phone Number, and Message are required." },
        { status: 400 }
      );
    }

    // Build subject line
    const subject = `${fullName} - ${category} - ${phoneNumber}`;

    // Build the HTML email body
    const htmlBody = `
      <h2>Contact Us Form Submission</h2>
      <p><strong>Full Name:</strong> ${fullName}</p>
      <p><strong>Phone Number:</strong> ${phoneNumber}</p>
      <p><strong>Email:</strong> ${email || "N/A"}</p>
      <p><strong>Category:</strong> ${category}</p>
      <p><strong>Message:</strong><br/>${message.replace(/\n/g, "<br/>")}</p>
      <hr/>
      <p>This message was sent from the ActFast website Contact Us form.</p>
      ${email ? `<p><em>Reply to: ${email}</em></p>` : ""}
    `;

    // Send the email
    await transporter.sendMail({
      from: `"ActFast Website" <info@actfast.ca>`,  // <-- This controls what appears as "From"
      to: "info@actfast.ca",                        // <-- Recipient(s), also your info address
      subject,
      html: htmlBody,
      replyTo: email || undefined,                   // Reply-to is the user’s email if provided
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending contact email:", error);
    return NextResponse.json(
      { error: "Failed to send email." },
      { status: 500 }
    );
  }
}
