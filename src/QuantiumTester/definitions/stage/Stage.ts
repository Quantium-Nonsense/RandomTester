import { GeneratorUtils } from '../generators/generator.utils';

export class Stage {
  /**
   * This variable is set by the QuantiumTester.setStage
   */
  private _object;

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

  public async runStageAsync(): Promise<void> {
     if (this._withInnerProps) {
       await this.action(...this.getStageProps());
     } else {
       await this.action();
     }
  }

  public runStage(): void {
    if (this._withInnerProps) {
      this.action(...this.getStageProps());
    } else {
      this.action();
    }
  }

  private getStageProps(): any[] {
    const propsList = [];

    if (this.withInnerProps) {
      this._withInnerProps.forEach(prop => {
        if (this._object.hasOwnProperty(prop)) {
          propsList.push(GeneratorUtils.getGeneratorFromInnerAsValue(prop, true, this._object));
        }
      });
    }

    return propsList;
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


  set object(value) {
    this._object = value;
  }
}
