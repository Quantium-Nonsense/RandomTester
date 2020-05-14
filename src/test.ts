import { StringDefinition } from './QuantiumTester/definitions/generators/string-definition';
import { Stage } from './QuantiumTester/definitions/Stage';
import { QuantiumTesting, StringDefinitionValue } from './QuantiumTester/QuantiumTester';
import { TestValidatorActions } from './QuantiumTester/test-validator/test-validator';

const demo1 = () => {
  const q = new QuantiumTesting();
  q.setStaging(new Stage('bbb', () => {
    console.log('hello from 3');
  }, null, 2));
  q.setProperty('toastMessage', new StringDefinition([StringDefinitionValue.ALL], 50));
  q.setStaging(new Stage('init', toastMessage => {
    console.log(toastMessage);
  }, ['toastMessage']));
  q.setStaging(new Stage('bb', () => {
    console.log('hello from 2');
  }, null, 1));
  q.expose('This is my bla bla message', 'blaMessage');
  q.setValidationRules(TestValidatorActions.MATCH_EXACTLY);
  q.assertExposed('blaMessage', 'toastMessage', true, 1);
};

type GetConstructorArgs<T> = T extends new (...args: infer U) => any ? U : never

const inferDemo = () => {
  // This test will fail
  // eslint-disable-next-line @typescript-eslint/class-name-casing
  class a {
    constructor(public a1: string = '', public b: string ='', public c: number = 1 , public e: number = null, private d: number = 0) {
    }
  }
  const q = new QuantiumTesting(1, true);
  q.inferAndCreateInner(new a(), 'alpha');
  q.setStaging(new Stage('myStage', (witAlpha) => {
    console.log(witAlpha.a1)
  }, ['alpha']))
  q.expose('myExposedVal', 'myExposedValName');
  q.assertExposed('myExposedValName', 'alpha.a1', true, 1);
  console.log(q.getInnerAsValue('alpha', false))
  console.log(q.failedAssertions);
};

inferDemo();
