import * as _ from 'lodash';
import { AssertionVariable } from './definitions/assert-variable/assertion-variable';
import { BooleanBranchDescriptor } from './definitions/assert-variable/descriptors/boolean-branch.descriptor';
import { Descriptor } from './definitions/assert-variable/descriptors/descriptor';
import { GeneratorUtils } from './definitions/generators/generator.utils';
import { PreparedFunction } from './definitions/prepared-function';
import { Definition } from './definitions/definition';
import { Stage } from './definitions/stage/Stage';
import { KeyError } from './errors/key-error';
import { StageError, StagingError } from './errors/staging.error';
import { LoggerModel } from './loggers/logger.model';
import { Infer } from './object-creators/Infer';
import { TestValidator, TestValidatorActions } from './test-validator/test-validator';

// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
const Chance = require('chance');

export class QuantiumTesting {
  private _failedAssertions: LoggerModel[] = [];
  private readonly _object: { [key: string]: any };
  private readonly _assertionVariables: Map<string, AssertionVariable>;
  private readonly _chance;
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
  private _verbose: boolean;
  private _preparedFunction: PreparedFunction;

  constructor(seed?: number, verbose = false) {
    if (!seed) {
      seed = Math.round(Math.random() * (Math.random() * 153000));
      console.warn(`QuantiumTesting: Seed not specified using seed ${ seed }`);
    }
    this._verbose = verbose;
    this._object = {};
    this._chance = new Chance(seed);
    this._staging = new Map<string, Stage>();
    this._validator = new TestValidator();
    this._exposedValues = new Map<string, any>();
    this._failedAssertions = [];
    this._assertionVariables = new Map<string, AssertionVariable>();
  }

  /**
   * Creates an inner object by infering the types of the passed object
   * NOTE: THE CLASS MUST BE INSTANTIATED WITH NON NULL VALUES
   * All null values will be set as string definition
   */
  public inferAndCreateInner(objectToInfer, asObjectName?: string) {
    const innerObj = Infer.object(objectToInfer, this._verbose, this._chance);

    // If the user desires to set the infered object as a sub object of the inner object
    if (asObjectName) {
      this._object[asObjectName] = {
        ...innerObj
      };
    } else {
      // Otherwise populate the inner object with keys inferred from object
      Object.keys(innerObj).forEach(key => {
        this._object[key] = innerObj[key];
      });

    }
  }

  /**
   * Sets the properties of the inner object
   * @param name the name of the value
   * @param val the actual value
   */
  public setProperty<T extends Definition>(name, val: T) {
    val.chance = this._chance;
    this._object[name] = val;
  }

  /**
   * Set steps for the tester to execute in an order or call them manually by the stageName in {@link Stage}
   * @param stage The stage with ascociated actions and order
   * @param override In case of a stage with the same name or order already defined this will override it or throw error
   */
  public setStaging(stage: Stage, override = false): void {
    let stageToAdd: Stage;
    stage.object = this._object;
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

  public async withAsyncAssertExposed(actual, expected, isInnerValue: boolean, assertionQuantity: number): Promise<boolean> {
    if (this._verbose) {
      console.log(`QuantiumTesting: Assertion no: ${ assertionQuantity }`);
    }

    await this.runStagesAsync(this.getSortedStages());
    switch (this._validator.matchCase) {
      case TestValidatorActions.MATCH_EXACTLY:
        if (typeof actual !== 'object' && typeof actual !== 'function') {
          const expectedValue = isInnerValue ? this._object[expected].generate() : expected;
          const actualValue = this._exposedValues.get(actual);
          if (this._verbose) {
            this.printLog(expectedValue, actualValue);
          }
          if (actualValue !== expectedValue) {
            this._failedAssertions.push({
              actual: actualValue,
              expected: expectedValue,
              info: {
                seed: Number(this._chance.seed),
                message: 'Failed at evaluation'
              }
            });
            console.log(this._failedAssertions[this.failedAssertions.length - 1]);
          }
        }
        assertionQuantity -= 1;
        if (assertionQuantity <= 0) {
          return this._failedAssertions.length === 0;
        }
        await this.withAsyncAssertExposed(actual, expected, isInnerValue, assertionQuantity);
    }
  }

  public assertExposed(
      actual: string,
      expected: PreparedFunction
          | string | boolean
          | number | Definition,
      isInnerValue: boolean,
      assertionQuantity: number
  ): boolean {
    // If no validator has been defined fallback to match exactly validation
    this.setFallbackValidator();
    if (this._verbose) {
      console.log(`QuantiumTesting: Assertion no: ${ assertionQuantity }`);
    }
    this.runStages(this.getSortedStages());

    switch (this._validator.matchCase) {
      case TestValidatorActions.MATCH_EXACTLY:
        if (typeof actual !== 'function') {
          // If we are comparing inner value it means its a generator value or generator object
          // return the appropriate plain value
          const expectedValue = this.getExpectedValue(expected, isInnerValue);
          const actualValue = this._exposedValues.get(actual);
          if (_.isEqual(actualValue, expectedValue)) {
            this.logFailedAssertion(actualValue, expectedValue, assertionQuantity);
            console.log(this._failedAssertions[this.failedAssertions.length - 1]);
          }
        }
        break;
      case TestValidatorActions.INCLUDE_VALUE:
        break;
      default:
        break;
    }
    assertionQuantity -= 1;
    if (assertionQuantity <= 0) {
      return this._failedAssertions.length === 0;
    }
    this.assertExposed(actual, expected, isInnerValue, assertionQuantity);
    return this._failedAssertions.length === 0;
  }


  /**
   * Will set a value as exposed, this means the inner class can access it so it can assert it
   * This is the actual value
   * @param value The value to expose
   * @param name The name of the value
   */
  public expose(value, name: string): void {
    let valueToExpose: any;

    this._exposedValues.forEach((val, key) => {
      const toCheck = this._exposedValues.get(name);
      if (toCheck) {
        valueToExpose = val;
      }
    });

    if (valueToExpose) {
      /*   if (this._verbose) {
       //console.log('exposed value found deleting and adding....');
       }*/
      this._exposedValues.delete(name);
      this._exposedValues.set(name, value);
    } else {
      /*  if (this._verbose) {
       console.log('exposed value not found adding....');
       console.log(`Value to add ${ value } with name ${ name }`);
       }*/
      this._exposedValues.set(name, value);
    }
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

  public setValidationRules(validationRule: TestValidatorActions) {
    this._validator.matchCase = validationRule;
  }

  /**
   * ONLY FOR DEVELOPMENT DO NOT USE THIS
   */
  public getInner() {
    return this._object;
  }

  get failedAssertions(): { expected: any; actual: any; info: { seed: number; message: string } }[] {
    return this._failedAssertions;
  }

  /**
   * Turns the expected value into an actual value or returns the value as is
   * This means the expected value might be a prepared function a definition etc. we need to have na actual value
   * @param expected
   * @param isInnerValue
   */
  private getExpectedValue(
      expected: PreparedFunction
          | string | boolean
          | number | Definition, isInnerValue: boolean) {
    let expectedValue;
    // If prepared function run with params and return evaluation
    if (expected instanceof PreparedFunction) {
      expectedValue = expected.shouldExecuteWithInnerProps()
          ? expected.executeWith(...this.getMultipleInnerByValue(expected.withInnerProps))
          : expected.executeWith(...expected.props.map((definition: Definition) => {
            return definition.generate(true);
          }));
      return expectedValue;
    }
    // Otherwise check if is inner value name or plain value
    if (isInnerValue) {
      if (typeof expected !== 'string') {
        throw new Error('If isInnerValue is set to true expected value must be the string name that was set');
      }
      return GeneratorUtils.getGeneratorFromInnerAsValue(expected, false, this._object);
    }
    return expected;
  }

  private getMultipleInnerByValue(innerNames: string[]) {
    const toReturn = [];
    innerNames.forEach(name => {
      toReturn.push(GeneratorUtils.getGeneratorFromInnerAsValue(name, false, this._object));
    });
    return toReturn;
  }

  private setFallbackValidator() {
    if (!this._validator.matchCase) {
      this._validator.matchCase = TestValidatorActions.MATCH_EXACTLY;
    }
  }

  /**
   * Pushes a failed assertion to the failed assertion list
   * @param actualValue
   * @param expectedValue
   * @param assertionQuantity
   */
  private logFailedAssertion(actualValue, expectedValue, assertionQuantity: number) {
    this._failedAssertions.push({
      actual: actualValue,
      expected: expectedValue,
      info: {
        seed: Number(this._chance.seed),
        message: `Failed at evaluation ${ assertionQuantity }`
      }
    });

  }

  /**
   * @async
   * Runs a specific stage by name that requires async functionality in actions
   * @param stageName The name of the stage to run
   * @param remove if the stage should be removed after it has run
   * @param withInnerProps Run stage with a property generated in the object
   */
  private async runStageAsync(stageName: string, remove = false): Promise<void> {
    const stage = this._staging.get(stageName);
    if (!stage) {
      throw new StagingError(StageError.STAGE_NOT_FOUND);
    }
    try {
      await stage.runStageAsync();
    } catch (e) {
      this.failedAssertions.push({
        expected: null,
        actual: null,
        info: {
          seed: this._chance.seed,
          message: `Failed at preparing Stage: ${ stageName } with error ${ (e as Error).message }`
        }
      });
    }
    if (remove) {
      this._staging.delete(stage.stageName);
    }
  }

  /**
   * Runs a specific stage by name
   * @param stageName The name of the stage to run
   * @param remove if the stage should be removed after it has run
   * @param withInnerProps Run stage with a property generated in the object
   */
  private runStage(stageName: string, remove = false): void {
    const stage = this._staging.get(stageName);
    if (!stage) {
      throw new StagingError(StageError.STAGE_NOT_FOUND);
    }
    try {
      stage.runStage();
    } catch (e) {
      this.failedAssertions.push({
        expected: null,
        actual: null,
        info: {
          seed: this._chance.seed,
          message: `Failed at preparing Stage: ${ stageName } with error ${ (e as Error).message }`
        }
      });
    }
    if (remove) {
      this._staging.delete(stage.stageName);
    }
  }

  /**
   * Runs all stages by the order defined
   */
  private runStages(stages: Stage[]): void {
    const toExecute: Stage[] = [...stages];
    if (this._verbose) {
      console.log(`QuantiumTesting: Stages to execute no: ${ toExecute.length }`);
    }
    this.runStage(toExecute[0].stageName, false);
    toExecute.reverse().pop();
    toExecute.reverse();
    if (toExecute.length > 0) {
      this.runStages(toExecute);
    }
    return;
  }

  /**
   * @async
   * Runs all stages by the order defined allows for async actions in stage
   */
  private async runStagesAsync(stages: Stage[]): Promise<void> {
    const toExecute: Stage[] = [...stages];
    if (this._verbose) {
      console.log(`QuantiumTesting: Stages to execute no: ${ toExecute.length }`);
    }
    await this.runStageAsync(toExecute[0].stageName);
    toExecute.reverse().pop();
    toExecute.reverse();
    if (toExecute.length > 0) {
      await this.runStagesAsync(toExecute);
    }
    return;
  }

  private getSortedStages(): Stage[] {
    const stages = [];
    this._staging.forEach((value, key) => {
      stages.push(value);
    });
    stages.sort((s1, s2) => s1.stageOrder - s2.stageOrder);
    return stages;
  }

  /**
   * Prints a simple log
   * @param expected
   * @param actual
   */
  private printLog(expected, actual) {
    console.log(`QuantiumTesting: Expected: ${ expected }\nActual: ${ actual }`);
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
  ALL = 'ALL',
  /**
   * Prevent javascript empty objects
   */
  NOT_EMPTY = 'NOT_EMPTY'
}
