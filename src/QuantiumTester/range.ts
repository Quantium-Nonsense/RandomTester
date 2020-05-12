export class Range {
  private _from: number;
  private _to: number;

  constructor(from: number, to: number) {
    if (from > to) {
      throw new RangeError();
    }
  }

  get from(): number {
    return this._from;
  }

  get to(): number {
    return this._to;
  }
}
