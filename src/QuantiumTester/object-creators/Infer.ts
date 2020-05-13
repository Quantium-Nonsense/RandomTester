import { QRange, StringDefinition, StringDefinitionValue } from '../..';

export class Infer {
  public static object(objToInfer, verbose = false) {
    const objToReturn = {};
    Object.keys(objToInfer).forEach(key => {
      if (objToInfer.hasOwnProperty(key)) {
        switch (typeof objToInfer[key]) {
          case 'string':
            objToReturn[key] = new StringDefinition([StringDefinitionValue.ALL], {from: 1, to: 500});
            break;
          case 'number':
            objToReturn[key] = new QRange(0, 5000, true, true);
            break;
          default:
            if (verbose) {
              console.warn(`Null value ${ key } found, setting as string generator...`);
            }
            objToReturn[key] = new StringDefinition([StringDefinitionValue.ALL], {from: 1, to: 500});
        }
      }
    });

    return objToReturn;
  }
}
