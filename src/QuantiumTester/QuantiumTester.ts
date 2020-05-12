import { QRange } from './definitions/range';
import { StringDefinition } from './definitions/string-definition';
import { Chance } from 'chance';

export class QuantiumTesting {
  private _object: { [key: string]: any };
  private _chance;

  constructor(seed?: number) {
    if (!seed) {
      seed = Math.round(Math.random() * (Math.random() * 153000));
      console.warn(`QuantiumTesting: Seed not specified using seed ${ seed }`);
    }
    this._object = {};
    this._chance = new Chance(seed);
  }

  /**
   * Sets the properties of the inner object
   * @param name the name of the value
   * @param val the actual value
   */
  public setProperty(name, val: QRange | StringDefinition) {
    this._object[name] = val;
  }

  public generateObjects<T>(quantity: number): T[] {
    const obj: T[] = [];
    for (let i = 0; i < quantity; i++) {
      obj.push(this.generateObject<T>());
    }
    return obj;
  }

  private generateObject<T>(): T {
    const obj = {};
    Object.keys(this._object).forEach(key => {
      if (this._object[key] instanceof StringDefinition) {
        const sDef: StringDefinition = (this._object[key] as StringDefinition);
        sDef.chance = this._chance;
        obj[key] = sDef.randomString();
      }
      if (this._object[key] instanceof QRange) {
        const qRange: QRange = (this._object[key] as QRange);
        qRange.chance = this._chance;
        obj[key] = qRange.generate();
      }
    });

    return obj as T;
  }


}

export enum StringDefinitionValue {
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
  SPECIAL_CHARS = '!',
  /**
   * Indicate inclusion of all characters
   */
  ALL = 'ALL'
}
