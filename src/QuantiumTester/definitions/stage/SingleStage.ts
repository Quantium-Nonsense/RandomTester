import { Stage } from './Stage';

/**
 * Ensures that a stage will always run once in the entire lifecycle of the tests
 */
export class SingleStage extends Stage {
  private _hasRun: boolean;

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
