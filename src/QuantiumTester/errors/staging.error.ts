export class StagingError extends Error {
  constructor(stageError: StageError) {
    switch (stageError) {
      case StageError.STAGE_EXISTS:
        super('This stage has already been defined, if you want to override it please define override as true');
        return;
      case StageError.STAGE_NOT_FOUND:
        super('Stage was not found! Please make sure this stage exists');
        return;
      default:
        super('Undefined Stage Error occurred');
    }
  }
}

export enum StageError {
  STAGE_NOT_FOUND,
  STAGE_EXISTS
}
