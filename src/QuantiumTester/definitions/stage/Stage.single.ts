import { Stage } from './Stage';

export class StageSingle extends Stage {
  private _hasRun: boolean;

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
