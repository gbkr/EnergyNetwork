import { isValidURL } from "../utils";

describe(`isValidURL`, () => {
  it("returns false for an invalid URL", () => {
    expect(isValidURL("example.com")).toBe(false);
  });

  it("returns true for a valid URL", () => {
    expect(isValidURL("http://example.com")).toBe(true);
  });
});
