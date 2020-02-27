import { WorkerActions } from './worker-actions';

export interface WorkerReponse {
  action: WorkerActions;
  payload: any;
  error?: Error;
}
