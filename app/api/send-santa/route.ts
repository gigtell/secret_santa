import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { isValidEmail } from '@/lib/email';
import { createSecretSantaAssignments, createSecretSantaPairings, type Participant } from '@/lib/shuffle';

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function isParticipant(candidate: unknown): candidate is Participant {
  return (
    typeof candidate === 'object' &&
    candidate !== null &&
    'name' in candidate &&
    'email' in candidate &&
    typeof candidate.name === 'string' &&
    typeof candidate.email === 'string'
  );
}

function createEmailHtml(name: string, recipientName: string) {
  const safeName = escapeHtml(name);
  const safeRecipientName = escapeHtml(recipientName);

  return `
    <div style="background:#f5efe2;padding:32px 16px;font-family:Arial,sans-serif;color:#173826;">
      <div style="max-width:560px;margin:0 auto;background:#fffdf8;border-radius:24px;overflow:hidden;border:1px solid #e6d7b6;">
        <div style="background:#0f3d2e;padding:24px 32px;text-align:center;">
          <h1 style="margin:0;color:#fff8eb;font-size:32px;">🎅 Secret Santa</h1>
        </div>
        <div style="padding:32px;">
          <p style="margin:0 0 16px;color:#8b1e2d;font-size:28px;font-weight:700;">Ho Ho Ho, ${safeName}!</p>
          <p style="margin:0 0 24px;font-size:18px;line-height:1.6;">Your festive assignment is ready.</p>
          <div style="background:#f7f2e7;border:2px dashed #d4a017;border-radius:18px;padding:24px;text-align:center;margin-bottom:24px;">
            <p style="margin:0 0 10px;font-size:16px;color:#516454;">You are buying a gift for:</p>
            <p style="margin:0;font-size:30px;font-weight:700;color:#0f3d2e;">${safeRecipientName}</p>
          </div>
          <p style="margin:0 0 16px;font-size:17px;line-height:1.6;">Keep it a secret until the big day! 🤫</p>
          <p style="margin:0;font-size:16px;line-height:1.6;color:#516454;">Remember the gift budget we agreed on! Happy gifting! 🎁</p>
        </div>
      </div>
    </div>
  `;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { participants?: Participant[] };
    const participants = body.participants?.filter(isParticipant).map((participant) => ({
      name: participant.name.trim(),
      email: participant.email.trim(),
    }));

    if (!participants || participants.length !== body.participants?.length || participants.length < 3) {
      return NextResponse.json(
        { success: false, error: 'Please include at least 3 participants.' },
        { status: 400 },
      );
    }

    const hasInvalidParticipant = participants.some(
      ({ name, email }) => !name || !email || !isValidEmail(email),
    );

    if (hasInvalidParticipant) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please provide a name and valid email address for every participant.',
        },
        { status: 400 },
      );
    }

    if (!resend) {
      return NextResponse.json(
        { success: false, error: 'Missing RESEND_API_KEY. Add it to your environment before sending emails.' },
        { status: 500 },
      );
    }

    const pairings = createSecretSantaPairings(participants);
    const assignments = createSecretSantaAssignments(participants);

    if (!pairings || !assignments) {
      return NextResponse.json(
        { success: false, error: 'We could not create a valid Secret Santa shuffle. Please try again.' },
        { status: 500 },
      );
    }

    await Promise.all(
      pairings.map(async ({ giver, receiver }) => {
        const { error } = await resend.emails.send({
          from: 'onboarding@resend.dev',
          to: giver.email,
          subject: '🎅 Your Secret Santa Assignment!',
          html: createEmailHtml(giver.name, receiver.name),
        });

        if (error) {
          throw new Error(error.message);
        }
      }),
    );

    return NextResponse.json({ success: true, assignments });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Something went wrong while sending emails.';

    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
