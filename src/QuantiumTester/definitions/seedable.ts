import { Chance } from 'chance';

export abstract class Seedable {
  protected _chance;

  /**
   * Iternal do not use
   * @param chance
   */
  public set chance(chance) {
    this._chance = chance;
  }

}
