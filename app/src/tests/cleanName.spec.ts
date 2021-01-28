import { cleanString } from '../helper/objectDownloader';
describe("Get name function", () => {

  //todo check archive two file same name
  test("Clean not alphanumeric character", () => {
    const input='This is^a$test;3'
    const output = 'This_is_a_test_3'
      expect(cleanString(input)).toBe(output)
    
  });
  test("Don\t terminate by '_' or ' '", () => { //tocheck unit test
    const input=['This_is_a_test_','This_is_a_test$']
    const output = 'This_is_a_test'
    input.forEach(el => expect(cleanString(el)).toBe(output))    
  });
  test("Don\t start by '_' or ' '", () => {
    const input=['_This_is_a_test','$This_is_a_test']
    const output = 'This_is_a_test'
    input.forEach(el => expect(cleanString(el)).toBe(output))    
  });
  test("No successive '_'", () => {
    const input=['This_$_is_a___test','$This$$is$*_a   test'    ]
    const output = 'This_is_a_test'
    input.forEach(el => expect(cleanString(el)).toBe(output))    
   });
});
