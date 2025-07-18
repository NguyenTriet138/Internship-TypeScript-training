import { EventService } from "../services/EventService";
import { ParticipantService } from "../services/ParticipantService";
import { EventCategory, EventStatus, Role } from "../types/enums";

export class App {
  private eventService = new EventService();
  private participantService = new ParticipantService();

  run(): void {
    // Create participant
    const alice = this.participantService.createParticipant(
      "Alice",
      "alice@example.com",
      Role.SPEAKER
    );
    const bob = this.participantService.createParticipant(
      "Bob",
      "bob@example.com",
      Role.ATTENDEE
    );
    const rosei = this.participantService.createParticipant(
      "Rosei",
      "rosei@example.com",
      Role.ATTENDEE
    );
    const rin = this.participantService.createParticipant(
      "Rin",
      "rin@example.com",
      Role.ORGANIZER
    );

    // Create event
    const event = this.eventService.createEvent({
      title: "TypeScript Advanced",
      description: "Deep dive into TS",
      category: EventCategory.TECH,
      date: new Date("2025-09-01"),
    });

    // Add participant
    this.eventService.addParticipant(event.id, alice);
    this.eventService.addParticipant(event.id, bob);
    this.eventService.addParticipant(event.id, rosei);
    this.eventService.addParticipant(event.id, rin);

    // Update status
    this.eventService.updateStatus(event.id, EventStatus.ONGOING);

    // Show event
    console.log(JSON.stringify(this.eventService.getAllEvents(), null, 2));
  }
}
