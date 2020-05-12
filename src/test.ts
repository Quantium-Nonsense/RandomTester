import { QRange } from './QuantiumTester/definitions/range';
import { StringDefinition } from './QuantiumTester/definitions/string-definition';
import { QuantiumTesting, StringDefinitionValue } from './QuantiumTester/QuantiumTester';

// Demo usage
const q = new QuantiumTesting();
q.setProperty('error', new StringDefinition(['String', 'Goes', 'Vroom'], null, true));
q.setProperty('status', new QRange(0, 100))

const b = q.generateObjects(1);
console.log(b);


const q = new QuantiumTesting();
q.setProperty('error', new StringDefinition([StringDefinitionValue.ALL], 15, true));
q.setProperty('status', new QRange(500, 600))

const b = q.generateObjects(1);
console.log(b);
