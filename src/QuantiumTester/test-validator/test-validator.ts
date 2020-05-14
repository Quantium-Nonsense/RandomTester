export class TestValidator {
  private _matchCase: TestValidatorActions;
  private _handleValidation: boolean;
  private _validationAsStage: string;
  private _expectedFromFunction: boolean

  constructor() {
  }

  /**
   * Delegates validation to a stage
   * @param shouldHandle
   * @param stageValidation
   * @deprecated
   */
  public setHandleValidation(shouldHandle = true, stageValidation: string): TestValidator {
    this._handleValidation = shouldHandle;
    this._validationAsStage = stageValidation;
    return this;
  }

  public set matchCase(value: TestValidatorActions) {
    this._matchCase = value;
  }

  public get matchCase(): TestValidatorActions {
    return this._matchCase;
  }

  public get handleValidation(): boolean {
    return this._handleValidation;
  }

  set expectedFromFunction(value: boolean) {
    this._expectedFromFunction = value;
  }
}

export enum TestValidatorActions {
  MATCH_EXACTLY,
  INCLUDE_VALUE,
  DEEP_MATCH_EXACTLY,
  EVALUATE_FUNCTION
}
