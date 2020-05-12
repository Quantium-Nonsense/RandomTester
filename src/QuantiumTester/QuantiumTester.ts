export class QuantiumTesting {
  private _object: {[key: string]: any};

  public setProperty(name, val: Range | StringDefinition[]) {
    this._object.name = val;
  }

  /**
   * Generates a string based on the String definition provided
   * @param length the length of the string
   * @param chars the {@link StringDefinition} to use
   */
  private randomString = (length, chars: StringDefinition[]) => {
    let mask = '';

    if (chars.includes(StringDefinition.LOWER_LETTERS)) {
      mask += 'abcdefghijklmnopqrstuvwxyz';
    }
    if (chars.includes(StringDefinition.UPPER_CASE_LETTERS)) {
      mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    }
    if (chars.includes(StringDefinition.NUMERIC)) {
      mask += '0123456789';
    }
    if (chars.includes(StringDefinition.SPECIAL_CHARS)) {
      mask += '~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\';
    }

    let result = '';

    for (let i = length; i > 0; i -= 1) {
      result += mask[Math.floor(Math.random() * mask.length)];
    }

    return result;
  };

}

export enum StringDefinition {
  /**
   * Indicates to include lower case letters
   */
  LOWER_LETTERS = 'a',
  /**
   * Indicates to include upper case letters
   */
  UPPER_CASE_LETTERS = 'A',
  /**
   * Idnicates inclusion of numeric characters
   */
  NUMERIC = '#',
  /**
   * indicates inclusion of special characters
   */
  SPECIAL_CHARS = '!'
}
