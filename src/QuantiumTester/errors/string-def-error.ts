export class StringDefError extends Error{
  constructor() {
    super('Definitions cannot be empty. Please specify');
  }
}
