import { EntityType } from '../../entity';
import { EntityDto } from '../../entity/model/entity.dto';

export interface PlayerDto extends EntityDto {
  name: string;
  registered: Date;
  active: boolean;
}

// tslint:disable-next-line:no-namespace
export namespace PlayerDtoUtils {

  export function findNameById(players: PlayerDto[], id: string): string {
    return players.find(p => p._id === id)?.name;
  }

}

// tslint:disable-next-line:no-namespace
export namespace PlayerDtoTestdaten {
  export function create(id: string, name: string): PlayerDto {
    return {
      _id: id,
      type: EntityType.PLAYER,
      name,
      registered: new Date(),
      active: true
    };
  }
}
