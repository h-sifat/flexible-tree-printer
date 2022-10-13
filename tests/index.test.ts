import { printTree } from "../src/index";

describe("printTree", () => {
  it(`calls the printRootNode method if provided`, () => {
    const printRootNode = jest.fn();
    printTree({ printRootNode, parentNode: null });
    expect(printRootNode).toHaveBeenCalled();
  });
});
