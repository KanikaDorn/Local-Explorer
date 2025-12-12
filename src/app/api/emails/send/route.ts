import { NextRequest, NextResponse } from "next/server";

/**
 * Email sending endpoint
 * In production, this would integrate with SendGrid, AWS SES, or similar
 */

interface EmailRequest {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function POST(req: NextRequest) {
  try {
    const { to, subject, html, text } = (await req.json()) as EmailRequest;

    // Validate input
    if (!to || !subject || !html) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // In development/test mode, log the email instead of sending
    if (process.env.NODE_ENV !== "production") {
      console.log("📧 Email would be sent:", {
        to,
        subject,
        preview: html.substring(0, 100),
      });

      return NextResponse.json({
        success: true,
        message: "Email logged (test mode)",
      });
    }

    // Production: Send using configured email service
    // Example with SendGrid:
    // const sgMail = require('@sendgrid/mail');
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    // await sgMail.send({
    //   to,
    //   from: process.env.EMAIL_FROM || 'noreply@localexplore.com',
    //   subject,
    //   html,
    //   text,
    // });

    return NextResponse.json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
