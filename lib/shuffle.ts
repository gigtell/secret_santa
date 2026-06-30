export interface Participant {
  name: string;
  email: string;
}

export interface Assignment {
  giver: string;
  receiver: string;
}

export interface ParticipantAssignment {
  giver: Participant;
  receiver: Participant;
}

function shuffleParticipants(participants: Participant[]): Participant[] {
  const shuffled = [...participants];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }

  return shuffled;
}

export function createSecretSantaPairings(
  participants: Participant[],
  maxAttempts = 10,
): ParticipantAssignment[] | null {
  if (participants.length < 3) {
    return null;
  }

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const shuffled = shuffleParticipants(participants);
    const assignments = shuffled.map((giver, index) => ({
      giver,
      receiver: shuffled[(index + 1) % shuffled.length],
    }));

    const hasSelfAssignment = assignments.some(
      ({ giver, receiver }) => giver === receiver,
    );

    if (!hasSelfAssignment) {
      return assignments;
    }
  }

  return null;
}

export function createSecretSantaAssignments(
  participants: Participant[],
  maxAttempts = 10,
): Assignment[] | null {
  const pairings = createSecretSantaPairings(participants, maxAttempts);

  return pairings?.map(({ giver, receiver }) => ({
    giver: giver.name,
    receiver: receiver.name,
  })) ?? null;
}
