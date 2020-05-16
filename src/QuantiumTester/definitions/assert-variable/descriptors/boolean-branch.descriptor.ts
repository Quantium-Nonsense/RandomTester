import { Descriptor } from './descriptor';

export class BooleanBranchDescriptor extends Descriptor {
  constructor(
      private _ifEvaluatesToTrueExpect: () => string | boolean | number,
      private _ifEvaluatesToFalseExpect: () => string | boolean | number
  ) {
    super();
  }

  get ifEvaluatesToTrueExpect(): () => string | boolean | number {
    return this._ifEvaluatesToTrueExpect;
  }

  set ifEvaluatesToTrueExpect(value: () => string | boolean | number) {
    this._ifEvaluatesToTrueExpect = value;
  }

  get ifEvaluatesToFalseExpect(): () => string | boolean | number {
    return this._ifEvaluatesToFalseExpect;
  }

  set ifEvaluatesToFalseExpect(value: () => string | boolean | number) {
    this._ifEvaluatesToFalseExpect = value;
  }
}
