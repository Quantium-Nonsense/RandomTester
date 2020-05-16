export class VariableDescriptor {
  constructor(private _description: Descriptors) {
  }

  get description(): Descriptors {
    return this._description;
  }

  set description(value: Descriptors) {
    this._description = value;
  }
}

export enum Descriptors {
  BOOLEAN_BRANCH
}
