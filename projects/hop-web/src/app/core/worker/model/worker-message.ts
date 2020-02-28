import { WorkerActions } from './worker-actions';

export interface WorkerMessage {
  uuid?: string;
  action: WorkerActions;
  payload?: any;
}
