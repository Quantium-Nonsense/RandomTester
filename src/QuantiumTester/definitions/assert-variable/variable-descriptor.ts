import { Descriptor } from './descriptors/descriptor';

export class VariableDescriptor {
  constructor(private _description: Descriptor) {
  }

  get description(): Descriptor {
    return this._description;
  }

  set description(value: Descriptor) {
    this._description = value;
  }
}

