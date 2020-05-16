import { Definition } from '../definition';
import { IGenerator } from './IGenerator';

export class QRange extends Definition {
  generatedValue: string | number | boolean;

  private _from: number;
  private _to: number;
  private _asInteger: boolean;
  private _allowNullable: boolean;

  constructor(from: number, to: number, asInteger = false, allowNullable = false) {
    super();
    if (from > to) {
      throw new RangeError();
    }
    this._from = from;
    this._to = to;
    this._asInteger = asInteger;
    this._allowNullable = allowNullable;
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
    let generated;

    if (this._allowNullable && this._chance.integer({min: 0, max: 100}) <= 5) { // 5% chance of triggering
      generated = this._chance.pickone([null, undefined, NaN]);
      this.generatedValue = generated;
      return generated;
    }
    generated = this._asInteger ? this._chance.integer({
      min: this._from,
      max: this._to
    }) : this._chance.floating({
      min: this._from,
      max: this._to
    });
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
