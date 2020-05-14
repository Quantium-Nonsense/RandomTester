import { PropsError } from '../..';

export class PreparedFunction {
  /**
   * Creates a prepared function for assertion
   * @param _func The function to run during assertion
   * @param _withInnerProps If the function should be passed some inner params
   * @param _props Pass any props to the function
   */
  constructor(
      private _func: (...args) => any,
      private _withInnerProps?: string[],
      private _props?: any
  ) {
    if (this._props && this._withInnerProps) {
      throw new PropsError('Cannot declare both props and inner props');
    }
  }

  executeWith(...props): any {
    return this._func(...props);
  }

  async executeWithAsync(...props): Promise<any> {
    return await this._func(...props);
  }

  shouldExecuteWithInnerProps(): boolean {
    return !!this._withInnerProps;
  }

  shouldExecuteWithOwnProps(): boolean {
    return !!this._props;
  }

  get func(): (...args) => any {
    return this._func;
  }

  get withInnerProps(): string[] {
    return this._withInnerProps;
  }

  set withInnerProps(value: string[]) {
    if (this._props) {
      throw new PropsError('Props are set please delete them before setting with inner props');
    }
    this._withInnerProps = value;
  }

  get props(): any {
    return this._props;
  }

  set props(value: any) {
    if (this._withInnerProps) {
      throw new PropsError('Inner props are set please delete or clear them before setting props');
    }
    this._props = value;
  }
}

