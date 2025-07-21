import { Task, TaskStatus } from "../models/Task";

export class TaskManager {
  private tasks: Task[] = [];
  private nextId: number = 1;

  addTask(title: string): Task {
    const newTask: Task = {
      id: this.nextId++,
      title,
      status: TaskStatus.Pending,
    };
    this.tasks.push(newTask);
    return newTask;
  }

  completeTask(id: number): boolean {
    const task = this.tasks.find((t) => t.id === id);
    if (task && task.status !== TaskStatus.Completed) {
      task.status = TaskStatus.Completed;
      return true;
    }
    return false;
  }

  getTasks(filter?: TaskStatus): Task[] {
    if (!filter) return this.tasks;
    return this.tasks.filter((task) => task.status === filter);
  }
}
