import { QRange } from './definitions/range';
import { Stage } from './definitions/Stage';
import { StringDefinition } from './definitions/string-definition';
import { Chance } from 'chance';
import { StagingError } from './errors/staging.error';

export class QuantiumTesting {
  private readonly _object: { [key: string]: any };
  private readonly _chance;
  /**
   * User should be allowed to store staging functions
   * i.e
   * on start execute this
   * on middle execute this
   * on end run tests
   */
  private readonly _staging: Map<string, Stage>;

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

  /**
   * Generates objects specified by the generics provided
   * @param quantity How many objects to create default 1
   */
  public generateObjects<T>(quantity = 1): T[] {
    const obj: T[] = [];
    for (let i = 0; i < quantity; i++) {
      obj.push(this.generateObject<T>());
    }
    return obj;
  }

  /**
   * Set steps for the tester to execute in an order or call them manually by the stageName in {@link Stage}
   * @param stage The stage with ascociated actions and order
   * @param override In case of a stage with the same name or order already defined this will override it or throw error
   */
  public setStaging(stage: Stage, override = false): void {
    let stageToAdd: Stage;

    // Look if any stage with the same stage name or order is already defined
    this._staging.forEach((value: Stage, key: string) => {
      if (this._staging.get(key) || value.stageOrder === stage.stageOrder) {
        stageToAdd = value;
      }
    });

    // If it is but we have not been told to override throw error
    if (stageToAdd && !override) {
      throw new StagingError();
    } else if (stageToAdd && override) {
      // Else if we been told to override
      // Delete old and override
      this._staging.delete(stageToAdd.stageName);
      this._staging.set(stage.stageName, stage);
    }
    this._staging.set(stage.stageName, stage);
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
