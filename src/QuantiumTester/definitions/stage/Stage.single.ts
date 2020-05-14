import { Stage } from './Stage';

export class StageSingle extends Stage{
  private _hasRun: boolean;

  constructor(
      stageName: string,
      action: (...args) => void,
      withInnerProps: string[],
      stageOrder = 0
      ) {
    super(stageName, action, withInnerProps, stageOrder);
  }



  get hasRun(): boolean {
    return this._hasRun;
  }

  set hasRun(value: boolean) {
    this._hasRun = value;
  }
}
