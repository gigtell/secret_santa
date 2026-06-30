"use client";

import { useState } from 'react';
import type { Assignment, Participant } from '@/lib/shuffle';

interface FormErrors {
  general?: string;
  participants: Array<{
    name?: string;
    email?: string;
  }>;
}

const minimumParticipants = 3;
const emptyParticipant = (): Participant => ({ name: '', email: '' });
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const createInitialParticipants = () =>
  Array.from({ length: minimumParticipants }, emptyParticipant);

export function ParticipantForm() {
  const initialParticipants = createInitialParticipants();
  const [participants, setParticipants] = useState<Participant[]>(initialParticipants);
  const [errors, setErrors] = useState<FormErrors>({ participants: initialParticipants.map(() => ({})) });
  const [apiError, setApiError] = useState<string>('');
  const [assignments, setAssignments] = useState<Assignment[] | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const syncParticipantErrors = (nextParticipants: Participant[]) => {
    setErrors((currentErrors) => ({
      general: nextParticipants.length < minimumParticipants ? currentErrors.general : undefined,
      participants: nextParticipants.map((_, index) => currentErrors.participants[index] ?? {}),
    }));
  };

  const updateParticipant = (index: number, field: keyof Participant, value: string) => {
    const nextParticipants = participants.map((participant, participantIndex) =>
      participantIndex === index ? { ...participant, [field]: value } : participant,
    );

    setParticipants(nextParticipants);
    syncParticipantErrors(nextParticipants);
    setApiError('');
  };

  const addParticipant = () => {
    const nextParticipants = [...participants, emptyParticipant()];
    setParticipants(nextParticipants);
    syncParticipantErrors(nextParticipants);
  };

  const removeParticipant = (index: number) => {
    if (participants.length <= minimumParticipants) {
      setErrors((currentErrors) => ({
        ...currentErrors,
        general: 'You need at least 3 participants for Secret Santa.',
      }));
      return;
    }

    const nextParticipants = participants.filter((_, participantIndex) => participantIndex !== index);
    setParticipants(nextParticipants);
    syncParticipantErrors(nextParticipants);
    setApiError('');
  };

  const validateParticipants = () => {
    const participantErrors = participants.map((participant) => {
      const entryErrors: FormErrors['participants'][number] = {};
      const trimmedName = participant.name.trim();
      const trimmedEmail = participant.email.trim();

      if (!trimmedName) {
        entryErrors.name = 'Please add a name.';
      }

      if (!trimmedEmail) {
        entryErrors.email = 'Please add an email.';
      } else if (!emailPattern.test(trimmedEmail)) {
        entryErrors.email = 'Please enter a valid email address.';
      }

      return entryErrors;
    });

    const hasFieldErrors = participantErrors.some(
      (entryErrors) => entryErrors.name || entryErrors.email,
    );

    const general =
      participants.length < minimumParticipants
        ? 'You need at least 3 participants for Secret Santa.'
        : undefined;

    setErrors({ general, participants: participantErrors });

    return !general && !hasFieldErrors;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setApiError('');

    if (!validateParticipants()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/send-santa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ participants }),
      });

      const data = (await response.json()) as
        | { success: true; assignments: Assignment[] }
        | { success: false; error: string };

      if (!data.success) {
        setApiError(data.error);
        return;
      }

      setAssignments(data.assignments);
    } catch {
      setApiError('We could not send the emails right now. Please try again in a moment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setParticipants(initialParticipants);
    setErrors({ participants: initialParticipants.map(() => ({})) });
    setApiError('');
    setAssignments(null);
    setIsSubmitting(false);
  };

  if (assignments) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-4xl items-center justify-center px-4 py-12">
        <section className="w-full rounded-[2rem] border border-white/10 bg-white/10 p-8 shadow-festive backdrop-blur md:p-12">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-gold">Holiday Mission Complete</p>
            <h1 className="mt-4 text-4xl font-black text-cream md:text-5xl">🎄 Emails Sent Successfully!</h1>
            <p className="mt-4 text-lg text-cream/80">Here&apos;s the organizer&apos;s reference list for your celebration.</p>
          </div>
          <div className="mt-10 grid gap-4">
            {assignments.map((assignment) => (
              <div
                key={`${assignment.giver}-${assignment.receiver}`}
                className="rounded-2xl border border-gold/30 bg-holly/70 px-5 py-4 text-lg text-cream shadow-lg"
              >
                <span className="font-semibold">{assignment.giver}</span>
                <span className="mx-3 text-gold">🎁 →</span>
                <span className="font-semibold">{assignment.receiver}</span>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center justify-center rounded-full bg-berry px-6 py-3 text-base font-semibold text-cream transition hover:bg-red-800"
            >
              🔄 Start Over
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-10 md:px-6">
      <section className="grid w-full gap-8 overflow-hidden rounded-[2rem] border border-white/10 bg-sparkle bg-white/10 shadow-festive backdrop-blur lg:grid-cols-[1.1fr_0.9fr]">
        <div className="px-6 py-10 md:px-10 md:py-12">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-gold">Merry & Bright</p>
          <h1 className="mt-4 text-4xl font-black text-cream md:text-6xl">🎅 Secret Santa</h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-cream/80">
            Add your family crew, let the holiday shuffle work its magic, and email every gift-giver their secret mission.
          </p>
          <div className="mt-8 rounded-3xl border border-gold/20 bg-holly/60 p-5 text-sm leading-7 text-cream/80">
            <p className="font-semibold text-gold">Before you send</p>
            <ul className="mt-3 space-y-2">
              <li>• Double-check every participant email.</li>
              <li>• Everyone gets a different recipient.</li>
              <li>• Keep your budget and deadline in the message thread.</li>
            </ul>
          </div>
        </div>

        <div className="border-l border-white/10 bg-black/10 px-6 py-10 md:px-10 md:py-12">
          <div className="rounded-[1.75rem] bg-cream p-6 text-slate-900 shadow-2xl md:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-holly">Create your list</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Gather at least 3 family members to keep the holiday magic going.
                </p>
              </div>
              <div className="rounded-full bg-gold/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-berry">
                {participants.length} people
              </div>
            </div>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              {errors.general ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {errors.general}
                </div>
              ) : null}

              {apiError ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {apiError}
                </div>
              ) : null}

              <div className="space-y-4">
                {participants.map((participant, index) => (
                  <div key={`participant-${index}`} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Person {index + 1}</p>
                      <button
                        type="button"
                        onClick={() => removeParticipant(index)}
                        className="rounded-full border border-slate-200 px-3 py-1 text-sm font-medium text-slate-600 transition hover:border-berry hover:text-berry disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label={`Remove participant ${index + 1}`}
                      >
                        ✕
                      </button>
                    </div>

                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <label className="block text-sm font-medium text-slate-700">
                        Name
                        <input
                          type="text"
                          value={participant.name}
                          onChange={(event) => updateParticipant(index, 'name', event.target.value)}
                          className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-base text-slate-900 outline-none transition focus:border-holly focus:ring-2 focus:ring-holly/20"
                          placeholder="Buddy the Elf"
                        />
                        {errors.participants[index]?.name ? (
                          <span className="mt-2 block text-sm text-red-600">{errors.participants[index]?.name}</span>
                        ) : null}
                      </label>

                      <label className="block text-sm font-medium text-slate-700">
                        Email
                        <input
                          type="email"
                          value={participant.email}
                          onChange={(event) => updateParticipant(index, 'email', event.target.value)}
                          className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-base text-slate-900 outline-none transition focus:border-holly focus:ring-2 focus:ring-holly/20"
                          placeholder="buddy@example.com"
                        />
                        {errors.participants[index]?.email ? (
                          <span className="mt-2 block text-sm text-red-600">{errors.participants[index]?.email}</span>
                        ) : null}
                      </label>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <button
                  type="button"
                  onClick={addParticipant}
                  className="inline-flex items-center justify-center rounded-full border border-holly bg-holly px-5 py-3 text-sm font-semibold text-cream transition hover:bg-garland"
                >
                  ➕ Add Person
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex flex-1 items-center justify-center rounded-full bg-berry px-6 py-3 text-sm font-semibold text-cream transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? 'Sending festive emails…' : 'Send Secret Santa Emails! 🎄'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
