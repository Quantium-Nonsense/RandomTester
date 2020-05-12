import { Chance } from 'chance';

export abstract class Seedable {
  protected _chance: Chance.Chance;

  /**
   * Iternal do not use
   * @param chance
   */
  public set chance(chance: Chance.Chance) {
    this._chance = chance;
  }

}
