import { Chance } from 'chance';
import { QRange } from './definitions/generators/range';
import { Stage } from './definitions/Stage';
import { StringDefinition } from './definitions/generators/string-definition';
import { StageError, StagingError } from './errors/staging.error';

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
    this._staging = new Map<string, Stage>();
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
    const stageActions: Stage[] = [];
    this._staging.forEach((value) => stageActions.push(value)); // push to stage array
    // Sort array by order
    stageActions.sort((stage1, stage2) => stage1.stageOrder - stage2.stageOrder);
    stageActions.forEach(stage => stage.action());
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
