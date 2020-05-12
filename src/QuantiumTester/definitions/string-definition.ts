import { StringDefError } from '../errors/string-def-error';
import { StringDefinitionValue } from '../QuantiumTester';
import { Seedable } from './seedable';

export class StringDefinition extends Seedable {
  private _definitions: StringDefinitionValue[] | string[] = [];
  private _length: number;
  private _custom: boolean;

  constructor(defs: StringDefinitionValue[] | string[], length: number, custom = false) {
    super();
    this._definitions = defs;
    this._length = length;
    this._custom = custom;
  }

  /**
   * Generates a string based on the String definition provided
   * @param length the length of the string
   * @param chars the {@link StringDefinitionValue} to use
   */
  public randomString = (): string => {
    if (!this._definitions) {
      throw new StringDefError();
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

    let result = '';

    for (let i = this._length; i > 0; i -= 1) {
      result += mask[Math.floor(this._chance.floating({min: 0, max: 1}) * mask.length)];
    }

    return result;
  };

  private generateFromRandomFromProvidedStrings(): string {
    return this._definitions[this._chance.integer({min: 0, max: this._definitions.length - 1})]
  }

  get definitions(): StringDefinitionValue[] | string[] {
    return this._definitions;
  }

  get length(): number {
    return this._length;
  }
}
