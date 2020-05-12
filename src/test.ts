import { StringDefinition } from './QuantiumTester/definitions/string-definition';
import { QuantiumTesting, StringDefinitionValue } from './QuantiumTester/QuantiumTester';
import { QRange } from './QuantiumTester/definitions/range';

const q = new QuantiumTesting();
q.setProperty('error', new StringDefinition(['String', 'Goes', 'Vroom'], 15, true));
q.setProperty('status', new QRange(0, 100))

const b = q.generateObject();
console.log(b);
