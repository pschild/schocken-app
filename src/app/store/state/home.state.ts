import { GameVO } from 'src/app/core/domain/gameVO.model';

export interface IHomeState {
    loading: boolean;
    games: GameVO[];
}

export const initialHomeState: IHomeState = {
    loading: false,
    games: []
};
