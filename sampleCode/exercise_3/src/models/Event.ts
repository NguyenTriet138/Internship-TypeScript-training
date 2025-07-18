import { EventCategory, EventStatus } from '../types/enums';
import { Participant } from './Participant';

export interface EventBase {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  date: Date;
  status: EventStatus;
}

export interface Event extends EventBase {
  participants: Participant[];
}
