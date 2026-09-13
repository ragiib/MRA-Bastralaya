/**
 * Next.js Server Instrumentation Hook
 * Executes automatically when the Next.js server runtime boots.
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const emailUser = (process.env.EMAIL_USER || process.env.MAIL_USER)?.trim();
    const emailAppPassword = (
      process.env.EMAIL_APP_PASSWORD ||
      process.env.MAIL_APP_PASSWORD ||
      process.env.MAIL_PASSWORD ||
      process.env.EMAIL_PASSWORD
    )?.trim();

    console.log('\n=============================================================');
    console.log('         MRA BASTRALAYA - STARTUP ENVIRONMENT CHECK          ');
    console.log('=============================================================');
    if (emailUser && emailAppPassword) {
      const cleanPass = emailAppPassword.replace(/\s+/g, '');
      console.log('[SMTP CONFIG CHECK] Gmail SMTP credentials detected:');
      console.log(`  - Variable EMAIL_USER:         "${emailUser}"`);
      console.log(`  - Variable EMAIL_APP_PASSWORD: Set (${cleanPass.length} chars, masked: ${cleanPass.slice(0, 2)}***${cleanPass.slice(-2)})`);
      console.log('  - Transporter:                 smtp.gmail.com:465 (SSL/TLS)');
    } else {
      console.warn('[SMTP CONFIG WARNING] Incomplete Gmail SMTP credentials:');
      console.warn(`  - EMAIL_USER:         ${emailUser ? `Defined ("${emailUser}")` : 'MISSING'}`);
      console.warn(`  - EMAIL_APP_PASSWORD: ${emailAppPassword ? 'Defined' : 'MISSING'}`);
      console.warn('  Tip: Set EMAIL_USER and EMAIL_APP_PASSWORD in .env.local to deliver live 2FA emails.');
    }
    console.log('=============================================================\n');
  }
}
