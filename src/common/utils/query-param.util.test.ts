import { getQueryParamValue, parseOptionalBooleanQueryParam } from "./query-param.util";

describe("getQueryParamValue", () => {
  it("returns the first value from query params", () => {
    expect(getQueryParamValue("value")).toBe("value");
    expect(getQueryParamValue(["first", "second"])).toBe("first");
    expect(getQueryParamValue(undefined)).toBeUndefined();
  });
});

describe("parseOptionalBooleanQueryParam", () => {
  it("parses valid boolean query params", () => {
    expect(parseOptionalBooleanQueryParam("true")).toBe(true);
    expect(parseOptionalBooleanQueryParam("false")).toBe(false);
  });

  it("returns undefined for missing or unsupported values", () => {
    expect(parseOptionalBooleanQueryParam(undefined)).toBeUndefined();
    expect(parseOptionalBooleanQueryParam("all")).toBeUndefined();
  });
});
