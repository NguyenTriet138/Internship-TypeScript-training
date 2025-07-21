import { Task } from '../models/Task';

export function printTasks(tasks: Task[]): void {
  console.log('------ TASK LIST ------');
  tasks.forEach(task => {
    console.log(`${task.id}. ${task.title} [${task.status}]`);
  });
  console.log('-----------------------');
}
