function escapeHtml(str) {
    return String(str)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

async function sendPasswordResetEmail({ to, resetUrl, userName }) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        throw new Error('RESEND_API_KEY is not configured');
    }

    const from = process.env.RESEND_FROM_EMAIL || 'Trackwise <noreply@adminsvctemple.space>';

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #1e40af; margin-bottom: 8px;">Reset your password</h2>
        <p style="color: #374151; line-height: 1.6;">Hi ${escapeHtml(userName || 'there')},</p>
        <p style="color: #374151; line-height: 1.6;">
          We received a request to reset your Trackwise password. Click the button below to choose a new one.
          This link expires in 1 hour.
        </p>
        <p style="margin: 28px 0;">
          <a href="${resetUrl}"
             style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-weight: 600; display: inline-block;">
            Reset Password
          </a>
        </p>
        <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
          If you didn't request this, you can safely ignore this email.
        </p>
        <p style="color: #9ca3af; font-size: 12px; margin-top: 24px; word-break: break-all;">
          Or copy this link: ${resetUrl}
        </p>
      </div>
    `;

    const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            from,
            to: [to],
            subject: 'Reset your Trackwise password',
            html,
        }),
    });

    if (!response.ok) {
        const body = await response.text();
        throw new Error(`Resend API error (${response.status}): ${body}`);
    }

    return response.json();
}

module.exports = { sendPasswordResetEmail };
