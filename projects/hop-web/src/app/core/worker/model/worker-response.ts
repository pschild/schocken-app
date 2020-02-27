import { WorkerActions } from './worker-actions';

export interface WorkerResponse {
  action: WorkerActions;
  payload: any;
  error?: Error;
}
