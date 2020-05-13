import { Seedable } from '../seedable';
import { IGenerator } from './IGenerator';

export class QRange extends Seedable implements IGenerator {
  generatedValue: string | number;

  private _from: number;
  private _to: number;
  private _asInteger: boolean;

  constructor(from: number, to: number, asInteger = false) {
    super();
    if (from > to) {
      throw new RangeError();
    }
    this._from = from;
    this._to = to;
    this._asInteger = asInteger;
  }

  /**
   * Returns a random value between the specified range
   */
  generate(regenerateIfExists = false): number {
    if (!regenerateIfExists) {
      if (this.generatedValue) {
        return +this.generatedValue;
      }
    }
    const generated = this._chance.integer({min: this._from, max: this._to});
    this.generatedValue = generated;
    return generated;
  }

  get from(): number {
    return this._from;
  }

  get to(): number {
    return this._to;
  }

}
