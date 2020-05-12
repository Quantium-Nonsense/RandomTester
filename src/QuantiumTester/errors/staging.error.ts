export class StagingError extends Error {
  constructor() {
    super('This stage has already been defined, if you want to override it please define override as true');
  }
}
