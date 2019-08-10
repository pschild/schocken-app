import { GameVO } from '../../core/domain/gameVO.model';

export interface IHomeState {
    loading: boolean;
    games: GameVO[];
}

export const initialHomeState: IHomeState = {
    loading: false,
    games: []
};
