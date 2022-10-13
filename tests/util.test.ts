import { is, validate, validatePrintTreeArgument } from "../src/util";

describe("validatePrintTreeArgument", () => {
  const validArg = Object.freeze({
    path: [],
    xLevel: 1,
    yLevel: 1,
    connectors: {},
    parentNode: null,
    forEach: () => {},
    maxLevel: Infinity,
    printNode: () => {},
    sortNodes: () => {},
    indentationLength: 4,
    getSubNodes: () => {},
    getNodePrefix: () => {},
    xLevelsOfLastNodeAncestors: [],
    shouldDescendIntoSubNode: () => true,
    printRootNode: () => console.log("."),
  });

  const invalidArgs = Object.freeze({
    path: 234, // not array
    xLevel: "324", // not number
    yLevel: [], // not number
    connectors: null, // not plain_object
    parentNode: 2234, // not object
    forEach: {}, // not function
    maxLevel: Symbol(), // not number
    printNode: 24_234, // not function
    sortNodes: false, // not function
    indentationLength: "4", // not number
    getSubNodes: [() => {}], // not function
    getNodePrefix: "duck", // not function
    xLevelsOfLastNodeAncestors: 324, /// not array
    shouldDescendIntoSubNode: "no, shut up!", // not function
    printRootNode: ".", // not function
  });

  {
    const errorCode = "INVALID_PROPERTY";
    for (const [property, invalidValue] of Object.entries(invalidArgs)) {
      const invalidPrintTreeArg = { ...validArg, [property]: invalidValue };

      it(`it throws ewc "${errorCode}" if property "${property}" is not valid`, () => {
        expect.assertions(1);
        try {
          validatePrintTreeArgument(invalidPrintTreeArg);
        } catch (ex: any) {
          expect(ex.code).toBe(errorCode);
        }
      });
    }
  }

  it.each([
    {
      arg: { ...validArg, indentationLength: -123.34 },
      case: "indentationLength is not a positive integer",
    },
    {
      arg: {
        ...validArg,
        indentationLength: 4,
        numOfHLinesBeforeNode: 2.32,
      },
      case: "numOfHLinesBeforeNode is not a positive integer",
    },
    {
      arg: { ...validArg, indentationLength: 1 },
      case: "indentationLength is less than 2",
    },
    {
      arg: { ...validArg, indentationLength: 4, numOfHLinesBeforeNode: 4 },
      case: "numOfHLinesBeforeNode is equal to indentationLength",
    },
    {
      arg: { ...validArg, indentationLength: 4, numOfHLinesBeforeNode: 5 },
      case: "numOfHLinesBeforeNode is greater than indentationLength",
    },
  ])(`throws error if $case`, ({ arg }) => {
    expect.assertions(1);
    try {
      validatePrintTreeArgument(arg);
    } catch (ex) {
      expect(1).toBe(1);
    }
  });
});

describe("is", () => {
  it.each([
    {
      type: "undefined",
      valid: [undefined],
      invalid: [1, "", false],
    },
    {
      type: "number",
      valid: [1, 2.3, -2, NaN, Infinity],
      invalid: ["", false, {}],
    },
    {
      type: "boolean",
      valid: [false, true],
      invalid: ["", {}, 1],
    },
    {
      type: "string",
      valid: ["", "hi"],
      invalid: [2, {}, [], false],
    },
    {
      type: "object",
      valid: [{}, null],
      invalid: [Symbol(), 1, ""],
    },
    {
      type: "function",
      valid: [() => {}, String],
      invalid: [1, {}],
    },
    {
      type: "symbol",
      valid: [Symbol()],
      invalid: [1, {}],
    },
    {
      type: "array",
      valid: [[], [1, 3]],
      invalid: [1, {}],
    },
    {
      type: "plain_object",
      valid: [{}],
      invalid: [null, []],
    },
  ] as const)(
    `is("$type", value) works correctly`,
    ({ type, valid, invalid }) => {
      for (const value of valid) expect(is(type, value)).toBeTruthy();
      for (const value of invalid) expect(is(type, value)).toBeFalsy();
    }
  );

  it(`throws error the type is not valid`, () => {
    expect(() => {
      // @ts-expect-error
      is("hello_world", "hi");
    }).toThrowError();
  });
});

describe("validate", () => {
  const schema = Object.freeze({
    age: "number",
    name: "string",
    phone: { type: "string", isOptional: true },
  } as const);

  const validObject = Object.freeze({
    age: 41,
    name: "Karen",
  });

  const otherValidatorArg = Object.freeze({
    schema,
    name: "user",
  });

  it.each([
    {
      object: null,
      case: "object is not a plain object",
      errorCode: "NOT_PLAIN_OBJECT",
    },
    {
      object: [],
      case: "object is not a plain object",
      errorCode: "NOT_PLAIN_OBJECT",
    },
    {
      object: { ...validObject, name: 1421 },
      case: "any property is invalid",
      errorCode: "INVALID_PROPERTY",
    },
    {
      object: { ...validObject, duck: 1421 },
      case: "object contains unknown properties",
      errorCode: "UNKNOWN_PROPERTY",
    },
    {
      object: { ...validObject, phone: 1421 },
      case: "optional property is invalid",
      errorCode: "INVALID_PROPERTY",
    },
  ])(`it throws error if $case`, ({ object, errorCode }) => {
    expect.assertions(1);
    try {
      validate(object, otherValidatorArg);
    } catch (ex) {
      // @ts-ignore
      expect(ex.code).toBe(errorCode);
    }
  });
});
