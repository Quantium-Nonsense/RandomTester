import { Chance } from 'chance';
import { QRange } from './definitions/generators/range';
import { Stage } from './definitions/Stage';
import { StringDefinition } from './definitions/generators/string-definition';
import { AssertionError } from './errors/assertion.error';
import { KeyError } from './errors/key-error';
import { StageError, StagingError } from './errors/staging.error';
import { TestValidator, TestValidatorActions } from './test-validator/test-validator';

export class QuantiumTesting {
  private _failedAssertions: { expected: any; actual: any; info: { seed: number } }[];
  private readonly _object: { [key: string]: any };
  private readonly _chance: Chance.Chance;
  /**
   * The key of the property that will go through testing
   */
  private _validationProperty: string;
  private _validator: TestValidator;

  /**
   * User should be allowed to store staging functions
   * i.e
   * on start execute this
   * on middle execute this
   * on end run tests
   */
  private readonly _staging: Map<string, Stage>;
  private readonly _exposedValues: Map<string, any>;

  constructor(seed?: number) {
    if (!seed) {
      seed = Math.round(Math.random() * (Math.random() * 153000));
      console.warn(`QuantiumTesting: Seed not specified using seed ${ seed }`);
    }
    this._object = {};
    this._chance = new Chance(seed);
    this._staging = new Map<string, Stage>();
    this._validator = new TestValidator();
    this._exposedValues = new Map<string, any>();

  }

  /**
   * Sets the properties of the inner object
   * @param name the name of the value
   * @param val the actual value
   */
  public setProperty(name, val: QRange | StringDefinition) {
    val.chance = this._chance;
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
      const stageToCheck = this._staging.get(stage.stageName);
      if (stageToCheck || value.stageOrder === stage.stageOrder) {
        stageToAdd = value;
      }
    });

    // If it is but we have not been told to override throw error
    if (stageToAdd && !override) {
      throw new StagingError(StageError.STAGE_EXISTS);
    } else if (stageToAdd && override) {
      // Else if we been told to override
      // Delete old and override
      this._staging.delete(stageToAdd.stageName);
      this._staging.set(stage.stageName, stage);
    }
    this._staging.set(stage.stageName, stage);
  }

  public assertExposed(actual, expected, isInnerValue: boolean, assertionQuantity: number): boolean {
    for (let i = 0; i < assertionQuantity; i++) {
      this.runStaging();
      switch (this._validator.matchCase) {
        case TestValidatorActions.MATCH_EXACTLY:
          if (typeof actual !== 'object' && typeof actual !== 'function') {
            const value = isInnerValue ? this._object[expected].generate() : expected;
            if (actual !== expected) {
              this._failedAssertions.push({
                actual,
                expected,
                info: {
                  seed: Number(this._chance.seed)
                }
              });
            }
          }
      }

    }
    return this._failedAssertions.length === 0;
  }

  /**
   * Will set a value as exposed, this means the inner class can access it so it can assert it
   * @param value The value to expose
   * @param name The name of the value
   */
  public expose(value, name: string): void {
    let valueToAdd: any;

    this._exposedValues.forEach((val, key) => {
      const toCheck = this._exposedValues.get(name);
      if (toCheck) {
        valueToAdd = val;
      }
    });

    if (valueToAdd) {
      this._exposedValues.delete(name);
      this._exposedValues.set(name, value);
    } else {
      this._exposedValues.set(name, value);
    }
  }

  /**
   * Runs a specific stage by name
   * @param stageName The name of the stage to run
   * @param remove if the stage should be removed after it has run
   * @param withInnerProps Run stage with a property generated in the object
   */
  public runStage(stageName: string, remove = false, withInnerProps: string[] = null): void {
    const stage = this._staging.get(stageName);
    if (!stage) {
      throw new StagingError(StageError.STAGE_NOT_FOUND);
    }
    if (withInnerProps) {
      const propsList = [];
      withInnerProps.forEach(prop => {
        if (this._object.hasOwnProperty(prop)) {
          propsList.push(this._object[prop].generate());
        }
      });
      stage.action(...propsList);
    } else {
      stage.action();
    }
    if (remove) {
      this._staging.delete(stage.stageName);
    }
  }

  /**
   * Runs all stages by the order defined
   */
  public runStaging(): void {
    const stages: Stage[] = [];
    this._staging.forEach((value, key) => {
      stages.push(value);
    });
    stages.sort((s1, s2) => s1.stageOrder - s2.stageOrder);
    stages.forEach(s => {
      this.runStage(s.stageName, false, s.withInnerProps);
    });
  }

  /**
   * Set the parameter that will be tested
   * @param key
   * @returns Returns a configurable validator to set how the param will be tested
   */
  public paramToTest(key: string): TestValidator {
    if (!this._object.hasOwnProperty(key)) {
      throw new KeyError();
    }
    this._validationProperty = key;

    return this._validator;
  }

  public runValidationAsStage(stageName: string) {
    this._validator.setHandleValidation(false, stageName);
  }

  public validateFor(quantity: number) {
  }

  assert(): void {

  }


  private generateObject<T>(): T {
    const obj = {};
    Object.keys(this._object).forEach(key => {
      if (this._object[key] instanceof StringDefinition) {
        const sDef: StringDefinition = (this._object[key] as StringDefinition);
        obj[key] = sDef.generate();
      }
      if (this._object[key] instanceof QRange) {
        const qRange: QRange = (this._object[key] as QRange);
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
