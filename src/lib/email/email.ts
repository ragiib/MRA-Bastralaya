import nodemailer from 'nodemailer';

/**
 * Gmail SMTP Email delivery utility for MRA Bastralaya Admin 2FA.
 * Uses nodemailer with host smtp.gmail.com, port 465, secure: true.
 * Reads credentials from EMAIL_USER and EMAIL_APP_PASSWORD.
 */

interface SendAdminOtpEmailParams {
  to: string;
  name?: string;
  code: string;
}

interface SendEmailResult {
  success: boolean;
  messageId?: string;
  simulated?: boolean;
  error?: string;
}

export async function sendAdminOtpEmail({
  to,
  name,
  code,
}: SendAdminOtpEmailParams): Promise<SendEmailResult> {
  const emailUser = process.env.EMAIL_USER?.trim();
  const emailAppPassword = process.env.EMAIL_APP_PASSWORD?.trim();
  const greetingName = name || 'Admin';

  if (process.env.NODE_ENV !== 'production') {
    console.log('\n-------------------------------------------------------------');
    console.log(`[DEV OTP LOG] Generated 6-digit OTP for ${to}: \x1b[33m\x1b[1m${code}\x1b[0m`);
    console.log('-------------------------------------------------------------\n');
  }

  const subject = `Your MRA Bastralaya Admin Verification Code: ${code}`;

  const textBody = `Hello ${greetingName},

Your one-time 2FA verification code for MRA Bastralaya Admin access is:

${code}

This code will expire in 5 minutes.

If you did not attempt to sign in to the MRA Bastralaya Admin portal, please ignore this email or change your account credentials immediately.

Best regards,
MRA Bastralaya Security`;

  const htmlBody = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #120F10; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #FAF7F2;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #120F10; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 520px; background-color: #1E181A; border-radius: 12px; border: 1px solid #3A3234; padding: 36px 32px;">
          <!-- Header / Brand -->
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #D4AF37; letter-spacing: 0.5px;">
                MRA BASTRALAYA
              </h1>
              <p style="margin: 6px 0 0 0; font-size: 13px; color: #B3A8A0; text-transform: uppercase; letter-spacing: 1px;">
                Admin Portal Security
              </p>
            </td>
          </tr>
          
          <!-- Divider -->
          <tr>
            <td style="border-top: 1px solid #2F2729; padding-bottom: 24px;"></td>
          </tr>

          <!-- Message Body -->
          <tr>
            <td style="font-size: 15px; line-height: 1.6; color: #EDE8E1; padding-bottom: 24px;">
              <p style="margin: 0 0 12px 0;">Hello <strong>${greetingName}</strong>,</p>
              <p style="margin: 0;">Use the 6-digit verification code below to complete your sign-in to the MRA Bastralaya Admin Portal.</p>
            </td>
          </tr>

          <!-- OTP Code Box -->
          <tr>
            <td align="center" style="padding: 16px 0 28px 0;">
              <div style="display: inline-block; background-color: #120F10; border: 2px solid #D4AF37; border-radius: 8px; padding: 16px 36px; text-align: center;">
                <span style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #D4AF37; font-family: monospace;">
                  ${code}
                </span>
              </div>
              <p style="margin: 12px 0 0 0; font-size: 13px; color: #E5A93C; font-weight: 500;">
                &#9201; Expires in 5 minutes
              </p>
            </td>
          </tr>

          <!-- Notice -->
          <tr>
            <td style="background-color: #272022; border-radius: 8px; padding: 14px 18px; font-size: 13px; line-height: 1.5; color: #B3A8A0; border-left: 3px solid #D4AF37;">
              If you did not request this login, please ignore this email or update your password immediately to protect your account.
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top: 32px; font-size: 12px; color: #807670;">
              &copy; ${new Date().getFullYear()} MRA Bastralaya. All rights reserved.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  // If Gmail SMTP credentials are not provided, log fallback in development
  if (!emailUser || !emailAppPassword) {
    console.warn('[Gmail SMTP] EMAIL_USER or EMAIL_APP_PASSWORD is not configured in environment variables.');
    console.log('\n=============================================================');
    console.log('[ADMIN 2FA EMAIL SIMULATION]');
    console.log(`To (Admin Account): ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`\x1b[33m\x1b[1m>>> Verification Code: ${code} <<<\x1b[0m`);
    console.log('Valid for 5 minutes.');
    console.log('To send real emails via Gmail SMTP, configure EMAIL_USER and EMAIL_APP_PASSWORD in .env.local.');
    console.log('=============================================================\n');

    return {
      success: true,
      simulated: true,
      messageId: `sim-${Date.now()}`,
    };
  }

  // Create nodemailer transporter with Gmail SMTP
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // SSL
      auth: {
        user: emailUser,
        pass: emailAppPassword.replace(/\s+/g, ''), // Strip whitespace if copied with spaces
      },
    });

    const info = await transporter.sendMail({
      from: `"MRA Bastralaya" <${emailUser}>`,
      to, // Sent to the admin user's registered email address
      subject,
      text: textBody,
      html: htmlBody,
    });

    return {
      success: true,
      messageId: info.messageId,
      simulated: false,
    };
  } catch (err: unknown) {
    const errorDetails = err instanceof Error ? err.message : String(err);
    console.error('[Gmail SMTP Error] Failed to send email via Gmail SMTP:', errorDetails);

    // Provide user-friendly troubleshooting error message
    let friendlyMessage = 'Failed to deliver 2FA email via Gmail SMTP.';
    if (errorDetails.includes('EAUTH') || errorDetails.includes('Invalid login') || errorDetails.includes('Username and Password not accepted')) {
      friendlyMessage = 'Gmail SMTP authentication failed. Please check EMAIL_USER and ensure EMAIL_APP_PASSWORD is a valid 16-character Google App Password.';
    } else if (errorDetails.includes('ECONNREFUSED') || errorDetails.includes('ETIMEDOUT') || errorDetails.includes('ENOTFOUND')) {
      friendlyMessage = 'Could not connect to smtp.gmail.com:465. Please check network/firewall connectivity.';
    }

    return {
      success: false,
      error: friendlyMessage,
    };
  }
}
