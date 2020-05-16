import { AssertionVariable } from './definitions/assert-variable/assertion-variable';
import { BooleanBranchDescriptor } from './definitions/assert-variable/descriptors/boolean-branch.descriptor';
import { VariableDescriptor } from './definitions/assert-variable/variable-descriptor';
import { GeneratorUtils } from './definitions/generators/generator.utils';
import { QRange } from './definitions/generators/range';
import { StringDefinition } from './definitions/generators/string-definition';
import { PreparedFunction } from './definitions/prepared-function';
import { Stage } from './definitions/stage/Stage';
import { KeyError } from './errors/key-error';
import { StageError, StagingError } from './errors/staging.error';
import { LoggerModel } from './loggers/logger.model';
import { Infer } from './object-creators/Infer';
import { TestValidator, TestValidatorActions } from './test-validator/test-validator';
import * as _ from 'lodash';

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
  public setProperty(name, val: QRange | StringDefinition) {
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

  public assertExposed(actual, expected, isInnerValue: boolean, assertionQuantity: number): boolean {
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
   * Will set a variable that will be asserted later on
   * This is used for the automated tests
   * @param variable
   */
  public setAssertionVariable(variable: AssertionVariable) {
    // Check if name exists in map
    const varToCheck = this._assertionVariables.get(variable.varName);
    if (varToCheck) {
      this._assertionVariables.delete(varToCheck.varName);
      this._assertionVariables.set(variable.varName, variable);
    } else {
      this._assertionVariables.set(variable.varName, variable);
    }
  }

  /**
   * Asserts a set variable automatically for set number of times based on descriptor
   * @param variableName
   * @param quantity
   */
  public assertAutomatedVariable(variableName: string, quantity: number): void {
    // Get variable
    const actual: AssertionVariable = this._assertionVariables.get(variableName);
    if (!actual) {
      throw new Error('Could not find variable name');
    }
    this.runStages(this.getSortedStages());
    if (actual.variable instanceof PreparedFunction) {
      const variable: PreparedFunction = actual.variable;
      const returnedValue = variable.shouldExecuteWithInnerProps()
          ? variable.executeWith(this.getMultipleInnerByValue(variable.withInnerProps))
          : variable.executeWith(variable.props);

      if (actual.descriptor instanceof BooleanBranchDescriptor) {
        this.evaluateBooleanBranch(returnedValue, actual.descriptor);
      }
    }
    quantity -= quantity;
    if (quantity > 0) {
      this.assertAutomatedVariable(variableName, quantity);
    }
  }

  public setDescriptorForVariable(varName: string, descriptor: VariableDescriptor): void {
    const varToSetDescriptor = this._assertionVariables.get(varName);

    if (!varToSetDescriptor) {
      throw new Error('No such variable has been set!');
    }

    varToSetDescriptor.descriptor = descriptor;
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

  private evaluateBooleanBranch(returnedValue: boolean, descriptor: BooleanBranchDescriptor) {
    // if prepared function we need to execute function
    // if returned Value is truthy
    if (returnedValue) {
      // we look what should happen at the descriptor
      const decriptorGuessedCorrectly = descriptor.ifEvaluatesToTrueExpect();
      // If the descriptor guess is right the test has resolved correctly otherwise we add to fail assertions
      if (!decriptorGuessedCorrectly) {
        this._failedAssertions.push({
          actual: returnedValue,
          expected: descriptor,
          info: {
            message: 'The descriptors function did not evaluate to true',
            seed: this._chance.seed
          }
        });
      }
      return;
    }
    // If returned value evaluates to falsy
    if (!returnedValue) {
      const decriptorGuessedCorrectly = descriptor.ifEvaluatesToFalseExpect();
      // If the descriptor guess is right the test has resolved correclty otherwise we add to fail assertions
      if (!decriptorGuessedCorrectly) {
        this._failedAssertions.push({
          actual: returnedValue,
          expected: descriptor,
          info: {
            message: 'The descriptors function did not evaluate to true',
            seed: this._chance.seed
          }
        });
      }
    }

  }

  private getExpectedValue(expected, isInnerValue: boolean) {
    let expectedValue;
    if (expected instanceof PreparedFunction) {
      expectedValue = expected.shouldExecuteWithInnerProps()
          ? expected.executeWith(...this.getMultipleInnerByValue(expected.withInnerProps))
          : expected.executeWith(...expected.props);
    } else {
      expectedValue = isInnerValue ? GeneratorUtils.getGeneratorAsValue(expected, false, this._object) : expected;
    }

    return expectedValue;
  }

  private getMultipleInnerByValue(innerNames: string[]) {
    const toReturn = [];
    innerNames.forEach(name => {
      toReturn.push(GeneratorUtils.getGeneratorAsValue(name, false, this._object));
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
