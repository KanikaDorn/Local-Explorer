/**
 * Email Service
 * Handles all email communications for the platform
 */

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Email templates
 */
const templates = {
  welcome: (name: string): EmailTemplate => ({
    subject: "Welcome to LocalExplore!",
    html: `
      <h1>Welcome, ${name}!</h1>
      <p>Thank you for joining LocalExplore. Start discovering amazing places and experiences in Cambodia.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/explore" style="background-color: #3b82f6; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none;">Start Exploring</a>
    `,
    text: `Welcome to LocalExplore, ${name}! Visit ${process.env.NEXT_PUBLIC_APP_URL}/explore to start exploring.`,
  }),

  subscriptionConfirmation: (
    email: string,
    tier: string,
    amount: number
  ): EmailTemplate => ({
    subject: `${tier.toUpperCase()} Plan Activated`,
    html: `
      <h1>Subscription Confirmed</h1>
      <p>Thank you for upgrading to our ${tier} plan!</p>
      <p><strong>Plan:</strong> ${tier}</p>
      <p><strong>Amount:</strong> $${amount.toFixed(2)}</p>
      <p>Your subscription is now active. You can manage it from your dashboard.</p>
    `,
    text: `Your ${tier} subscription for $${amount.toFixed(
      2
    )} has been confirmed.`,
  }),

  passwordReset: (name: string, resetLink: string): EmailTemplate => ({
    subject: "Reset Your Password",
    html: `
      <h1>Password Reset Request</h1>
      <p>Hi ${name},</p>
      <p>We received a request to reset your password. Click the link below to proceed:</p>
      <a href="${resetLink}" style="background-color: #3b82f6; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none;">Reset Password</a>
      <p>This link expires in 1 hour.</p>
    `,
    text: `Click this link to reset your password: ${resetLink}`,
  }),

  locationApproved: (
    spotTitle: string,
    partnerName: string
  ): EmailTemplate => ({
    subject: `Your Location "${spotTitle}" Has Been Approved!`,
    html: `
      <h1>Location Approved</h1>
      <p>Great news, ${partnerName}!</p>
      <p>Your location "<strong>${spotTitle}</strong>" has been approved and is now live on LocalExplore!</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/partner/locations" style="background-color: #10b981; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none;">View Your Locations</a>
    `,
    text: `Your location "${spotTitle}" has been approved!`,
  }),

  locationRejected: (
    spotTitle: string,
    reason: string,
    partnerName: string
  ): EmailTemplate => ({
    subject: `Location "${spotTitle}" Needs Revision`,
    html: `
      <h1>Location Requires Revision</h1>
      <p>Hi ${partnerName},</p>
      <p>Your location "<strong>${spotTitle}</strong>" requires revision:</p>
      <p><strong>Reason:</strong> ${reason}</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/partner/locations" style="background-color: #f59e0b; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none;">Edit Location</a>
    `,
    text: `Your location "${spotTitle}" requires revision: ${reason}`,
  }),
};

/**
 * Send email using backend service
 */
export async function sendEmail(params: SendEmailParams): Promise<boolean> {
  try {
    const response = await fetch("/api/emails/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      console.error("Failed to send email:", response.statusText);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}

/**
 * Send welcome email
 */
export async function sendWelcomeEmail(
  email: string,
  name: string
): Promise<boolean> {
  const template = templates.welcome(name);
  return sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}

/**
 * Send subscription confirmation
 */
export async function sendSubscriptionConfirmation(
  email: string,
  tier: string,
  amount: number
): Promise<boolean> {
  const template = templates.subscriptionConfirmation(email, tier, amount);
  return sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  name: string,
  resetLink: string
): Promise<boolean> {
  const template = templates.passwordReset(name, resetLink);
  return sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}

/**
 * Send location approved notification
 */
export async function sendLocationApprovedEmail(
  email: string,
  spotTitle: string,
  partnerName: string
): Promise<boolean> {
  const template = templates.locationApproved(spotTitle, partnerName);
  return sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}

/**
 * Send location rejected notification
 */
export async function sendLocationRejectedEmail(
  email: string,
  spotTitle: string,
  reason: string,
  partnerName: string
): Promise<boolean> {
  const template = templates.locationRejected(spotTitle, reason, partnerName);
  return sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}
