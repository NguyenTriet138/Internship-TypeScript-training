export interface User {
  id: number;
  username: string;
  password: string;
  role: string;
}

export async function login(username: string, password: string): Promise<User | null> {
  const res = await fetch(`http://localhost:3000/users?username=${username}&password=${password}`);
  const users = await res.json();

  if (users.length === 1) {
    return users[0];
  }

  return null;
}
