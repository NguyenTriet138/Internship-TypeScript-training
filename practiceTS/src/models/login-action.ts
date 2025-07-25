export interface User {
  id: number;
  username: string;
  password: string;
  role: string;
}

export async function login(username: string, password: string): Promise<User | null> {
  // const res = await fetch(`http://localhost:3000/users?username=${username}&password=${password}`);
  // const users = await res.json();

  // if (users.length === 1) {
  //   return users[0];
  // }

  // return null;
  try {
    const response = await fetch(`http://localhost:3000/users?username=${username}&password=${password}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const users = await response.json();

    if (users.length === 1) {
      return users[0];
    }

    return null;

  } catch (error) {
    console.error('Login request failed:', error);
    throw error;
  }
}

// Helper function to get current logged-in user
export function getCurrentUser(): User | null {
  try {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// Helper function to logout
export function logout(): void {
  localStorage.removeItem('currentUser');
}
