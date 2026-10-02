import crypto from 'crypto';

export function createEmailVerificationToken() {
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  return { token, tokenHash };
}

export function hashEmailVerificationToken(token) {
  return crypto.createHash('sha256').update(String(token || '')).digest('hex');
}

export async function sendVerificationEmail({ email, name, token }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || 'Atabeh Royal Carpet <onboarding@resend.dev>';
  const appUrl = (process.env.APP_URL || '').replace(/\/$/, '');
  if (!apiKey || !appUrl) throw new Error('EMAIL_NOT_CONFIGURED');

  const verifyUrl = `${appUrl}/api/auth/verify-email?token=${encodeURIComponent(token)}`;
  const safeName = String(name || 'عميلنا').replace(/[<>&"']/g, '');
  const html = `
    <div dir="rtl" style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#2c231d;line-height:1.8">
      <h2 style="color:#861514">تأكيد البريد الإلكتروني</h2>
      <p>مرحباً ${safeName}،</p>
      <p>اضغط الزر التالي لتأكيد بريدك الإلكتروني في متجر عتبة للسجاد.</p>
      <p style="margin:28px 0"><a href="${verifyUrl}" style="background:#861514;color:#fff;text-decoration:none;padding:12px 22px;border-radius:999px;font-weight:700">تأكيد البريد الإلكتروني</a></p>
      <p style="font-size:13px;color:#766b61">الرابط صالح لمدة 30 دقيقة. إذا لم تنشئ هذا الحساب يمكنك تجاهل الرسالة.</p>
    </div>`;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ from, to: [email], subject: 'تأكيد بريدك الإلكتروني — عتبة للسجاد', html })
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    console.error('Resend error:', response.status, text);
    throw new Error('EMAIL_SEND_FAILED');
  }
}
