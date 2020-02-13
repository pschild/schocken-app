import { PlayerDto } from '@hop-backend-api';

export interface AllPlayerSelectionModalDialogData {
  players: PlayerDto[];
  activatedPlayerIds: string[];
}
