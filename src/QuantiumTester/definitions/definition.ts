import { Chance } from 'chance';
import { IGenerator } from './generators/IGenerator';

export abstract class Definition implements IGenerator{
  generatedValue: string | number | boolean;
  protected _chance;

  /**
   * Iternal do not use
   * @param chance
   */
  public set chance(chance) {
    this._chance = chance;
  }

  generate(regenerateIfExists: boolean): string | number | boolean {
    return undefined;
  }

}
