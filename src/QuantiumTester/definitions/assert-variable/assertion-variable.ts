import { PreparedFunction } from '../prepared-function';
import { Descriptor } from './descriptors/descriptor';

export class AssertionVariable {
  private _descriptor: Descriptor;

  constructor(
      private _varName: string,
      private _variable: PreparedFunction | string | number | boolean,
  ) {
  }


  get descriptor(): Descriptor {
    return this._descriptor;
  }

  set descriptor(value: Descriptor) {
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
