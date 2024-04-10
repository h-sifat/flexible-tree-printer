import { describe, it, expect, vi } from 'vitest';
import { printTree } from "../src/index";

describe("printTree", () => {
  it(`calls the printRootNode method if provided`, () => {
    const printRootNode = vi.fn();
    printTree({ printRootNode, parentNode: null });
    expect(printRootNode).toHaveBeenCalled();
  });
});
