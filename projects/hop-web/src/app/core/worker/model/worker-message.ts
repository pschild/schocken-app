import { WorkerActions } from './worker-actions';

export interface WorkerMessage {
  action: WorkerActions;
  payload?: any;
}
