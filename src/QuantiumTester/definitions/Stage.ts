export class Stage {

  /**
   * Creates a new Stage to run during testing
   * @param _stageName The stage name
   * @param action The actions to be executed during this stage
   * @param _withInnerProps The inner props to pass to the actions
   * @param _stageOrder The order that this stage should be executed
   */
  constructor(
      private _stageName: string,
      public action: (...args) => void,
      private _withInnerProps: string[] = [],
      private _stageOrder = 0
  ) {
  }

  get stageName(): string {
    return this._stageName;
  }

  get stageOrder(): number {
    return this._stageOrder;
  }


  get withInnerProps(): string[] {
    return this._withInnerProps;
  }
}
