import { QRange } from './range';
import { StringDefinition } from './string-definition';

export class GeneratorUtils {
  /**
   * If passed key represents a generator object this function will return a plain object
   * Otherwise it will return the plain value
   * @param innerName The name of the property
   * @param regenerate To regenerate the property if already created
   * @param innerObject The actual object
   */
  public static getGeneratorAsValue(innerName: string, regenerate: boolean, innerObject: any) {
    // Check if dot notation object
    if (innerName.includes('.')) {
      // split into object and accessor
      const notations = innerName.split('.');
      if (notations.length > 2) {
        throw new Error('Cannot go deeper than first level objects!');
      }
      const generatedObject = this.generateObject(notations[0], regenerate, innerObject);
      return generatedObject[notations[1]];
    }

    // If is generator return
    if (innerObject[innerName].hasOwnProperty('generate')) {
      return innerObject[innerName].generate(regenerate);
    }

    // If not generator it means its a generator object
    // Then we need to turn the generator object into a plain object
    return this.generateObject(innerName, regenerate, innerObject);
  }

  /**
   * Turn a generator object into a plain object
   * @param innerObjName
   * @param regenerate If obj should re generate value if exists
   * @param innerObject the object to generate from
   */
  private static generateObject<T>(innerObjName: string, regenerate = false, innerObject): T {
    const obj = {};
    Object.keys(innerObject[innerObjName]).forEach(key => {
      if (innerObject[innerObjName][key] instanceof StringDefinition) {
        const sDef: StringDefinition = (innerObject[innerObjName][key] as StringDefinition);
        obj[key] = sDef.generate(regenerate);
      }
      if (innerObject[innerObjName][key] instanceof QRange) {
        const qRange: QRange = (innerObject[innerObjName][key] as QRange);
        obj[key] = qRange.generate(regenerate);
      }
    });

    return obj as T;
  }

}
