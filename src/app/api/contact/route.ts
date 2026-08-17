import { NextResponse } from 'next/server';
import { Resend } from 'resend';

/**
 * Real contact endpoint. The previous form only set a local flag and told the
 * visitor "Thank you for your message!" while sending nothing.
 *
 * Requires RESEND_API_KEY and CONTACT_TO_EMAIL in .env.local. Without them
 * this returns 503 and the form reports the failure honestly rather than
 * pretending the message went through.
 */

const MAX_LENGTHS = { name: 100, email: 200, message: 5000 } as const;

// One message per IP per minute. In-memory, so it resets on deploy and does
// not span serverless instances. Enough to stop casual form spam, not a
// substitute for a real WAF.
const RATE_LIMIT_WINDOW_MS = 60_000;
const lastSeen = new Map<string, number>();

function rateLimited(ip: string): boolean {
  const previous = lastSeen.get(ip);
  return previous !== undefined && Date.now() - previous < RATE_LIMIT_WINDOW_MS;
}

/**
 * Only a message that actually went out consumes the window. Recording on
 * every request would mean one mistyped email address locks the sender out
 * for a minute while they correct it.
 */
function recordSend(ip: string): void {
  const now = Date.now();
  lastSeen.set(ip, now);

  // Keep the map from growing without bound on a long-lived instance.
  if (lastSeen.size > 5000) {
    for (const [key, seen] of lastSeen) {
      if (now - seen > RATE_LIMIT_WINDOW_MS) lastSeen.delete(key);
    }
  }
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;

  if (!apiKey || !to) {
    console.error('Contact route is not configured: missing RESEND_API_KEY or CONTACT_TO_EMAIL');
    return NextResponse.json(
      { error: 'The contact form is not configured yet. Please email me directly.' },
      { status: 503 },
    );
  }

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';

  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many messages. Please wait a minute and try again.' },
      { status: 429 },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Malformed request.' }, { status: 400 });
  }

  const body = payload as Record<string, unknown>;

  // Honeypot. Real people leave this hidden field empty; bots fill it in.
  // Returning 200 means the bot has no signal that it was rejected.
  if (typeof body.company === 'string' && body.company.length > 0) {
    recordSend(ip);
    return NextResponse.json({ ok: true });
  }

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: 'Name, email, and message are all required.' },
      { status: 400 },
    );
  }

  if (
    name.length > MAX_LENGTHS.name ||
    email.length > MAX_LENGTHS.email ||
    message.length > MAX_LENGTHS.message
  ) {
    return NextResponse.json({ error: 'One of those fields is too long.' }, { status: 400 });
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'That email address does not look right.' }, { status: 400 });
  }

  try {
    const resend = new Resend(apiKey);

    const { error } = await resend.emails.send({
      // Must be a domain verified in the Resend dashboard.
      from: process.env.CONTACT_FROM_EMAIL || 'Portfolio <onboarding@resend.dev>',
      to: [to],
      replyTo: email,
      subject: `Portfolio message from ${name}`,
      text: `From: ${name} <${email}>\n\n${message}`,
    });

    if (error) {
      console.error('Resend rejected the message:', error);
      return NextResponse.json(
        { error: 'The message could not be sent. Please email me directly.' },
        { status: 502 },
      );
    }

    recordSend(ip);
    return NextResponse.json({ ok: true });
  } catch (caught) {
    console.error('Contact route failed:', caught);
    return NextResponse.json(
      { error: 'The message could not be sent. Please email me directly.' },
      { status: 500 },
    );
  }
}
