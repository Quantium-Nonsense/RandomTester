import { StringDefinition } from './QuantiumTester/definitions/generators/string-definition';
import { Stage } from './QuantiumTester/definitions/Stage';
import { QuantiumTesting, StringDefinitionValue } from './QuantiumTester/QuantiumTester';
import { TestValidatorActions } from './QuantiumTester/test-validator/test-validator';

const q = new QuantiumTesting();
q.setStaging(new Stage('bbb', () => {
  console.log('hello from 3');
}, null, 2))
q.setProperty('toastMessage', new StringDefinition([StringDefinitionValue.ALL], 50));
q.setStaging(new Stage('init', toastMessage => {
  console.log(toastMessage);
}, ['toastMessage']))
q.setStaging(new Stage('bb', () => {
  console.log('hello from 2');
}, null, 1))
q.expose('This is my bla bla message', 'blaMessage');
q.setValidationRules(TestValidatorActions.MATCH_EXACTLY);
q.assertExposed('blaMessage', 'toastMessage', true, 1);
