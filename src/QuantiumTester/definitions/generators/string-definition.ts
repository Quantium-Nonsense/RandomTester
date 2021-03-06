import { StringDefError } from '../../errors/string-def.error';
import { StringDefinitionValue } from '../../QuantiumTester';
import { Definition } from '../definition';
import { IGenerator } from './IGenerator';

export class StringDefinition extends Definition {
  generatedValue: string | number;

  private _definitions: StringDefinitionValue[] | string[] = [];
  private _length: number | {from: number; to: number};
  private _custom: boolean;

  /**
   * Creates a new String definition object that allows for random strings, or random strings based on strings provided
   * @param defs The random String that will be returned either from custom definition or random generated
   * @param length The length of the random generated strings - Doesnt matter if custom is set to true
   * @param custom If the user wants to provide custom strings to generate from
   */
  constructor(defs: StringDefinitionValue[] | string[], length: number | {from: number; to: number} = null, custom = false) {
    super();
    this._definitions = defs;
    this._length = length;
    this._custom = custom;
  }

  /**
   * Generates a string based on the String definition provided
   * @param regenerateIfExists Weather to re generate the value if it has already been generated
   */
  public generate = (regenerateIfExists = false): string => {
    if (!this._definitions) {
      throw new StringDefError();
    }

    let result = '';
    let randomLength;
    if (typeof this._length === 'object') {
      randomLength = this._chance.integer({
        min: this._length.from, max: this._length.to
      });
    } else {
      randomLength = +this._length;
    }

    // If NOT_EMPTY Flag is not set include special js 'empty' Cases
    if (!this._definitions.includes(StringDefinitionValue.NOT_EMPTY)) {
      const specialCaseChance = (1 / randomLength) * 100;
      if (this._chance.integer({min: 0, max: 100}) <= specialCaseChance) {
        result = this._chance.pickone([null, undefined, 'null', 'undefined', {}, [], '']);
        this.generatedValue = result;
      }
    }

    if (!regenerateIfExists) {
      if (this.generatedValue) {
        return this.generatedValue.toString();
      }
    }

    let mask = '';

    if (this._custom) {
      return this.generateFromRandomFromProvidedStrings();
    }

    if (!this._definitions.includes(StringDefinitionValue.ALL)) {
      if (this._definitions.includes(StringDefinitionValue.LOWER_LETTERS)) {
        mask += 'abcdefghijklmnopqrstuvwxyz';
      }
      if (this._definitions.includes(StringDefinitionValue.UPPER_CASE_LETTERS)) {
        mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      }
      if (this._definitions.includes(StringDefinitionValue.NUMERIC)) {
        mask += '0123456789';
      }
      if (this._definitions.includes(StringDefinitionValue.SPECIAL_CHARS)) {
        mask += '~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\';
      }
    } else {
      mask += 'abcdefghijklmnopqrstuvwxyz';
      mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      mask += '0123456789';
      mask += '~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\';
    }


    // Allow to return just ''
    for (let i = randomLength; i > 0; i -= 1) {
      result += mask[Math.floor(this._chance.floating({min: 0, max: 1}) * mask.length)];
    }

    this.generatedValue = result;
    return result;
  };

  private generateFromRandomFromProvidedStrings(): string {
    return this._definitions[this._chance.integer({min: 0, max: this._definitions.length - 1})];
  }

  get definitions(): StringDefinitionValue[] | string[] {
    return this._definitions;
  }

  get length(): number | {from: number; to: number} {
    return this._length;
  }

}
