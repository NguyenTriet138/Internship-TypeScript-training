// Define User by interface
interface User {
  id: number;
  name: string;
  age: number;
  role: "admin" | "member"; // Literal Type
}

// List users with initial data
const users: User[] = [
  { id: 1, name: "Benn", age: 22, role: "admin" },
  { id: 2, name: "An", age: 24, role: "member" },
  { id: 3, name: "Bao", age: 20, role: "member" },
  { id: 4, name: "Long", age: 21, role: "member" },
];

// addUser, removeUser, findUserByName, listAdmins functions
function addUser(user: User): void {
  const exists = users.some(u => u.id === user.id);
  if (exists) {
    console.error(`User ID ${user.id} already exists`);
    return;
  }
  users.push(user);
  console.log(`✅ Added: ${user.name}`);
}

function removeUser(id: number): void {
  const index = users.findIndex(u => u.id === id);
  if (index === -1) {
    console.warn(`User with ID ${id} not found`);
    return;
  }
  const removed = users.splice(index, 1)[0];
  console.log(`🗑️ Removed: ${removed.name}`);
}

function findUserByName(name: string): User | undefined {
  return users.find(u => u.name.toLowerCase() === name.toLowerCase());
}

function listAdmins(): User[] {
  return users.filter(u => u.role === "admin");
}

// Example usage
addUser({ id: 3, name: "Huy", age: 20, role: "member" });   // ID already exists
addUser({ id: 5, name: "Duplicate", age: 30, role: "admin" }); 
removeUser(1);
console.log("🔍 Found:", findUserByName("An"));
console.log("🛡️ Admins:", listAdmins());
