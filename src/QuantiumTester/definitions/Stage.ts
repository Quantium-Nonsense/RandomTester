export class Stage {

  /**
   * Creates a new Stage to run during testing
   * @param _stageName The stage name
   * @param _actions The actions to be executed during this stage
   * @param _stageOrder The order that this stage should be executed
   */
  constructor(
      private _stageName: string,
      private _actions: () => void,
      private _stageOrder = 0
  ) {
  }

  get action(): () => void {
    return this._actions;
  }

  get stageName(): string {
    return this._stageName;
  }

  get stageOrder(): number {
    return this._stageOrder;
  }
}
