import { Event, EventBase, Participant } from "../models";
import { EventStatus } from "../types/enums";
import { generateId } from "../utils/idGenerator";

export class EventService {
  private events: Event[] = [];

  createEvent(data: Omit<EventBase, "id" | "status">): Event {
    const newEvent: Event = {
      ...data,
      id: generateId("evt"),
      status: EventStatus.UPCOMING,
      participants: [],
    };
    this.events.push(newEvent);
    return newEvent;
  }

  getAllEvents(): Event[] {
    return this.events;
  }

  addParticipant(eventId: string, participant: Participant): boolean {
    const event = this.events.find((e) => e.id === eventId);
    if (!event) return false;
    const exists = event.participants.some(
      (p) => p.email === participant.email
    );
    if (exists) return false;
    event.participants.push(participant);
    return true;
  }

  updateStatus(eventId: string, status: EventStatus): boolean {
    const event = this.events.find((e) => e.id === eventId);
    if (!event) return false;
    event.status = status;
    return true;
  }
}
