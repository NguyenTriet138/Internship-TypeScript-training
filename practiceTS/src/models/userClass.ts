export class User {
  id: number;
  username: string;
  password: string;
  role: string;

  constructor(data: { id: number; username: string; password: string; role: string }) {
    this.id = data.id;
    this.username = data.username;
    this.password = data.password;
    this.role = data.role;
  }

  isAdmin(): boolean {
    return this.role === 'admin';
  }

  toJSON(): string {
    return JSON.stringify({
      id: this.id,
      username: this.username,
      password: this.password,
      role: this.role,
    });
  }

  static fromJSON(json: string): User {
    const data = JSON.parse(json);
    return new User(data);
  }
}

export class UserModel {
  private apiUrl = 'http://localhost:3000/users';

  async login(username: string, password: string): Promise<User | null> {
    try {
      const res = await fetch(`${this.apiUrl}?username=${username}&password=${password}`);
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
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  saveUser(user: User): void {
    localStorage.setItem('currentUser', user.toJSON());
  }

  logout(): void {
    localStorage.removeItem('currentUser');
  }

  isAdmin(user: User | null): boolean {
    return user?.isAdmin() ?? false;
  }
}
