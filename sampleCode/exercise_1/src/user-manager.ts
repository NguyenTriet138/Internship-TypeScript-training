import { User, UserRole } from "./types";

export class UserManager {
  private users: User[] = [];

  constructor(initialUsers?: User[]) {
    if (initialUsers) this.users = initialUsers;
  }

  addUser(user: User): void {
    const exists = this.users.some((u) => u.id === user.id);
    if (exists) throw new Error(`User ID ${user.id} already exists`);
    if (user.email && !user.email.includes("@")) {
      throw new Error(`Invalid email for user: ${user.name}`);
    }
    this.users.push(user);
  }

  removeUser(id: number): void {
    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) {
      console.warn(`User not found`);
      return;
    }
    this.users.splice(index, 1);
  }

  findUserByName(name: string): User | undefined {
    return this.users.find((u) => u.name.toLowerCase() === name.toLowerCase());
  }

  filterUsers(predicate: (user: User) => boolean): User[] {
    return this.users.filter(predicate);
  }

  getAverageAge(): number {
    const total = this.users.reduce((sum, u) => sum + u.age, 0);
    return Math.round(total / this.users.length);
  }

  listAdmins(): User[] {
    return this.filterUsers((u) => u.role === UserRole.ADMIN);
  }

  // Type guard
  static isUser(obj: unknown): obj is User {
    if (
      typeof obj === "object" &&
      obj !== null &&
      "id" in obj &&
      "name" in obj &&
      "age" in obj &&
      "role" in obj
    ) {
      return true;
    }
    return false;
  }
}
