import { Participant } from "../models";
import { generateId } from "../utils/idGenerator";

export class ParticipantService {
  private participants: Participant[] = [];

  createParticipant(name: string, email: string, role: string): Participant {
    const newParticipant: Participant = {
      id: generateId("usr"),
      name,
      email,
      role: role as any,
    };
    this.participants.push(newParticipant);
    return newParticipant;
  }

  getAll(): Participant[] {
    return this.participants;
  }
}
