export interface IGenerator {
  generatedValue: string | number | boolean;
  generate(regenerateIfExists: boolean): string | number | boolean;
}
