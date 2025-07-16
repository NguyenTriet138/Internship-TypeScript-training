import { UserManager } from "./user-manager";
import { UserRole } from "./types";

const um = new UserManager([
  { id: 1, name: "Triết", age: 22, role: UserRole.ADMIN },
  { id: 2, name: "An", age: 25, role: UserRole.MEMBER },
  { id: 3, name: "Bao", age: 20, role: UserRole.MEMBER },
  { id: 4, name: "Long", age: 21, role: UserRole.MEMBER }
]);

um.addUser({ id: 5, name: "Huy", age: 21, role: UserRole.GUEST, email: "huy@mail.com" });

console.log("Admins:", um.listAdmins());
console.log("Avg age:", um.getAverageAge());
