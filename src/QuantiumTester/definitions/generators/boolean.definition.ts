import { Definition } from '../definition';
import { IGenerator } from './IGenerator';

export class BooleanDefinition extends Definition {
  generatedValue: boolean;

  constructor(
      private _initialValue: boolean,
      private _allowNullable = false
  ) {
    super();
  }

  generate(regenerateIfExists = false): boolean {
    if (!regenerateIfExists) {
      if (this.generatedValue) {
        return this.generatedValue;
      }
    }

    let generated;
    // Chance of returning JS nullable
    if (this._allowNullable && this._chance.integer({min: 0, max: 100}) <= 5) {
      generated = this._chance.pickone([null, undefined, []]);
      this.generatedValue = generated;
      return generated;
    }

    generated = this._chance.pickone([true, false]);
    this.generatedValue = generated;
    return generated;
  }
}
