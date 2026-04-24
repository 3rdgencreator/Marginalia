import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { service, instructor, senderEmail, message } = await req.json().catch(() => ({}));

  if (!service || !message || !senderEmail) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const apiKey = process.env.BREVO_API_KEY;
  const toEmail = process.env.CONTACT_EMAIL ?? 'cizenbayanelif@gmail.com';

  const subject = instructor
    ? `New inquiry: ${service} — ${instructor}`
    : `New inquiry: ${service}`;

  const textContent = [
    `Service: ${service}`,
    instructor ? `Instructor: ${instructor}` : null,
    `From: ${senderEmail}`,
    ``,
    message,
  ].filter(Boolean).join('\n');

  if (!apiKey) {
    console.log('Contact form (no BREVO_API_KEY):', textContent);
    return NextResponse.json({ ok: true });
  }

  try {
    await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender: { email: 'noreply@marginalialabel.com', name: 'Marginalia Contact' },
        to: [{ email: toEmail }],
        replyTo: { email: senderEmail },
        subject,
        textContent,
      }),
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Send failed' }, { status: 500 });
  }
}
