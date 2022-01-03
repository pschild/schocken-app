export namespace SoundboardActions {

  export class Play {
    static readonly type = '[SoundboardActions] play';

    constructor(public key: string) {
    }
  }
}
