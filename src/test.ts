import { QRange } from './QuantiumTester/definitions/generators/range';
import { Stage } from './QuantiumTester/definitions/Stage';
import { StringDefinition } from './QuantiumTester/definitions/generators/string-definition';
import { QuantiumTesting, StringDefinitionValue } from './QuantiumTester/QuantiumTester';

const simpleDemo = (): void => {
  // Demo usage
  const q = new QuantiumTesting();
  q.setProperty('error', new StringDefinition(['String', 'Goes', 'Vroom'], null, true));
  q.setProperty('status', new QRange(0, 100));

  const b = q.generateObjects(1);
  console.log(b);


  const qu = new QuantiumTesting();
  qu.setProperty('error', new StringDefinition([StringDefinitionValue.ALL], 15, true));
  qu.setProperty('status', new QRange(500, 600));

  const c = q.generateObjects(1);
  console.log(c);

// Staging demo

  const q1 = new QuantiumTesting();
  q1.setProperty('error', new StringDefinition([StringDefinitionValue.ALL], 15, true));
  q1.setProperty('status', new QRange(500, 600));

  q1.setStaging(new Stage('Stage 1', () => console.log('Hello from stage1 !')));
  q1.setStaging(new Stage('Stage 2', () => console.log('Hello from stage2 !'), 1));

  const c1 = q1.generateObjects(1); // Generate random object
// or just run the tests
  q1.runStaging();
  console.log(c1);
};
const advanceDemo = (): void => {
  const q = new QuantiumTesting();
  q.setProperty('logValue', new StringDefinition([
    StringDefinitionValue.LOWER_LETTERS,
    StringDefinitionValue.NUMERIC
  ], 35));
  q.setProperty('errorVal', new StringDefinition([
    StringDefinitionValue.UPPER_CASE_LETTERS,
    StringDefinitionValue.SPECIAL_CHARS
  ], 35));

  const f = (v, c): void => {
    console.log(`Hello from ${ v } and ${ c }!`);
  };
  q.setStaging(new Stage('Stage 1', (value1, value2) => f(value1, value2)));
  q.runStage('Stage 1', false, ['logValue', 'errorVal']);
};

// noinspection DuplicatedCode
const testDemo = (): void => {
  const q = new QuantiumTesting();
  q.setProperty('logValue', new StringDefinition([
    StringDefinitionValue.LOWER_LETTERS,
    StringDefinitionValue.NUMERIC
  ], 35));
  q.setProperty('errorVal', new StringDefinition([
    StringDefinitionValue.UPPER_CASE_LETTERS,
    StringDefinitionValue.SPECIAL_CHARS
  ], 35));

  const f = (v, c): void => {
    console.log(`Hello from ${ v } and ${ c }!`);
  };
  q.setStaging(new Stage('Stage 1', (value1, value2) => f(value1, value2)));
  q.runStage('Stage 1', false, ['logValue', 'errorVal']);
  q.assert();
};

simpleDemo();
advanceDemo();
