export interface IGenerator {
  generatedValue: string | number;
  generate(regenerateIfExists: boolean): string | number;
}
