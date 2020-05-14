export class LoggerModel {
  constructor(
      public expected: any,
      public actual: any,
      public info: InfoModel
  ) {
  }
}

class InfoModel {
  constructor(
      public seed: number,
      public message: string
  ) {
  }
}
