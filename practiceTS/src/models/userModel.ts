import { API_CONFIG } from "config/env";

export class User {
  id: number;
  username: string;
  password: string;

  constructor(data: { id: number; username: string; password: string; role: string }) {
    this.id = data.id;
    this.username = data.username;
    this.password = data.password;
  }

  toJSON(): string {
    return JSON.stringify({
      id: this.id,
      username: this.username,
      password: this.password,
    });
  }

  static fromJSON(json: string): User {
    const data = JSON.parse(json);
    return new User(data);
  }
}

export class UserModel {
  async login(username: string, password: string): Promise<User | null> {
    try {
      const res = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.users}?username=${username}&password=${password}`);
      const users = await res.json();

      if (users.length === 1) {
        return new User(users[0]);
      }

      return null;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  getCurrentUser(): User | null {
    try {
      const userStr = localStorage.getItem('currentUser');
      return userStr ? User.fromJSON(userStr) : null;
    } catch {
      return null;
    }
  }

  saveUser(user: User): void {
    localStorage.setItem('currentUser', user.toJSON());
  }

  logout(): void {
    localStorage.removeItem('currentUser');
  }
}
