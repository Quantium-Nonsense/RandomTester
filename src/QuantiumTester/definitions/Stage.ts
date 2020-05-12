export class Stage {

  constructor(
      private _stageName: string,
      private _actions: () => void,
      private _stageOrder = 0
  ) {
  }

  get actions(): () => void {
    return this._actions;
  }

  get stageName(): string {
    return this._stageName;
  }

  get stageOrder(): number {
    return this._stageOrder;
  }
}
