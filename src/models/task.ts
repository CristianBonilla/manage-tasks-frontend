export enum TaskStatus {
  NotCompleted = 'NotCompleted',
  Completed = 'Completed'
}

export interface TaskRequest {
  action: string;
  status: TaskStatus;
}

export interface TaskResponse {
  taskId: string;
  action: string;
  status: TaskStatus;
  created: Date;
}
