export class RangeError extends Error{
  constructor() {
    super('Range Error: from cannot be greater than to');
  }
}
