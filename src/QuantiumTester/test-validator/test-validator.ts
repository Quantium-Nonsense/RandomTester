export class TestValidator {
  private _matchCase: TestValidatorActions;
  private _handleValidation: boolean;
  private _validationAsStage: string;

  constructor() {
  }

  /**
   * Delegates validation to a stage
   * @param shouldHandle
   * @param stageValidation
   */
  public setHandleValidation(shouldHandle = true, stageValidation: string): TestValidator {
    this._handleValidation = shouldHandle;
    this._validationAsStage = stageValidation;
    return this;
  }

  public expectToMatchExact(): TestValidator {
    this._matchCase = TestValidatorActions.MATCH_EXACTLY;
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
}

export enum TestValidatorActions {
  MATCH_EXACTLY,
  INCLUDE_VALUE
}
