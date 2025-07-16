export enum UserRole {
  ADMIN = "admin",
  MEMBER = "member",
  GUEST = "guest"
}

export interface User {
  readonly id: number;
  name: string;
  age: number;
  role: UserRole;
  email?: string;
}
