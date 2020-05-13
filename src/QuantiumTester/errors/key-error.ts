export class KeyError extends Error {
  constructor() {
    super('No such key found in object!');
  }
}
