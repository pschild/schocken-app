import { PlayerDto } from '@hop-backend-api';

export interface AllPlayerSelectionModalDialogData {
  title: string;
  players: PlayerDto[];
  checkedPlayerIds: string[];
  disabledPlayerIds: string[];
}
