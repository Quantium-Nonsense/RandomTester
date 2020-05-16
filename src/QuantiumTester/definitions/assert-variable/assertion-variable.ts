import { PreparedFunction } from '../prepared-function';
import { VariableDescriptor } from './variable-descriptor';

export class AssertionVariable {
  private _descriptor: VariableDescriptor;

  constructor(
      private _varName: string,
      private _variable: PreparedFunction | string | number | boolean,
  ) {
  }


  get descriptor(): VariableDescriptor {
    return this._descriptor;
  }

  set descriptor(value: VariableDescriptor) {
    this._descriptor = value;
  }

  get varName(): string {
    return this._varName;
  }

  set varName(value: string) {
    this._varName = value;
  }

  get variable(): PreparedFunction | string | number | boolean {
    return this._variable;
  }

  set variable(value: PreparedFunction | string | number | boolean) {
    this._variable = value;
  }
}
