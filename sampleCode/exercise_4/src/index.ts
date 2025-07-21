import { TaskManager } from './services/TaskManager';
import { TaskStatus } from './models/Task';
import { printTasks } from './utils/printTasks';

const manager = new TaskManager();

// add task
manager.addTask('Reading TypeScript');
manager.addTask('Do the exercise and submit sample code');
manager.addTask('Get practice with TypeScript');
manager.addTask('Start a practice project with TypeScript');

// complete task
manager.completeTask(1);
manager.completeTask(2);

// print all tasks
printTasks(manager.getTasks());

// print tasks by status
printTasks(manager.getTasks(TaskStatus.Pending));

// print completed tasks
printTasks(manager.getTasks(TaskStatus.Completed));
