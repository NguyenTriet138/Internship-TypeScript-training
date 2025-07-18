import { Role } from '../types/enums';

export interface Participant {
  id: string;
  name: string;
  email: string;
  role: Role;
}
