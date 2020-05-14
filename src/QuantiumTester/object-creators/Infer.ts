import { QRange, StringDefinition, StringDefinitionValue } from '../..';
import { Seedable } from '../definitions/seedable';

export class Infer {
  public static object(objToInfer, verbose = false, chance) {
    const objToReturn = {};
    Object.keys(objToInfer).forEach(key => {
      if (objToInfer.hasOwnProperty(key)) {
        switch (typeof objToInfer[key]) {
          case 'string':
            objToReturn[key] = new StringDefinition([StringDefinitionValue.ALL], {from: 1, to: 500});
            (objToReturn[key] as StringDefinition).chance = chance;
            break;
          case 'number':
            objToReturn[key] = new QRange(0, 5000, true, true);
            (objToReturn[key] as QRange).chance = chance;
            break;
          default:
            if (verbose) {
              console.warn(`Null value ${ key } found, setting as string generator...`);
            }
            objToReturn[key] = new StringDefinition([StringDefinitionValue.ALL], {from: 1, to: 500});
            (objToReturn[key] as StringDefinition).chance = chance;
        }
      }
    });

    return objToReturn;
  }
}
