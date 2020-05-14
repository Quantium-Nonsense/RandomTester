import { Stage } from './Stage';

export class StageSingle extends Stage {
  private _hasRun: boolean;

  /**
   * This stage ensures that it will only run once in all test iterations
   * I.e When you dont want to re-instantiate a spy that is created inside a stage
   * @param stageName
   * @param action
   * @param withInnerProps
   * @param stageOrder
   */
  constructor(
      stageName: string,
      action: (...args) => void,
      withInnerProps: string[],
      stageOrder = 0
  ) {
    super(stageName, action, withInnerProps, stageOrder);
  }


  /**
   * @async
   * Runs the stage if the stage has never executed before
   */
  async runStageAsync(): Promise<void> {
    if (!this._hasRun) {
      this._hasRun = true;
      return super.runStageAsync();
    }
  }

  /**
   * Runs the stage if the stage has never executed before
   */
  runStage(): void {
    if (!this._hasRun) {
      this._hasRun = true;
      super.runStage();
    }
  }

  get hasRun(): boolean {
    return this._hasRun;
  }

  set hasRun(value: boolean) {
    this._hasRun = value;
  }
}
